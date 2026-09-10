# Known issues — CR-DESIGN-SYSTEM-010

> Open at close, and pre-existing conditions re-verified in this session. **0 of these block the
> change.** Nothing here is a defect in what was built — for those, see `defect-log.md` (0 open).

## A · Carried and unresolved — not this change's, re-verified

| Id | What | State |
|---|---|---|
| **OQ-8** | Whether `max-width` actually caps a `<td>` under `table-layout: auto`. `happy-dom` does no layout and **no browser binary is executable from this sandbox**. Bounded: the failure mode is "the column does not narrow" — it cannot move any existing render — and the named fallback (an inner `<span class="block truncate">`) is recorded and untaken. | **Still open**, untouched here. One-click probe: `runs/change-08/output/truncate-probe.html` |
| **OQ-3** (this change's) | Should a trigger say something when a filter holds an id the list no longer offers? Today it reads the raw id as a label — what the toolbar has always done. Inventing a "(retired)" affix is a new idea and a wording decision, not a defect fix. | **Deliberately not taken.** `technical-debt.md` TD-3 |
| **TD-1** from CR-009 | The grid's tick-list and the shipped toolbars still differ in their **top row** until DC and the CRM each pass `selectAll: "master"` in their own change. | **Still open — but narrower.** This change makes the two rows behave identically wherever `master` IS declared; the remaining difference is which row a screen asks for |

## B · Estate tooling, re-verified in this session

| # | What | Evidence |
|---|---|---|
| B-1 | **`quality-sensors.mjs` silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout** — `.` does not match `\r`, so `(.*)$` never anchors, and the scorecard returns BLOCKED with correct justifications sitting in the source. Worked around, as CR-009 did, by normalising the changed files to **LF** before running (git stores LF anyway, so the commit is unaffected). **Estate tooling bug, not fixed here.** | Reproduced: the sensor reports 4 justifications only after normalisation |
| B-2 | **`CE-01`/`CE-05` and `CE-08`/`RC-09` are not scanned at all for this project** — no `componentGlobs` or `wiringGlobs` are configured. Their `PASS` rows are a scan that did not run, and the scorecards say so. | `quality-sensors.mjs` prints `[~] … NOT scanned` for both pairs |
| B-3 | 🔴 **A THIRD CRLF trap, this one in this session's own harness.** The mutation battery's multi-line anchors matched nothing on a CRLF checkout — 3 of 10 mutations never ran. Same root cause as CR-009's `defect-log.md` D-1, arriving from the other direction (that one hit the restore, this hit the match). **Fixed here** and written up. | `defect-log.md` **D-1** |

**The general rule the estate now has three instances of:** on Windows, *normalise to LF before
matching, and write original bytes back*. It applies to every text-manipulating harness, and the
self-check that makes a skipped step LOUD is what caught it both times.

## C · Pre-existing repository drift — all re-verified, all out of lane

| # | What | State |
|---|---|---|
| C-1 | **No prettier config**, so `pnpm format:check` fails repo-wide. It is **not** a CI job. | unchanged |
| C-2 | **No `lint` script and no ESLint config.** `pnpm lint` cannot be run and is not claimed anywhere in this pack. | unchanged |
| C-3 | `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as **modified** in `git status` with a **zero-line content diff** — a CRLF artifact. **Not staged, not part of this change.** | unchanged |
| C-4 | **4 of the 6 `pnpm.auditConfig.ignoreGhsas` entries are now inert** (the three next advisories and the sharp one, all superseded by CR-009's overrides). Retiring an owner-approved security exception is a posture change in its own right, not a side effect of a defect fix. | **Still owed as a standalone housekeeping change** — the owner's call |
| C-5 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — the **ninth** change to raise it. Creating it is a governance decision for the owner, not something a change may invent. The plan's six-seam map (§4) is the record meanwhile and is archived here. | unchanged |
| C-6 | **There is no decision-log entry for CR-DESIGN-SYSTEM-008** — the log jumps 007 → 009. Noted again; back-filling another change's decision record is not this change's to do. | unchanged |

⚠ **`audit:deps` DOES exist** in `package.json` and was run (**exit 0, 0 blocking**). CR-009's
handover point 14 listed "no `audit:deps` script" as pre-existing drift; that is **no longer true** —
it is present and green.

## D · Consumer reach, stated because it is a limit and not a claim

- **No consumer suite was executed, and nothing in this pack claims one was.** Ninth change to record
  it. `bananaworld-dc` is readable and was **read only** — four reads, and nothing written, staged,
  committed or formatted there. The CRM, RMS, org-admin and Manga Verde **cannot be read from a build
  worktree at all**, and no claim is made about them beyond what §4 of `implementation-summary.md`
  says.
- ⚠ **Recorded pin values disagree between documents across this estate — read the app's own
  `package.json`.** Done here: `bananaworld-dc/package.json:55` → `6ed975d…`.

## E · Still owed from earlier changes — none affected by this one

The CRM's pin bump + `dcLabel` adoption (CR-005; the other half of **CR-CRM-015**'s unblock, blocked
since 2026-08-18) · DC's pin bumps for CR-002 and CR-004, then CR-DC-052 · the CRM's seven-point
saved-view obligation (CR-003) · CR-001's colour-stage chips · **DC's dead byte-for-byte private copy
of `src/lib/table-controls.ts`** that nothing in DC imports (DC's lane to delete) · and, new after this
merges, **DC's and the CRM's `selectAll: "master"` adoption**, which is TD-1's other half.
