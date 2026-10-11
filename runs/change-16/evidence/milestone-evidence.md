# Milestone Evidence

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-018 — (not an epic: a CHANGE REQUEST, archived at runs/change-16/)
Milestone:      CR-DESIGN-SYSTEM-018 — a navigation busy signal: a top bar and a spinner on the clicked link
Date:           2026-10-11
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ **This is a Change Request, not an epic or a milestone.** No `runs/epic-NN/`, no `milestone-NN/`, nothing under `runs/current/epic-plan/` was created.
> ⚠ The kernel template file is outside this session's allowed directories; this file follows the filled `runs/change-12/evidence/milestone-evidence.md`, section for section.

---

## 1. Scope Implemented

Built to the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-018.md` (layout **A**, **on-green**): `NavigationBusyProvider`, `NavigationBusyBar`, `useNavigationBusy`, and an optional `pendingIndicator` prop on `Link`; version 0.3.0; README section. Detail: `runs/change-16/output/implementation-summary.md`.

## 2. Out-of-Scope Items Avoided

| Not done | Why |
|---|---|
| Any consumer wiring or pin bump | each app opts in and pins the merged sha in its own change |
| Suspense boundary, `loading.tsx`, `useSearchParams`, history patching | the fault being removed; a guard test greps for them |
| `router.push` / back-forward coverage | named in the owner brief as not included |
| Any write in `bananaworld-dc` | read-only; only its `playwright-core` was used to drive Edge |

## 3. Source Documents Consulted

| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-018.md` | whole plan |
| `runs/current/SESSION_HANDOVER.md` | standing rules (additive lane, CRLF snapshot artefact) |

## 4. Files and Folders Changed

**Cited:** `runs/change-16/output/changed-files.md` — 10 code/test files plus the fixture app and paper trail. Deleted: none.

## 5. Gates Completed

| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | plan approved; ACs traced in `test-results.md` |
| Architecture Gate | **Pass** | plan §2–§3 |
| File Inspection Gate | **Pass** | plan's cited files re-checked on fresh `main` `820c980` |
| Database Gate | **Not applicable** | no database, no migration, no Postgres started |
| API and Integration Gate | **Pass** | export surface only grew (inventory test) |
| UX Gate | **Pass** | layout A approved; drawn in a real browser (§7) |
| Security and Permissions Gate | **Pass** | presentation only; no dependency changed (local audit not run, CI runs it) |
| Test Planning Gate | **Pass** | plan §5 executed; mutation battery 7/7 |

## 6. Tests Run

**Cited:** `runs/change-16/output/test-results.md` — **517/25** (baseline 464/23); typecheck clean; mutation battery **7/7**; sensors 0 open; browser proof 26/26. Not run, stated: local dependency audit (sandbox refused), lint (none in package).

## 7. Manual Verification

Real browser (Edge, built Next 15.5 app, no `loading.tsx`): `runs/change-16/evidence/nav-busy-fixture/proof.mjs`. Frames in `runs/change-16/evidence/frames/`.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Desktop 1280×800, idle | no bar, no role | `frames/01-desktop-idle.png` | **Pass** |
| Click "Slow page" (1.5 s server) | yellow bar, `role=progressbar`, spinner on that link only, old page still shown, no layout shift | `frames/02-desktop-pending.png` | **Pass** |
| Page lands | bar clears, spinner gone, `aria-busy` false | `frames/03-desktop-landed.png` | **Pass** |
| Link with `pendingIndicator={false}` | bar yes, spinner no | `frames/04-desktop-optout-pending.png` | **Pass** |
| Tablet 820×1180 | 0 prefetch requests before the click; 4px bar, 16px ring | `frames/05`, `06`, `07` | **Pass** |
| Reduced motion | still full-width line, still ring | `frames/08-desktop-reduced-motion-pending.png` | **Pass** |
| 64 revalidating server-action submissions | button returns from "Working..." every time | 64/64 | **Pass** |

## 8. Security Review

No dependency changed; no application security surface. The audit job runs in CI.

## 9. Code Quality Review

**Cited:** `runs/change-16/output/revision-review.md`.

## 10. Readable Code Review

**Cited:** `runs/change-16/output/readable-code-scorecard.md` — 11/11 PASS.

## 11. Centrality Review

**Cited:** `runs/change-16/output/centrality-scorecard.md` — 8/8 PASS.

## 12. Known Issues

**Cited:** `runs/change-16/output/known-issues.md` and `defect-log.md` — 0 open defects. No technical-debt file.

## 13. Deferred Items

| Item | Reason deferred | Approved by | Target |
|---|---|---|---|
| Org Admin mounts the provider | its own change (CR-ORGADMIN-015) | owner ruling 2026-10-11 | Org Admin |
| DC mounts the provider | only if its draft-PR proof shows the stall | owner ruling | DC |
| `router.push` / back-forward | not asked for | plan gate (owner) | later kit change |

## 14. Source Document Amendments

| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | CR-DESIGN-SYSTEM-018 entry | **Applied** |

**No Stage 07 amendment to a rule, contract or workflow, and why:** the change adds opt-in presentation feedback; no rule, contract or workflow changed.

## 15. Scorecards

**Cited:** `runs/change-16/evidence/global-milestone-scorecard.md` — 5 of 5 PASS.

## 16. Blocking Reports

None. The plan's premise held.

## 17. Handoff

```
Next agent:            The conductor (poll CI, merge on green). Then Org Admin (CR-ORGADMIN-015).
Required next action:  Org Admin pins the MERGED sha and mounts the provider; see known-issues.md S1
Blocking status:       Not blocked
Follow-up created:     S1–S4 — runs/change-16/output/known-issues.md
```

## 18. Status

```
PASS
```

## 19. Context Usage Summary

Written by `log-context-usage.mjs --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-018 --milestone CR-DESIGN-SYSTEM-018 --status Closed`. Measurement, not a budget (MWP Rule 10.5). The row is in `organization/CONTEXT_USAGE_LOG.md`.

## 20. Close-Down Confirmation

| Requirement | Done? |
|---|---|
| All required stage outputs produced | **Yes** — each its own file under `runs/change-16/output/` |
| Session handover updated | **Yes** — `SESSION_HANDOVER.md` + `active-milestone.md` name CR-DESIGN-SYSTEM-018 |
| Context Usage recorded | **Yes** — §19 |
| Owner notified | **Yes** — via the PR and the conductor. CI green is not claimed |
