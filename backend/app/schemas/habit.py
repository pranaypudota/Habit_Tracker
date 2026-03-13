from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─── Habit Schemas ────────────────────────────────────────────────────────────

class HabitBase(BaseModel):
    name: str
    category: str = "General"
    period: str = "daily"
    target_per_period: int = 1
    tracking_model: str = "streak"


class HabitCreate(HabitBase):
    pass


class HabitResponse(HabitBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    archived: bool
    created_at: datetime


# ─── HabitEntry Schemas ───────────────────────────────────────────────────────

class HabitCompleteRequest(BaseModel):
    """Request body for POST /habits/{id}/complete"""
    date: date


class HabitEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    habit_id: str
    date: date
