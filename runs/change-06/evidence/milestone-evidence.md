# Milestone evidence — CR-DESIGN-SYSTEM-006

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's permitted directories and the read is refused, so the template could not be
> copied and filled in as instructed. This file follows the structure of
> `runs/change-05/evidence/milestone-evidence.md`, which **was** produced from that template — so the
> boilerplate is inherited rather than re-typed, per the rule. It **cites** each discrete artifact by
> path, status and counts rather than restating it. Sixth change to hit this limit
> (`known-issues.md` B-3).

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-006** — a row of fields can line up along the top |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-06/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-006`, off `origin/main` @ `fc6f6c6` |
| Approved layout | **A** — a row-level default **with** a per-cell override (owner, plan gate) |
| Ship mode | **on-green** |
| Date | 2026-08-24 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` |
| Tests | `pnpm test` | **263 passed / 14 files**, 0 failed, 0 skipped (baseline before any edit: **246 / 13**) |
| New specs | — | **+17** |
| **Existing specs edited** | — | **0** — there were no Table specs to edit (F-8), and no other `src/` component renders a `<td>` |
| Mutation check | 5 deliberate breakages | **4 caught; 1 (M-3) proven observationally inert and reported as NOT caught** (`test-results.md` §4.1) |
| Additive — diff | `git diff --numstat fc6f6c6 -- src/` | **+77 / −13**; ignoring whitespace **+67 / −3** → only **3 real deletions**, each itemised in `changed-files.md` §1.1 |
| Additive — export surface | `git diff fc6f6c6 -- src/index.ts src/components/index.ts src/lib/index.ts` | **empty** |
| 🔴 Additive — measured | 384 existing-caller shapes rendered against `main@fc6f6c6` and against this change, whole `innerHTML` | **byte-identical** (`test-results.md` §3) |
| Dependency audit | Node reproduction of CI's `pnpm audit --prod --audit-level=high` | **PASS** — 6 highs, all six on the standing owner-approved ignore list, **0 new**, 0 blocking. `pnpm audit` itself is permission-blocked and is **not** claimed as run. The probe was wrong on its first run and was corrected (`defect-log.md` D-1) |
| Lint | `pnpm lint` | **no `lint` script and no eslint config exist in this package** — `known-issues.md` C-1, recorded not invented |
| Format | `pnpm format:check` | Pre-existing repo-wide drift: no prettier config; **all 48 `src/` files fail, including files this change never opened**. Not a CI job. `known-issues.md` C-2 |
| Migration | — | **N/A — this package has no database.** No file, nothing classified, nothing promoted. No `migrations-pending/` entry |
| Throwaway Postgres | — | **never started**; no running container, no stopped container, port 5433 never held |
| Consumer pins | — | **none bumped**, and none may be from here |
| CI | GitHub Actions | Not waited for, by instruction. The conductor polls and merges |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-06/output/test-results.md` | **PASS** | 263 passed / 14 files; +17 new; 0 edited; 0 failed; 0 skipped; **384-shape byte-identical render diff**; 5 mutations (4 caught, 1 inert); audit output quoted verbatim |
| `runs/change-06/output/qa-report.md` | **PASS** | **24 acceptance criteria, 24 traced** — 23 PASS, 1 N/A with a stated cause; 15 adversarial checks; 7 standards held |
| `runs/change-06/output/defect-log.md` | **0 open** | 1 found, 1 closed (medium — the audit probe's false first verdict); 4 "not a defect" records; 7 items deferred to named owners |
| `runs/change-06/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy, no database. 9 substitute proofs; 4 items honestly deferred to the first adopting screen |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-06/output/revision-review.md` | **PASS** | **26 plan clauses checked, 26 built**; 3 immaterial deviations recorded; 8 review dimensions; 10 over-build temptations declined |
| `runs/change-06/output/simplification-opportunities.md` | **PASS** | 7 candidates: **1 accepted, 6 rejected** with reasons; 8 simplifications recorded as already built in |
| `runs/change-06/output/accepted-refactors.md` | **1 accepted** | `verticalClasses()` extracted in the spec file. **Test-only; no source file refactored.** Typecheck clean, 263/263 green afterwards |
| `runs/change-06/output/readable-code-scorecard.md` | **12 / 12 PASS** | Three weak points stated rather than trimmed (comment density, a 13-line prop doc, a 463-line spec file) |
| `runs/change-06/output/centrality-scorecard.md` | **12 / 12 PASS** | 7 cross-system seams mapped; **0 coordinated multi-app moves created**; 4 items of downstream work named with owners and triggers |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-06/output/changed-files.md` | complete | **1 source file modified (+77 / −13, of which 3 real deletions), 3 barrels UNCHANGED, 0 source added, 0 deleted**; 1 test file added (+463); 11 files considered and left untouched with reasons; 8 throwaway files created and deleted |
| `runs/change-06/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **14 / 15 of the plan's cited facts verified exact**; the 15th (F-14, a count) recorded as overstated, approach unaffected |
| `runs/change-06/output/known-issues.md` | **0 open defects, 0 open decisions** | 3 change items (A), 4 session limits (B), 5 pre-existing drift items (C), 5 watch items (D) |
| `runs/change-06/technical-debt.md` | **5 items, all owned** | TD-1 `TableHead`; TD-2 `"baseline"`; TD-3 the prop-name residual; TD-4 pre-existing drift; TD-5 the re-derived audit probe. Each with a named trigger; none built |

## 3. The additive claim — and WHICH existing callers were checked

Five apps pin this package by git sha and each bumps when it chooses, so "every existing caller
renders byte-identically" is the lane rule, not a preference.

**The proof, checkable from the diff:**

1. **All three barrels are byte-identical.** `git diff fc6f6c6 -- src/index.ts src/components/index.ts
   src/lib/index.ts` prints **nothing**. No export added, removed, renamed or moved. `valign` is a new
   optional field on interfaces that were already exported; `VAlign` is module-private, like `Align`.
2. **`src/` has exactly 3 real deletions**, all itemised in `changed-files.md` §1.1, all
   replacements-in-place. The other 10 are the `<tr>` block re-indented two spaces inside the context
   provider — `git diff -w` reports none of them.
3. **No field removed, no default changed, no export moved.** `align-middle` is still the answer for
   every cell that does not ask, in the position it has always occupied.
4. 🔴 **T-1, T-2, T-15 and T-16 were committed GREEN against the unmodified component** as `f59f2c7`,
   *before* `src/` was touched, and are **unedited and still green** in the final tree.
5. 🔴 **384 existing-caller shapes were rendered against `main@fc6f6c6`'s component and against this
   one, comparing the entire `innerHTML`, and the diff is empty.** That is the byte-identity claim
   measured rather than asserted — the method is in `test-results.md` §3.

**Which existing callers were checked, and why they are unaffected — stated plainly:**

- **Bananaworld-DC — 39 files in `src/` use `TableCell`** (40 incl. tests; the plan said 50, which was
  overstated — `known-issues.md` A-1). **None passes `valign`: zero occurrences of the string across
  the whole DC repo.** So `resolved` is `undefined` for every one and the emitted string is the same
  string. Its **sales order grid does not use `TableCell` at all** — it hand-rolls `<td>` with
  `align-top` (`SalesOrderForm.tsx:1026`), so it is untouched twice over. Its three Table specs are
  behavioural (render, `aria-sort`, `onSort`) and **cannot** redden on a class-string change.
  🔴 **DC's suite was NOT run and nothing here claims it was** — consumer repos are not runnable from
  a build worktree. The argument above is a code argument plus a read-only grep.
- **Bananaworld-CRM, RMS, org-admin, Manga Verde** — **not readable from this worktree and not
  opened.** Their safety rests on the mechanism (a cell that passes nothing emits the identical
  string, proved at §3.5) plus T-1/T-2/T-15, with the single named residual at §4 below. Stated as a
  limit, not papered over.
- **This package's own 246 pre-existing specs** — all green, **all unedited**. None renders a `Table`;
  this package had no Table coverage at all before this change.

**Nothing renders differently in any app until that app bumps its pin AND passes the new prop. No app
does either today.**

## 4. The trap — who owns which half

The request named the real risk: **flipping the default would silently move the contents of every
table in the estate.** A second, subtler trap emerged during the build and is recorded rather than
left to be discovered.

| Half | Owner | State |
|---|---|---|
| Keep the vertical default `middle` | **This change** | ✅ unchanged; T-1 pins the exact string; mutation M-1 reddens 5 specs |
| Keep the default's **POSITION** in the class list, so today's `className="align-top"` workaround still wins | **This change** | ✅ T-8; mutation M-2 reddens 4 specs. *This is the half that is easy to miss* |
| Make the prop beat a caller's `className` | **This change** | ✅ T-7; mutation M-5 reddens 4 specs |
| Emit exactly ONE vertical class on every path | **This change** | ✅ T-6, 80 combinations |
| Don't reintroduce the horizontal `text-left`/`text-right` bug | **This change** | ✅ T-9, 5 cases, with and without `valign` |
| 🔴 The `valign` prop name takes over a deprecated DOM attribute | **This change**, declared | ✅ in the prop's doc comment, `qa-report.md` §3.3, `known-issues.md` B-2, `technical-debt.md` TD-3 |
| Whether **any of CRM / RMS / org-admin / Manga Verde** passes that legacy attribute today | **each consumer's lane**, at its pin bump | ⚠ **Unverified and not verifiable from here.** Nothing claims otherwise. DC is proven clean (0 occurrences). One-line grep owed; `verticalAlign` is the zero-residual fallback |

## 5. Scope discipline

Not done, deliberately: **no consumer pin bumped** (none of the five touched); **no consumer file
edited**; **the sibling `bananaworld-dc` worktree was read only** — cited by path and line, never
written, staged, committed or formatted; no change to `alignClass`, `Align`, `align`, `numeric`,
`muted`; **`TableHead` gains nothing**; no change to `TableContainer`, `Table`, `TableHeader`,
`TableBody`, `sortIndicator` or `ariaSort`; **no barrel edit, no new export, no new type name in the
public surface**; no `"baseline"` union member; no new dependency, no new file under `src/`, no
`package.json` or `pnpm-lock.yaml` change; **no epic or milestone unit created**; no migration; no
Postgres started; no performance claim made anywhere.

## 6. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, one, and it is a design rule for this primitive: a table cell's vertical alignment is opt-in, its default is `middle`, and that default is estate-wide contract.** Its corollary is equally binding and is the part a future session will trip on: **exactly one vertical-align class is emitted, and it is emitted in one of two POSITIONS** — in place when nobody asked (so today's `className` workaround still wins), after `className` when asked (so the prop cannot be silently defeated) |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — the CHANGE/DECISION entry for CR-DESIGN-SYSTEM-006 (D-1 … D-10) — **and in the source itself**, commented on the two lines a future session would edit, plus `evidence/developer-handover.md` §1, `known-issues.md` D-2, and specs T-7 and T-8, which fail if either half is broken (proved by mutations M-2 and M-5) |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a **governance decision for the owner**, not part of this change (`known-issues.md` C-5, **sixth** change to raise it). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 7. Sign-off

| Item | Status |
|---|---|
| Plan's cited facts re-verified against the code before building | ✅ **14 / 15 exact**; F-14's count overstated and recorded; baseline 246/13 matched the plan's prediction |
| Built to the owner-approved plan | ✅ **26 / 26 clauses**; 3 immaterial deviations recorded |
| Owner's layout decision (A) implemented, and its reason written down | ✅ row default + cell override; T-10, T-11; justified in `revision-review.md` §2 |
| 🔴 The default stays `middle` — the estate-wide contract | ✅ T-1; mutation M-1 reddens 5 specs |
| Additive-only rule held and **proved** | ✅ barrels empty; 3 real deletions itemised; **384-shape render diff byte-identical**; 0 fields removed, 0 defaults changed, 0 exports moved |
| Every existing caller addressed, none sampled | ✅ §3 — by the diff, by the 384-shape measured diff, and by pre-edit specs, not by sampling |
| 🔴 Exactly one vertical class, and `className` cannot defeat the prop | ✅ T-6 (80 combinations), T-7; both proved by mutation |
| 🔴 The package's own alignment precedent followed, not just cited | ✅ `valignClass` mirrors `alignClass` in shape and reasoning; T-9 re-guards the original bug |
| 🔴 The prop-name collision declared, not discovered later | ✅ in five artifacts, with a named zero-residual fallback |
| 🔴 The unverifiable cross-repo items named as unverifiable | ✅ nothing claims any consumer suite was run |
| Mutation honesty | ✅ **M-3 reported as NOT caught**, with a 320-row byte-identical diff proving it inert, and M-5 added to cover the real gap |
| Radix, not hand-rolled | ✅ N/A by construction — no interactive control added or replaced |
| Keyboard + screen-reader behaviour unchanged | ✅ nothing focusable, no ARIA, no tab order, no semantics touched; `TableHead` byte-identical (T-14) |
| Tests green, typecheck clean | ✅ 263 / 263 |
| Specs proved to BITE, not assumed to | ✅ 5 mutations run; 4 caught; the 5th proven inert rather than waved through |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files, plus `changed-files.md`, `implementation-summary.md`, `known-issues.md` |
| Throwaway Postgres cleaned up | ✅ **never started** — no database in this package |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| No consumer pin bumped | ✅ |
| ⚠ Sibling repo dirty paths disclosed rather than hidden | ✅ `known-issues.md` A-2 — reads only from this session; one file moved at 18:00 by another process |
| No performance claim made anywhere | ✅ none made |
| Open defects | **0** |
| Open decisions | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
