"""
Analytics router — MVP subset only:
  GET /analytics/streaks
  GET /analytics/expenses/monthly
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.habit_repository import HabitRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services import habit_service, expense_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/streaks")
async def get_streaks(db: AsyncSession = Depends(get_db)):
    """Current streak for every active habit."""
    repo = HabitRepository(db)
    return await habit_service.get_streaks_for_all(repo)


@router.get("/habit-strength")
async def get_habit_strength(db: AsyncSession = Depends(get_db)):
    """Consistency score (decay model) for every habit."""
    repo = HabitRepository(db)
    return await habit_service.get_habit_strengths(repo)


@router.get("/streak-heatmap/{habit_id}")
async def get_streak_heatmap(habit_id: str, db: AsyncSession = Depends(get_db)):
    """GitHub-style historical streak levels for a specific habit."""
    repo = HabitRepository(db)
    return await habit_service.get_streak_heatmap_for_habit(repo, habit_id)


@router.get("/expenses/monthly")
async def monthly_totals(db: AsyncSession = Depends(get_db)):
    """Total expenses grouped by year-month."""
    repo = ExpenseRepository(db)
    return await expense_service.get_monthly_totals(repo)
