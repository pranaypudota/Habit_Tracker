"""
ExpenseService — business logic only.

Persistence is delegated to ExpenseRepository.
"""
from app.repositories.expense_repository import ExpenseRepository


async def get_monthly_totals(repo: ExpenseRepository) -> list[dict]:
    return await repo.get_monthly_totals()
