from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.db.database import get_db
from app.schemas.auth import (
    AuthStatus, PinSetup, PinSetupResponse, PinLogin, 
    PinChange, RecoverPin, TokenResponse
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token, get_current_user
from app.models.auth import AuthConfig

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/status", response_model=AuthStatus)
async def get_auth_status(db: AsyncSession = Depends(get_db)):
    """Check configuration and lockout state."""
    service = AuthService()
    config = await service.get_config(db)
    
    if not config:
        return AuthStatus(is_configured=False, is_locked=False)
        
    locked = await service.is_locked(db)
    return AuthStatus(
        is_configured=True,
        is_locked=locked,
        locked_until=config.locked_until if locked else None
    )


@router.post("/setup", response_model=PinSetupResponse)
async def setup_auth_pin(data: PinSetup, db: AsyncSession = Depends(get_db)):
    """First-time setup. Generates and returns recovery key."""
    service = AuthService()
    try:
        recovery_key = await service.setup_auth(db, data.pin)
        logger.opt(colors=True).info("<green>First-time PIN setup complete.</green>")
        return PinSetupResponse(recovery_key=recovery_key)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login_via_pin(data: PinLogin, db: AsyncSession = Depends(get_db)):
    """Verify PIN and issue 24-hr token."""
    service = AuthService()
    config = await service.get_config(db)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auth not configured. Please call /setup first."
        )
        
    # 1. Check lockout
    if await service.is_locked(db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Brute force protection active. Locked until: {config.locked_until}"
        )
        
    # 2. Verify PIN
    if service.verify_hash(data.pin, config.pin_hash):
        # 3. Success Reset fails and issue token
        await service.reset_fail(db)
        token = create_access_token({"sub": "local-user"})
        return TokenResponse(access_token=token)
        
    # 4. Fail increment counter
    await service.increment_fail(db)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect PIN."
    )


@router.post("/change-pin", response_model=TokenResponse)
async def change_auth_pin(
    data: PinChange, 
    authorized: bool = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update existing PIN. Requires valid session + current PIN verification."""
    service = AuthService()
    config = await service.get_config(db)
    
    if not service.verify_hash(data.current_pin, config.pin_hash):
        await service.increment_fail(db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current PIN."
        )
        
    # Hash new PIN
    new_hash = service.hash_text(data.new_pin)
    await db.execute(
        update(AuthConfig)
        .where(AuthConfig.id == 1)
        .values(pin_hash=new_hash, failed_attempts=0)
    )
    
    # Issue a fresh token
    token = create_access_token({"sub": "local-user"})
    logger.info("PIN changed successfully.")
    return TokenResponse(access_token=token)


@router.post("/recover", response_model=TokenResponse)
async def recover_auth_pin(data: RecoverPin, db: AsyncSession = Depends(get_db)):
    """Emergency reset using Recovery Key."""
    service = AuthService()
    config = await service.get_config(db)
    
    if not config:
         raise HTTPException(status_code=400, detail="Not configured.")

    if not service.verify_hash(data.recovery_key, config.recovery_key_hash):
        await service.increment_fail(db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid recovery key."
        )
        
    # Emergency bypass. Set new PIN
    new_hash = service.hash_text(data.new_pin)
    await db.execute(
        update(AuthConfig)
        .where(AuthConfig.id == 1)
        .values(pin_hash=new_hash, failed_attempts=0, locked_until=None)
    )
    
    token = create_access_token({"sub": "local-user"})
    logger.warning("PIN recovered via emergency key.")
    return TokenResponse(access_token=token)
