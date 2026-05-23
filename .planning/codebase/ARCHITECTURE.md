# Architecture

**Analysis Date:** 2026-05-06

## Pattern Overview

**Overall:** Three-tier local-first application with separated frontend (TypeScript/React), backend (Python FastAPI), and native computation core (Rust).

**Key Characteristics:**
- **Local-first storage**: SQLite database stored locally, no cloud dependencies
- **API-first communication**: Frontend communicates with backend exclusively via REST API
- **Native computation acceleration**: Performance-critical streak/decay algorithms implemented in Rust, exposed to Python via PyO3
- **PIN-based authentication**: Local authentication with recovery key support

## Layers

### Frontend (UI Layer)

**Location:** `frontend/src/`

**Purpose:** User interface for managing habits, expenses, and subscriptions

**Contains:**
- React components (pages, features, UI primitives)
- Zustand stores for state management
- API client utilities
- TypeScript type definitions

**Key Dependencies:**
- React 19, React Router DOM 7
- Zustand 5 (state management)
- Radix UI primitives (headless UI components)
- Framer Motion (animations)
- Tailwind CSS 4 (styling)

### Backend (API Layer)

**Location:** `backend/app/`

**Purpose:** RESTful API server exposing business logic endpoints

**Contains:**
- FastAPI application with routers
- SQLAlchemy models and database operations
- Pydantic schemas for request/response validation
- Service layer implementing business logic

**Key Dependencies:**
- FastAPI 0.115+
- SQLAlchemy 2.0+ with async SQLite (aiosqlite)
- Pydantic 2.7+
- JWT (pyjwt) for authentication
- Loguru for logging

### Native Core (Computation Layer)

**Location:** `habit_core/src/lib.rs`

**Purpose:** High-performance computation for habit analytics

**Contains:**
- Streak calculation algorithm
- Decay score algorithm
- Streak heatmap/levels calculation

**Key Dependencies:**
- PyO3 (Python extension bindings)
- Chrono (date handling)

## Data Flow

### Habit Completion Flow

1. **User Action**: User clicks "Complete" button on a habit card
2. **Store Action**: `useHabitStore.completeHabit(id, date)` is invoked
3. **API Call**: Frontend calls `POST /api/v1/habits/{id}/complete` via `api.ts`
4. **Backend Processing**: 
   - `habits_router` receives the request
   - `habit_service.py` creates the completion record
   - Database is updated
5. **Response**: New `HabitEntry` returned to frontend
6. **Store Update**: Zustand store updates local state, triggers re-fetch of heatmap
7. **UI Update**: React re-renders to show updated streak/heatmap

### Dashboard Load Flow

1. **Page Load**: User navigates to Dashboard
2. **Store Action**: `useHabitStore.fetchAll()` is invoked
3. **API Call**: Frontend calls `GET /api/v1/dashboard/today` via `api.ts`
4. **Backend Processing**:
   - `dashboard_router` aggregates data from multiple sources:
     - Fetches all habits
     - Computes current streaks (via `habit_service`)
     - Computes decay scores
     - Fetches today's entries
     - Fetches recent expenses
     - Fetches monthly totals
     - Fetches active subscriptions
5. **Response**: `DashboardToday` object returned with all aggregated data
6. **Store Update**: Zustand store populated with unified state for dashboard

### Native Computation Flow

1. **Analytics Request**: Frontend requests streak heatmap for a habit
2. **Backend Processing**:
   - `analytics_router` receives request
   - `habit_service` fetches all entries for the habit
   - Python calls Rust functions via PyO3:
     - `compute_streak()` - calculates current streak
     - `calculate_decay_score()` - computes decay-based strength
     - `calculate_streak_levels()` - generates heatmap data
3. **Response**: Computation results returned to frontend

## Key Abstractions

### API Client (`frontend/src/lib/api.ts`)

**Purpose:** Centralized HTTP client for all backend communication

**Examples:** `api.ts`

**Pattern:** Factory object with nested methods per resource (`api.habits`, `api.expenses`, etc.)

### Zustand Stores (`frontend/src/store/`)

**Purpose:** Client-side state management with persistence

**Examples:** `habitStore.ts`, `expenseStore.ts`, `authStore.ts`

**Pattern:** Single store per domain with combined state and actions

### Service Layer (`backend/app/services/`)

**Purpose:** Business logic encapsulation

**Examples:** `habit_service.py`, `expense_service.py`, `auth_service.py`

**Pattern:** One service class per domain, handles orchestration between repositories and models

### Repository Layer (`backend/app/repositories/`)

**Purpose:** Data access abstraction

**Examples:** `habit_repository.py`, `expense_repository.py`

**Pattern:** One repository class per entity, abstracts SQLAlchemy operations

### Routers (`backend/app/routers/`)

**Purpose:** HTTP endpoint definitions

**Examples:** `habits.py`, `expenses.py`, `dashboard.py`, `analytics.py`

**Pattern:** One router per domain, defines REST endpoints for that resource

## Entry Points

### Frontend Entry

**Location:** `frontend/src/main.tsx`

**Triggers:** Browser loads `index.html`, Vite bundles and executes `main.tsx`

**Responsibilities:**
- Creates React root
- Renders `App` component with providers
- StrictMode enabled for development

### Frontend App Component

**Location:** `frontend/src/App.tsx`

**Triggers:** Mounted by main.tsx

**Responsibilities:**
- Sets up ThemeProvider (dark/light mode)
- Sets up BrowserRouter (routing)
- Conditionally renders LockScreen or Layout based on auth state
- Lazy loads page components for code splitting

### Backend Entry

**Location:** `backend/app/main.py`

**Triggers:** `uvicorn app.main:app` command

**Responsibilities:**
- Configures FastAPI application
- Sets up CORS middleware
- Includes all routers with authentication dependencies
- Configures lifespan (database initialization)

## Error Handling

**Strategy:** Centralized error handling per layer

**Patterns:**
- **Frontend**: API errors caught in stores, stored in `error` state, displayed via UI
- **Backend**: FastAPI exception handlers, validation errors via Pydantic
- **Native**: PyO3 exceptions mapped to Python errors with custom messages
- **401 Handling**: Custom `auth-unauthorized` event dispatched, triggers lock screen

## Cross-Cutting Concerns

**Logging:**
- Frontend: Console only (development)
- Backend: Loguru with structured logging, request duration tracking

**Validation:**
- Frontend: TypeScript types in `types/index.ts`
- Backend: Pydantic schemas in `schemas/`

**Authentication:**
- PIN-based with bcrypt hashing
- JWT tokens stored in localStorage
- Session timeout with auto-lock

**Persistence:**
- Frontend: Zustand persists to localStorage (auth token, theme)
- Backend: SQLite database in `backend/tracker.db`

---

*Architecture analysis: 2026-05-06*