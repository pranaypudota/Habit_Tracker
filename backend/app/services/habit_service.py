"""
HabitService — business logic only.

Persistence is delegated to HabitRepository.
"""
import math
from datetime import date, timedelta
from typing import Optional

from app.models.habit import Habit, HabitEntry
from app.repositories.habit_repository import HabitRepository


# Habit memory decay constant
# λ = 0.08
# Half-life ≈ 8.66 days
# Tuned for 30-day habit strength window
DECAY_LAMBDA = 0.08


def get_daily_counts(entries: list[HabitEntry]) -> dict[date, int]:
    counts = {}
    for e in entries:
        counts[e.date] = counts.get(e.date, 0) + 1
    return counts


def calculate_decay_score(entries: list[HabitEntry], lambda_val: float = DECAY_LAMBDA, window_type: str = "month") -> float:
    """
    Calculate habit strength using an exponential decay model.
    - 'month': Localized to the start of the current calendar month.
    - 'rolling': Looks back exactly 30 days from today.
    """
    today = date.today()
    
    if window_type == "month":
        month_start = today.replace(day=1)
        days_to_check = (today - month_start).days + 1
        entry_dates = {e.date for e in entries if e.date >= month_start}
    else: # rolling 30 days
        days_to_check = 30
        entry_dates = {e.date for e in entries if e.date >= (today - timedelta(days=29))}

    weighted_sum = 0.0
    max_possible_weight = 0.0

    for i in range(days_to_check):
        check_date = today - timedelta(days=i)
        weight = math.exp(-lambda_val * i)
        max_possible_weight += weight

        if check_date in entry_dates:
            weighted_sum += weight

    if max_possible_weight == 0:
        return 0.0

    return round(weighted_sum / max_possible_weight, 2)


def compute_streak(entries: list[HabitEntry], target: int = 1) -> int:
    """
    Current consecutive streak.
    Counts a day as 'completed' if entries >= target.
    """
    daily_counts = get_daily_counts(entries)
    if not daily_counts:
        return 0

    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # If not enough today AND not enough yesterday, streak is broken
    has_today = daily_counts.get(today, 0) >= target
    has_yesterday = daily_counts.get(yesterday, 0) >= target

    if not has_today and not has_yesterday:
        return 0
        
    streak = 0
    # Start checking from today if completed today, else start from yesterday
    check_date = today if has_today else yesterday
    
    while daily_counts.get(check_date, 0) >= target:
        streak += 1
        check_date -= timedelta(days=1)
        
    return streak


def calculate_streak_levels(entries: list[HabitEntry], target: int = 1, window_days: int = 90) -> list[dict]:
    """
    Calculate the chronological completion level (0-5) for each day.
    
    Strategies:
    1. Single-hit (target=1): Level builds based on consecutive days (streak).
    2. Multi-hit (target>1): Level depends on completion ratio for that day.
    """
    daily_counts = get_daily_counts(entries)
    today = date.today()
    start_date = today - timedelta(days=window_days - 1)
    
    results = []
    current_streak = 0
    
    for i in range(window_days):
        current_date = start_date + timedelta(days=i)
        count = daily_counts.get(current_date, 0)
        
        if target == 1:
            # Traditional streak-building logic: intensity starts at Level 2 for day 1
            if count >= 1:
                current_streak += 1
                # Day 1 -> Level 2, Day 2 -> Level 3, Day 3 -> Level 4, Day 4+ -> Level 5
                level = min(current_streak + 1, 5)
            else:
                current_streak = 0
                level = 0
        else:
            # Multi-hit ratio logic: intensity acts as a progress bar
            if count >= target and target > 0:
                level = 5  # Instant Max Brightness / Glow on target hit
            else:
                ratio = count / target if target > 0 else (1 if count > 0 else 0)
                level = min(math.floor(ratio * 5), 4) if count > 0 else 0
                
                # Ensure at least Level 1 if any progress made
                if count > 0 and level == 0:
                    level = 1

        results.append({
            "date": current_date.isoformat(),
            "level": level
        })
        
    return results


def compute_completion_rate(entries: list[HabitEntry], days: int = 30) -> float:
    """Completion rate (%) over the last N days — presence = completed."""
    start = date.today() - timedelta(days=days - 1)
    completed = len({e.date for e in entries if e.date >= start})
    return round((completed / days) * 100, 1)


async def get_streaks_for_all(repo: HabitRepository) -> list[dict]:
    """Return streak for every non-archived habit."""
    habits = await repo.get_all()
    if not habits:
        return []

    habit_ids = [h.id for h in habits]
    entries_by_habit = await repo.get_entries_for_all_habits(habit_ids)

    return [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "category": h.category,
            "streak": compute_streak(entries_by_habit.get(h.id, []), h.target_completions_per_day),
        }
        for h in habits
    ]


async def get_habit_strengths(repo: HabitRepository) -> list[dict]:
    """Return both monthly and rolling strengths for every non-archived habit."""
    habits = await repo.get_all()
    if not habits:
        return []

    habit_ids = [h.id for h in habits]
    entries_by_habit = await repo.get_entries_for_all_habits(habit_ids)

    return [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "strength_monthly": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="month"),
            "strength_rolling": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="rolling"),
        }
        for h in habits
    ]


async def get_streak_heatmap_for_habit(repo: HabitRepository, habit_id: str, window_days: int = 90) -> dict:
    """Return chronological streak level data for the heatmap visualization."""
    habit = await repo.get_by_id(habit_id)
    if not habit:
        return {"habit_id": habit_id, "heatmap": []}
        
    entries = await repo.get_entries(habit_id)
    heatmap_data = calculate_streak_levels(entries, habit.target_completions_per_day, window_days)
    
    return {
        "habit_id": habit_id,
        "heatmap": heatmap_data
    }
