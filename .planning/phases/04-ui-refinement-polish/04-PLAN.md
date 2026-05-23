# Phase 4 Plan: UI Refinement & Polish

## Goal
Elevate the HabitOS user experience with high-fidelity micro-interactions and a unified premium tooltip system.

## Proposed Changes

### 1. Infrastructure (Preparation)
- Install `@radix-ui/react-tooltip`.
- Create `src/components/ui/Tooltip.tsx` integrating Radix and `framer-motion`.

### 2. Micro-interactions (Animations)
- **LockScreen Shake:**
  - Update `LockScreen.tsx` to apply the `shakeAnimation` to the main `motion.div` card.
  - Refine the shake stiffness for a "Premium" feel (high frequency, high damping).
- **Global Fade/Scale:**
  - Standardize tooltip entry with `initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}`.

### 3. Global UI Audit (Replacement)
- **Sidebar:** Replace `title` prop on `NavLink` with `<Tooltip>`.
- **HabitCard:** Wrap heatmap individual day nodes in tooltips showing the date and completion status.
- **ExpenseRow:** Replace `title` on the Delete button with a localized `<Tooltip>`.
- **General Audit:** Scan for remaining `title` attributes in `Dashboard` and `Settings`.

## Verification Plan

### Automated Tests
- N/A for visual polish (visual regression is outside current scope).
- Verify no TypeScript errors remain in refactored UI components.

### Manual UAT
- [ ] Failed login triggers whole card shake.
- [ ] Hovering over a collapsed sidebar icon shows a custom glassmorphic tooltip after 400ms.
- [ ] Hovering over a heatmap day shows the full date.
- [ ] Tooltips follow the color palette (oklch) and appear correctly positioned.
