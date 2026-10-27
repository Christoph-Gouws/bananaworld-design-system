# Milestone Evidence

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-023 — (not an epic: a CHANGE REQUEST, archived at runs/change-21/)
Milestone:      CR-DESIGN-SYSTEM-023 — LinkedRecords and DocumentHeader `linked` (kit 0.7.0)
Date:           2026-10-27
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ This is a Change Request. No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` was created.

## 1. Scope Implemented
Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-023.md` (layout **A**, **on-green**): `LinkedRecords`, `LinkedRecordsItem`, `DocumentHeader linked`, version 0.7.0, README. Detail: `runs/change-21/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided
| Not done | Why |
|---|---|
| Any consumer pin bump | DC pins the merged sha inside CR-DC-223 |
| Options B and C | not picked |
| Any write in `bananaworld-dc` | read-only |

## 3. Source Documents Consulted
| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-023.md` | whole plan |
| `runs/current/SESSION_HANDOVER.md` | standing rules |

## 4. Files and Folders Changed
**Cited:** `runs/change-21/output/changed-files.md`. Deleted: none.

## 5. Gates Completed
| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | ACs traced in `test-results.md` |
| Architecture Gate | **Pass** | plan §1-§4 |
| File Inspection Gate | **Pass** | plan's cited files re-checked on fresh `main` `bb6c22e` |
| Database Gate | **Not applicable** | no database, no migration, no Postgres started |
| API and Integration Gate | **Pass** | export inventory declares exactly two new runtime names |
| UX Gate | **Pass** | layout A; frames at 1270, 820 and 375 px |
| Security and Permissions Gate | **Pass** | no new dependency; refused item reveals nothing |
| Test Planning Gate | **Pass** | 56 new tests + 10-mutant battery |

## 6. Tests Run
**Cited:** `runs/change-21/output/test-results.md` — **671/32** (baseline 615/30); typecheck clean; mutants 10/10 killed.

## 7. Manual Verification
Real Edge run of the real components (`runs/change-21/evidence/browser-proof/proof.mjs`): ALL PASS (33 checks). Page `browser-proof/main.tsx` shows the header with and without the line, and the empty, loading and error states.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Hover DSP-00131 at 1270 px | card with type, status, rows after the delay | shown | **Pass** |
| Tab to it; Escape | card shows; Escape hides | same | **Pass** |
| Touch 820 / 375 px | info buttons present, ≥ 40 × 40; none on mouse | yes | **Pass** |
| Tap info | short bottom panel with rows and Open link; Close closes | yes | **Pass** |
| Refused item | lock, no link, no button | yes | **Pass** |
| Line placement; header without it | below the 4 slots, outside `<dl>`; plain `<dl>` | yes | **Pass** |
| 375 px width; axe | no sideways scroll; 0 violations | yes | **Pass** |

Frames: `runs/change-21/evidence/frames/01-hover-card-1270.png`, `02-header-with-linked-1270.png`, `03-sheet-820.png`, `04-sheet-375.png`, `05-header-with-linked-820.png`, `06-header-with-linked-375.png`.

## 8. Security Review
No new dependency; no network call; no secrets. A refused item draws only a lock and its number.

## 9. Code Quality Review
**Cited:** `runs/change-21/output/revision-review.md`.

## 10. Readable Code Review
**Cited:** `runs/change-21/output/readable-code-scorecard.md` — 9/11 PASS; 2 BLOCKED rows are inherited `DocumentHeader.tsx` size (known-issues K-2).

## 11. Centrality Review
**Cited:** `runs/change-21/output/centrality-scorecard.md` — 8/8 PASS.

## 12. Known Issues
**Cited:** `runs/change-21/output/known-issues.md` and `defect-log.md` — 0 open defects. No technical-debt file.

## 13. Deferred Items
| Item | Reason deferred | Approved by | Target |
|---|---|---|---|
| DC pin bump, re-export, the box itself | DC's own change | plan gate (owner) | CR-DC-223 |

## 14. Source Document Amendments
| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | CR-DESIGN-SYSTEM-023 entry | **Applied** |

**No Stage 07 amendment to a rule, contract or workflow, and why:** the change adds an optional presentational part and one optional prop; no rule, contract or workflow changed.

## 15. Scorecards
**Cited:** `runs/change-21/evidence/global-milestone-scorecard.md`.

## 16. Blocking Reports
None. The plan's premise held.

## 17. Handoff
```
Next agent:            The conductor (poll CI, merge on green). Then CR-DC-223.
Required next action:  Report the MERGED sha; DC pins it inside CR-DC-223
Blocking status:       Not blocked
Follow-up created:     runs/change-21/output/known-issues.md
```

## 18. Status
```
PASS
```

## 19. Context Usage Summary
Written by `log-context-usage.mjs --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-023 --milestone CR-DESIGN-SYSTEM-023 --status Closed`. Measurement, not a budget.

## 20. Close-Down Confirmation
| Requirement | Done? |
|---|---|
| All required stage outputs produced | **Yes** — `runs/change-21/output/` |
| Session handover updated | **Yes** — names CR-DESIGN-SYSTEM-023 |
| Context Usage recorded | **Yes** — §19 |
| Owner notified | **Yes** — via the PR and the conductor. CI green is not claimed |
