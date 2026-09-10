# Accepted refactors — CR-DESIGN-SYSTEM-009

> Stage 05. What was actually applied, and the proof each one changed nothing a caller can see.
> Candidates and rejections ⇒ `simplification-opportunities.md`.

**Two accepted. Both applied AFTER the byte-identity harness ran, and both re-verified afterwards.**

| | Refactor | File | Net |
|---|---|---|---|
| S-1 | `useCellLayout` — one shared reader for `TableHead` and `TableCell` | `src/components/Table.tsx` | **−8 lines**, one fewer internal hook |
| S-2 | `CELL_BASE` composed once at module load instead of per render | `src/components/GridFilterRow.tsx` | **−1 function**, −1 `cn()` per cell per render |

## S-1 · `useCellLayout`

**Before** — the same five lines, plus the same five-line warning comment, in two components:

```ts
const density = useTableDensity();
const tableWrap = useTableWrap();
const tableColumnWidth = useTableColumnWidth();
const effectiveWrap = wrap ?? tableWrap;
const effectiveWidth = width ?? tableColumnWidth;
… columnWidthClass(effectiveWrap, effectiveWidth) …
```

**After** — one reader, one warning, two call sites:

```ts
const { density, wrap: effectiveWrap, widthClass } = useCellLayout(wrap, width);
```

**Why it is a refactor and not a redesign:** the resolution order is identical (a cell's own prop wins
over its table's answer), the width class is still computed by the same `columnWidthClass` under the
same "only while truncating" rule, and the hooks are still called unconditionally — which is now true
*by construction* rather than by a comment two call sites have to obey. `useColumnWidthClass`, the
grid filter row's entry point, became a one-line delegation to it.

**Proof it changed nothing:** `pnpm typecheck` clean; **363/363 green**, including T-23 … T-26, which
pin the exact `class` attribute of an undeclared head and cell character for character, and T-34 …
T-38, which pin every width step on both elements. A resolution-order slip would redden T-32 or T-38.

## S-2 · `CELL_BASE` as a two-entry record

**Before:** `function cellBase(density) { return cn(CELL_CHROME[density], CELL_TYPE); }`, called by all
four filter cells on every render.
**After:** a `Record<TableDensity, string>` composed once at module load — the shape the file already
had before there were two densities to compose.

**Why:** `cn()` is `twMerge(clsx(...))`, and the filter row renders one of these per column per
keystroke of the debounced text cell. Composing two fixed strings at module load is strictly less work
and strictly less code. It also repaired a comment that had drifted into describing a constant that
was no longer one.

**Proof it changed nothing:** the strings are composed from the identical inputs by the identical
function; `Grid.additive.test.tsx` asserts the filter cell's exact `class` attribute at the default
density and its `h-6`/`text-xs` under compact, and all 363 specs are green.

## What was deliberately NOT refactored

Recorded here because a Stage 05 that lists only what it changed reads as if nothing was declined.

| Not done | One-line reason |
|---|---|
| Merge `SelectCell` into `MultiSelectCell` | the untouched one-value path is what makes byte-identity **provable**; the plan required it (§A.4) |
| Fold `MultiSelectAllRow` into `MultiSelectItem` | four optional props and three branches to save twelve lines — `GUIDE-RC-04`'s named anti-pattern |
| Split `Table.tsx` or `GridFilterRow.tsx` | both would still exceed 300 lines afterwards; `QUALITY-JUSTIFY RC-05` recorded in each file |
| Split `useTableControls` | untouched by this change, and every split hands its own state back to it |
| Collapse `chosenLabelsInOptionOrder` | the two-array form IS the behaviour — a value the data no longer offers must keep its place in the count |

## Verification after both refactors

| | |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **363 passed / 17 files** |
| Existing specs edited | **0** |
| Class strings moved | **0** — T-23 … T-26 pin them character for character |
| Quality sensors re-run | **0 open findings**, 5 justified, 0 weak |
