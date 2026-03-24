import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.logger import setup_app_logging
from app.db.database import create_db_tables
from app.routers import habits, expenses, analytics, dashboard, export

# Initialize high-quality logging
setup_app_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_tables()
    yield


app = FastAPI(
    title="Habit & Expense Tracker API",
    version="0.2.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 1)

    # Clean the path for logging (strip UUID lengths)
    path = request.url.path
    status_code = response.status_code
    
    # Beautiful colored output using Loguru tags
    # Status code color: 2xx: Green, 4xx: Yellow, 5xx: Red
    status_color = "green" if 200 <= status_code < 400 else "red"
    
    logger.opt(colors=True).info(
        f"<{status_color}>{request.method} {path}</{status_color}> "
        f"-> <{status_color}>{status_code}</{status_color}> ({duration}ms)"
    )
    return response

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(habits.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Habit & Expense Tracker API is running",
        "version": "0.2.0",
        "docs": "/docs",
    }
