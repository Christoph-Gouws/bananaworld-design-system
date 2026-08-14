# Technical debt — CR-DESIGN-SYSTEM-004

> Debt knowingly left by this change, recorded at the owner-approved plan's own instruction (§2a,
> item 3). This is a **Change Request's own file**; nothing here is appended to a closed epic's
> register.

## TD-1 — 🔴 the client-side-narrowing trap is written down, not enforced

| Field | Value |
|---|---|
| Kind | Contract enforced by prose rather than by types |
| Created by | The deliberate choice of **option (a)** at the plan gate, approved by the owner |
| Owner of the risk | **Every consumer that pages on the server.** CR-DC-052 is the first |
| Severity if ignored | **High, and invisible.** An operator's search box silently reports "no match" for a record that exists |

### What it is

`useTableControls` and `applyTableControls` search, filter and sort **client-side, over the rows they
are handed** (`table-controls.ts:272–296`). Server paging hands them one page. Combine the two and
the operator gets a search box that searches the 25 rows currently on screen. To an operator that is
indistinguishable from data loss, and on today's short lists it is invisible.

### The contract, in the words it is written in

> A table whose rows are paged **by the server** must not use `useTableControls` for searching or
> filtering. `useTableControls` narrows only the rows it holds, which is one page. Send the search
> text and the filter values to the server and let it decide both the rows and the total; feed the
> total back into `TablePagination.totalCount`. Using both together produces a search that hides
> matching records with no indication that it has.

### Where it is stated — three places, per the plan

1. A fenced 🔴 comment at the top of `src/components/TablePagination.tsx`, in the idiom this repo
   already uses for the `onSelect` gotcha and the `hasActiveControls` arm.
2. `runs/change-04/evidence/developer-handover.md` §2, as a consumer obligation.
3. Here.

### Why it was accepted rather than fixed

Option (b) — a controlled/server mode on `DataTableToolbar` / `useTableControls` — removes the trap
at source, and was rejected in the approved plan (§2b, D-2) for reasons that are about design, not
size: it redesigns a live shared toolbar driven by roughly eleven call sites across three apps, for a
consumer **that does not yet exist**, and it cannot answer what `optionsFor` derives its options from
when the rows on screen are one page and the full set lives on the server. That question has no good
answer without a real caller.

### How it gets paid off

**Not by this package alone, and not on a schedule this package sets.** Two routes, and the first is
the expected one:

1. **CR-DC-052 honours the contract**, and the debt stays a written rule that cost nothing. This is
   what the handover asks for.
2. **If a second server-paged screen appears**, option (b) becomes worth building — as its own
   change, with CR-DC-052's actual requirements in hand. Adding it later is **itself additive**, so
   nothing here forecloses it.

### Trigger to revisit

The **second** consumer to page on the server. One caller is a contract; two callers is a missing
abstraction.

## TD-2 — a companion obligation that travels with TD-1

`totalCount` must be the count of rows **that person is allowed to see** — the same scope filter as
the page query. A total computed without it leaks the existence of records through a number ("of
312" when the person may see 40). The package cannot check this: it is handed a number
(TECH-COMP-003, RBAC-PRINCIPLE-001). Stated in the same three places as TD-1 so CR-DC-052 meets it on
purpose rather than by luck.

## Not debt — recorded so it is not mistaken for some

| Item | Why it is not debt |
|---|---|
| No per-user page-size memory | Explicitly out of scope, raised as a question at the gate, and nothing was left half-built for it (D-14) |
| No jump-to-page, no page-number list, no `variant` prop | Never in scope. No prop, no option and no dead code left behind |
| `pnpm format:check` / no eslint config / no cross-system register | **Pre-existing repo drift, not created here** — `known-issues.md` C-1, C-2, C-3 |
| DC's dead private copy of `table-controls.ts` | Another repo's debt, on record as CR-003 seam S-4. Touching it from here would be a lane violation |
