from datetime import date
from calendar import monthrange
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.habit import (
    HabitCreate, HabitResponse, HabitUpdate,
    HabitCompleteRequest, HabitCompleteResponse, HabitEntryResponse,
)
from app.repositories.habit_repository import HabitRepository
from app.services.habit_service import invalidate_caches, detect_over_achievement

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
    habit = await repo.create(
        name=payload.name,
        category=payload.category,
        period=payload.period,
        target_per_period=payload.target_per_period,
        target_completions_per_day=payload.target_completions_per_day,
        tracking_model=payload.tracking_model,
        goal_type=payload.goal_type,
        count_mode=payload.count_mode,
    )
    invalidate_caches()
    return habit


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    payload: HabitUpdate,
    repo: HabitRepository = Depends(_repo),
):
    habit = await repo.update(habit_id, **payload.model_dump(exclude_unset=True))
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    invalidate_caches()
    return habit


@router.post("/{habit_id}/suggestions/{suggestion_type}/accept")
async def accept_suggestion(
    habit_id: str,
    suggestion_type: str,
    new_target: int = Query(..., ge=1, le=100, description="Suggested new target value"),
    repo: HabitRepository = Depends(_repo),
):
    """Accept a goal bump suggestion and apply the new target."""
    habit = await repo.update(habit_id, target_per_period=new_target)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    invalidate_caches()
    return {"status": "accepted", "new_target": new_target, "habit_id": habit_id}


@router.post("/{habit_id}/suggestions/{suggestion_type}/dismiss")
async def dismiss_suggestion(
    habit_id: str,
    suggestion_type: str,
):
    """Dismiss a suggestion. Clears cache so it may reappear if conditions persist."""
    invalidate_caches()
    return {"status": "dismissed", "habit_id": habit_id}


@router.delete("/{habit_id}", status_code=204)
async def delete_habit(
    habit_id: str,
    repo: HabitRepository = Depends(_repo),
):
    deleted = await repo.delete(habit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Habit not found")
    invalidate_caches()


@router.post("/{habit_id}/complete", response_model=HabitCompleteResponse, status_code=201)
async def complete_habit(
    habit_id: str,
    payload: HabitCompleteRequest,
    repo: HabitRepository = Depends(_repo),
):
    """Mark a habit as completed on a given date. Idempotent. Detects over-achievement."""
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    is_over, warning = await detect_over_achievement(habit, payload.date, repo)
    entry = await repo.create_entry(habit_id, payload.date, is_over_achievement=is_over)
    invalidate_caches()
    return HabitCompleteResponse(
        id=entry.id,
        habit_id=entry.habit_id,
        date=entry.date,
        is_over_achievement=is_over,
        over_achievement_warning=warning,
    )


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
             deprecated=True)
async def mark_completion_legacy(
    habit_id: str,
    payload: HabitCompleteRequest,
    repo: HabitRepository = Depends(_repo),
):
    """
    Deprecated: Use `POST /habits/{habit_id}/complete` instead.
    
    This endpoint is kept for temporary backward compatibility with older
    frontend builds but will be removed in a future release.
    """
    habit = await repo.get_by_id(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return await repo.create_entry(habit_id, payload.date)
