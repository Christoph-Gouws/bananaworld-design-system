# Centrality Scorecard

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
Triggered by:   Stage 05 revision / Architecture review / Centrality audit
`

Scoring is mechanical. Each check produces a count or yes/no, compared against a fixed threshold. Subjective verdicts ("pass with notes", percentages) are not permitted.

---

## Mechanical Checks

| # | Dimension | What to count | Where to look | Pass | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | Design tokens and UI theme | Hardcoded hex colours, pixel sizes, or font families in component files (outside the central theme/tokens file) | Component source files | 0 | 0 | PASS |
| 2 | Role and permission rules | Inline / ad-hoc permission checks instead of calls to the central permission module | Authorisation code | 0 | **0** | **PASS (N/A)** |
| 3 | Validation schemas | Scattered inline validators instead of the central schema (Zod / Joi / equivalent) | Form handlers and endpoint validators | 0 | **0** | **PASS (N/A)** |
| 4 | Business calculations | Duplicated calculation logic (tax / discount / status-transition) instead of a central utility | All code files | 0 | **0** | **PASS** |
| 5 | API clients | Direct fetch / axios / HTTP-library calls instead of the central API client module | Component and service code | 0 | 0 | PASS |
| 6 | Error handling | One-off error-handling patterns instead of the central error handler | All code files | 0 | 0 | PASS |
| 7 | Constants and enumerations | Raw string or numeric identifiers used in business logic (e.g. status = "pending") instead of named constants / enums | All code files | 0 | **0** | **PASS** |
| 8 | Environment and configuration | Direct process.env / window.location.href / config access instead of the central config module | All code files | 0 | 0 | PASS |

---

## Result

| | |
|---|---|
| Dimensions passing | **8 of 8** — 4 machine-decided, 4 answered below |
| Dimensions blocked | 0 |
| **Status** | **PASS** |

PASS requires every dimension to meet its pass threshold. BLOCKED if any dimension fails.

---

## The four JUDGMENT rows, answered

🔴 **The frame for all four: this package is pure presentation and has no centre to drift from.** It
makes no network call, reads no record, and holds no business rule (TECH-COMP-003 / ADR-001). Three
app-coupled components — `PermissionGate`, `SyncStatusIndicator`, `SyncStatusDetail` — are
deliberately NOT here for exactly that reason. So three of these four are N/A, and saying so with the
reason is the answer; an unrecorded N/A would be a skip.

| # | Dimension | Answer |
|---|---|---|
| 2 | Role and permission rules | **0 — N/A, recorded.** There is no authorisation code in this package to centralise or scatter. This change adds no check, no role, no capability and no gate; a filter cell does not know who is looking at it. |
| 3 | Validation schemas | **0 — N/A, recorded.** No form handler and no endpoint validator exists here. The nearest thing this change adds is `gridFilterSelect`, which normalises its input (drops blanks and repeats) rather than validating it — a constructor enforcing an invariant by construction, not a validator, and it is the *single* place that invariant is enforced, which is the centralisation this dimension asks for. |
| 4 | Business calculations | **0.** No tax, discount or status transition. The one arithmetic in scope is the tick-list's trigger count, and this change's central act was to make it **one** implementation rather than two: `multiSelectTriggerLabel` was MOVED into `MultiSelectMenu.tsx` and is now the only place either surface computes "the first chosen label, plus how many more". The CR named the alternative as the defect — *"two multi-select menus in one product that look or count differently"* — and the extraction is what makes it unreachable. Likewise the arity of a `select` value has exactly one reader and one writer. |
| 7 | Constants and enumerations | **0.** Every new identifier a caller can pass is a named union — `TableDensity`, `TableWrap`, `TableColumnWidth`, `selectAll` — and every one is resolved through a `Record` keyed by that union, so a raw string cannot reach a class name. The four width steps are the case worth naming: `6rem` / `11rem` / `20rem` are reachable only as `narrow` / `medium` / `wide`. The one raw string in the change is `"Select all"`, which is display copy rather than a business identifier — and it sits beside the shipped `"None chosen"` / `"N chosen"` wording it was deliberately kept consistent with. |

---

## Risk Acceptances

The project owner may accept specific failing items in writing. Each acceptance must reference the failing dimension, the specific items being accepted, the rationale, the owner name, and the date. A risk-accepted item does not count as a failure for the Status above.

**None.** No dimension fails, so none is asked for.

---

⚠ **Two dimension groups were NOT scanned and are not claimed as passing by machine:** `CE-01`/`CE-05`
(no `componentGlobs` in the sensor config) and `CE-08`/`RC-09` (no `wiringGlobs`). Their rows read
PASS above because the sensor emitted no finding, and that is a *silence*, not a measurement.
Answering them anyway: this change introduces **no** hardcoded hex colour, pixel size or font family
(every class is a stock Tailwind utility or an existing token), **no** API client, and **no**
`process.env` / `window.location` access — verifiable by reading the diff, which contains no such
literal. Recorded rather than left as an unremarked gap.