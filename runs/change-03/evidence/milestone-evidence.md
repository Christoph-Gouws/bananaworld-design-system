# Milestone evidence — CR-DESIGN-SYSTEM-003

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's workspace and the read is refused, so the template could not be copied and
> filled in as instructed. This file was authored to serve the same purpose and follows the stated
> rule: it **cites** each discrete artifact by path, status and counts rather than restating it. Third
> change to hit this limit (CR-001, CR-002, and here). See `known-issues.md` B-3.

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-003** — a toolbar filter can hold one value; let it hold several, without disturbing the screens that hold one |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-03/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-003`, off `origin/main` @ `9aa20f7` |
| Approved layout | **A** — the closed trigger reads `Cape Town +2` (owner, 2026-08-14) |
| Ship mode | **on-green** |
| Date | 2026-08-14 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` |
| Tests | `pnpm test` | **189 passed / 11 files**, 0 failed, 0 skipped (baseline before any edit: **115 / 9**) |
| New specs | — | **+74**, of which **36 are characterisation specs written before a line of source changed** |
| Existing specs edited | — | **0** |
| Additive — DOM | vitest snapshot of the 7 toolbar screens | **hash identical before and after the source edit**: `ce7bd849…` |
| Additive — diff | `git diff --numstat -- src/` | **+347 / −26**; every one of the 26 deletions itemised in `changed-files.md` §1.1 |
| Dependency audit | Node reproduction of CI's `pnpm audit --prod --audit-level=high` | **PASS** — 6 highs, all 6 on the standing owner-approved ignore list, **0 new**. `pnpm audit` itself is permission-blocked and is **not** claimed as run (`known-issues.md` B-2) |
| Lint | — | **no `lint` script and no eslint config exist in this package** — `known-issues.md` C-2, recorded not invented |
| Format | `pnpm format:check` | Pre-existing repo-wide drift; all five edited files **already failed at `HEAD`** (verified by stash). Not a CI job. `known-issues.md` C-1 |
| Migration | — | **N/A — this package has no database.** No migration file, nothing classified, nothing promoted |
| Throwaway Postgres | — | **never started**; nothing to rehearse, nothing left behind |
| CI | GitHub Actions | Not waited for, by instruction. The conductor polls and merges |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-03/output/test-results.md` | **PASS** | 189 passed / 11 files; +74 new; 0 failed; 0 skipped; **0 existing tests modified**; snapshot hash quoted before and after |
| `runs/change-03/output/qa-report.md` | **PASS** | **17 acceptance criteria, 17 traced to a verdict** — 15 PASS, 2 N/A each with a stated cause; 11 call sites addressed individually; 8 exclusions held item by item; 7 standards held |
| `runs/change-03/output/defect-log.md` | **0 open** | 4 found, 4 closed (1 high — prevented by mutation-testing the D-5 guard; 1 medium; 2 low); 8 "not a defect" checks recorded; 3 items deferred to their owners |
| `runs/change-03/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy, no database. 5 substitute proofs; 4 items honestly deferred to the first adopting screen |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-03/output/revision-review.md` | **PASS** | 19 plan clauses checked, 19 built; 1 deviation recorded (the menu's height cap); 7 review dimensions; 6 over-build temptations declined |
| `runs/change-03/output/simplification-opportunities.md` | **PASS** | 6 candidates: **1 accepted, 5 rejected** with reasons; 6 simplifications recorded as built-in |
| `runs/change-03/output/accepted-refactors.md` | **1 accepted** | `allOptionLabel` — the unset wording defined once for both kinds; proved by an unchanged snapshot hash rather than argued |
| `runs/change-03/output/readable-code-scorecard.md` | **12 / 12 PASS** | Two weak points stated honestly rather than trimmed (file length; comment density) |
| `runs/change-03/output/centrality-scorecard.md` | **12 / 12 PASS** | 6 cross-system seams mapped; **0 coordinated multi-app moves created** |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-03/output/changed-files.md` | complete | **5 source modified (+347 / −26), 3 test files added (+910), 0 source added or deleted**; all 26 deletions itemised against the plan clause that required each; 8 files considered and left untouched with reasons; 1 throwaway file created and deleted |
| `runs/change-03/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **15 / 15 of the plan's cited facts verified exact; nothing stale** |
| `runs/change-03/output/known-issues.md` | **0 open defects, 0 open decisions** | 4 session limits (B), 5 pre-existing drift items (C), 5 watch-items (D) |

## 3. The additive claim — the whole risk of this change

Four apps pin this package by git sha and each bumps when it chooses, so "every existing caller renders
byte-identically" is the lane rule, not a preference. **Proved five ways, not asserted:**

1. **There was no test for this engine at all.** So 36 characterisation specs were written and passed
   **before** a line of source changed, and pass unchanged after (D-11). Without them, "unchanged"
   would have been an opinion.
2. **The seven toolbar screens are snapshotted, and the snapshot file hash did not move** —
   `ce7bd849…` before the edit, `ce7bd849…` after. A single changed class, attribute or element in any
   of those seven trees fails it.
3. **The four org-admin engine-only screens** — which the request did not know about — are answered at
   the type level: every `FilterValue` reader in the estate uses positive narrowing, so a widened union
   cannot break one (`qa-report.md` §4).
4. **All 26 deleted source lines are itemised**, each a rewrite of an arm the plan named. No
   behavioural line was removed.
5. **Zero existing tests were edited.** The 115 that existed still pass exactly as written.

**Nothing renders differently until a screen declares the new kind, and no screen declares it.**

## 4. The trap — saved availability views, and who owns which half

CRM shipped saved availability views on 2026-08-10 (CR-CRM-011) and persists every toolbar filter value
per rep, in a table this package cannot see. Both failure directions are **silent widening**.

| Half | Owner | State |
|---|---|---|
| Keep the stored shape readable both ways | **This change** | Done: one value stores as a bare string, so an old build reads it correctly for free; only the genuinely multi-value case needs new reader code |
| Report when a stored shape could not be represented | **This change** | Done: `StoredFilterReading.widened` — the fact, not the sentence |
| Fix the reconciler, and say it in the rep's own words | **CRM's adoption change** | **Written out as a seven-point obligation** in `developer-handover.md` §3, with the rule that CRM must not declare a `multiSelect` filter until all seven are done |

## 5. Scope discipline

Not done, deliberately: **no consumer pin bumped** (none of the four touched); **no consumer file
edited**; no screen adopts the kind; no new dependency; no new filter type beyond multi-select; no
search-in-list, grouping or select-all; no change to the search box, the date-range filter or the
layout; the control is **not** exported as a standalone primitive; DC's stale private copy of the
engine is named, not touched.

## 6. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, one, and it is new: a stored-shape contract.** "One value is stored as a bare string, two or more as an array" is now a rule consumers must follow for a filter value to survive a pin gap in either direction, and `widened` is the signal they owe their users. It binds CRM's saved views first |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — the CHANGE/DECISION entry for CR-DESIGN-SYSTEM-003 (D-7, D-8) — in the source itself where a caller will read it, and as the seven-point obligation in `developer-handover.md` §3 |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a governance decision, not part of this change (`known-issues.md` C-3). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 7. Sign-off

| Item | Status |
|---|---|
| Plan's cited facts re-verified against the code before building | ✅ 15 / 15 exact |
| Built to the owner-approved plan | ✅ 19 / 19 clauses; 1 deviation recorded |
| Owner's layout decision (A) implemented as drawn | ✅ 4 specs assert the exact strings |
| Additive-only rule held and **proved** | ✅ snapshot hash unchanged; 0 fields removed; 0 defaults changed; 0 exports moved |
| All eleven call sites addressed, none sampled | ✅ 7 by DOM snapshot, 4 by type argument |
| Radix, not hand-rolled | ✅ keyboard/focus/SR behaviour from the primitive |
| The saved-views trap named, half fixed, half handed over precisely | ✅ `developer-handover.md` §3 |
| No consumer pin bumped | ✅ |
| The package builds standalone; no app import reachable | ✅ `tsc --noEmit` + source scan |
| Tests green, typecheck clean | ✅ 189 / 189 |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files |
| Throwaway Postgres cleaned up | ✅ never started — no database in this package |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| Open defects | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
