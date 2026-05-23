# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- **Python** 3.11+ - Backend API and business logic
- **TypeScript** (Frontend) - React-based UI
- **Rust** - Native compute core for performance-critical calculations

**Secondary:**
- **JavaScript** (Frontend) - React 19 with JSX

## Runtime

**Environment:**
- Node.js 24.x (as seen in `@types/node: ^24.10.1`)
- Python 3.11+

**Package Manager:**
- **npm** (Frontend) - v8.0.3 with Vite
- **uv** (Backend) - Modern Python package manager (evidenced by `backend/uv.lock`)
- **Cargo** (Rust core) - Rust 2021 edition

## Frameworks

**Backend:**
- **FastAPI** 0.115.0+ - ASGI web framework
- **SQLAlchemy** 2.0.0+ - ORM with async support

**Frontend:**
- **React** 19.2.0 - UI library
- **Vite** 8.0.3 - Build tool and dev server
- **Tailwind CSS** 4.2.1 - Utility-first CSS framework

**Testing:**
- **Vitest** 4.1.4 - Unit testing for frontend
- **pytest** 9.0.3+ - Backend testing
- **pytest-asyncio** 1.3.0 - Async test support

**Build/Dev:**
- **Maturin** 1.7+ - Python binding builder for Rust
- **Hatchling** - Backend package build system

## Key Dependencies

**Backend Critical:**
- `aiosqlite` 0.20.0+ - Async SQLite driver
- `pydantic` 2.7.0+ - Data validation
- `uvicorn[standard]` 0.32.0+ - ASGI server
- `python-dateutil` 2.9.0+ - Date utilities
- `cachetools` 5.3.0+ - Caching
- `loguru` 0.7.3+ - Logging

**Backend Security:**
- `pyjwt` 2.8.0+ - JWT token handling
- `bcrypt` 4.1.0+ - Password hashing

**Frontend Critical:**
- `zustand` 5.0.11 - State management
- `framer-motion` 12.38.0 - Animation library
- `react-router-dom` 7.13.1 - Client-side routing
- `lucide-react` 1.7.0+ - Icon library

**Frontend UI:**
- `@radix-ui/react-dropdown-menu` 2.1.16+ - Dropdown components
- `@radix-ui/react-tooltip` 1.2.8+ - Tooltip component
- `@radix-ui/react-slot` 1.2.4+ - Slot component pattern
- `class-variance-authority` 0.7.1 - Class variance utility
- `clsx` 2.1.1 - Conditional class names
- `tailwind-merge` 3.5.0 - Tailwind class merging
- `next-themes` 0.4.6 - Theme management

**Rust Core:**
- `pyo3` 0.22 - Python bindings
- `chrono` 0.4 - Date/time handling with serde

## Configuration

**Environment:**
- Local development mode - No external environment variables required
- SQLite local database at `backend/tracker.db`
- CORS origins: `http://localhost:5173`, `http://127.0.0.1:5173`

**Build:**
- `frontend/vite.config.ts` - Vite configuration with React, Tailwind, path aliases
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/eslint.config.js` - Linting rules
- `habit_core/pyproject.toml` - Maturin build configuration for Rust/Python bridge
- `habit_core/Cargo.toml` - Rust dependencies and build profile

## Platform Requirements

**Development:**
- Node.js 24.x+
- Python 3.11+
- Rust toolchain (for building habit_core)
- npm for frontend dependencies

**Production:**
- Local-first deployment - runs on localhost
- SQLite database (file-based, no external DB required)
- Static frontend build via Vite

---

*Stack analysis: 2026-05-06*