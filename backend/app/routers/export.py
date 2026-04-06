from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.habit import Habit, HabitEntry
from app.models.expense import Expense
from app.models.subscription import Subscription
from app.core.security import get_current_user
from loguru import logger

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/", dependencies=[Depends(get_current_user)])
async def export_all_data(db: AsyncSession = Depends(get_db)):
    """
    Exports all user data in a portable JSON format for local backup or migration.
    """
    logger.info("Generating full data export")
    
    # Fetch Habits
    habits_result = await db.execute(select(Habit))
    habits = habits_result.scalars().all()
    
    # Fetch Habit Entries
    entries_result = await db.execute(select(HabitEntry))
    entries = entries_result.scalars().all()
    
    # Fetch Expenses
    expenses_result = await db.execute(select(Expense))
    expenses = expenses_result.scalars().all()
    
    # Fetch Subscriptions
    subs_result = await db.execute(select(Subscription))
    subs = subs_result.scalars().all()
    
    export_payload = {
        "metadata": {
            "version": "1.0",
            "export_date": str(date.today()),
            "engine": "HabitOS"
        },
        "habits": [
            {
                "id": h.id, 
                "name": h.name, 
                "category": h.category, 
                "period": h.period,
                "target_per_period": h.target_per_period,
                "target_completions_per_day": h.target_completions_per_day,
                "tracking_model": h.tracking_model,
                "archived": h.archived
            } for h in habits
        ],
        "habit_entries": [
            {
                "habit_id": e.habit_id, 
                "date": str(e.date)
            } for e in entries
        ],
        "expenses": [
            {
                "id": ex.id,
                "amount": float(ex.amount),
                "category": ex.category,
                "date": str(ex.date),
                "note": ex.note
            } for ex in expenses
        ],
        "subscriptions": [
            {
                "id": s.id,
                "name": s.name,
                "amount": float(s.amount),
                "category": s.category,
                "start_date": str(s.start_date),
                "end_date": str(s.end_date) if s.end_date else None,
                "status": s.status,
                "billing_day": s.billing_day
            } for s in subs
        ]
    }
    
    logger.success(f"Export completed: {len(habits)} habits, {len(expenses)} expenses")
    return export_payload
