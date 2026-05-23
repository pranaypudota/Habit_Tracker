# Phase 03: Initial Testing Framework - Patterns

## Backend Integration Patterns

### Dependency Injection (FastAPI)
Standard pattern for overriding DB dependencies in `conftest.py`:
```python
@pytest.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

### Async Database (aiosqlite)
Pattern for in-memory session cleanup:
```python
test_engine = create_async_engine("sqlite+aiosqlite:///:memory:")
AsyncSessionTesting = async_sessionmaker(test_engine, class_=AsyncSession)
```

## Performance Logic Patterns

### Hybrid Fallback Pattern
Found in `backend/app/services/habit_service.py`:
```python
try:
    from habit_core import compute_streak
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False
```
Tests must verify both paths if possible, or specifically target parity.

## Frontend State Patterns

### Zustand Store Access
Found in `frontend/src/store/habitStore.ts`:
```typescript
export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  fetchHabits: async () => { ... }
}));
```
Vitest pattern:
```typescript
describe('habitStore', () => {
  it('should update state', () => {
    const { fetchHabits } = useHabitStore.getState();
    // execute and assert
  });
});
```

## Relevant Files for Implementation
- `backend/app/main.py`
- `backend/app/db/database.py` (for engine/session pattern)
- `backend/app/services/habit_service.py` (for parity logic)
- `frontend/src/store/habitStore.ts` (for state logic)
