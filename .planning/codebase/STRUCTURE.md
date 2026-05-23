# Codebase Structure

**Analysis Date:** 2026-05-06

## Directory Layout

```
D:\Habit_Tracker\
├── .planning/           # GSD planning artifacts
├── backend/            # FastAPI Python backend
├── frontend/           # TypeScript/React frontend
├── habit_core/        # Rust native computation core
├── graphify-out/       # Knowledge graph output (generated)
└── .gemini/           # Gemini AI outputs
```

## Directory Purposes

### Backend Directory

**Location:** `backend/`

**Purpose:** Python FastAPI server providing REST API for the application

**Key Files:**
- `app/main.py` - FastAPI application entry point
- `pyproject.toml` - Python dependencies
- `tracker.db` - SQLite database
- `app/core/` - Security, config, logging utilities
- `app/db/` - Database initialization
- `app/models/` - SQLAlchemy ORM models
- `app/schemas/` - Pydantic request/response schemas
- `app/routers/` - HTTP route definitions
- `app/services/` - Business logic layer
- `app/repositories/` - Data access layer

### Frontend Directory

**Location:** `frontend/`

**Purpose:** TypeScript/React single-page application

**Key Files:**
- `index.html` - Entry HTML
- `package.json` - Node dependencies
- `vite.config.ts` - Vite bundler config
- `vitest.config.ts` - Test runner config
- `src/main.tsx` - React entry point
- `src/App.tsx` - Root component

### Habit Core Directory

**Location:** `habit_core/`

**Purpose:** Rust native module for Python extension

**Key Files:**
- `src/lib.rs` - PyO3 module with exported functions
- `Cargo.toml` - Rust dependencies

## Key File Locations

### Entry Points

**Frontend:**
- `frontend/index.html`: HTML entry for browser, loads `main.tsx`
- `frontend/src/main.tsx`: React app bootstrap
- `frontend/src/App.tsx`: Root component with routing and providers

**Backend:**
- `backend/app/main.py`: FastAPI app factory with router registration
- `backend/pyproject.toml`: Python package definition

**Native:**
- `habit_core/src/lib.rs`: Rust module with PyO3 exports
- `habit_core/Cargo.toml`: Rust crate configuration

### Configuration

**Frontend:**
- `frontend/vite.config.ts`: Vite bundler configuration
- `frontend/vitest.config.ts`: Test runner configuration
- `frontend/package.json`: NPM scripts and dependencies

**Backend:**
- `backend/pyproject.toml`: Python dependencies with optional dev group
- `backend/app/core/config.py`: Runtime settings from environment
- `backend/app/core/logger.py`: Logging setup with Loguru

### Core Logic

**Frontend Stores:**
- `frontend/src/store/habitStore.ts`: Habit/completion/dashboard state
- `frontend/src/store/expenseStore.ts`: Expense state
- `frontend/src/store/authStore.ts`: Authentication state

**Frontend Types:**
- `frontend/src/types/index.ts`: All TypeScript interfaces

**Frontend API Client:**
- `frontend/src/lib/api.ts`: Centralized HTTP client

**Backend Services:**
- `backend/app/services/habit_service.py`: Habit business logic
- `backend/app/services/expense_service.py`: Expense business logic
- `backend/app/services/auth_service.py`: Authentication logic

**Backend Routers:**
- `backend/app/routers/habits.py`: Habit REST endpoints
- `backend/app/routers/expenses.py`: Expense REST endpoints
- `backend/app/routers/dashboard.py`: Dashboard aggregation
- `backend/app/routers/analytics.py`: Analytics endpoints
- `backend/app/routers/auth.py`: Authentication endpoints

**Native Compute:**
- `habit_core/src/lib.rs`: `compute_streak`, `calculate_decay_score`, `calculate_streak_levels`

### Testing

**Frontend:**
- `frontend/src/store/__tests__/habitStore.test.ts`: Zustand store tests
- `frontend/src/setupTests.ts`: Test configuration
- `frontend/vitest.config.ts`: Vitest configuration

**Backend:**
- `backend/tests/`: pytest test suite
- `backend/pytest.ini`: pytest configuration

**Native:**
- `habit_core/src/lib.rs` (lines 191-223): Rust unit tests

## Naming Conventions

### Files

**TypeScript:**
- `.ts` - TypeScript source files
- `.tsx` - TypeScript JSX files (React components)
- `.test.ts` - Test files (co-located in `__tests__/` subdirectory)

**Python:**
- `.py` - Python source files
- `conftest.py` - pytest fixtures
- `test_*.py` - Test files in `tests/` directory

**Rust:**
- `.rs` - Rust source files

### Directories

**Frontend:**
- `components/` - Shared UI components
- `features/` - Feature-specific components and hooks
- `pages/` - Route page components
- `store/` - Zustand stores
- `lib/` - Utilities, hooks, API client
- `types/` - TypeScript type definitions

**Backend:**
- `app/core/` - Shared utilities (config, security, logging)
- `app/db/` - Database setup
- `app/models/` - SQLAlchemy models
- `app/routers/` - API routes
- `app/schemas/` - Pydantic schemas
- `app/services/` - Business logic
- `app/repositories/` - Data access

**Backend Router Structure:**
- `routers/auth.py` → authentication endpoints
- `routers/habits.py` → habit CRUD endpoints
- `routers/expenses.py` → expense CRUD endpoints
- `routers/analytics.py` → analytics/read endpoints
- `routers/dashboard.py` → aggregated dashboard data
- `routers/export.py` → data export endpoints
- `routers/subscriptions.py` → subscription management

## Where to Add New Code

### New Feature

**Frontend:**
1. Add types to `src/types/index.ts`
2. Add API methods to `src/lib/api.ts`
3. Add Zustand store in `src/store/` (or extend existing)
4. Create feature components in `src/features/`
5. Add page route in `src/App.tsx`

**Backend:**
1. Add Pydantic schema in `app/schemas/`
2. Add SQLAlchemy model in `app/models/`
3. Add repository in `app/repositories/`
4. Add service in `app/services/`
5. Add router in `app/routers/`
6. Register router in `app/main.py`

### New Component/Module

**New React Component:**
- Feature-specific: `src/features/{feature}/components/`
- Shared: `src/components/`
- UI primitives: `src/components/ui/`

**New UI Primitive:**
- Create in `src/components/ui/` following Radix UI patterns

### Utilities

**Shared Helpers:**
- `frontend/src/lib/utils.ts` - General utilities
- `frontend/src/lib/api.ts` - API client patterns

**Hooks:**
- `frontend/src/lib/hooks/` - Custom React hooks

## Special Directories

### Backend Database

**Location:** `backend/tracker.db`

**Purpose:** SQLite database storing all persistent data

**Generated:** Yes (created on first app run)

**Committed:** No (`.gitignored`)

### Backend Virtual Environment

**Location:** `backend/.venv/`

**Purpose:** Python virtual environment with dependencies

**Generated:** Yes (via uv or venv)

**Committed:** No (`.gitignored`)

### Frontend Node Modules

**Location:** `frontend/node_modules/`

**Purpose:** NPM packages

**Generated:** Yes (via npm install)

**Committed:** No (`.gitignored`)

### Rust Build Output

**Location:** `habit_core/target/`

**Purpose:** Compiled Rust artifacts (.pyd/.so)

**Generated:** Yes (via cargo build)

**Committed:** No (`.gitignored`)

### Knowledge Graph Output

**Location:** `graphify-out/`

**Purpose:** Generated HTML visualization of knowledge graph

**Generated:** Yes

**Committed:** Typically excluded (`.gitignored`)

---

*Structure analysis: 2026-05-06*