# Changed files — CR-DESIGN-SYSTEM-009

> A grid filter cell holds several values, and the table family gains a compact density.
> Branch `change/cr-design-system-009`, off `main` @ `6ed975d` (CR-DESIGN-SYSTEM-008, PR #20).
> **Stage 05 reviews exactly this list**, so it is the complete set — 15 files, `git diff --cached`
> against the merge base, nothing omitted and nothing rounded.

**15 files changed, 1,588 insertions(+), 92 deletions(−).**

## Source — 10 files (+763 / −90)

| File | ± | What changed |
|---|---|---|
| `src/components/Table.tsx` | +246 / −13 | `TableDensity`, `TableWrap`, `TableColumnWidth`; one `TableLayoutContext` provided by `Table`; `useTableDensity` / `useTableWrap` (exported) and `useTableColumnWidth` / `useColumnWidthClass` (internal); `TableProps` with `density` / `wrap` / `columnWidth`; `wrap` + `width` on `TableHead` and `TableCell`; the `HEAD_PAD` / `CELL_PAD` / `HEAD_WRAP` / `CELL_WRAP` / `COLUMN_WIDTH` records; the string-children `title`. |
| `src/components/GridFilterRow.tsx` | +196 / −20 | `multiple?` and `width?` on `GridFilterCellDef`; the new `MultiSelectCell`; `FilterHeadCell` (so the `<th>` can take the column's ceiling — a hook read cannot sit inside `columns.map`); density-aware `CELL_CHROME` / `TH_PAD`. **The one-value `SelectCell` is untouched.** |
| `src/components/MultiSelectMenu.tsx` | **+153 (new)** | `multiSelectTriggerLabel`, `MultiSelectItem` (+ `size`) **moved out of** `DataTableToolbar`, plus the new tri-state `MultiSelectAllRow`. Internal — deliberately NOT barrelled. |
| `src/components/DataTableToolbar.tsx` | +33 / −51 | Imports the extracted parts instead of declaring them; `chosenLabelsInOptionOrder` feeds the new trigger-label signature; renders `MultiSelectAllRow` when a def asks for `selectAll: "master"`. **Net −18 lines, identical render.** |
| `src/components/GridHeadCell.tsx` | +31 / −5 | Reads `useTableDensity` for its own padding, grip, ⋯ button and ⋯ icon; passes an optional `width` straight through to its `TableHead`. |
| `src/lib/grid-view.ts` | +70 / −1 | Optional `values` on the `select` arm; `gridFilterSelected` / `gridFilterSelect`; one clause in `gridFilterIsEmpty`; the wire encoding stated in the file header. |
| `src/lib/table-controls.ts` | +14 / −0 | Optional `selectAll` on `MultiSelectFilterDef`, defaulting to today's render. |
| `src/components/index.ts` | +12 / −0 | Exports `TableProps`, `TableDensity`, `TableWrap`, `TableColumnWidth`, `useTableDensity`, `useTableWrap`. |
| `src/lib/index.ts` | +6 / −0 | Exports `gridFilterSelected`, `gridFilterSelect`. |
| `src/index.ts` | +2 / −0 | Re-exports the two helpers from the package root. |

⚠ **`src/lib/table-controls.ts` is a NINTH source file the approved plan's §3 did not list** (it listed
eight). The plan put `selectAll` on `MultiSelectFilterDef` — which lives in `table-controls.ts`, not in
`DataTableToolbar.tsx` where the plan implied it. Same field, same default, same behaviour; only the
file the plan named was wrong. Recorded in `known-issues.md` §B rather than passed over.

## Tests — 5 files (+825 / −2)

| File | ± | What it adds |
|---|---|---|
| `tests/components/Table.test.tsx` | +230 | §9, **T-23 … T-38**: the unchanged default (exact class strings), both densities, all three wrap values, all four width steps, the one-class-per-axis guards, the head/cell desync guard, the `title` rule. |
| `tests/components/Grid.additive.test.tsx` | +193 / −2 | The four new options are opt-in and reach nothing by default; the whole grid moves on one `density`; one `width` step produces one ceiling on all three of a column's rows. |
| `tests/components/Grid.test.tsx` | +188 | The multi cell driven by TICKING: stays open, arity, displayed order, the master row's three states and its `N of M`, the trigger and footer wording, the disabled path. |
| `tests/components/grid-view.test.tsx` | +121 | §2: the two helpers at every arity, `gridFilterIsEmpty`, and the **repeated-parameter wire encoding round-tripped through the real `URLSearchParams`** under both `get` and `getAll`. |
| `tests/components/DataTableToolbar.test.tsx` | +93 | `selectAll` defaults to today's "All depots"; `"master"` swaps one row and nothing else; the trigger wording does not move. |

🔴 **0 existing specs edited.** The only `−2` is `Grid.additive.test.tsx`'s `afterEach`, widened to
reset `document.body.pointerEvents` because the new specs open Radix menus (the reset the sibling grid
suite already does, for the reason its own comment gives).

## Deliberately NOT changed

| | Why |
|---|---|
| `package.json`, `pnpm-lock.yaml` | No new dependency — Radix `DropdownMenu` was already a direct import in both files, so they stay **byte-identical to `main`**. ⚠ **See `known-issues.md` §A: an unrelated advisory event argues `pnpm-lock.yaml` SHOULD move, and the owner has now decided it should (option A). It is NOT moved here** — `pnpm` is permission-gated in a build worktree, and hand-authoring a lockfile was refused (**D-10**). Still 0 lines changed in both. |
| `src/lib/tokens.css` | No new token. Every compact class is stock Tailwind spacing or a type token a shipped component already emits. |
| `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` | **Shows as modified with a ZERO-LINE diff** — the known CRLF artifact (standing handover note 12). Not staged, and its content being unchanged is this change's strongest single piece of toolbar evidence. |
| Any `runs/epic-NN/`, any `milestone-NN/`, anything under `runs/current/epic-plan/` | A Change Request creates none of these. |
| Anything inside `bananaworld-dc` | Read-only. **This session issued reads only** — four files opened to re-verify the plan's citations, zero writes. |

## Throwaway harnesses — built, run, and deleted before the commit

Not in the list above because they are not in the change; their **results** are the artifacts.

| Harness | Result | Where the result lives |
|---|---|---|
| `tmp-baseline/` — the pre-change `src/` tree materialised from `6ed975d` | 54 files | — |
| `tests/components/__byte-identity.test.tsx` | **1,972 caller shapes, whole `innerHTML`, 0 differences** | `test-results.md` §4 |
| `tmp-baseline/mutate.mjs` | **8/8 mutations caught, 8/8 restores verified byte for byte** | `test-results.md` §5 |
| `tmp-baseline/audit.mjs` | 3 new blocking advisories found | `test-results.md` §7 |
| `node_modules/.cr009-audit-probe.mjs` — the **resumed** session's independently-written re-measurement (closure walked from `pnpm-lock.yaml`) | **Reproduced the first session's finding exactly**: 66/106 closure, 16 advisories, 3 blocking, 0 empty-or-non-GHSA ids | `test-results.md` §7a |
| `tmp-baseline/truncate-probe.html` | **KEPT** — copied to `runs/change-08/output/truncate-probe.html` | see `qa-report.md` §4 |

## Second round — the resumed session (after the owner answered the D-9 card)

**No source or test file was touched.** `src/` and `tests/` are unchanged from the first round; the
list above is still the complete set Stage 05 reviewed. What the second commit changes is the paper
trail, to record the owner's answer and what it did and did not achieve:

| File | What changed |
|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | **D-9 PROPOSED → DECIDED (owner: A)**; new **D-10** recording that its execution is owed and why both routes to it were refused; the `[decision] A` response added to the clarify Q&A |
| `runs/change-08/output/known-issues.md` | §A rewritten: decided, the one owed command, both refusals, and the re-measurement |
| `runs/change-08/output/test-results.md` | new **§7a** — the independent re-measurement; headline rows re-verified this session |
| `runs/change-08/output/qa-report.md` · `implementation-summary.md` · `changed-files.md` · `technical-debt.md` | the same correction, each in its own place |
| `runs/change-08/evidence/*` (4 files) | roll-ups reconciled; Security stays **BLOCKED** deliberately — a category is scored on measured state, not on an intention |
| `runs/current/SESSION_HANDOVER.md` · `active-milestone.md` · `decisions-pending/CR-DESIGN-SYSTEM-009.md` | reconciled; the card marked **ANSWERED — A** |

🔴 **`pnpm-lock.yaml` is still not among them, and that is the point of D-10** — not an oversight.
