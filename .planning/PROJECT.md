# Habit Tracker (Habitos)

A high-performance, local-first habit and expense tracking application.

## Project Vision
To provide a private, blazingly fast, and aesthetically pleasing environment for personal optimization without cloud dependency. Currently personal use, architected for future multi-user scaling.

## Tech Stack
- **Backend:** Python 3.11+ (FastAPI), uvicorn, SQLAlchemy (Async), Pydantic v2, loguru.
- **Acceleration:** Rust (`habit_core`) via PyO3.
- **Frontend:** React 20, TypeScript, Vite 8, TailwindCSS v4, Zustand.
- **Database:** Local SQLite (WAL mode enabled).

## Core Principles
1. **Local-First:** Privacy by design. No cloud syncing.
2. **Zero Bloat:** Minimal dependencies, maximum performance.
3. **High Fidelity:** Premium UI/UX with glassmorphism and micro-animations.
4. **Scalable Architecture:** Built for future multi-user expansion.

## Development Stage
- **Status:** V1.0 complete, V1.1 in progress
- **Quality:** Production-ready core, testing at 10% coverage

## Recent Updates (V1.1 Planning)
- Added flexible goal tracking requirements (streak vs target mode)
- Added habit strength algorithm (gradual decay, not instant reset)
- Added data export (CSV, JSON) for user data ownership
- Added UI/UX enhancement phases (milestone celebrations, micro-animations)
- Performance targets: <200ms dashboard, <100ms check-in