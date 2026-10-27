# Milestone Evidence

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-022 — (not an epic: a CHANGE REQUEST, archived at runs/change-20/)
Milestone:      CR-DESIGN-SYSTEM-022 — batched review follow-up, six findings (kit 0.7.1)
Date:           2026-10-27
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ This is a Change Request. No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` was created.

## 1. Scope Implemented
Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-022.md` (layout **A**, **on-green**): the six findings, each judged. Detail: `runs/change-20/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided
| Not done | Why |
|---|---|
| Any consumer pin bump | consumers pin the merged sha in their own change |
| Retiring the four inert `ignoreGhsas` | owner's separate call |
| Any code change for F6, any lockfile change | ratified as built / notes only |
| Any write in `bananaworld-dc` | read-only |

## 3. Source Documents Consulted
| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-022.md` | whole plan |
| `runs/current/SESSION_HANDOVER.md` | standing rules |
| Stage 07: `source-documents/active/*` | no rule, contract or workflow changed; only the decision log gained an entry |

## 4. Files and Folders Changed
**Cited:** `runs/change-20/output/changed-files.md`. Deleted: `.gitleaksignore`.

## 5. Gates Completed
| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | each finding judged in `test-results.md` |
| Architecture Gate | **Pass** | plan §2 |
| File Inspection Gate | **Pass** | plan's cited lines re-checked on fresh `main` `5c14f37` |
| Database Gate | **Not applicable** | no database, no migration, no Postgres started |
| API and Integration Gate | **Pass** | no export added or removed |
| UX Gate | **Pass** | layout A; frames below |
| Security and Permissions Gate | **Pass** | no dependency change; the two raised floors kept and written up; audit exit 0 |
| Test Planning Gate | **Pass** | new tests + Edge run that fails on old code |

## 6. Tests Run
**Cited:** `runs/change-20/output/test-results.md` — **682/35** (baseline 671/32); typecheck clean; audit exit 0; Edge ALL PASS (old `Link`: 12 FAILED).

## 7. Manual Verification
Real Edge run of the real `Link` inside `NavigationBusyProvider` and the real `ActionTile` (`runs/change-20/evidence/browser-proof/proof.mjs`; only `next/link` is replaced by the test stand-in, since there is no Next router): ALL PASS. Page `browser-proof/main.tsx`.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Wait 260 ms on an inline link in a sentence | ring shown; nothing moves | same | **Pass** |
| Same on a `flex items-center gap-2` icon + label row | ring just after "Orders"; icon, label, anchor, next sibling do not move | same | **Pass** |
| Same on a `flex justify-between` label + badge | badge stays at the right edge | same (it moved 118 px on old code) | **Pass** |
| Same on a block link with two block children | anchor height and everything below unchanged | same (it grew 24 px on old code) | **Pass** |
| Same on an `ActionTile` with `href` | tile content does not shift | same (3 px on old code) | **Pass** |
| Wait ends | ring gone | gone | **Pass** |
| Desktop 1280 px and tablet 820 px (larger ring) | all of the above | same | **Pass** |

Frames (after): `runs/change-20/evidence/frames/desktop-2-s2-waiting.png`, `desktop-3-s3-waiting.png`, `desktop-4-s4-waiting.png`, `desktop-5-s5-waiting.png`, `tablet-2-s2-waiting.png`, with `…-idle.png` beside each. Frames (old code, for comparison): `runs/change-20/evidence/frames/before/`.

## 8. Security Review
No dependency changed; lockfile untouched. Next floor `<15.5.28` (GHSA-2464-fhr4-w9xw critical, GHSA-p3m5-59mp-jv5r high) and sharp floor `<0.35.5` (GHSA-wq5f-xc86-pv6w high) kept and written up. The gitleaks exemption now names one public hash, not a path or pattern. Gitleaks itself was not run here (known-issues K-1).

## 9. Code Quality Review
**Cited:** `runs/change-20/output/revision-review.md`.

## 10. Readable Code Review
**Cited:** `runs/change-20/output/readable-code-scorecard.md` — 10/11 PASS; the 1 BLOCKED row is inherited `GridFilterRow.tsx` size (this change shrinks it).

## 11. Centrality Review
**Cited:** `runs/change-20/output/centrality-scorecard.md` — 8/8 PASS.

## 12. Known Issues
**Cited:** `runs/change-20/output/known-issues.md` and `defect-log.md` — 0 open defects. No technical-debt file.

## 13. Deferred Items
| Item | Reason deferred | Approved by | Target |
|---|---|---|---|
| Org Admin (and any app that mounted a provider) picks up 0.7.1 | consumer's own pin bump | plan gate (owner) | that app's own change |
| Retire the four inert `ignoreGhsas` | owner's housekeeping call | handover item 12 | owner |
