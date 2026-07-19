from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─── Habit Schemas ────────────────────────────────────────────────────────────

class HabitBase(BaseModel):
    name: str
    category: str = "General"
    period: str = "daily"
    target_per_period: int = 1
    target_completions_per_day: int = 1
    tracking_model: str = "streak"
    goal_type: str = "streak"
    count_mode: str = ""


# ponytail: Empty class removed, use HabitBase directly
HabitCreate = HabitBase


class HabitUpdate(BaseModel):
    """Fields that can be updated after creation."""
    goal_type: Optional[str] = None
    count_mode: Optional[str] = None
    target_per_period: Optional[int] = None
    target_completions_per_day: Optional[int] = None
    tracking_model: Optional[str] = None
    period: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    archived: Optional[bool] = None


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


class HabitCompleteResponse(HabitEntryResponse):
    is_over_achievement: bool = False
    over_achievement_warning: Optional[str] = None
