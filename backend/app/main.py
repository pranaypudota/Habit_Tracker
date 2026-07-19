import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import CORS_ORIGINS
from app.core.logger import setup_app_logging
from app.db.database import create_db_tables
from app.core.security import get_current_user
from app.routers import (
    habit_router, expense_router, 
    analytics_router, dashboard_router, auth_router, export_router, export_csv_router, subscription_router
)

# Initialize high-quality logging
setup_app_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_tables()
    yield

app = FastAPI(
    title="Habit & Expense Tracker API",
    version="0.2.2",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 1)

    path = request.url.path
    status_code = response.status_code
    
    status_color = "green" if 200 <= status_code < 400 else "red"
    
    logger.opt(colors=True).info(
        f"<{status_color}>{request.method} {path}</{status_color}> "
        f"-> <{status_color}>{status_code}</{status_color}> ({duration}ms)"
    )
    return response

# ── API Routes ──────────────────────────────────────────────────────────────

# Versioned base for all endpoints
API_V1_STR = "/api/v1"

# All routers define their own sub-prefixes (e.g., /auth, /habits, /expenses)
# so we only apply the versioned base here.

# Auth (Public for Login/Status)
app.include_router(auth_router, prefix=API_V1_STR)

# Protected Features
app.include_router(
    habit_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    expense_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    analytics_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    dashboard_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    export_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    export_csv_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    subscription_router, prefix=API_V1_STR, 
    dependencies=[Depends(get_current_user)]
)

@app.get("/")
async def root():
    return {
        "message": "Habit & Expense Tracker API is running",
        "version": "0.2.2",
        "status": "online"
    }
