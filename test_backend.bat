@echo off
echo ========================================
echo Running Backend Integration Suite...
echo ========================================
cd backend
uv run pytest tests/ --color=yes
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend tests failed!
    exit /b %errorlevel%
)
echo.
echo [SUCCESS] Backend tests passed.
cd ..
