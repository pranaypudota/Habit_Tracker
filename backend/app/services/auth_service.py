import secrets
import string
import bcrypt
from datetime import datetime, timedelta
from typing import Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.auth import AuthConfig


class AuthService:
    """
    Handles local-first authentication logic: PIN hashing, 
    key generation, and lockout management.
    """

    MAX_ATTEMPTS = 5
    LOCKOUT_DURATION_MINS = 1

    @staticmethod
    def generate_recovery_key(length: int = 16) -> str:
        """
        Generate a random alphanumeric recovery key: KFXN-8R2M-PQTV-4WHL
        """
        alphabet = string.ascii_uppercase + string.digits
        key = "".join(secrets.choice(alphabet) for _ in range(length))
        # Format for readability
        return "-".join(key[i:i+4] for i in range(0, length, 4))

    @staticmethod
    def hash_text(text: str) -> str:
        """Hash plain text with bcrypt (12 rounds)."""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(text.encode(), salt).decode()

    @staticmethod
    def verify_hash(plain: str, hashed: str) -> bool:
        """Verify plain text against bcrypt hash."""
        return bcrypt.checkpw(plain.encode(), hashed.encode())

    async def get_config(self, db: AsyncSession) -> AuthConfig | None:
        """Fetch the single auth config row (ID=1)."""
        result = await db.execute(select(AuthConfig).where(AuthConfig.id == 1))
        return result.scalar_one_or_none()

    async def increment_fail(self, db: AsyncSession) -> None:
        """Atomically increment failed attempts and set lockout if threshold reached."""
        config = await self.get_config(db)
        if not config:
            return

        new_attempts = config.failed_attempts + 1
        lock_until = None
        
        if new_attempts >= self.MAX_ATTEMPTS:
            lock_until = datetime.utcnow() + timedelta(minutes=self.LOCKOUT_DURATION_MINS)
            logger.warning(f"Auth lockout triggered until {lock_until} after {new_attempts} fails.")

        await db.execute(
            update(AuthConfig)
            .where(AuthConfig.id == 1)
            .values(
                failed_attempts=new_attempts,
                locked_until=lock_until
            )
        )

    async def reset_fail(self, db: AsyncSession) -> None:
        """Reset counters on successful login."""
        await db.execute(
            update(AuthConfig)
            .where(AuthConfig.id == 1)
            .values(
                failed_attempts=0,
                locked_until=None
            )
        )

    async def setup_auth(self, db: AsyncSession, pin: str) -> str:
        """
        Initial PIN setup. Fails if already configured.
        Returns the plaintext recovery key once.
        """
        existing = await self.get_config(db)
        if existing:
            raise ValueError("Auth already configured")

        recovery_key = self.generate_recovery_key()
        
        new_config = AuthConfig(
            id=1,
            pin_hash=self.hash_text(pin),
            recovery_key_hash=self.hash_text(recovery_key)
        )
        
        db.add(new_config)
        await db.flush()
        return recovery_key

    async def is_locked(self, db: AsyncSession) -> bool:
        """Check if currently in lockout duration."""
        config = await self.get_config(db)
        if not config or not config.locked_until:
            return False
        
        locked = datetime.utcnow() < config.locked_until
        if not locked and config.failed_attempts >= self.MAX_ATTEMPTS:
            # Lock expired but counter still at limit, reset
            await self.reset_fail(db)
            return False
            
        return locked
