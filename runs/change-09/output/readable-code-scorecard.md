# Readable Code Scorecard

> 🔴 **MACHINE-FILLED — the template is filled, never rewritten (MWP Rule 9).** The `Actual` and
> `Status` cells of the machine-decided rows were produced by `organization/scripts/quality-sensors.mjs`
> and must not be edited by hand; a disagreement with a count is a bug in the sensor, and it gets
> fixed there. The rows marked **JUDGMENT** are NOT decided and are the session's to answer — with
> the finding, not with a fresh criterion of its own. Overall status is **INCOMPLETE**, and it stays INCOMPLETE until every judgment row carries a verdict.
>
> ✅ **The five judgment rows are answered below (§"The five judgment rows, answered") and the status
> is now PASS.** No machine-filled cell was edited. Sensor run: **7 of 7 requested files scanned, 0
> open findings, 4 justified, 0 weak.** ⚠ `CE-01/05` and `CE-08`/`RC-09` are **not scanned for this
> project** (no `componentGlobs` / `wiringGlobs` configured) — an estate-tooling gap recorded in
> `known-issues.md`, unchanged by this change.
>
> ⚠ The seven changed files were normalised to **LF** before the sensor ran: `quality-sensors.mjs`
> silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout (`.` does not match `\r`, so `(.*)$`
> never anchors — CR-DESIGN-SYSTEM-009 handover point 9). Git stores LF either way, so the commit is
> unaffected. Without it this scorecard returns BLOCKED with four correct justifications sitting in
> the source.

`
Project:        D:\Projects\Team Builder\organization\scripts\change-runner\state\worktrees\CR-DESIGN-SYSTEM-010
Epic:           CR-DESIGN-SYSTEM-010
Milestone:      CR-DESIGN-SYSTEM-010
Date:           2026-09-10
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
| 3 | Names communicate purpose | Single-letter identifiers (except loop counters i/j/k/x/y) OR misleading names | All identifiers in changed code | 0 | 0 | PASS (judgment) |
| 4 | Function size | Functions exceeding 50 lines without documented justification | Changed code | 0 | 0 | PASS |
| 5 | File size | Files exceeding 300 lines without documented justification | Changed files | 0 | 0 | PASS |
| 6 | No dead code | Unused imports, unreachable code, or unused variables flagged by static analysis | ESLint unused-vars / ts-prune / equivalent | 0 | 0 | PASS (judgment) |
| 7 | No commented-out code | Blocks of commented-out code (excluding inline comments that explain non-obvious logic) | Changed code | 0 | 0 | PASS |
| 8 | No magic numbers | Hardcoded numeric or string literals carrying business meaning without a named constant (loop bounds and array indices excluded) | Changed code | 0 | 0 | PASS (judgment) |
| 9 | Wiring-point discipline | Outside-world clients (DB pools/clients, auth/storage/admin clients, mailers, messaging or external API clients) constructed outside a designated wiring module — i.e. inside route handlers, components, or business-logic modules (QUALITY-DI-001; wiring points declared in TECHNICAL_ARCHITECTURE.md §10.1) | Changed code files | 0 | 0 | PASS |
| 10 | One seam per vendor | Vendor SDK/API imports (type-only imports excluded) in changed code outside the service's single seam module (QUALITY-DI-002; seam modules declared in TECHNICAL_ARCHITECTURE.md §13) | Changed code files | 0 (N/A if no external-service code touched) | N/A | PASS (judgment) |
| 11 | Injected clock at time boundaries | Time-boundary business rules (cutoffs, expiry, effective-dating, grace windows) reading the ambient clock internally instead of taking time as a parameter, or lacking a fixed-date test (QUALITY-DI-003) | Changed business-rule code + its tests | 0 (N/A if no time-boundary logic touched) | N/A | PASS (judgment) |

---

## Result

| | |
|---|---|
| Dimensions passing | **11 of 11** — 6 machine-decided, 5 answered below |
| Dimensions blocked | 0 |
| **Status** | **PASS** |

PASS requires every dimension to meet its pass threshold. BLOCKED if any dimension fails.

---

## The five judgment rows, answered

Scope: the 7 files in `changed-files.md` — 4 source, 3 spec.

**#3 — Names communicate purpose · 0.** Everything introduced is named after what it answers:
`multiSelectChosenLabels`, `multiSelectToggle`, `MultiSelectOption`, `isColumnWidth`, `step` /
`htmlWidth`, `onShowEverything`. The one deliberate RENAME is the last of those, and it is the fix
rather than a tidy-up: `onToggle: (all: boolean) => void` named a gesture that has two outcomes when
it has one, and both call sites read the boolean the wrong way round — F2 is what a misleading name
costs. Short identifiers are all bound loop/callback parameters in the existing idiom (`o`, `opt`,
`v`, `e`), unchanged from the code they sit in. No single-letter identifier carries meaning.

**#6 — No dead code · 0.** `tsc --noEmit` is clean under `noUnusedLocals`-equivalent strictness for
this repo's config, and the one function this change DELETED (`chosenLabelsInOptionOrder`) was
removed rather than left orphaned — its body moved to `MultiSelectMenu` with a second caller.
⚠ There is **no ESLint config and no `lint` script in this repository** (pre-existing, CR-009
handover point 14); this row is answered from `tsc` plus a read of the diff, and that limit is stated
rather than papered over. No unreachable branch was introduced: every new branch has a spec.

**#8 — No magic numbers · 0.** No numeric literal was added to source. The strings added are UI
wording (`All ${total}`, `${chosen} of ${total}`) and the four `TableColumnWidth` step names inside
`isColumnWidth` — which are the enumeration itself, checked against the exported union, not a
constant awaiting extraction. `120` / `"50%"` appear only in specs, as the caller's own input.

**#10 — One seam per vendor · N/A.** No external service is touched. This package has no network,
no SDK and no vendor client by construction (TECH-COMP-003 / ADR-001); the only third-party imports
in the changed files are Radix and lucide-react, which are the UI primitives themselves.

**#11 — Injected clock · N/A.** No time-boundary rule is touched. Nothing in the changed files reads
a clock; `DateRangeCell` compares two strings a caller supplies and is unchanged by this change.

---

## Blocking Items

None.

---

## Risk Acceptances

The project owner may accept specific failing items in writing. Each acceptance must reference the failing dimension, the specific items being accepted, the rationale, the owner name, and the date. A risk-accepted item does not count as a failure for the Status above.

If none: "None."