# Global milestone scorecard — CR-DESIGN-SYSTEM-003

> Scorecard 12 (close gate) plus the lane-specific rules for this project.
> Unit: **Change Request**, archived to `runs/change-03/`. Not an epic, not a milestone.

## Overall: **PASS** — 8 / 8 required items

## Scorecard 12 — close gate

| # | Requirement | Status | Evidence |
|---|---|---|---|
| **1** | Required scorecards PASS | **PASS** | `readable-code-scorecard.md` 12/12 · `centrality-scorecard.md` 12/12 · this scorecard 8/8 |
| **2** | Acceptance criteria traced to a verdict | **PASS** | `qa-report.md` §1 — **17 criteria, each with its verification method and a verdict.** 15 PASS; 2 N/A, each with a stated cause (no database → no migration rehearsal; source-only library → nothing to deploy). `test-results.md` §3–§4 maps all 74 specs to what they pin |
| **3** | Tests green | **PASS** | `pnpm test` → **189 passed / 11 files**, 0 failed, 0 skipped. `pnpm typecheck` clean. Baseline before any edit: **115 / 9** — so +74 is this change's own contribution, and the 115 pass **unchanged, with no existing spec edited** |
| **4** | Defects resolved or recorded | **PASS** | `defect-log.md` — 4 found, 4 closed, **0 open**. D-4 (high) was *prevented*: the `onSelect` preventDefault guard was mutation-tested rather than trusted, because without it the menu closes after every tick and the change fails at the thing it exists to do |
| **5** | Deployment verified | **PASS (N/A, recorded with cause)** | `deployed-verification.md` — source-only, sha-pinned library: `private: true`, `files: ["src"]`, no build step, no server, no URL, **no database**. Nothing reaches a user until a consumer moves its own pin. Five substitute proofs; four items honestly deferred to the first adopting screen |
| **6** | `changed-files.md` present and complete | **PASS** | `output/changed-files.md` — 8 files changed (5 source, 3 test), **all 26 deleted source lines itemised** against the plan clause that required each, 8 files considered and left untouched with reasons, 1 throwaway file created and deleted. Stage 05 reviewed exactly this list |
| **7** | Milestone handover present and not a stub | **PASS** | `evidence/developer-handover.md` — the new export surface, the pin-bump rule, **CRM's seven-point saved-view obligation**, the six-seam map and the follow-up work per app |
| **8** | Context-usage row logged | **PASS** | Logged via `log-context-usage.mjs --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-003 --milestone CR-DESIGN-SYSTEM-003 --status Closed` |

## Lane rules for this project

| # | Rule | Status | Evidence |
|---|---|---|---|
| L-1 | **ADDITIVE-ONLY** — add optional fields, never remove one, never change a default, never alter an export surface | **PASS** | **+347 / −26** in `src/`, and every one of the 26 deletions is a rewrite of an arm the plan named (`changed-files.md` §1.1). 0 fields removed, 0 defaults changed, 0 exports renamed, reordered or removed — only added |
| L-2 | **Every existing caller renders byte-identically** | **PASS — measured, not argued** | The seven toolbar screens are snapshotted; the snapshot file's sha256 is **identical before and after the source edit** (`ce7bd849…`). Any changed class, attribute or element in any of those trees fails it. **This was only possible because 36 characterisation specs were written before a line of source changed — there was no test for this engine at all** |
| L-3 | **Prove the additive claim; state which callers were checked and why they are unaffected** | **PASS, with the limit stated** | All **eleven** call sites addressed individually (the request said nine; the plan found eleven across three apps): 7 by DOM snapshot, 4 (org-admin, engine-only) by the type argument in `qa-report.md` §4 — every `FilterValue` reader in the estate uses positive narrowing, which a widened union cannot break. ⚠ Those consumer repos **cannot be read or run from this worktree**; their declarations are transcribed from the approved plan's inventory and labelled as such. No consumer suite was run and none is claimed |
| L-4 | **Do not bump any consumer pin** | **PASS** | No consumer file touched. Each moves its own pin, in its own change, against the **merged** `main` sha — never a branch sha (KI-M001E19-002) |
| L-5 | **Radix stays underneath** — a hand-rolled replacement is a regression even if identical | **PASS** | The multi-select is Radix `DropdownMenu` + `CheckboxItem` — the same primitive, portal and `--z-dropdown` `RowActions` already ships. **Zero hand-written roles or key handlers**: `menuitemcheckbox`, `aria-checked`, roving focus, typeahead, Escape-restores-focus and outside-click all come from the primitive. A hand-rolled `role="listbox"` alternative was considered and rejected (plan option B) |
| L-6 | **Pure presentation only** (TECH-CON-004 / TECH-COMP-003) | **PASS** | No network, no session read, no permission logic, no `warehouse_id` or tenancy identifier. The accessor returns a caller-supplied string, so the package never learns what a depot *is*. The `widened` flag is a boolean fact; the sentence a rep reads stays in the app. Guarded by `tsc --noEmit` (no `@/` alias) and a source scan for `@/` and `bananaworld-` |
| L-7 | **No database, no migrations, no app screens** | **PASS** | None added; the package has none by construction. The only persistence near this change is CRM's saved-views row, which is another repo's table and is handed over, not touched |
| L-8 | **The new surface is reachable from the package root** | **PASS** | A spec imports both helpers and all six type names from `../../src` — the root barrel — not from the deep file. That distinction is the difference between "a consumer can name `MultiSelectFilterValue`" and a consumer re-declaring it locally and drifting (D-9) |
| L-9 | **The saved-views trap is decided and stated, not smuggled** | **PASS** | D-7/D-8. The package fixes the half it can (a bare string for one value, so an old build reads it correctly for free) and reports the half it cannot (`widened`). CRM's half is written out as **seven numbered points** with the rule that CRM must not declare a `multiSelect` filter until all seven are done |
| L-10 | **If it cannot be additive, stop and say so** | **PASS — and it was tested, not assumed** | The one design pressure toward reshaping `SelectFilterDef` (a `multiple?: boolean` flag) was considered and rejected in writing (`simplification-opportunities.md` S-2) precisely because it would migrate eleven call sites inside a package change |

## Forbidden-unit check (the close gate refuses the change otherwise)

| Forbidden | Present? |
|---|---|
| A `runs/epic-NN/` folder created by this change | **No.** `runs/epic-020/` exists but is pre-existing on `main`; this change created nothing under it and wrote nothing into it |
| Any `milestone-NN/` folder created by this change | **No** |
| Anything under `runs/current/epic-plan/` | **No** — that folder does not exist and was not created |
| This change archived into an epic's folder | **No** — archived to `runs/change-03/`, its own unit |

`runs/current/active-milestone.md` and `runs/change-03/evidence/milestone-evidence.md` are **files**,
both present, and neither is a unit.

## Context usage

| Field | Value |
|---|---|
| Row | `organization/CONTEXT_USAGE_LOG.md`, one line carrying both `bananaworld-design-system` and `CR-DESIGN-SYSTEM-003` |
| Command | `node "…/log-context-usage.mjs" --team sw --project bananaworld-design-system --epic CR-DESIGN-SYSTEM-003 --milestone CR-DESIGN-SYSTEM-003 --status Closed` |
| Note | `--project` is the **folder key**, `bananaworld-design-system`, verbatim — the display title does not satisfy the close gate's grep (CR-DC-015 burned two rounds on exactly that) |
