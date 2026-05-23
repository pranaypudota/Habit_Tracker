# Coding Conventions

**Analysis Date:** 2026-05-06

## Language Guidelines

**Python (Backend):**
- Follows PEP 8 style guide
- snake_case for functions, variables, and file names
- PascalCase for classes and types
- UPPER_CASE for constants

**Rust (habit_core Native Extension):**
- snake_case for functions and variables
- PascalCase for structs and enums
- Uses PyO3 crate for Python interoperability

## Naming Patterns

**Files:**
- Python modules: `snake_case.py` (e.g., `habit_repository.py`)
- Schemas: `snake_case.py` with schema classes (e.g., `schemas/habit.py`)
- Routers: descriptive plural (e.g., `routers/habits.py`)
- Services: `_service.py` suffix (e.g., `auth_service.py`)
- Repositories: `_repository.py` suffix (e.g., `habit_repository.py`)

**Classes:**
- Models: PascalCase (e.g., `class Habit`, `class HabitEntry`)
- Schemas: PascalCase suffix (e.g., `HabitCreate`, `HabitResponse`)
- Services: PascalCase with Service suffix (e.g., `AuthService`)

**Database:**
- Tables: lowercase plural (e.g., `habits`, `habit_entries`)
- Columns: snake_case (e.g., `created_at`, `target_completions_per_day`)

**API Endpoints:**
- URL paths: kebab-case (e.g., `/habits/{habit_id}/complete`)
- Prefixes: plural nouns (e.g., `/habits`, `/expenses`)

## Code Architecture

**Clean Architecture Layers:**

```
backend/app/
├── core/           # Configuration, security, logging, utilities
├── db/             # Database engine, session management
├── models/         # SQLAlchemy ORM models
├── repositories/   # Data access layer (persistence only)
├── schemas/        # Pydantic request/response validation
├── services/       # Business logic, caching, analytics
└── routers/       # FastAPI HTTP endpoints
```

**Layer Responsibilities:**
- `repositories/*_repository.py`: Pure persistence — no business logic
- `services/*_service.py`: Business logic only — delegates to repository
- `routers/*.py`: HTTP handling — delegates to service layer
- `schemas/*.py`: Pydantic models — data validation and serialization
- `models/*.py`: SQLAlchemy models — database schema

**Dependency Injection:**
- FastAPI `Depends()` for database sessions and repository injection
- Repository instance created per-request in router dependency functions

## Import Organization

**Order in Python Files (per PEP 8):**
1. Standard library imports
2. Third-party imports
3. Local application imports

**Local Imports (relative):**
```python
from app.db.database import get_db
from app.schemas.habit import HabitCreate, HabitResponse
from app.repositories.habit_repository import HabitRepository
from app.services.habit_service import get_streaks_for_all
```

## Error Handling

**FastAPI HTTP Exceptions:**
- Use `HTTPException` with status_code and detail
- 404 for not found, 400 for bad request, 401 for unauthorized, 403 for forbidden

```python
from fastapi import HTTPException, status

raise HTTPException(status_code=404, detail="Habit not found")
```

**Repository Return Patterns:**
- `get_by_id`: Returns `Optional[Model]` — `None` if not found
- `create`: Returns created model instance
- `delete`: Returns `bool` — `True` if deleted, `False` if not found

## Async Patterns

**Async/Await Throughout:**
- All database operations use `async def` and `await`
- SQLAlchemy AsyncSession with async_sessionmaker
- FastAPI async route handlers

**Caching:**
- TTL cache via `cachetools.TTLCache` with configurable maxsize and ttl
- Cache keys using `cachetools.keys.hashkey`

```python
from cachetools import TTLCache
from cachetools.keys import hashkey

_cache: TTLCache = TTLCache(maxsize=256, ttl=30)
cache_key = hashkey("streaks")
if cache_key in _cache:
    return _cache[cache_key]
```

## Type Safety

**Python Type Hints:**
- Required for function parameters and return types
- Use `typing.Optional` for nullable types
- Use `list[Type]` and `dict[KeyType, ValueType]` (Python 3.9+)

```python
from typing import Optional

async def get_entries(
    self,
    habit_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[HabitEntry]:
```

**Pydantic v2:**
- Use `BaseModel` for schema validation
- Use `ConfigDict(from_attributes=True)` for ORM compatibility

```python
from pydantic import BaseModel, ConfigDataclass

class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
```

## UUID Patterns

**Primary Keys:**
- Use `uuid.uuid4()` converted to string
- Centralized helper in `app/core/utils.py`:

```python
from app.core.utils import uuid4_str as _uuid

habit = Habit(id=_uuid(), name=name, ...)
```

## Logging

**Framework:** loguru
- Configure in `app/core/logger.py`
- Use `logger.opt(colors=True).info()` for colored output
- Request/response logging via middleware

## Function Design

**Single Responsibility:**
- Each function should do one thing well
- Repository methods: single database operation
- Service methods: single business logic operation

**Named Parameters:**
- Use named parameters with defaults for optional arguments
- Example from `habit_core`:

```rust
#[pyfunction]
#[pyo3(signature = (dates, target=1))]
fn compute_streak(dates: Vec<String>, target: u32) -> PyResult<u32> {
```

## Rust-Specific Patterns (habit_core)

**PyO3 Extension Module:**
- `crate-type = ["cdylib"]` in Cargo.toml for Python extension
- Use `#[pyfunction]` and `#[pymodule]` macros
- Expose functions via `m.add_function(wrap_pyfunction!(fn_name, m)?)?`

**Date Handling:**
- Use `chrono` with serde feature
- Parse strings with `NaiveDate::parse_from_str(d, "%Y-%m-%d")`

**Error Handling:**
- Return `PyResult<T>` for functions that can fail
- Use `PyValueError::new_err("message")` for validation errors

## Documentation

**Docstrings:**
- Use triple-quoted strings for module and class docstrings
- Describe purpose, parameters, and return values
- No emojis — professional tone only

```python
"""
HabitRepository — pure persistence layer.

Business logic (streak, rates, analytics) lives in habit_service.py.
"""
```

## Testing Patterns (Planned)

**Test Framework:** pytest with pytest-asyncio
- Test file naming: `test_*.py` or `*_test.py`
- Test functions: `test_*`
- Async tests supported via `asyncio_mode = auto`

**Test Organization:**
- Tests directory: `backend/tests/` (not yet created)
- Pytest configuration in: `pytest.ini`

**Native Rust Tests:**
- Use `#[cfg(test)]` module
- Use `#[test]` attribute

---

*Convention analysis: 2026-05-06*