"""
ExpenseService — business logic only.

Persistence is delegated to ExpenseRepository.
"""
from cachetools import TTLCache
from cachetools.keys import hashkey
from app.repositories.expense_repository import ExpenseRepository


# 1 minute TTL cache for monthly expenses
_monthly_cache = TTLCache(maxsize=128, ttl=60)


async def get_monthly_totals(repo: ExpenseRepository) -> list[dict]:
    """Retrieve monthly totals with in-memory TTL caching."""
    cache_key = hashkey("monthly_totals")
    if cache_key in _monthly_cache:
        return _monthly_cache[cache_key]

    result = await repo.get_monthly_totals()
    _monthly_cache[cache_key] = result
    return result
