# Project Requirements

## Core Infrastructure
- [REQ-001] Data MUST be stored in a local SQLite database.
- [REQ-002] Rust extension MUST be used for performance-critical habit logic.
- [REQ-003] System MUST fall back to Python logic if Rust is unavailable.

## Security & Auth
- [REQ-101] Access MUST be protected by a PIN.
- [REQ-102] Auth tokens MUST be stored and handled securely (JWT).
- [REQ-103] PIN encryption MUST use modern hashing algorithms (Bcrypt).

## Testing & Quality
- [REQ-201] Backend logic MUST have automated integration tests.
- [REQ-202] Frontend UI logic MUST have component validation tests.
- [REQ-203] Rust and Python logic parity MUST be verifiable via property-based testing.

## Feature: Flexible Goal Tracking
- [REQ-301] Habits MUST support both streak mode and weekly/monthly target mode.
- [REQ-302] Users MUST be able to select goal type per habit.
- [REQ-303] Target mode MUST show "X of Y days completed" in current period.

## Feature: Frictionless Check-in
- [REQ-304] Habit completion MUST be achievable with single tap.
- [REQ-305] Completion action MUST provide instant visual feedback (animation).
- [REQ-306] Micro-interactions MUST be smooth (60fps target).

## Feature: Data Export
- [REQ-307] Users MUST be able to export all data as CSV.
- [REQ-308] Users MUST be able to export all data as JSON.
- [REQ-309] Export MUST include all habit history and completions.

## Feature: Habit Strength Algorithm
- [REQ-310] Habit strength score MUST decrease gradually on missed days (not instant reset).
- [REQ-311] Recent completions MUST contribute more to strength than older ones.
- [REQ-312] Strength score MUST be displayed as visual indicator on habit card.

## Feature: Smart Notifications (Future)
- [REQ-313] Notification timing SHOULD adapt based on user's typical completion time.
- [REQ-314] Notifications SHOULD be disabled for users with 7+ day consistent streaks.

## UI/UX Requirements
- [REQ-401] Dashboard MUST show today's habits prominently (at-a-glance).
- [REQ-402] Glassmorphism effects MUST be applied to cards, modals, navigation.
- [REQ-403] Blur effects MUST have hardware acceleration and fallbacks.
- [REQ-404] Milestone celebrations MUST trigger at Day 7, 30, 100.
- [REQ-405] Mobile responsive design MUST work on 320px to 1920px widths.

## Performance Requirements
- [REQ-501] Dashboard load time MUST be under 200ms.
- [REQ-502] Habit check-in interaction MUST complete under 100ms.
- [REQ-503] Background calculations MUST NOT block UI thread.

## Scalability (Future-Proofing)
- [REQ-601] Database schema MUST support multi-user extension.
- [REQ-602] API layer MUST be structured for future REST/GraphQL expansion.