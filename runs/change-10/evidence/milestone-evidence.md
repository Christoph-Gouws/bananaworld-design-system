# Milestone Evidence

> _Fill this by **copying the template and editing the values in** — never re-type the boilerplate (Kernel Rule 9 artifact mechanics). Where a section reports on another artifact (test log, QA report, scorecard), cite it — path + status + counts — rather than restating its content. Every section still completes in full; the rule changes production mechanics, not evidence requirements._

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-013 — (not an epic: a CHANGE REQUEST, archived at runs/change-10/)
Milestone:      CR-DESIGN-SYSTEM-013 — "Select all" ticks every option, so the reader can untick what they do not want
Date:           2026-10-06
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ **This is a Change Request, not an epic or a milestone.** The two fields above carry the CR id because the
> close gate greps for it; **no `runs/epic-NN/` folder, no `milestone-NN/` folder and nothing under
> `runs/current/epic-plan/` was created.**

> ⚠ **The kernel template file could not be opened from this worktree** (outside the session's allowed
> directories). This file copies the **filled** template from `runs/change-09/evidence/milestone-evidence.md`,
> section for section, with the values edited in.

---

## 1. Scope Implemented

Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-013.md` (layout **B**, **on-green**):
an opt-in `selectAll: "allTicked"` mode for both tick-lists (grid filter cell, list toolbar) — every option ticked
while nothing is narrowed, unticking one hides just that one (stored as an **exclude list**), Select all re-ticks
everything, unticking it clears every tick (an uncommitted draft; the report keeps showing everything).
Detail: `runs/change-10/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided

| Not done | Why |
|---|---|
| Making `"allTicked"` the default | lane rule — never change a default; each app flips it in its own change with its parser (plan §2) |
| Any consumer pin bump / any DC or CRM code | follow-ups S1/S2, `runs/change-10/output/known-issues.md` §C |
| Touching `MultiSelectAllRow`, `SelectCell`, `MultiSelectCell`, `MultiSelectFilterControl`'s behaviour | the byte-identity proof depends on it (`revision-review.md`) |
| Teaching `matchesFilter` that "every option" = "not narrowed" for include lists | changes every existing caller |
| Retiring the 4 inert `ignoreGhsas` entries | owner's housekeeping call; this change added an override, not an ignore |
| Any write in `bananaworld-dc` | read-only sibling: files read; `playwright-core` and `tailwindcss` loaded from its `node_modules` for the browser proof; nothing written there |

## 3. Source Documents Consulted

| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-013.md` | the whole plan — §1 states/transitions, §3 decision, §4 shapes, §5 proof, §7 map, Rule sites |
| `runs/current/mockups/CR-DESIGN-SYSTEM-013/{option-b,comparison}.html` | the approved layout B, three states |
| `runs/current/SESSION_HANDOVER.md` | items 1–15 (CRLF rule, `{Escape}` before Clear, harness re-run recipe, additive lane) |
| `runs/change-09/output/byte-identity-*` | the committed harness, re-run |
| `bananaworld-dc/tailwind.config.ts:14-66` (read-only) | theme copied into the proof page's Tailwind config |

## 4. Files and Folders Changed

**Cited:** `runs/change-10/output/changed-files.md` — **16 code files, +1,363 / −51** (9 source incl. 2 new, 5
specs incl. 2 new, `package.json`, `pnpm-lock.yaml`). Deleted: none.

## 5. Gates Completed

| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | plan gate approved (layout B, on-green); 16 ACs traced in `test-results.md` §2 |
| Architecture Gate | **Pass** | plan §3/§7 — exclude-list decision and the cross-app map; D-1 module placement |
| File Inspection Gate | **Pass** | every cited site re-verified on `main@26fa005` before any edit; all exact (`known-issues.md` §A) |
| Database Gate | **Not applicable** | no database in this package; no migration; no Postgres started |
| API and Integration Gate | **Pass** | the value shape + wire encoding (`f_<key>_not`) stated in `grid-view.ts`; old readers widen |
| UX Gate | **Pass** | mockup gate passed before the build (B); drawn in a real browser (§7) |
| Security and Permissions Gate | **Pass** | no auth surface; audit exit 0 after D-4 |
| Test Planning Gate | **Pass** | plan §5 executed in full: baseline, byte-identity, snapshot, named callers, pure specs, mutation battery |

## 6. Tests Run

**Cited:** `runs/change-10/output/test-results.md` §1 — baseline **405/19**; final **450/21**; typecheck clean;
**10,029 shapes 0 differences**; snapshot zero-line diff; **15/15 mutations**; sensors **0 open**; audit **exit 0**;
real browser **17/17**. Not run, stated: `pnpm lint` (no lint script), consumer suites (unreadable/unrunnable).

## 7. Manual Verification

Driven in **real Microsoft Edge** by `runs/change-10/evidence/browser-proof/proof.mjs`: the real package components
(no page, component or router stubbed), compiled with the consumer's Tailwind theme, served by vite, clicked.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Open "Batch (allTicked)" | every batch ticked; "Select all · All 6"; "Nothing hidden" | as expected — `frames/01-grid-state1-nothing-narrowed.png` | **Pass** |
| Untick SBF-2610-003 | only it clear; dash "5 of 6"; box "5 of 6 batches"; "Hidden: SBF-2610-003"; stored `excluded` | as expected — `frames/02-grid-state2-one-unticked.png` | **Pass** |
| Select all (dash) → Select all (ticked) | all re-ticked, then every tick clear; "Nothing ticked — showing everything…"; value `{}` | as expected — `frames/03-grid-state3-select-all-unticked.png` | **Pass** |
| Tick two from nothing | only those two, today's include list | as expected — `frames/04-grid-ticked-two-from-nothing.png` | **Pass** |
| A column that did not opt in | today's list, nothing ticked, "None chosen" | as expected — `frames/05-grid-default-column-unchanged.png` | **Pass** |
| Toolbar: untick one batch | table loses only it; the row with no batch stays; "Clear" shows | as expected — `frames/06-toolbar-one-unticked-table.png` | **Pass** |

## 8. Security Review

- Triggered: **Yes** (dependency audit). Outcome: **Pass.** Pure presentation, no network/auth/secret/env. One new
  high advisory on `main` (GHSA-68fv-2mgg-jv7q) fixed by an override floor, not an ignore (decision log D-4).

## 9. Code Quality Review

**Cited:** `runs/change-10/output/revision-review.md` — **ACCEPT**; 4 simplifications applied, 7 rejected with reasons.

## 10. Readable Code Review

**Cited:** `runs/change-10/output/readable-code-scorecard.md` — generated by `quality-sensors.mjs`; **11/11 PASS**
(6 machine, 5 judgment); 14 files scanned, 0 open, 4 justified (pre-existing), 0 weak.

## 11. Centrality Review

**Cited:** `runs/change-10/output/centrality-scorecard.md` — **8/8 PASS** (4 machine, 4 judgment).

## 12. Known Issues

**Cited:** `runs/change-10/output/known-issues.md` and `defect-log.md` — **0 open defects**; 4 found and fixed or
contained (D-1 archive slot, D-2 file size, D-3 audit, D-4 proof tooling). Debt: `runs/change-10/technical-debt.md`
TD-1, TD-2.

## 13. Deferred Items

| Item | Reason deferred | Approved by | Target Milestone |
|---|---|---|---|
| DC adopts the mode + teaches `_not` | consumer's own lane; plan §7 S1 | plan gate (owner) | a new CR-DC |
| CRM adopts the mode + stores the exclusion | consumer's own lane; plan §7 S2 | plan gate (owner) | a new CR-CRM |

## 14. Source Document Amendments

| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | CR-DESIGN-SYSTEM-013 entry: ask, plan-gate decision, layout B, on-green, clarify (none), D-1…D-5 | **Applied** |

**No Stage 07 amendment to a rule, contract or workflow, and why:** no rule changed (additive-only obeyed); no
contract changed incompatibly — the value shapes gained optional fields and the stored contract gained a sibling,
both stated in the code's own contract comments; no workflow changed. The cross-system register that would carry
S1/S2 still does not exist (owner decision); plan §7 is the record.

## 15. Scorecards

**Cited:** `runs/change-10/evidence/global-milestone-scorecard.md` — **5 of 5 PASS**.

## 16. Blocking Reports

None. No `CHANGE_BLOCKED` (the plan's premise held); no `NEEDS_OWNER` (no decision outside the plan arose — D-4
applies the owner's standing remedy, D-5 preserves a record rather than deciding anything).

## 17. Handoff

```
Next agent:            The conductor (poll CI, merge on green). Then DC and CRM, each in its own change.
Required next action:  None from this lane.
Blocking status:       Not blocked
Follow-up created:     S1 (CR-DC), S2 (CR-CRM) — runs/change-10/output/known-issues.md §C
```

## 18. Status

```
PASS
```

## 19. Context Usage Summary

Written by `log-context-usage.mjs --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-013
--milestone CR-DESIGN-SYSTEM-013 --status Closed`, measured from this session's transcript:

```
| 2026-10-06 | sw | bananaworld-design-system | CR-DESIGN-SYSTEM-013 | CR-DESIGN-SYSTEM-013 | opus-5-5 | 836 | 654334 | 100865074 | 1283657 | 102803901 | 380k / 190% of 200k | 1 | Closed |
```

Measurement, not a budget (MWP Rule 10.5).

## 20. Close-Down Confirmation

| Requirement | Done? |
|---|---|
| All required stage outputs produced | **Yes** — each as its own file under `runs/change-10/output/` |
| Session handover updated | **Yes** — `runs/current/SESSION_HANDOVER.md` + `active-milestone.md` name CR-DESIGN-SYSTEM-013 |
| Context Usage recorded | **Yes** — §19 |
| Owner notified | **Yes** — via the PR and the conductor. CI green is **not** claimed; the conductor polls and merges |
