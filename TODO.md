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
- [x] **Feature: PIN-Based Authentication (Core System)**
  - [x] Backend Auth Layer (Bcrypt, JWT, Atomic Lockout).
  - [x] Security-first `get_current_user` dependency guard.
  - [x] Frontend `LockScreen` with Setup and Recovery flows.
  - [x] Global 401 interceptor and persistence via Zustand.
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
- [x] **Feature: Auth Polish & Settings**
  - [x] Change PIN functionality (In Settings)
  - [x] Logout/Lock button in Sidebar
  - [x] Idle-timeout auto-lock mechanism
  - [x] Haptic feedback for failed PIN (Native Browser Haptics)
  - [x] Export Data: JSON Support
  - [x] Export Data: CSV Support
  - [x] Premium Expense Category Dropdown (with icons)
- [x] **UI: Premium Sidebar & Modal**
  - [x] Custom Glassmorphic Confirmation Modal (Framer Motion)
  - [x] Adaptive Footer Layout (Side-by-side / Stacked)
  - [x] Re-calibrated Theme Toggle (64px) and justified icons
  - [x] Spring-based side panel transitions

## Pending Tasks (Priority Order)

### 1. [LOW] UI: Feature Polishing
- [ ] Visual "shake" animation on failed login.
- [ ] Implement custom dropdown for expense category selection (follow habit pattern).
- [ ] Test dropdown in light/dark mode for consistency.
- [ ] Audit all tooltips for uniform delay and animation.
