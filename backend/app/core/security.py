import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.db.database import get_db
from app.services.auth_service import AuthService
from app.core.config import settings

# ── Configuration ───────────────────────────────────────────────────────────

ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

# ── JWT Functions ──────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """Issue time-limited JWT with HS256."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    """Verify and decode JWT."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# ── FastAPI Dependencies ───────────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> bool:
    """
    Antigravity's Authentication Guard:
    1. Check if PIN setup is skip-mode (no AuthConfig row).
    2. If setup, require valid JWT.
    """
    auth_service = AuthService()
    config = await auth_service.get_config(db)
    
    # Graceful first-run: if no PIN configured, skip auth
    if not config:
        return True

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please enter PIN.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In single-user app, we don't need to look up a user model.
    # Presence of valid token signed with our secret is proof of identity.
    return True
