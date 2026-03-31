# 🤖 Agent Instructions (Habit & Expense Tracker)

This file serves as the system rulebook for the AI Agent (Antigravity). It outlines the core principles, architecture constraints, and styling preferences for the Habit & Expense Tracker project. Always adhere to these rules when implementing new features or refactoring code.

## 🎯 Project Core Philosophy
1. **Local-First Baseline:** All data lives in a local SQLite file. Do NOT implement cloud synchronization, authentication, or external SaaS database dependencies.
2. **Zero Bloat:** Keep dependencies to an absolute minimum. Prioritize standard built-in functions over third-party packages whenever possible.
3. **High Performance Flow:** Minimize network chatter between frontend and backend. Use batched operations, optimal endpoint querying, and zero-network overhead navigation where applicable.

---

## 🎨 Frontend Stack & Guidelines
- **Core:** React 18 + TypeScript + Vite.
- **Styling:** TailwindCSS v4 with an emphasis on rich UI.
  - **Aesthetics:** Use vibrant, harmonious OKLCH-based color palettes, smooth dark modes, glassmorphism, and elegant component design. Premium look over MVP simplicity.
  - **Interactivity:** Utilize micro-animations, fluid hover states, and dynamic elements.
- **State Management:** Zustand for global state handling. Synchronize thoroughly with backend.
- **Component Rules:** Modularize UI elements logically inside `src/components`. Maintain strict TypeScript types in `src/types/index.ts`.
- **Performance:** Follow Vite optimization practices. Continue using `lazy()` routing and standard code-splitting techniques.

---

## ⚙️ Backend Stack & Guidelines
- **Core:** Python 3.11+ using FastAPI.
- **Package Management:** `uv` via `pyproject.toml`.
- **Database:** Local SQLite using SQLAlchemy 2.0 (async). Always handle async DB sessions properly.
- **Data Validation:** Pydantic V2 schemas (`app/schemas/`). Maintain strict typing all the way down.
- **Logging:** Use `loguru` exclusively. Ensure console output is visually clean, color-coded, and avoids unnecessary debug spam.
- **Architecture Details:** Keep code strictly organized by business concern (`models`, `schemas`, `services`, `routers`).
  
---

## 🚀 General Workflow Protocol
1. **Analyze First:** Treat every user request with a localized architectural lens. Does this require a schema update? Is there a performance hit?
2. **Documentation & Memory:** Reference `.planning/` directory when dealing with multi-step implementations or performance analysis.
3. **No Placeholders:** Generate fully functioning, robust code. Implement full logic instead of `# TODO: implement this`.
