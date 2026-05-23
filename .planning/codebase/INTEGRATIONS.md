# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

**No external APIs** - This is a local-first application with no cloud dependencies.

**Internal API:**
- FastAPI REST API at `http://localhost:8000/api/v1`
- Frontend communicates with backend via REST endpoints (no GraphQL)
- See `frontend/src/lib/api.ts` for client implementation

## Data Storage

**Database:**
- **SQLite** with `aiosqlite` async driver
  - Connection: `sqlite+aiosqlite:///{BASE_DIR}/tracker.db`
  - Location: `backend/tracker.db`
  - ORM: SQLAlchemy 2.0+ with async sessions

**Database Configuration:**
- WAL mode enabled (journal_mode=WAL)
- Memory-mapped I/O (256MB)
- In-memory temp tables for performance

**File Storage:**
- Local filesystem only - No cloud storage
- Database file: `backend/tracker.db`
- Backup: `backend/tracker.db.bak`

**Caching:**
- `cachetools` 5.3.0+ - In-memory caching library
- Used for caching analytics computations

## Authentication & Identity

**Auth Provider:**
- Custom PIN-based authentication with JWT tokens
- Implementation: `backend/app/core/security.py`
- Token: JWT (HS256 algorithm)

**Authentication Flow:**
1. PIN setup creates hashed password using bcrypt
2. Login returns JWT token (24-hour expiry)
3. Token stored in frontend localStorage
4. Bearer token passed in Authorization header

**Security Details:**
- `bcrypt` 4.1.0+ - PIN hashing
- `pyjwt` 2.8.0+ - JWT encoding/decoding
- SECRET_KEY: Hardcoded (should be env var in production)

## Monitoring & Observability

**Error Tracking:**
- **Loguru** 0.7.3+ - Structured logging
- No external error tracking service (Sentry, etc.)

**Logs:**
- Loguru configured in `backend/app/core/logger.py`
- Console output with structured formatting

## CI/CD & Deployment

**Hosting:**
- Local deployment - No cloud hosting
- Runs on localhost with separate backend and frontend processes

**CI Pipeline:**
- None - Manual deployment

**Build Tools:**
- Maturin for Rust-to-Python extension
- Vite for frontend bundling

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` (optional, defaults to local SQLite)

**Defaults:**
- API: `http://localhost:8000/api/v1`
- Frontend dev: `http://localhost:5173`
- Database: `backend/tracker.db`

**Secrets location:**
- JWT SECRET_KEY in `backend/app/core/security.py` (hardcoded, should move to env)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## External Libraries Summary

| Category | Library | Purpose |
|----------|---------|---------|
| UI Components | Radix UI | Accessible component primitives |
| Animation | Framer Motion | Declarative animations |
| State | Zustand | Lightweight state management |
| Icons | Lucide React | Icon library |
| Database | aiosqlite | Async SQLite access |
| ORM | SQLAlchemy | Database abstraction |
| Auth | PyJWT + bcrypt | Token + password management |
| Validation | Pydantic | Schema validation |
| Logging | Loguru | Structured logging |
| Compute | habit_core (Rust) | Streak/decay calculations |

---

*Integration audit: 2026-05-06*