import os
from pathlib import Path


# Resolve the absolute path to the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    APP_NAME: str = "Habit & Expense Tracker"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{BASE_DIR}/tracker.db"
    )
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "habit-tracker-local-gate-key-change-me-later"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
