# Project State

## Technical Baseline
- **Build System:** Vite.
- **Backend:** FastAPI with UV package manager.
- **Database:** SQLite with SQLAlchemy Async.
- **Acceleration:** Rust `habit_core` (PyO3).

## Architecture Decisions
- [ADR-001] Local-first data storage strictly.
- [ADR-002] Hybrid logic implementation (Python + Rust) for parity and fallback.
- [ADR-003] Zustand for frontend state management.

## Project History
- **2026-04-19:** Project mapping complete.
- **2026-04-19:** PIN Auth system implemented and verified.
- **2026-04-19:** Phase 3 (Testing Framework) complete. Hybrid parity verified bit-identical.
- **2026-04-19:** Phase 4 (UI Polish) complete. Premium tooltips and escalated animations implemented.
