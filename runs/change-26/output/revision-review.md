# Revision review — CR-DESIGN-SYSTEM-028 (Stage 05)

**Reviewed:** `TruckDiagram.tsx`, `truck-diagram-layout.ts`, the `index.ts` edit, both new test files, the README section.

**Simplified:**
- The layout rule for slots past `positions` became one expression (`highest > asked ? highest + (highest % 2) : asked`) instead of a `max` that left a half row.
- `index.ts` folded back to 300 lines (three comments shortened, one export line per module).

**Considered and rejected:**
- Roving-focus grid: a hand-rolled composite widget; one tab stop per native button is safer (plan D-3, R2).
- Rounding an odd `positions` up to even: would draw a space the app did not ask for (the 23 case).
- A default for `standardPositions`: the 30 is the packhouse's business value (plan D-5).
- A Storybook story: the kit has none; the README example and the browser-proof page are the stories (plan §4).

**Plan fit:** `main` is still `0e9ed06` (CR-DESIGN-SYSTEM-026); `index.ts`, the additive inventory test and `StatTile` idioms were as the plan described. One deliberate difference: the drop block label group uses `aria-label` (same text as the visible divider) rather than `aria-labelledby`, because the kit avoids `useId` for server rendering.
