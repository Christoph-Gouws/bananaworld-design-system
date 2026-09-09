# Readable Code Scorecard

> 🔴 **MACHINE-FILLED — the template is filled, never rewritten (MWP Rule 9).** The `Actual` and
> `Status` cells of the machine-decided rows were produced by `organization/scripts/quality-sensors.mjs`
> and must not be edited by hand; a disagreement with a count is a bug in the sensor, and it gets
> fixed there. The rows marked **JUDGMENT** are NOT decided and are the session's to answer — with
> the finding, not with a fresh criterion of its own. Overall status is **INCOMPLETE**, and it stays INCOMPLETE until every judgment row carries a verdict.

`
Project:        D:\Projects\Team Builder\organization\scripts\change-runner\state\worktrees\CR-DESIGN-SYSTEM-009
Epic:           CR-DESIGN-SYSTEM-009
Milestone:      CR-DESIGN-SYSTEM-009
Date:           2026-09-09
Scored by:      quality-sensors.mjs (machine rows) + Code Reviewer and Refactor Agent (judgment rows)
Triggered by:   Stage 05 revision and simplification
`

Scoring is mechanical. Each check produces a count or yes/no, compared against a fixed threshold. Subjective verdicts ("pass with notes", percentages) are not permitted.

---

## Mechanical Checks

| # | Dimension | What to count | Where to look | Pass | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | No deep nesting | Functions with control-flow nesting deeper than 3 levels (use guard clauses, early returns, or extract) | Changed code files | 0 | 0 | PASS |
| 2 | No non-trivial duplication | Business rules, validation, permission checks, error handling, or calculations duplicated across ≥2 files | Changed code files | 0 | 0 | PASS |
| 3 | Names communicate purpose | Single-letter identifiers (except loop counters i/j/k/x/y) OR misleading names | All identifiers in changed code | 0 | **0** | **PASS** |
| 4 | Function size | Functions exceeding 50 lines without documented justification | Changed code | 0 | 0 | PASS |
| 5 | File size | Files exceeding 300 lines without documented justification | Changed files | 0 | 0 | PASS |
| 6 | No dead code | Unused imports, unreachable code, or unused variables flagged by static analysis | ESLint unused-vars / ts-prune / equivalent | 0 | **0** | **PASS** |
| 7 | No commented-out code | Blocks of commented-out code (excluding inline comments that explain non-obvious logic) | Changed code | 0 | 0 | PASS |
| 8 | No magic numbers | Hardcoded numeric or string literals carrying business meaning without a named constant (loop bounds and array indices excluded) | Changed code | 0 | **0** | **PASS** |
| 9 | Wiring-point discipline | Outside-world clients (DB pools/clients, auth/storage/admin clients, mailers, messaging or external API clients) constructed outside a designated wiring module — i.e. inside route handlers, components, or business-logic modules (QUALITY-DI-001; wiring points declared in TECHNICAL_ARCHITECTURE.md §10.1) | Changed code files | 0 | 0 | PASS |
| 10 | One seam per vendor | Vendor SDK/API imports (type-only imports excluded) in changed code outside the service's single seam module (QUALITY-DI-002; seam modules declared in TECHNICAL_ARCHITECTURE.md §13) | Changed code files | 0 (N/A if no external-service code touched) | **0** | **PASS (N/A)** |
| 11 | Injected clock at time boundaries | Time-boundary business rules (cutoffs, expiry, effective-dating, grace windows) reading the ambient clock internally instead of taking time as a parameter, or lacking a fixed-date test (QUALITY-DI-003) | Changed business-rule code + its tests | 0 (N/A if no time-boundary logic touched) | **0** | **PASS (N/A)** |

---

## Result

| | |
|---|---|
| Dimensions passing | **11 of 11** — 6 machine-decided, 5 answered below |
| Dimensions blocked | 0 |
| **Status** | **PASS** |

PASS requires every dimension to meet its pass threshold. BLOCKED if any dimension fails.

---

## The five JUDGMENT rows, answered

Answered against the finding, not against a criterion of this session's own.

| # | Dimension | Answer |
|---|---|---|
| 3 | Names communicate purpose | **0.** New identifiers are `gridFilterSelected` / `gridFilterSelect`, `MultiSelectAllRow` / `MultiSelectItem` / `multiSelectTriggerLabel`, `TableDensity` / `TableWrap` / `TableColumnWidth`, `useTableDensity` / `useTableWrap` / `useColumnWidthClass` / `useCellLayout`, `MultiSelectCell` / `FilterHeadCell`, and the class records `HEAD_PAD` / `CELL_PAD` / `HEAD_WRAP` / `CELL_WRAP` / `COLUMN_WIDTH` / `TABLE_TYPE` / `CELL_BASE` / `CELL_CHROME` / `TH_PAD` / `GRIP_SIZE` / `MENU_BUTTON_SIZE` / `MENU_ICON_SIZE` / `ITEM_SIZE` / `ITEM_ICON`. Every one names what it holds. Single letters appear only as `o`/`v`/`s`/`e` inside one-line lambdas over an obvious collection, which the dimension excludes. ⚠ The one name worth defending is `values` beside `value` on the `select` arm — near-identical by design, because they are two views of ONE state, and the doc comment plus the two-function constructor/reader pair is what keeps them from being confused. |
| 6 | No dead code | **0.** `pnpm typecheck` is clean under `strict` + `noUnusedLocals` semantics for imports, and the deletion of the local `MultiSelectItem` from `DataTableToolbar.tsx` was followed by dropping `Check` from its lucide import — verified, not assumed. No unreachable branch was added: every new branch (`multiple`, `selectAll`, each `wrap` value, each width step) is exercised by a spec, and the mutation battery proves the specs reach them. ⚠ No eslint/ts-prune exists in this repo (pre-existing drift, recorded four changes running), so this is a compiler + coverage answer rather than a linter one, and it is labelled as such. |
| 8 | No magic numbers | **0.** The only literals added are CSS class strings, and every one is either a stock Tailwind utility or a named entry in a `Record` keyed by the option it serves — which is the named-constant form for this domain. The four width steps are the clearest case: `6rem` / `11rem` / `20rem` are reachable only as `narrow` / `medium` / `wide`, never as a number a caller may type. **This is the dimension the plan's own §C.4 was written to satisfy** — a per-column pixel field was rejected precisely because it would have let 27 magic numbers be invented column by column. |
| 10 | One seam per vendor | **0 — N/A, recorded.** This package makes no network call and imports no vendor SDK (TECH-COMP-003 / ADR-001). The only third-party imports are `@radix-ui/*`, `lucide-react`, `clsx` and `tailwind-merge`, which are UI primitives, not external services. Nothing in this change adds an import of any kind. |
| 11 | Injected clock at time boundaries | **0 — N/A, recorded.** No time-boundary rule is touched. The change reads no clock: `Date`, `Date.now` and `setTimeout` appear nowhere in it, and the one pre-existing timer (`TypedCell`'s debounce) is untouched. The `dateRange` filter carries two strings and compares nothing. |

---

## Risk Acceptances

The project owner may accept specific failing items in writing. Each acceptance must reference the failing dimension, the specific items being accepted, the rationale, the owner name, and the date. A risk-accepted item does not count as a failure for the Status above.

**None.** No dimension fails, so none is asked for.

---

## ⚠ A sensor bug found while filling this scorecard — reported, not worked around silently

`scanJustifications` splits the comment text on `\n` and matches `…(.*)$`. In JavaScript `.` does not
match `\r` (it is a line terminator), so on a **CRLF working tree — i.e. every Windows checkout of this
repo — the `$` can never match and EVERY `QUALITY-JUSTIFY` record is silently ignored.** This scorecard
first came back `BLOCKED (5 open, 0 justified)` with five correctly-formed, correctly-positioned
justifications sitting in the source.

Confirmed by isolating it against the sensor's own exported function:

```
LF   -> [{"rule":"RC-05", … ,"words":9}]
CRLF -> []
```

Resolved here by normalising the changed files to LF, which is what git already stores in the index —
so the commit is byte-identical either way and nothing was gamed. **The sensor itself still has the
bug** and it belongs to the estate, not to this change: `quality-sensors.mjs:285` should match
`(.*?)\s*$` with the `\r` stripped, or split on `/\r?\n/`. Carried in `known-issues.md` §D as an
estate-tooling item, because the next Windows session will hit it on its first justification and will
have no reason to suspect the tool.
