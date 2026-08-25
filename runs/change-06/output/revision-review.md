# Revision review — CR-DESIGN-SYSTEM-006

> Stage 05. Reviews **only** the files in `changed-files.md`: `src/components/Table.tsx` and
> `tests/components/Table.test.tsx`.

**Verdict: PASS.** Built to the owner-approved plan. **26 plan clauses checked, 26 built.**
**3 deviations, all immaterial and all recorded below.** 0 open decisions.

## 1. Was the approved plan built — clause by clause

| # | Plan clause | Built | Where |
|---|---|---|---|
| 1 | `type VAlign = "top" \| "middle" \| "bottom"` | ✅ | `Table.tsx` |
| 2 | `VAlign` stays **module-private**, like `Align` | ✅ | not exported; three barrel diffs empty |
| 3 | `valignClass()` returns **exactly one** class on every path | ✅ | three returns, one class each |
| 4 | It carries the `alignClass` reasoning in its own comment | ✅ | verbatim in shape and intent |
| 5 | `TableCellProps.valign?: VAlign`, optional | ✅ | |
| 6 | Its doc comment states the estate-wide default in the strongest terms | ✅ | 🔴 marker, five apps named |
| 7 | `TableRowProps.valign?: VAlign`, optional | ✅ | |
| 8 | A module-private `RowValignContext`, mirroring `SurfaceContext`'s shape | ✅ | `createContext<VAlign \| undefined>(undefined)` |
| 9 | `TableRow` provides it **always**, even when `undefined` | ✅ | and the reason is written on the line |
| 10 | The cell's own `valign` wins over the row's | ✅ | `valign ?? rowValign`; T-11 |
| 11 | Exactly one vertical class, in exactly one of two positions | ✅ | T-6 |
| 12 | Default emitted **in place**, so existing strings are byte-identical | ✅ | T-1, T-8; mutation M-2 |
| 13 | Asked-for class emitted **after `className`** | ✅ | T-7; mutation M-5 |
| 14 | 🔴 The default stays `middle` | ✅ | T-1; mutation M-1 |
| 15 | The `TdHTMLAttributes.valign` collision declared, not hidden | ✅ | in the prop's doc comment, `qa-report.md` §3.3, `known-issues.md` B-2, the handover |
| 16 | The composition example in the file header gains a line | ✅ | +3 lines (deviation D-2) |
| 17 | **Zero barrel edits** | ✅ | all three diffs empty |
| 18 | `alignClass`, `Align`, `align`, `numeric`, `muted` untouched | ✅ | |
| 19 | `TableHead` gains nothing (OQ-4) | ✅ | T-14 asserts the fence; `technical-debt.md` TD-1 |
| 20 | `TableContainer`, `Table`, `TableHeader`, `TableBody`, `sortIndicator`, `ariaSort` untouched | ✅ | |
| 21 | `package.json` / `pnpm-lock.yaml` untouched; no new dependency | ✅ | |
| 22 | No consumer file, no consumer pin, in any repo | ✅ | |
| 23 | The new spec file exists — the package's first Table specs | ✅ | 17 specs |
| 24 | 🔴 T-1, T-2, T-15 written and run GREEN **before** the edit | ✅ | committed as `f59f2c7`, **plus T-16** (deviation D-1) |
| 25 | The 16 planned specs T-1 … T-16 | ✅ | all present |
| 26 | Mutation checks M-1 … M-4 | ✅ | run; **M-3 not caught and reported as such**, **M-5 added** (deviation D-3) |

## 2. The design decision the request asked to be made and justified

> *"consider whether TableRow should be able to set it once for all its cells … Choose and justify."*

**Chosen: yes — a row-level default with a per-cell override. Owner-approved layout A.**

| Option | Why not / why |
|---|---|
| **B — per-cell only** | The bug is a property of the **row**, not of a cell. The CRM's sales order line has **six** cells; per-cell-only makes correctness depend on a caller never missing one, and **the miss is silent** — a single un-flagged cell sags exactly the way the bug does today. That is the same failure this change exists to remove, merely relocated into every caller |
| **C — whole grid, no exceptions** | Too blunt. A buttons/actions column genuinely reads better centred, and a table-wide switch offers no way to say so without dropping back to `className` — i.e. back to the workaround |
| **A — row default + cell override** ✅ | Asks once for the row that has the problem, and keeps the escape hatch where the exception actually lives. Precedence runs the way callers expect: the more specific wins |

**Why a context rather than cloning children:** `TableRow` spreads arbitrary children and must keep
working with any composition (fragments, `.map`, conditional cells). `React.Children.map` +
`cloneElement` would break on fragments and on non-`TableCell` children, and would silently fail for
a cell rendered by a wrapper component. A context is invisible in the DOM, composes through any
depth, and costs one `useContext` per cell.

**Why the row provides always, even when `undefined`:** so a row **resets** the value for anything
nested inside it. Providing only when set keeps the React tree literally unchanged for existing
tables — but lets a `<Table>` inside a top-aligned cell inherit that row's alignment. That leak's
failure mode is *silent visual misalignment*, which is precisely the bug being fixed, so correctness
won over tree-purity. **The DOM cost is zero** (a provider emits no node), which the 384-shape
`innerHTML` diff proves directly rather than by assertion.

## 3. Deviations from the plan — all three, all immaterial

| # | Deviation | Why | Material? |
|---|---|---|---|
| D-1 | **T-16 was also written pre-edit**, not only T-1/T-2/T-15 | It is an unchanged-behaviour guard like the others, and free to include | No — strictly more proof |
| D-2 | The file header comment gained **3 lines, not 1** | One line could not carry both the row form and the cell opt-out **and** the "default does not move" warning. The warning is the load-bearing part | No |
| D-3 | **M-3 was not caught; M-5 was added** | M-3 turns out not to be a behaviour change — twMerge collapses the duplicate class. **Measured**: the 320-row matrix is byte-identical between the shipped component and the M-3 mutant. M-5 covers the genuinely-visible positional bug in that family and **is** caught (T-8) | No — and reported as a miss rather than rounded up |
| — | **`src/` numstat is +77/−13, not the planned +45/−4** | The plan's figure was a "rough size" and did not account for re-indenting the `<tr>` into the provider. `git diff -w` gives **+67/−3** — i.e. **3 real deletions**, *fewer* than the plan's predicted 4, and all itemised | No |

**The vertical block's placement** (before `TableRowProps`, rather than beside `alignClass`) was a
free choice the plan did not specify. Chosen so there is **no forward reference** from `TableRow` to
a `const` declared later in the module — a TDZ-shaped foot-gun that works only because render happens
after module evaluation. The `alignClass` twin-ness is carried by the function's shape and its
comment, which is where a reader actually needs it.

## 4. Review dimensions

| Dimension | Finding |
|---|---|
| **Correctness** | The resolution order is `cell ?? row ?? default`, asserted at all three levels (T-3, T-10, T-11) |
| **Rules of hooks** | 🔴 Checked deliberately. `valign ?? useContext(...)` would **short-circuit and call a hook conditionally**. The context is read unconditionally into `rowValign` first. This is the one place this design could have gone quietly wrong |
| **Additivity** | Two optional fields; nothing removed; no default moved; no export moved; three empty barrel diffs |
| **Naming** | `valign` matches the CSS property and the existing `align` prop. Its one residual (the deprecated DOM attribute) is declared with a named fallback |
| **Comments** | Every non-obvious line carries its reason: why two positions, why always-provide, why the default is estate-wide, why the prop shadows a DOM attribute |
| **Tests** | 17 specs; 4 of them green **before** the feature existed; 5 mutations run |
| **Accessibility** | Nothing focusable, no ARIA, no tab order, no semantics changed. `vertical-align` is presentational only. `TableHead`'s `aria-sort` and sort button are untouched (T-14) |
| **Scope** | Two files. No barrel, no config, no dependency, no consumer, no migration |

## 5. Over-build temptations declined

| Temptation | Declined because |
|---|---|
| `valign` on `TableHead` too | Header cells are single-line by construction (`whitespace-nowrap`); **no caller asked**. Widening two surfaces to answer one request is the configurability-in-anticipation this package has refused twice (CR-005 D-6, D-10). OQ-4 → TD-1 |
| `valign` on `Table` / `TableBody` (a whole-grid default) | That is layout **C**, which the owner did not pick. One more context layer, no request |
| Adding `"baseline"` to `VAlign` | `TdHTMLAttributes` allows it, but nobody asked and the plan's union is three values. Adding it later is additive |
| Exporting `VAlign` from the barrel | `Align` is not exported either (F-6). An export is a permanent contract across five pinned apps |
| Extracting a shared `oneOf`-style helper for both alignment axes | Two three-branch functions are clearer than one generic one, and it would touch `alignClass` — a function this change is fenced away from |
| Folding `align-middle` out of the base string "while we're here" | It *is* out — but only into a conditional in the same position. Moving it anywhere else breaks T-8 |
| Renaming `valign` → `verticalAlign` pre-emptively | Would cost the symmetry with `align`. Carried as the fallback **if** a live legacy usage is ever found (OQ-2) |
| "Fixing" DC's hand-rolled sales-order `<td>`s now that the option exists | **Another repo's lane.** OQ-5 — recorded for DC to take or refuse |
| Running `prettier --write` to clear `format:check` | Would rewrite **48 files** this change never opened and bury a two-file diff. Pre-existing drift, recorded (`known-issues.md` C-2) |
| Creating `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` | A **governance decision for the owner**, not something a change may invent. Sixth change to say so |
