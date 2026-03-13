from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.habit import (
    HabitCreate, HabitResponse,
    HabitCompleteRequest, HabitEntryResponse,
)
from app.repositories.habit_repository import HabitRepository

router = APIRouter(prefix="/habits", tags=["Habits"])


def _repo(db: AsyncSession = Depends(get_db)) -> HabitRepository:
    return HabitRepository(db)


@router.get("/", response_model=list[HabitResponse])
async def list_habits(
    include_archived: bool = Query(default=False),
    repo: HabitRepository = Depends(_repo),
):
    return await repo.get_all(include_archived=include_archived)


@router.post("/", response_model=HabitResponse, status_code=201)
async def create_habit(
    payload: HabitCreate,
    repo: HabitRepository = Depends(_repo),
):
    return await repo.create(
        name=payload.name,
        category=payload.category,
        period=payload.period,
        target_per_period=payload.target_per_period,
        target_completions_per_day=payload.target_completions_per_day,
        tracking_model=payload.tracking_model,
    )


@router.delete("/{habit_id}", status_code=204)
async def delete_habit(
    habit_id: str,
    repo: HabitRepository = Depends(_repo),
):
    deleted = await repo.delete(habit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Habit not found")


@router.post("/{habit_id}/complete", response_model=HabitEntryResponse, status_code=201)
async def complete_habit(
    habit_id: str,
    payload: HabitCompleteRequest,
    repo: HabitRepository = Depends(_repo),
):
    """Mark a habit as completed on a given date.

    Idempotent — calling twice for the same date returns the same entry.
    """
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return await repo.create_entry(habit_id, payload.date)


@router.delete("/{habit_id}/complete", status_code=204)
async def undo_completion(
    habit_id: str,
    entry_date: date = Query(..., description="Date to un-complete (YYYY-MM-DD)"),
    repo: HabitRepository = Depends(_repo),
):
    """Undo a habit completion for a specific date."""
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    await repo.delete_entry(habit_id, entry_date)


@router.get("/{habit_id}/entries", response_model=list[HabitEntryResponse])
async def habit_history(
    habit_id: str,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    repo: HabitRepository = Depends(_repo),
):
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return await repo.get_entries(habit_id, start_date, end_date)


# ─── Backward-compat alias ────────────────────────────────────────────────────
@router.post("/{habit_id}/entries", response_model=HabitEntryResponse, status_code=201,
             include_in_schema=False)
async def mark_completion_legacy(
    habit_id: str,
    payload: HabitCompleteRequest,
    repo: HabitRepository = Depends(_repo),
):
    """Deprecated: use POST /habits/{id}/complete instead."""
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return await repo.create_entry(habit_id, payload.date)
