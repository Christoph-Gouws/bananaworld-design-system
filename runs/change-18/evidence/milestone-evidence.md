# Milestone Evidence

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-020 — (not an epic: a CHANGE REQUEST, archived at runs/change-18/)
Milestone:      CR-DESIGN-SYSTEM-020 — ExportButton gets a real download link (kit 0.5.0)
Date:           2026-10-20
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ This is a Change Request. No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` was created. The kernel template is outside this session's directories; this follows `runs/change-17/evidence/milestone-evidence.md`.

## 1. Scope Implemented
Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-020.md` (layout **A**, **on-green**): optional `href`/`fileName` on `ExportButton`, version 0.5.0, README. Detail: `runs/change-18/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided
| Not done | Why |
|---|---|
| Any consumer pin bump | each app bumps to the merged sha in its own change |
| Manga Verde's report screens / export route | CR-MANGAVERDE-069 |
| Any write in `bananaworld-dc` | read-only |

## 3. Source Documents Consulted
| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-020.md` | whole plan |
| `runs/current/SESSION_HANDOVER.md` | standing rules |

## 4. Files and Folders Changed
**Cited:** `runs/change-18/output/changed-files.md`. Deleted: none.

## 5. Gates Completed
| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | ACs traced in `test-results.md` |
| Architecture Gate | **Pass** | plan §2 |
| File Inspection Gate | **Pass** | plan's cited `ExportButton.tsx` re-checked on fresh `main` `1fefb6c` |
| Database Gate | **Not applicable** | no database, no migration, no Postgres started |
| API and Integration Gate | **Pass** | barrel unchanged (export inventory test) |
| UX Gate | **Pass** | layout A; browser frames |
| Security and Permissions Gate | **Pass** | `pnpm audit --prod --audit-level=high` exit 0; devDependency only |
| Test Planning Gate | **Pass** | 23 new tests |

## 6. Tests Run
**Cited:** `runs/change-18/output/test-results.md` — **554/28** (baseline 531/26); typecheck clean; sensors 0 open.

## 7. Manual Verification
Real Edge run of the real component (`runs/change-18/evidence/browser-proof/proof.mjs`): 16/16 PASS.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Click Excel link | download named `report.xlsx` | `report.xlsx` | **Pass** |
| Tab, then Enter | link focused, download | same | **Pass** |
| Disabled + href | disabled button, no download | same | **Pass** |
| No href button | "Export coming soon" toast | same | **Pass** |
| Touch 390 px / mouse / tablet | ≥44 / 36 / 56 px | same | **Pass** |

Frames: `runs/change-18/evidence/frames/01-link-focused-mouse.png`, `02-toast-path-unchanged.png`, `03-touch-390.png`.

## 8. Security Review
No runtime dependency; the kit makes no network call; no secrets.

## 9. Code Quality Review
**Cited:** `runs/change-18/output/revision-review.md`.

## 10. Readable Code Review
**Cited:** `runs/change-18/output/readable-code-scorecard.md` — 11/11 PASS.

## 11. Centrality Review
**Cited:** `runs/change-18/output/centrality-scorecard.md` — 8/8 PASS.

## 12. Known Issues
**Cited:** `runs/change-18/output/known-issues.md` and `defect-log.md` — 0 open defects. No technical-debt file.

## 13. Deferred Items
| Item | Reason deferred | Approved by | Target |
|---|---|---|---|
| Consumer pin bumps (Manga Verde first, via CR-MANGAVERDE-069) | each app's own change | plan gate (owner) | each app |

## 14. Source Document Amendments
| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | CR-DESIGN-SYSTEM-020 entry | **Applied** |

**No Stage 07 amendment to a rule, contract or workflow, and why:** the change adds an optional presentational variant; no rule, contract or workflow changed.

## 15. Scorecards
**Cited:** `runs/change-18/evidence/global-milestone-scorecard.md` — 5 of 5 PASS.

## 16. Blocking Reports
None. The plan's premise held.

## 17. Handoff
```
Next agent:            The conductor (poll CI, merge on green). Then CR-MANGAVERDE-069.
Required next action:  Report the MERGED sha; Manga Verde pins it
Blocking status:       Not blocked
Follow-up created:     runs/change-18/output/known-issues.md
```

## 18. Status
```
PASS
```

## 19. Context Usage Summary
Written by `log-context-usage.mjs --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-020 --milestone CR-DESIGN-SYSTEM-020 --status Closed`. Measurement, not a budget.

## 20. Close-Down Confirmation
| Requirement | Done? |
|---|---|
| All required stage outputs produced | **Yes** — `runs/change-18/output/` |
| Session handover updated | **Yes** — names CR-DESIGN-SYSTEM-020 |
| Context Usage recorded | **Yes** — §19 |
| Owner notified | **Yes** — via the PR and the conductor. CI green is not claimed |
