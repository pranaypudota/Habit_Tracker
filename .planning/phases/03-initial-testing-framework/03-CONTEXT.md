# Phase 03: Initial Testing Framework - Context

**Gathered:** 2026-04-19
**Status:** Decisions Locked
**Source:** Discuss-Phase

<domain>
## Phase Boundary
This phase establishes the foundational testing infrastructure for the Habitos project, focusing on "high-signal" automated validation of the core business logic and API contracts.

### Included:
- Backend integration testing suite (pytest).
- Frontend logic validation (vitest).
- Python/Rust parity verification.
- Local CI scripts (Windows .bat).

### Excluded:
- Full UI/E2E testing (Playwright/Cypress) - deferred to later polish phase.
- Load/Performance benchmarking - deferred.
</domain>

<decisions>
## Implementation Decisions

### Backend Testing
- **Framework:** `pytest` with `pytest-asyncio` and `httpx`.
- **Isolation:** Use `sqlite:///:memory:` for all backend tests to ensure zero-overhead, clean-state execution.
- **Scope:** Focus on `app/routers` (endpoint logic) and `app/repositories` (data integrity).

### High-Signal Parity Logic
- **Tooling:** `hypothesis` (Python property-based testing).
- **Goal:** Every test run MUST generate at least 100 random habit entry patterns and verify that the Rust `habit_core` implementation and the Python `habit_service` implementation produce identical bit-level results for:
  - Streak calculations.
  - Exponential decay scores.
  - Heatmap data structures.

### Frontend Testing
- **Framework:** `vitest`.
- **Scope:** Focus on **Zustand Stores** (`src/store/`) and calculation utilities. Verify that the frontend state correctly processes "Today Snapshot" payloads and handles local completions before background syncing.
- **UI Testing:** Minimal. Use `jsdom` for store logic, but avoid heavy React Testing Library (RTL) component audits unless logic-critical.

### Task Runners
- **Scripts:** Create `test_backend.bat` and `test_frontend.bat` in the root directory.
- **Convention:** Use standard exit codes so these can be used as pre-commit hooks later.
</decisions>

<canonical_refs>
## Canonical References
- `backend/app/services/habit_service.py` — The source of truth for fallback logic.
- `habit_core/src/lib.rs` — The source of truth for accelerated logic.
- `frontend/src/store/habitStore.ts` — The frontend state management core.
</canonical_refs>

<deferred>
## Deferred Ideas
- **E2E Visual Testing:** UI layout and animation audits will be handled manually until the core logic is 100% stable.
- **Mutation Testing:** To be considered in a future hardening phase.
</deferred>

---

*Phase: 03-initial-testing-framework*
*Context gathered: Verified by the agent discretion*
