import os
from pathlib import Path

# Resolve the absolute path to the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ponytail: Flattened from Settings class - no methods, just static values
APP_NAME = "Habit & Expense Tracker"
API_V1_STR = "/api/v1"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/tracker.db")
JWT_SECRET = os.getenv("JWT_SECRET", "habit-tracker-local-gate-key-change-me-later")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 1440
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
