"""
Data export endpoint.

GET /export
Returns all data as JSON for backup / migration purposes.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.habit_repository import HabitRepository
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.habit import HabitResponse, HabitEntryResponse
from app.schemas.expense import ExpenseResponse

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/")
async def export_all(db: AsyncSession = Depends(get_db)):
    """Export all habits, habit entries, and expenses as JSON.

    Use this to back up or migrate your local data.
    """
    habit_repo = HabitRepository(db)
    expense_repo = ExpenseRepository(db)

    habits = await habit_repo.get_all(include_archived=True)
    habit_ids = [h.id for h in habits]
    entries_by_habit = await habit_repo.get_entries_for_all_habits(habit_ids)

    all_entries = [e for entries in entries_by_habit.values() for e in entries]
    expenses = await expense_repo.get_all()

    return {
        "habits": [HabitResponse.model_validate(h).model_dump() for h in habits],
        "habit_entries": [HabitEntryResponse.model_validate(e).model_dump() for e in all_entries],
        "expenses": [ExpenseResponse.model_validate(e).model_dump() for e in expenses],
    }
