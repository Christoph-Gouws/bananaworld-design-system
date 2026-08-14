# Global milestone scorecard — CR-DESIGN-SYSTEM-004

> Scorecard 12 (close gate) plus the lane-specific rules for this project.
> Unit: **Change Request**, archived to `runs/change-04/`. Not an epic, not a milestone.

## Overall: **PASS** — 8 / 8 required items

## Scorecard 12 — close gate

| # | Requirement | Status | Evidence |
|---|---|---|---|
| **1** | Required scorecards PASS | **PASS** | `readable-code-scorecard.md` 12/12 · `centrality-scorecard.md` 12/12 · this scorecard 8/8 |
| **2** | Acceptance criteria traced to a verdict | **PASS** | `qa-report.md` §1 — **23 criteria, each with its verification method and a verdict.** 22 PASS; 1 N/A with a stated cause (source-only library — nothing to deploy). `test-results.md` §3–§4 maps all 46 new specs to what they pin |
| **3** | Tests green | **PASS** | `pnpm test` → **235 passed / 13 files**, 0 failed, 0 skipped. `pnpm typecheck` clean. Baseline before any edit: **189 / 11** — so +46 is this change's own contribution, and the 189 pass **unchanged, with no existing spec edited** |
| **4** | Defects resolved or recorded | **PASS** | `defect-log.md` — 2 found, 2 closed, **0 open**. DEF-1 (medium) was the junk-input rule quietly drifting from the plan's own table, caught by writing the spec against the plan rather than against the code. DEF-2 (low) is recorded because the wrong answer was the **alarming** one — a mis-parsing audit probe reported three false blocking advisories |
| **5** | Deployment verified | **PASS (N/A, recorded with cause)** | `deployed-verification.md` — source-only, sha-pinned library: `private: true`, `files: ["src"]`, no build step, no server, no URL, **no database**. Nothing reaches a user until a consumer moves its own pin. Five substitute proofs; four items honestly deferred to the first adopting screen |
| **6** | `changed-files.md` present and complete | **PASS** | `output/changed-files.md` — 7 files changed (2 source added, 3 barrels modified, 2 test files added), **0 deletions and 0 modified existing lines**, 9 files considered and left untouched with reasons, 1 throwaway file created and deleted. Stage 05 reviewed exactly this list |
| **7** | Milestone handover present and not a stub | **PASS** | `evidence/developer-handover.md` — the new export surface, the 🔴 two-step pin rule, the consumer obligation that comes with option (a), the five-seam map, the three lines that must not be tidied, and the follow-up work per app |
| **8** | Context-usage row logged | **PASS** | Logged via `log-context-usage.mjs --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-004 --milestone CR-DESIGN-SYSTEM-004 --status Closed` |

## Lane rules for this project

| # | Rule | Status | Evidence |
|---|---|---|---|
| L-1 | **ADDITIVE-ONLY** — add optional fields, never remove one, never change a default, never alter an export surface | **PASS** | `git diff --numstat -- src/` is **+24 / −0**: three barrels, twenty-four inserted lines, **zero deletions and zero modified lines**. 0 fields removed, 0 defaults changed, 0 exports renamed, reordered or removed — only added |
| L-2 | **Every existing caller renders byte-identically** | **PASS — and provable from the diff alone** | No existing source file was edited, so no rendered DOM can have moved. Belt and braces: the committed toolbar snapshot's sha256 is **unchanged** (`ce7bd849…`) and all 189 existing specs pass **unmodified** |
| L-3 | **Prove the additive claim; state which callers were checked and why they are unaffected** | **PASS, with the limit stated** | `qa-report.md` §2 addresses the call sites as a class rather than sampling: every one of them imports `DataTableToolbar`, `useTableControls`, `applyTableControls`, `Table` or the filter types, and **this change touches none of those symbols**. Two new files nothing imports yet, plus 24 appended barrel lines. ⚠ Consumer repos **cannot be read or run from this worktree**; no consumer suite was run and none is claimed |
| L-4 | **Do not bump any consumer pin** | **PASS** | No consumer file touched. Each moves its own pin, in its own change, against the **merged** `main` sha — never a branch sha (KI-M001E19-002) |
| L-5 | **Radix stays underneath** — a hand-rolled replacement is a regression even if identical | **PASS** | The picker is this package's Radix `Select`, unchanged — keyboard, typeahead, `role="combobox"`, portal and z-layer all come from the primitive, in the same `<label>`+caption idiom `SelectFilterControl` uses. **Radix ships no pagination primitive**, so nothing here replaced one. The arrows are native `<button>`s via `Button`, so `disabled` announces for free. **Zero hand-written roles, zero key handlers** |
| L-6 | **Pure presentation only** (TECH-CON-004 / TECH-COMP-003) | **PASS** | No network, no fetch, no session read, no permission logic, no `warehouse_id` or tenancy identifier. `page`, `pageSize`, `totalCount` are plain numbers; the package never counts anything and never asks anyone for a count. `offset` is arithmetic on the caller's own numbers. Guarded by `tsc --noEmit` with no `@/` alias |
| L-7 | **No database, no migrations, no app screens** | **PASS** | None added; the package has none by construction. `migrationExpected: false`. No throwaway Postgres was started and nothing was left behind |
| L-8 | **The new surface is reachable from the package root** | **PASS** | Both specs import `TablePagination`, `TABLE_PAGE_SIZES`, `tablePageRange` and the types from `../../src` — the root barrel, not the deep file. `src/index.ts` **enumerates** `./lib`, so the four lib names had to be named there too or a consumer could not reach them at all |
| L-9 | **The client-side-narrowing trap is decided and stated, not smuggled** | **PASS** | Option (a), as the approved plan chose. The contract is written in the three places the plan named, and what (a) **costs** is stated in those terms rather than softened: the package cannot enforce it, so if a consumer ignores it the defect ships there. `technical-debt.md` TD-1 |
| L-10 | **(a) and (b) are never mixed** | **PASS** | `DataTableToolbar.tsx` and `table-controls.ts` are untouched. There is no partial controlled mode, no unused `mode` flag, no half-emitted filter state |
| L-11 | **If it cannot be additive, stop and say so** | **PASS — and the pressure was real** | The obvious-looking move was a right-hand slot on `DataTableToolbar` for the picker. That would edit the most-depended-upon component in the package (11 call sites, three apps) to achieve what right-alignment gives for free, and it was rejected in writing (D-21, `revision-review.md` O-5) rather than done quietly |
| L-12 | **No performance claim** | **PASS** | Nothing is slow today and the owner said so. No artefact in this pack claims a speed improvement, and nothing measuring speed was run (D-1, `test-results.md` §8) |

## Forbidden-unit check (the close gate refuses the change otherwise)

| Forbidden | Present? |
|---|---|
| A `runs/epic-NN/` folder created by this change | **No.** `runs/epic-020/` exists but is pre-existing on `main`; this change created nothing under it and wrote nothing into it |
| Any `milestone-NN/` folder created by this change | **No** |
| Anything under `runs/current/epic-plan/` | **No** — that folder does not exist and was not created |
| This change archived into an epic's folder | **No** — archived to `runs/change-04/`, its own unit |

`runs/current/active-milestone.md` and `runs/change-04/evidence/milestone-evidence.md` are **files**,
both present, and neither is a unit.

## Context usage

| Field | Value |
|---|---|
| Row | `organization/CONTEXT_USAGE_LOG.md`, one line carrying both `bananaworld-design-system` and `CR-DESIGN-SYSTEM-004` |
| Command | `node "…/log-context-usage.mjs" --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-004 --milestone CR-DESIGN-SYSTEM-004 --status Closed` |
| Note | `--project` is the **folder key**, `bananaworld-design-system`, verbatim — the display title does not satisfy the close gate's grep (CR-DC-015 burned two rounds on exactly that) |
