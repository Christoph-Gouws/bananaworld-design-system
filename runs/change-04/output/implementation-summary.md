# Implementation summary — CR-DESIGN-SYSTEM-004

> Add a shared paging control to `@bananaworld/design-system`.
> Unit: **Change Request**, archived to `runs/change-04/`. Not an epic, not a milestone.
> Branch `change/cr-design-system-004`, off `origin/main` @ `fc2c5b8`. Date 2026-08-14.

## 0. Plan-vs-code confirmation — required first line

**Everything the approved plan cites is still exactly as described in the code I started from; nothing
moved, and the plan was built as approved.** Spot-checked, not assumed:

| The plan cites | Found | Verdict |
|---|---|---|
| `src/lib/table-controls.ts:272–296` — `applyTableControls` narrowing with `rows.filter(...)` | `applyTableControls` opens at line 272, `rows.filter` at 282, file ends at 296 | exact |
| `DataTableToolbar.tsx:437` — the en dash the date range prints | line 437, `<span className="text-sm text-fg-subtle">–</span>` | exact |
| The toolbar snapshot hash `ce7bd849…` (CR-003's additive method) | `ce7bd84978bd36072116bbdb5dd61145cc08d8e2149ef1d198584ae2619eb7c1` | exact |
| Test baseline **189 passed / 11 files** | `pnpm test` before any edit: 189 / 11 | exact |
| No barrel name begins `TablePage`, `TABLE_` or `tablePage` | none does; `Table`, `TableContainer`, `TableRow`, `TableHead`, `TableCell`, `TableSkeleton`, `SortDirection` all untouched and unshadowed | exact |
| `Select` is Radix Select; `Button` is a native `<button>` with `secondary`/`sm` variants | both as described | exact |
| The `<label>`-wraps-a-Radix-trigger caption idiom in `SelectFilterControl` | `DataTableToolbar.tsx:243–265` | exact |
| `src/index.ts` **enumerates** `./lib` rather than starring it | it does — the new lib names had to be named there too | exact |
| Branch base | `fc2c5b8` is `origin/main` HEAD, the sha the plan was written on | exact |

**One plan detail did not survive contact, and it is a path, not a premise** — the plan puts the pure
arithmetic spec at `tests/lib/table-paging.test.ts`, but `vitest.config.ts` globs only
`tests/pricing/**`, `tests/sales-order/**` and `tests/components/**/*.test.tsx`, so a file there would
have silently never run. The repo already answers this: `table-controls.ts` is a `src/lib` module and
its suite lives at `tests/components/table-controls.test.tsx`. I followed that precedent rather than
edit `vitest.config.ts`, which the plan lists as a file not to touch. Recorded in `known-issues.md` A-1.

## 1. What was built

Two new files and three appended barrel blocks. **No existing source line was edited or deleted.**

### `src/lib/table-paging.ts` (new, 83 lines) — the arithmetic

`TABLE_PAGE_SIZES = [25, 50, 100, 200]`, `TablePageState { page, pageSize }`, and
`tablePageRange(state, total) → TablePageRange`, which returns `page`, `pageSize`, `total`,
`pageCount`, `offset`, `from`, `to`, `isFirst`, `isLast` — every number already clamped sane.

`offset` is on the range deliberately (D-12): it is the same arithmetic as `from`, so what the bar
prints and what the consumer's query asks the server for cannot disagree. `offset + 1 === from`
whenever `total > 0` is an asserted invariant, not a convention.

`pageCount` is `max(1, ceil(total / pageSize))` — never 0, so an empty list reads "page 1 of 1"
rather than "page 1 of 0". Junk input clamps and never throws: a non-finite or non-integer page, a
page below 1 or above the count, a page size of 0 or below, a negative or non-finite total.

🔴 **Clamping renders; it never calls back** (D-7). Page 9 of 4 *displays* page 4 and disables Next.
It does not fire `onChange` to "fix" its parent — that is a re-render loop and a lie about who owns
the state. A spec pins it so nobody helpfully adds one.

### `src/components/TablePagination.tsx` (new, 176 lines) — the control

One component, rendered twice around one table, switched by `placement`:

```tsx
<DataTableToolbar … />                                    {/* unchanged */}
<TablePagination placement="top"    {...paging} />        {/* count · picker · arrows */}
<TableContainer><Table>…</Table></TableContainer>         {/* unchanged */}
<TablePagination placement="bottom" {...paging} />        {/* arrows */}
```

**Owner-approved layout A**, exactly as drawn in `option-a.html`: `Showing 1–25 of 312` at the top
left; `Rows per page [25 ▾]` then `‹ Previous` `Next ›` at the top right; the arrows again at the
bottom right. `placement` defaults to `"top"`, so a consumer that renders one bar gets the complete
one and never a pair of orphan arrows.

| Part | Built from |
|---|---|
| Page-size picker | this package's Radix `Select`, in the `<label>`+caption idiom `SelectFilterControl` already uses, plus `aria-label="Rows per page"` on the trigger |
| Previous / Next | this package's `Button variant="secondary" size="sm"` + `lucide-react` chevrons — a native `<button>`, so `disabled` announces correctly for free |
| `Showing 1–25 of 312` | a `<p role="status">` whose **announced text is its visible text**, `tabular-nums` — **top bar only** |
| Each bar | a `<nav>` named `List paging` / `List paging, end of list`, so two bars around one list are distinguishable |

**No new dependency, no new token, no new visual language.** Every class used is already used by
`Select` or `Button`.

Three rules the two-bar layout forces, each pinned by a spec rather than left to care:

- **Exactly one live region per list** (D-19) — only `placement="top"` carries `role="status"`.
  Two would announce every page change twice.
- **The picker renders in the top bar only** (D-20) — two pickers are two sources of truth for one
  number. Asserted by absence, so a future tidy-up cannot quietly add a second.
- **One callback, always a complete pair** (D-5) — `onChange({ page, pageSize })`. Two callbacks
  would let a consumer reach page 9 with a size of 200 against a total of 312.

Changing the page size emits `{ page: 1, pageSize: next }` (D-6): holding position needs stable row
identity, which a server re-query does not give.

### The barrels — `+24 / −0`

| File | Added |
|---|---|
| `src/components/index.ts` | `TablePagination`, `TablePaginationProps`, `TablePaginationPlacement` (+8) |
| `src/lib/index.ts` | `TABLE_PAGE_SIZES`, `tablePageRange`, `TablePageState`, `TablePageRange` (+9) |
| `src/index.ts` | the same four lib names enumerated at the package root (+7) |

## 2. Option (a), as the approved plan chose

The control is **presentation only** (TECH-COMP-003): no network, no data, no fetching, no state of
its own. `page`, `pageSize` and `totalCount` are inputs; computing the total is the consumer's job.

The client-side-narrowing trap the request called out is answered by a **written contract**, in the
three places the plan named: a fenced comment at the top of `TablePagination.tsx`, §2 of
`evidence/developer-handover.md`, and `runs/change-04/technical-debt.md`. `DataTableToolbar` and
`useTableControls` were **not** given a controlled mode — that is option (b), which the plan
recommended against and the owner approved as written. (a) and (b) are not mixed anywhere.

## 3. Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | **clean** under `strict` + `noUncheckedIndexedAccess` |
| `pnpm test` | **235 passed / 13 files**, 0 failed, 0 skipped (baseline **189 / 11**) |
| New specs | **+46** — 16 arithmetic, 30 component. **0 existing specs edited** |
| Additive — diff | `git diff --numstat -- src/` → **+24 / −0**. Zero deletions, zero modified lines |
| Additive — DOM | toolbar snapshot sha256 **unchanged**: `ce7bd849…` |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new**. `package.json` / `pnpm-lock.yaml` untouched |
| Migration | **N/A — this package has no database** |
| Throwaway Postgres | **never started**; nothing left behind, no port held |

## 4. Not built, deliberately

No per-user or per-list page-size memory (D-14 — raised as a question, not smuggled in). No consumer
screen wired. No consumer pin bumped. No jump-to-page, no page-number list, no `variant` prop. No
change to the existing sort, filter, search or empty-state behaviour of `Table` / `DataTableToolbar`.

## 5. 🔴 Shipping this is two steps, not one

Consumers pin this package to an **exact commit**. Landing the control here does **nothing** for
Bananaworld-DC until DC bumps its pin, against the **merged sha on `main`** — never a branch sha
(KI-M001E19-002 is that mistake on record). **CR-DC-052 is not unblocked when this merges.** It is
unblocked when this merges **and** DC's pin bump merges.

## 6. This is not a performance change

Nothing is slow today and the owner said so plainly. No artefact in this pack claims a speed
improvement, and no acceptance criterion here can be satisfied by a stopwatch (D-1).
