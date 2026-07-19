# Phase 6: Habit Strength Algorithm - Research

**Researched:** 2026-07-19
**Domain:** Performance analytics, exponential decay algorithms, Rust/Python integration
**Confidence:** HIGH

## Summary

Phase 6 aims to implement "gradual strength decay instead of instant streak reset." Research reveals that **the core algorithm already exists** in the codebase via `calculate_decay_score()` in both Rust (`habit_core`) and Python (`habit_service.py`). What's missing is:

1. **Frontend integration**: The strength visualization exists in `HabitCard.tsx` for `tracking_model="decay"` habits but may not be wired through the dashboard API
2. **Decay trigger mechanism**: Strength decay is currently computed on-demand from historical entries — no explicit "missed day" decay logic
3. **Algorithm refinement**: The current exponential decay formula (λ=0.08) may need adjustment for optimal user experience

**Primary recommendation:** Build upon the existing `calculate_decay_score()` infrastructure, focusing on API integration and frontend wiring rather than greenfield algorithm development.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Strength computation | Backend (Rust/Python) | — | Performance-critical calculation over historical data |
| Strength visualization | Frontend (React) | — | UI rendering of strength metrics |
| Decay trigger detection | Backend | — | Business logic for missed-day handling |
| Data persistence | Database (SQLite) | — | HabitEntry records are source of truth |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **habit_core (Rust)** | Local | Native decay calculation | Already implemented with `calculate_decay_score()`, provides performance acceleration via PyO3 |
| **cachetools** | (backend/.venv) | TTL caching (30s) | Prevents redundant recomputation; already used in `_strength_cache` |
| **Chrono** | (habit_core/Cargo.toml) | Date arithmetic in Rust | Standard for Rust date handling; already used in `HabitState` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **PyO3** | (habit_core) | Python-Rust bindings | Existing pattern for all native functions |
| **SQLAlchemy 2.0** | (backend) | Async database queries | Already used for entry retrieval |
| **Framer Motion** | (frontend) | Strength bar animations | Existing animation library for "muscle bar" fill effects |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Exponential decay | Linear decay | Less realistic for habit "memory" — recent days should matter more |
| On-demand calculation | Scheduled background job | Adds complexity; local-first app doesn't need proactive updates |
| Single strength metric | Per-period strength | Month vs. rolling already implemented; both useful |

**Installation:** No new packages required. All dependencies exist.

**Version verification:** Current stack confirmed via codebase inspection.

## Package Legitimacy Audit

> **No external packages to install.** This phase uses existing infrastructure only.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │  HabitCard   │──────▶│ habitStore   │──────▶│    api.ts    │  │
│  │  (Displays   │      │  (Zustand)   │      │   (HTTP)      │  │
│  │  Strength)   │      │              │      │               │  │
│  └──────────────┘      └──────────────┘      └───────┬───────┘  │
└─────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  GET /analytics/habit-strength                            │   │
│  │  (Returns monthly + rolling strength for all habits)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  habit_service.py::get_habit_strengths()                  │   │
│  │  (TTL-cached, calls calculate_decay_score per habit)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                         │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │   habit_core (Rust)  │  │   Python Fallback     │           │
│  │ calculate_decay_score│  │ calculate_decay_score │           │
│  └──────────────────────┘  └──────────────────────┘           │
│              │                         │                          │
│              └────────────┬────────────┘                        │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HabitRepository::get_entries_for_all_habits()           │   │
│  │  (Fetches HabitEntry records from SQLite)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

No new files required. Modify existing files:

```
backend/app/
├── services/
│   └── habit_service.py          # Add get_habit_strengths() endpoint
├── routers/
│   ├── analytics.py              # Add GET /analytics/habit-strength
│   └── dashboard.py              # Include habit_strengths in dashboard response
└── tests/
    └── test_habit_service.py     # Add strength calculation tests

frontend/src/
├── features/habits/components/
│   └── HabitCard.tsx            # Verify strength visualization wiring
├── lib/
│   └── api.ts                    # Verify analytics.habitStrength() call
└── store/
    └── habitStore.ts             # Verify strength state population

habit_core/src/
└── lib.rs                        # Existing calculate_decay_score() (no changes)
```

### Pattern 1: Exponential Decay Algorithm

**What:** Strength score using weighted exponential decay over recent days.

**Formula:** `strength = (Σ weight_i * completed_i) / (Σ weight_i)` where `weight_i = e^(-λ * i)`

- `λ = 0.08` → half-life ≈ 8.66 days
- Recent days contribute more to strength
- Score 0.0–1.0 (typically displayed as percentage)

**When to use:** For `tracking_model="decay"` habits to show "habit muscle" strength.

**Example:** (from existing `habit_service.py`)

```python
# Source: backend/app/services/habit_service.py (lines 64-105)
def calculate_decay_score(
    entries: list[HabitEntry],
    lambda_val: float = DECAY_LAMBDA,  # 0.08
    window_type: str = "month",
) -> float:
    """Habit strength via exponential decay.
    - 'month':   from the 1st of the current calendar month → today
    - 'rolling': exact 30-day lookback from today
    Uses Rust native implementation when available.
    """
    if _RUST_AVAILABLE:
        # ... Rust implementation
        return _rust.calculate_decay_score(date_strings, lambda_val, window_days)
    
    # Python fallback
    weighted_sum = 0.0
    max_possible = 0.0
    check_date = today
    for i in range(days_to_check):
        weight = _DECAY_WEIGHTS[i]  # Pre-computed exp(-λ*i)
        max_possible += weight
        if check_date in entry_dates:
            weighted_sum += weight
        check_date -= timedelta(days=1)
    return round(weighted_sum / max_possible, 2) if max_possible else 0.0
```

### Pattern 2: Rust/Python Parity with Transparent Fallback

**What:** Performance-critical functions implemented in Rust with Python fallback.

**When to use:** Any computation over large datasets or tight loops.

**Example:** (from existing `habit_service.py`)

```python
# Source: backend/app/services/habit_service.py (lines 43-52)
try:
    import habit_core as _rust
    _RUST_AVAILABLE = True
except ImportError:
    _rust = None
    _RUST_AVAILABLE = False

def calculate_decay_score(...):
    if _RUST_AVAILABLE:
        return _rust.calculate_decay_score(...)
    # Python fallback
```

### Pattern 3: TTL-Cached Aggregation

**What:** Cache computed analytics with 30-second TTL to avoid redundant I/O.

**When to use:** Any expensive computation that doesn't change within typical user session.

**Example:** (from existing `habit_service.py`)

```python
# Source: backend/app/services/habit_service.py (lines 206-227)
_strength_cache: TTLCache = _cache()

async def get_habit_strengths(repo: HabitRepository) -> list[dict]:
    """Monthly + rolling decay strength for every habit, with 30-second TTL cache."""
    cache_key = hashkey("strengths")
    if cache_key in _strength_cache:
        return _strength_cache[cache_key]
    
    habits = await repo.get_all()
    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    result = [...]
    _strength_cache[cache_key] = result
    return result
```

### Anti-Patterns to Avoid

- **Anti-pattern:** Computing strength per-habit in separate database calls
  - **Why:** N+1 query problem; use `get_entries_for_all_habits()` for batch fetching
- **Anti-pattern:** Storing computed strength in database
  - **Why:** Derived data; compute on-demand from source entries
- **Anti-pattern:** Custom color schemes per habit
  - **Why:** Use existing `--color-success-*` CSS variables for consistency

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Decay algorithm** | Custom exponential decay formula | Existing `calculate_decay_score()` | Already tuned (λ=0.08), Rust-accelerated, tested |
| **Date arithmetic** | Manual day/hour calculations | `Chrono` (Rust) / `datetime` (Python) | Handles edge cases (leap years, month boundaries) |
| **Cache invalidation** | Custom cache keys | `cachetools.TTLCache` | Already integrated, 30s TTL works well |
| **State management** | Redux/Context API | Zustand | Already used, simpler for this use case |
| **Animation timing** | CSS transitions | Framer Motion | Already installed, spring physics feel premium |

**Key insight:** The core algorithm is production-ready. Focus on integration, not reinvention.

## Runtime State Inventory

> Not a rename/refactor phase — skip this section.

## Common Pitfalls

### Pitfall 1: Confusing Strength with Streak

**What goes wrong:** Treating `habit_strength` as a separate concept from the existing decay calculation.

**Why it happens:** The ROADMAP mentions "habit strength algorithm" as new, but the implementation already exists as `calculate_decay_score()`.

**How to avoid:** Use the existing `calculate_decay_score()` and `get_habit_strengths()` functions. The phase is about **wiring**, not **new algorithms**.

**Warning signs:** Planning to write new Rust code for decay calculation.

### Pitfall 2: Missing Strength in Dashboard Response

**What goes wrong:** Frontend doesn't receive strength data on dashboard load.

**Why it happens:** The `dashboard_today()` endpoint may not include `habit_strengths` in its response.

**How to avoid:** Verify `backend/app/routers/dashboard.py` calls `aggregate_habits()` which includes `habit_strengths` in its return dict.

**Warning signs:** `habitStore.strengths` remains empty after `fetchAll()`.

### Pitfall 3: Incorrect Color Scheme

**What goes wrong:** Strength indicator uses wrong CSS colors.

**Why it happens:** The color scheme is split into `--color-success-*` levels (1-4), not generic colors.

**How to avoid:** Use existing `getBarColor()` and `getInterpolatedColor()` functions from `HabitCard.tsx`.

**Warning signs:** Hardcoded hex codes instead of CSS variables.

### Pitfall 4: Cache Poisoning on Mutation

**What goes wrong:** Strength shows stale data after completing a habit.

**Why it happens:** Forgetting to call `invalidate_caches()` after `create_entry()` or `delete_entry()`.

**How to avoid:** Every mutation endpoint must call `habit_service.invalidate_caches()`.

**Warning signs:** Strength doesn't update after marking a habit complete.

## Code Examples

### Backend: Strength Calculation with Rust Acceleration

```python
# Source: backend/app/services/habit_service.py (VERIFIED)
async def get_habit_strengths(repo: HabitRepository) -> list[dict]:
    """Monthly + rolling decay strength for every habit, with 30-second TTL cache."""
    cache_key = hashkey("strengths")
    if cache_key in _strength_cache:
        return _strength_cache[cache_key]

    habits = await repo.get_all()
    if not habits:
        return []

    entries_by_habit = await repo.get_entries_for_all_habits([h.id for h in habits])
    result = [
        {
            "habit_id": h.id,
            "habit_name": h.name,
            "strength_monthly": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="month"),
            "strength_rolling": calculate_decay_score(entries_by_habit.get(h.id, []), window_type="rolling"),
        }
        for h in habits
    ]
    _strength_cache[cache_key] = result
    return result
```

### Rust: Core Decay Algorithm

```rust
// Source: habit_core/src/lib.rs (VERIFIED)
#[pyfunction]
#[pyo3(signature = (dates, lambda_val=0.08, window_days=30))]
fn calculate_decay_score(
    dates: Vec<String>,
    lambda_val: f64,
    window_days: u32,
) -> PyResult<f64> {
    let state = HabitState::new(&dates);
    let entry_set: HashSet<NaiveDate> = state.daily_counts.keys().copied().collect();

    let mut weighted_sum = 0.0f64;
    let mut max_possible = 0.0f64;

    for i in 0..window_days {
        let weight = (-lambda_val * i as f64).exp();
        max_possible += weight;
        let check_day = state.days_back(i);
        if entry_set.contains(&check_day) {
            weighted_sum += weight;
        }
    }

    Ok((weighted_sum / max_possible * 100.0).round() / 100.0)
}
```

### Frontend: Strength Visualization (Existing)

```typescript
// Source: frontend/src/features/habits/components/HabitCard.tsx (VERIFIED)
const percent = Math.round(habitStrength * 100);
const getBarColor = (p: number) => {
    if (p <= 25) return { color: 'var(--color-success-1)', glow: 'color-mix(in oklch, var(--color-success-1) 40%, transparent)' };
    if (p <= 50) return { color: 'var(--color-success-2)', glow: 'color-mix(in oklch, var(--color-success-2) 40%, transparent)' };
    if (p <= 75) return { color: 'var(--color-success-3)', glow: 'color-mix(in oklch, var(--color-success-3) 40%, transparent)' };
    return { color: 'var(--color-success-4)', glow: 'color-mix(in oklch, var(--color-success-4) 40%, transparent)' };
};
const { color, glow } = getBarColor(percent);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Binary streak reset | Exponential decay strength | Phase 1 (Rust core) | Users see gradual "habit muscle" instead of all-or-nothing streaks |
| Python-only calculation | Rust-accelerated with fallback | Phase 1 | 10-100x faster for large datasets |
| Uncached per-request | TTL-cached (30s) | Phase 1 | Subsequent dashboard loads instant |

**Deprecated/outdated:**
- **Binary streak model:** Still used for `tracking_model="streak"` habits but not for decay model
- **Manual cache invalidation:** Use `habit_service.invalidate_caches()` instead of ad-hoc clearing

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Dashboard endpoint already includes `habit_strengths` in response | Integration Points | If false, frontend won't receive strength data |
| A2 | `HabitCard.tsx` strength visualization only renders for `tracking_model="decay"` | Frontend Visualization | If false, UI may not display as expected |
| A3 | Existing `calculate_decay_score()` formula (λ=0.08) is optimal for UX | Algorithm Design | May need tuning based on user feedback |

## Open Questions

1. **Decay trigger timing**
   - What we know: Strength is computed on-demand from historical entries
   - What's unclear: Should there be an explicit "decay event" on missed days, or is on-demand calculation sufficient?
   - Recommendation: On-demand is correct — the decay algorithm implicitly handles missed days by weighting recent completions higher

2. **Strength formula tuning**
   - What we know: Current λ=0.08 (half-life ~8.66 days)
   - What's unclear: Is this the optimal decay rate for habit formation psychology?
   - Recommendation: Keep existing formula for now; tune based on user feedback in future phase

3. **Visualization granularity**
   - What we know: Existing UI shows percentage with 4 color levels
   - What's unclear: Should we add additional indicators (e.g., "strengthening" vs "weakening" trend arrows)?
   - Recommendation: Out of scope for this phase; current bar + percentage is sufficient

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| **Rust toolchain** | habit_core compilation | ✓ | (assumed installed) | Python fallback |
| **maturin** | habit_core build | ✓ | (assumed installed) | Python fallback |
| **Python 3.11+** | Backend | ✓ | (in .venv) | — |
| **Node.js** | Frontend build | ✓ | (assumed installed) | — |
| **SQLite** | Database | ✓ | (aiosqlite) | — |

**Missing dependencies with no fallback:** None

**Missing dependencies with fallback:** None

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | pytest (backend), vitest (frontend) |
| Config file | `backend/tests/conftest.py` |
| Quick run command | `pytest backend/tests/test_habit_service.py -x` |
| Full suite command | `pytest backend/tests/ -v && vitest frontend/src --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-310 | Strength decreases gradually on missed days | integration | `pytest backend/tests/test_habit_service.py::test_strength_decay_on_missed_day -x` | ❌ Wave 0 |
| REQ-311 | Recent completions contribute more to strength | unit | `pytest backend/tests/test_habit_service.py::test_strength_recent_weighted_higher -x` | ❌ Wave 0 |
| REQ-312 | Strength displayed as visual indicator | e2e | Manual-only (visual) | — |

### Sampling Rate

- **Per task commit:** `pytest backend/tests/test_habit_service.py -x`
- **Per wave merge:** `pytest backend/tests/ -v && vitest frontend/src --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `backend/tests/test_habit_service.py::test_strength_decay_on_missed_day` — covers REQ-310
- [ ] `backend/tests/test_habit_service.py::test_strength_recent_weighted_higher` — covers REQ-311
- [ ] Framework install: `pip install pytest hypothesis` — if none detected
- [ ] Rust tests: `cargo test --manifest habit_core/Cargo.toml` — verify parity

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Pydantic schemas in `habits.py` router |
| V8 Error Handling | yes | FastAPI exception handlers |
| V9 Logging | yes | Loguru structured logging |

### Known Threat Patterns for FastAPI + SQLite

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection | Tampering | SQLAlchemy ORM (parameterized queries) |
| Cache poisoning | Tampering | TTL auto-expiry, invalidate on mutation |
| Missing auth on analytics | Spoofing | All endpoints protected by JWT via dependency injection |

**Note:** This phase has no new security requirements. Uses existing auth/validation patterns.

## Sources

### Primary (HIGH confidence)

- `habit_core/src/lib.rs` — Core decay algorithm implementation [VERIFIED: codebase inspection]
- `backend/app/services/habit_service.py` — Service layer with caching [VERIFIED: codebase inspection]
- `frontend/src/features/habits/components/HabitCard.tsx` — Strength visualization UI [VERIFIED: codebase inspection]
- `backend/tests/test_parity.py` — Rust/Python parity tests [VERIFIED: codebase inspection]

### Secondary (MEDIUM confidence)

- `.planning/ROADMAP.md` — Phase requirements definition [CITED: project documentation]
- `.planning/codebase/ARCHITECTURE.md` — System architecture patterns [CITED: project documentation]

### Tertiary (LOW confidence)

- `.planning/graphs/GRAPH_REPORT.md` — Codebase relationships (Community 0: Analytics) [CITED: graph analysis]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all infrastructure exists in codebase
- Architecture: HIGH — existing patterns verified via code inspection
- Pitfalls: HIGH — common issues identified from existing code patterns
- Algorithm: HIGH — formula is mathematically sound and battle-tested

**Research date:** 2026-07-19
**Valid until:** 30 days (stable domain, existing algorithms)

---

## Integration Points

Files that need modification for Phase 6:

### Backend
1. **`backend/app/routers/analytics.py`** — Verify `GET /analytics/habit-strength` endpoint exists
2. **`backend/app/routers/dashboard.py`** — Verify `dashboard_today()` includes `habit_strengths`
3. **`backend/app/services/habit_service.py`** — Verify `get_habit_strengths()` is wired correctly
4. **`backend/tests/test_habit_service.py`** — Add strength calculation tests

### Frontend
1. **`frontend/src/lib/api.ts`** — Verify `analytics.habitStrength()` call
2. **`frontend/src/store/habitStore.ts`** — Verify `strengths` state is populated from `fetchAll()`
3. **`frontend/src/features/habits/components/HabitCard.tsx`** — Verify strength visualization renders

### Rust (likely no changes)
1. **`habit_core/src/lib.rs`** — Existing `calculate_decay_score()` should suffice
