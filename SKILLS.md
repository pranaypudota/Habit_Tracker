# 🛠️ Required Agent Skills (Habit & Expense Tracker)

This document outlines the specific capabilities, domain knowledge, and "skills" the AI Agent must actively utilize and prioritize when working on this repository.

Instead of relying on a bloated set of generic capabilities, the Agent should focus heavily on the following core proficiencies required for the lifecycle of this application.

## 1. 🎨 Advanced UI & Component Engineering
**Context:** React 18, TailwindCSS v4, Zustand.
- **Skillset:** 
  - Crafting highly premium, modern interfaces (glassmorphism, vibrant OKLCH gradients).
  - Implementing responsive micro-animations and fluid hover states without heavy external libraries.
  - Designing modular, hyper-reusable components that perfectly align with a centralized design system.
  - Ensuring optimal route-based code splitting and rendering performance (memoization, lazy loading).

## 2. ⚡ High-Performance Backend Architecture
**Context:** Python 3.11, FastAPI.
- **Skillset:** 
  - Structuring highly efficient, batched data-fetching endpoints to push "data snapshots" and minimize network roundtrips.
  - Maintaining "zero-network overhead" principles by anticipating how the frontend leverages global state (Zustand).
  - Strict input/output validation using Pydantic V2.
  - Building RESTful architecture that scales logically (e.g., separating core metrics, user actions, analytics).

## 3. 🗄️ Local-First Database Operations
**Context:** local SQLite, SQLAlchemy 2.0 (Async).
- **Skillset:**
  - Writing highly optimized, secure asynchronous SQLAlchemy queries.
  - Anticipating and managing database locks or constraints inherent to local SQLite paradigms.
  - Designing non-destructive schemas that support upsert behavior natively.

## 4. 📊 Observability & Debugging
**Context:** Loguru.
- **Skillset:**
  - Enacting clean, structured, and colorized terminal logs.
  - Intercepting and resolving HTTP middleware timings.
  - Diagnosing issues transparently without flooding standard output ("no log spam").

## 5. 📝 Technical Documentation & Planning
**Context:** Markdown (`.planning/`), Architecture Handover.
- **Skillset:**
  - Maintaining architectural consistencies through well-crafted `.md` guidelines (like `agent.md` and roadmap documents).
  - Executing precise codebase refactors systematically (e.g., extracting shared utilities or eliminating duplicate code).
  - Anticipating future complexities (e.g., user exporting data, habit scoring algorithms) and ensuring current implementations are adaptable.

## 6. 🤖 Specialized Agency Agent Repository
**Context:** Global Skills Directory (`C:\Users\HP\.gemini\antigravity\skills\`).
- **Skillset:**
  - **Orchestration:** Deploying `agency-agents-orchestrator` to manage complex multi-agent workflows.
  - **Technical Depth:** Invoking specific architects (Backend, Frontend, UI, Security) for hyper-specialized code reviews and implementations.
  - **Growth & Compliance:** Utilizing `agency-seo-specialist`, `agency-tracking-measurement-specialist`, and `agency-compliance-auditor` to ensure the project meets professional standards beyond core logic.
  - **Market Localization:** Applying `agency-china-market-localization-strategist` or other regional specialists if the local-first application targets specific demographics.

## 🔮 Anticipable Future Skills Requirements
As the codebase evolves past the MVP stage, the Agent must prepare to invoke these advanced capabilities:
- **Data Export Parsing:** Writing performant CSV/JSON exporters directly from SQLite.
- **Data Visualization Logic:** Parsing backend data grids into formats suitable for React-based graphing tools (or creating CSS-native visualizations like GitHub heatmaps).
- **Automated Refactoring:** Running structured AST or comprehensive global replace functions across the `.tsx` and `.py` ecosystem when upgrading patterns en masse.
