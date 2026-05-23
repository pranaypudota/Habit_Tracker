# Graph Report - D:\Habit_Tracker  (2026-04-19)

## Corpus Check
- 74 files · ~25,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 306 nodes · 559 edges · 55 communities detected
- Extraction: 53% EXTRACTED · 47% INFERRED · 0% AMBIGUOUS · INFERRED: 265 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `HabitRepository` - 37 edges
2. `SubscriptionRepository` - 26 edges
3. `ExpenseRepository` - 23 edges
4. `AuthService` - 22 edges
5. `AuthConfig` - 20 edges
6. `HabitEntry` - 20 edges
7. `Habit` - 19 edges
8. `dashboard_today()` - 13 edges
9. `TokenResponse` - 11 edges
10. `login_via_pin()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Presence of a row = habit completed on that date.     The old `completed` boole` --uses--> `Base`  [INFERRED]
  D:\Habit_Tracker\backend\app\models\habit.py → D:\Habit_Tracker\backend\app\db\database.py
- `_repo()` --calls--> `ExpenseRepository`  [INFERRED]
  D:\Habit_Tracker\backend\app\routers\expenses.py → D:\Habit_Tracker\backend\app\repositories\expense_repository.py
- `_repo()` --calls--> `HabitRepository`  [INFERRED]
  D:\Habit_Tracker\backend\app\routers\habits.py → D:\Habit_Tracker\backend\app\repositories\habit_repository.py
- `Issue time-limited JWT with HS256.` --uses--> `AuthService`  [INFERRED]
  D:\Habit_Tracker\backend\app\core\security.py → D:\Habit_Tracker\backend\app\services\auth_service.py
- `Verify and decode JWT.` --uses--> `AuthService`  [INFERRED]
  D:\Habit_Tracker\backend\app\core\security.py → D:\Habit_Tracker\backend\app\services\auth_service.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (36): get_habit_strength(), get_streak_heatmap(), get_streaks(), Analytics router — MVP subset only:   GET /analytics/streaks   GET /analytics/, Current streak for every active habit., Consistency score (decay model) for every habit., GitHub-style historical streak levels for a specific habit., Base (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (27): AuthConfig, change_auth_pin(), get_auth_status(), login_via_pin(), Single-row configuration table for local-first PIN authentication.     id is alw, recover_auth_pin(), AuthService, generate_recovery_key() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (25): monthly_totals(), Total expenses grouped by year-month., get_monthly_totals(), Retrieve monthly totals merging one-off expenses and tracking subscriptions acro, add_expense(), create_habit(), delete_habit(), Calculate total commitments for a month. (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (14): dashboard_today(), Dashboard aggregation endpoint.  GET /dashboard/today Returns all data needed, Aggregated dashboard data — single request for the frontend dashboard page., Expense, ExpenseBase, ExpenseCreate, ExpenseResponse, ExpenseRepository (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (19): AuthStatus, PinChange, PinLogin, PinSetup, PinSetupResponse, Emergency reset using Recovery Key., Initial user PIN configuration., Created status + plaintext recovery key for one-time display. (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (14): HabitBase, HabitCompleteRequest, HabitCreate, HabitEntryResponse, HabitResponse, Request body for POST /habits/{id}/complete, complete_habit(), habit_history() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.35
Nodes (7): calculate_decay_score(), calculate_streak_levels(), compute_streak(), HabitState, test_decay_score(), test_streak_calculation(), test_validation_errors()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (7): create_db_tables(), get_db(), Apply high-performance SQLite settings on every new connection., Create all tables on startup., FastAPI dependency: async DB session., _set_sqlite_pragmas(), lifespan()

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (3): delete_expense(), _repo(), export_all_data()

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (4): InterceptHandler, Configures the entire app to use Loguru for structured, colored output., Default handler from Python logging to Loguru.     Ensures uvicorn and library l, setup_app_logging()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): HabitCard(), toISO()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): Generate a string representation of a random UUID (version 4)., uuid4_str()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): Settings

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **17 isolated node(s):** `Settings`, `Default handler from Python logging to Loguru.     Ensures uvicorn and library l`, `Configures the entire app to use Loguru for structured, colored output.`, `Generate a string representation of a random UUID (version 4).`, `Apply high-performance SQLite settings on every new connection.` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (2 nodes): `diag_db.py`, `check_db()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `final_restore.py`, `robust_restore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `restore_all.py`, `restore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `Settings`, `config.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `Sidebar.tsx`, `handleConfirmLock()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `handleSubmit()`, `AddExpenseModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `useExpenses.ts`, `useExpenses()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `useHabits.ts`, `useHabits()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `req()`, `api.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `useIdleLock.ts`, `useIdleLock()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `Habits.tsx`, `handleAdd()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `audit_db.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `audit_db_bak.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `audit_db_v3.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `migrate.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `StatCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `dropdown-menu.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Modal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `theme-toggle.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `ExpenseRow.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `SubscriptionList.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `Dashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `authStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `expenseStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `habitStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HabitRepository` connect `Community 0` to `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `SubscriptionRepository` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `Base` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 7`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `HabitRepository` (e.g. with `Habit` and `HabitEntry`) actually correct?**
  _`HabitRepository` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `SubscriptionRepository` (e.g. with `Subscription` and `Analytics router — MVP subset only:   GET /analytics/streaks   GET /analytics/`) actually correct?**
  _`SubscriptionRepository` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `ExpenseRepository` (e.g. with `Expense` and `Analytics router — MVP subset only:   GET /analytics/streaks   GET /analytics/`) actually correct?**
  _`ExpenseRepository` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `AuthService` (e.g. with `Issue time-limited JWT with HS256.` and `Verify and decode JWT.`) actually correct?**
  _`AuthService` has 15 INFERRED edges - model-reasoned connections that need verification._