# Developer handover — CR-DESIGN-SYSTEM-024

**Next agent:** the Change Runner's CI/merge step, then CR-MANGAVERDE-095's build session.
**Next action:** after the PR merges, report the MERGED `main` sha. CR-MANGAVERDE-095 pins that sha (never the branch sha), uses the keys `previous`, `next`, `rowsPerPage`, `listPaging`, `listPagingEnd`, `range` (not the `showing`/`of`/`navLabel` names in its plan), and builds its `range` from `position`, not `from`/`to` (D-8).

**Current state:** `TablePagination` accepts optional `labels`; kit 0.8.0; 692 tests / 36 files green; typecheck clean; Edge proof 22/22. No consumer pin moved.

**Rules to keep (do not "tidy"):**
- Per-key `??` fallback, never a spread (`{ previous: undefined }` must not blank a button).
- The two arrow labels are ONE template-literal text node each (React server markup would change otherwise). The frozen-copy spec in `tests/components/TablePagination.labels.test.tsx` guards it.
- `DEFAULT_TABLE_PAGINATION_LABELS` stays frozen.
- `tests/fixtures/TablePagination.at-6a25c8d.tsx` is a frozen copy; never edit it.

Detail: `runs/change-22/output/known-issues.md`, `runs/change-22/output/implementation-summary.md`.
