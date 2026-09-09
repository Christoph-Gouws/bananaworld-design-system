# Revision review — CR-DESIGN-SYSTEM-009

> Stage 05. Reviews **exactly** the files in `changed-files.md` — 15 of them — against the approved
> plan. The question is not "is this good code" but "is this the code the owner approved, and does it
> do what it says".

## 1. Did it build the approved plan?

| Plan section | What it required | What shipped | |
|---|---|---|---|
| §A.1 | Widen the `select` arm with ONE optional field. **No fifth kind.** | `values?: readonly string[]` added; `value: string` still required and unmoved | ✅ |
| §A.2 | `gridFilterSelected` / `gridFilterSelect`, exported; one clause in `gridFilterIsEmpty`; `gridFilterSet` untouched | all four, exactly | ✅ |
| §A.3 | State the repeated-parameter encoding in `grid-view.ts`'s header; ship **no** URL codec | stated in the header; **no codec added** | ✅ |
| §A.4 | `multiple?` on the def; `multiple !== true` keeps the **existing menu, unchanged code path** | `SelectCell` is byte-for-byte the shipped function; the multi path is a separate component | ✅ |
| §A.5 | Extract `multiSelectTriggerLabel` + `MultiSelectItem` (+ `size`) into `MultiSelectMenu.tsx`; add `MultiSelectAllRow`; `selectAll?` defaulting to today's render; **neither module barrelled** | all of it | ✅ |
| §B.1 | Density asked once on `Table`, read by everything under it; naming follows `ListCard` | one context, `density` prop, `useTableDensity` | ✅ ⚠ see §2 |
| §B.2 | ONE class per axis, from a record — never an appended class | `HEAD_PAD` / `CELL_PAD` / `HEAD_WRAP` / `CELL_WRAP` / `COLUMN_WIDTH` / `TABLE_TYPE`, asserted by T-28 / T-30 / T-38 | ✅ |
| §B.3 | The exact compact scale, `TableRow` and `TableHeader` deliberately unchanged, **no new token** | every value as tabulated; `text-2xs` kept on the head; `tokens.css` untouched | ✅ |
| §B.4 | Export `useTableDensity` (and `useTableWrap`) | both barrelled | ✅ |
| §C.3 | `TableWrap` with **two different records**, because a head already never wraps | `HEAD_WRAP` maps `wrap → "whitespace-nowrap"`; mutation **M-1** proves it matters | ✅ |
| §C.4 | The named three-step scale + `full`; **static** arbitrary values; emitted only under `truncate`; table default `medium` under `truncate`, else `full`; `className` still wins | all of it | ✅ |
| §C.4a | The same `width` on `TableHead` / `TableCell` / `GridHeadCell` / the filter cell | all four; the desync asserted, mutation **M-7** | ✅ |
| §C.5 | `title` only when children are a plain string | asserted both ways (T-33) | ✅ |
| §C.6 | Column **resizing** deliberately out | not built | ✅ |
| §0 | Everything strictly opt-in; the package default does not move | `Grid.additive.test.tsx` + 1,972 shapes | ✅ |
| §8 | No migration | none | ✅ |
| §9 | The technical debt recorded | `technical-debt.md` | ✅ |

**Every open question the plan closed was honoured**, including the ones where the plan chose the
*less* obvious answer: OQ-1 (the trigger wording does NOT change), OQ-2 (no URL codec here), OQ-4 (two
density values, not three), OQ-5 (no reader-facing switch — the app chooses).

## 2. Where the implementation departed from the plan's letter — both disclosed

Neither changes a behaviour, an export or a default. Both are recorded rather than absorbed.

| Departure | Plan said | Shipped | Why, and what it costs |
|---|---|---|---|
| **One context, not three** | §B.1 / §C.3 sketch `TableDensityContext` and `TableWrapContext` as separate private constants | a single private `TableLayoutContext` carrying `{ density, wrap, columnWidth }`, memoised | The plan's contract is the **exported** surface — `useTableDensity`, `useTableWrap`, the three props — and that is identical. Three providers nested inside `Table` would render the same DOM (none) and read the same values; one record is less machinery for exactly the same result, and it makes "a nested table resets all three together" true by construction. **A private implementation detail, and the only honest reason to mention it is that the plan drew it differently.** |
| **A ninth source file** | §3 lists eight | `src/lib/table-controls.ts` too | `selectAll` belongs on `MultiSelectFilterDef`, and that interface lives in `table-controls.ts`, not in `DataTableToolbar.tsx` where §3 implied it. Same field, same default, same behaviour — the plan named the wrong file. |

## 3. Does the code say what it does?

| Claim in a comment | Is it true? | Checked how |
|---|---|---|
| "the existing menu, unchanged code path" | **Yes** — `SelectCell` is untouched | the 144-shape `GridFilterRow` diff |
| "one class per axis" | **Yes**, on all three axes | T-28 / T-30 / T-38 |
| "a head already never wraps, and that does not change" | **Yes** | T-31, mutation M-1 |
| "a width is emitted only where the element is truncating" | **Yes** | T-34, mutation M-3 |
| "`values` is absent for zero or one" | **Yes** — the key list is asserted, not just the value | `grid-view.test.tsx` §2, mutation M-4 |
| "every hook called unconditionally" | **Yes** — and now structurally, in `useCellLayout` | §4 below |
| "43% of its lines are comments … executable code is 262 lines" (Table.tsx's RC-05 justification) | **Yes** | measured: 522 total / 223 comment / 262 code before the Stage 05 edits |

🔴 **One comment was found overstating itself and was corrected during this stage.** `GridFilterRow`'s
`CELL_BASE` was written as a function `cellBase(density)` calling `cn()` on every render, while the
comment beside it described a module constant. It is now genuinely a module constant (§4).

## 4. Simplifications applied in this stage

Two, both real reductions rather than rearrangements. Details and the rejected candidates are in
`simplification-opportunities.md`; what was applied is in `accepted-refactors.md`.

1. **`useCellLayout`** — `TableHead` and `TableCell` each carried the same five-line
   read-three-hooks-then-resolve-two-props dance. It is now one shared reader, which also makes the
   "never call a hook conditionally" rule structural instead of a warning repeated in two comments.
   −8 lines, one fewer internal hook.
2. **`CELL_BASE` as a `Record`** — composed once at module load for both densities, exactly as the
   single `CELL_BASE` constant was before there were two. Removes a per-render `cn()` on every filter
   cell of every row, and restores the shape the file already had.

Both were made **after** the byte-identity harness had run. `pnpm typecheck` and all 363 specs were
re-run after them and are green; no class string moved.

## 5. What this review will NOT claim

- That any consumer app still works. **Four of five consumer repos cannot be read from a build
  worktree and none of their suites was run.** The protection is structural — an option nobody passes
  reaches nobody — and it is asserted in `Grid.additive.test.tsx`, not assumed.
- That the truncation actually truncates on screen. **OQ-8 could not be verified here** — no browser
  can be executed from this sandbox. `qa-report.md` §5, and the probe ships ready to run.
- That the change is mergeable. **It is not, today.** Three high/critical advisories published
  2026-09-08 fail CI's audit job, on `main` as much as on this branch. `known-issues.md` §A.
