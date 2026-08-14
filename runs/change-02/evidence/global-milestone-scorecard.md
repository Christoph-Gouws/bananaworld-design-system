# Global milestone scorecard — CR-DESIGN-SYSTEM-002

> Scorecard 12 (close gate) plus the lane-specific rules for this project.
> Unit: **Change Request**, archived to `runs/change-02/`. Not an epic, not a milestone.

## Overall: **PASS** — 8 / 8 required items

## Scorecard 12 — close gate

| # | Requirement | Status | Evidence |
|---|---|---|---|
| **1** | Required scorecards PASS | **PASS** | `readable-code-scorecard.md` 12/12 · `centrality-scorecard.md` 12/12 · this scorecard 8/8 |
| **2** | Acceptance criteria traced to a verdict | **PASS** | `qa-report.md` §1 — **14 criteria, each with its verification method and a verdict**. Three carry stated qualifications rather than silent passes: AC-12 (Radix) is N/A with cause, AC-13 (the eight transitional pieces) is superseded by owner ruling DECISION-358, AC-14 passes with the DC-suite limit stated. `test-results.md` maps all 36 specs to what they pin |
| **3** | Tests green | **PASS** | `pnpm test` → **115 passed / 9 files**, 0 failed, 0 skipped. `pnpm typecheck` clean. Baseline before any edit: **79 / 7** — so +36 is this change's own contribution, and the 79 pass unchanged |
| **4** | Defects resolved or recorded | **PASS** | `defect-log.md` — 4 found, 4 closed, **0 open**. D-1 (high) would have left the day-line describer unreachable from the package root and surfaced in DC's lane weeks later as this change's problem |
| **5** | Deployment verified | **PASS (N/A, recorded with cause)** | `deployed-verification.md` — source-only, sha-pinned library: `private: true`, `files: ["src"]`, no build step, no server, no URL, no database. "Deployed" means merged to `main`, and **nothing reaches a user until a consumer moves its own pin**. Five substitute proofs; three items honestly deferred |
| **6** | `changed-files.md` present and complete | **PASS** | `output/changed-files.md` — 7 files changed, 10 files explicitly considered and left untouched with reasons, and the 4 adapted comments listed individually. Stage 05 reviewed exactly this list |
| **7** | Milestone handover present and not a stub | **PASS** | `evidence/developer-handover.md` — the frozen export contract, the pin-bump instruction, the five DC assertions that will redden with their line numbers, the seam map and the follow-up work |
| **8** | Context-usage row logged | **See §"Context usage"** | Logged via `log-context-usage.mjs --project bananaworld-design-system` |

## Lane rules for this project

| # | Rule | Status | Evidence |
|---|---|---|---|
| L-1 | **ADDITIVE-ONLY** — add optional fields, never remove one, never change a default, never alter an export surface | **PASS** | **34 insertions / 0 deletions** across all of `src/`. Two new files; three barrels appended to. No export renamed, reordered or removed; no default changed |
| L-2 | **Every existing caller renders byte-identically** | **PASS — measured** | Code-line comparison vs DC's `main`: **282 / 282 identical, 2 differing lines, both import specifiers**. Plus 22 DOM specs on slot order, all five number states, all four date moods and the empty state. And structurally: this change adds an export nobody imports yet |
| L-3 | **Prove the additive claim; state which callers were checked and why they are unaffected** | **PASS, with the limit stated** | `qa-report.md` §3 — all five consumers tabled (incl. Mangaverde). DC's row rests on its **actual source read at `main`**; the other four rest on the additive proof, since this session cannot check out those repos |
| L-4 | **Do not bump any consumer pin** | **PASS** | No consumer file touched. Each moves its own pin, in its own change, against the **merged** `main` sha — never a branch sha (KI-M001E19-002) |
| L-5 | **Radix stays underneath** — a hand-rolled replacement is a regression even if identical | **PASS (N/A, recorded)** | Nothing was hand-rolled. This component uses **no Radix control** — a `<dl>` of slots plus the package's own `Input`, imported unmodified. The two Undo `<button>`s are native and arrived that way from DC |
| L-6 | **Pure presentation only** (TECH-CON-004 / TECH-COMP-003) | **PASS** | No session read, no network, no permission logic, no tenancy identifier. `DocumentOrigin` carries plain `string \| null` **names**, so the component cannot scope anything. Guarded by `tsc --noEmit` (no `@/` alias) and by a source scan (test 23) that is itself checked for vacuity |
| L-7 | **No database, no migrations, no app screens** | **PASS** | None added; the package has none by construction. DC's SQL, column map and validator deliberately did **not** cross (D-4) |
| L-8 | **The move is byte-identical and the barrel re-export works** | **PASS** | Test 26 imports from the **package root** (`../../src`), not from the component file, and renders it — that distinction is the line between "no import changed" and thirteen broken render sites |
| L-9 | **The flag coupling is decided and stated, not smuggled** | **PASS** | **D-3: no flag prop**, because CR-DC-046 removed the flag on 2026-08-12 under DECISION-358 and there is no question left to answer. Reasoning stated in the source, the summary and the decision log. **No app import was added to avoid the question** |

## Forbidden-unit check (the close gate refuses the change otherwise)

| Forbidden | Present? |
|---|---|
| A `runs/epic-NN/` folder created by this change | **No.** `runs/epic-020/` exists but is pre-existing on `main`; this change created nothing under it and wrote nothing into it |
| Any `milestone-NN/` folder created by this change | **No** |
| Anything under `runs/current/epic-plan/` | **No** — that folder does not exist and was not created |
| This change archived into an epic's folder | **No** — archived to `runs/change-02/`, its own unit |

`runs/current/active-milestone.md` and `runs/change-02/evidence/milestone-evidence.md` are **files**,
both present, and neither is a unit.

## Quality-over-cost (Hard Rule 2)

No gate, scorecard, test, review or evidence step was skipped, trimmed or thinned for cost. Where
something could not be done it is recorded with its cause rather than quietly dropped — DC's suites
(`known-issues.md` B-1), the kernel template (B-3), `pnpm audit` (B-4), and the absent `lint` script
(C-2). **None of these is reported as a pass.**

One item deserves explicit mention because the honest answer was the more expensive one: the DC
source was fetched read-only from GitHub so the port could be made against the **actual file** rather
than the plan's prose summary. A reconstructed lookalike would have been cheaper and would have been
exactly the drift this change exists to prevent (`known-issues.md` B-2).

## Context usage

Logged with:

```
node "d:/Projects/Team Builder/organization/scripts/log-context-usage.mjs" \
  --team sw --project bananaworld-design-system \
  --epic CR-DESIGN-SYSTEM-002 --milestone CR-DESIGN-SYSTEM-002 --status Closed
```

`--project` is `bananaworld-design-system` verbatim — the close gate greps that folder key on the
row, and the display title does not satisfy it (CR-DC-015 burned two remediation rounds on exactly
that).
