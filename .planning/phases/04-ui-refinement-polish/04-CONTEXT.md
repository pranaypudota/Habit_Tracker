# Phase 4 Context: UI Refinement & Polish

## Decisions
- **Shake Animation:** The shake effect on failed PIN entries will target the main card container instead of just the indicators. It should feel haptic and high-stiffness.
- **Tooltip System:** A custom, premium tooltip component will be implemented to replace all native `title` attributes. 
    - Implementation: Radix UI `Tooltip` primitive combined with `framer-motion`.
    - Aesthetic: Glassmorphism, OKLCH primary/surface colors, 400ms entry delay.
- **Responsive Scope:** Major responsive grid refactoring is deferred (per user preference for future mobile-native development). Focus remains on desktop/large-tablet "Premium" feel.

## Constraints
- Do NOT use native browser titles.
- Use `framer-motion` for all new micro-interaction transitions.
- Maintain existing `oklch()` color tokens.

## Scouted Patterns
- `LockScreen.tsx`: Uses `framer-motion` for setup/login transitions.
- `Sidebar.tsx`: Currently uses `title` on nav links when collapsed.
- `src/components/ui`: Current home for Radix primitives.
