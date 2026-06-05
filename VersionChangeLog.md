# Version Change Log

This document records the modifications, logical updates, and architecture changes made to the codebase. It follows the "2 W's & 1 H" structure (What, Why, How) using concise terminology.

## 2026-06-05

### Phase 5: Flexible Goal System (Sub-phases 5.1, 5.2, 5.3)

**Phase 5.1 — Core Goal Modes**
- **What:** Extended the habit system from binary streak tracking to six distinct goal modes: streak, daily (total), weekly (total/distinct_days), and monthly (total/distinct_days).
- **Why:** Users needed flexibility beyond "did it or didn't" — multi-completion habits (5 glasses of water), frequency-based goals (gym 3x/week), and distinct-day counting (exercise 4 different days/week).
- **How:** Added `calculate_target_progress` to Rust `habit_core` (with Python fallback); added `goal_type` and `count_mode` columns to `habits` table via migration; updated Pydantic schemas, `HabitCreate`, `HabitUpdate`; added `PATCH /habits/{id}` endpoint; built `calculate_target_progress()` service with 30s TTL cache; integrated `target_progress` into dashboard response; rewrote `AddHabitModal` with Goal Type selector and conditional Count Mode dropdown; added goal type badges and progress bar visualization to `HabitCard`.

**Phase 5.2 — Over-Achiever Baseline**
- **What:** Over-achievement detection on the complete endpoint, confirmation dialog before exceeding goal, and visual distinction for beyond-target completions.
- **Why:** Users who consistently exceed their goals should be acknowledged without friction, and the app should distinguish between "met goal" and "went beyond."
- **How:** Added `is_over_achievement` column to `habit_entries`; updated `POST /habits/{id}/complete` to detect period-boundary over-goal and return `over_achievement_warning`; created `HabitCompleteResponse` schema; added `over_achievement_count` to `TargetProgress`; implemented glassmorphic confirmation dialog in `HabitCard` with golden star indicator, "+N over" counter, and amber flame button state.

**Phase 5.3 — Adaptive System**
- **What:** Weighted trend analysis engine that generates goal bump suggestions when users consistently exceed their targets.
- **Why:** Static goals become irrelevant over time; an adaptive system keeps targets challenging and aligned with actual behavior without manual adjustment.
- **How:** Implemented `_analyze_weekly_trend()` (8-week rolling window, weights 1.0→0.3) and `_analyze_monthly_trend()` (6-month analysis) in `habit_service.py`; dual-condition trigger: 4+ consecutive periods over target AND >120% weighted average; spike-then-drop guard; `GET /analytics/insights` endpoint with 30s TTL cache; accept/dismiss suggestion endpoints (`POST /habits/{id}/suggestions/{type}/{action}`); `InsightCard` component with accept/dismiss actions integrated into Habits page.

### Architecture Audit & Remediation (improve-codebase-architecture)

**What:** Ran a full-stack architecture review across 28 skill modules, identifying 15 findings (8 Strong, 5 Worth exploring, 2 Low). Applied fixes to 14 of 15 findings across backend, frontend, and Rust core.

**Why:** The audit surfaced leakage across seams (business logic in routers, computation duplication), caching defects (no invalidation, stale data), persistence integrity gaps (non-idempotent entry creation), security anti-patterns (hardcoded secrets), type safety erosion (`any` types), and test coverage blind spots.

**How — Fixes applied:**

| Area | Fix |
|---|---|
| Dashboard leakage | `aggregate_habits()` in `habit_service.py` — all habit computation in one service function. Dashboard router reduced from 123 to 80 lines, delegates entirely |
| Cache invalidation | `invalidate_caches()` called on every CRUD mutation (create, update, delete, complete, accept, dismiss). Eliminates 30s stale-data window |
| `accept_suggestion` dead param | Replaced with `invalidate_caches()` — clean cache clearing, accept/dismiss endpoints call directly |
| Response shape consistency | `entries_today` now present in both dashboard return branches (was missing from empty-habits path) |
| Subscription sum duplication | `_sub_total()` helper — single definition, computed once per branch |
| Idempotent `create_entry` | SELECT-then-INSERT guard in repository — entries with same (habit_id, date) return existing row instead of creating duplicates |
| Over-achievement in router | `detect_over_achievement()` extracted to `habit_service.py` — router endpoint shrunk from 55 to 13 lines |
| JWT secret hardcoding | Moved `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` to `Settings` with env-var fallback in `config.py` |
| Rust/Python rounding | Aligned `calculate_target_progress` percentage to 1 decimal place in both Rust and Python |
| `any` types | Replaced with `Expense[]`, `Subscription[]`, `HabitEntry[]`, `unknown` across 4 frontend files |
| `auto-initialize` in Rust release | Moved to `[dev-dependencies]` — follows PyO3 guidance, no production risk |
| Mid-module import | `SubscriptionRepository` import moved to top of `analytics.py` |
| Duplicate cache init | Removed dead `_monthly_cache` reassignment in `expense_service.py` |
| Category colors duplication | Extracted `CATEGORIES` and `CATEGORY_BADGE_COLORS` to shared `constants/categories.ts` — HabitCard and AddHabitModal import from one source |
| Service test coverage | Added `test_habit_service.py` — 5 tests covering `aggregate_habits`, `compute_streak`, `calculate_target_progress`. Test count: 11 (was 6) |

### Project Documentation Refresh
- **What:** Updated `TODO.md` with remaining roadmap (Phases 6-9, pending architecture items). Updated `GEMINI.md` with current stack versions, Rust acceleration, and feature-based component structure.
- **Why:** Previous documentation referenced stale stack versions (React 18, Vite 7) and deprecated component paths (`src/components/`).
- **How:** Corrected versions, added Rust module documentation, updated component organization to `src/features/`.

### Agent Skills Installation
- **What:** Installed 28 Matt Pocock engineering/productivity skills via `npx skills@latest add mattpocock/skills` and ran `setup-matt-pocock-skills` to scaffold repo config.
- **Why:** Provides disciplined workflows for architecture review (`improve-codebase-architecture`), TDD (`tdd`), debugging (`diagnose`), issue triage (`triage`), and grilling sessions (`grill-me`, `grill-with-docs`).
- **How:** Skills installed to `.agents/skills/`; config written to `docs/agents/` (issue tracker, triage labels, domain docs); `## Agent skills` block added to `GEMINI.md`.

---

## 2026-04-19

### Phase 4: UI Refinement & Premium Polish
- **What:** Implemented a unified premium tooltip system (Radix UI + Framer Motion) and escalated critical micro-interactions.
- **Why:** To replace inconsistent native browser tooltips with a high-fidelity glassmorphic solution and enhance the sensory feedback of authentication failures.
- **How:** Built `Tooltip.tsx` primitive using `@radix-ui/react-tooltip`; systematically replaced native `title` attributes in `Sidebar.tsx`, `HabitCard.tsx`, and `ExpenseRow.tsx`; refactored `LockScreen.tsx` to move the failed login "shake" animation from the keypad dots to the entire container card; bumped project version to **v1.1.0**.

### Initial Testing Framework & Parity Verification
- **What:** Implemented a comprehensive testing suite including `pytest` (backend), `vitest` (frontend), and `Hypothesis` for parity verification.
- **Why:** To resolve the 0% test coverage security/infrastructure risk and ensure absolute mathematical consistency between the Rust core and Python fallback logic.
- **How:** Configured `pytest-asyncio` with in-memory SQLite mocks for isolation; implemented property-based tests verifying 100+ random habit scenarios match bit-for-bit between stacks; established `test_backend.bat` and `test_frontend.bat` runners for one-click validation.

### Codebase Mapping and Health Audit
- **What:** Generated a comprehensive codebase map including `STACK.md`, `INTEGRATIONS.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, and `TESTING.md` within `.planning/codebase/`.
- **Why:** To provide standardized architectural documentation for both human and AI coordination, enabling faster onboarding and preventing drift in system design.
- **How:** Analyzed backend (FastAPI/SQLAlchemy/Rust), frontend (React/Vite/Tailwind v4), and native core (`habit_core`) structures; verified the "hot-swap" performance strategy in `habit_service.py`; updated `CONCERNS.md` to flag 0% automated testing coverage as a high-priority risk.

---

## 2026-04-06

### Premium Sidebar & Security Modal integration
- **What:** Replaced the browser's native `confirm()` alert with a custom glassmorphic Modal and optimized the sidebar's footer for high-fidelity responsiveness.
- **Why:** Native dialogs broke the premium aesthetic of the HabitOS experience; the new layout ensures system controls (Theme/Lock) are balanced in both collapsed and expanded states.
- **How:** Constructed `Modal.tsx` and `Button.tsx` using `framer-motion` for spring-based backdrop blurs; implemented adaptive flex-logic in `Sidebar.tsx` (side-by-side when open, stacked when closed); restored 'Zap' brand identity and calibrated `ThemeToggle` to 64px for perfect visual weight.

### Auth Polish & Settings Completion
- **What:** Finalized the implementation of the secure Settings page, multi-format data export (JSON/CSV), and systemic security hardening.
- **Why:** To ensure user data portability, provide a professional management interface, and enhance privacy through passive security measures like idle timeouts.
- **How:** Implemented `useIdleLock` for automatic session termination, integrated native Browser Haptics for authentication feedback, and constructed streaming CSV export endpoints on the backend. Upgraded the Expense UI with an icon-enriched category selection system for superior UX.

### PIN-Based Authentication System (Secure Privacy Gate)
- **What:** Implemented a local-first, recovery-enabled PIN authentication system.
- **Why:** To provide a secure privacy layer for local data without requiring cloud accounts or complex encryption, ensuring one-time setup and brute-force protection.
- **How:** Added `bcrypt` and `pyjwt` to FastAPI; built `AuthService` with atomic lockout logic; created a glassmorphism `LockScreen` in React with `framer-motion` animations and `Zustand` state persistence.

### Auth Cleanup and Optimization
- **What:** Removed unused imports and stale variables from `authStore.ts` and `LockScreen.tsx`.
- **Why:** To reduce bundle size and eliminate potential runtime errors caused by dangling references or unused state hooks.
- **How:** Audited `authStore.ts` for unused state selectors and cleaned up `LockScreen.tsx` imports to ensure only necessary dependencies are loaded.

## 2026-04-04

### Integrated Agency Agents Framework
- **What:** Integrated the 110+ persona Agency Agent Repository into the project's core documentation and orchestration workflow.
- **Why:** To enable the main agent (Antigravity) to leverage hyper-specialized sub-agents for niche tasks (e.g., Security, SEO, UI/UX refinement), ensuring professional-grade implementation across all domains.
- **How:** Updated `GEMINI.md`, `Agent.md`, and `SKILLS.md` to define the orchestration protocol and recognized the global skills directory as a primary resource for specialized intelligence.

### Analytics Backend Upgrade and Subscription Overlaps
- **What:** Refactored `get_monthly_totals` analytics pipeline to structurally merge active and historic subscription rates into global expense totals based on `start_date` and `end_date` overlaps.
- **Why:** To accurately reflect cumulative financial reports, ensuring past quarters and future projections flawlessly match real-world burn rates alongside dynamic manual expenses.
- **How:** Wrote timeline mapping overlap logic in `expense_service.py`, extended `analytics.py` routing dependencies, and formulated `get_all_historical` within `SubscriptionRepository.py`. Added Radix-aware CSS fade-in animations for `SubscriptionList.tsx`.

### Retroactive Subscription Start Date Support
- **What:** Refactored `AddExpenseModal` to expose a "Start Date" picker when the subscription toggle is active, and wired the date through to the backend `start_date` field.
- **Why:** Previously, all subscriptions were silently recorded with today's date regardless of when the user intended the subscription to begin, which broke historical month reporting.
- **How:** Updated `AddExpenseModal.tsx` props and layout to keep the date input visible in subscription mode, updated `Expenses.tsx` handler to pass `start_date` through the API call, fixed TypeScript argument count mismatch.

### Codebase Cleanup and Dead Code Removal
- **What:** Removed 5 stale duplicate component files from `src/components/` (`AddExpenseModal`, `AddHabitModal`, `ExpenseRow`, `HabitCard`, `HeatmapCalendar`), purged dead `select.input` CSS rules (16 lines), and deleted completed planning documents (`PLAN.md`, `frontend-improvments-implementation-guide.md`).
- **Why:** These files were leftover from the feature-based restructuring into `src/features/`. No imports referenced the old paths. The `select.input` CSS became dead after migrating all native selects to Radix UI dropdowns.
- **How:** Verified zero import references via grep, confirmed `tsc --noEmit` passes clean after deletion, removed CSS block from `index.css`.

### Expense Subscriptions UI & Hooks Integration
- **What:** Extracted inline subscription rendering out into `<SubscriptionList />` and updated `<AddExpenseModal />` with a recurrence toggle and fields.
- **Why:** Separates component concerns, avoids UI clutter, and handles the logic disparity between one-off expenses and recurring subscriptions efficiently.
- **How:** Built `SubscriptionList.tsx`, upgraded `AddExpenseModal` to support `onAddSubscription`, and refactored `Expenses.tsx` to utilize them explicitly.

### Zustand Frontend Sync & Dashboard Hookup
- **What:** Synchronized frontend `useHabitStore` and `useExpenseStore` stores to process and render the backend's effective expense and subscription data.
- **Why:** Enforces zero-overhead UI refreshes and maintains accurate totals globally across Dashboard and Expenses.
- **How:** Wired up the `api.dashboard.today()` pipeline variables `monthly_expense_total` and `monthly_committed_burn`, mapped them through Zustand to `StatCard` usage, and ran `tsc` verification safely.

### Custom Radix UI Dropdown Integration
- **What:** Replaced native HTML select elements with custom Radix UI dropdown components for Category and Period fields in habit and expense modals.
- **Why:** Native dropdowns lacked smooth scrolling, proper rounded corners, and theme-aware styling.
- **How:** Integrated `@radix-ui/react-dropdown-menu`, added CSS utility classes for Radix components, set proper z-index (9999) to render above modal overlays.

### Habit Card Border Fix
- **What:** Fixed habit card left border color implementation by properly ordering CSS border properties.
- **Why:** Inline style had invalid `borderColor` property and incorrect property ordering prevented amber/purple borders from displaying.
- **How:** Changed from `borderLeft` only to `border` + `borderLeft` override pattern; amber for streak mode, purple for consistency mode.

### Category Badge Color System
- **What:** Implemented distinct color palette for habit categories, excluding amber and purple reserved for tracking modes.
- **Why:** Categories were using same colors as modes, causing visual confusion.
- **How:** Created 11 badge color classes using OKLCH: cyan (Health), green (Nutrition), red (Fitness), blue (Learning), teal (Mindfulness), indigo (Work), pink (Creative), lavender (Social), emerald (Finance), lime (Outdoor), gray (Other).

### Sidebar Width Expansion
- **What:** Increased collapsed sidebar width from 80px to 120px.
- **Why:** Theme toggle capsule was clipping due to insufficient space in 80px collapsed state.
- **How:** Updated width calculation and normalized padding for both collapsed and expanded states.

### Target Completions Input Redesign
- **What:** Replaced dropdown with increment/decrement counter buttons for target completions per day.
- **Why:** Cleaner UX - users can quickly tap +/- instead of navigating dropdown menu.
- **How:** Added Minus/Plus buttons with Math.max(1) and Math.min(10) constraints to prevent invalid values.

### Dependency Updates
- **What:** Upgraded Vite to v8, installed Radix UI packages, added supporting dependencies.
- **Why:** Security patches and accessibility improvements; custom dropdown requires Radix primitives.
- **How:** `npm install @radix-ui/react-dropdown-menu @radix-ui/react-slot class-variance-authority --legacy-peer-deps`

## 2026-03-31

### Agent Instructions Setup
- **What:** Created `GEMINI.md` and deleted emojis from documentation files.
- **Why:** To centralize technical constraints and establish a strictly professional markdown tone.
- **How:** Future AI operations will read `GEMINI.md` autonomously to enforce correct stack/styles without repeating context.

### Workflow Standardization 
- **What:** Initialized `VersionChangeLog.md` and `TODO.md` workflows.
- **Why:** Tracks architectural shifts and task-based upcoming changes predictably.
- **How:** Enhances the daily upkeep process, ensuring accurate history and preventing task continuity loss.
