from datetime import datetime
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AuthConfig(Base):
    """
    Single-row configuration table for local-first PIN authentication.
    id is always 1.
    """
    __tablename__ = "auth_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pin_hash: Mapped[str] = mapped_column(String, nullable=False)
    recovery_key_hash: Mapped[str] = mapped_column(String, nullable=False)
    failed_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
