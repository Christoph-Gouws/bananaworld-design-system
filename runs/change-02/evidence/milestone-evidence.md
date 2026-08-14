# Milestone evidence — CR-DESIGN-SYSTEM-002

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's workspace and the read was refused, so the template could not be copied
> and filled in as instructed. This file was authored to serve the same purpose and follows the
> stated rule: it **cites** each discrete artifact by path, status and counts rather than restating
> its contents. Same limit CR-DESIGN-SYSTEM-001 recorded. See `known-issues.md` B-3.

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package, so two apps wear one header instead of two copies that drift |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-02/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-002`, off `origin/main` @ `365be65` |
| Approved layout | **n/a — not UI-bearing** (D-9: the change is defined by byte-identical rendering) |
| Ship mode | **on-green** |
| Date | 2026-08-14 |
| Verdict | **PASS — ready for PR** |

## 1. The precondition gate — checked first, as instructed

The request said: *"IT IS ONLY MOVEABLE ONCE CR-DC-039 HAS LANDED… START BY VERIFYING IT ACTUALLY
DID; if useAuth is still in there, STOP."*

**Verified against Bananaworld-DC's real source at `main`. CR-DC-039 landed. The gate is open.**
No `useAuth` import, no call — the three occurrences are comments recording its removal. DC's own
guard (`transaction-form-standard.test.ts:885`) asserts the same. Nothing was re-plumbed to make it
pass; the component was already pure.

## 2. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride` |
| Tests | `pnpm test` | **115 passed / 9 files**, 0 failed, 0 skipped (baseline before any edit: **79 / 7**) |
| Additive | `git diff --numstat -- src/` | **34 insertions, 0 deletions** |
| Byte identity | code-line comparison vs DC's `main` | **282 / 282 identical; 2 differing lines, both import specifiers** |
| Lint | — | **no `lint` script exists in this package** — `known-issues.md` C-2, recorded not invented |
| Format | `pnpm format:check` | pre-existing repo-wide drift; all three edited barrels **already failed at `HEAD`** (verified by stash). `known-issues.md` C-1 |
| Dependency audit | `pnpm audit` | **blocked by session permissions — not claimed as passed.** Surface provably unchanged: `package.json` + `pnpm-lock.yaml` untouched. CI's `dependency-audit` job is the gate. `known-issues.md` B-4 |
| Migration | — | **N/A** — no database in this package |
| Throwaway Postgres | — | **never started**; `docker ps -a` filter on `chg-cr-design-system-002-pg` returns empty |

## 3. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-02/output/test-results.md` | **PASS** | 115 passed / 9 files; **+36 new**; 0 failed; 0 skipped; **0 existing tests modified** |
| `runs/change-02/output/qa-report.md` | **PASS** | 14 acceptance criteria, 14 traced to a verdict (AC-12 N/A with cause; AC-13 superseded with cause; AC-14 passes with a stated limit); 5 consumers surveyed; 6 standards held |
| `runs/change-02/output/defect-log.md` | **0 open** | 4 found, 4 closed (1 high — the describer was unreachable from the package root; 1 medium; 2 low); 7 "not a defect" checks recorded; 3 items deferred to their owners |
| `runs/change-02/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy. 5 substitute proofs; 3 items honestly deferred to consumer bump time |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-02/output/revision-review.md` | **PASS** | 13 plan clauses checked, all built; 1 deliberate extension (`src/index.ts`, defect D-1); 6 review dimensions; 3 over-build temptations declined |
| `runs/change-02/output/simplification-opportunities.md` | **PASS** | 5 candidates: **0 accepted, 5 rejected** with reasons; 5 simplifications recorded as built-in; over-build check: not over-built |
| `runs/change-02/output/accepted-refactors.md` | **0 accepted** | With the reason stated: a refactor in a byte-identical port is, by construction, a line that no longer matches |
| `runs/change-02/output/readable-code-scorecard.md` | **12 / 12 PASS** | Weakest point (file length, ~half comments) stated honestly rather than trimmed |
| `runs/change-02/output/centrality-scorecard.md` | **12 / 12 PASS** | 5 cross-system seams mapped; **0 coordinated multi-app moves created** |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-02/output/changed-files.md` | complete | **7 files**: 2 source added, 3 source modified (+34 / −0), 2 tests added. 10 files explicitly considered and left untouched, each with a reason. The 4 adapted comments listed individually |
| `runs/change-02/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **12 / 12 of the plan's cited facts verified exact; nothing stale** |
| `runs/change-02/output/known-issues.md` | **0 open defects** | 2 attributable items (both resolved and recorded), 4 session limits (B), 4 pre-existing drift items (C), 2 to watch (D) |

## 4. The byte-identity claim — the whole risk of this change

Thirteen live DC render sites across twelve files carry this header, on a flag the owner made
permanent on 2026-08-12. **Proved by measurement, not by argument:**

```
comments stripped, code lines compared position-by-position vs DC @ main
DC code lines: 282 | ported code lines: 282
TOTAL DIFFERING CODE LINES: 2
  - import { Input } from "@bananaworld/design-system";        → "./Input"
  - import { … } from "@/lib/document-number/document-date";    → "../lib"
```

Exactly the two import specifiers the plan predicted (§7.2). The describer's 54 ported code lines all
appear **verbatim** in DC's 420-line file. Backed by 22 DOM specs covering slot order, all five
number states, all four date moods and the empty state.

## 5. The additive claim — the lane's core requirement

Five repos pin this package by git sha (DC `b1373c78`, CRM `4bc1f220`, RMS `ecba2218`, org-admin
`ecba2218`, Mangaverde `e3a88e35`). Proved four ways:

1. **0 deletions** across all of `src/` — insertions only.
2. **Nothing existing touched** — two new files; three barrels appended to, no export line renamed,
   reordered or removed.
3. **No default changed** — none introduced into any existing component.
4. **The existing 79 tests pass unchanged** — verified with the new source in place *before* any new
   spec was written.

**Caller check and its limit:** `qa-report.md` §3. DC's row rests on its actual source, read at
`main`; the other four rest on the additive proof, because this session cannot check out those repos.
Residual risk **LOW**, discharged at each consumer's own pin bump.

## 6. Scope discipline

Not done, deliberately: **no consumer pin bumped** (all five untouched); **no DC file edited** — not
its barrel, not its copy, not one of its thirteen render sites; the CRM does not adopt here; no new
slot, no CRM variant, no anticipatory configurability; no new dependency; no config change.

## 7. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, two.** (a) It creates a **forward API contract**: the eight exported names DC's adoption change compiles against, frozen. (b) It moves the **60-day date threshold and the day-line wording** into shared territory, so the CRM will inherit DC's sentences and DC's number (seam S-3, decision D-5) |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CHANGE/DECISION entry for CR-DESIGN-SYSTEM-002 — and in the source itself, where callers will actually read it |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log, and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a governance decision, not part of this change (D-10, `known-issues.md` C-4). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 8. Sign-off

| Item | Status |
|---|---|
| Precondition (CR-DC-039) verified before building | ✅ |
| Built to the owner-approved plan | ✅ 13 / 13 clauses |
| Byte-identical render proved by measurement | ✅ 282 / 282, 2 intended import diffs |
| Additive-only rule held and proven | ✅ 34 insertions, **0 deletions** |
| The package builds standalone; no app import reachable | ✅ `tsc --noEmit` + source scan (test 23) |
| Barrel re-export proved from the package **root** | ✅ tests 26, 27 |
| Tests green, typecheck clean | ✅ 115 / 115 |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files |
| Throwaway Postgres cleaned up | ✅ never started; `docker ps -a` filter empty |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| Open defects | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
