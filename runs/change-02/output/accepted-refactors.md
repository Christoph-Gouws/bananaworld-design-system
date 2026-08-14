# Accepted refactors (Stage 05) — CR-DESIGN-SYSTEM-002

**0 accepted.** All 5 candidates in `simplification-opportunities.md` were rejected, each with its
reason recorded.

## Why zero, and why that is the right answer here rather than a thin pass

This change is a **byte-identical port**. Its correctness criterion is a measurement: 282 of 282 code
lines identical to what DC ships on thirteen live render sites, with exactly two intended differences
(the import specifiers). **A refactor accepted here is, by construction, a line that no longer
matches** — it would trade the one guarantee this change exists to provide for a cosmetic gain.

The bar was applied, not waived. Five candidates were examined properly, including one (S-5, the
vitest glob) where the trade is genuinely two-sided and the losing side is recorded as a watch item
rather than buried. Two of the five (S-2, S-4) were argued and rejected by DC's own authors at the
time, and their fences travel with the code — the review confirmed the reasoning still holds rather
than deferring to it.

## The refactors that DID happen, and why they are not listed here

Four fixes were applied during the build. They are **defects**, not refactors, and they are logged in
`defect-log.md`: D-1 (the describer was unreachable from the package root), D-2 (four comments that
would have been false statements in the new home), D-3 (a spec asserting the wrong DOM property),
D-4 (a source-scan spec that could not resolve its file).

Each was fixed and the suite re-run green afterwards: **115 passed / 9 files**, `pnpm typecheck`
clean.

## Deferred to their proper owners

| Item | Owner | Recorded |
|---|---|---|
| Re-point `SHARED_HEADER` and invert the line-889 spec | Bananaworld-DC's adoption change | `evidence/developer-handover.md` §3 |
| Delete DC's local copy of the component once its pin is bumped | Bananaworld-DC's adoption change | same |
| `pnpm format:check` repo-wide drift (44 files) | Out of lane; CI does not gate on it | `known-issues.md` C-1 |
| `ci.yml`'s stale test-job label | Out of lane; a label, not behaviour | `known-issues.md` C-3 |
| The eight transitional pieces retire as their own change | Owner / DC lane — already done by CR-DC-046 | `implementation-summary.md` §4 |
