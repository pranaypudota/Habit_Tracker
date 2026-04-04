"""
ExpenseService — business logic only.

Persistence is delegated to ExpenseRepository.
"""
from cachetools import TTLCache
from cachetools.keys import hashkey
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.subscription_repository import SubscriptionRepository


# 1 minute TTL cache for monthly expenses
_monthly_cache = TTLCache(maxsize=128, ttl=60)


async def get_effective_expenses(
    expense_repo: ExpenseRepository, 
    sub_repo: SubscriptionRepository, 
    year: int, 
    month: int
) -> float:
    """Calculates the merged total of one-off expenses and effective subscriptions for a month."""
    monthly_expense = await expense_repo.get_monthly_total_single(year, month)
    monthly_subs = await sub_repo.get_effective_monthly_total(year, month)
    return float(monthly_expense) + float(monthly_subs) 
_monthly_cache = TTLCache(maxsize=128, ttl=60)


from datetime import date
from collections import defaultdict

async def get_monthly_totals(expense_repo: ExpenseRepository, sub_repo: SubscriptionRepository) -> list[dict]:
    """Retrieve monthly totals merging one-off expenses and tracking subscriptions across matching months."""
    cache_key = hashkey("monthly_totals_with_subs")
    if cache_key in _monthly_cache:
        return _monthly_cache[cache_key]

    expense_totals = await expense_repo.get_monthly_totals()
    all_subs = await sub_repo.get_all_historical()

    # Determine date range (from earliest record to current month)
    today = date.today()
    min_year = today.year
    min_month = today.month

    for r in expense_totals:
        if r["year"] < min_year or (r["year"] == min_year and r["month"] < min_month):
            min_year = r["year"]
            min_month = r["month"]
            
    for sub in all_subs:
        if sub.start_date:
            y, m = sub.start_date.year, sub.start_date.month
            if y < min_year or (y == min_year and m < min_month):
                min_year = y
                min_month = m

    # Map one-off expenses
    expense_dict = {(r["year"], r["month"]): r["total"] for r in expense_totals}

    # Generate complete timeline
    merged_results = []
    y, m = min_year, min_month
    while y < today.year or (y == today.year and m <= today.month):
        month_expense = expense_dict.get((y, m), 0.0)
        
        # Calculate overlapping subscriptions for this (y, m)
        first_day = date(y, m, 1)
        if m == 12:
            last_day = date(y + 1, 1, 1)
        else:
            last_day = date(y, m + 1, 1)

        month_sub_total = 0.0
        for sub in all_subs:
            # Active rule mapping from SubscriptionRepository
            # start_date < last_day AND (end_date == None OR end_date >= first_day)
            starts_before_end = sub.start_date and sub.start_date < last_day
            ends_after_start = sub.end_date is None or sub.end_date >= first_day
            if starts_before_end and ends_after_start:
                month_sub_total += float(sub.amount)

        merged_results.append({
            "year": y,
            "month": m,
            "total": month_expense + month_sub_total,
            "expense_total": month_expense,
            "subscription_total": month_sub_total
        })

        m += 1
        if m > 12:
            m = 1
            y += 1

    _monthly_cache[cache_key] = merged_results
    return merged_results
