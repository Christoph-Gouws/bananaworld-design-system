# Changed files — CR-DESIGN-SYSTEM-006

> **Stage 05 reviews only the files listed here**, so this list is the complete one, not a summary.
> Measured with `git diff --numstat fc6f6c6`, not recalled.

## 1. Files changed — the whole list

| # | File | Change | numstat | numstat `-w` |
|---|---|---|---|---|
| 1 | `src/components/Table.tsx` | **modified** | **+77 / −13** | **+67 / −3** |
| 2 | `tests/components/Table.test.tsx` | **NEW FILE** | **+463 / −0** | +463 / −0 |

**Two files. That is the entire change.** No source file added, none deleted, no barrel, no config,
no `package.json`, no `pnpm-lock.yaml`, no lockfile, no CI workflow.

### 1.1 🔴 Every deletion in `src/`, itemised

`git diff fc6f6c6 -- src/components/Table.tsx` removes 13 lines. **Ten of them are the same text
re-indented**, which `git diff -w` proves by reporting only **3** deletions. All 13:

| # | Deleted line | Why |
|---|---|---|
| 1 | `  { className, interactive, ...props },` | **real** — replaced by the same line plus `valign` |
| 2 | `  { className, align, numeric, muted, ...props },` | **real** — replaced by the same line plus `valign` |
| 3 | `        "px-3 py-2 align-middle",` | **real** — split into `"px-3 py-2",` + the conditional one-class emission. The default's value and position are unchanged; T-1 and T-8 pin both |
| 4–13 | the `<tr … />` block (`<tr`, `ref=`, `className={cn(`, the base string, `interactive &&`, the hover string, `className,`, `)}`, `{...props}`, `/>`) | **re-indentation only** — two spaces deeper, inside `<RowValignContext.Provider>`. Character-for-character identical otherwise; `git diff -w` shows none of them |

**Nothing was removed. No field, no default, no export, no class.**

### 1.2 What changed inside `src/components/Table.tsx`

| Region | Change |
|---|---|
| imports | `createContext`, `useContext` added to the existing `react` import |
| file header comment | +3 lines: how to ask for top alignment, and that the default does not move |
| before `TableRowProps` | **new**: `type VAlign`, `valignClass()`, `RowValignContext` |
| `TableRowProps` | +1 optional field `valign?: VAlign` with its doc comment |
| `TableRow` | destructures `valign`; wraps its **unchanged** `<tr>` in the context provider |
| `TableCellProps` | +1 optional field `valign?: VAlign` with its doc comment, incl. the `TdHTMLAttributes.valign` note |
| `TableCell` | destructures `valign`; resolves cell-over-row; emits exactly one class in one of two positions |
| `Align`, `alignClass`, `TableHead`, `TableHeadProps`, `sortIndicator`, `ariaSort`, `TableContainer`, `Table`, `TableHeader`, `TableBody` | **untouched** |

### 1.3 What is in `tests/components/Table.test.tsx`

17 specs, T-1 … T-16 (T-16 is two specs: values and types). §1–§3 (T-1, T-2, T-15, T-16) were
**committed green against the unmodified component** in `f59f2c7`, before `src/` was touched.

## 2. Files explicitly NOT changed, and why

| File | Why it was considered, and left alone |
|---|---|
| `src/index.ts` | root barrel — a new optional field on an already-exported interface needs no export (F-7). **Diff empty, verified** |
| `src/components/index.ts` | same. **Diff empty, verified** |
| `src/lib/index.ts` | same; `VAlign` is module-private, like `Align`. **Diff empty, verified** |
| `src/lib/cn.ts` | twMerge already groups `align-*` as one conflicting group (F-10). Nothing to add |
| `src/lib/SurfaceContext.tsx` | its shape was **mirrored**, not imported or edited — `RowValignContext` is private to `Table.tsx` |
| `src/components/TablePagination.tsx` | sits beside the Table block; unaffected by a cell prop |
| every other `src/` component | `<td` appears exactly once in `src/`, in `Table.tsx`. Nothing else renders a table cell |
| `package.json`, `pnpm-lock.yaml` | no new dependency. The nanoid override and the six standing audit ignores are **untouched** |
| `vitest.config.ts` | `tests/components/**/*.test.tsx` already picks the new file up (F-9) |
| `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` | vitest rewrote its line endings during a run; **content diff empty**, and it was **restored** (`git checkout`). Not part of this change |
| **every file in `bananaworld-dc`** | read-only sibling. **Read and cited by path + line; never written, staged, committed or formatted** |
| any `runs/epic-NN/`, `milestone-NN/`, `runs/current/epic-plan/` | forbidden for a change. **None created** |

## 3. Throwaway files — created and deleted inside this session

| File | Purpose | State |
|---|---|---|
| `.mutate.mjs` | applied mutations M-1…M-5 and reverted them | **deleted** |
| `.audit.mjs` | reproduced `pnpm audit --prod --audit-level=high`, which is permission-blocked | **deleted** |
| `tests/components/matrix-dump.test.tsx` | dumped the 320-row authoring matrix to diff the M-3 mutant | **deleted** |
| `tests/components/legacy-dump.test.tsx` | dumped 384 existing-caller shapes to diff against `main@fc6f6c6` | **deleted** |
| `matrix-clean.txt`, `matrix-m3.txt`, `legacy-main.txt`, `legacy-new.txt` | the dumps themselves | **deleted** |

`git status` is clean of all of them; the only untracked paths left are this change's own archive and
the plan/mockups the conductor placed in `runs/current/`.

## 4. Paperwork written by this change (not source)

`runs/change-06/output/` — `test-results.md`, `qa-report.md`, `defect-log.md`,
`deployed-verification.md`, `revision-review.md`, `simplification-opportunities.md`,
`accepted-refactors.md`, `readable-code-scorecard.md`, `centrality-scorecard.md`,
`changed-files.md` (this file), `known-issues.md`, `implementation-summary.md`.

`runs/change-06/evidence/` — `milestone-evidence.md`, `global-milestone-scorecard.md`,
`user-verification-steps.md`, `developer-handover.md`. Plus `runs/change-06/technical-debt.md`.

Outside the archive — `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-006 entry),
`runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md`, and the context-usage row in
`organization/CONTEXT_USAGE_LOG.md`.
