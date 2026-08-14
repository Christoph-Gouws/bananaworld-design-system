# Developer handover — CR-DESIGN-SYSTEM-004

> For the next session in this project, and for every consumer lane that will adopt this control.
> Change: **add a shared paging control to `@bananaworld/design-system`.** Archive: `runs/change-04/`.

## 1. 🔴 Read this first — shipping it is two steps, not one

Consumers pin this package to an **exact commit** (Bananaworld-DC currently `365be65`). Landing the
control here does **nothing** for DC.

> **CR-DC-052 is not unblocked when this merges.** It is unblocked when this merges **and** DC's pin
> bump merges. Two changes, in that order, in two different lanes.

And when DC bumps, it bumps to the **merged sha on `main`**, never a branch sha — KI-M001E19-002 is
that exact mistake on record.

**No consumer pin was moved by this change and none may be moved from here.** Each consumer moves its
own, in its own change.

## 2. 🔴 The obligation that comes with this control

Under the owner-approved **option (a)** the control is pure presentation. It renders the numbers it is
given and calls back on change. That means the following are the **consumer's** to get right, and this
package cannot check any of them.

### 2.1 A server-paged table must not use `useTableControls` for searching or filtering

> `useTableControls` and `applyTableControls` narrow only the rows they hold
> (`table-controls.ts:272–296`). Under server paging that is **one page**. Send the search text and
> the filter values to the **server** and let it decide both the rows and the total; feed the total
> back into `TablePagination.totalCount`. Using both together produces a search box that reports "no
> match" for a record that exists — which, to an operator, is indistinguishable from data loss, and
> which is invisible on a short list.

Same text is fenced at the top of `src/components/TablePagination.tsx`, so a developer opening the
file meets it before they write anything. Also `runs/change-04/technical-debt.md` TD-1.

### 2.2 `totalCount` must be the count of rows THAT PERSON MAY SEE

The same scope filter as the page query. A total computed without it leaks the existence of records
through a number — "of 312" when the person may see 40. RBAC-PRINCIPLE-001; the package is handed a
number and cannot audit it. TD-2.

### 2.3 Use `offset` from `tablePageRange`, do not recompute it

`offset` is on the range so that what the bar prints and what the query asks the server for come from
one place. `offset + 1 === from` is an asserted invariant. Sixteen lists each writing
`(page - 1) * size` by hand is sixteen chances to be off by one, in the one place where an off-by-one
looks exactly like a missing record.

### 2.4 Render both bars, in this order

```tsx
<DataTableToolbar … />                                    {/* unchanged */}
<TablePagination placement="top"    {...paging} />
<TableContainer><Table>…</Table></TableContainer>          {/* unchanged */}
<TablePagination placement="bottom" {...paging} />
```

Both bars take the **same props object** — that is what keeps them in sync. The bottom bar is a
**companion, never the whole control**: it carries the arrows only. `placement` defaults to `"top"`,
so a one-bar list gets the complete bar rather than orphan arrows.

The top bar is a **sibling row between the toolbar and the table**. Do **not** try to put it inside
`DataTableToolbar` — see §5, D-21.

## 3. The new export surface

All reachable from the package root, `@bananaworld/design-system`.

```ts
import {
  TablePagination,          // the control
  TABLE_PAGE_SIZES,         // readonly [25, 50, 100, 200]
  tablePageRange,           // (state, total) => TablePageRange
  type TablePaginationProps,
  type TablePaginationPlacement,   // "top" | "bottom"
  type TablePageState,      // { page, pageSize }  — page is 1-based
  type TablePageRange,      // page, pageSize, total, pageCount, offset, from, to, isFirst, isLast
} from "@bananaworld/design-system";
```

```ts
interface TablePaginationProps {
  readonly page: number;             // 1-based; out of range renders clamped, silently
  readonly pageSize: number;
  readonly totalCount: number;       // see §2.2
  readonly onChange: (next: TablePageState) => void;   // always a complete, valid pair
  readonly placement?: TablePaginationPlacement;       // default "top"
  readonly pageSizes?: readonly number[];              // default TABLE_PAGE_SIZES
  readonly className?: string;
}
```

Behaviour a consumer should expect and not re-implement:

| Behaviour | Detail |
|---|---|
| One callback | `onChange` always emits **both** fields. There is no `onPageChange`/`onPageSizeChange` |
| Size change resets the page | `{ page: 1, pageSize: next }` — always |
| Clamping is render-only | Page 9 of 4 **displays** page 4 and disables Next. It does **not** call back to fix your state. Your state stays 9 until you change it |
| `pageCount` is never 0 | An empty list is "page 1 of 1", `from 0`, `to 0`, both arrows disabled |
| The last page is honest | The remainder, never padded. 100 rows at 25 is four pages, not five |
| Junk input is safe | A non-finite/non-integer/below-1 page takes 1; a page size below 1 takes 1; a negative or non-finite total is 0. Nothing throws |

## 4. What this change did NOT touch — and why it matters to you

`Table.tsx`, `DataTableToolbar.tsx` and `src/lib/table-controls.ts` are **untouched**.
`git diff --numstat -- src/` is **+24 / −0** across three barrels: zero deletions, zero modified
lines. The committed toolbar snapshot hash is unchanged (`ce7bd849…`) and all 189 pre-existing specs
pass unmodified.

**Consequence for every consumer:** nothing renders differently anywhere. There is no adoption cost,
no migration, and no line any existing screen must change. Adopting the control is opt-in, per app,
per screen, on your own clock.

## 5. 🔴 Three lines in the source that must not be "tidied"

Each is fenced in `TablePagination.tsx` **and** pinned by a spec that fails loudly. If one of these
tests goes red, the fix is to put the line back, not to update the test.

| # | The line | What breaks without it |
|---|---|---|
| 1 | Only `placement="top"` carries `role="status"` (D-19) | Two live regions around one list — a screen reader announces every page change **twice** |
| 2 | The picker renders in the top bar **only** (D-20) | Two pickers are two sources of truth for one number. Asserted **by absence**, so a tidy-up cannot quietly add one |
| 3 | Clamping never fires a callback (D-7) | A callback during render to "fix" the parent is a re-render loop and a lie about who owns the state |

And one design rule, D-21: **do not give `DataTableToolbar` a right-hand slot for the picker.** It
looks like the obvious move and it would edit the most-depended-upon component in the package —
roughly eleven call sites across three apps — to achieve a layout that right-alignment achieves for
free.

## 6. Per-app follow-up

| App | Owed | Note |
|---|---|---|
| **Bananaworld-DC** | 1. Bump the pin to this change's **merged** sha. 2. Then CR-DC-052 may start, honouring §2.1–§2.4 | Nothing breaks at the bump: no existing DC screen imports anything this change adds |
| **Bananaworld-CRM** | Nothing required by this change | Its unbounded-list problem is coming; the control is here when it wants it. ⚠ Still owes CR-003's **seven-point saved-view obligation** before declaring any availability filter as `multiSelect` — `runs/change-03/evidence/developer-handover.md` §3. Unrelated to this change |
| **org-admin** | Nothing required | Its four screens drive `useTableControls` from their own UI and import nothing this change adds |
| **RMS** | Nothing required | Uses neither |

## 7. Open items carried forward

| # | Item |
|---|---|
| 1 | **Option (b) — a controlled/server mode on the toolbar — was rejected, not foreclosed.** Adding it later is **itself additive**. The trigger to reconsider is the **second** consumer to page on the server: one caller is a contract, two callers is a missing abstraction (TD-1) |
| 2 | **Per-user / per-list page-size memory** was raised at the gate and deliberately not built (D-14). If it is ever wanted, CRM's per-rep saved view state (CR-CRM-011) is the pattern — a separate change |
| 3 | ⚠ **Do not inherit "the CRM uses neither yet" as fact.** The request says so; CR-003 read CRM's `AvailabilityView.tsx` rendering `DataTableToolbar` with five select filters. Nothing here depends on it — check before relying on it |
| 4 | ⚠ **Recorded consumer pin values disagree between documents** and are not checkable from a build worktree. Read the app's own `package.json` |
| 5 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** in this repo — **fourth change to raise it.** A governance decision for the owner. The five seams in `centrality-scorecard.md` §2 are the record meanwhile |
| 6 | **Repo drift, out of lane:** no prettier config (so `format:check` fails repo-wide, including on files this change never touched), no `lint` script and no eslint config, stale `ci.yml` test-job label. `known-issues.md` C-1/C-2/C-4 |
| 7 | **Still open from earlier changes:** CR-001's colour-stage chips on the tablet receiving screen, and CR-002's DC document-header adoption, where **five assertions in DC's `tests/contract/transaction-form-standard.test.ts` go red by design** and must be inverted, never relaxed. Neither is affected by this change |

## 8. Where everything is

| What | Where |
|---|---|
| The approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-004.md` |
| The approved mockup (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-004/option-a.html` |
| Stage 04 artifacts | `runs/change-04/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-04/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-04/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-04/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Debt | `runs/change-04/technical-debt.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-DESIGN-SYSTEM-004, D-1…D-21) |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-03/` (CR-003, merged as `fc2c5b8`) · `runs/change-02/` (`9aa20f7`) · `runs/change-01/` (`365be65`) |
