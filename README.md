# 🧠 Habit & Expense Tracker

A **local-first** personal tracking app for habits, streaks, and monthly expenses. No cloud, no auth, no bloat — just your data, stored locally on your machine.

> Inspired by HabitKit, Loop Habits, and DumbBudget.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS v4 (CSS-first) |
| State | Zustand |
| Backend | Python 3.11+ + FastAPI |
| Database | SQLite (local file) |
| ORM | SQLAlchemy 2 (async) |
| Validation | Pydantic v2 |

---

## Project Structure

```
Habbit tracker/
├── backend/
│   ├── pyproject.toml          # uv-managed dependencies
│   └── app/
│       ├── main.py             # FastAPI app entry
│       ├── core/config.py      # Settings
│       ├── db/database.py      # SQLite async engine
│       ├── models/             # SQLAlchemy ORM models
│       ├── schemas/            # Pydantic request/response models
│       ├── services/           # Business logic (streak calc, analytics)
│       └── routers/            # API endpoints
│
└── frontend/
    └── src/
        ├── types/index.ts      # TypeScript types
        ├── lib/api.ts          # Typed API client
        ├── store/              # Zustand stores
        ├── components/         # UI components
        └── pages/              # Dashboard, Habits, Expenses
```

---

## Running Locally

### Prerequisites

- Python 3.11+ with [`uv`](https://docs.astral.sh/uv/) installed
- Node.js 18+

### 1. Start the Backend

```bash
cd backend

# Install Python dependencies (first time only)
uv sync

# Run the development server
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

> The SQLite database (`tracker.db`) is automatically created in `backend/` on first run.

### 2. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install    # first time only
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## API Overview

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/habits/` | List all habits |
| `POST` | `/api/v1/habits/` | Create a habit |
| `DELETE` | `/api/v1/habits/{id}` | Delete a habit |
| `POST` | `/api/v1/habits/{id}/entries` | Mark habit complete for a date |
| `GET` | `/api/v1/habits/{id}/entries` | Get habit completion history |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/expenses/` | List expenses (filter by `year`/`month`) |
| `POST` | `/api/v1/expenses/` | Add an expense |
| `DELETE` | `/api/v1/expenses/{id}` | Delete an expense |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/analytics/streaks` | Current streaks for all habits |
| `GET` | `/api/v1/analytics/completion-rates` | 30-day completion rates |
| `GET` | `/api/v1/analytics/expenses/monthly` | Monthly expense totals |
| `GET` | `/api/v1/analytics/expenses/by-category` | Category expense breakdown |

---

## Features

- ✅ Create and delete habits with category and frequency
- ✅ Mark habits as complete per day (upsert behavior)
- ✅ Streak calculation (consecutive days from today)
- ✅ 18-week GitHub-style heatmap calendar per habit
- ✅ 30-day completion rate tracking
- ✅ Add and delete expenses with amount, category, date, note
- ✅ Monthly expense filtering + category breakdown bar chart
- ✅ Dashboard with top streaks + monthly spend overview
- ✅ Dark mode UI with OKLCH-based color palette
- ✅ All data saved locally in SQLite — zero external dependencies

---

## Future Ideas (Not in MVP)

- Obsidian integration
- Advanced habit scoring
- Data export (CSV/JSON)
- Habit heatmap by category
- Custom expense budget goals
