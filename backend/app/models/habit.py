import uuid
from datetime import date, datetime
from sqlalchemy import String, Boolean, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="General")
    # Replaces the old `frequency` field — more explicit naming
    period: Mapped[str] = mapped_column(String(20), nullable=False, default="daily")
    target_per_period: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    tracking_model: Mapped[str] = mapped_column(String(20), nullable=False, default="streak")
    archived: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    entries: Mapped[list["HabitEntry"]] = relationship(
        "HabitEntry", back_populates="habit", cascade="all, delete-orphan"
    )


class HabitEntry(Base):
    """
    Presence of a row = habit completed on that date.
    The old `completed` boolean field has been removed —
    existence of the record is the completion signal.
    """
    __tablename__ = "habit_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id: Mapped[str] = mapped_column(
        String, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)

    habit: Mapped["Habit"] = relationship("Habit", back_populates="entries")
