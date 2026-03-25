"""
HabitService — business logic only.

Persistence is delegated to HabitRepository.
Analytics results are cached with a 30-second TTL to eliminate redundant
recomputation on repeated page loads.
"""
import math
from datetime import date, timedelta
from typing import Optional
from cachetools import TTLCache
from cachetools.keys import hashkey

from app.models.habit import Habit, HabitEntry
from app.repositories.habit_repository import HabitRepository


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
# Habit memory decay constant
# λ = 0.08 → half-life ≈ 8.66 days, tuned for 30-day habit window
DECAY_LAMBDA = 0.08

# Pre-computed decay weights for the max window (31 days).
# math.exp is expensive inside tight loops — compute once at module load.
_MAX_DECAY_WINDOW = 31
_DECAY_WEIGHTS: list[float] = [math.exp(-DECAY_LAMBDA * i) for i in range(_MAX_DECAY_WINDOW)]

# In-memory TTL caches (maxsize=256, ttl=30 seconds).  Keyed by habit_id(s).
_streak_cache: TTLCache = TTLCache(maxsize=256, ttl=30)
_strength_cache: TTLCache = TTLCache(maxsize=256, ttl=30)
_heatmap_cache: TTLCache = TTLCache(maxsize=256, ttl=30)

# ---------------------------------------------------------------------------
# Rust acceleration (optional — transparent hot-swap)
# ---------------------------------------------------------------------------
# If `habit_core` Rust extension is built (`maturin develop --release` in
# d:\Habit_Tracker\habit_core\), the compute functions are replaced with
# their native implementations automatically. No other code changes needed.
try:
    import habit_core as _rust
    _RUST_AVAILABLE = True
except ImportError:
    _rust = None  # type: ignore[assignment]
    _RUST_AVAILABLE = False


# ---------------------------------------------------------------------------

def get_daily_counts(entries: list[HabitEntry]) -> dict[date, int]:
    counts: dict[date, int] = {}
    for e in entries:
        counts[e.date] = counts.get(e.date, 0) + 1
    return counts


def calculate_decay_score(
    entries: list[HabitEntry],
    lambda_val: float = DECAY_LAMBDA,
    window_type: str = "month",
) -> float:
    """
    Habit strength via exponential decay.
    - 'month':   from the 1st of the current calendar month → today
    - 'rolling': exact 30-day lookback from today
    Uses Rust native implementation when available.
    """
    if _RUST_AVAILABLE:
        today = date.today()
        if window_type == "month":
            month_start = today.replace(day=1)
            window_days = (today - month_start).days + 1
        else:
            window_days = 30
        date_strings = [e.date.isoformat() for e in entries]
        return _rust.calculate_decay_score(date_strings, lambda_val, window_days)

    today = date.today()
    if window_type == "month":
        month_start = today.replace(day=1)
        days_to_check = (today - month_start).days + 1
        entry_dates = frozenset(e.date for e in entries if e.date >= month_start)
    else:  # rolling 30 days
        days_to_check = 30
        cutoff = today - timedelta(days=29)
        entry_dates = frozenset(e.date for e in entries if e.date >= cutoff)

    weighted_sum = 0.0
    max_possible = 0.0
    check_date = today
    for i in range(days_to_check):
        weight = _DECAY_WEIGHTS[i] if i < _MAX_DECAY_WINDOW else math.exp(-lambda_val * i)
        max_possible += weight
        if check_date in entry_dates:
            weighted_sum += weight
        check_date -= timedelta(days=1)

    return round(weighted_sum / max_possible, 2) if max_possible else 0.0


def compute_streak(entries: list[HabitEntry], target: int = 1) -> int:
    """Current consecutive streak. Uses Rust native implementation when available."""
    if _RUST_AVAILABLE:
        date_strings = [e.date.isoformat() for e in entries]
        return _rust.compute_streak(date_strings, target)

    daily_counts = get_daily_counts(entries)
    if not daily_counts:
        return 0
    today = date.today()
    yesterday = today - timedelta(days=1)
    has_today = daily_counts.get(today, 0) >= target
    has_yesterday = daily_counts.get(yesterday, 0) >= target
    if not has_today and not has_yesterday:
        return 0
    streak = 0
    check_date = today if has_today else yesterday
    while daily_counts.get(check_date, 0) >= target:
        streak += 1
        check_date -= timedelta(days=1)
    return streak


def calculate_streak_levels(
    entries: list[HabitEntry],
    target: int = 1,
    window_days: int = 90,
) -> list[dict]:
    """
    GitHub-style intensity level (0–5) for each day in the window.
    Uses Rust native implementation when available.
    """
    if _RUST_AVAILABLE:
        date_strings = [e.date.isoformat() for e in entries]
        return _rust.calculate_streak_levels(date_strings, target, window_days)

    daily_counts = get_daily_counts(entries)
    today = date.today()
    results: list[dict] = []
    current_streak = 0
    current_date = today - timedelta(days=window_days - 1)
    for _ in range(window_days):
        count = daily_counts.get(current_date, 0)
        if target == 1:
            if count >= 1:
                current_streak += 1
                level = min(current_streak + 1, 5)
            else:
                current_streak = 0
                level = 0
        else:
            if count >= target:
                level = 5
            elif count > 0:
                ratio = count / target
                level = max(1, min(math.floor(ratio * 5), 4))
            else:
                level = 0
        results.append({"date": current_date.isoformat(), "level": level})
        current_date += timedelta(days=1)
    return results


def compute_completion_rate(entries: list[HabitEntry], days: int = 30) -> float:
    """Completion rate (%) over the last N days."""
    start = date.today() - timedelta(days=days - 1)
    completed = len({e.date for e in entries if e.date >= start})
    return round((completed / days) * 100, 1)


# ---------------------------------------------------------------------------
# Async service layer (with TTL caching)
# ---------------------------------------------------------------------------

async def get_streaks_for_all(repo: HabitRepository) -> list[dict]:
    """Return streak for every non-archived habit, with 30-second TTL cache."""
    cache_key = hashkey("streaks")
    if cache_key in _streak_cache:
        return _streak_cache[cache_key]

    habits = await repo.get_all()
    if not habits:
        return []

    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    result = [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "category": h.category,
            "streak": compute_streak(entries_by_habit.get(h.id, []), h.target_completions_per_day),
        }
        for h in habits
    ]
    _streak_cache[cache_key] = result
    return result


async def get_habit_strengths(repo: HabitRepository) -> list[dict]:
    """Monthly + rolling decay strength for every habit, with 30-second TTL cache."""
    cache_key = hashkey("strengths")
    if cache_key in _strength_cache:
        return _strength_cache[cache_key]

    habits = await repo.get_all()
    if not habits:
        return []

    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    result = [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "strength_monthly": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="month"),
            "strength_rolling": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="rolling"),
        }
        for h in habits
    ]
    _strength_cache[cache_key] = result
    return result


async def get_streak_heatmap_for_habit(
    repo: HabitRepository, habit_id: str, window_days: int = 90
) -> dict:
    """Heatmap intensity data for a single habit, with 30-second TTL cache."""
    cache_key = hashkey("heatmap", habit_id, window_days)
    if cache_key in _heatmap_cache:
        return _heatmap_cache[cache_key]

    habit = await repo.get_by_id(habit_id)
    if not habit:
        return {"habit_id": habit_id, "heatmap": []}

    entries = await repo.get_entries(habit_id)
    heatmap_data = calculate_streak_levels(entries, habit.target_completions_per_day, window_days)
    result = {"habit_id": habit_id, "heatmap": heatmap_data}
    _heatmap_cache[cache_key] = result
    return result

# (End of module)
