# Changed files — CR-DESIGN-SYSTEM-010

> Every file this change touched. **Stage 05 reviews only what is listed here**, so an incomplete list
> silently shrinks its own review. Branch `change/cr-design-system-010`, off `origin/main` @ `3143646`
> (CR-DESIGN-SYSTEM-009, PR #22).

## Source (4) — `src/` +? / −?, measured below

| File | What changed | Why |
|---|---|---|
| `src/components/MultiSelectMenu.tsx` | **+** `MultiSelectOption`, `multiSelectChosenLabels` (moved in from `DataTableToolbar`, body unchanged), `multiSelectToggle` (new — preserves ids the options no longer offer). **~** `MultiSelectAllRow`: `onToggle: (all: boolean) => void` → `onShowEverything: () => void`; state and count per the owner's layout **A** (`chosen === 0` ⇒ ticked, `All N`). | F1 + F2. Finishes the CR-009 extraction: the value arithmetic joins the presentation, and the master row loses the ability to narrow. |
| `src/components/GridFilterRow.tsx` | `MultiSelectCell` only — options mapped once to `{value,label}` via `useMemo`, labels/toggle from the shared functions, `set` and the footer count read `selected.length`, master row commits `[]`. `SelectCell` **untouched**. | F1 + F2 in the grid. |
| `src/components/DataTableToolbar.tsx` | Local `chosenLabelsInOptionOrder` **deleted** (moved, not copied); local `toggle` reducer → `multiSelectToggle`; master row → `onShowEverything={() => onChange([])}`. `selectAll: "allOption"` branch, trigger, footer and every class string untouched. | F1 (the discard half) + F2 in the toolbar. |
| `src/components/Table.tsx` | `TableCellProps.width` widened to `TableColumnWidth \| number \| (string & {})`; new `isColumnWidth` predicate; `htmlWidth` forwarded to the `<td>`. **`TableHead` deliberately unchanged.** | F3. |

## Tests (3)

| File | What changed |
|---|---|
| `tests/components/Grid.test.tsx` | 🔴 **3 existing specs REWRITTEN** — the `"Select all"` describe block asserted that the master row commits every option id, which is the defect. Now: it clears, a second tap is a no-op, and ticking all three by hand is a distinct `3 of 3` state. **+ a new describe block for F1** (retired id counted, shown as set, kept through a tick, survives un-ticking a known id). Harness gained an optional `initial` prop so a restored saved view can be expressed. |
| `tests/components/DataTableToolbar.test.tsx` | 🔴 **2 existing specs REWRITTEN** — `:497-504` asserted the `"—"` row DISAPPEARS after the master tap. Now it survives and `Clear` stays off. **+ 2 new specs in that block** (Clear affordance, hand-ticked `3 of 3`) **+ a new describe block for F1** (a depot retired out from under a stored value: counted, kept through a tick, and cleared only by `Select all`). Harness gained a `rows` prop; `DEPOTS_WITH_POLOKWANE` added. |
| `tests/components/Grid.additive.test.tsx` | **+ a new describe block for F3** — `<TableCell width={120}>` renders `<td width="120">` and takes no cap; a non-step string is forwarded; the four step names are consumed and never forwarded; a cell passing no width emits neither. |

**`tests/components/Table.test.tsx` was NOT edited** and stays green — T-34…T-38 already pin the four
width steps and the at-most-one-`max-w-` rule, and they are what mutation **M-10** reddens.

## Evidence and tooling added under `runs/change-09/output/` (not shipped code)

| File | What |
|---|---|
| `byte-identity-setup.mjs` | Materialises the pre-change `src/` into `baseline-tmp/` from a merge-base sha. Committed this time so the next change does not rebuild it a third time. |
| `byte-identity.harness.test.tsx` | The harness itself. **Archived, not shipped** — it lives outside `tests/components/**`, so `pnpm test` does not run it, and it cannot run from here because `baseline-tmp/` is deleted before staging. To re-run: copy it to `tests/components/`, run the setup script, `npx vitest run`. |
| `mutation-battery.mjs` | 10 mutations, each restoring one finding. Holds original **bytes** and writes them back; anchors take the file's own line ending. |

## Not touched — stated, because the plan names them

`src/lib/table-controls.ts` · `src/lib/grid-view.ts` · `src/components/index.ts` · `src/lib/index.ts`
(**no export moved**) · `src/components/GridHeadCell.tsx` · `package.json` · `pnpm-lock.yaml` · any
`runs/epic-*/` · any `milestone-NN/` · anything under `runs/current/epic-plan/` · **anything at all
inside `bananaworld-dc`** (reads only — see `implementation-summary.md` §"Consumers").

⚠ `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified in `git status`
with a **zero-line content diff**. That is the pre-existing CRLF artifact CR-DESIGN-SYSTEM-009
recorded (handover point 14); it is **not staged** and is not part of this change.

## Measured

```
 src/components/DataTableToolbar.tsx        |  47 ++++----
 src/components/GridFilterRow.tsx           |  60 ++++++----
 src/components/MultiSelectMenu.tsx         | 120 +++++++++++++++++---
 src/components/Table.tsx                   |  47 +++++++-
 tests/components/DataTableToolbar.test.tsx | 140 ++++++++++++++++++++--
 tests/components/Grid.additive.test.tsx    |  70 ++++++++++++
 tests/components/Grid.test.tsx             | 126 +++++++++++++++----
 7 files changed, 529 insertions(+), 81 deletions(-)
```
