"""
Dashboard aggregation endpoint.

GET /dashboard/today
Returns all data needed to render the dashboard in a single request.
"""
import asyncio
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
    Parallelizes I/O across habit and expense tables.
    """
    habit_repo = HabitRepository(db)
    expense_repo = ExpenseRepository(db)
    today = date.today()

    # 1. Start I/O in parallel: fetch all habits and expense totals
    # We fetch habits first to get their IDs. We'll parallelize others later.
    habits = await habit_repo.get_all()
    if not habits:
        # Expenses can still be fetched
        recent_expenses, monthly_total = await asyncio.gather(
            expense_repo.get_recent(limit=5),
            expense_repo.get_monthly_total_single(year=today.year, month=today.month)
        )
        return {
            "habits": [],
            "completed_today": [],
            "streaks": {},
            "habit_strengths": {},
            "recent_expenses": [ExpenseResponse.model_validate(e) for e in recent_expenses],
            "monthly_expense_total": monthly_total,
        }

    habit_ids = [h.id for h in habits]

    # 2. Parallelize: batch-fetch habit entries AND expenses concurrently
    entries_task = habit_repo.get_entries_for_all_habits(habit_ids)
    expenses_task = expense_repo.get_recent(limit=5)
    monthly_total_task = expense_repo.get_monthly_total_single(year=today.year, month=today.month)

    entries_by_habit, recent_expenses, monthly_total = await asyncio.gather(
        entries_task, expenses_task, monthly_total_task
    )

    # Which habits are completed today
    completed_today = [
        hid for hid, entries in entries_by_habit.items()
        if any(e.date == today for e in entries)
    ]

    # Streaks, Habit Strengths, and Heatmaps (All in ONE trip!)
    streaks = {}
    habit_strengths = {}
    heatmaps = {}

    for h in habits:
        entries = entries_by_habit.get(h.id, [])
        
        # 1. Streaks or Strength
        if h.tracking_model == "streak":
            streaks[h.id] = habit_service.compute_streak(entries)
        else:
            habit_strengths[h.id] = {
                "monthly": habit_service.calculate_decay_score(entries, window_type="month"),
                "rolling": habit_service.calculate_decay_score(entries, window_type="rolling")
            }
        
        # 2. Heatmaps (Required for rendering without re-fetching)
        # We format as a simple dict for O(1) frontend access
        levels = habit_service.calculate_streak_levels(entries, h.target_completions_per_day, window_days=90)
        heatmaps[h.id] = {item["date"]: item["level"] for item in levels}

    # 10. Entries for Today (to prevent individual re-fetching)
    entries_today = {}
    for hid, entries in entries_by_habit.items():
        day_entries = [e for e in entries if e.date == today]
        entries_today[hid] = [{"id": str(e.id), "habit_id": str(e.habit_id), "date": str(e.date)} for e in day_entries]

    return {
        "habits": [HabitResponse.model_validate(h) for h in habits],
        "completed_today": completed_today,
        "entries_today": entries_today,
        "streaks": streaks,
        "habit_strengths": habit_strengths,
        "heatmaps": heatmaps,
        "recent_expenses": [ExpenseResponse.model_validate(e) for e in recent_expenses],
        "monthly_expense_total": monthly_total,
    }
