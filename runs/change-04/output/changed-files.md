# Changed files — CR-DESIGN-SYSTEM-004

> Every file this change touched. **Stage 05 reviews exactly this list**, so an omission here
> silently shrinks its own review. Complete as of the final green run.

## 1. Source — `src/`

| # | File | Action | Lines |
|---|---|---|---|
| 1 | `src/components/TablePagination.tsx` | **added** | +176 |
| 2 | `src/lib/table-paging.ts` | **added** | +83 |
| 3 | `src/components/index.ts` | modified | **+8 / −0** |
| 4 | `src/lib/index.ts` | modified | **+9 / −0** |
| 5 | `src/index.ts` | modified | **+7 / −0** |

### 1.1 🔴 Deletions and modifications to existing lines: **zero**

```
$ git diff --numstat -- src/
8       0       src/components/index.ts
7       0       src/index.ts
9       0       src/lib/index.ts
```

Three files, **24 insertions, 0 deletions, 0 modified lines**. Nothing renamed, nothing moved,
nothing reordered, no default changed, no export removed. This is the strongest additive proof this
package has produced — CR-003 had 26 deletions to itemise; this change has none, because it calls no
existing function and widens no existing type.

The two new files are new: nothing imported them before, so nothing can have changed because of them.

### 1.2 What each barrel gained, exactly

| File | Names added |
|---|---|
| `src/components/index.ts` | `TablePagination`, `type TablePaginationProps`, `type TablePaginationPlacement` |
| `src/lib/index.ts` | `TABLE_PAGE_SIZES`, `tablePageRange`, `type TablePageState`, `type TablePageRange` |
| `src/index.ts` | the same four lib names, enumerated (this barrel enumerates `./lib`; it does not star it, so an unnamed export is unreachable from the package root) |

Collision check against every name the barrels export today: **none begins `TablePage`, `TABLE_` or
`tablePage`.** `Table`, `TableContainer`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
`TableCell`, `TableSkeleton` and `SortDirection` are untouched and none is shadowed. `PageRange` was
deliberately not used as the type name — `TablePageRange` is unambiguous at the package root.

## 2. Tests — `tests/`

| # | File | Action | Lines | Specs |
|---|---|---|---|---|
| 6 | `tests/components/table-paging.test.tsx` | **added** | +167 | **16** |
| 7 | `tests/components/TablePagination.test.tsx` | **added** | +393 | **30** |

**0 existing test files were edited.** The committed snapshot
`tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` is byte-identical to `HEAD`
(sha256 `ce7bd849…`, `git diff` reports no content change; the `M` flag `git status` shows for it is
this Windows worktree's CRLF/stat artefact, and the file is **not staged**).

⚠ Both new specs live under `tests/components/` although one of them tests a `src/lib` module. That
is this repo's own precedent — `table-controls.ts` is a `src/lib` module tested at
`tests/components/table-controls.test.tsx` — and it is required: `vitest.config.ts` globs only
`tests/pricing/**`, `tests/sales-order/**` and `tests/components/**/*.test.tsx`, so the
`tests/lib/table-paging.test.ts` path the plan names would never have run. `vitest.config.ts` was
**not** edited (the plan lists it as a file not to touch). `known-issues.md` A-1.

## 3. Files created and deleted within the session

| File | Why | State now |
|---|---|---|
| `audit-probe.mjs` | Reproduced CI's `pnpm audit --prod --audit-level=high` in Node, because `pnpm audit` itself is permission-blocked in a build session. Same method CR-003 used | **deleted** — not committed, not part of this change |

## 4. Paper trail written by this change (not source)

`runs/change-04/output/*` (12 files) · `runs/change-04/evidence/*` (4 files) ·
`runs/change-04/technical-debt.md` · `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`
(appended) · `runs/current/SESSION_HANDOVER.md` and `runs/current/active-milestone.md` (reconciled) ·
`organization/CONTEXT_USAGE_LOG.md` (one row, outside this worktree).

The approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-004.md`, its estimate, and the four
mockups under `runs/current/mockups/CR-DESIGN-SYSTEM-004/` were written at the plan gate and are
committed by this change as the contract it was built to.

## 5. Considered and deliberately left untouched

| File | Why not |
|---|---|
| `src/components/Table.tsx` | The bars sit **beside** the table — one above, one below. Not forked, not wrapped, no new prop |
| `src/components/DataTableToolbar.tsx` | Option (a). The top bar is a **sibling row**, not a new toolbar slot — a slot would edit the most-depended-upon component in the package (11 call sites, three apps) to achieve a layout right-alignment gives for free (D-21) |
| `src/lib/table-controls.ts` | Option (a). `applyTableControls` keeps its exact signature and behaviour. No controlled/server mode was added — that is option (b), which the approved plan rejected |
| `src/components/Select.tsx`, `Button.tsx` | Composed, not modified. The picker and arrows use them exactly as they ship |
| `package.json`, `pnpm-lock.yaml` | **No new dependency.** `Select`, `Button` and `lucide-react` chevrons are already here |
| `vitest.config.ts` | Already globs `tests/components/**/*.test.tsx`, which is where both new specs live |
| `src/lib/tokens.css` | **No new token.** Every class used already ships and is already used by `Select` / `Button` |
| Anything under `bananaworld-dc/`, `-crm/`, `-org-admin/`, `-rms/` | Not this repo, not this lane. **No consumer pin moved and no consumer file edited** |
| `runs/epic-020/`, any `milestone-NN/`, `runs/current/epic-plan/` | A closed epic is immutable. None created, none written to, none read from |
