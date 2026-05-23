# Phase 03: Initial Testing Framework - Research

## Integration Patterns

### Backend: FastAPI + SQLAlchemy 2.0 (Async) + Pytest
To test FastAPI endpoints with an async SQLite in-memory database:
1.  **Session Scope:** Use a `pytest` fixture to create an `AsyncEngine` with `sqlite+aiosqlite:///:memory:`.
2.  **Dependency Override:** Use `app.dependency_overrides` to swap the production DB session with the test session.
3.  **Event Loop:** Configure `pytest-asyncio` with `asyncio_mode = auto` in `pyproject.toml` or `pytest.ini`.

### Parity: Python vs Rust (Hypothesis)
`Hypothesis` is ideal for verifying that two different implementations of the same logic return identical results across a wide range of inputs.
- **Strategy:** Use `st.lists(st.booleans(), min_size=0, max_size=365)` for completion patterns.
- **Assertion:** `assert habit_service.calculate_streak(data) == habit_core.calculate_streak(data)`.
- **Validation:** This handles edge cases like empty lists, 100% completion, 0% completion, and long gaps.

### Frontend: Vitest + Zustand
Testing Zustand stores in Vitest is straightforward as they are plain JavaScript objects with reactive state.
- **Cleanup:** Must use `afterEach(() => { useHabitStore.getState().reset(); })` to ensure test isolation.
- **Environment:** `jsdom` is required for testing hooks or components, but for pure store logic, the default `node` environment is faster.

## Tooling Choices
- **Backend:** `pytest`, `pytest-asyncio`, `httpx` (for `AsyncClient`), `hypothesis`, `alchemy-mock` (optional, but memory DB is more robust).
- **Frontend:** `vitest`, `@testing-library/react-hooks` (if testing hooks directly), `jsdom`.

## Technical Risks
- **Rust Compilation:** Tests must ensure the Rust binary is compiled (`cargo build --release`) before running parity tests.
- **Async Leakage:** In-memory SQLite connections can persist across tests if not properly closed, leading to "Database is locked" or data leakage. Must use `conn.close()` in fixtures.

## Execution Sequence
1.  Setup `pyproject.toml` with test dependencies.
2.  Implement `backend/tests/conftest.py` with async DB fixtures.
3.  Write the Parity suite (High Signal).
4.  Write one sample Router test (REQ-101/REQ-201).
5.  Setup `frontend/vitest.config.ts`.
6.  Write Store logic tests.
