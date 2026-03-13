from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.repositories.expense_repository import ExpenseRepository

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def _repo(db: AsyncSession = Depends(get_db)) -> ExpenseRepository:
    return ExpenseRepository(db)


@router.get("/", response_model=list[ExpenseResponse])
async def list_expenses(
    year: Optional[int] = Query(default=None),
    month: Optional[int] = Query(default=None),
    repo: ExpenseRepository = Depends(_repo),
):
    return await repo.get_all(year=year, month=month)


@router.post("/", response_model=ExpenseResponse, status_code=201)
async def add_expense(
    payload: ExpenseCreate,
    repo: ExpenseRepository = Depends(_repo),
):
    return await repo.create(
        amount=payload.amount,
        category=payload.category,
        expense_date=payload.date,
        note=payload.note or "",
    )


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: str,
    repo: ExpenseRepository = Depends(_repo),
):
    deleted = await repo.delete(expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
