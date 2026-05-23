---
title: "Over-Achiever Feature Spec"
date: "2026-05-13"
context: "gsd-explore session on Phase 5"
---

## Overview

Allow users to mark a habit as done more times than their set goal, with confirmation dialog to prevent accidental over-clicks.

## User Flow

1. User taps "Mark Done" on a target-mode habit
2. If current period count >= goal target, show confirmation: "You've already hit your goal of X times. Mark as done [X+1] times?"
3. User confirms or cancels
4. Over-achievement counted in stats (separate from goal completion)

## UI Requirements

- **Confirmation dialog**: Modal with clear message, confirm/cancel buttons
- **Visual distinction**: Over-achieved completions shown differently (e.g., golden star, special color)
- **Progress display**: "X of Y goal + Z over-achieved"

## Data Model

```python
class HabitCompletion(Base):
    habit_id: int
    completed_at: datetime
    is_over_achievement: bool = False  # True if beyond goal target
```

## Analytics

Track:
- Over-achievement count per habit
- Over-achievement frequency (how often user exceeds goal)
- Consecutive over-achievement periods

Used by Phase 5.3 adaptive system to determine goal bump suggestions.