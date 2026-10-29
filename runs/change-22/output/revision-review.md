# Revision review — CR-DESIGN-SYSTEM-024 (Stage 05)

**Reviewed:** `src/components/TablePagination.tsx`, `src/components/index.ts`, `tests/components/TablePagination.labels.test.tsx`; the frozen fixture was read only for import fidelity.

**Simplified:**
- Six labels are resolved once at the top with `??`; the seven word sites now read a local, with no branching in the JSX.
- `goTo`'s and `onValueChange`'s parameters were renamed (`target`, `size`) because `next` is now a label; internal only.
- The default `range` is the only place the English sentence is written; the component has no second copy.

**Considered and rejected:**
- `{ ...DEFAULT, ...labels }` — a spread lets `{ previous: undefined }` blank the button (plan D-3).
- A `{from}/{to}/{total}` template string — would make the kit own a parser (plan D-1).
- `<ChevronLeft/> {previous}` — two text nodes change React's server markup (plan D-4); template literals keep one.
- Adding `quality-sensors` justification for the fixture's duplicate `positionLabel` — instead the fixture is a frozen test copy, listed in `changed-files.md` and left out of the sensor run.

Scorecards: `readable-code-scorecard.md` PASS 11/11, `centrality-scorecard.md` PASS 8/8.
