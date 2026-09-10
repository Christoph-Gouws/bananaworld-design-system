# Developer handover — CR-DESIGN-SYSTEM-010

> The milestone handover for this change. What the next session must know, in the order it will need
> it. Branch `change/cr-design-system-010`, off `origin/main` @ `3143646`, archived at
> `runs/change-09/`.

## 1. What this was

**A review follow-up.** An independent reviewer read CR-DESIGN-SYSTEM-009's approved plan and its
diff, and raised three defects in code that had **already merged** (`3143646`, PR #22). All three were
re-confirmed against the current source before anything was designed, and all three are fixed.

| # | Finding | State |
|---|---|---|
| **F1** | the grid's tick-list under-counted and then discarded a stored id its options no longer offered — diverging from the toolbar, which the same change had deliberately taught to preserve one | **FIXED** |
| **F2** | the tri-state "Select all" committed every option id, so it **narrowed** the table (dropping blank-valued rows) and lit "Clear", where the row it replaces widened to everything | **FIXED** |
| **F3** | `TableCellProps.width` shadowed React's `TdHTMLAttributes.width` and was destructured out, so a consumer passing the legacy HTML attribute would fail `tsc` at its pin bump | **FIXED** |

**Approved layout A** (the tick means "nothing is being hidden": ticked + `All N` unset, dash +
`N of M` partial, ticked + `N of M` when all are named by hand). **Ship mode on-green.**

## 2. 🔴 The five things that will bite the next session

1. **`MultiSelectAllRow` CANNOT NARROW, AND THAT IS THE FIX.** Its prop is `onShowEverything: () =>
   void`, not `onToggle: (all: boolean) => void`. Radix hands a next-checked-state that both call
   sites read as "commit every option id" — that *was* F2. There is now no boolean to interpret and
   no option list reaching the row. **Do not "restore" the boolean for symmetry.** Mutations M-5/M-6.

2. **THE COUNT IS `values.length`, NEVER `options.filter(...).length`.** Everywhere: the trigger's
   `+N`, the footer's `N chosen`, the master row's `N of M`, and the set/unset chrome. A stored id the
   options no longer offer is **still narrowing the query**. F1 was four readings of one wrong number.
   Mutations M-3, M-4, M-7, M-8.

3. **`TableCellProps.width` CARRIES TWO MEANINGS AND THE SPLIT IS IN ONE PLACE.** `isColumnWidth` in
   `Table.tsx`. The four step names are the design-system ceiling; **anything else is forwarded to the
   `<td>` untouched**, exactly as it was before CR-009. ⚠ **`TableHeadProps` is deliberately NOT
   widened** — `ThHTMLAttributes` declares no `width`, so `<TableHead width={120}>` was already a type
   error before CR-009 and is not a regression. Widening it would be a feature, not a repair.
   Mutations M-9, M-10.

4. **DO NOT UNIFY `SelectCell` AND `MultiSelectCell`** — CR-009 handover point 2, and this change now
   *depends* on it. 900 of its 9,936 byte-identity shapes are 0-difference **because `SelectCell`'s
   bytes never moved**. Merging them trades a proof for an argument.

5. **`table-controls.ts` IS RIGHT AND WAS NOT TOUCHED.** `[]` means "not narrowed"; a non-empty list
   means "these values only". Teaching `matchesFilter` that "every option" means "no filter" would
   change behaviour for **every existing multiSelect caller** the moment a reader ticked the last box
   by hand. The defect was at the control that builds the list.

## 3. Windows/CRLF — the estate now has three instances of one trap

**The rule, in one line: on Windows, normalise to LF before MATCHING, and write ORIGINAL BYTES back.**

| Instance | Where | State |
|---|---|---|
| CR-009 D-1 | a mutation battery restoring with `git checkout --` gets CRLF bytes back, so the restored file is byte-different and later **multi-line** anchors silently stop matching | fixed there |
| **CR-010 D-1 (new)** | the same battery's multi-line **anchors**, written with `\n`, match nothing on a CRLF checkout — **3 of 10 mutations never ran**, reported as `7/10` | fixed here; the anchor now takes the file's own line ending |
| `quality-sensors.mjs` | silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout (`.` does not match `\r`) — the scorecard returns BLOCKED with correct justifications sitting in the source | **estate tooling, still broken.** Worked around by normalising changed files to LF before running |

🔴 **The self-check is what caught it, both times.** `mutation-battery.mjs` prints
`ANCHOR NOT FOUND — MUTATION NEVER RAN` and exits non-zero. **Keep it.** A skipped mutation that
reports quietly is worse than no battery.

## 4. The harness, and how to re-run it

Committed this time, so the next change does not build it a third time:

```
node runs/change-09/output/byte-identity-setup.mjs <merge-base-sha>   # → baseline-tmp/src/
cp runs/change-09/output/byte-identity.harness.test.tsx tests/components/
npx vitest run tests/components/byte-identity.harness.test.tsx
rm -rf baseline-tmp tests/components/byte-identity.harness.test.tsx   # THROWAWAY — never committed
```

⚠ **It lives under `runs/`, not `tests/`,** so `pnpm test` does not run it and CI never sees it. It
cannot run from where it sits, because `baseline-tmp/` is deleted before staging.

⚠ **Radix mints a fresh `id` per render**, so normalise `radix-[A-Za-z0-9_:-]+` before comparing —
otherwise the harness diffs its own render order (CR-009 handover point 10).

⚠ **The closed-menu limit, stated:** a Radix menu portals its content and renders nothing while
closed, so the master row's own markup is **unreachable** from a static-markup harness. F2 is covered
by the rewritten specs and by M-5/M-6, not by the shape count.

## 5. Five existing specs were rewritten, and that is the change

`test-results.md` §3 has the table. Six specs were edited; **five of them asserted the defect** — most
starkly `DataTableToolbar.test.tsx`, where the disappearance of the blank-valued `"—"` row after the
master tap was *written into the spec*. They were not edited to make a build pass. Every other spec in
the suite ran unedited: **15 of 17 spec files untouched, 377/377 green.**

## 6. State of the repository

- **`main` is at `3143646`** (CR-DESIGN-SYSTEM-009, PR #22). This change sits on its own branch.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed. This change created **no**
  `runs/epic-NN/`, **no** `milestone-NN/`, and nothing under `runs/current/epic-plan/`.
- **No migrations.** This package has no database by construction. `migrationExpected: false`.
- **`package.json` and `pnpm-lock.yaml` are UNCHANGED** by this change — unlike CR-009, which had to
  carry the audit fix. The audit is green on `main`'s own closure: `pnpm run audit:deps` **exit 0**.
- `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified with a
  **zero-line content diff** — the pre-existing CRLF artifact. **Not staged.**

## 7. What is owed, and by whom

**By this change: nothing.** 0 open defects, 0 open decisions, 0 actions.

**By others, unchanged by this change:**

1. 🔴 **DC's half of CR-009 — a separate CR.** Bump the pin to the **MERGED `main` sha** (never a
   branch sha — KI-M001E19-002), then pass `density="compact"`, `wrap="truncate"`, a `width` per
   column and `multiple`, and move its query writer to `append`/`getAll`.
   ⚠ DC must opt its CHIP columns (`ColourStageCell`, `DrillCell`) to `wrap="nowrap"` or
   `overflow:hidden` clips them.
   ⚠ **The width must reach all THREE of a column's rows**; wiring two of three defeats the cap
   silently and looks like a package bug.
2. **`selectAll: "master"` in DC and the CRM** — TD-1's other half. **Narrower now than it was:** the
   two menus only differ in *which top row a screen asks for*, not in what they count or commit.
3. **Retire the 4 now-inert `ignoreGhsas` entries** — a standalone housekeeping change, the owner's
   call, deliberately not folded in here.
4. **OQ-8** — does `max-width` cap a `<td>` under `table-layout: auto`? No browser binary is
   executable from this sandbox. Untouched here; one-click probe at
   `runs/change-08/output/truncate-probe.html`.
5. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — ninth change to raise it.**
   A governance decision for the owner. The plan's six-seam map (§4) is this change's record.
   ⚠ Separately: **still no decision-log entry for CR-DESIGN-SYSTEM-008** — the log jumps 007 → 009.
6. **Carried, unaffected:** the CRM's pin bump + `dcLabel` (CR-005, unblocking CR-CRM-015, blocked
   since 2026-08-18); DC's pin bumps for CR-002/CR-004 then CR-DC-052; the CRM's seven-point
   saved-view obligation (CR-003); CR-001's colour-stage chips; **DC's dead byte-for-byte private copy
   of `src/lib/table-controls.ts`** that nothing in DC imports.

## 8. Consumers — the standing rule, and what was actually checked

**This package is ADDITIVE-ONLY and that is a lane rule, not a preference.** Five repos pin it by git
sha and each bumps when it chooses. Never remove a field, move a default, or change an export surface.
⚠ **Recorded pin values disagree between documents — read the app's own `package.json`.**

- **`bananaworld-dc`** — verified this session, **read-only and reads only**: pins `6ed975d`
  (`package.json:55`), which is CR-008, *before* CR-009 — so it cannot be running the defective code.
  0 matches for `kind: "multiSelect"` / `selectAll` / `multiple: true`, and 0 for `width=` on
  `TableCell` / `TableHead` / `GridHeadCell`. **Nothing was written, staged, committed or formatted
  there.**
- **CRM, RMS, org-admin, Manga Verde** — **cannot be read from a build worktree, and no claim is made
  about them.** `selectAll` and `multiple` are one day old, so no pin can hold them; and F3 is now
  *repaired* rather than documented, so the per-consumer `width` grep CR-007 imposed for `valign` is a
  courtesy here rather than a gate.
- **No consumer suite was executed and nothing claims one was — ninth change to record it.**

## 9. Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-010.md` |
| Approved mockups (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-010/` |
| Stage 04 artifacts | `runs/change-09/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-09/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-09/output/{changed-files,implementation-summary,known-issues}.md` |
| Technical debt | `runs/change-09/technical-debt.md` (TD-1 inherited and narrowed; TD-2 not incurred; TD-3, TD-4) |
| Evidence roll-ups | `runs/change-09/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Harness + battery | `runs/change-09/output/{byte-identity-setup.mjs,byte-identity.harness.test.tsx,mutation-battery.mjs}` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — **CR-DESIGN-SYSTEM-010**, D-1…D-6 |
| Active unit pointer | `runs/current/active-milestone.md` · `runs/current/SESSION_HANDOVER.md` |
| Previous changes | `runs/change-08/` (CR-009, `3143646`) · `change-07/` (`54597ac`) · `change-06/` (`ce47010`) · `change-05/` (`fc6f6c6`) · `change-04/` (`0633476`) · `change-03/` (`fc2c5b8`) · `change-02/` (`9aa20f7`) · `change-01/` (`365be65`) |
