# Codebase Concerns

**Analysis Date:** 2026-05-06

## Security Considerations

### Hardcoded JWT Secret

- **Issue:** JWT secret key is hardcoded directly in source code
- **Files:** `backend/app/core/security.py`
- **Risk:** Anyone with repo access can forge tokens. The comment states this should be env var but was never migrated.
- **Current value:** `"habit-tracker-local-gate-key-change-me-later"`
- **Recommendation:** Migrate to environment variable: `JWT_SECRET_KEY` with fallback validation

### Localhost-Only CORS

- **Issue:** CORS origins hardcoded to localhost only
- **Files:** `backend/app/core/config.py`
- **Current setting:** `["http://localhost:5173", "http://127.0.0.1:5173"]`
- **Risk:** App cannot be accessed from non-localhost origins without code change
- **Recommendation:** Add environment variable `CORS_ORIGINS` with configurable list

### Hardcoded API Base URL

- **Issue:** Frontend API endpoint hardcoded in frontend
- **Files:** `frontend/src/lib/api.ts`
- **Current setting:** `const BASE = 'http://localhost:8000/api/v1';`
- **Risk:** No support for different environments (production, staging)
- **Recommendation:** Use environment variable with Vite env prefix

---

## Architectural Weaknesses

### Thin Communities in Knowledge Graph

- **Issue:** Graph analysis revealed 25 communities with only 2 nodes each
- **Files:** Multiple isolated components detected (see `graphify-out/GRAPH_REPORT.md`)
- **Examples:**
  - `frontend/src/features/expenses/hooks/useExpenses.ts` → `useExpenses()` only
  - `frontend/src/features/habits/hooks/useHabits.ts` → `useHabits()` only
  - `frontend/src/store/authStore.ts` → isolated
  - `frontend/src/store/expenseStore.ts` → isolated
  - `frontend/src/store/habitStore.ts` → isolated
- **Risk:** Low cohesion indicates components may be under-coupled or need better barrel exports
- **Recommendation:** Review store organization, add barrel files where appropriate

### Inferred Graph Edges (47%)

- **Issue:** Nearly half of all knowledge graph edges are model-inferred, not directly extracted
- **Files:** `graphify-out/graph.json`
- **Risk:** Inferred relationships may be incorrect and need verification
- **Key nodes with INFERRED edges:**
  - `HabitRepository` → 25 inferred edges
  - `SubscriptionRepository` → 17 inferred edges
  - `ExpenseRepository` → 14 inferred edges
  - `AuthService` → 15 inferred edges
- **Recommendation:** Verify critical relationships (Habit→HabitEntry, AuthService→JWT operations)

### Isolated Node: Settings

- **Issue:** `Settings` from backend has only 1 connection in knowledge graph
- **Files:** `backend/app/core/config.py`
- **Risk:** Configuration module may be under-integrated with the rest of the system
- **Recommendation:** Review how settings are consumed across the codebase

---

## Known Gaps

### No Backup/Restore Implementation

- **Issue:** Graph report shows thin communities for `restore_all.py`, `robust_restore()`, `diag_db.py`
- **Files:** `backend/app/routers/` (restore-related files exist but lightly connected)
- **Risk:** No user-facing backup or export-to-cloud functionality
- **Current workaround:** Manual JSON/CSV export via `/export/` endpoints
- **Recommendation:** Consider adding automated backup scheduling

### Test Coverage Not Enforced

- **Issue:** Testing framework exists but test coverage requirements not enforced
- **Files:** `backend/tests/`, `frontend/src/store/__tests__/`
- **Evidence:** TODO.md notes "0% test coverage as high-priority risk" was identified during mapping but not fully addressed
- **Current state:** Framework initialized (pytest, httpx, vitest) but minimal actual tests
- **Recommendation:** Add coverage target in CI pipeline

### Missing Rate Limiting

- **Issue:** No rate limiting on PIN authentication attempts
- **Files:** `backend/app/routers/auth.py`, `backend/app/services/auth_service.py`
- **Risk:** Brute-force attack against PIN is technically possible (though lockout exists)
- **Current mitigation:** Atomic lockout after failed attempts
- **Recommendation:** Add explicit rate limiting middleware

---

## Tech Debt

### Unverified Rust/Python Parity

- **Issue:** Rust habit_core library (`habit_core/src/lib.rs`) implements streak algorithms but parity with Python not continuously verified
- **Files:** `habit_core/src/lib.rs`, `backend/app/services/habit_service.py`
- **Risk:** Divergence between Rust fast path and Python reference implementation
- **Current state:** Initial property-based tests exist (`test_parity.py`)
- **Recommendation:** Add integration tests that call Rust functions and validate against Python

### Deprecated Endpoint Still Active

- **Issue:** Legacy endpoint `POST /habits/{id}/entries` marked as deprecated but not removed
- **Files:** `backend/app/routers/habits.py` (lines 96-112)
- **Risk:** Technical debt accumulates; needs cleanup in future release
- **Recommendation:** Schedule removal in next milestone

### Hardcoded Frontend Theme Colors

- **Issue:** Theme tokens split across multiple CSS files
- **Files:** `frontend/src/styles/themes/dark.css`, `frontend/src/styles/themes/light.css`, `frontend/src/styles/tokens.css`
- **Risk:** Maintenance burden; changes require editing multiple files
- **Recommendation:** Consolidate to singleCSS custom properties file

---

## Fragile Areas

### SQLite WAL Mode Dependency

- **Issue:** Database configured for WAL mode with specific pragmas
- **Files:** `backend/app/db/database.py`
- **Risk:** WAL mode has specific failure scenarios on network filesystems; not suitable for all deployment targets
- **Current settings:**
  - `PRAGMA journal_mode=WAL`
  - `PRAGMA synchronous=NORMAL`
  - `PRAGMA cache_size=-64000`
  - `PRAGMA mmap_size=268435456`
- **Recommendation:** Document WAL requirements for deployment; consider fallback for non-local storage

### Single-User Auth Model Assumptions

- **Issue:** Auth service assumes single-user context throughout
- **Files:** `backend/app/core/security.py`, `backend/app/services/auth_service.py`
- **Risk:** Cannot scale to multi-user without significant refactor
- **Current design:** PIN-based, local-first only
- **Recommendation:** Document as single-user application; architecture decisions reflect this

---

## Performance Considerations

### No Query Pagination

- **Issue:** List endpoints return all records without pagination
- **Files:** `backend/app/routers/habits.py`, `backend/app/routers/expenses.py`
- **Risk:** Data growth will degrade performance
- **Current workaround:** None; users get full dataset
- **Recommendation:** Add `limit`/`offset` query parameters

### N+1 Query Risk in Dashboard

- **Issue:** Dashboard aggregates multiple repositories without batch optimization
- **Files:** `backend/app/routers/dashboard.py`
- **Risk:** Each data type queried separately
- **Recommendation:** Consider combined query or caching layer for dashboard hits

---

## Test Coverage Gaps

### Backend API Tests

- **What's not tested:** Full API integration tests for auth, expenses, subscriptions
- **Files:** `backend/tests/test_api_habits.py` (only habits tested)
- **Risk:** Auth failures, subscription CRUD, expense operations could break unnoticed
- **Priority:** HIGH

### Frontend Store Tests

- **What's not tested:** Zustand store actions with mocked API
- **Files:** `frontend/src/store/__tests__/habitStore.test.ts`
- **Risk:** State management logic untested
- **Priority:** MEDIUM

### Property-Based Tests

- **What's not tested:** Rust/Python parity across edge cases
- **Files:** `backend/tests/test_parity.py`
- **Status:** Framework exists, limited coverage
- **Priority:** MEDIUM

---

*Concerns audit: 2026-05-06*