@echo off
echo ========================================
echo Running Frontend Logic Suite...
echo ========================================
cd frontend
npm run test
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend tests failed!
    exit /b %errorlevel%
)
echo.
echo [SUCCESS] Frontend tests passed.
cd ..
