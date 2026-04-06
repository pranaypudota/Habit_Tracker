from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AuthStatus(BaseModel):
    """Current application lock/setup status."""
    is_configured: bool
    is_locked: bool
    locked_until: datetime | None = None


class PinSetup(BaseModel):
    """Initial user PIN configuration."""
    pin: str = Field(min_length=4, max_length=8, pattern="^[0-9]+$")


class PinSetupResponse(BaseModel):
    """Created status + plaintext recovery key for one-time display."""
    status: str = "success"
    recovery_key: str


class PinLogin(BaseModel):
    """PIN entry schema."""
    pin: str


class PinChange(BaseModel):
    """PIN update schema."""
    current_pin: str
    new_pin: str = Field(min_length=4, max_length=8, pattern="^[0-9]+$")


class RecoverPin(BaseModel):
    """PIN recovery via key schema."""
    recovery_key: str
    new_pin: str = Field(min_length=4, max_length=8, pattern="^[0-9]+$")


class TokenResponse(BaseModel):
    """Bearer token issued on successful auth."""
    access_token: str
    token_type: str = "bearer"
