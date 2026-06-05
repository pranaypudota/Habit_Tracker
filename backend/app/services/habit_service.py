"""
HabitService — business logic only.

Persistence is delegated to HabitRepository.
Analytics results are cached with a 30-second TTL to eliminate redundant
recomputation on repeated page loads.
"""
import math
from calendar import monthrange
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
_progress_cache: TTLCache = TTLCache(maxsize=256, ttl=30)

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


# ---------------------------------------------------------------------------
# Target progress (Phase 5.1 — Flexible Goals)
# ---------------------------------------------------------------------------

def get_current_period(goal_type: str) -> tuple[date, date]:
    today = date.today()
    if goal_type == "daily":
        return today, today
    elif goal_type == "weekly":
        weekday = today.weekday()
        start = today - timedelta(days=weekday)
        end = start + timedelta(days=6)
        return start, end
    elif goal_type == "monthly":
        start = today.replace(day=1)
        _, last_day = monthrange(today.year, today.month)
        end = today.replace(day=last_day)
        return start, end
    else:
        return today, today


def calculate_target_progress(
    entries: list[HabitEntry],
    goal_type: str,
    target_count: int,
    count_mode: str,
) -> dict:
    period_start, period_end = get_current_period(goal_type)

    # Count over-achievements (entries flagged as beyond goal)
    over_achievement_count = sum(1 for e in entries if e.is_over_achievement)

    if _RUST_AVAILABLE:
        date_strings = [e.date.isoformat() for e in entries]
        result = _rust.calculate_target_progress(
            date_strings,
            period_start.isoformat(),
            period_end.isoformat(),
            target_count,
            count_mode or "total",
        )
        return {
            "completed": result["completed"],
            "target": result["target"],
            "percentage": result["percentage"],
            "completed_days": result["completed_days"],
            "total_entries": result["total_entries"],
            "over_achievement_count": over_achievement_count,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
        }

    total_entries = 0
    distinct_days: set[date] = set()
    for e in entries:
        if period_start <= e.date <= period_end:
            total_entries += 1
            distinct_days.add(e.date)

    completed = len(distinct_days) if count_mode == "distinct_days" else total_entries
    percentage = round((completed / target_count) * 100, 1) if target_count > 0 else 0.0

    return {
        "completed": completed,
        "target": target_count,
        "percentage": percentage,
        "completed_days": len(distinct_days),
        "total_entries": total_entries,
        "over_achievement_count": over_achievement_count,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
    }


async def get_target_progress_for_all(repo: HabitRepository) -> dict[str, dict]:
    cache_key = hashkey("target_progress")
    if cache_key in _progress_cache:
        return _progress_cache[cache_key]

    habits = await repo.get_all()
    if not habits:
        return {}

    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    result: dict[str, dict] = {}
    for h in habits:
        if h.goal_type == "streak":
            continue  # streaks already handled separately
        entries = entries_by_habit.get(h.id, [])
        result[h.id] = calculate_target_progress(
            entries, h.goal_type, h.target_per_period, h.count_mode
        )
    _progress_cache[cache_key] = result
    return result


# ---------------------------------------------------------------------------
# Adaptive trend analysis (Phase 5.3 — Goal Bump Suggestions)
# ---------------------------------------------------------------------------

# Pre-computed weights for 8-week rolling window (week 0 = current, weight decays)
_WEIGHT_DECAY = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]

# Cache for insights (30s TTL)
_insights_cache: TTLCache = TTLCache(maxsize=256, ttl=30)


def _analyze_weekly_trend(
    entries: list[HabitEntry],
    goal_type: str,
    target: int,
    count_mode: str,
) -> dict | None:
    """Analyze last 8 weeks for weekly goal type; return suggestion dict or None."""
    today = date.today()
    weekly_rates: list[float] = []
    consecutive_met = 0

    for w in reversed(range(8)):
        # Week boundaries (Mon-Sun)
        offset = w * 7
        week_end = today - timedelta(days=offset + today.weekday() - 6) if w > 0 else today
        week_start = today - timedelta(days=offset + today.weekday())

        # Skip incomplete current week
        if w == 0:
            continue

        if week_start > today:
            continue

        # Count completions in this week
        total = 0
        distinct: set[date] = set()
        for e in entries:
            if week_start <= e.date <= week_end:
                total += 1
                distinct.add(e.date)

        completed = len(distinct) if count_mode == "distinct_days" else total
        rate = (completed / target * 100) if target > 0 else 0
        weekly_rates.append(min(rate, 200))  # cap at 200% to avoid outliers

        if completed >= target:
            consecutive_met += 1
        else:
            consecutive_met = 0

    if len(weekly_rates) < 4:
        return None

    # Weighted score
    weights = _WEIGHT_DECAY[:len(weekly_rates)]
    weight_sum = sum(weights)
    weighted_score = sum(r * w for r, w in zip(weekly_rates, weights)) / weight_sum if weight_sum else 0

    # Check spike-then-drop: if most recent complete week is under 100%, don't trigger
    if weekly_rates and weekly_rates[0] < 100:
        return None

    if consecutive_met < 4 or weighted_score <= 120:
        return None

    # Determine suggestion
    if weighted_score >= 200:
        new_target = target + 2
    elif weighted_score >= 150:
        new_target = target + 2
    else:
        new_target = target + 1

    return {
        "habit_id": None,  # set by caller
        "goal_type": goal_type,
        "current_target": target,
        "suggested_target": new_target,
        "confidence": round(weighted_score),
        "consecutive_periods": consecutive_met,
        "reason": f"You've met or exceeded your goal for {consecutive_met} consecutive weeks "
                  f"({round(weighted_score)}% average). Consider increasing to {new_target}.",
        "type": "goal_bump",
    }


def _analyze_monthly_trend(
    entries: list[HabitEntry],
    goal_type: str,
    target: int,
    count_mode: str,
) -> dict | None:
    """Analyze last 6 months for monthly goal type; return suggestion dict or None."""
    today = date.today()
    monthly_rates: list[float] = []
    consecutive_met = 0

    for m in reversed(range(6)):
        # Month boundaries
        year = today.year
        month = today.month - m
        while month <= 0:
            month += 12
            year -= 1
        month_start = date(year, month, 1)
        _, last_day = monthrange(year, month)
        month_end = date(year, month, last_day)

        # Skip current (incomplete) month
        if m == 0:
            continue

        if month_start > today:
            continue

        total = 0
        distinct: set[date] = set()
        for e in entries:
            if month_start <= e.date <= month_end:
                total += 1
                distinct.add(e.date)

        completed = len(distinct) if count_mode == "distinct_days" else total
        rate = (completed / target * 100) if target > 0 else 0
        monthly_rates.append(min(rate, 200))

        if completed >= target:
            consecutive_met += 1
        else:
            consecutive_met = 0

    if len(monthly_rates) < 3:
        return None

    weights = _WEIGHT_DECAY[:len(monthly_rates)]
    weight_sum = sum(weights)
    weighted_score = sum(r * w for r, w in zip(monthly_rates, weights)) / weight_sum if weight_sum else 0

    if monthly_rates and monthly_rates[0] < 100:
        return None

    if consecutive_met < 3 or weighted_score <= 120:
        return None

    new_target = target + 1 if weighted_score < 200 else target + 2

    return {
        "habit_id": None,
        "goal_type": goal_type,
        "current_target": target,
        "suggested_target": new_target,
        "confidence": round(weighted_score),
        "consecutive_periods": consecutive_met,
        "reason": f"You've met or exceeded your goal for {consecutive_met} consecutive months "
                  f"({round(weighted_score)}% average). Consider increasing to {new_target}.",
        "type": "goal_bump",
    }


def generate_insights(
    habit: Habit,
    entries: list[HabitEntry],
) -> dict | None:
    """Generate adaptive goal suggestion for a single habit. Returns dict or None."""
    if habit.goal_type in ("streak", "daily"):
        return None

    target = habit.target_per_period
    if target <= 0:
        return None

    if habit.goal_type == "weekly":
        result = _analyze_weekly_trend(entries, habit.goal_type, target, habit.count_mode)
    elif habit.goal_type == "monthly":
        result = _analyze_monthly_trend(entries, habit.goal_type, target, habit.count_mode)
    else:
        return None

    if result:
        result["habit_id"] = habit.id
        result["habit_name"] = habit.name
    return result


async def get_all_insights(repo: HabitRepository) -> list[dict]:
    """Return actionable insights for all eligible habits, with 30s TTL cache."""
    cache_key = hashkey("insights")
    if cache_key in _insights_cache:
        return _insights_cache[cache_key]

    habits = await repo.get_all()
    if not habits:
        return []

    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    suggestions: list[dict] = []
    for h in habits:
        entries = entries_by_habit.get(h.id, [])
        insight = generate_insights(h, entries)
        if insight:
            suggestions.append(insight)

    _insights_cache[cache_key] = suggestions
    return suggestions


# ---------------------------------------------------------------------------
# Cache management
# ---------------------------------------------------------------------------

def invalidate_caches() -> None:
    """Clear all TTL caches. Call after any mutation (create/update/delete/complete)."""
    for cache in (_streak_cache, _strength_cache, _heatmap_cache, _progress_cache, _insights_cache):
        cache.clear()


# ---------------------------------------------------------------------------
# Over-achievement detection (Phase 5.2 — extracted from router)
# ---------------------------------------------------------------------------

async def detect_over_achievement(
    habit: Habit,
    entry_date: date,
    repo: HabitRepository,
) -> tuple[bool, Optional[str]]:
    """Check if completing on entry_date would exceed the habit's period target.
    
    Returns (is_over, warning_string). The warning string is None if not over.
    """
    if habit.goal_type == "streak":
        return False, None

    period_start, period_end = get_current_period(habit.goal_type)
    existing_entries = await repo.get_entries(habit.id, period_start, period_end)

    if habit.count_mode == "distinct_days":
        existing_days = len({e.date for e in existing_entries})
        if existing_days >= habit.target_per_period:
            return True, f"You've met your goal of {habit.target_per_period} days. Mark as {existing_days + 1}?"
    else:
        existing_count = len(existing_entries)
        if existing_count >= habit.target_per_period:
            return True, f"You've met your goal of {habit.target_per_period}. Mark as {existing_count + 1}?"

    return False, None


def accept_suggestion(habit_id: str, suggested_target: int) -> bool:
    """Clear caches after accepting a goal bump suggestion."""
    invalidate_caches()
    return True


# ---------------------------------------------------------------------------
# Dashboard aggregation (single computation pass over pre-fetched data)
# ---------------------------------------------------------------------------

def aggregate_habits(
    habits: list[Habit],
    entries_by_habit: dict[str, list[HabitEntry]],
    today: date,
) -> dict:
    """Compute all habit-related dashboard aggregates in one pass.
    
    Takes pre-fetched I/O and returns streaks, strengths, heatmaps, 
    target_progress, completed_today, and entries_today — no additional I/O.
    """
    streaks: dict[str, int] = {}
    habit_strengths: dict[str, dict] = {}
    heatmaps: dict[str, dict[str, int]] = {}
    target_progress: dict[str, dict] = {}
    completed_today: list[str] = []
    entries_today: dict[str, list[dict]] = {}

    for h in habits:
        entries = entries_by_habit.get(h.id, [])

        # Streak or decay strength
        if h.tracking_model == "streak":
            streaks[h.id] = compute_streak(entries, h.target_completions_per_day)
        else:
            habit_strengths[h.id] = {
                "monthly": calculate_decay_score(entries, window_type="month"),
                "rolling": calculate_decay_score(entries, window_type="rolling"),
            }

        # Heatmap
        levels = calculate_streak_levels(entries, h.target_completions_per_day, window_days=90)
        heatmaps[h.id] = {item["date"]: item["level"] for item in levels}

        # Target progress for non-streak habits
        if h.goal_type != "streak":
            target_progress[h.id] = calculate_target_progress(
                entries, h.goal_type, h.target_per_period, h.count_mode
            )

        # Today's entries and completion status
        day_entries = [e for e in entries if e.date == today]
        entries_today[h.id] = [
            {"id": str(e.id), "habit_id": str(e.habit_id), "date": str(e.date)}
            for e in day_entries
        ]
        if day_entries:
            completed_today.append(h.id)

    return {
        "streaks": streaks,
        "habit_strengths": habit_strengths,
        "heatmaps": heatmaps,
        "target_progress": target_progress,
        "completed_today": completed_today,
        "entries_today": entries_today,
    }

# (End of module)
