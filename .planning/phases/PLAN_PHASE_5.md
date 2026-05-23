# Plan: Phase 5 - Flexible Goal System (with Adaptive Intelligence)

**Objective:** Implement flexible goal tracking with over-achiever support and adaptive goal suggestions

## Overview

Phase 5 is broken into 3 sub-phases to manage complexity:

- **5.1**: Core goal modes (streak/target) + period tracking
- **5.2**: Over-achiever baseline (mark-as-done + confirmation)
- **5.3**: Adaptive system (weighted triggers, goal suggestions)

---

## Phase 5.1: Core Goal Modes

**Goal:** Move beyond binary streaks to flexible tracking modes

### Deliverables

1. [REQ-301] Habits support both streak mode and weekly/monthly target mode
2. [REQ-302] Users can select goal type per habit
3. [REQ-303] Target mode shows "X of Y days completed" in current period
4. [REQ-304] Goal type indicator on habit cards

### Scope

#### Rust Core (`habit_core/src/lib.rs`)

**New functions needed:**
1. `calculate_target_progress(dates, target_per_period, period_type, current_period_start)` → returns `{completed: u32, target: u32, percentage: f64}`
2. Update `compute_streak` to accept goal_type param (streak vs target behavior)
3. Update `calculate_streak_levels` to show target progress instead of streak levels when in target mode

**Edge cases:**
- Handle period boundary transitions (month start, week start)
- Handle incomplete first period (partial month/week at start)
- Handle target = 0 (invalid, return error)
- Handle dates outside current period (ignore)

#### Backend

**Schema changes** (`backend/app/models/habit.py`):
```python
class Habit(Base):
    # Existing fields...
    goal_type: str = "streak"  # "streak" | "weekly" | "monthly"
    target_per_period: int = 7  # for weekly/monthly mode
```

**New endpoints:**
- `PATCH /habits/{habit_id}` - update goal_type and target_per_period
- Add `goal_type` and `target_per_period` to HabitCreate and HabitResponse schemas

**Service updates:**
- Update `compute_streak` to use goal_type
- Add `calculate_target_progress` wrapper that calls Rust

#### Database Migration

- Add `goal_type` column to habits table (default: "streak")
- Add `target_per_period` column (default: 7)

#### Frontend

- Add goal type selector in habit creation modal
- Show goal type indicator on habit cards (icon/badge)
- Display "X of Y days" progress for target mode

### Success Criteria

- Creating habit allows goal_type selection (streak/weekly/monthly)
- Streak habits show current streak count
- Target habits show "X of Y days" progress with visual progress bar
- Switching goal_type updates behavior immediately
- Period transitions handled correctly (month start, week start)

---

## Phase 5.2: Over-Achiever Baseline

**Goal:** Allow users to mark habits as done beyond their goal, with confirmation

### Deliverables

1. [REQ-305] Users can mark habit as done beyond goal target
2. [REQ-306] Confirmation dialog when exceeding goal
3. [REQ-307] Over-achievement stats tracked separately
4. [REQ-308] Visual distinction for over-achieved completions

### Scope

#### Backend

**Schema changes**:
```python
class HabitCompletion(Base):
    habit_id: int
    completed_at: datetime
    is_over_achievement: bool = False
```

**API updates:**
- POST /habits/{id}/complete - check if exceeding target, return warning in response
- GET /habits/{id}/progress - include over_achievement_count

**Service logic:**
- If current period completions >= target, set is_over_achievement=true
- Track over-achievement count per habit per period

#### Frontend

**Confirmation dialog:**
- Show modal: "You've hit your goal of X times. Mark as done [X+1] times?"
- Clear confirm/cancel buttons
- Remember choice option ("Don't ask again for this habit")

**Display:**
- Progress shows "X of Y goal + Z over-achieved"
- Over-achieved completions shown with golden star/special indicator

### Success Criteria

- Tapping "Mark Done" when goal met shows confirmation dialog
- Over-achieved completions displayed differently from regular completions
- Over-achievement stats available for analytics (Phase 5.3)
- User can dismiss confirmation or proceed

---

## Phase 5.3: Adaptive System

**Goal:** Intelligent goal adjustment suggestions based on consistent over-performance

### Deliverables

1. [REQ-309] Weighted trend analysis over rolling window (8 weeks)
2. [REQ-310] Dual-condition trigger detection (consistency + percentage)
3. [REQ-311] Goal bump suggestions with pre-filled values
4. [REQ-312] Passive insight notifications (non-intrusive)
5. [REQ-313] Edge case handling (underperforming after spike)

### Scope

#### Algorithm Design

**Weighted Distribution:**
```
weight = 1.0 for current week
weight = 0.9 for week -1
weight = 0.8 for week -2
...
weight = 0.3 for week -7 (minimum threshold)

weighted_score = Σ(weekly_percentage * week_weight) / Σ(week_weights)
```

**Trigger Conditions (both must be met):**

1. **Consistency threshold**: 4+ consecutive weeks meeting/exceeding goal
2. **Percentage threshold**: weighted_score > 120%

**Suggestion Levels:**
- 120-150%: Suggest +1 to target
- 150-200%: Suggest +2 to target
- 200%+: Strong suggestion with rationale

#### Edge Cases

1. **Underperforming after spike**: 
   - If previous period was >150% but current is <100%, don't trigger
   - Use rolling average, not absolute threshold

2. **Partial weeks**: 
   - Only count complete weeks in consistency calculation
   - Current week excluded from consistency count

3. **Monthly vs Weekly**:
   - Monthly: check 3+ consecutive months
   - Weekly: check 4+ consecutive weeks

#### Backend

**New endpoints:**
- `GET /habits/{id}/insights` - returns trend analysis and suggestions
- `POST /habits/{id}/suggestions/{suggestion_id}/accept` - apply suggestion
- `POST /habits/{id}/suggestions/{suggestion_id}/dismiss` - dismiss suggestion

**Background job:**
- Daily calculation of over-achievement trends
- Generate suggestions for eligible habits
- Store suggestion history

#### Frontend

**Insight card:**
- Show on dashboard when actionable suggestion available
- Format: "You've exceeded your goal 4 weeks in a row. Consider increasing to X times/week?"
- Accept / Dismiss / "Ask me later" options

**Analytics view (optional):**
- Show historical trend chart
- Display "over-achiever score" per habit

### Success Criteria

- Trigger fires after 4+ consecutive weeks of over-performance
- Weighted average correctly handles spike-then-drop patterns
- User sees actionable suggestion, not passive notification
- Accepting suggestion updates goal immediately
- Dismissing suppresses for 2 weeks before re-showing

---

## Implementation Order

### Phase 5.1 (Core)
1. Rust: Add `calculate_target_progress` function
2. DB: Run migration to add goal_type, target_per_period columns
3. Backend: Update schemas, add PATCH endpoint
4. Backend: Update service logic to handle goal types
5. Frontend: Add goal type selector, progress display
6. Test: Integration tests for goal type switching

### Phase 5.2 (Over-Achiever)
1. Backend: Add is_over_achievement field to completions
2. Backend: Update complete endpoint to detect over-goal
3. Backend: Add over_achievement_count to progress response
4. Frontend: Add confirmation dialog component
5. Frontend: Update progress display with over-achieved count
6. Test: Integration tests for over-achiever flow

### Phase 5.3 (Adaptive)
1. Backend: Implement weighted trend calculation
2. Backend: Add suggestion generation logic
3. Backend: Add insights endpoint
4. Backend: Set up daily background job for trend analysis
5. Frontend: Add insight card component
6. Frontend: Add accept/dismiss actions
7. Test: Integration tests for suggestion triggers

## Key Decisions

- **Migration strategy**: Non-breaking - default "streak" for existing habits
- **Period calculation**: Use calendar periods (Mon-Sun for weekly, 1st-last for monthly)
- **Progress display**: Backend returns raw numbers, frontend formats "X of Y days"
- **Suggestion timing**: Only show when user is active in app, not push notification
- **Over-achiever confirmation**: One-time dismiss per habit or remember choice

## Dependencies

- Phase 1 (Rust engine) - must be working
- Phase 4 (UI refinement) - frontend will consume new API

## Success Criteria (Full Phase 5)

- Users can choose streak, weekly, or monthly goal type per habit
- Target mode shows clear "X of Y days" progress
- Users can mark beyond goal with confirmation
- Over-achievement tracked and displayed separately
- Consistent over-performers receive goal increase suggestions
- Weighted algorithm correctly handles edge cases
- User experience remains simple despite complex backend