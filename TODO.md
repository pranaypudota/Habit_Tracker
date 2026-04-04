# To-Do List

This document tracks upcoming and planned changes for the Habit Tracker project. It is organized strictly by task and feature rather than by day or time. 

## Completed Tasks
- [x] Execute frontend code-splitting and dependency cleanup via Vite 8 upgrade path.
- [x] Integrate custom Radix UI dropdown components for modals.
- [x] Fix habit card border colors for streak/consistency modes.
- [x] Implement category badge color system.
- [x] Expand collapsed sidebar width for theme toggle space.
- [x] Redesign target completions input with +/- counter.
- [x] Finish stripping emojis from secondary `.planning/` markdown files.
- [x] Update Lucide React to v1.7.0 (latest).
- [x] Update TypeScript to v6.0.2 (latest) - verify compatibility.
- [x] **Feature: Expense Subscriptions and Burn Rate**
  - [x] Implement `subscriptions` table (SQLAlchemy).
  - [x] Create `effective_monthly_snapshot` logic.
  - [x] Build `SubscriptionManager` UI components.
  - [x] Integrate "Committed Burn" HUD into Dashboard.
  - [x] Optimize Reporting for overlapping subscriptions.
  - [x] Add retroactive start date support for subscriptions.
- [x] Remove unused `select.input` CSS (no native selects remain).
- [x] Remove stale duplicate components from `src/components/`.
- [x] Remove completed planning docs (`PLAN.md`, `frontend-improvments-implementation-guide.md`).

## Pending Tasks
- [ ] Implement PIN-based Authentication.
- [ ] Add JSON/CSV Data Export functionality for local SQLite database.
- [ ] Implement custom dropdown for expense category selection (follow habit pattern).
- [ ] Test dropdown in light/dark mode for consistency.
