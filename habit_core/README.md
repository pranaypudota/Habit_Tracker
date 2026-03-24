# habit_core — Native Rust Extension for HabitOS

This is the Rust compute core for HabitOS. It provides ~10-50× faster
implementations of the CPU-heavy analytics functions using PyO3.

## Functions Exposed

| Python Call | Description |
|---|---|
| `habit_core.compute_streak(dates, target)` | Current consecutive streak |
| `habit_core.calculate_decay_score(dates, lambda_val, window_days)` | Exponential decay habit strength |
| `habit_core.calculate_streak_levels(dates, target, window_days)` | GitHub-style heatmap intensity list |

## Prerequisites

1. Install Rust: https://rustup.rs/ (one time)
2. Install Maturin:

```powershell
d:\Habit_Tracker\backend\.venv\Scripts\python -m pip install maturin
# OR if using uv:
uv tool install maturin
```

## Build for Development

```powershell
cd d:\Habit_Tracker\habit_core
maturin develop --release
```

This compiles the Rust code and installs it directly into your backend venv.
The `habit_service.py` will automatically detect it on next restart.

## Verify It Works

```powershell
d:\Habit_Tracker\backend\.venv\Scripts\python -c "import habit_core; print('Rust loaded:', habit_core.__doc__)"
```

## Rebuild After Changes

Just run `maturin develop --release` again.

## Production Wheel

```powershell
maturin build --release
# Produces: target/wheels/habit_core-0.1.0-cp312-cp312-win_amd64.whl
pip install target/wheels/habit_core-*.whl
```
