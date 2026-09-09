# Simplification opportunities — CR-DESIGN-SYSTEM-009

> Stage 05. Every candidate considered across the 15 files in `changed-files.md`, including the ones
> **rejected** — a list of only the accepted ones is a changelog, not a review.
> Applied ⇒ `accepted-refactors.md`.

## Applied — 2

### S-1 · `useCellLayout` — one reader instead of the same five lines twice ✅

`TableHead` and `TableCell` each carried:

```ts
const density = useTableDensity();
const tableWrap = useTableWrap();
const tableColumnWidth = useTableColumnWidth();
const effectiveWrap = wrap ?? tableWrap;
const effectiveWidth = width ?? tableColumnWidth;
```

…followed by the same `columnWidthClass(effectiveWrap, effectiveWidth)` call. Ten lines expressing one
idea in two places, plus a five-line comment repeated in both explaining why the hooks must be called
before the `??` and not inside it.

Now one reader returns `{ density, wrap, widthClass }`, and `useColumnWidthClass` (the grid filter
row's entry point) delegates to it. **−8 lines, one fewer internal hook, and one warning instead of
two.** The real gain is not the line count: `wrap ?? useTableWrap()` short-circuits and calls a hook
conditionally — the exact trap CR-DESIGN-SYSTEM-007 recorded against the row context — and having one
reader makes that structurally impossible rather than a rule two call sites must remember.

### S-2 · `CELL_BASE` back to a module constant ✅

`GridFilterRow` had `function cellBase(density) { return cn(CELL_CHROME[density], CELL_TYPE); }`,
called by all four cells on every render. Before this change the same thing was a single module
constant `CELL_BASE = cn(…)`. Two densities do not need a function — they need two entries:

```ts
const CELL_BASE: Record<TableDensity, string> = {
  default: cn(CELL_CHROME.default, CELL_TYPE),
  compact: cn(CELL_CHROME.compact, CELL_TYPE),
};
```

**Removes a function and a per-render `cn()` on every filter cell of every row**, and restores the
shape the file already had. It also fixed a comment that had drifted into describing a constant that
was no longer one.

## Considered and rejected — 6

Each is a real reduction in lines that would have cost something worth more.

### R-1 · Merge `SelectCell` and `MultiSelectCell` into one branching component ❌

The single largest apparent duplication in the change: two components share a trigger, a chevron, a
`CELL_BASE`/`CELL_SET` treatment and an `aria-label`.

**Rejected, and the plan rejected it first (§A.4).** The one-value path being *literally the shipped
function, unedited* is what makes byte-identity **provable** instead of argued — the 144-shape
`GridFilterRow` diff is only meaningful because that code never moved. A merged component with an
`if (multiple)` inside it would have to be re-proven by reading, and every future edit to the multi
path would put the single path at risk. **A duplication that guards a contract five apps depend on is
not a duplication to remove.** The parts that genuinely must not drift — the item, the trigger
arithmetic, the master row — *were* extracted, into `MultiSelectMenu.tsx`. That is the distinction.

### R-2 · Fold `MultiSelectAllRow` into `MultiSelectItem` ❌

They share ~12 lines of `CheckboxItem` shape. Folding them would mean `checked: boolean |
"indeterminate"`, an optional trailing node for the count, an optional indicator override for the
dash, and a class difference (`data-[state=checked]:font-medium` vs plain `font-medium`). That is four
optional props and three internal branches to save twelve lines — a props-bag component whose call
sites become harder to read than the two components they replace. `GUIDE-RC-04`'s "what NOT to do"
names this shape directly.

### R-3 · Split the density/wrap/width vocabulary out of `Table.tsx` ❌

The obvious answer to `Table.tsx` at 535 lines. **Rejected on two counts.** It separates the class
records from the only components that emit them, weakening the one-class-per-axis rule the file exists
to state; and it would leave `Table.tsx` at roughly 390 lines — **still over the 300 threshold**. A
split that adds a file, adds an import hop and clears nothing is ceremony. Recorded as
`QUALITY-JUSTIFY RC-05` in the file, with the measurement (43% comments, 262 executable lines) rather
than an assertion.

### R-4 · Move `GridFilterRow`'s five cells to a sibling module ❌

Same arithmetic, same answer: ~150 + ~350 lines across two files, the second still over the threshold,
and `CELL_BASE` / `CELL_SET` / the density read exported across a file boundary purely to satisfy a
line count. None of the five cells is exported or reachable except through the row.

### R-5 · Split `useTableControls` (RC-04, 67 lines) ❌

**Untouched by this change** — it is flagged only because the scorecard scans changed *files*. Its
length is four `useState`s plus the memos that each read more than one of them; `visible` alone reads
the query, the filters, the sort and both accessor maps. Every candidate split hands state out of the
hook that owns it and passes it back through a five-argument helper called once, which is exactly the
shape `GUIDE-RC-04` names as the wrong answer.

### R-6 · Have `GridHeadCell` read the density once and pass it down ❌

It reads `useTableDensity()` once already and indexes four records. Threading it through `SortMark`
and the trigger would add parameters to save nothing.

## Not a simplification, but found and fixed here

`chosenLabelsInOptionOrder` in `DataTableToolbar` looks like it could be one `.filter().map()`. It
cannot: a stored value the data no longer offers must keep **one entry** in the list, or the trigger's
"+N" silently shrinks against ticks the rep can still see. The two-array form is the behaviour, not
verbosity — and it is the reason the extraction preserved the shipped trigger exactly. Commented in
place so the next reader does not "simplify" it into a defect.

## The one simplification this change IS

Worth stating plainly, because it is easy to read a +1,588-line diff as pure growth: the change
**removed** a duplicated multi-select. `DataTableToolbar.tsx` is 18 lines shorter than it was, and the
tick-list now has exactly one implementation serving two surfaces, with a documented two-value top row
instead of two components that would have drifted. The CR named the alternative as the defect; the
extraction is what makes it unreachable.
