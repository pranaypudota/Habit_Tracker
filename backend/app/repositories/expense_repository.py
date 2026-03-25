"""
ExpenseRepository — pure persistence layer for expenses.
"""
from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, extract

from app.models.expense import Expense
from app.core.utils import uuid4_str as _uuid


class ExpenseRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(
        self,
        year: Optional[int] = None,
        month: Optional[int] = None,
    ) -> list[Expense]:
        filters = []
        if year:
            filters.append(extract("year", Expense.date) == year)
        if month:
            filters.append(extract("month", Expense.date) == month)

        stmt = select(Expense).order_by(Expense.date.desc())
        if filters:
            stmt = stmt.where(and_(*filters))
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, expense_id: str) -> Optional[Expense]:
        result = await self._db.execute(
            select(Expense).where(Expense.id == expense_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        amount: Decimal,
        category: str,
        expense_date: date,
        note: str = "",
    ) -> Expense:
        expense = Expense(
            id=_uuid(),
            amount=amount,
            category=category,
            date=expense_date,
            note=note,
        )
        self._db.add(expense)
        await self._db.flush()
        await self._db.refresh(expense)
        return expense

    async def delete(self, expense_id: str) -> bool:
        expense = await self.get_by_id(expense_id)
        if not expense:
            return False
        await self._db.delete(expense)
        return True

    async def get_monthly_totals(self) -> list[dict]:
        """Total expenses grouped by year-month with proper column references."""
        year_col = extract("year", Expense.date).label("year")
        month_col = extract("month", Expense.date).label("month")
        result = await self._db.execute(
            select(
                year_col,
                month_col,
                func.sum(Expense.amount).label("total"),
            )
            .group_by(year_col, month_col)
            .order_by(year_col, month_col)
        )
        return [
            {"year": int(r.year), "month": int(r.month), "total": float(r.total)}
            for r in result.all()
        ]

    async def get_monthly_total_single(
        self, year: int, month: int
    ) -> float:
        """Single month total — for dashboard aggregation."""
        result = await self._db.execute(
            select(func.sum(Expense.amount)).where(
                and_(
                    extract("year", Expense.date) == year,
                    extract("month", Expense.date) == month,
                )
            )
        )
        total = result.scalar_one_or_none()
        return float(total) if total else 0.0

    async def get_recent(self, limit: int = 5) -> list[Expense]:
        result = await self._db.execute(
            select(Expense).order_by(Expense.date.desc()).limit(limit)
        )
        return list(result.scalars().all())
