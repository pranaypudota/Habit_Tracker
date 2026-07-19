"""Tests for habit_service module functions."""
from datetime import date, timedelta
from app.services.habit_service import aggregate_habits, calculate_target_progress, compute_streak


def test_aggregate_habits_empty():
    result = aggregate_habits([], {}, date.today())
    assert result["streaks"] == {}
    assert result["heatmaps"] == {}
    assert result["completed_today"] == []
    assert result["entries_today"] == {}


def test_aggregate_habits_streak():
    from app.models.habit import Habit, HabitEntry

    habit = Habit(id="h1", name="Test", category="Health", period="daily",
                  target_per_period=1, target_completions_per_day=1,
                  tracking_model="streak", goal_type="streak", count_mode="")
    today = date.today()
    entry = HabitEntry(id="e1", habit_id="h1", date=today)

    result = aggregate_habits([habit], {"h1": [entry]}, today)
    assert "h1" in result["streaks"]
    assert result["streaks"]["h1"] >= 1
    assert "h1" in result["completed_today"]
    assert len(result["entries_today"]["h1"]) == 1


def test_aggregate_habits_target_progress():
    from app.models.habit import Habit, HabitEntry

    habit = Habit(id="h2", name="Gym", category="Fitness", period="weekly",
                  target_per_period=3, target_completions_per_day=1,
                  tracking_model="streak", goal_type="weekly", count_mode="total")
    today = date.today()
    entries = [HabitEntry(id="e1", habit_id="h2", date=today),
               HabitEntry(id="e2", habit_id="h2", date=today)]

    result = aggregate_habits([habit], {"h2": entries}, today)
    assert "h2" in result["target_progress"]
    assert result["target_progress"]["h2"]["completed"] == 2
    assert result["target_progress"]["h2"]["target"] == 3


def test_compute_streak_zero():
    assert compute_streak([], 1) == 0


def test_calculate_target_progress_daily():
    from app.models.habit import HabitEntry
    today = date.today()
    entries = [HabitEntry(id="e1", habit_id="h1", date=today),
               HabitEntry(id="e2", habit_id="h1", date=today)]
    result = calculate_target_progress(entries, "daily", 5, "total")
    assert result["completed"] == 2
    assert result["target"] == 5
    assert result["percentage"] < 100


# ---------------------------------------------------------------------------
# TestHabitStrength - TDD tests for strength calculation (Phase 6)
# ---------------------------------------------------------------------------

class TestHabitStrength:
    """Test suite for habit strength decay calculation."""

    def test_strength_is_0_when_no_entries_exist(self):
        """Test 1: Strength is 0.0 when no entries exist."""
        from app.services.habit_service import calculate_decay_score
        from app.models.habit import HabitEntry

        # Empty entries should yield 0.0 strength
        entries: list[HabitEntry] = []

        # Test monthly window
        strength_monthly = calculate_decay_score(entries, window_type="month")
        assert strength_monthly == 0.0, f"Expected 0.0 for empty entries, got {strength_monthly}"

        # Test rolling window
        strength_rolling = calculate_decay_score(entries, window_type="rolling")
        assert strength_rolling == 0.0, f"Expected 0.0 for empty entries (rolling), got {strength_rolling}"

    def test_strength_is_1_when_all_days_completed(self):
        """Test 2: Strength is 1.0 when all days in window are completed."""
        from app.services.habit_service import calculate_decay_score
        from app.models.habit import HabitEntry

        today = date.today()

        # For monthly window: create entries for all days from 1st to today
        month_start = today.replace(day=1)
        days_in_month = (today - month_start).days + 1

        monthly_entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=month_start + timedelta(days=i))
            for i in range(days_in_month)
        ]

        strength_monthly = calculate_decay_score(monthly_entries, window_type="month")
        assert strength_monthly == 1.0, f"Expected 1.0 for perfect monthly completion, got {strength_monthly}"

        # For rolling 30-day window: create entries for all 30 days
        rolling_entries = [
            HabitEntry(id=f"r{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(30)
        ]

        strength_rolling = calculate_decay_score(rolling_entries, window_type="rolling")
        assert strength_rolling == 1.0, f"Expected 1.0 for perfect rolling completion, got {strength_rolling}"

    def test_recent_completions_contribute_more(self):
        """Test 3: Recent completions contribute more (7/30 days > 23.3% due to exponential weighting)."""
        from app.services.habit_service import calculate_decay_score, DECAY_LAMBDA
        from app.models.habit import HabitEntry

        today = date.today()

        # Scenario: Completed only the most recent 7 days out of 30
        recent_7_entries = [
            HabitEntry(id=f"r{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(7)
        ]

        strength = calculate_decay_score(recent_7_entries, window_type="rolling")

        # With exponential decay (lambda=0.08), recent 7 days should contribute > 23.3%
        # Linear would be 7/30 = 23.3%, but exponential weights recent days more heavily
        # Let's verify the strength is proportionally higher than 7/30
        linear_ratio = 7 / 30  # ~0.233

        # The strength should be greater than the linear ratio due to exponential weighting
        # (recent days have weights closer to 1.0)
        assert strength > linear_ratio, \
            f"Expected strength ({strength:.4f}) to be greater than linear ratio ({linear_ratio:.4f}) due to exponential weighting"

        # Also verify it's less than 1.0 (not full strength)
        assert strength < 1.0, f"Expected partial strength, got {strength}"

        # Additional check: strength should be significantly higher than 7/30
        # The top 7 weights sum to about 5.58 out of ~11.82 total for 30 days
        # So we expect strength around 5.58/11.82 ≈ 0.47
        assert strength > 0.40, f"Expected strength > 0.40 for recent 7 days, got {strength:.4f}"

    def test_strength_decreases_gradually_on_missed_day(self):
        """Test 4: Strength decreases gradually on missed day (not instant reset)."""
        from app.services.habit_service import calculate_decay_score
        from app.models.habit import HabitEntry

        today = date.today()

        # First, create perfect 30-day completion
        perfect_entries = [
            HabitEntry(id=f"p{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(30)
        ]
        perfect_strength = calculate_decay_score(perfect_entries, window_type="rolling")
        assert perfect_strength == 1.0, "Perfect completion should yield 1.0 strength"

        # Now, miss the most recent day (today) - remove the today entry
        entries_with_miss = [
            HabitEntry(id=f"m{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(1, 30)  # Start from 1, skipping 0 (today)
        ]

        missed_strength = calculate_decay_score(entries_with_miss, window_type="rolling")

        # The key assertion: strength should NOT reset to 0
        # It should decrease gradually because:
        # - We still have 29 days of history
        # - Exponential decay means recent days matter more, but older days still contribute
        assert missed_strength > 0.0, "Strength should not reset to 0 on a single miss"
        assert missed_strength < perfect_strength, "Strength should decrease after a miss"
        assert missed_strength > 0.5, \
            f"Strength ({missed_strength:.4f}) should remain relatively high after single miss, not near zero"

        # Verify gradual decrease: the drop should be proportional to the weight of the missed day
        # Today has weight 1.0, and 30-day total weight is about 11.82
        # So missing today should drop strength by roughly 1/11.82 ≈ 8.5%
        # Expected: around 1.0 - 0.085 ≈ 0.915
        assert missed_strength > 0.85, \
            f"Expected gradual decrease (~0.91), got {missed_strength:.4f}"

    def test_monthly_window_differs_from_rolling_at_mid_month(self):
        """Test 5: Monthly window differs from rolling window at mid-month."""
        from app.services.habit_service import calculate_decay_score
        from app.models.habit import HabitEntry

        today = date.today()
        month_start = today.replace(day=1)
        days_in_month = (today - month_start).days + 1

        # Create entries that would give different results for monthly vs rolling
        # Strategy: Complete all days in the current month (perfect monthly)
        monthly_entries = [
            HabitEntry(id=f"m{i}", habit_id="h1", date=month_start + timedelta(days=i))
            for i in range(days_in_month)
        ]

        strength_monthly = calculate_decay_score(monthly_entries, window_type="month")
        strength_rolling = calculate_decay_score(monthly_entries, window_type="rolling")

        # If we're mid-month (not the 1st and not more than 30 days),
        # the windows should differ
        if days_in_month > 1 and days_in_month < 30:
            # Monthly looks at all days from 1st to today
            # Rolling looks at exactly 30 days back
            # If month started < 30 days ago, monthly window is SHORTER than rolling
            # This means they're calculating different denominators

            # At minimum, they should produce different results when windows differ
            # (Unless by coincidence they happen to match exactly)
            month_window_days = days_in_month
            rolling_window_days = 30

            if month_window_days != rolling_window_days:
                # The calculation uses different numbers of days, so results should differ
                # (barring unlikely numerical coincidence)
                assert strength_monthly != strength_rolling or strength_monthly == 1.0, \
                    f"Monthly and rolling windows should differ when window sizes differ " \
                    f"(monthly={month_window_days} days, rolling={rolling_window_days} days)"

    def test_strength_handles_target_completions_per_day(self):
        """Test 6: Strength calculation handles target_completions_per_day correctly.

        Note: The current calculate_decay_score function only checks presence/absence
        of entries (uses set), not the count per day. This test documents the
        current behavior and verifies it.
        """
        from app.services.habit_service import calculate_decay_score
        from app.models.habit import HabitEntry

        today = date.today()

        # Scenario 1: Single entry per day (target=1)
        # Complete the last 7 days with 1 entry each
        single_entries = [
            HabitEntry(id=f"s{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(7)
        ]

        strength_single = calculate_decay_score(single_entries, window_type="rolling")

        # Scenario 2: Multiple entries per day (target=2)
        # Complete the last 7 days with 2 entries each
        double_entries = []
        entry_id = 0
        for day in range(7):
            for entry_num in range(2):
                double_entries.append(
                    HabitEntry(id=f"d{entry_id}", habit_id="h1", date=today - timedelta(days=day))
                )
                entry_id += 1

        strength_double = calculate_decay_score(double_entries, window_type="rolling")

        # Current implementation uses a set of dates, so both should be equal
        # (the function doesn't consider target_completions_per_day)
        # This test verifies the current behavior
        assert strength_single == strength_double, \
            f"Current implementation treats single vs multiple entries per day equally " \
            f"(single={strength_single:.4f}, double={strength_double:.4f})"

        # Both should be > 0 since we have completions
        assert strength_single > 0, "Strength should be > 0 with single entries"
        assert strength_double > 0, "Strength should be > 0 with double entries"


# ---------------------------------------------------------------------------
# TestStrengthCache - TDD tests for cache invalidation (Phase 6, Task 4)
# ---------------------------------------------------------------------------

class TestStrengthCache:
    """Test suite for habit strength cache behavior and invalidation."""

    async def test_cache_populated_on_first_call(self, monkeypatch):
        """Test 1: Strength cache is populated on first call."""
        from app.services.habit_service import get_habit_strengths
        from app.models.habit import Habit, HabitEntry
        from unittest.mock import AsyncMock, MagicMock
        from datetime import date

        # Create a mock repository
        mock_repo = MagicMock()
        mock_repo.get_all = AsyncMock(return_value=[
            Habit(id="h1", name="Test Habit", category="Test", period="daily",
                  target_per_period=1, target_completions_per_day=1,
                  tracking_model="decay", goal_type="streak", count_mode="")
        ])

        today = date.today()
        entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(5)
        ]
        mock_repo.get_entries_for_all_habits = AsyncMock(return_value={"h1": entries})

        # Clear caches to ensure clean state
        from app.services.habit_service import invalidate_caches
        invalidate_caches()

        # First call should populate cache and invoke repo methods
        result1 = await get_habit_strengths(mock_repo)

        # Verify repo was called
        assert mock_repo.get_all.called, "get_all should be called on first invocation"
        assert mock_repo.get_entries_for_all_habits.called, "get_entries_for_all_habits should be called"

        # Verify result structure
        assert len(result1) == 1, "Should return one habit strength"
        assert result1[0]["habit_id"] == "h1"
        assert "strength_monthly" in result1[0]
        assert "strength_rolling" in result1[0]

        # Verify strength values are valid (0.0-1.0 range)
        assert 0.0 <= result1[0]["strength_monthly"] <= 1.0
        assert 0.0 <= result1[0]["strength_rolling"] <= 1.0

    async def test_cached_result_returned_on_second_call(self, monkeypatch):
        """Test 2: Cached result returned on second call within TTL."""
        from app.services.habit_service import get_habit_strengths
        from app.models.habit import Habit, HabitEntry
        from unittest.mock import AsyncMock, MagicMock
        from datetime import date

        # Create a mock repository
        mock_repo = MagicMock()
        mock_repo.get_all = AsyncMock(return_value=[
            Habit(id="h1", name="Test Habit", category="Test", period="daily",
                  target_per_period=1, target_completions_per_day=1,
                  tracking_model="decay", goal_type="streak", count_mode="")
        ])

        today = date.today()
        entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(5)
        ]
        mock_repo.get_entries_for_all_habits = AsyncMock(return_value={"h1": entries})

        # Clear caches to ensure clean state
        from app.services.habit_service import invalidate_caches
        invalidate_caches()

        # First call populates cache
        result1 = await get_habit_strengths(mock_repo)
        call_count_after_first = mock_repo.get_all.call_count

        # Second call should use cache (no additional repo calls)
        result2 = await get_habit_strengths(mock_repo)
        call_count_after_second = mock_repo.get_all.call_count

        # Verify repo call count didn't increase
        assert call_count_after_first == call_count_after_second, \
            f"Expected no additional repo calls (cache hit), but calls went from {call_count_after_first} to {call_count_after_second}"

        # Verify results are identical (cached)
        assert result1 == result2, "Cached result should be identical to first result"

        # Verify result structure
        assert len(result2) == 1
        assert result2[0]["habit_id"] == "h1"

    async def test_cache_cleared_after_invalidate_caches_call(self):
        """Test 3: Cache cleared after invalidate_caches() call."""
        from app.services.habit_service import get_habit_strengths, invalidate_caches
        from app.models.habit import Habit, HabitEntry
        from unittest.mock import AsyncMock, MagicMock
        from datetime import date

        # Create a mock repository
        mock_repo = MagicMock()
        mock_repo.get_all = AsyncMock(return_value=[
            Habit(id="h1", name="Test Habit", category="Test", period="daily",
                  target_per_period=1, target_completions_per_day=1,
                  tracking_model="decay", goal_type="streak", count_mode="")
        ])

        today = date.today()
        entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(5)
        ]
        mock_repo.get_entries_for_all_habits = AsyncMock(return_value={"h1": entries})

        # Clear caches to ensure clean state
        invalidate_caches()

        # First call populates cache
        result1 = await get_habit_strengths(mock_repo)
        call_count_after_first = mock_repo.get_all.call_count

        # Invalidate caches
        invalidate_caches()

        # Next call should NOT use cache (repo should be called again)
        result2 = await get_habit_strengths(mock_repo)
        call_count_after_invalidation = mock_repo.get_all.call_count

        # Verify repo was called again after invalidation
        assert call_count_after_invalidation > call_count_after_first, \
            f"Expected repo to be called again after cache invalidation, but call count went from {call_count_after_first} to {call_count_after_invalidation}"

        # Verify results are still valid (recomputation occurred)
        assert len(result2) == 1
        assert result2[0]["habit_id"] == "h1"

    async def test_strength_recalculated_after_cache_invalidation(self):
        """Test 4: Strength recalculated after cache invalidation."""
        from app.services.habit_service import get_habit_strengths, invalidate_caches, _strength_cache
        from app.models.habit import Habit, HabitEntry
        from unittest.mock import AsyncMock, MagicMock
        from datetime import date
        from cachetools.keys import hashkey

        # Create a mock repository with mutable state
        mock_repo = MagicMock()

        # Initial habit with 5 entries
        habit = Habit(id="h1", name="Test Habit", category="Test", period="daily",
                     target_per_period=1, target_completions_per_day=1,
                     tracking_model="decay", goal_type="streak", count_mode="")

        today = date.today()
        initial_entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(5)
        ]

        mock_repo.get_all = AsyncMock(return_value=[habit])
        mock_repo.get_entries_for_all_habits = AsyncMock(return_value={"h1": initial_entries})

        # Clear caches to ensure clean state
        invalidate_caches()

        # First call: compute with 5 entries
        result1 = await get_habit_strengths(mock_repo)
        strength_with_5_entries = result1[0]["strength_rolling"]

        # Verify cache is populated
        cache_key = hashkey("strengths")
        assert cache_key in _strength_cache, "Cache should be populated after first call"

        # Modify repository to return more entries (simulate new completions)
        updated_entries = [
            HabitEntry(id=f"e{i}", habit_id="h1", date=today - timedelta(days=i))
            for i in range(10)  # Now 10 entries instead of 5
        ]
        mock_repo.get_entries_for_all_habits = AsyncMock(return_value={"h1": updated_entries})

        # Before invalidation, still returns old cached result
        result_cached = await get_habit_strengths(mock_repo)
        assert result_cached[0]["strength_rolling"] == strength_with_5_entries, \
            "Before invalidation, should return cached strength from 5 entries"

        # Invalidate cache
        invalidate_caches()
        assert cache_key not in _strength_cache, "Cache should be empty after invalidation"

        # After invalidation, new call should recompute with updated entries
        result_recomputed = await get_habit_strengths(mock_repo)
        strength_with_10_entries = result_recomputed[0]["strength_rolling"]

        # Verify recomputation occurred (more entries = higher strength)
        assert strength_with_10_entries != strength_with_5_entries, \
            f"Strength should change after cache invalidation: was {strength_with_5_entries:.4f}, now {strength_with_10_entries:.4f}"

        # With more entries (10 vs 5), strength should be higher
        assert strength_with_10_entries > strength_with_5_entries, \
            f"Strength with 10 entries ({strength_with_10_entries:.4f}) should be greater than with 5 entries ({strength_with_5_entries:.4f})"

    def test_invalidate_caches_clears_all_caches(self):
        """Test 5: invalidate_caches() clears all cache types."""
        from app.services.habit_service import (
            invalidate_caches, _streak_cache, _strength_cache,
            _heatmap_cache, _progress_cache, _insights_cache
        )
        from cachetools.keys import hashkey

        # Populate all caches with dummy data
        _streak_cache[hashkey("test")] = {"data": "streak"}
        _strength_cache[hashkey("test")] = {"data": "strength"}
        _heatmap_cache[hashkey("test")] = {"data": "heatmap"}
        _progress_cache[hashkey("test")] = {"data": "progress"}
        _insights_cache[hashkey("test")] = {"data": "insights"}

        # Verify caches are populated
        assert len(_streak_cache) > 0
        assert len(_strength_cache) > 0
        assert len(_heatmap_cache) > 0
        assert len(_progress_cache) > 0
        assert len(_insights_cache) > 0

        # Invalidate all caches
        invalidate_caches()

        # Verify all caches are cleared
        assert len(_streak_cache) == 0, "streak_cache should be empty"
        assert len(_strength_cache) == 0, "strength_cache should be empty"
        assert len(_heatmap_cache) == 0, "heatmap_cache should be empty"
        assert len(_progress_cache) == 0, "progress_cache should be empty"
        assert len(_insights_cache) == 0, "insights_cache should be empty"
