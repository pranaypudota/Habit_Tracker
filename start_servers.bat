@echo off
set PROJECT_ROOT=%~dp0
set VENV_PATH=%PROJECT_ROOT%backend\.venv\Scripts\python.exe

echo [⚡] Starting Habitos Infrastructure...

:: 1. Backend: Build Rust Core + Start FastAPI (with Reload Exclusions)
echo [🛠️] Building/Syncing Backend...
wt.exe -d "%PROJECT_ROOT%backend" --title "Habit Tracker Backend" cmd.exe /k "uv sync && set \"VIRTUAL_ENV=%PROJECT_ROOT%backend\.venv\"&& cd ..\habit_core && maturin develop --release && cd ..\backend && .\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000 --reload-exclude \"**/target\" --reload-exclude \"**/.venv\""

:: 2. Frontend: Start Vite Dev Server
echo [🎨] Starting Frontend...
wt.exe -d "%PROJECT_ROOT%frontend" --title "Habit Tracker Frontend" cmd.exe /k "npm run dev"

echo Development servers are initiating in new Windows Terminal tabs.
echo You can close this window now.
