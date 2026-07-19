"""
Rust/Python Parity Tests for Strength Calculation

This test suite verifies that the Rust and Python implementations
of habit strength calculation produce identical results within
acceptable floating-point tolerance.

Tests use Hypothesis for property-based testing to generate random
date sequences and verify parity across edge cases.
"""
import math
from datetime import date, timedelta
from hypothesis import given, strategies as st, settings, HealthCheck

import habit_core as _rust

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DECAY_LAMBDA = 0.08
_MAX_DECAY_WINDOW = 31
_DECAY_WEIGHTS = [math.exp(-DECAY_LAMBDA * i) for i in range(_MAX_DECAY_WINDOW)]


# ---------------------------------------------------------------------------
# Reference Python Implementations
# ---------------------------------------------------------------------------

def py_calculate_decay_score(dates: list[date], window_type: str = "month") -> float:
    """Python reference implementation for decay score calculation."""
    today = date.today()
    if window_type == "month":
        month_start = today.replace(day=1)
        days_to_check = (today - month_start).days + 1
        entry_dates = frozenset(d for d in dates if d >= month_start)
    else:  # rolling 30 days
        days_to_check = 30
        cutoff = today - timedelta(days=29)
        entry_dates = frozenset(d for d in dates if d >= cutoff)

    weighted_sum = 0.0
    max_possible = 0.0
    check_date = today
    for i in range(days_to_check):
        weight = _DECAY_WEIGHTS[i] if i < _MAX_DECAY_WINDOW else math.exp(-DECAY_LAMBDA * i)
        max_possible += weight
        if check_date in entry_dates:
            weighted_sum += weight
        check_date -= timedelta(days=1)
    return round(weighted_sum / max_possible, 2) if max_possible else 0.0


# ---------------------------------------------------------------------------
# Hypothesis Strategies
# ---------------------------------------------------------------------------

@st.composite
def habit_history(draw):
    """Generate random habit history with dates over the last 90 days."""
    today = date.today()
    start_date = today - timedelta(days=90)
    # Generate random number of entries
    num_entries = draw(st.integers(min_value=0, max_value=200))
    dates = []
    for _ in range(num_entries):
        days_offset = draw(st.integers(min_value=0, max_value=90))
        dates.append(today - timedelta(days=days_offset))
    return dates


@st.composite
def date_list_in_window(draw, window_type: str = "month"):
    """Generate dates specifically within the test window (month or rolling)."""
    today = date.today()
    if window_type == "month":
        start_date = today.replace(day=1)
        max_days = (today - start_date).days + 1
    else:  # rolling
        start_date = today - timedelta(days=29)
        max_days = 30

    num_entries = draw(st.integers(min_value=0, max_value=max_days * 2))
    dates = []
    for _ in range(num_entries):
        days_offset = draw(st.integers(min_value=0, max_value=max_days - 1))
        test_date = start_date + timedelta(days=days_offset)
        dates.append(test_date)
    return dates


# ---------------------------------------------------------------------------
# Test 1: Python and Rust return identical results for same input
# ---------------------------------------------------------------------------

@given(habit_history())
@settings(max_examples=100, suppress_health_check=list(HealthCheck))
def test_decay_parity_basic(dates):
    """Verify Python and Rust return identical decay scores for same input."""
    date_strings = [d.isoformat() for d in dates]

    # Test month window
    py_month = py_calculate_decay_score(dates, window_type="month")
    today = date.today()
    month_start = today.replace(day=1)
    window_days = (today - month_start).days + 1
    rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, window_days)
    assert abs(py_month - rs_month) < 0.01, \
        f"Month parity failed: Python={py_month}, Rust={rs_month}"

    # Test rolling window
    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)
    assert abs(py_rolling - rs_rolling) < 0.01, \
        f"Rolling parity failed: Python={py_rolling}, Rust={rs_rolling}"


# ---------------------------------------------------------------------------
# Test 2: Parity holds for monthly window across all dates
# ---------------------------------------------------------------------------

@given(date_list_in_window("month"))
@settings(max_examples=100, suppress_health_check=list(HealthCheck))
def test_decay_parity_monthly_window(dates):
    """Verify parity holds for monthly window across all dates in current month."""
    date_strings = [d.isoformat() for d in dates]

    py_month = py_calculate_decay_score(dates, window_type="month")
    today = date.today()
    month_start = today.replace(day=1)
    window_days = (today - month_start).days + 1
    rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, window_days)

    assert abs(py_month - rs_month) < 0.01, \
        f"Monthly window parity failed: Python={py_month}, Rust={rs_month}"


# ---------------------------------------------------------------------------
# Test 3: Parity holds for rolling window across all dates
# ---------------------------------------------------------------------------

@given(date_list_in_window("rolling"))
@settings(max_examples=100, suppress_health_check=list(HealthCheck))
def test_decay_parity_rolling_window(dates):
    """Verify parity holds for rolling 30-day window across all dates."""
    date_strings = [d.isoformat() for d in dates]

    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)

    assert abs(py_rolling - rs_rolling) < 0.01, \
        f"Rolling window parity failed: Python={py_rolling}, Rust={rs_rolling}"


# ---------------------------------------------------------------------------
# Test 4: Edge cases handled identically
# ---------------------------------------------------------------------------

def test_decay_parity_empty_entries():
    """Edge case: Empty entries list should return 0.0 in both implementations."""
    dates = []
    date_strings = []

    # Month window
    py_month = py_calculate_decay_score(dates, window_type="month")
    today = date.today()
    month_start = today.replace(day=1)
    window_days = (today - month_start).days + 1
    rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, window_days)
    assert abs(py_month - rs_month) < 0.01
    assert py_month == 0.0

    # Rolling window
    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)
    assert abs(py_rolling - rs_rolling) < 0.01
    assert py_rolling == 0.0


def test_decay_parity_single_entry():
    """Edge case: Single entry should produce same weighted score in both."""
    today = date.today()
    dates = [today]
    date_strings = [today.isoformat()]

    # Month window - single entry on last day
    py_month = py_calculate_decay_score(dates, window_type="month")
    month_start = today.replace(day=1)
    window_days = (today - month_start).days + 1
    rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, window_days)
    assert abs(py_month - rs_month) < 0.01

    # Rolling window - single entry on last day
    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)
    assert abs(py_rolling - rs_rolling) < 0.01


def test_decay_parity_all_entries():
    """Edge case: All days completed (100% strength) should match exactly."""
    today = date.today()
    month_start = today.replace(day=1)
    window_days = (today - month_start).days + 1

    # Create entries for every day in the month
    dates = [month_start + timedelta(days=i) for i in range(window_days)]
    date_strings = [d.isoformat() for d in dates]

    py_month = py_calculate_decay_score(dates, window_type="month")
    rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, window_days)
    assert abs(py_month - rs_month) < 0.01
    # With all days complete, strength should be 1.0 (100%)
    assert py_month == 1.0
    assert rs_month == 1.0


def test_decay_parity_rolling_all_entries():
    """Edge case: All 30 days completed in rolling window."""
    today = date.today()
    dates = [today - timedelta(days=i) for i in range(30)]
    date_strings = [d.isoformat() for d in dates]

    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)
    assert abs(py_rolling - rs_rolling) < 0.01
    assert py_rolling == 1.0
    assert rs_rolling == 1.0


def test_decay_parity_first_of_month():
    """Edge case: First day of month (window of 1 day)."""
    today = date.today()
    month_start = today.replace(day=1)

    # If today is the first of the month, window is 1 day
    if today == month_start:
        dates = [today]
        date_strings = [today.isoformat()]

        py_month = py_calculate_decay_score(dates, window_type="month")
        rs_month = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 1)
        assert abs(py_month - rs_month) < 0.01
        assert py_month == 1.0


def test_decay_parity_duplicate_dates():
    """Edge case: Multiple entries on same day should count once (set semantics)."""
    today = date.today()
    # Same date entered multiple times
    dates = [today, today, today, today]
    date_strings = [d.isoformat() for d in dates]

    # Both implementations should treat this as a single completed day
    py_rolling = py_calculate_decay_score(dates, window_type="rolling")
    rs_rolling = _rust.calculate_decay_score(date_strings, DECAY_LAMBDA, 30)
    assert abs(py_rolling - rs_rolling) < 0.01
