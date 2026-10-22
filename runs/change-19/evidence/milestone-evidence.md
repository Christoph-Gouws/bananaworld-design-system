# Milestone Evidence

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-021 — (not an epic: a CHANGE REQUEST, archived at runs/change-19/)
Milestone:      CR-DESIGN-SYSTEM-021 — Keypad and ActionTile (kit 0.6.0)
Date:           2026-10-22
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ This is a Change Request. No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` was created. The kernel template is outside this worktree; this follows `runs/change-18/evidence/milestone-evidence.md`.

## 1. Scope Implemented
Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-021.md` (layout **A**, **on-green**): `Keypad`, `ActionTile`, version 0.6.0, README. `FigureTile` not added (`ListCard` covers it). Detail: `runs/change-19/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided
| Not done | Why |
|---|---|
| Any consumer pin bump | each app bumps to the merged sha in its own change (DC: CR-DC-256) |
| The market screens | CR-DC-256 |
| Any write in `bananaworld-dc` | read-only |
| `FigureTile` | an existing part covers it |

## 3. Source Documents Consulted
| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-021.md` | whole plan |
| `runs/current/SESSION_HANDOVER.md` | standing rules |

## 4. Files and Folders Changed
**Cited:** `runs/change-19/output/changed-files.md`. Deleted: none.

## 5. Gates Completed
| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | ACs traced in `test-results.md` |
| Architecture Gate | **Pass** | plan §2-§4 |
| File Inspection Gate | **Pass** | plan's cited files re-checked on fresh `main` `3953e6d` |
| Database Gate | **Not applicable** | no database, no migration, no Postgres started |
| API and Integration Gate | **Pass** | export inventory declares exactly two new names |
| UX Gate | **Pass** | layout A; browser frames at 375 and 1024 px |
| Security and Permissions Gate | **Pass** | audit clean after the override floor (known-issues K-1) |
| Test Planning Gate | **Pass** | 61 new tests + 11-mutant battery |

## 6. Tests Run
**Cited:** `runs/change-19/output/test-results.md` — **615/30** (baseline 554/28); typecheck clean; sensors 0 open; mutants 11/11 killed.

## 7. Manual Verification
Real Edge run of the real components (`runs/change-19/evidence/browser-proof/proof.mjs`): ALL PASS (34 checks). The page `browser-proof/main.tsx` is the state gallery (empty, typed + target, at max, disabled, live; tiles default / primary / disabled / badge / link; two ListCard figure cards).

| Step | Expected | Actual | Result |
|---|---|---|---|
| Keys measured at 375 and 1024 | each ≥ 64 px tall | yes | **Pass** |
| Tiles three across | ≥ 86 px, equal width, no label clipped | yes | **Pass** |
| Tap 1, 2; Backspace; 9; Delete; 5,0,0,0,7 | 12 → 1 → 19 → empty → 5000 | same | **Pass** |
| Tap link tile | navigates to its href | `#new-client` | **Pass** |
| axe on the page | 0 violations | 0 | **Pass** |

Frames: `runs/change-19/evidence/frames/01-gallery-375.png`, `02-gallery-1024.png`.

## 8. Security Review
No new dependency; the kit makes no network call; no secrets. The `next` peer override floor was raised for two new advisories (known-issues K-1).

## 9. Code Quality Review
**Cited:** `runs/change-19/output/revision-review.md`.

## 10. Readable Code Review
**Cited:** `runs/change-19/output/readable-code-scorecard.md` — 11/11 PASS.

## 11. Centrality Review
**Cited:** `runs/change-19/output/centrality-scorecard.md` — 8/8 PASS.

## 12. Known Issues
**Cited:** `runs/change-19/output/known-issues.md` and `defect-log.md` — 0 open defects (2 found by the browser run, fixed). No technical-debt file.

## 13. Deferred Items
| Item | Reason deferred | Approved by | Target |
|---|---|---|---|
| DC pin bump + re-export of the two names | DC's own change | plan gate (owner) | CR-DC-256 |

## 14. Source Document Amendments
| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | CR-DESIGN-SYSTEM-021 entry | **Applied** |

**No Stage 07 amendment to a rule, contract or workflow, and why:** the change adds two new optional presentational parts; no rule, contract or workflow changed.

## 15. Scorecards
**Cited:** `runs/change-19/evidence/global-milestone-scorecard.md` — 5 of 5 PASS.

## 16. Blocking Reports
None. The plan's premise held.

## 17. Handoff
```
Next agent:            The conductor (poll CI, merge on green). Then CR-DC-256.
Required next action:  Report the MERGED sha; DC pins it inside CR-DC-256
Blocking status:       Not blocked
Follow-up created:     runs/change-19/output/known-issues.md
```

## 18. Status
```
PASS
```

## 19. Context Usage Summary
Written by `log-context-usage.mjs --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-021 --milestone CR-DESIGN-SYSTEM-021 --status Closed`. Measurement, not a budget.

## 20. Close-Down Confirmation
| Requirement | Done? |
|---|---|
| All required stage outputs produced | **Yes** — `runs/change-19/output/` |
| Session handover updated | **Yes** — names CR-DESIGN-SYSTEM-021 |
| Context Usage recorded | **Yes** — §19 |
| Owner notified | **Yes** — via the PR and the conductor. CI green is not claimed |
