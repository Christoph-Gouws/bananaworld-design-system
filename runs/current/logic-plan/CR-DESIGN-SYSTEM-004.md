# CR-DESIGN-SYSTEM-004 — a shared paging control for long lists

> Logic plan. Written 2026-08-14 on branch `change/cr-design-system-004`, which sits on `fc2c5b8`
> (CR-DESIGN-SYSTEM-003 merged as PR #13).
> **Revision 2 — 2026-08-14**, after the owner's layout instruction at the plan gate. Everything the
> owner did not ask to change is preserved; §3.2, §3.3, §6, §8 and §9 carry the amendments.
> **Nothing has been built. No feature code exists for this change.**

<!-- OWNER-BRIEF-START -->

## What changed

- **Chooser at the top right, arrows top right and bottom right — as you asked.** That replaces the
  single strip under the list I drew before. The arrows now appear twice, so at the end of a long
  list you can move on without scrolling back up. The chooser still appears once, at the top. All
  three new drawings follow your arrangement.

## What this gives you

Long lists show everything at once today. This adds one shared set of list controls: choose how many
rows to see (25, 50, 100 or 200), step back and forward, and an honest line reading
**"showing 1–25 of 312"**. Built once in the shared kit, so every list works the same way.

Nothing changes on any screen the day it lands. A list gains it later, in its own separate piece of
work, and that team must first move to the new version of the kit — a **second, separate step**. The
transaction-lists job waits on both.

## What I need you to decide

1. **Where the "showing 1–25 of 312" line sits.** Three drawings: left of the top row (my
   recommendation), beside the chooser, or at both the top and the bottom.
2. When a list fetches one page at a time, the search box must search **everything**, not just the
   rows on screen — otherwise it quietly hides matching records, which looks exactly like lost data.
   Either I **write that rule down** for each list's team to follow (smaller; the risk sits with
   them), or I **change the shared search bar now** so the mistake cannot be made (bigger; that bar
   is on many live screens). I recommend the first.

## Not included

Nothing is slow today — this is preparation, not a repair. Remembering a person's chosen page size
is not included, and no actual list is wired up here.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. What this change is not

**It is not a performance fix.** The owner said plainly that nothing is slow today, and no
measurement in this repo or any consumer says otherwise. This plan therefore makes **no claim about
speed**, and no acceptance criterion in it can be satisfied by a stopwatch. What it buys is that
when a list *does* need paging — CR-DC-052 is the first — the control already exists, in the shared
package, once, per the owner's standing rule of 2026-08-12. Any card, commit message or evidence
line written later that says "faster" would be unverifiable and must not be written.

## 1. The blast radius — and why it is, this time, genuinely zero

### 1.1 Nothing that exists is edited

This change **adds two new files and appends to three barrels**. It edits no behaviour, no default,
no export, no type, and no rendered DOM of anything that ships today:

- `src/components/Table.tsx` — **untouched**. The paging bars sit *beside* the table — one above it,
  one below it — not inside it. The table is not forked, not wrapped, and gains no prop.
- `src/components/DataTableToolbar.tsx` — **untouched** under the recommended option (a). Option (b),
  if the owner picks it, changes this file; see §5.
  🔴 **The owner's top bar does NOT go inside the toolbar.** The obvious-looking move — give
  `DataTableToolbar` a right-hand slot for the picker — would edit the single most-depended-upon
  component in the package (11 call sites across three apps) and is explicitly out of scope. The top
  paging bar is **its own row**, rendered by the consumer between the toolbar and the table. It is
  right-aligned, so it reads as one line with the toolbar above it without being coupled to it.
- `src/lib/table-controls.ts` — **untouched**. `applyTableControls` keeps its exact signature and
  behaviour.

That is a stronger additive proof than CR-003 could offer: there is no arm to add to an existing
function, no union to widen, and no default to preserve, because no existing function is called.

### 1.2 The counts in the request, checked against what this repo can actually see

The request states: *"DC imports `DataTableToolbar` in 11 files and `useTableControls` in 7; the CRM
uses neither yet."* **I cannot re-verify either figure from this worktree** — consumer repositories
are outside it and permission-blocked (recorded three changes running: SESSION_HANDOVER §7). What I
can do is set the request's numbers beside the last verified count, which was made by
CR-DESIGN-SYSTEM-003 §1.1 from the real sources:

| Claim | Request (2026-08-12) | CR-003's verified count (2026-08-14) | Note |
|---|---|---|---|
| DC files importing `DataTableToolbar` | 11 | **9 name it, 6 render it** | "imports" vs "renders" plausibly explains the gap |
| DC files using `useTableControls` | 7 | 6 rendering screens + DC's own re-export barrel | consistent |
| CRM | "uses neither yet" | ⚠ **CRM's `AvailabilityView.tsx` renders `DataTableToolbar` with 5 select filters** | **the request appears to be wrong here** |
| org-admin | not mentioned | **4 screens drive `useTableControls` without the toolbar** | the request does not know about this consumer |

**None of this changes the plan**, and that is the point worth recording: whether the number is 6,
9, 11 or 20, every one of those call sites imports symbols this change does not touch. I flag the
CRM discrepancy (§10 Q2) because a later session must not treat "CRM uses neither" as established
fact — CR-003's evidence says otherwise and was read from source.

### 1.3 The pins

| Consumer | Pin (per CR-003 §1.4, read from each `package.json`) |
|---|---|
| Bananaworld-DC | `365be65` |
| Bananaworld-CRM | `365be65` |
| org-admin | `ecba2218` |
| RMS | `ecba2218` |
| Mangaverde | `e3a88e35` |

⚠ SESSION_HANDOVER §1 records that the recorded pin values **disagree between documents** and are
not checkable from a build worktree. The request's "DC's `package.json` currently pins `365be65`"
matches CR-003's reading. **This change moves no pin.** See §7 S-2.

## 2. 🔴 The one thing that makes this more than a button pair

`useTableControls` and `applyTableControls` search, filter and sort **client-side, over the rows they
are handed** (`table-controls.ts:272–296` — `rows.filter(...)`, nothing else). CR-DC-052 needs the
**server** to send one page. Wire the two together naively and the operator gets a search box that
searches the 25 rows currently on screen and silently reports "no match" for a record that exists.
To an operator that is indistinguishable from data loss, and on today's short lists it is invisible.

**This plan is written to do option (a). The owner may choose (b) at the gate; §5 states exactly
what changes if they do. The two are never mixed** — a half-controlled toolbar, where some of the
narrowing happens locally and some is emitted, is the worst of the three and is forbidden by this
plan outright.

### (a) — CHOSEN, pending the owner: the strip is presentation only

`TablePagination` is a pure UI primitive under TECH-COMP-003: **no network, no data, no fetching, no
state of its own.** It renders the numbers it is handed and calls back when the operator changes
something. Total count and page number are **inputs**; computing them is the consumer's job.

The trap is then addressed by a **written contract**, in three places that a build session and a
consumer both hit:

1. A fenced comment at the top of `TablePagination.tsx` (the idiom this repo already uses for the
   `onSelect` gotcha and the `hasActiveControls` arm).
2. A section in the developer handover at close, phrased as a consumer obligation exactly as
   CR-003 §5.4 did for CRM's saved views.
3. `runs/change-NN/technical-debt.md`, so the next epic's closeout folds it into the registers.

**The contract, stated once, in the words it will be written in:**

> A table whose rows are paged **by the server** must not use `useTableControls` for searching or
> filtering. `useTableControls` narrows only the rows it holds, which is one page. Send the search
> text and the filter values to the server and let it decide both the rows and the total; feed the
> total back into `TablePagination.totalCount`. Using both together produces a search that hides
> matching records with no indication that it has.

**Why (a) is recommended.** Option (b) redesigns a live shared toolbar — 6–11 DC screens, 1 CRM
screen and 4 org-admin screens drive it today — for a consumer that does not yet exist. The first
server-paged screen in the estate will be CR-DC-052's, and designing a controlled-mode interface
before there is one real caller to design against is how a shared package acquires a mode nobody
fits. (a) is additive to the point of being inert; (b) can be added later, as its own change, with
CR-DC-052's actual requirements in hand — and adding it later is *also* additive, so nothing is
foreclosed.

**What (a) honestly costs.** The trap moves into the consumer's hands and lives only in prose. If
DC's lane ignores the contract, the defect ships in DC and this package cannot stop it. That is the
trade the owner is being asked to make, and it is stated on the card in those terms.

### (b) — the alternative, if the owner prefers the trap removed at source

`DataTableToolbar` / `useTableControls` additionally gain a **controlled/server mode**: the toolbar
emits its search text and filter values instead of applying them, and the consumer forwards them to
the server. Roughly: an optional `mode` (or an `onControlsChange` callback plus an "apply nothing"
switch) on `UseTableControlsConfig`, with `visible` becoming the identity of `rows` in that mode.

It is bigger, it edits the most-depended-upon file in the package, and every existing caller has to
be re-proved byte-identical the hard way (CR-003's snapshot-hash method). It also has to answer a
question (a) never asks: what does `optionsFor` derive from, when the rows on screen are one page
and the full set of depots lives on the server? **That question has no good answer without a real
caller**, which is the concrete reason (a) is recommended rather than a matter of size.

If the owner picks (b), this plan is revised, not extended: §6's file list gains
`DataTableToolbar.tsx` and `table-controls.ts`, the estimate roughly doubles, and §8 gains CR-003's
full before/after snapshot proof for every existing toolbar screen.

## 3. The design

### 3.1 The pure arithmetic — `src/lib/table-paging.ts` (new)

The package's own idiom: pure logic in `src/lib`, React skin in `src/components` (the header of
`table-controls.ts` states this explicitly). One exported function, one exported shape:

```ts
export const TABLE_PAGE_SIZES = [25, 50, 100, 200] as const;

export interface TablePageState {
  readonly page: number;      // 1-based
  readonly pageSize: number;
}

export interface TablePageRange {
  readonly page: number;       // clamped into 1..pageCount
  readonly pageSize: number;
  readonly total: number;
  readonly pageCount: number;  // max(1, ceil(total / pageSize)) — never 0
  readonly offset: number;     // (page - 1) * pageSize — what the consumer's query needs
  readonly from: number;       // 1-based first row on this page; 0 when total is 0
  readonly to: number;         // 1-based last row on this page; 0 when total is 0
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

export function tablePageRange(state: TablePageState, total: number): TablePageRange;
```

`offset` is on the range deliberately: it is the **same arithmetic** as `from`, and the one way to
guarantee that what the strip says ("showing 26–50") and what the consumer asks the server for
(`OFFSET 25 LIMIT 25`) can never disagree. Sixteen lists each doing `(page - 1) * size` by hand is
sixteen chances to be off by one, in a place where the error looks like missing records.

**The rules, stated so a build session cannot invent them:**

| Case | Result |
|---|---|
| `total = 0` | `pageCount 1`, `page 1`, `from 0`, `to 0`, `isFirst true`, `isLast true` |
| `total = 312`, size 25, page 1 | `from 1`, `to 25`, `pageCount 13`, `offset 0`, `isFirst true` |
| `total = 312`, size 25, page 13 | `from 301`, `to 312` — **the honest remainder, never a padded page** |
| `total = 100`, size 25, page 4 | `from 76`, `to 100`, `pageCount 4`, `isLast true` — the exact-multiple case |
| `page` above `pageCount` (stale input) | clamped to `pageCount` for **rendering only** — see below |
| `page < 1`, or a non-finite / non-integer input | clamped to 1; `pageSize` below 1 clamps to 1 |

🔴 **Clamping renders; it never calls back.** A pure presentation component that fires a callback
during render to "fix" its parent's state is a re-render loop waiting to happen and a lie about who
owns the state. If a consumer hands in page 9 of 4, the strip *displays* page 4's range and disables
Next. It does not silently emit `onChange`.

### 3.2 The control — `src/components/TablePagination.tsx` (new)

```ts
export type TablePaginationPlacement = "top" | "bottom";

export interface TablePaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly onChange: (next: TablePageState) => void;
  /**
   * "top" (default) — the full bar: range text, "Rows per page" picker, Previous / Next.
   * "bottom" — the arrows again, right-aligned, for the end of a long list.
   */
  readonly placement?: TablePaginationPlacement;
  /** The offered page sizes. Defaults to TABLE_PAGE_SIZES (25/50/100/200). */
  readonly pageSizes?: readonly number[];
  readonly className?: string;
}
```

### 🔴 3.2.1 Two bars, one component — the owner's layout, and what it forces

The owner's instruction (plan gate, 2026-08-14): *"rows per page picker at the top right of the list
… with the next and previous page arrows at the top and bottom right of the list."* So the control
renders **twice** around one table:

```tsx
<DataTableToolbar … />                                       {/* untouched, existing */}
<TablePagination placement="top"    {...paging} />           {/* picker + range + arrows, right */}
<TableContainer><Table>…</Table></TableContainer>            {/* untouched, existing */}
<TablePagination placement="bottom" {...paging} />           {/* arrows, right */}
```

**One component with a `placement`, not two components and not a table wrapper.** Two exports
(`TablePaginationHeader` / `TablePaginationFooter`) would double the export surface and duplicate the
range arithmetic; a component that takes the table as `children` would wrap `Table` and put a shared
primitive in the business of laying out its neighbour. `placement` keeps both bars provably in sync:
they are the same props object, so they cannot disagree about the page.

`placement` defaults to `"top"` — a consumer that renders one bar gets the complete one, never a pair
of orphan arrows.

Three consequences follow from rendering twice, and each is a rule the build session must not
improvise:

| Consequence | The rule |
|---|---|
| **Two live regions would announce every page change twice** | Only `placement="top"` carries `role="status"`. The bottom bar's range text (option C only) is plain text. Exactly one live region per list, always |
| **Two buttons named "Previous page" on one screen** | Correct and allowed — they do the same thing. Each bar is a `<nav>` with its own accessible name so a screen-reader user can tell them apart: `aria-label="List paging"` (top) and `"List paging, end of list"` (bottom) |
| **Two pickers would be two sources of truth** | The picker renders **only** in the top bar. `placement="bottom"` never renders it, at any option |

**One callback, not two.** `onChange` always emits a **complete, valid** `{ page, pageSize }` pair.
Two callbacks (`onPageChange` + `onPageSizeChange`) let a consumer end up on page 9 with a size of
200 against a total of 312 — a state the control would then have to render honestly as "showing
nothing". A single callback makes that pair unrepresentable, and it gives CR-DC-052's fetch effect
exactly one dependency. There are no existing callers, so there is no additive constraint on this
shape and it can simply be the right one.

🔴 **Changing the page size returns to page 1.** The control emits `{ page: 1, pageSize: next }`.
The alternative — keeping the first currently-visible row in view — requires reasoning about *which*
rows those are, and under server paging the row identity is not stable across a re-query. Page 1 is
predictable, and predictable beats clever in a control that four apps share.

**Composition** (Radix and this package's own primitives, nothing new):

| Part | Built from | Why |
|---|---|---|
| Page-size picker | this package's `Select` (Radix Select) + a visible `Rows per page` caption, wired with the same `<label>`+caption idiom `SelectFilterControl` already uses, plus `aria-label="Rows per page"` on the trigger | keyboard, typeahead, `role="combobox"`, portal and z-layer come from Radix |
| Previous / Next | this package's `Button variant="secondary" size="sm"` with a `lucide-react` `ChevronLeft`/`ChevronRight` | a native `<button>`; `disabled` is announced correctly with no help |
| "Showing 1–25 of 312" | a `<p role="status">` containing the real text, `tabular-nums` — **top bar only** | it is **text a screen reader reads**, not an `aria-label` bolted onto a decoration |
| The bar itself | a `<nav>` with an `aria-label` that names the placement (§3.2.1) | two bars around one list must be distinguishable, not two identical anonymous button pairs |

⚠ **Radix ships no pagination primitive**, so there is nothing here to hand-roll a replacement for.
The project's Radix rule is honoured where it bites: the only control with non-trivial keyboard and
screen-reader behaviour is the picker, and that is this package's Radix `Select`, unchanged.

**Why `role="status"`.** Pressing Next replaces the rows silently — a screen-reader user gets no
signal that anything happened. `role="status"` (implicit `aria-live="polite"`) means the new range is
announced after the change, which is the acknowledgement. This is the opposite of an aria
afterthought: the announced text and the visible text are the same string.

**The wording of the range text — literal, not clever:**

| Total | Text |
|---|---|
| 0 | `Showing 0 of 0` |
| 312, page 1, size 25 | `Showing 1–25 of 312` |
| 312, page 13, size 25 | `Showing 301–312 of 312` |
| 312, last page holding one row | `Showing 312–312 of 312` |

`Showing 312–312 of 312` is inelegant, and it is still the right answer: collapsing it to
`Showing 312 of 312` reads as a **count** ("312 rows of 312"), not a **position**, and that
ambiguity in a shared control is worse than an ugly dash. The en dash matches the date-range
separator the toolbar already uses (`DataTableToolbar.tsx:437`).

**Disabled arrows.** First page → Previous `disabled`; last page → Next `disabled`; `total = 0` →
both `disabled`. `Button`'s doc says a disabled state "always carries a tooltip per UX-DS-003 —
consumer responsibility". That rule is honoured by the adjacent status text rather than a tooltip:
"Showing 1–25 of 312" *is* the reason Previous is unavailable, it sits inches away, it is read by a
screen reader, and a tooltip on a disabled button needs a wrapper element to receive pointer events
that this control should not grow. Recorded as D-9 rather than skipped silently.

**No `variant` prop.** The owner picks one layout from the mockups and that is the one that is
built. Shipping all three behind a prop is anticipatory configurability and the Stage 05
simplification gate would take it straight back out. **`placement` is not that prop** — it is not a
choice of style, it is the owner's approved layout, which has two positions by construction and
therefore needs the component to know which one it is rendering.

### 3.3 The layouts the owner chooses between

`runs/current/mockups/CR-DESIGN-SYSTEM-004/{option-a,option-b,option-c,comparison}.html`

🔴 **The arrangement is settled and is not being re-asked.** All three options put the **picker at
the top right** and the **arrows at the top right and the bottom right**, exactly as instructed. The
previous round's single-strip-under-the-list drawings are superseded and have been replaced on disk.
What remains open is the one thing the instruction did not cover: **where the `Showing 1–25 of 312`
line goes.**

| Option | Top bar reads | Bottom bar reads | For | Against |
|---|---|---|---|---|
| **A — count left, controls right** ✅ recommended | left `Showing 1–25 of 312` … right `Rows per page [25 ▾]` `‹ Previous` `Next ›` | right `‹ Previous` `Next ›` | the count gets the space it needs and never collides with the picker; the top row reads as one sentence, left to right; labelled arrows need no interpretation | the top-left slot is spent, so a list with its own heading there stacks one row taller |
| **B — everything in one right-hand cluster** | right `Showing 1–25 of 312 · Rows per page [25 ▾] ‹ ›` | right `‹ ›` | most compact; leaves the whole top-left free for a heading or the toolbar's own controls; the Stripe/Linear idiom | four numbers, a dropdown and two arrows in one cluster is a lot to read at a glance; icon-only arrows carry their names only for a screen reader |
| **C — count at both ends** | left `Showing 1–25 of 312` … right picker + arrows | left `Showing 1–25 of 312` … right `‹ Previous` `Next ›` | at the bottom of 200 rows you can see where you are **and** move on without scrolling back up — the strongest fit for the long lists that motivated the arrows being repeated at all | the same sentence twice on one screen; only the top copy is announced aloud (§3.2.1), so the two are not quite equivalent |

All three are the same component, the same tokens, the same heights (`h-9` browser / `h-14` tablet
via `data-surface`), and the same keyboard path. They differ only in what the operator reads and
where. **Whichever is chosen, only the top bar announces** — the duplicate-live-region rule in
§3.2.1 holds across all three.

## 4. Data model + scoping

**There is no data model. This package has no database, no migration, no query, and gains none.**
`migrationExpected: false`.

The model that matters is the props, and it is scoped by construction:

- `page`, `pageSize` and `totalCount` are plain numbers supplied by the caller. The package never
  learns what a row **is**, never counts anything itself, and never asks anyone for a count.
- No `warehouse_id`, no `legal_entity`, no tenancy identifier, no fetch (TECH-COMP-003). `offset` is
  arithmetic on the caller's own numbers, not an instruction to anybody.
- The strip cannot widen what an operator sees: it renders a window over a total the consumer's
  already-scoped query returned.

## 5. Permission shape

**None, and none is gained.** Which rows a person may see is decided upstream by each app's own
query and enforced by its server (RBAC-PRINCIPLE-001). `PermissionGate` stays in each app.

One consequence worth stating plainly, because paging is where it is most tempting to get wrong:
`totalCount` must be **the count of rows that person is allowed to see**, not the table's row count.
A total computed without the same scope filter as the page query leaks the existence of records
through a number — "of 312" when the person may see 40. The package cannot check this; it is named
here and repeated in the consumer obligation (§2a) so CR-DC-052 meets it on purpose.

## 6. Files I expect to touch

All paths relative to this worktree.

| # | File | Action | Est. lines |
|---|---|---|---|
| 1 | `src/components/TablePagination.tsx` | **new** — the control, its props, the two placements, the range text, the contract comment | ~+160 |
| 2 | `src/lib/table-paging.ts` | **new** — `TABLE_PAGE_SIZES`, `tablePageRange`, the two shapes | ~+60 |
| 3 | `src/components/index.ts` | modified — append the component + its prop types + `TablePaginationPlacement` | ~+9 |
| 4 | `src/lib/index.ts` | modified — append `tablePageRange` + shapes | ~+10 |
| 5 | `src/index.ts` | modified — enumerate the new `./lib` names (this barrel enumerates, it does not star) | ~+8 |

**Source estimate: 5 files, ~245 lines.** Tests and the paper trail are excluded per the runner's
rule. The revision adds no file — the second bar is a branch inside the one component (§3.2.1), which
is the whole reason it was designed that way rather than as a second export.

### 6.1 The export additions — additive, nothing moved, nothing removed

```ts
// src/components/index.ts — beside the existing Table block
export {
  TablePagination,
  type TablePaginationProps,
} from "./TablePagination";

// src/lib/index.ts, and enumerated again in src/index.ts
export {
  TABLE_PAGE_SIZES,
  tablePageRange,
  type TablePageState,
  type TablePageRange,
} from "./table-paging";
```

Collision check against everything the barrels export today: no existing name begins `TablePage`,
`TABLE_`, or `tablePage`. `Table`, `TableRow`, `TableHead`, `TableCell`, `TableContainer`,
`TableSkeleton` and `SortDirection` are all untouched and none is shadowed. `PageRange` was
deliberately **not** used as the type name — `TablePageRange` is unambiguous at the package root.

### 6.2 Files deliberately NOT touched

| File | Why |
|---|---|
| `src/components/Table.tsx` | The two bars sit beside the table — one above, one below. Do NOT fork the table, wrap it, or give it a prop |
| `src/components/DataTableToolbar.tsx`, `src/lib/table-controls.ts` | Untouched under option (a). No existing sort/filter/search/empty-state behaviour changes — explicitly out of scope. **The top bar is a sibling row, not a new slot on the toolbar** (§1.1) |
| `package.json` | **No new dependency.** `Select`, `Button` and `lucide-react` chevrons are all already here. No new token: every class used exists in `tokens.css` and is already used by `Select`/`Button` |
| `vitest.config.ts` | `tests/components/**` already globs what I will add |
| Anything under `bananaworld-dc/`, `-crm/`, `-org-admin/`, `-rms/` | Not this repo, not this lane. **No consumer pin moves** |
| `runs/epic-*/`, `runs/current/epic-plan/`, any `milestone-NN/` | A closed epic is immutable. `runs/epic-020/` is cited nowhere and written to nowhere |

## 7. 🔴 CROSS-APP INTERSECTION MAP

**Five seams. Not "none".**

### S-1 — This package writes the control; four apps read it, each on its own clock

**Writer:** this change, in this repo. **Readers:** DC, CRM, org-admin, RMS — **only after each
bumps its own pin, in its own change.** This change declares no paged list anywhere and edits no app
file. Nothing renders differently in any app on the day this merges.

⚠ **Revision 2 adds a placement obligation to this seam.** The owner's layout is two bars, and the
package cannot enforce that a consumer renders both — a consumer that renders only the top bar is
still valid code. So "top bar above the table, bottom bar below it" is a **consumer instruction**,
carried in the component's fenced comment and repeated in the developer handover alongside the §2a
contract. CR-DC-052 is the first to owe it.

### S-2 — 🔴 SHIPPING IT IS TWO STEPS, NOT ONE

Consumers pin this package to an **exact commit** (DC currently `365be65`). Landing the control here
does **nothing** for DC until **DC bumps its pin**, against the **merged sha on `main`, never a
branch sha** (KI-M001E19-002 is that exact mistake on record). Therefore:

> **CR-DC-052 is not unblocked when this merges.** It is unblocked when this merges **and** DC's pin
> bump merges. Two changes, in that order, in two different lanes.

Nobody may report CR-DC-052 as ready on the strength of this change alone. This sentence is repeated
verbatim in the developer handover at close.

### S-3 — 🔴 The client-side-narrowing seam (the §2 trap), stated as a handoff

**Writer of the contract:** this package (§2a). **Owner of obeying it:** every consumer that pages
on the server — CR-DC-052 first. **What this change does NOT do:** enforce it. Under option (a) the
package cannot detect that a consumer has combined server paging with `useTableControls`; the
contract is prose plus a fenced comment. Under option (b) the seam moves inside this package and
becomes a mode. **The owner's answer to decide-point 2 is the answer to this seam.**

### S-4 — org-admin drives the controls engine from its own UI

Four org-admin screens use `useTableControls` and render their own controls, never
`DataTableToolbar` (CR-003 §1.2). They are unaffected — they import nothing this change adds — but
they are the reason option (b) is bigger than it looks: a controlled mode on the *hook* would reach
them, not just the toolbar. **Named, not solved.**

### S-5 — No database seam anywhere

This package has no store and adds no query, migration or column. `totalCount` and `page` are
inputs. The nearest thing to persistence is the §5 warning that a consumer's total must carry the
same scope filter as its page query — and that lives entirely in the consumer.

### Register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo and there is no
`governance/` directory** — verified by glob, and the same finding CR-DESIGN-SYSTEM-001 recorded as
D-12, -002 as D-10 and -003 as §7. **Fourth change running to raise it.** Creating one is a
governance decision, not part of this change; the seams above are the record.

## 8. Testing

### 8.1 Provable here — `pnpm test` + `pnpm typecheck`

Record the baseline before any edit (last known: **189 passed / 11 files**, SESSION_HANDOVER).

**`tests/lib/table-paging.test.ts` — the arithmetic, written first:**

1. Each of the four page sizes: `TABLE_PAGE_SIZES` is exactly `[25, 50, 100, 200]`, and a range at
   each size reports `from`/`to`/`pageCount`/`offset` correctly.
2. **Exact multiple** — `total 100, size 25`: `pageCount 4`; page 4 → `76–100`, `isLast true`; there
   is **no** empty fifth page.
3. **Remainder** — `total 312, size 25`: `pageCount 13`; page 13 → `301–312`, twelve rows, never
   padded to 325.
4. **Total zero** — `pageCount 1`, `from 0`, `to 0`, `isFirst` and `isLast` both true.
5. **Total 1**, and **total < pageSize** — one page, `1–1` / `1–n`, both arrows dead.
6. First page → `isFirst true`; last page → `isLast true`; a middle page → both false.
7. `offset` equals `(page - 1) * pageSize` on every case above, and `offset + 1 === from` whenever
   `total > 0` — the invariant that keeps the strip and the query in agreement.
8. Junk input clamps and never throws: page 0, page −5, page 9 of 4, `NaN`, `Infinity`, a
   non-integer, `pageSize 0`, a negative total.

**`tests/components/TablePagination.test.tsx`:**

9. Each page size renders in the picker and **reports** correctly: opening the picker and choosing
   100 emits exactly `{ page: 1, pageSize: 100 }` — one call, both fields, page reset.
10. **First page disables Previous**; **last page disables Next**; `total 0` disables both.
11. Next on page 1 emits `{ page: 2, pageSize }`; Previous on page 2 emits `{ page: 1, pageSize }`.
    A disabled arrow emits **nothing** when clicked.
12. **The range text at every boundary**: `Showing 1–25 of 312`, `Showing 301–312 of 312`,
    `Showing 76–100 of 100` (exact multiple), `Showing 0 of 0` (zero), `Showing 312–312 of 312`
    (single row on the last page).
13. The range text is reachable as `getByRole("status")` and its accessible text **equals** its
    visible text — the "not an aria afterthought" rule, asserted rather than assumed.
14. Keyboard-only, via `@testing-library/user-event`: Tab reaches the picker, then Previous, then
    Next, in visual order; Enter on Next pages forward; a `disabled` arrow is **skipped** by Tab.
15. The picker has an accessible name (`Rows per page`) and is announced as a combobox — the
    "labelled control" requirement.
16. A stale page (9 of 4) renders page 4's range with Next disabled and emits **no** callback on
    mount — the §3.1 no-self-correction rule, pinned so nobody "helpfully" adds it.
17. Barrel proof: the component, `tablePageRange` and `TABLE_PAGE_SIZES` all import **from the
    package root** (`../../src`), not from the deep file.

**The two-placement specs (new in revision 2 — the owner's layout):**

18. `placement="top"` renders the picker; **`placement="bottom"` renders no picker at all** — asserted
    by absence, so a future tidy-up cannot quietly add a second one.
19. Both placements render working Previous / Next: `placement="bottom"` on page 2 emits
    `{ page: 1, pageSize }`, and its disabled states match the top bar's on the same props.
20. **Exactly one live region.** Rendering both bars with the same props yields exactly **one**
    `getAllByRole("status").length === 1`, and it is the top one. This is the assertion that stops
    a screen reader announcing every page change twice.
21. The bottom bar's range text (option C only, if chosen) is present as **text** and is **not** in a
    live region.
22. The two bars are distinguishable: `getByRole("navigation", { name: /end of list/i })` finds the
    bottom bar and not the top one.
23. Keyboard order across both bars: with the two bars rendered around a table, Tab reaches the top
    picker → top Previous → top Next → (the table's own content) → bottom Previous → bottom Next.
    No positive `tabIndex` is used anywhere — document order is the order.

**The untouched proof — this is the additive claim:**

24. `pnpm test` runs the **existing** `Table`/`DataTableToolbar`/`table-controls` specs **unmodified**
    and all 189 still pass; the committed `DataTableToolbar.test.tsx.snap` hash is **byte-identical**
    to `HEAD` (CR-003's method, `ce7bd849…` recorded there).
25. `git diff --stat` on `src/` shows **zero deletions and zero modifications to existing lines** —
    only two new files and three appended barrel blocks. Any deviation is itemised line by line in
    `changed-files.md`, and I expect none.
26. **Standalone-build proof:** `pnpm typecheck` (`tsc --noEmit`, no app path alias, so an `@/…`
    import cannot resolve) plus the source-scan spec CR-002 shipped, applied to the two new files.

### 8.2 NOT provable here — handed over, not hidden

**DC's, CRM's, org-admin's and RMS's suites cannot be run from this sandboxed worktree** — the same
limitation CR-DESIGN-SYSTEM-001, -002 and -003 each recorded (SESSION_HANDOVER §7). Any claim that a
consumer suite was executed from here would be a fabrication and will not be made. The argument that
every consumer is unaffected rests on §1.1 — **no existing symbol is touched** — which is checkable
by anyone from the diff alone, and does not need a consumer suite to be believed.

Also not provable here: that the control is *usable* at 200 rows against real data. It renders four
numbers; the rows are the consumer's. CR-DC-052 verifies that.

## 9. Decisions

| # | Decision | Rationale |
|---|---|---|
| D-1 | **This is not a performance change and no artefact may claim it is** | Nothing is slow today; the owner said so. An unverifiable claim cannot pass the close gate |
| D-2 | **Option (a): the strip is presentation only; the trap is answered by a written contract.** The owner may choose (b) at the gate | (b) redesigns a live shared toolbar for a caller that does not exist yet, and cannot answer where `optionsFor` derives its options under server paging (§2b). Adding (b) later is itself additive |
| D-3 | **(a) and (b) are never mixed** | A half-controlled toolbar — some narrowing local, some emitted — is the worst of the three and the hardest defect to see |
| D-4 | **New files only. `Table.tsx`, `DataTableToolbar.tsx` and `table-controls.ts` are not edited** | The strongest available additive proof: no existing symbol is called, widened or defaulted differently |
| D-5 | **One callback, `onChange({ page, pageSize })`, not two** | Makes a stale page against a new size unrepresentable, and gives the consumer's fetch effect one dependency. No existing caller constrains the shape |
| D-6 | **Changing the page size returns to page 1** | Keeping the first visible row requires stable row identity, which a server re-query does not give. Predictable beats clever in a control four apps share |
| D-7 | **The control clamps for rendering and never calls back to correct its parent** | A callback fired during render is a re-render loop and a lie about who owns the state |
| D-8 | **`Showing 312–312 of 312` is left literal, not collapsed** | `Showing 312 of 312` reads as a count, not a position. Ambiguity in a shared control is worse than an ugly dash |
| D-9 | **Disabled arrows carry no tooltip; the adjacent status text is the reason** | UX-DS-003's tooltip rule is met by text that is inches away and screen-reader-readable; a tooltip on a disabled button needs a pointer-event wrapper this control should not grow |
| D-10 | **`role="status"` on the range text, whose announced text equals its visible text** | Paging replaces rows silently; the range is the acknowledgement. Same string both ways — the opposite of an aria afterthought |
| D-11 | **The picker is this package's Radix `Select`; the arrows are `Button`** | No new dependency, no second idiom, and nothing hand-rolled. Radix ships no pagination primitive, so the rule bites only on the picker |
| D-12 | **`offset` is part of `TablePageRange`** | One place computes what the strip says and what the query asks for, so they cannot disagree. Sixteen hand-rolled `(page-1)*size` are sixteen off-by-ones |
| D-13 | **No `variant` prop — one layout is built.** ✏️ *Amended in revision 2:* the component does take a `placement` (`"top"` \| `"bottom"`, default `"top"`) | A style variant would be anticipatory configurability and Stage 05 would remove it. `placement` is different in kind: the owner's approved layout **has** two positions, so the component must know which it is drawing. It is the layout, not a choice within it |
| D-18 | **The two bars are one component rendered twice, not two exports and not a table wrapper** | Same props object, so the bars cannot disagree about the page; one copy of the arithmetic; `Table` keeps its neighbours out of its business |
| D-19 | 🔴 **Exactly one live region per list — only `placement="top"` carries `role="status"`** | Two bars announcing the same range would say everything twice on every page change. Asserted by spec 20, not left to care |
| D-20 | **The picker renders only in the top bar; the bottom bar is arrows only** | The owner put the picker at the top right. Two pickers would be two sources of truth for one number. Asserted by absence (spec 18) |
| D-21 | **The top bar is a sibling row between the toolbar and the table — `DataTableToolbar` gains no slot and no prop** | Putting it in the toolbar would edit the most-depended-upon component in the package (11 call sites, three apps) to achieve a layout that right-alignment achieves for free |
| D-14 | **Per-user / per-list page-size memory is NOT built** | Explicitly out of scope. Raised as Q1 for the owner instead of smuggled in |
| D-15 | **`uiBearing: true`** | An operator reads a new line of text and picks a page size. Three mockups + a comparison page |
| D-16 | **`epicRecommended: false`** | One control, one pure helper, five files. No new service, integration, tenancy or authorisation model, and it does not decompose into five controlled units of work |
| D-17 | **No consumer pin is bumped and no consumer file is edited** | Consumers move their own pins in their own changes, against the merged sha |

## 10. Open questions

1. **(For the owner — the brief's decide point 1.)** ✏️ *Rewritten in revision 2.* The arrangement is
   now settled by the owner's instruction: picker top right, arrows top right and bottom right. What
   is still open is where the `Showing 1–25 of 312` line sits — A (top-left of the top bar), B (in
   the right-hand cluster), or C (at both ends). **A is recommended.** Everything else in this plan
   is independent of the answer.
2. **(For the owner — the brief's decide point 2, and the one that changes the estimate.)** Option
   (a) written contract, or option (b) controlled toolbar mode? (a) is recommended; §2 states both
   honestly, including what (a) costs.
3. **(Raised, deliberately not built — D-14.)** Should a person's chosen page size be remembered
   between visits? The request puts it out of scope and this plan builds none of it. It is worth
   knowing that if the answer is ever yes, CRM already persists per-rep view state (CR-CRM-011) and
   that is where the pattern would come from — a separate change, not this one.
4. **(Non-blocking, flagged for the record — §1.2.)** The request says "the CRM uses neither yet";
   CR-DESIGN-SYSTEM-003 read CRM's `AvailabilityView.tsx` rendering `DataTableToolbar` with five
   filters. Nothing in this change depends on which is right, but a later session must not inherit
   the claim unchecked.
5. **(Non-blocking, carried for the fourth time.)** The cross-system change register still does not
   exist in this repo.

## 11. Risks

| Risk | Reality |
|---|---|
| **A search box that hides matching records** | The real risk, and it lands in the consumer under option (a) (§2, S-3). Named on the owner's card in plain words, written into the source, the handover and the debt file. Option (b) is the alternative and the owner chooses |
| Someone reports CR-DC-052 unblocked when this merges | **It is not** (S-2). Two steps: merge here, then DC bumps its pin against the merged sha. Stated on the card, in the plan and in the handover |
| A consumer's `totalCount` is unscoped and leaks a number | Real, and outside this package (§5). Named in the consumer obligation so CR-DC-052 meets it deliberately |
| The plan drifts into claiming a speed fix | D-1. Nothing is slow; no artefact may say otherwise |
| An existing screen changes | No existing source file is edited (§1.1) and the toolbar snapshot hash is asserted identical (§8.1 spec 24). This is the cheapest additive proof this package has ever had |
| **Both bars announce, so a screen reader says everything twice** | The real new risk introduced by the owner's two-bar layout. Answered by D-19 and pinned by spec 20 — exactly one `role="status"`, on the top bar |
| **A consumer renders the bottom bar only, and gets orphan arrows with no picker and no count** | `placement` defaults to `"top"`, so the lazy call renders the complete bar. A bottom-only list is a deliberate act, and the handover says the bottom bar is a companion, never the whole control |
| **Someone "simplifies" the two bars into a toolbar slot** | D-21. That edit reaches 11 live call sites to save one right-aligned row, and is out of scope in writing |
| The last page pads to a full page | §3.1 rules + specs 2, 3 and 12 pin the remainder and the exact-multiple case, which are the two cases that get this wrong |
| Off-by-one between the strip and the query | D-12: `offset + 1 === from` is an asserted invariant (spec 7), not a convention |
| Scope creep into remembered page sizes, jump-to-page, or a page-number list | Out (D-14, D-13). No prop, no option, no dead code left behind for them |
| A hand-rolled control creeps in | D-11. The picker is Radix `Select`; the arrows are native buttons via `Button` |
| An app import sneaks into the package | `tsc --noEmit` with no alias cannot resolve `@/…`, plus the source-scan spec (§8.1 spec 26) |
