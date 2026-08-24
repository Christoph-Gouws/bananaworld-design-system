# QA report — CR-DESIGN-SYSTEM-006

> Every acceptance criterion traced to a verdict. Criteria are taken from the change request text and
> the owner-approved plan; none was invented and none dropped.

**Overall verdict: PASS — ready for PR (ship mode: on-green).**
**24 acceptance criteria · 24 traced · 23 PASS · 1 PASS(N/A) with a stated cause · 0 FAIL.**

## 1. Acceptance criteria from the request

| # | Criterion (from the request) | Verdict | Evidence |
|---|---|---|---|
| AC-1 | Table cells have a way to align to the top | **PASS** | `valign?: VAlign` on `TableCellProps`; T-3 |
| AC-2 | The option is a vertical-alignment option — `top` \| `middle` \| `bottom` | **PASS** | `type VAlign`; T-3, T-4, T-5 |
| AC-3 | 🔴 **The default MUST stay `middle`. The global default is NOT changed** | **PASS** | `valignClass` returns `align-middle` for `undefined`; T-1 asserts the exact string; **mutation M-1 flips it and 5 specs redden** |
| AC-4 | 🔴 Every existing caller renders **byte-identically** | **PASS** | **384 caller shapes, full `innerHTML`, diffed against `main@fc6f6c6` → byte-identical** (`test-results.md` §3). Plus T-1/T-2/T-15/T-16 committed green **pre-edit** (`f59f2c7`) and unedited after |
| AC-5 | Say **how** that was proved, not just assert it | **PASS** | `test-results.md` §3 gives the command, the shape count, the swap-in of `main`'s component, and the empty diff. §3 of this report names the callers |
| AC-6 | Consider whether `TableRow` should set it once for all its cells — **choose and justify** | **PASS** | Chosen: **yes** (owner-approved layout A). Justified in `revision-review.md` §2 and in the source comment; T-10 |
| AC-7 | A cell can still opt out of its row's setting | **PASS** | cell-over-row precedence; T-11; **mutation M-4 inverts it and T-11 reddens** |
| AC-8 | 🔴 Emit **exactly one** vertical-align class | **PASS** | `valignClass` returns one class on every path; **T-6 across 80 combinations**; emitted in exactly one of two positions |
| AC-9 | 🔴 A caller passing `className` cannot silently defeat it | **PASS** | the asked-for class is emitted **after** `className`; **T-7**; mutation M-5 breaks the pairing and T-8 reddens |
| AC-10 | Follow the package's own alignment precedent (the `alignClass` comment) | **PASS** | `valignClass` mirrors `alignClass` in shape and carries the same reasoning in its comment; `readable-code-scorecard.md` #4 |
| AC-11 | Do not reintroduce that class of bug (the `text-left` / `text-right` regression) | **PASS** | **T-9** re-guards horizontal alignment with and without `valign`, on the axis the original bug happened on |
| AC-12 | Run the package test suite | **PASS** | `pnpm test` — **263 passed / 14 files** (baseline 246 / 13) |
| AC-13 | State **explicitly which existing callers were checked and why they are unaffected** | **PASS** | §3 below, named repo by repo, including the four that could not be read |
| AC-14 | The CRM-side adoption is **out of scope** | **PASS** | no consumer file touched; `git status` clean of consumer paths; recorded in the handover as the next lane |
| AC-15 | **No consumer pin bumped** | **PASS** | `package.json` byte-identical; no consumer repo written to |
| AC-16 | Additive-only: no field removed, no default changed, no export surface altered | **PASS** | 3 real deletions, all itemised and all replacements-in-place (`changed-files.md` §1.1); **all three barrel diffs empty**; T-16 |
| AC-17 | If it cannot be made additively — stop and say so | **PASS** | The obligation was live and was discharged: the change **could** be made additively, so there was nothing to stop for. Two optional fields, one private helper, one private context, zero barrel movement, and the byte-identity proved over 384 shapes. Had it not been additive this would have been a `CHANGE_BLOCKED` |

## 2. Acceptance criteria from the lane and the plan

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-18 | Owner-approved **layout A** implemented as approved | **PASS** | row-level default **with** a per-cell override; T-10 + T-11 |
| AC-19 | Radix: no interactive control added, replaced or hand-rolled | **PASS** | `Table` is a plain semantic `<table>` with no Radix underpinning; this change adds no control. Keyboard/focus/SR behaviour is untouched — no focusable element, no ARIA, no tab order changed |
| AC-20 | No migration invented; migration handling correct | **PASS (N/A, recorded)** | This package has **no database by construction**. No file written, nothing classified, nothing promoted, no `migrations-pending/` entry |
| AC-21 | Throwaway Postgres named correctly and cleaned up | **PASS** | **never started** — there is nothing to test against. No running container, no stopped container, port 5433 never held |
| AC-22 | The change archives to `runs/change-06/`; **no epic or milestone unit created** | **PASS** | no `runs/epic-NN/`, no `milestone-NN/`, nothing under `runs/current/epic-plan/`. Verified by `git status` and directory listing |
| AC-23 | 🔴 The read-only sibling repo is never written, staged, committed or formatted | **PASS, with a concurrency observation** | **This session issued only reads against `bananaworld-dc`** (Grep, `grep`, `ls`, `git -C … status/diff/log`). No Write/Edit targeted a DC path and no formatter ran there. ⚠ **DC nonetheless has two dirty paths, one modified at 18:00 — inside this session's window — by ANOTHER process.** Full disclosure in `known-issues.md` **A-2**; it is a DC epic plan about label printers, unrelated to this change |
| AC-24 | Stage 04 + Stage 05 artifacts exist as their **own files**, not a roll-up | **PASS** | 12 files in `runs/change-06/output/`, 4 in `evidence/`, plus `technical-debt.md` |

## 3. 🔴 Which existing callers were checked, and why they are unaffected

The lane rule is that **every** existing caller in **every** consumer renders byte-identically. Here
is what that rests on, named honestly — including where it rests on argument rather than execution.

### 3.1 The mechanism (covers all five apps)

A cell that passes no `valign`, inside a row that passes no `valign`, resolves to `undefined`. The
class is then emitted **in the position `align-middle` has always occupied**, with the identical
value. There is no code path by which an unasking caller reaches a different string. **Proved by the
384-shape byte-identical render diff against `main@fc6f6c6`** (`test-results.md` §3), not by
inspection.

### 3.2 Bananaworld-DC — read directly, read-only

| Check | Result |
|---|---|
| Files referencing `TableCell` | **39** in `src/` (40 incl. tests). *The plan said 50 — overstated; see `known-issues.md` A-1* |
| Files passing `valign` | 🔴 **ZERO.** `grep -rn valign src tests` → **0 matches across the whole DC repo** |
| Every `align-*` utility in DC | 8 × `align-middle`, **every one on a `<span>`**, none on a `TableCell`; plus 1 × `align-top` at `SalesOrderForm.tsx:1026` |
| DC's sales order grid | Does **not** use `TableCell` at all — it hand-rolls `<td className={cell}>` with `"px-[1.125rem] py-2.5 align-top"` (`SalesOrderForm.tsx:1026`). Untouched twice over |
| DC's Table specs | All three are **behavioural** (renders cells, `aria-sort`, `onSort`). **None reads source text; none asserts a class string.** `tests/unit/ui/table.test.tsx`. Cannot redden |
| DC's re-export barrel | `src/components/ui/index.ts:44–54` re-exports all 7 values + 3 types. **No export moved**, so it is unaffected |

🔴 **DC's suite was NOT run and nothing here claims it was.** Consumer repos are not runnable from a
build worktree. The above is a code argument plus a read-only grep — stated as such.

**Note for DC's own lane (not this change):** DC solved this exact problem first, by *abandoning* the
primitive for raw `<td>`s. That is the cost of the missing option, already paid once. Whether DC now
folds back onto `TableCell` is DC's call (OQ-5), recorded in the developer handover.

### 3.3 CRM, RMS, org-admin, Manga Verde — **not readable from here, and not opened**

Their safety rests on §3.1 (the mechanism, measured) plus T-1/T-2/T-15, with **one named residual**:

> A caller passing the **deprecated presentational `valign` attribute** to `TableCell` today gets a
> dead DOM attribute and middle alignment. After this change it gets what it literally asked for.

DC is proven clean (zero occurrences). The other four are unverifiable from here and **nothing claims
otherwise**. Mitigation, in each consumer's own lane: **one grep for `valign` before it bumps its
pin** — recorded in `developer-handover.md` §2 and in `SESSION_HANDOVER.md`. Zero-residual fallback
name if a live usage is ever found: `verticalAlign` (provably unreachable today — not in
`TdHTMLAttributes`, no index signature, so passing it is a TypeScript error). Carried, **not built**.

### 3.4 This package's own suite

**246 pre-existing specs, all green, all unedited.** None of them renders a `Table` — this package
had no Table specs at all before this change (F-8), which is why 17 were added.

## 4. Adversarial checks — trying to break it

| # | Attack | Result |
|---|---|---|
| 1 | Does a `className` conflict silently win over the prop? | No — T-7. The asked-for class is emitted last |
| 2 | Does the prop silently break today's `className="align-top"` workaround? | No — T-8, and the 384-shape diff includes that exact shape on plain, numeric and muted cells |
| 3 | Can two vertical classes reach the DOM? | No — T-6 over 80 combinations counts exactly one every time |
| 4 | Does a nested table inherit its ancestor row's alignment? | No — T-12. The row always provides, so it resets |
| 5 | Does a sibling row leak? | No — T-12 asserts the sibling is byte-identical to the default |
| 6 | Does the row beat the cell? | No — T-11, and mutation M-4 proves T-11 bites |
| 7 | Does `valign` leak to the DOM as an attribute? | No — T-13, on both `<td>` and `<tr>` |
| 8 | Did `TableHead` change? | No — T-14 asserts its exact class string inside a top-aligned row |
| 9 | Did the numeric right-alignment regression come back? | No — T-9, five cases, with and without `valign` |
| 10 | Did the export surface move? | No — T-16, and all three barrel diffs are empty |
| 11 | Would flipping the default be caught? | Yes — M-1, five specs redden |
| 12 | Would moving the default to the end of the list be caught? | Yes — M-2, four specs redden |
| 13 | Would emitting the class twice, positionally, be caught? | Yes — M-5, four specs redden |
| 14 | Is `useContext` called conditionally? | **No — checked deliberately.** `valign ?? useContext(...)` would short-circuit and break the rules of hooks. The context is read unconditionally into `rowValign` first, then `??` is applied |
| 15 | Does always-providing the context change the DOM? | No — a provider emits no node. The 384-shape `innerHTML` diff is empty, which covers this directly |

## 5. Standards held

| Standard | Held |
|---|---|
| Additive-only (lane rule) | ✅ two optional fields, nothing removed, no default moved, no export moved |
| The package's one-class alignment precedent | ✅ mirrored, commented, and tested over 80 combinations |
| Module-private union, like `Align` | ✅ `VAlign` is not exported; zero barrel movement |
| Pure presentation, no data/permission/i18n logic (TECH-COMP-003) | ✅ nothing added reads data, session or scope |
| No performance claim | ✅ none made anywhere |
| No configurability in anticipation | ✅ `TableHead` deliberately gains nothing (OQ-4 → `technical-debt.md` TD-1) |
| Consumer pins move only against a merged sha (KI-M001E19-002) | ✅ no pin bumped here; restated in the handover |
