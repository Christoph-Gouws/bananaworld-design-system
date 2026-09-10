# Centrality Scorecard

> 🔴 **MACHINE-FILLED — the template is filled, never rewritten (MWP Rule 9).** The `Actual` and
> `Status` cells of the machine-decided rows were produced by `organization/scripts/quality-sensors.mjs`
> and must not be edited by hand; a disagreement with a count is a bug in the sensor, and it gets
> fixed there. The rows marked **JUDGMENT** are NOT decided and are the session's to answer — with
> the finding, not with a fresh criterion of its own. Overall status is **INCOMPLETE**, and it stays INCOMPLETE until every judgment row carries a verdict.
>
> ✅ **The four judgment rows are answered below and the status is now PASS.** No machine-filled cell
> was edited. ⚠ `CE-01` and `CE-05` show PASS from a scan that is **not configured for this project**
> (no `componentGlobs`) — recorded in `known-issues.md` as an estate-tooling gap, not a claim.

`
Project:        D:\Projects\Team Builder\organization\scripts\change-runner\state\worktrees\CR-DESIGN-SYSTEM-010
Epic:           CR-DESIGN-SYSTEM-010
Milestone:      CR-DESIGN-SYSTEM-010
Date:           2026-09-10
Scored by:      quality-sensors.mjs (machine rows) + Code Reviewer and Refactor Agent (judgment rows)
Triggered by:   Stage 05 revision / Architecture review / Centrality audit
`

Scoring is mechanical. Each check produces a count or yes/no, compared against a fixed threshold. Subjective verdicts ("pass with notes", percentages) are not permitted.

---

## Mechanical Checks

| # | Dimension | What to count | Where to look | Pass | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | Design tokens and UI theme | Hardcoded hex colours, pixel sizes, or font families in component files (outside the central theme/tokens file) | Component source files | 0 | 0 | PASS |
| 2 | Role and permission rules | Inline / ad-hoc permission checks instead of calls to the central permission module | Authorisation code | 0 | N/A | PASS (judgment) |
| 3 | Validation schemas | Scattered inline validators instead of the central schema (Zod / Joi / equivalent) | Form handlers and endpoint validators | 0 | N/A | PASS (judgment) |
| 4 | Business calculations | Duplicated calculation logic (tax / discount / status-transition) instead of a central utility | All code files | 0 | 0 | PASS (judgment) |
| 5 | API clients | Direct fetch / axios / HTTP-library calls instead of the central API client module | Component and service code | 0 | 0 | PASS |
| 6 | Error handling | One-off error-handling patterns instead of the central error handler | All code files | 0 | 0 | PASS |
| 7 | Constants and enumerations | Raw string or numeric identifiers used in business logic (e.g. status = "pending") instead of named constants / enums | All code files | 0 | 0 | PASS (judgment) |
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

## The four judgment rows, answered

**#2 — Role and permission rules · N/A.** There is no authorisation code in this package and there
cannot be: it is pure presentation (TECH-COMP-003 / ADR-001) — no roles, no `warehouse_id`, no
`legal_entity`, no scope. Rows arrive already scoped by the consuming app.

**#3 — Validation schemas · N/A.** No form handler and no endpoint validator is touched. The controls
emit a value shape the caller validates; nothing here parses external input.

**#4 — Business calculations · 0 — and this row is the point of the change.** The finding this change
answers (F1) IS duplicated logic: CR-DESIGN-SYSTEM-009 centralised the tick-list's *presentation* and
left its *value arithmetic* copied at each call site, and the two copies then disagreed about which
stored ids count as chosen. This change moves that arithmetic into `MultiSelectMenu`
(`multiSelectChosenLabels`, `multiSelectToggle`) and both surfaces call it — the count is now
`values.length` in both, by construction rather than by convention. The engine's own arithmetic
(`table-controls.ts` `matchesFilter` / `deriveSelectOptions`) was deliberately NOT duplicated or
altered; see `revision-review.md` §"What was deliberately not changed".

**#7 — Constants and enumerations · 0.** The two identifier unions this change touches are already
exported types (`TableColumnWidth`, `MultiSelectItemSize`) and `isColumnWidth` checks against the
union's own members. No raw status string was introduced, and the four width step names are compared
in exactly one place.

---

## Blocking Items

None.

---

## Risk Acceptances

The project owner may accept specific failing items in writing. Each acceptance must reference the failing dimension, the specific items being accepted, the rationale, the owner name, and the date. A risk-accepted item does not count as a failure for the Status above.

If none: "None."