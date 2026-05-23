# Roadmap

## Milestone 1: Performance & Security Foundation (V1.0)
> Focus on speed, privacy, and architectural stability.

### Phase 1: High-Performance Engine (Completed)
- [x] Implement Rust `habit_core` extension.
- [x] Transition heavy analytics (decay, streaks) to Rust.
- [x] Implement batch dashboard snapshotting.
- [x] Enable SQLite WAL mode and indexing.

### Phase 2: Security & Authentication (Completed)
- [x] PIN-based JWT authentication layer.
- [x] Glassmorphic LockScreen UI.
- [x] Idle-timeout auto-lock.
- [x] Bcrypt PIN hashing and atomic lockout logic.

### Phase 3: Initial Testing Framework (Completed)
**Goal:** Establish the first line of defense for the codebase with 10% critical path coverage.
- [x] Initialize `pytest` and `httpx` for backend integration tests.
- [x] Initialize `vitest` for frontend logic validation.
- [x] Implement parity tests for Python/Rust logic (Hypothesis).
- [x] CI-ready testing scripts (`test_backend.bat`, `test_frontend.bat`).

### Phase 4: UI Refinement & Polish (Completed)
**Goal:** Enhance the premium feel with final visual touches.
- [x] Visual "shake" animation for failed login attempts.
- [x] Tooltip audit and animation consistency.
- [x] Responsive layout fine-tuning for mobile devices.

---

## Milestone 2: Feature Expansion & Polish (V1.1)
> Focus: New features, performance optimization, UI/UX enhancements.

### Phase 5: Flexible Goal System (with Adaptive Intelligence)
**Goal:** Move beyond binary streaks to flexible tracking modes with intelligent goal adaptation.

**Phase 5.1: Core Goal Modes** (Not Started)
- [ ] Implement weekly/monthly target mode toggle per habit.
- [ ] Add "X of Y days" progress display for target mode.
- [ ] Update habit card UI to show goal type indicator.

**Phase 5.2: Over-Achiever Baseline** (Not Started)
- [ ] Allow users to mark habit as done beyond goal target.
- [ ] Show confirmation dialog when exceeding goal.
- [ ] Track over-achievement stats separately.
- [ ] Visual distinction for over-achieved completions.

**Phase 5.3: Adaptive System** (Not Started)
- [ ] Implement weighted trend analysis (8-week rolling window).
- [ ] Dual-condition trigger (4+ weeks consistency + 120% threshold).
- [ ] Goal bump suggestions with pre-filled values.
- [ ] Passive insight notifications.
- [ ] Handle edge cases (underperforming after spike).

### Phase 6: Habit Strength Algorithm
**Goal:** Gradual strength decay instead of instant streak reset.
- [ ] Implement strength score algorithm in Rust.
- [ ] Add strength visualization (color-coded indicator).
- [ ] Wire up strength decay on missed days.

### Phase 7: Data Export
**Goal:** Give users true data ownership.
- [ ] Add CSV export endpoint for habit data.
- [ ] Add JSON export endpoint for habit data.
- [ ] Create export UI in settings/preferences.

### Phase 8: UI/UX Enhancement
**Goal:** Refine premium feel with micro-animations and polish.
- [ ] Add single-tap check-in with instant feedback animation.
- [ ] Implement milestone celebration (Day 7, 30, 100).
- [ ] Audit and optimize glassmorphism performance.
- [ ] Final mobile responsiveness pass.

### Phase 9: Performance Optimization
**Goal:** Ensure sub-200ms dashboard, sub-100ms interactions.
- [ ] Profile and optimize dashboard load path.
- [ ] Cache dashboard snapshots for instant load.
- [ ] Verify background calc non-blocking.
- [ ] Target: <200ms load, <100ms check-in.

**Depends on:** Phase 1 (Rust engine), Phase 5 (flexible goals for context)

---

## Future: Scalability Prep (V1.2+)
- Multi-user architecture research
- Optional encrypted cloud sync
- Smart notification system