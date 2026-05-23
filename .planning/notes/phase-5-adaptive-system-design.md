---
title: "Phase 5 Adaptive System Design"
date: "2026-05-13"
context: "gsd-explore session on Phase 5"
---

## Overview

The adaptive system analyzes user behavior over time to suggest goal adjustments when consistent over-performance is detected.

## Trigger Conditions

**Dual-condition triggers:**

1. **Consistency threshold**: X consecutive weeks/months of meeting or exceeding goal
2. **Percentage threshold**: >100% of goal reached for the period

**Weighting:**
- Recent weeks weighted more heavily than older data
- Consistency (consecutive weeks) valued over raw percentage spikes
- Avoid triggering on single-spike over-achievement

## Edge Cases Handled

1. **Underperforming after spike**: Don't trigger based on inflated baseline from over-achiever period
2. **Seasonal variation**: Weight current month higher, compare to same-period historical data
3. **Partial weeks**: Only count complete weeks in consistency calculation

## Suggestion Logic

- **Passive insight**: "You've hit 150% for 4 weeks — consider increasing goal"
- **Active suggestion**: After consistent threshold, prompt with new goal value pre-filled
- **Confirmation**: Always require user confirmation before changing goal

## Implementation Notes

- Need historical data storage for trend analysis
- Calculate weighted average over rolling window (e.g., last 8 weeks)
- Different thresholds for weekly vs monthly goals
- Store over-achiever stats per habit for analytics