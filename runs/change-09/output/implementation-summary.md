# Implementation summary — CR-DESIGN-SYSTEM-010

> Review follow-up on CR-DESIGN-SYSTEM-009. Three defects an independent reviewer found in code that
> had already merged (`3143646`, PR #22). Branch `change/cr-design-system-010`, off `origin/main` @
> `3143646`. Approved layout **A**, ship mode **on-green**.

## 1. The plan's premise, re-checked before anything was built

🔴 **Everything is still exactly as the plan describes it, and all three findings still hold.** `main`
had not moved since the plan was written — `HEAD` is `3143646`, the plan's stated merge base — and
every file, function and line reference the plan CITES was found at the cited line:

- `GridFilterRow.tsx:284, 289, 293, 343` (F1) · `DataTableToolbar.tsx:399` and
  `GridFilterRow.tsx:326` (F2) · `Table.tsx:483` declared, `:487` destructured out (F3).
- Supporting citations checked too: `table-controls.ts:231-238, 243-256, 293-298` ·
  `grid-view.ts:117-140, 151-160` · `DataTableToolbar.tsx:317-324, 346-349` · `Table.tsx:196-200`.
- The plan's `bananaworld-dc` facts, re-verified by reading DC: it pins **`6ed975d`** at
  `package.json:55` (CR-008, pre-CR-009), declares no `multiSelect`/`selectAll`/`multiple`, and
  passes no `width` to `TableCell`/`TableHead`/`GridHeadCell` (0 matches). **Reads only.**

**No finding was dropped.** None had been corrected by a later change, and one — F3 — was the
plan's own flagged uncertainty (`node_modules` was absent when it was written), so it was confirmed by
**compiling** rather than by reading: see `defect-log.md` F3.

**Plan OQ-2 is also settled:** `(string & {})` compiles cleanly under this repo's TS config. The
`| string` fallback was not needed.

## 2. What was built

One cause, two findings; a third on its own terms. CR-009 moved the tick-list's **presentation** into
`MultiSelectMenu` and left the **value arithmetic** duplicated at each call site, where it promptly
diverged. This finishes that extraction.

**`src/components/MultiSelectMenu.tsx`**
- `MultiSelectOption` — the `{value,label}` shape both surfaces reduce to.
- `multiSelectChosenLabels` — **moved in** from `DataTableToolbar`, body unchanged: known labels in
  displayed order, then any stored value the options no longer offer, as its raw id.
- `multiSelectToggle` — new: what one tick commits, **preserving** ids the options no longer offer.
- `MultiSelectAllRow` — `onToggle: (all: boolean) => void` → **`onShowEverything: () => void`**, and
  the owner's layout **A**: ticked + `All N` when nothing is chosen, a dash + `N of M` while some are,
  ticked + `N of M` when all are named by hand.

**`src/components/GridFilterRow.tsx`** — `MultiSelectCell` only. Options mapped once via `useMemo`;
labels and toggle from the shared functions; `set` and the footer count read `selected.length`; the
master row commits `[]`, which `gridFilterSelect` → `gridFilterSet` turns into a **dropped key** — so
"Select all" writes no wire parameter at all rather than N repeats. **`SelectCell` is untouched.**

**`src/components/DataTableToolbar.tsx`** — the local `chosenLabelsInOptionOrder` deleted (moved, not
copied); the local reducer replaced; the master row's `onShowEverything={() => onChange([])}`. The
`selectAll: "allOption"` branch, the trigger, the footer and every class string are untouched.

**`src/components/Table.tsx`** — `TableCellProps.width` widened to
`TableColumnWidth | number | (string & {})`; `isColumnWidth` splits the two meanings once; the legacy
value is forwarded to the `<td>`. **`TableHead` is deliberately not widened** — `ThHTMLAttributes`
declares no `width`, so it never had the attribute to lose.

## 3. Proof

| | |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **377 / 17 files** — baseline **re-measured before any edit: 363 / 17** |
| Specs | **+14**; **6 existing rewritten, 5 of them because they asserted the defect** (`test-results.md` §3) |
| 🔴 Byte-identity | **9,936 caller shapes vs `main@3143646`, 0 differences** — plus **4 deliberate differences**, each asserted in the repaired direction |
| 🔴 Seven shipped toolbar screens | whole-DOM snapshot, **zero-line diff** |
| Mutation battery | **10 run, 10 caught, 0 skipped**, every restore byte-exact |
| Quality sensors | **0 open findings**, 4 justified, 0 weak; both scorecards **PASS** |
| Dependency audit | `pnpm run audit:deps` **exit 0 — 0 blocking** |
| Migration | **none** — no database by construction |
| Throwaway Postgres | **never started; nothing left behind** |

## 4. Additive — and why every caller is safe

**No field removed, no default moved, no export surface altered.** `src/components/index.ts` and
`src/lib/index.ts` are byte-unchanged.

The one rename (`onToggle` → `onShowEverything`) is on **`MultiSelectAllRow`, which is internal and
not barrelled** — a consumer cannot import it, and its only two callers are in this package and both
changed here. Recorded explicitly because a rename is the one shape that looks like a lane-rule breach
and is not.

**Callers checked:**
- **`bananaworld-dc`** — pins `6ed975d`, *before* CR-009, so it does not have the code being fixed.
  Declares no `multiSelect`/`selectAll`/`multiple`; passes no `width`. Unaffected on every axis.
  **Read-only, and read only:** its `package.json` and three greps over `src`. Nothing was written,
  staged, committed or formatted there.
- **CRM, RMS, org-admin, Manga Verde** — **not readable from this worktree, and no claim is made
  about them beyond this:** `selectAll` and `multiple` are one day old, so no pin can hold them, and
  the `width` hazard is now *repaired* rather than documented — the per-consumer grep CR-007 imposed
  for `valign` is a courtesy here, not a gate.
- **Inside the package** — `MultiSelectMenu` has exactly two callers, both changed here.

**No consumer pin was bumped** (project rule; KI-M001E19-002 — consumers move their own pin, in their
own change, against the **merged** `main` sha, never a branch sha).

## 5. What this fixes on a live screen today: nothing, and that is correct

No consumer can currently be running the defective code — `selectAll` and `multiple` did not exist
before `3143646` (2026-09-10). This repairs the primitives **before** the first consumer adopts them,
which is the cheapest moment it could have happened.

## 6. Known limits, stated

- **No consumer suite was executed and nothing claims one was** — ninth change to record it.
- **No browser was driven.** The carried **OQ-8** (does `max-width` cap a `<td>` under
  `table-layout: auto`) is untouched and still unverified; the probe ships at
  `runs/change-08/output/truncate-probe.html`.
- **There is no `lint` script and no ESLint config in this repository** (pre-existing, out of lane);
  `pnpm lint` was therefore not run, and is not claimed.
- One defect was found in **this session's own tooling** and fixed: `defect-log.md` **D-1**.
