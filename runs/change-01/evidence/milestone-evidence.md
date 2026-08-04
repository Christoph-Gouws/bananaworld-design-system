# Milestone evidence — CR-DESIGN-SYSTEM-001

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's workspace and the read was refused, so the template could not be copied
> and filled in as instructed. This file was authored to serve the same purpose and follows the
> stated rule: it **cites** each discrete artifact by path, status and counts rather than restating
> its contents. See `known-issues.md` B-3.

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-001** — a ChoiceGroup chip may carry a colour swatch and its own accessible name, additively |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-01/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-001`, off `origin/main` @ `b1373c7` |
| Approved layout | **B** — full-height colour stripe flush to the chip's left edge |
| Ship mode | **on-green** |
| Date | 2026-08-04 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride` |
| Tests | `pnpm test` | **79 passed / 7 files**, 0 failed, 0 skipped (baseline before any edit: 61 / 6) |
| Lint | — | **no `lint` script exists in this package**; recorded in `known-issues.md` C-3, not invented |
| Format | `pnpm format:check` | fails on 44 files **repo-wide and pre-existing**; the changed file already failed at `HEAD` (verified by stash). `known-issues.md` C-1 |
| Migration | — | **N/A** — no database in this package |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-01/output/test-results.md` | **PASS** | 79 passed / 7 files; +18 new; 0 failed; 0 skipped; 0 existing tests modified |
| `runs/change-01/output/qa-report.md` | **PASS** | 12 acceptance criteria, 12 PASS (AC-4 passes with a stated limit); 5 consumers surveyed; 6 a11y properties checked; 5 standards held |
| `runs/change-01/output/defect-log.md` | **0 open** | 4 defects found, 4 closed (1 medium — would have shipped a visual bug; 3 low); 6 "not a defect" checks recorded; 2 items deferred as out of lane |
| `runs/change-01/output/deployed-verification.md` | **N/A, recorded** | No deployable instance exists — this is a source-only, sha-pinned library. 4 substitute proofs listed; 3 things genuinely deferred to consumer bump time |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-01/output/revision-review.md` | **PASS** | 11 plan clauses checked, all built; 1 deliberate approved deviation (layout B over the proposal's square); 6 review dimensions |
| `runs/change-01/output/simplification-opportunities.md` | **PASS** | 4 candidates: 1 accepted, 3 rejected with reasons; 5 simplifications recorded as built-in; over-build check: not over-built |
| `runs/change-01/output/accepted-refactors.md` | **1 applied** | R-1 removed a redundant `cn()`; re-verified green (79 passed) after |
| `runs/change-01/output/readable-code-scorecard.md` | **12 / 12 PASS** | Weakest point stated honestly rather than trimmed |
| `runs/change-01/output/centrality-scorecard.md` | **12 / 12 PASS** | 5 cross-system seams mapped; 0 coordinated multi-app moves created |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-01/output/changed-files.md` | complete | **2 files**: 1 modified (+57 / −0), 1 added (+356). 7 files explicitly considered and left untouched, each with a reason |
| `runs/change-01/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **8 / 8 of the plan's cited facts verified exact; nothing stale** |
| `runs/change-01/output/known-issues.md` | **0 attributable** | 5 session limits (B), 4 pre-existing drift items (C), 1 item to watch (D) |

## 3. The additive claim — the core requirement of this lane

Additive-only is the lane rule because five repos pin this package by git sha. Proven four ways:

1. **57 insertions, 0 deletions** in the source file — not one line removed or rewritten.
2. **No default changed** — `emptyLabel` is the only default and is untouched (test 2).
3. **No export surface moved** — `src/components/index.ts` needed no edit; runtime exports asserted
   to be exactly `["ChoiceGroup"]` (test 18).
4. **Byte-identical rendering for existing callers** — test 5 asserts `title` and `aria-label` are
   *absent* (not empty), no `[aria-hidden]` descendant exists, the text is the chip's only child
   node, and the full `class` attribute equals the exact literal string that shipped at `b1373c78`.

Plus test 17, which compiles a consumer-shaped option type through the component, converting the one
real type risk from a prose argument into a permanent constraint in this package's own CI.

**Caller check and its limit:** `qa-report.md` §3. This session is sandboxed to its worktree and
could not re-open the consumer repos, so the 5-consumer survey is carried forward from the
owner-approved plan §3 and is marked as such. Residual risk LOW, discharged at DC's pin bump.

## 4. Scope discipline

Not done, deliberately: no consumer pin bumped (DC, CRM, RMS, org-admin, Mangaverde all untouched);
no colour-stage chip component (that is DC's follow-up); no other component touched; no new
dependency; no config change; `ColourSwatch` reused unmodified.

## 5. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, one:** it creates a forward API contract — the frozen field names `swatch` / `description` and the `accentHex: string \| null` nullability that DC's follow-up compiles against, plus the two `description` usage contracts. |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CHANGE/DECISION entry for CR-DESIGN-SYSTEM-001), and in the component's own doc comment where callers will actually read it. |
| Any other source document amended? | **No — and here is the reason, so this is an N/A with a cause rather than a skip:** this repository has no `source-documents/` tree of its own beyond the decision log created by this change, and no `governance/` directory. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist; creating it is a governance decision, not part of this change (`known-issues.md` C-4). No kernel rule, gate or scorecard was altered — a team may never weaken a universal kernel rule, and none was touched. |

## 6. Sign-off

| Item | Status |
|---|---|
| Built to the approved plan, layout B | ✅ |
| Additive-only rule held and proven | ✅ |
| Radix foundation preserved (one tab stop, arrow keys, `radiogroup` role) | ✅ tests 3, 4, 15 |
| Tests green, typecheck clean | ✅ 79 / 79 |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files |
| Throwaway Postgres cleaned up | ✅ never started — no database in this package; `docker ps -a` filter returns empty |
| Open defects | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
