---
title: "Break Phase 5 into sub-phases (5.1, 5.2, 5.3)"
date: "2026-05-13"
priority: "high"
status: "pending"
---

## Task

Restructure PLAN_PHASE_5.md with clear sub-phase breakdown:

- **Phase 5.1**: Core goal modes (streak/target) + period tracking + "X of Y days" display
- **Phase 5.2**: Over-achiever baseline — mark-as-done + confirmation dialog
- **Phase 5.3**: Adaptive system — weighted triggers, goal bump suggestions, trend analysis

## Context

From exploration: Full adaptive system (Option 3) selected as priority.
Users want flexibility in goal tracking beyond binary streaks.
Over-achiever system tracks consistent over-performance and suggests goal adjustments.

## Next Steps

1. Update PLAN_PHASE_5.md with sub-phase structure ✅ Done
2. Define clear deliverables for each sub-phase ✅ Done
3. Update ROADMAP.md to reflect 5.1, 5.2, 5.3 ✅ Done

## Research Completed (Phase 5.1)

### Key Findings
- **Schema**: Add `goal_type` column ("streak" | "weekly" | "monthly")
- **Rust**: Use chrono for week/month bounds (`NaiveDate::from_isoywd_opt`)
- **Progress calc**: Count unique dates where entry_count >= target
- **Validation**: target=0 already handled in existing code
- **Python fallback**: Use existing hot-swap pattern

### Pending Decisions
1. **Incomplete first period**: Show partial target (days since creation) OR wait for first full period?
2. **Weekly target**: "X times per week" OR "X days per week"?

### Files Updated
- `.planning/phases/PLAN_PHASE_5.md` - full restructured plan
- `.planning/ROADMAP.md` - sub-phase breakdown added