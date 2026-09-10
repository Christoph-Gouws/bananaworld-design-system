# Session handover — `bananaworld-design-system`

> Last updated: 2026-09-10, at the close of **CR-DESIGN-SYSTEM-010**.

## Most recent unit of work: CR-DESIGN-SYSTEM-010

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-010** (not an epic, not a milestone) |
| Title | Review follow-up on CR-DESIGN-SYSTEM-009 — 3 reviewer findings in code that had already merged |
| Branch | `change/cr-design-system-010`, off `origin/main` @ `3143646` (CR-009, PR #22) |
| Approved layout | **A** — the tick at the top means "everything is showing" |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out, pushed, PR open.** 0 open defects · 0 open decisions · 0 actions owed |
| Archive | `runs/change-09/` |

### What it did

Three defects an independent reviewer found in CR-009's merged diff. **All three re-confirmed against
the code as it stood before any fix was designed; all three still held; none was dropped.**

- **F1** — the grid's tick-list counted and committed only ids present in `options`, so a saved view
  holding a retired id read `1 chosen` on a filter narrowing by two, rendered **completely unset**
  when every stored id was retired, and **deleted** the retired id on the next tick. The toolbar in
  the identical state read `2 chosen`.
- **F2** — the tri-state "Select all" committed every option id, so it **narrowed** the table
  (dropping every blank-valued row) and lit "Clear" — on a gesture made to see everything.
- **F3** — `TableCellProps.width` shadowed React's `TdHTMLAttributes.width` and was destructured out,
  so a consumer passing the legacy HTML attribute fails `tsc` at its pin bump, or loses the column's
  sizing silently.

🔴 **One cause, not three edits.** CR-009 moved the tick-list's **presentation** into
`MultiSelectMenu` and left its **value arithmetic** duplicated at each call site, where it diverged.
This finishes the extraction: `multiSelectChosenLabels` (moved in) and `multiSelectToggle` (new,
preserves retired ids) now serve both surfaces, and the count is `values.length` in both.

🔴 **The master row cannot narrow any more.** `onToggle: (all: boolean) => void` →
`onShowEverything: () => void`. No boolean to interpret, no id list reaching the row — F2 is
**unreachable**, not merely fixed. It is a rename on an internal, un-barrelled component with two
callers, both changed here; no export surface moved.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **377 / 17 files** (baseline re-measured before any edit: **363 / 17**) |
| Specs | **+14**; **6 existing rewritten, 5 because they asserted the defect** |
| 🔴 Byte-identity | **9,936 caller shapes** vs `main@3143646` — **0 differences**, plus **4 deliberate**, each asserted in the repaired direction |
| 🔴 Seven shipped toolbar screens | whole-DOM snapshot, **zero-line diff** |
| Mutation battery | **10 run, 10 caught, 0 skipped**, every restore byte-exact |
| Quality sensors | **0 open findings**, 4 justified, 0 weak; both scorecards **PASS** |
| Dependency audit | `pnpm run audit:deps` **exit 0 — 0 blocking** |
| Migration | none — this package has no database |
| Throwaway Postgres | **never started; nothing left behind** |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## What the next session needs to know

1. 🔴 **`MultiSelectAllRow` CANNOT NARROW, and that is the fix.** Do not restore the boolean for
   symmetry. Mutations M-5/M-6.
2. 🔴 **The count is `values.length`, NEVER `options.filter(...).length`** — trigger, footer, master
   row and set/unset chrome. A stored id the options no longer offer is still narrowing the query.
   Mutations M-3, M-4, M-7, M-8.
3. 🔴 **`TableCell.width` carries TWO meanings; the split is `isColumnWidth`, in one place.** The four
   step names are the ceiling; anything else is forwarded to the `<td>`. ⚠ **`TableHeadProps` is
   deliberately NOT widened** — `ThHTMLAttributes` declares no `width`, so `<TableHead width={120}>`
   was already an error before CR-009. Mutations M-9, M-10.
4. 🔴 **DO NOT unify `SelectCell` and `MultiSelectCell`** (CR-009 point 2) — this change now *depends*
   on it: 900 byte-identity shapes are 0-difference because `SelectCell`'s bytes never moved.
5. 🔴 **`table-controls.ts` is right and was not touched.** Teaching `matchesFilter` that "every
   option" means "no filter" changes behaviour for every existing multiSelect caller.
6. 🔴 **Three CRLF traps are now on record. The rule: normalise to LF before MATCHING, and write
   ORIGINAL BYTES back.** New this change (`defect-log.md` **D-1**): the mutation battery's
   *multi-line anchors* matched nothing on a CRLF checkout — **3 of 10 mutations never ran**, reported
   as `7/10`. Same root cause as CR-009's D-1 from the other direction. The harness's own
   "ANCHOR NOT FOUND — MUTATION NEVER RAN" self-check is what caught it. **Keep it, and keep it
   non-zero-exit.** Still unfixed estate-side: `quality-sensors.mjs` ignores every `QUALITY-JUSTIFY`
   on CRLF — normalise changed files to LF before running it.
7. **The byte-identity harness is now COMMITTED**, not rebuilt a third time:
   `runs/change-09/output/{byte-identity-setup.mjs, byte-identity.harness.test.tsx}`. Re-run recipe in
   `developer-handover.md` §4. ⚠ Normalise `radix-[A-Za-z0-9_:-]+` first. ⚠ A closed Radix menu
   renders nothing, so the master row is unreachable from a static-markup harness — specs cover it.
8. ⚠ **An open Radix menu `aria-hidden`s the rest of the page**, so a `queryByRole` assertion about
   the toolbar's "Clear" button **passes on the defect** unless the menu is closed first. Press
   `{Escape}` before asserting. Sibling of the existing `pointer-events: none` lesson.
9. **This package is ADDITIVE-ONLY — a lane rule, not a preference.** Five repos pin it by sha and
   each bumps when it chooses. ⚠ Recorded pin values disagree between documents — **read the app's own
   `package.json`.** Verified here: `bananaworld-dc/package.json:55` → **`6ed975d`** (CR-008).
10. **Consumer repos cannot be run from a build worktree.** `bananaworld-dc` is readable and this
    session issued **reads only** (its `package.json` + three greps). **No consumer suite was executed
    and nothing claims one was — ninth change to record it.** CRM, RMS, org-admin, Manga Verde are
    unreadable here and no claim is made about them.
11. **Pre-existing repo drift, re-verified, out of lane:** **no prettier config** (`format:check` fails
    repo-wide; not a CI job); **no `lint` script and no eslint config**, so `pnpm lint` was not run and
    is not claimed; the `DataTableToolbar.test.tsx.snap` CRLF artifact showing as modified with a
    **zero-line content diff** (not staged). ⚠ **`audit:deps` DOES now exist and is green** — CR-009's
    handover listed it as missing; that is no longer true.
12. ⚠ **OQ-8 is still unverified** — whether `max-width` caps a `<td>` under `table-layout: auto`. No
    browser binary is executable from this sandbox. Untouched here; probe ready at
    `runs/change-08/output/truncate-probe.html`.
13. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — ninth change to raise it.**
    An owner decision. ⚠ Separately: **still no decision-log entry for CR-DESIGN-SYSTEM-008**.
14. **Still owed from earlier changes, none affected here:** the CRM's pin bump + `dcLabel` (CR-005 —
    the other half of **CR-CRM-015**'s unblock, blocked since 2026-08-18); DC's pin bumps for CR-002
    and CR-004, then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003); CR-001's
    colour-stage chips; **DC's dead byte-for-byte private copy of `src/lib/table-controls.ts`**; the
    4 now-inert `ignoreGhsas` entries (a standalone housekeeping change, the owner's call).
15. **Technical debt: 0 created.** TD-1 (CR-009) is **narrowed** — the two tick-lists now differ only
    in *which top row a screen asks for*, not in what they count or commit. TD-2 not incurred (the
    owner picked A, not C). TD-3: a retired value still shows its raw id — a wording decision, not
    invented here. TD-4: the cross-system register.

## State of the repository

- **`main` is at `3143646`** (CR-009, PR #22). CR-010 sits on its own branch, **pushed, PR open**.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created no
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- **`package.json` and `pnpm-lock.yaml` are UNCHANGED** — unlike CR-009, which carried the audit fix.
  The audit is green on `main`'s own closure.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-010.md` |
| Approved mockups (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-010/` |
| Stage 04 artifacts | `runs/change-09/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-09/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-09/output/{changed-files,implementation-summary,known-issues}.md` |
| Technical debt | `runs/change-09/technical-debt.md` |
| Harness + mutation battery | `runs/change-09/output/{byte-identity-setup.mjs,byte-identity.harness.test.tsx,mutation-battery.mjs}` |
| Evidence roll-ups | `runs/change-09/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — **CR-DESIGN-SYSTEM-010, D-1…D-6** |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-08/` (CR-009, `3143646`) · `change-07/` (`54597ac`) · `change-06/` (`ce47010`) · `change-05/` (`fc6f6c6`) · `change-04/` (`0633476`) · `change-03/` (`fc2c5b8`) · `change-02/` (`9aa20f7`) · `change-01/` (`365be65`) |
