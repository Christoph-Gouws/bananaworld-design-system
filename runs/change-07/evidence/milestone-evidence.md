# Milestone evidence — CR-DESIGN-SYSTEM-007

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's permitted directories and the read is refused, so the template could not be
> copied and filled in as instructed. This file follows the structure of
> `runs/change-06/evidence/milestone-evidence.md`, which inherits it from
> `runs/change-05/evidence/milestone-evidence.md`, which **was** produced from that template — so the
> boilerplate is inherited rather than re-typed, per the rule. It **cites** each discrete artifact by
> path, status and counts rather than restating it. **Seventh change to hit this limit**
> (`known-issues.md` A-4).

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-007** — when a row instruction and a single box disagree, the box wins |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-07/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-007`, off `origin/main` @ `ce47010` |
| Type | **Review follow-up on CR-DESIGN-SYSTEM-006** — 1 finding (F1, medium/medium) |
| Approved layout | **A** — the cell's own answer wins (owner, plan gate) |
| Ship mode | **on-green** |
| Date | 2026-08-25 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` |
| Tests | `pnpm test` | **269 passed / 14 files**, 0 failed, 0 skipped (baseline re-measured before any edit: **263 / 14**) |
| New specs | — | **+6** (T-17 … T-22), exactly the plan's predicted 263 + 6 = 269 |
| **Existing specs edited** | — | **0** — the test file diff is **+155 / −0** |
| **Existing specs reddened** | — | **0** — all 17 CR-006 specs green and unedited |
| Mutation check | 5 deliberate breakages | **5 run, 5 caught** (`test-results.md` §5). M-1 restores the shipped defect and reddens T-17/T-18 — proving the new specs bite |
| Additive — diff | `git diff --cached --numstat` | `src/` **+31 / −13**; `git diff -w` identical → **no whitespace churn**; 3 lines of real behaviour |
| Additive — export surface | `git diff --cached --stat -- src/index.ts src/components/index.ts src/lib/index.ts` | **empty** |
| 🔴 Additive — measured | **1,536** caller shapes rendered against `main@ce47010` and against this change, whole `innerHTML` | **byte-identical, no output** (`test-results.md` §3) |
| ⚠ Declared behaviour change — measured | 576 row-`valign` shapes classified | **48 rendering changes, every one exactly the defect's shape**; 72 class-order-only; 456 identical (`test-results.md` §4) |
| Dependency audit | Node reproduction of CI's `pnpm audit --prod --audit-level=high` (`ci.yml:68`) | **PASS** — 6 highs, all six on the standing owner-approved ignore list, **0 new**, **0 blocking**. `pnpm audit` itself is permission-blocked and is **not** claimed as run. The handover's third sanity check was added and passed: **0 of 13 parsed ids empty or non-GHSA** |
| Lint | `pnpm lint` | **no `lint` script and no eslint config exist in this package** — `known-issues.md` A-5, recorded not invented |
| Format | `pnpm format:check` | Pre-existing repo-wide drift: no prettier config; **all 48 `src/` files fail, including files this change never opened**. Not a CI job. `known-issues.md` A-5 |
| Migration | — | **N/A — this package has no database by construction.** No file, nothing classified, nothing promoted. No `migrations-pending/` entry |
| Throwaway Postgres | — | **never started**; no running container, no stopped container, port 5433 never held |
| Consumer pins | — | **none bumped**, and none may be from here |
| CI | GitHub Actions | Not waited for, by instruction. The conductor polls and merges |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-07/output/test-results.md` | **PASS** | 269 passed / 14 files; +6 new; **0 edited**; 0 failed; 0 skipped; **1,536-shape byte-identical render diff**; 576-shape group-3 classification; 5 mutations, **5 caught**; audit output quoted verbatim with its 4 input checks |
| `runs/change-07/output/qa-report.md` | **PASS** | **18 acceptance criteria, 18 traced** — 16 PASS, 2 N/A with stated causes; 6 adversarial checks; 4 honest limits |
| `runs/change-07/output/defect-log.md` | **0 open** | 1 found, 1 closed (**D-1**, process/high — the mutation harness reverted the unstaged fix); F1 recorded as CONFIRMED and FIXED; 0 specs edited to pass |
| `runs/change-07/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy, no database. 7 substitute verifications; Postgres explicitly never started |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-07/output/revision-review.md` | **PASS** | **8 plan clauses checked, 8 built, 0 deviations**; 7 review dimensions; the "do not collapse the two emission positions" contract re-verified intact |
| `runs/change-07/output/simplification-opportunities.md` | **PASS** | 4 candidates: **0 accepted, 4 rejected** with reasons |
| `runs/change-07/output/accepted-refactors.md` | **0 accepted** | Recorded as an outcome with its reason, not left implicit. The two renames are **the fix**, not refactors alongside it |
| `runs/change-07/output/readable-code-scorecard.md` | **12 / 12 PASS** | Comment-to-code ratio justified against this file's idiom rather than trimmed |
| `runs/change-07/output/centrality-scorecard.md` | **PASS** | Centrality **HIGH**; 6 cross-system seams mapped; **0 coordinated multi-app moves created**; blast radius today measured at **zero** |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-07/output/changed-files.md` | complete | **1 source file modified (+31 / −13), 3 barrels UNCHANGED, 0 source added, 0 deleted**; 1 test file modified (+155 / −0); 7 groups considered and left untouched with reasons; **5 throwaway harnesses created, used and deleted**, each named |
| `runs/change-07/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **10 / 10 of the plan's cited facts verified exact — nothing had moved** |
| `runs/change-07/output/known-issues.md` | **0 open defects, 0 open decisions** | 5 environment/lane items (A), 2 advisory watch items (B), 3 carried open questions (C), **technical debt: none, with the reason recorded** (D), 3 consumer obligations (E) |
| `runs/change-07/technical-debt.md` | **not created** | **Deliberate, with the reason recorded** in `known-issues.md` §D: the plan's one anticipated debt item existed only under option **B**; the owner chose **A**, which *removes* the silent override rather than documenting it. **Nothing was appended to `runs/change-06/technical-debt.md`** — a closed unit is immutable |

## 3. The additive claim — and WHICH existing callers were checked

Five apps pin this package by git sha and each bumps when it chooses, so "every existing caller
renders byte-identically" is the lane rule, not a preference.

**The proof, checkable from the diff:**

1. **All three barrels are byte-identical.** `git diff --cached --stat` on `src/index.ts`,
   `src/components/index.ts` and `src/lib/index.ts` prints **nothing**. No export added, removed,
   renamed or moved. **No field was added either** — this is a behaviour correction inside one
   function body, not a new option.
2. **`src/` is +31 / −13, and `git diff -w` is identical to `git diff`** — no whitespace churn, every
   changed line a real change. **Three lines are behaviour**; the other 28 insertions are comments.
3. **No field removed, no default changed, no export moved.** `align-middle` is still the answer for
   every cell that does not ask, **in the position it has always occupied** (D-2 intact, pinned by
   T-1 and T-8, proved by mutations M-2 and M-4).
4. 🔴 **1,536 caller shapes were rendered against `main@ce47010`'s component and against this one,
   comparing the entire `innerHTML`, and the diff is empty.** Group **A** = 384 shapes with **no
   `valign` anywhere** — i.e. every existing caller in every consumer today. Group **B** = 1,152
   shapes with a **cell** `valign` set. Method in `test-results.md` §3; group A's 384 reproduces
   CR-006's own figure as a cross-check.
5. ⚠ **The one honest asterisk, measured rather than waved at.** Cells inside a row that **sets**
   `valign` are the only ones that move: of 576 such shapes, **456 are identical strings, 72 differ
   in class ORDER only** (same class set → identical rendering, the argument T-5 already records),
   and **48 change rendering — every one of them exactly the defect's shape** (`cell=undefined` +
   a conflicting vertical utility in `className`). **That is the fix, and nothing else changed.**

**Which existing callers were checked, and why they are unaffected — stated plainly:**

- **Bananaworld-DC** — pin is `#0633476…` (**CR-004's sha, three changes behind**), so DC's build
  **cannot see `TableRow.valign` at all**. `grep -rni "valign"` across the whole DC repo returns
  **0 occurrences**, re-run this session. **No DC `TableCell` carries a vertical utility in
  `className`**: all 10 `align-*` hits are `<span>`s except `SalesOrderForm.tsx:1024-1026`, which
  defines `const cell = "px-[1.125rem] py-2.5 align-top"` and applies it to **raw `<td>`s** (lines
  1042, 1063, 1074, 1086, 1114, 1119) — that file **does not import `TableCell` at all**. Untouched
  twice over. 🔴 **DC's suite was NOT run and nothing here claims it was.**
- **Bananaworld-CRM, RMS, org-admin, Manga Verde** — **not readable from this worktree and not
  opened.** All four are behind CR-006 **by construction** (it merged 2026-08-24 and every pin bump
  is still owed), so none can be exercising the defective combination. Stated as a **limit, not a
  clearance**.
- **This package's own 263 pre-existing specs** — all green, **all unedited**, including the 17
  CR-006 Table specs that pin the exact class strings.

**Nothing renders differently in any app until that app bumps its pin AND writes a row-level
`valign` on a cell that already carries a conflicting vertical utility. No app does either today.**

## 4. The trap — who owns which half

| Half | Owner | State |
|---|---|---|
| Restore **cell > row** precedence for the `className` rung (D-6) | **This change** | ✅ T-17, T-18, T-21; mutation M-1 reddens them |
| Keep the vertical default `middle`, and keep its **POSITION** (D-2) | **This change** | ✅ T-1, T-8 unedited and green; mutations M-2 and M-4 both redden T-8 |
| Keep the cell's own prop beating `className` (D-3), **including inside a row that has asked** | **This change** | ✅ T-7 unedited, T-19 new; mutation M-3 reddens both |
| Keep the row option actually working — not over-narrowed | **This change** | ✅ T-10 unedited, T-20 new; mutation M-5 reddens both |
| Emit exactly ONE vertical class on every path (D-3) | **This change** | ✅ T-6 (80 combos, unedited), T-21 (80 more, row varied), 576-shape sweep reports **0** exceptions |
| 🔴 Do **not** collapse the two emission positions into one | **every future session** | ⚠ Standing warning, now **more** load-bearing — this change *depends* on both slots. Restated in the code, `revision-review.md` §3, `simplification-opportunities.md` S-1, and the handover |
| Whether any of CRM / RMS / org-admin / Manga Verde writes the affected combination | **each consumer's lane**, at its pin bump | ⚠ **Unverified and not verifiable from here.** Nothing claims otherwise. All four are behind CR-006, so none can be affected yet |

## 5. Scope discipline

Not done, deliberately: **one finding fixed, F1, and nothing else** — including the below-the-bar
findings CR-006's review deliberately did not queue; **no consumer pin bumped** (none of the five
touched); **no consumer file edited**; **the sibling `bananaworld-dc` worktree was read only** —
cited by path and line, never written, staged, committed or formatted; no new field, no new type, no
new export, **no barrel edit**; no change to `TableRow`, `TableHead`, `TableContainer`, `Table`,
`TableHeader`, `TableBody`, `alignClass`, `valignClass`, `RowValignContext` or the provider-always
rule (D-5); no `package.json` or `pnpm-lock.yaml` change and **no new dependency**; **no epic or
milestone unit created**; **`runs/change-06/` cited, never edited**; no migration; no Postgres
started; no performance claim made anywhere.

## 6. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes — one, and it sharpens a rule rather than adding one.** The vertical-alignment precedence for a table cell is now stated in full and in order: **cell `valign` prop > cell `className` > row `valign` prop > the `"middle"` default.** The middle rung is the correction: a `className` utility is a **cell-level** answer — before CR-006 it was the *only* way to write one — so a **row-level** answer must not silently override it. This is D-6 ("the more specific answer wins") read literally, restored to what was approved |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — the CHANGE/DECISION entry for CR-DESIGN-SYSTEM-007 (D-1 … D-7) — **and in the source itself**, in three places a reader will actually be standing: the `Table.tsx` file header, `TableRowProps.valign` and `TableCellProps.valign`. Previously the rule lived only in a decision log the next author would not open, which is how the defect survived. Plus `evidence/developer-handover.md` §1 and specs T-17 … T-21, which fail if any rung is broken (proved by mutations M-1, M-3, M-5) |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a **governance decision for the owner**, not part of this change (`known-issues.md` C, **seventh** change to raise it). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 7. Sign-off

| Item | Status |
|---|---|
| Plan's cited facts re-verified against the code before building | ✅ **10 / 10 exact — nothing had moved**; baseline 263/14 matched the plan's prediction |
| 🔴 The finding re-confirmed against current code before a fix was planned | ✅ **F1 CONFIRMED present**, by reading `Table.tsx:249` *and* by mutation M-1. Nothing was fixed that was not there |
| Built to the owner-approved plan | ✅ **8 / 8 clauses, 0 deviations** |
| Owner's layout decision (A) implemented, and its reason written down | ✅ the cell's own answer wins; T-17, T-18; justified in `revision-review.md` §1 |
| 🔴 The default stays `middle`, in its position — the estate-wide contract | ✅ T-1, T-8 unedited; mutations M-2 and M-4 |
| Additive-only rule held and **proved** | ✅ barrels empty; 0 fields added or removed; 0 defaults changed; 0 exports moved; **1,536-shape render diff byte-identical** |
| ⚠ The one behavioural change declared **before** it could be discovered at a gate, then measured | ✅ plan §4.3 declared it; §4 of `test-results.md` measures it: **48 changes, all the defect's shape** |
| Every existing caller addressed, none sampled | ✅ §3 — by the diff, by the 1,536-shape measured diff, and by a read-only grep of DC; the four unreadable repos named as unreadable |
| 🔴 Exactly one vertical class, on every path | ✅ T-6, T-21, and **0** exceptions across the 576-shape sweep |
| 🔴 The new specs proved to FAIL against the shipped bug | ✅ mutation **M-1** reddens T-17 and T-18. A regression test that never reddens proves nothing |
| Mutation honesty | ✅ **5 run, 5 caught**, with the harness asserting each mutation actually applied so a no-op could not be scored as a catch |
| Radix, not hand-rolled | ✅ N/A by construction — `Table` has no Radix underpinning; none added or replaced |
| Keyboard + screen-reader behaviour unchanged | ✅ nothing focusable, no ARIA, no tab order, no semantics touched |
| Tests green, typecheck clean | ✅ **269 / 269**, clean |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files, plus `changed-files.md`, `implementation-summary.md`, `known-issues.md` |
| Throwaway harnesses deleted, none left in the tree | ✅ 5 created, 5 deleted, each named in `changed-files.md` §4 |
| Throwaway Postgres cleaned up | ✅ **never started** — no database in this package |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| No consumer pin bumped | ✅ |
| ⚠ Sibling repo left byte-identical | ✅ `bananaworld-dc` **read only** — no `Write`/`Edit`/stage/commit/formatter ever targeted a DC path |
| In-session defect found and fixed rather than hidden | ✅ **D-1** — the mutation harness reverted the unstaged fix; caught, corrected, and M-1's validity re-established |
| No performance claim made anywhere | ✅ none made |
| Open defects | **0** |
| Open decisions | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
