# Milestone evidence — CR-DESIGN-SYSTEM-004

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's workspace and the read is refused, so the template could not be copied and
> filled in as instructed. This file was authored to serve the same purpose and follows the stated
> rule: it **cites** each discrete artifact by path, status and counts rather than restating it.
> Fourth change to hit this limit (CR-001, CR-002, CR-003, and here). See `known-issues.md` B-3.

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-004** — add a shared paging control to `@bananaworld/design-system` |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-04/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-004`, off `origin/main` @ `fc2c5b8` |
| Approved layout | **A** — the count on the left; picker + arrows top right; arrows bottom right (owner, 2026-08-14) |
| Approved option | **(a)** — the control is presentation only; the trap is answered by a written contract |
| Ship mode | **on-green** |
| Date | 2026-08-14 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess`, with no app path alias |
| Tests | `pnpm test` | **235 passed / 13 files**, 0 failed, 0 skipped (baseline before any edit: **189 / 11**) |
| New specs | — | **+46** — 16 arithmetic, 30 component |
| Existing specs edited | — | **0** |
| Additive — diff | `git diff --numstat -- src/` | **+24 / −0**. Zero deletions, zero modified lines, nothing to itemise |
| Additive — DOM | committed toolbar snapshot sha256 | **`ce7bd849…`, unchanged from `HEAD`** |
| Dependency audit | Node reproduction of CI's `pnpm audit --prod --audit-level=high` | **PASS** — 6 highs, all six on the standing owner-approved ignore list, **0 new**. `pnpm audit` itself is permission-blocked and is **not** claimed as run (`known-issues.md` B-2) |
| Lint | `pnpm lint` | **no `lint` script and no eslint config exist in this package** — `known-issues.md` C-2, recorded not invented |
| Format | `pnpm format:check` | Pre-existing repo-wide drift: no prettier config, so the default 80-column width disagrees with the repo's house style. Four **untouched** existing files fail identically at `HEAD`, verified this session. Not a CI job. `known-issues.md` C-1 |
| Migration | — | **N/A — this package has no database.** No migration file, nothing classified, nothing promoted. `migrationExpected: false` |
| Throwaway Postgres | — | **never started**; nothing to rehearse, nothing left behind, no port held |
| CI | GitHub Actions | Not waited for, by instruction. The conductor polls and merges |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-04/output/test-results.md` | **PASS** | 235 passed / 13 files; +46 new; 0 failed; 0 skipped; **0 existing tests modified**; snapshot hash quoted; audit output quoted |
| `runs/change-04/output/qa-report.md` | **PASS** | **23 acceptance criteria, 23 traced to a verdict** — 22 PASS, 1 N/A with a stated cause; 12 adversarial checks; 7 standards held |
| `runs/change-04/output/defect-log.md` | **0 open** | 2 found, 2 closed (1 medium — the junk-input rule drifting from the plan's table; 1 low, tooling); 9 "not a defect" checks recorded; 4 items deferred to their owners |
| `runs/change-04/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy, no database. 5 substitute proofs; 4 items honestly deferred to the first adopting screen |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-04/output/revision-review.md` | **PASS** | 21 plan clauses checked, 21 built; 1 deviation recorded (the test path); 8 review dimensions; 8 over-build temptations declined |
| `runs/change-04/output/simplification-opportunities.md` | **PASS** | 7 candidates: **1 accepted, 6 rejected** with reasons; 8 simplifications recorded as already built in |
| `runs/change-04/output/accepted-refactors.md` | **1 accepted** | `positionLabel(range)` replaces `rangeLabel(from, to, total)` — applied, then typecheck clean and 235/235 green |
| `runs/change-04/output/readable-code-scorecard.md` | **12 / 12 PASS** | Two weak points stated honestly rather than trimmed (comment density; a nine-field range) |
| `runs/change-04/output/centrality-scorecard.md` | **12 / 12 PASS** | 5 cross-system seams mapped; **0 coordinated multi-app moves created** |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-04/output/changed-files.md` | complete | **2 source files added (+259), 3 barrels modified (+24 / −0), 0 source deleted**; 2 test files added (+560); 9 files considered and left untouched with reasons; 1 throwaway file created and deleted |
| `runs/change-04/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **9 / 9 of the plan's cited facts verified exact; nothing stale** |
| `runs/change-04/output/known-issues.md` | **0 open defects, 0 open decisions** | 1 plan deviation (A), 4 session limits (B), 5 pre-existing drift items (C), 7 watch items (D) |
| `runs/change-04/technical-debt.md` | **2 items, both owned** | TD-1 the written-not-enforced contract; TD-2 the scoped-total obligation. Both with a named owner and a revisit trigger |

## 3. The additive claim — the whole risk of this change

Four apps pin this package by git sha and each bumps when it chooses, so "every existing caller
renders byte-identically" is the lane rule, not a preference. **This change has the cheapest proof
this package has produced, and it is checkable from the diff alone:**

1. **`git diff --numstat -- src/` is `+24 / −0`.** Three barrels, twenty-four inserted lines, **zero
   deletions and zero modified lines**. CR-003 had 26 deletions to itemise; this change has none,
   because it calls no existing function and widens no existing type.
2. **The two new files are files nothing imports yet.** A call site cannot observe a name it does not
   import.
3. **No existing test was edited.** All 189 pass exactly as written, including every `Table`,
   `DataTableToolbar` and `table-controls` spec.
4. **The committed toolbar snapshot's sha256 has not moved** — `ce7bd849…`, the same value CR-003
   recorded. A single changed class, attribute or element in any of those seven trees fails it.
5. **No name collides.** No barrel export begins `TablePage`, `TABLE_` or `tablePage`; `Table`,
   `TableContainer`, `TableRow`, `TableHead`, `TableCell`, `TableSkeleton` and `SortDirection` are
   untouched and unshadowed.

⚠ Consumer repos **cannot be read or run from this worktree** (permission-blocked) — the fourth
change to record it. **No consumer suite was executed and nothing claims one was.** The argument does
not need one: it rests on the diff.

**Nothing renders differently in any app until that app bumps its pin and a screen chooses to render
the control. No screen does.**

## 4. The trap — who owns which half

The request called this out as the one thing that makes the change more than a button pair, and the
approved plan chose **option (a)**:

| Half | Owner | State |
|---|---|---|
| Keep the control pure — no network, no data, no state | **This change** | Done. `page`, `pageSize`, `totalCount` are inputs; TECH-COMP-003 |
| State the contract where a consumer will read it | **This change** | Done, in three places: the fenced comment atop `TablePagination.tsx`, `developer-handover.md` §2, `technical-debt.md` TD-1 |
| **Obey it** — server paging must not use `useTableControls` for search/filter | **The consumer.** CR-DC-052 first | **Not enforceable from here.** Option (a)'s stated cost, accepted at the gate in those terms |
| `totalCount` scoped to what that person may see | **The consumer** | Named as an obligation (TD-2) |

Option (b) — a controlled/server toolbar mode — was rejected in the plan (D-2) and **not partially
built**. There is no half-controlled toolbar, no unused mode flag, no partial emit. Adding (b) later
is itself additive, so nothing is foreclosed.

## 5. Scope discipline

Not done, deliberately: **no consumer pin bumped** (none of the four touched); **no consumer file
edited**; no screen wired; no page-size memory; no jump-to-page, page-number list or `variant` prop;
no new dependency and no new token; no change to the existing sort, filter, search or empty-state
behaviour of `Table` / `DataTableToolbar`; `Table.tsx`, `DataTableToolbar.tsx` and `table-controls.ts`
not edited at all.

## 6. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, one, and it is new: a consumer obligation.** "A server-paged table must not use `useTableControls` for searching or filtering, and `totalCount` must carry the same scope filter as the page query" is now a rule a consumer must follow for a paged list to be honest. It binds CR-DC-052 first |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — the CHANGE/DECISION entry for CR-DESIGN-SYSTEM-004 (D-2, D-3) — **and in the source itself**, fenced at the top of `TablePagination.tsx` where a build session will read it, plus `developer-handover.md` §2 and `technical-debt.md` TD-1 |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a governance decision, not part of this change (`known-issues.md` C-3, fourth change to raise it). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 7. Sign-off

| Item | Status |
|---|---|
| Plan's cited facts re-verified against the code before building | ✅ 9 / 9 exact; nothing had moved on `main` |
| Built to the owner-approved plan | ✅ 21 / 21 clauses; 1 deviation recorded (a test path, not a premise) |
| Owner's layout decision (A) implemented as drawn | ✅ matches `option-a.html`; 5 specs assert the placement rules |
| Owner's option (a) implemented, and **not mixed with (b)** | ✅ `DataTableToolbar.tsx` and `table-controls.ts` untouched |
| Additive-only rule held and **proved** | ✅ `+24 / −0`; snapshot hash unmoved; 0 fields removed, 0 defaults changed, 0 exports moved |
| Every existing caller addressed, none sampled | ✅ by the diff — no existing symbol is called, widened, renamed or re-defaulted |
| Radix, not hand-rolled | ✅ the picker is this package's Radix `Select`; Radix ships no pagination primitive, so nothing was replaced |
| Keyboard + screen-reader behaviour asserted, not assumed | ✅ labelled combobox, one live region, tab order across both bars, disabled arrows skipped |
| The trap named, and its ownership stated in the owner's own terms | ✅ `developer-handover.md` §2, `technical-debt.md` TD-1 |
| 🔴 Two-step shipping stated, so nobody over-reports CR-DC-052 | ✅ in five artifacts |
| No consumer pin bumped | ✅ |
| The package builds standalone; no app import reachable | ✅ `tsc --noEmit`, no `@/` alias |
| Tests green, typecheck clean | ✅ 235 / 235 |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files, plus `changed-files.md`, `implementation-summary.md`, `known-issues.md` |
| Throwaway Postgres cleaned up | ✅ never started — no database in this package |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| No performance claim made anywhere | ✅ D-1 |
| Open defects | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
