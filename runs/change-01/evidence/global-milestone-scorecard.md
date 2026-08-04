# Global milestone scorecard — CR-DESIGN-SYSTEM-001

> Scorecard 12 (close gate) plus the lane-specific rules for this project.
> Unit: **Change Request**, archived to `runs/change-01/`. Not an epic, not a milestone.

## Overall: **PASS** — 8 / 8 required items

## Scorecard 12 — close gate

| # | Requirement | Status | Evidence |
|---|---|---|---|
| **1** | Required scorecards PASS | **PASS** | `readable-code-scorecard.md` 12/12 · `centrality-scorecard.md` 12/12 · this scorecard 8/8 |
| **2** | Acceptance criteria traced to a verdict | **PASS** | `qa-report.md` §1 — 12 criteria, each with its verification method and a verdict. AC-4 passes with an explicitly stated limit (`title` is hover-only, so no tooltip on touch). `test-results.md` maps all 18 tests to what they pin. |
| **3** | Tests green | **PASS** | `pnpm test` → **79 passed / 7 files**, 0 failed, 0 skipped. `pnpm typecheck` clean. Baseline before any edit: 61/6, so +18 is this change's own contribution. |
| **4** | Defects resolved or recorded | **PASS** | `defect-log.md` — 4 found, 4 closed, **0 open**. D-4 (medium) would have shipped a visual bug and is now pinned by a test. |
| **5** | Deployment verified | **PASS (N/A, recorded with cause)** | `deployed-verification.md` — this is a source-only, sha-pinned library: `private: true`, `files: ["src"]`, no build step, no server, no URL, no database. "Deployed" means merged to `main`. Four substitute proofs listed; three items honestly deferred to consumer bump time. |
| **6** | `changed-files.md` present and complete | **PASS** | `output/changed-files.md` — 2 files changed, plus 7 files explicitly considered and left untouched with reasons. Stage 05 reviewed exactly this list. |
| **7** | Milestone handover present and not a stub | **PASS** | `evidence/developer-handover.md` — full handover incl. the forward API contract, the pin-bump instruction, the seam map and the follow-up work. |
| **8** | Context-usage row logged | **See §"Context usage" below** | Logged via `log-context-usage.mjs --project bananaworld-design-system`. |

## Lane rules for this project — the ones that actually matter here

| # | Rule | Status | Evidence |
|---|---|---|---|
| L-1 | **ADDITIVE-ONLY** — add optional fields, never remove one, never change a default, never alter an export surface | **PASS** | 57 insertions / **0 deletions**; `emptyLabel` (the only default) untouched; `src/components/index.ts` not edited; runtime exports asserted `["ChoiceGroup"]` (test 18) |
| L-2 | **Every existing caller renders byte-identically** | **PASS** | Test 5 — `title`/`aria-label` asserted **absent** not empty, no `[aria-hidden]` descendant, text is the only child node, and the complete `class` attribute equals the exact literal that shipped at `b1373c78` |
| L-3 | **Prove the additive claim; state which callers were checked and why they are unaffected** | **PASS, with the limit stated** | `qa-report.md` §3 — 5 consumers tabled (incl. Mangaverde, a fifth the change request did not name). Rows are marked plan-sourced because this session is sandboxed and could not re-open those repos; test 17 compiles the one real risk into this package's CI instead |
| L-4 | **Do not bump any consumer pin** | **PASS** | No consumer file touched. Pin bumps happen in each consumer's own change, against the **merged** `main` sha, never a branch sha (KI-M001E19-002) |
| L-5 | **Radix stays underneath** — a hand-rolled replacement is a regression even if identical | **PASS** | `RadixRadioGroup.Root`/`.Item` untouched. Tests 3, 4 and 15 pin the `radiogroup` role, zero `button` roles, the single tab stop and arrow-key roving selection |
| L-6 | **Reuse `ColourSwatch`, do not write a new one** | **PASS** | Imported and reused unmodified. Test 7 asserts the blended `linear-gradient(135deg, …)` comes out of that shared path; test 12 asserts `ColourSwatch`'s own defaults are unchanged |
| L-7 | **No database, no migrations, no app screens** | **PASS** | None added. Components, their tests and the barrel only |
| L-8 | **Tests added to the package's own suite covering both new fields, incl. the accessible-name case** | **PASS** | 18 tests; test 13 is exactly that case — the chip resolves by the long name through the a11y tree while `textContent === "CS3"` |

## Forbidden-unit check (the close gate refuses the change otherwise)

| Forbidden | Present? |
|---|---|
| A `runs/epic-NN/` folder created by this change | **No.** `runs/epic-020/` exists but is pre-existing on `main` (committed before this branch); this change created nothing under it |
| Any `milestone-NN/` folder created by this change | **No** |
| Anything under `runs/current/epic-plan/` | **No** — that folder does not exist |
| This change archived into an epic's folder | **No** — archived to `runs/change-01/`, its own unit |

`runs/current/active-milestone.md` and `runs/change-01/evidence/milestone-evidence.md` are **files**,
both present, and neither is a unit.

## Quality-over-cost (Hard Rule 2)

No gate, scorecard, test, review or evidence step was skipped, trimmed or thinned for cost. Where
something could not be done, it is recorded as such with its cause rather than quietly dropped —
see `known-issues.md` sections B and C, and item 5 above.

## Context usage

Logged with:

```
node "d:/Projects/Team Builder/organization/scripts/log-context-usage.mjs" \
  --team sw --project bananaworld-design-system \
  --epic CR-DESIGN-SYSTEM-001 --milestone CR-DESIGN-SYSTEM-001 --status Closed
```

`--project` is `bananaworld-design-system` verbatim — the close gate greps that folder key on the
row, and the display title does not satisfy it (CR-DC-015 burned two remediation rounds on exactly
that). Result of the run is recorded in `developer-handover.md`.
