# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**Backend Testing Stack:**
- **Framework:** pytest v9.0.3
- **Async Support:** pytest-asyncio v1.3.0
- **HTTP Client:** httpx v0.28.1 (for TestClient)
- **Property-Based:** hypothesis v6.152.1

**Configuration:** `backend/pytest.ini`
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_functions = test_*
filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning
```

**Pyproject.toml dev Dependencies:**
```toml
[dependency-groups]
dev = [
    "httpx>=0.28.1",
    "hypothesis>=6.152.1",
    "pytest>=9.0.3",
    "pytest-asyncio>=1.3.0",
]
```

## Test File Organization

**Current State:**
- No tests directory exists yet — testing framework is planned but not implemented

**Proposed Structure (based on project architecture):**
```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Shared fixtures
│   ├── test_repositories/
│   │   ├── __init__.py
│   │   ├── test_habit_repository.py
│   │   └── test_expense_repository.py
│   ├── test_services/
│   │   ├── __init__.py
│   │   ├── test_habit_service.py
│   │   └── test_auth_service.py
│   ├── test_routers/
│   │   ├── __init__.py
│   │   ├── test_habits.py
│   │   ├── test_expenses.py
│   │   └── test_auth.py
│   └── test_utils/
│       ├── __init__.py
│       └── test_security.py
```

**Naming Conventions:**
- Test files: `test_*.py`
- Test functions: `test_*`
- Test classes: `Test*`

## Test Types

### Unit Tests

**Repository Tests:**
- Test data access methods in isolation
- Use in-memory SQLite or mocked sessions
- Focus on single method behavior

**Service Tests:**
- Test business logic functions
- Mock repository calls
- Test caching behavior separately

### Integration Tests

**Router Tests:**
- Use FastAPI TestClient
- Test HTTP endpoints with actual request/response
- Include auth dependency bypass for testing

**Database Integration:**
- Test with actual SQLite database
- Use fixture for database setup/teardown

### End-to-End Tests

**Not Yet Implemented:**
- Currently relies on manual runtime testing
- Frontend E2E not planned yet

## Running Tests

**Commands (planned):**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Watch mode (if installed)
pytest --watch

# Specific test file
pytest tests/test_repositories/test_habit_repository.py
```

**Current Test Scripts:**
- `test_backend.bat`: Runs backend tests
- `test_frontend.bat`: Runs frontend tests (if implemented)

## Native Rust Tests

**Location:** `habit_core/src/lib.rs`

**Test Module:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_streak_calculation() {
        // Test implementation
    }

    #[test]
    fn test_validation_errors() {
        // Test implementation
    }
}
```

**Running Rust Tests:**
```bash
cd habit_core
cargo test
```

**Existing Tests in Codebase:**
- `test_streak_calculation()`: Tests consecutive day streak
- `test_decay_score()`: Tests decay score calculation
- `test_validation_errors()`: Tests error handling for invalid inputs

## Fixtures and Factories

**Planned Test Fixtures:**
- Database session fixtures with rollback
- Sample habit data factory
- Authentication token fixtures

**Example Fixture Pattern:**
```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.db.database import Base

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal(engine) as session:
        yield session
        await session.rollback()
```

## Mocking

**What to Mock:**
- External services (not applicable — local-first)
- Time-dependent calculations (use freezegun)
- Cache layers (test cache hits and misses separately)

**What NOT to Mock:**
- Database operations (test actual persistence)
- Auth verification (test real bcrypt hashes)
- Business logic (test with real algorithm implementations)

## Coverage

**Planned Coverage:**
- Target: 80% code coverage
- Focus on service and repository layers first
- Router coverage as priority increases

**Coverage Tools:**
- `pytest-cov` plugin
- `coverage` configuration in pyproject.toml

## Test Patterns Used in Codebase

### Rust Test Patterns (habit_core)

**Direct Function Testing:**
```rust
#[test]
fn test_streak_calculation() {
    let today = Local::now().date_naive();
    let dates = vec![
        today.format("%Y-%m-%d").to_string(),
        today.pred_opt().unwrap().format("%Y-%m-%d").to_string(),
    ];
    
    let result = compute_streak(dates, 1).unwrap();
    assert_eq!(result, 2);
}
```

**Error Testing:**
```rust
#[test]
fn test_validation_errors() {
    let dates = vec!["2026-03-25".to_string()];
    let result = compute_streak(dates, 0); // target=0 is invalid
    assert!(result.is_err());
}
```

### Python Test Patterns (Upcoming)

**Repository Pattern Test:**
```python
@pytest.mark.asyncio
async def test_create_habit():
    repo = HabitRepository(session)
    habit = await repo.create(
        name="Test Habit",
        category="Test",
        period="daily",
    )
    assert habit.name == "Test Habit"
```

**Service Pattern Test:**
```python
@pytest.mark.asyncio
async def test_compute_streak():
    # Create test entries
    entries = [...]
    streak = compute_streak(entries)
    assert streak == 3
```

## Test Philosophy

**Local-First Testing:**
- All data stored locally — tests can use SQLite in-memory
- No external API mocks needed
- No network dependency in tests

**Fast Tests:**
- Use TTL caches to avoid redundant computation
- Use in-memory database for speed
- Run tests in parallel where possible

**Reliable Tests:**
- Each test should be independent
- Clean up test data after each test
- Use database transactions with rollback

---

*Testing analysis: 2026-05-06*