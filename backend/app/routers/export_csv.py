import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.habit import Habit
from app.models.expense import Expense
from app.core.security import get_current_user

router = APIRouter(prefix="/export/csv", tags=["Export"])

@router.get("/habits", dependencies=[Depends(get_current_user)])
async def export_habits_csv(db: AsyncSession = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Category", "Period", "Target Period", "Archived"])
    
    result = await db.execute(select(Habit))
    for h in result.scalars().all():
        writer.writerow([h.id, h.name, h.category, h.period, h.target_per_period, h.archived])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=habits_export.csv"}
    )

@router.get("/expenses", dependencies=[Depends(get_current_user)])
async def export_expenses_csv(db: AsyncSession = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Amount", "Category", "Note", "Date"])
    
    result = await db.execute(select(Expense))
    for ex in result.scalars().all():
        writer.writerow([ex.id, float(ex.amount), ex.category, ex.note, str(ex.date)])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses_export.csv"}
    )
