"""
Dashboard aggregation endpoint.

GET /dashboard/today
Returns all data needed to render the dashboard in a single request.
"""
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.habit_repository import HabitRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services import habit_service
from app.schemas.habit import HabitResponse
from app.schemas.expense import ExpenseResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/today")
async def dashboard_today(db: AsyncSession = Depends(get_db)):
    """
    Aggregated dashboard data — single request for the frontend dashboard page.

    Returns:
     - habits: all active habits
     - completed_today: habit IDs completed today
     - streaks: dict of habit_id -> streak count
     - recent_expenses: 5 most recent expenses
     - monthly_expense_total: total spending in current month
    """
    habit_repo = HabitRepository(db)
    expense_repo = ExpenseRepository(db)

    today = date.today()

    # Habits
    habits = await habit_repo.get_all()
    habit_ids = [h.id for h in habits]

    # Entries for all habits (batch)
    entries_by_habit = await habit_repo.get_entries_for_all_habits(habit_ids)

    # Which habits are completed today
    completed_today = [
        hid for hid, entries in entries_by_habit.items()
        if any(e.date == today for e in entries)
    ]

    # Streaks and Habit Strengths
    streaks = {}
    habit_strengths = {}

    for h in habits:
        entries = entries_by_habit.get(h.id, [])
        if h.tracking_model == "streak":
            streaks[h.id] = habit_service.compute_streak(entries)
        else:
            habit_strengths[h.id] = {
                "monthly": habit_service.calculate_decay_score(entries, window_type="month"),
                "rolling": habit_service.calculate_decay_score(entries, window_type="rolling")
            }

    # Recent expenses and monthly total
    recent_expenses = await expense_repo.get_recent(limit=5)
    monthly_total = await expense_repo.get_monthly_total_single(
        year=today.year, month=today.month
    )

    return {
        "habits": [HabitResponse.model_validate(h) for h in habits],
        "completed_today": completed_today,
        "streaks": streaks,
        "habit_strengths": habit_strengths,
        "recent_expenses": [ExpenseResponse.model_validate(e) for e in recent_expenses],
        "monthly_expense_total": monthly_total,
    }
