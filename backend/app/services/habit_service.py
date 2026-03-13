"""
HabitService — business logic only.

Persistence is delegated to HabitRepository.
"""
import math
from datetime import date, timedelta
from typing import Optional

from app.models.habit import Habit, HabitEntry
from app.repositories.habit_repository import HabitRepository


def calculate_decay_score(entries: list[HabitEntry], lambda_val: float = 0.15, window_days: int = 30) -> float:
    """
    Calculate habit strength using an exponential decay model.
    score = Σ (completion × weight) / max_possible_weight
    weight = exp(-λ × days_ago)
    """
    today = date.today()
    entry_dates = {e.date for e in entries}

    weighted_sum = 0.0
    max_possible_weight = 0.0

    for i in range(window_days):
        check_date = today - timedelta(days=i)
        weight = math.exp(-lambda_val * i)
        max_possible_weight += weight

        if check_date in entry_dates:
            weighted_sum += weight

    if max_possible_weight == 0:
        return 0.0

    return round(weighted_sum / max_possible_weight, 2)


def compute_streak(entries: list[HabitEntry]) -> int:
    """
    Current consecutive streak.
    If completed today: streak = 1 + check yesterday.
    If NOT completed today: check if completed yesterday. If yes, streak is preserved (from yesterday).
    If neither today nor yesterday: streak = 0.
    """
    entry_dates = {e.date for e in entries}
    if not entry_dates:
        return 0

    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # If not completed today AND not completed yesterday, streak is broken
    if today not in entry_dates and yesterday not in entry_dates:
        return 0
        
    streak = 0
    # Start checking from today if completed today, else start from yesterday
    check_date = today if today in entry_dates else yesterday
    
    while check_date in entry_dates:
        streak += 1
        check_date -= timedelta(days=1)
        
    return streak


def calculate_streak_levels(entries: list[HabitEntry], window_days: int = 90) -> list[dict]:
    """
    Calculate the chronological streak level (0-5) for each day in the requested window.
    This generates a GitHub-style progression that rewards rebuilding streaks.
    Level resets to 0 on a missed day.
    """
    entry_dates = {e.date for e in entries}
    today = date.today()
    start_date = today - timedelta(days=window_days - 1)
    
    results = []
    current_streak = 0
    
    # Iterate chronologically from the start of the window
    for i in range(window_days):
        current_date = start_date + timedelta(days=i)
        
        if current_date in entry_dates:
            current_streak += 1
        else:
            current_streak = 0
            
        # Cap visual streak level at 5 (Peak Consistency)
        level = min(current_streak, 5)
        
        results.append({
            "date": current_date.isoformat(),
            "level": level
        })
        
    return results


def compute_completion_rate(entries: list[HabitEntry], days: int = 30) -> float:
    """Completion rate (%) over the last N days — presence = completed."""
    start = date.today() - timedelta(days=days - 1)
    completed = sum(1 for e in entries if e.date >= start)
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
            "streak": compute_streak(entries_by_habit.get(h.id, [])),
        }
        for h in habits
    ]


async def get_habit_strengths(repo: HabitRepository) -> list[dict]:
    """Return strength for every non-archived habit."""
    habits = await repo.get_all()
    if not habits:
        return []

    habit_ids = [h.id for h in habits]
    entries_by_habit = await repo.get_entries_for_all_habits(habit_ids)

    return [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "habit_strength": calculate_decay_score(entries_by_habit.get(h.id, [])),
        }
        for h in habits
    ]


async def get_streak_heatmap_for_habit(repo: HabitRepository, habit_id: str, window_days: int = 90) -> dict:
    """Return chronological streak level data for the heatmap visualization."""
    entries = await repo.get_entries(habit_id)
    heatmap_data = calculate_streak_levels(entries, window_days)
    
    return {
        "habit_id": habit_id,
        "heatmap": heatmap_data
    }
