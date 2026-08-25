# QA report — CR-DESIGN-SYSTEM-007

**Verdict: PASS.** Every acceptance criterion traced to a spec or a measurement. 0 open defects.

## 1. Acceptance criteria → verdict

The contract is the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-007.md`, layout
**A**, ship mode **on-green**.

| # | Criterion (from the plan) | How it was checked | Verdict |
|---|---|---|---|
| AC-1 | **F1 is confirmed against the code as it is now, before any fix is planned** | `Table.tsx:249` read from this worktree at `ce47010`; predicate present verbatim; T-6/T-7/T-8/T-11 re-read and the coverage gap confirmed | ✅ PASS |
| AC-2 | **The row's answer no longer defeats a cell's own `className`** | **T-17** (the finding verbatim), **T-18** (the CRM shape) | ✅ PASS |
| AC-3 | **Precedence is cell prop > cell `className` > row prop > `"middle"`** | **T-21**, which computes the expected winner from the rule and asserts equality across all 80 row×cell×className combinations | ✅ PASS |
| AC-4 | **The cell's own prop still beats `className`** (D-3, T-7's guarantee) — including inside a row that has asked | **T-7** (unedited, green), **T-19** (new, inside a top-aligned row); mutation **M-3** reddens both | ✅ PASS |
| AC-5 | **The row option still works** — not over-narrowed into uselessness | **T-10** (unedited), **T-20** (new, non-alignment `className`); mutation **M-5** reddens both | ✅ PASS |
| AC-6 | 🔴 **Exactly one vertical class on every path** (D-3, the invariant) | **T-6** (80 combos, unedited), **T-21** (80 more, row varied); group-3 sweep reports `shapes without exactly 1 vertical class: 0` across 576 | ✅ PASS |
| AC-7 | 🔴 **The default does not move** — value *or* position (D-2) | **T-1**, **T-8** unedited and green; mutations **M-2** and **M-4** both redden T-8 | ✅ PASS |
| AC-8 | **Every existing caller renders byte-identically** | **1,536 shapes**, whole `innerHTML`, diffed against `main@ce47010` → **no output**; plus **T-22** | ✅ PASS |
| AC-9 | **The export surface does not move** | All three barrels byte-identical (`git diff --cached --stat` empty); **T-16** unedited and green | ✅ PASS |
| AC-10 | **No existing spec edited** | `git diff --numstat` on the test file: **+155 / −0** | ✅ PASS |
| AC-11 | **All 17 existing specs stay green** | `pnpm test` → 269 passed, of which the 17 CR-006 specs are unedited | ✅ PASS |
| AC-12 | **No consumer pin bumped, no consumer file touched** | DC opened read-only; no `Write`/`Edit` ever targeted a DC path; DC not in the diff | ✅ PASS |
| AC-13 | **Additive-only** — nothing removed, renamed, no default changed, no export moved | `changed-files.md` §2; no field added either — this is a behaviour correction inside one function body | ✅ PASS |
| AC-14 | **The behaviour change is declared and bounded, not discovered at the gate** | Group-3 sweep: 48 rendering changes, **all exactly the defect's shape**; 72 order-only; 456 identical | ✅ PASS |
| AC-15 | `pnpm typecheck` clean · `pnpm test` green | clean · **269 / 14 files** | ✅ PASS |
| AC-16 | **Dependency audit reproduced with the third sanity check** the handover demands | S4: 13 ids parsed, **0 empty or non-GHSA**, asserted before any comparison | ✅ PASS |
| AC-17 | **Radix** — no interactive control hand-rolled or replaced | `Table` has no Radix underpinning; this change adds and replaces none. The rule has nothing to bite on | ✅ N/A, recorded |
| AC-18 | **Migration** | **None.** This package has no database by construction | ✅ N/A, recorded |

## 2. Regression sweep

| Area | Result |
|---|---|
| The 17 CR-006 Table specs | **green, unedited** |
| The other 13 test files (246 specs) | **green, untouched** |
| Total | **269 / 269** |
| Barrels / export surface | byte-identical |
| Dependency tree | byte-identical, and audited anyway |

## 3. Adversarial checks — where this fix could plausibly have been wrong

Each is a way the change could have looked right and been wrong. Each was tested, not reasoned about.

| Risk | Why it is plausible | Check | Result |
|---|---|---|---|
| **Over-narrowing** — the row option stops reaching its cells at all | The fix narrows a predicate; narrowing too far still passes T-17 | **T-20**, **T-10**, mutation **M-5** | row still reaches cells that express nothing |
| **The prop loses to `className`** — position (B) broken while chasing the row case | Both slots were re-keyed on a new predicate | **T-7**, **T-19**, mutation **M-3** | prop still wins, incl. inside a top-aligned row |
| **Two vertical classes emitted** — the exact bug class CR-006 existed to remove | Two conditional slots on one axis | **T-6**, **T-21**, group-3 sweep across 576 shapes | exactly one, everywhere, 0 exceptions |
| **The default silently moves** | D-2 is the estate-wide contract | **T-1**, **T-8**, mutations **M-2**, **M-4** | value and position both unmoved |
| **A new spec that does not fail against the bug** | A regression test that never reddens proves nothing | mutation **M-1** restores the shipped defect | **T-17, T-18 redden** — they are real |
| **Silent rendering change beyond the fix** | Behaviour changed for one input class | 576-shape group-3 sweep, every difference classified | **48 changes, all exactly the defect's shape**; nothing else |

## 4. Defects found during the build

**One**, found and fixed inside this session. Full detail in `defect-log.md`.

| # | Defect | Severity | Status |
|---|---|---|---|
| D-1 | The mutation harness restored `Table.tsx` with `git checkout --` while the fix was still **unstaged**, so the first restore silently reverted the change under test | process, high — a later mutation would have been scored against unfixed code | **FIXED in session.** Fix staged first, so restores return the fixed file; M-1's result was re-validated as having run against the fixed component |

## 5. Honest limits

- **No consumer app suite was run**, and none could be: four of five consumer repos are unreadable
  from a build worktree, and DC is read-only. **Sixth change to record this.**
- **No visual/browser check.** This package ships TypeScript source only and has no app shell. The
  rendering claim rests on whole-`innerHTML` diffing, which is stronger than a screenshot for this
  question.
- **`pnpm audit` itself was not run** (permission-blocked); it was reproduced in Node and is labelled
  as a reproduction everywhere it appears.
- **`pnpm lint` and `pnpm format:check` were not run** — no lint script, no eslint config and no
  prettier config exist in this repo. Pre-existing drift, out of this change's lane, re-verified.
