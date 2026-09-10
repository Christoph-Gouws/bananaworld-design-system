# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-09-10.

## Current: CR-DESIGN-SYSTEM-010 — **BUILT, GREEN, CLOSED OUT, PR OPEN**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-09/`. Not an epic, not a milestone |
| Id | **CR-DESIGN-SYSTEM-010** |
| Title | Review follow-up on CR-DESIGN-SYSTEM-009 — 3 reviewer findings in code that had already merged |
| Branch | `change/cr-design-system-010`, off `origin/main` @ `3143646` (CR-009, PR #22) |
| Approved layout | **A** — the tick at the top means "everything is showing" |
| Ship mode | **on-green** |
| Build status | `pnpm typecheck` clean · `pnpm test` **377 / 17 files** (baseline re-measured before any edit: **363 / 17**) · **+14 specs**, **6 existing rewritten — 5 because they asserted the defect** · **0 open defects** · `src/` 4 files, tests 3 files |
| Additive proof | **9,936 caller shapes** rendered against `main@3143646` and diffed — **0 differences**, plus **4 deliberate** each asserted in the repaired direction; seven shipped toolbar screens **zero-line diff**; **10 mutations run, 10 caught, 0 skipped**; sensors **0 open findings**, both scorecards PASS; `audit:deps` **exit 0** |
| PR | **Open.** The conductor polls CI and merges on green |
| Remaining | **Nothing owed.** 0 open decisions, 0 actions |

### What it did

Three defects an independent reviewer found in CR-009's merged diff. 🔴 **All three re-confirmed
against the code as it stood before any fix was designed. All three still held. None was dropped** —
and F3 was confirmed by **compiling**, because the plan flagged that `node_modules` was absent when it
was written.

- **F1** — the grid's tick-list counted and committed only ids present in `options`: a saved view
  holding a retired id read `1 chosen` on a filter narrowing by two, rendered **completely unset** when
  every stored id was retired, and **deleted** the retired id on the next tick. The toolbar in the
  identical state read `2 chosen`.
- **F2** — the tri-state "Select all" committed every option id, so it **narrowed** the table (dropping
  every blank-valued row) and lit "Clear" — on a gesture made to see everything.
- **F3** — `TableCellProps.width` shadowed React's `TdHTMLAttributes.width` and was destructured out,
  so a consumer passing the legacy HTML attribute fails `tsc` at its pin bump, or silently loses the
  column's sizing.

🔴 **One cause, not three edits.** CR-009 moved the tick-list's **presentation** into
`MultiSelectMenu` and left the **value arithmetic** duplicated at each call site, where it diverged.
This finishes the extraction: `multiSelectChosenLabels` (moved in from the toolbar) and
`multiSelectToggle` (new — preserves ids the options no longer offer) serve both surfaces, and the
count is `values.length` in both.

🔴 **The master row can no longer narrow.** `onToggle: (all: boolean) => void` →
`onShowEverything: () => void` — no boolean to interpret, no id list reaching it, so F2 is
**unreachable** rather than fixed. A rename on an internal, un-barrelled component with two callers,
both changed here; **no export surface moved.**

**Owner's layout A** cost **two lines** (`state` and `count`): ticked + `All N` unset, dash + `N of M`
partial, ticked + `N of M` when every option is named by hand — which still excludes blank rows, and
`All 3` vs `3 of 3` is what says so on screen.

### Also recorded

- **One defect found in this session's own tooling and fixed** — the mutation battery's multi-line
  anchors matched nothing on a CRLF checkout, so 3 of 10 mutations never ran (reported `7/10`). Same
  root cause as CR-009's D-1 from the other direction. Its own self-check caught it. `defect-log.md` **D-1**.
- **The byte-identity harness is now committed** (`runs/change-09/output/`), so the next change does
  not rebuild it a third time.
- **Technical debt created: 0.** TD-1 (CR-009) narrowed to "which top row a screen asks for".

## Previous units

- **CR-DESIGN-SYSTEM-009** — a filter cell holds several values, and the grid reads at a compact
  density. Merged as `3143646` (PR #22). **This change fixes three defects in it.**
- **CR-DESIGN-SYSTEM-008** — the grid controls: sort in the header, group in a strip, filter under the
  headers. `6ed975d` (PR #20). ⚠ **It has no decision-log entry** — the log jumps 007 → 009.
- **CR-DESIGN-SYSTEM-007** — a row's valign is a default for its cells. `runs/change-07/`; `54597ac`.
- **CR-DESIGN-SYSTEM-006** — a row of fields can line up along the top. `runs/change-06/`; `ce47010`.
- **CR-DESIGN-SYSTEM-005** — the depot slot's label. `runs/change-05/`; `fc6f6c6`.
- **CR-DESIGN-SYSTEM-004** — a shared paging control. `runs/change-04/`; `0633476`.
- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. `runs/change-03/`; `fc2c5b8`.
- **CR-DESIGN-SYSTEM-002** — the document header. `runs/change-02/`; `9aa20f7`.
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-010 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started; most are not in this repository)

1. 🔴 **DC's half of CR-009 — a separate CR.** Bump the pin to the **MERGED `main` sha** (never a
   branch sha, KI-M001E19-002), then pass `density="compact"`, `wrap="truncate"`, a `width` per column
   and `multiple`, and move its query writer to `append`/`getAll`.
   ⚠ DC must opt its CHIP columns (`ColourStageCell`, `DrillCell`) to `wrap="nowrap"`.
   ⚠ The width must reach **all THREE** of a column's rows or the cap is silently defeated.
2. **DC's report WIDTH** (`max-w-[1440px]`) — DC's own lane.
3. **`selectAll: "master"` in DC and the CRM** — TD-1's other half, now narrower.
4. **Retire the 4 now-inert `ignoreGhsas` entries** — standalone housekeeping, the owner's call.
5. **OQ-8** — does `max-width` cap a `<td>` under `table-layout: auto`? One click:
   `runs/change-08/output/truncate-probe.html`. No browser is executable from this sandbox.
6. Carried, unaffected: the CRM's pin bump + `dcLabel` (CR-005, unblocking CR-CRM-015, blocked since
   2026-08-18); DC's pin bumps for CR-002/CR-004 then CR-DC-052; the CRM's seven-point saved-view
   obligation (CR-003); CR-001's colour-stage chips; DC's dead private copy of `table-controls.ts`.
7. **org-admin / RMS / Manga Verde** — nothing required, and their repositories cannot be read from a
   build worktree. No claim is made about them.
