# Expense Subscription Implementation Plan (MVP+)

This plan outlines the architecture for integrating "Perpetual Monthly Subscriptions" into the Habit & Expense Tracker, leveraging specialized agency expertise to ensure high performance and local-first reliability.

---

## Architectural Overview (Agency-Backend-Architect)

### 1. Database Schema (`subscriptions` table)
Instead of adding a flag to the existing `expenses` table, we will implement a dedicated `subscriptions` table. This avoids bloating the transactional `expenses` table and allows for "effective date" tracking.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID/INT | Primary Key |
| `category_id` | INT | FK to expense categories |
| `name` | STRING | e.g., "Netflix", "Gym", "Internet" |
| `amount` | DECIMAL | Monthly cost |
| `start_date` | DATE | When the subscription begins |
| `end_date` | DATE (Nullable) | When the subscription was stopped |
| `status` | STRING | `active`, `paused`, `inactive` |
| `billing_day` | INT | Day of the month (1-31) |

### 2. Logic: "Effective Monthly Projection"
The backend will calculate the monthly total by merging:
1. **Realized Expenses:** Sum of one-off entries in the `expenses` table for Month X.
2. **Subscription Impact:** Sum of `amount` from `subscriptions` where:
   - `start_date <= last_day_of_month(X)`
   - `(end_date IS NULL OR end_date >= first_day_of_month(X))`

---

## UI & UX Strategy (Agency-Frontend-Developer & UX-Architect)

### 1. The "Subscription Dashboard" Widget
- **Glassmorphism Card:** A dedicated, sleek UI section showing "Current Active Burn Rate" (Total of all monthly subs).
- **Micro-Animations:** Fluid "Pulse" on the total amount.
- **Quick Controls:** Add/Edit icons directly in the list.

### 2. Expense Input Hardening
- **Recurrence Toggle:** When adding an expense, a toggle for "Is this a monthly subscription?"
- **Conversion Flow:** If toggled, the entry is stored in the `subscriptions` table, and the UI immediately updates the monthly projection.

---

## Edge Cases & Mitigation (Agency-Security-Engineer & Database-Optimizer)

| Case | Result | Mitigation Strategy |
| :--- | :--- | :--- |
| **Mid-Month Price Change** | Historical report accuracy. | On "Edit Price", we close the old subscription (set `end_date`) and create a new one with a new `start_date`. |
| **Cancellation Logic** | Sub still shows for past months. | The "Stop" action only sets the `end_date` to the current date; past records remain valid for reporting. |
| **Duplicate Manual Entry** | Double counting. | Backend will flag any `expense` with the same `name` and `month` as an active `subscription` during entry creation. |
| **Yearly/Quarterly Reports** | Summing logic. | Reports will use an "Interval Overlap" calculation rather than a simple sum of rows. |

---

## Implementation Roadmap

### Phase 1: Persistence Hardening
- [x] **SQLAlchemy Migration:** Add `subscriptions` table.
- [x] **Pydantic Schemas:** Create `SubscriptionCreate`, `SubscriptionRead`, `SubscriptionUpdate`.
- [x] **Service Logic:** Implement `get_effective_expenses(month, year)` that calculates the merged total.

### Phase 2: Interface Integration
- [x] **Frontend Components:** Create `<SubscriptionList />` and `<SubscriptionForm />`.
- [x] **Zustand Sync:** The `useExpenseStore` and `useHabitStore` need to be updated to handle the new merged subscription/expense data flow.
- [x] **Dashboard Integration:** The "Burn Rate" card needs to be integrated into the main dashboard layout using the new backend service logic.

### Phase 3: Reporting & Polish
- [x] **Quarterly/Yearly Logic:** Update the analytics backend to include subscription data in time-series aggregations.
- [x] **Animations:** Pure CSS transitions for adding/removing recurring items.

---

## Potential Issues
- **Performance:** Complex overlap queries could slow down the Dashboard if hundreds of subs exist (unlikely for a personal tracker, but `Indexed` columns will be used).
- **UX Complexity:** Designing a clean way to "resume" a paused subscription without creating a duplicate record.

---

> **Note:** This plan specifically excludes the Habits module to maintain high-performance focus on Financial Observability.
