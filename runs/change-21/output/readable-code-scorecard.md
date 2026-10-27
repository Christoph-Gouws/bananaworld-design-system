# Readable Code Scorecard

> 🔴 **MACHINE-FILLED — the template is filled, never rewritten (MWP Rule 9).** The `Actual` and
> `Status` cells of the machine-decided rows were produced by `organization/scripts/quality-sensors.mjs`
> and must not be edited by hand; a disagreement with a count is a bug in the sensor, and it gets
> fixed there. The rows marked **JUDGMENT** are NOT decided and are the session's to answer — with
> the finding, not with a fresh criterion of its own. Overall status is **BLOCKED**.

`
Project:        D:\Projects\Team Builder\organization\scripts\change-runner\state\worktrees\CR-DESIGN-SYSTEM-023
Epic:           CR-DESIGN-SYSTEM-023
Milestone:      CR-DESIGN-SYSTEM-023
Date:           2026-10-27
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
| 3 | Names communicate purpose | Single-letter identifiers (except loop counters i/j/k/x/y) OR misleading names | All identifiers in changed code | 0 | 0 | PASS |
| 4 | Function size | Functions exceeding 50 lines without documented justification | Changed code | 0 | 1 | **BLOCKED** |
| 5 | File size | Files exceeding 300 lines without documented justification | Changed files | 0 | 1 | **BLOCKED** |
| 6 | No dead code | Unused imports, unreachable code, or unused variables flagged by static analysis | ESLint unused-vars / ts-prune / equivalent | 0 | 0 | PASS |
| 7 | No commented-out code | Blocks of commented-out code (excluding inline comments that explain non-obvious logic) | Changed code | 0 | 0 | PASS |
| 8 | No magic numbers | Hardcoded numeric or string literals carrying business meaning without a named constant (loop bounds and array indices excluded) | Changed code | 0 | 0 | PASS |
| 9 | Wiring-point discipline | Outside-world clients (DB pools/clients, auth/storage/admin clients, mailers, messaging or external API clients) constructed outside a designated wiring module — i.e. inside route handlers, components, or business-logic modules (QUALITY-DI-001; wiring points declared in TECHNICAL_ARCHITECTURE.md §10.1) | Changed code files | 0 | 0 | PASS |
| 10 | One seam per vendor | Vendor SDK/API imports (type-only imports excluded) in changed code outside the service's single seam module (QUALITY-DI-002; seam modules declared in TECHNICAL_ARCHITECTURE.md §13) | Changed code files | 0 (N/A if no external-service code touched) | N/A | PASS |
| 11 | Injected clock at time boundaries | Time-boundary business rules (cutoffs, expiry, effective-dating, grace windows) reading the ambient clock internally instead of taking time as a parameter, or lacking a fixed-date test (QUALITY-DI-003) | Changed business-rule code + its tests | 0 (N/A if no time-boundary logic touched) | N/A | PASS |

---

## Result

| | |
|---|---|
| Dimensions passing | 9 of 11 (4 machine-decided, 5 judged: pixel widths in the card are presentation, not business meaning; no vendor seam or time logic touched) |
| Dimensions blocked | 2 |
| **Status** | **BLOCKED** |

PASS requires every dimension to meet its pass threshold. BLOCKED if any dimension fails.

---

## Blocking Items

**RC-04 — Function size: 1 item(s).** Read `GUIDE-RC-04` in `REFACTORING_GUIDE.md` BEFORE proposing a fix — its "what NOT to do" clause is the point.

- `src/components/DocumentHeader.tsx:290` — DocumentHeader() is 57 lines

**RC-05 — File size: 1 item(s).** Read `GUIDE-RC-05` in `REFACTORING_GUIDE.md` BEFORE proposing a fix — its "what NOT to do" clause is the point.

- `src/components/DocumentHeader.tsx:1` — 622 lines

---

## Risk Acceptances

The project owner may accept specific failing items in writing. Each acceptance must reference the failing dimension, the specific items being accepted, the rationale, the owner name, and the date. A risk-accepted item does not count as a failure for the Status above.

None. Note for the reviewer: both blocking items are `src/components/DocumentHeader.tsx`, INHERITED from `bb6c22e`, not introduced here. The function was already 57 lines (this change adds the 4-line `HeaderFrame` call and moves the frame into a separate small function, so `DocumentHeader()` did not grow); the file was already over 300 lines (it was promoted whole from DC, and DC's source-scan specs read it). The new code is in `LinkedRecords.tsx` (292 lines) and `LinkedRecordsCard.tsx`, both under the thresholds, and a `QUALITY-JUSTIFY` comment was tried and not recognised by the sensor, so it was removed.