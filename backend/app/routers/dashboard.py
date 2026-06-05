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
from app.repositories.subscription_repository import SubscriptionRepository
from app.services import habit_service
from app.schemas.habit import HabitResponse
from app.schemas.expense import ExpenseResponse
from app.schemas.subscription import SubscriptionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _sub_total(subs) -> float:
    return sum(float(s.amount) for s in subs)


@router.get("/today")
async def dashboard_today(db: AsyncSession = Depends(get_db)):
    habit_repo = HabitRepository(db)
    expense_repo = ExpenseRepository(db)
    sub_repo = SubscriptionRepository(db)
    today = date.today()

    habits = await habit_repo.get_all()
    if not habits:
        recent_expenses, monthly_total, active_subs = await asyncio.gather(
            expense_repo.get_recent(limit=5),
            expense_repo.get_monthly_total_single(year=today.year, month=today.month),
            sub_repo.get_all_active(year=today.year, month=today.month),
        )
        burn = _sub_total(active_subs)
        return {
            "habits": [],
            "completed_today": [],
            "entries_today": {},
            "streaks": {},
            "habit_strengths": {},
            "target_progress": {},
            "heatmaps": {},
            "recent_expenses": [ExpenseResponse.model_validate(e) for e in recent_expenses],
            "monthly_expense_total": monthly_total + burn,
            "active_subscriptions": [SubscriptionResponse.model_validate(s) for s in active_subs],
            "monthly_committed_burn": burn,
        }

    habit_ids = [h.id for h in habits]
    entries_task = habit_repo.get_entries_for_all_habits(habit_ids)
    expenses_task = expense_repo.get_recent(limit=5)
    monthly_total_task = expense_repo.get_monthly_total_single(year=today.year, month=today.month)
    subs_task = sub_repo.get_all_active(year=today.year, month=today.month)

    entries_by_habit, recent_expenses, monthly_total, active_subs = await asyncio.gather(
        entries_task, expenses_task, monthly_total_task, subs_task,
    )

    aggregates = habit_service.aggregate_habits(habits, entries_by_habit, today)
    burn = _sub_total(active_subs)

    return {
        "habits": [HabitResponse.model_validate(h) for h in habits],
        "completed_today": aggregates["completed_today"],
        "entries_today": aggregates["entries_today"],
        "streaks": aggregates["streaks"],
        "habit_strengths": aggregates["habit_strengths"],
        "target_progress": aggregates["target_progress"],
        "heatmaps": aggregates["heatmaps"],
        "recent_expenses": [ExpenseResponse.model_validate(e) for e in recent_expenses],
        "monthly_expense_total": monthly_total + burn,
        "active_subscriptions": [SubscriptionResponse.model_validate(s) for s in active_subs],
        "monthly_committed_burn": burn,
    }
