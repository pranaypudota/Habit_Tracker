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
- [x] **Infrastructure: Codebase Mapping**
  - [x] Generated structural maps (STACK, ARCH, STRUCTURE, etc.).
  - [x] Identified 0% test coverage as high-priority risk.
- [x] **Infrastructure: Initial Testing Framework**
  - [x] Initialize `pytest` and `httpx` for backend API integration tests.
  - [x] Initialize `vitest` for frontend logic validation.
  - [x] Implement property-based tests for Python/Rust parity (`hypothesis`).
  - [x] Establish `.bat` Runners for whole-stack validation.
- [x] Implement custom dropdown for expense category selection (follow habit pattern).
- [x] Visual "shake" animation on failed login (Escalated to entire card).
- [x] Audit all tooltips for uniform delay and animation (Custom Radix Tooltip System).
- [x] Implement glassmorphic premium tooltips across Sidebar, HabitCard, and Expenses.

- [x] **Feature: Flexible Goal System (Phase 5)**
  - [x] Phase 5.1: Core Goal Modes — 6 goal types (streak/daily/weekly/monthly with total/distinct_days), Rust-backed progress, goal type selector UI, progress bars.
  - [x] Phase 5.2: Over-Achiever Baseline — period-aware detection, confirmation dialog, golden star indicator, "+N over" counter.
  - [x] Phase 5.3: Adaptive System — weighted trend analysis (8-week window), dual-condition triggers, goal bump suggestions, accept/dismiss flow, InsightCard UI.

## Pending Tasks (Priority Order)

### 1. [HIGH] Feature: Habit Strength Algorithm (Phase 6)
- [ ] Gradual strength decay instead of instant streak reset.
- [ ] Color-coded strength indicator on habit cards.
- [ ] Wire up decay on missed days.

### 2. [HIGH] Feature: Data Export (Phase 7)
- [ ] CSV export endpoint for habit data.
- [ ] JSON export endpoint for habit data.
- [ ] Export UI in settings/preferences.

### 3. [MEDIUM] UI/UX Enhancement (Phase 8)
- [ ] Single-tap check-in with instant feedback animation.
- [ ] Milestone celebrations (Day 7, 30, 100).
- [ ] Glassmorphism performance audit and optimization.
- [ ] Final mobile responsiveness pass.

### 4. [MEDIUM] Performance Optimization (Phase 9)
- [ ] Profile and optimize dashboard load path.
- [ ] Cache dashboard snapshots for instant load.
- [ ] Verify background calc is non-blocking.
- [ ] Target: <200ms dashboard, <100ms check-in.
