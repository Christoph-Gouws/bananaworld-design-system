# Developer handover — CR-DESIGN-SYSTEM-020

**Next agent:** the conductor (poll CI, merge on green, report the merged sha), then CR-MANGAVERDE-069.
**Next action:** Manga Verde moves its pin from `1fefb6c6` to the MERGED `main` sha (never the branch sha) and passes `href`/`fileName`. DC's pin is not moved.
**Current state:** kit 0.5.0. `src/components/ExportButton.tsx` is a dispatcher over three private variants; tests `tests/components/ExportButton.test.tsx` (23). Suite 554/28 green, typecheck clean, Edge 16/16. Artifacts: `runs/change-18/output/test-results.md`, `revision-review.md`.

Rules for the next kit session:
1. The no-`href` path must stay byte-identical to `tests/components/fixtures/ExportButton.frozen-1fefb6c.tsx` (DC depends on it). Do not add classes to it.
2. Never call `useToast` on the link path; never add a network call (TECH-COMP-003).
3. Residuals R1–R4 in `known-issues.md`; standing carries in `runs/current/SESSION_HANDOVER.md`.
