# Changed files — CR-DESIGN-SYSTEM-007

> 🔴 Stage 05 reviews **only** the files listed here, so this list is complete rather than
> representative. Every file this change touched is below, including the paper trail.

## 1. Source and tests — the whole of the code change

| # | File | Diff | What changed |
|---|---|---|---|
| 1 | `src/components/Table.tsx` | **+31 / −13** | The `askedForValign` predicate becomes `cellAskedForValign`, computed from the **cell's own** `valign` instead of the row-resolved value; both emission positions re-keyed on it; the precedence rule written into the file header and both `valign` doc-comments |
| 2 | `tests/components/Table.test.tsx` | **+155 / −0** | A new **§8** with six specs, **T-17 … T-22**. **Appended. No existing spec edited, reordered or deleted** |

**Totals: 2 files, +186 / −13.** `git diff -w` is identical to `git diff` — there is no
whitespace-only churn and every changed line is a real change.

### 1.1 The real logic delta, isolated

Three lines of behaviour, out of 31 insertions. The other 28 are comments and doc-comments.

```diff
-  const resolvedValign = valign ?? rowValign;
-  const vertical = valignClass(resolvedValign);
-  const askedForValign = resolvedValign !== undefined;
+  const vertical = valignClass(valign ?? rowValign);
+  const cellAskedForValign = valign !== undefined;
```
plus the two emission slots renamed from `askedForValign` to `cellAskedForValign` (positions
unchanged).

## 2. Files deliberately NOT changed — asserted, not assumed

| File / group | Verified how | Result |
|---|---|---|
| `src/index.ts`, `src/components/index.ts`, `src/lib/index.ts` (all three barrels) | `git diff --cached --stat` on the three paths | **empty output — byte-identical** |
| `package.json`, `pnpm-lock.yaml` | not in the diff | untouched; **no dependency added, removed or bumped** |
| Every other component in `src/` | not in the diff | untouched |
| The other 13 test files | not in the diff | untouched; all still green (269 total) |
| Any consumer repo file, any consumer pin | DC worktree opened **read-only**; no `Write`/`Edit` ever targeted a DC path | **zero writes** |
| `runs/change-06/**` (a closed unit) | **cited, never edited** | untouched |
| `runs/epic-*/`, `milestone-NN/`, `runs/current/epic-plan/` | never created, never written | **do not exist for this change** |

## 3. Paper trail written by this change

| File | Status |
|---|---|
| `runs/change-07/output/` — `implementation-summary.md`, `changed-files.md`, `test-results.md`, `qa-report.md`, `defect-log.md`, `deployed-verification.md`, `revision-review.md`, `simplification-opportunities.md`, `accepted-refactors.md`, `readable-code-scorecard.md`, `centrality-scorecard.md`, `known-issues.md` | new |
| `runs/change-07/evidence/` — `milestone-evidence.md`, `global-milestone-scorecard.md`, `user-verification-steps.md`, `developer-handover.md` | new |
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | **edited** — a CHANGE/DECISION entry for CR-DESIGN-SYSTEM-007 prepended (newest first) |
| `runs/current/SESSION_HANDOVER.md` | **edited** — reconciled to this change |
| `runs/current/active-milestone.md` | **edited** — reconciled to this change |
| `organization/CONTEXT_USAGE_LOG.md` (estate file, outside this repo) | one row appended via `log-context-usage.mjs` |

**No `technical-debt.md`.** This change knowingly leaves none — see `known-issues.md` §3.

## 4. Throwaway harnesses — created, used, and deleted before commit

Named here because they produced numbers quoted in the evidence, and an undeleted throwaway would
otherwise be an unexplained file. **None was ever staged; all are gone from the working tree.**

| Throwaway | Purpose | Deleted |
|---|---|---|
| `mut.mjs` | applied the 5 mutations to `Table.tsx`, one at a time | ✅ |
| `tests/components/ByteIdentity.throwaway.test.tsx` | dumped whole `innerHTML` for 1,536 caller shapes | ✅ |
| `tests/components/RowGroup.throwaway.test.tsx` | dumped the `<td>` class for 576 row-`valign` shapes | ✅ |
| `classify.mjs` | classified every group-3 difference as order-only vs rendering | ✅ |
| `audit-probe.mjs` | reproduced `pnpm audit --prod --audit-level=high` in Node | ✅ |
| `bi-main.txt`, `bi-new.txt`, `rg-main.txt`, `rg-new.txt` | the four dumps that were diffed | ✅ |

Verified by `git status --short` after deletion: the only tracked modifications are the two files in
§1.
