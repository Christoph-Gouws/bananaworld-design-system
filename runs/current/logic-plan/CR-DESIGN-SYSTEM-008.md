# Logic Plan — CR-DESIGN-SYSTEM-008 — the grid controls: sort in the header, group in a strip, filter under the headers, columns in the header's own menu

> **Raised by:** Bananaworld-DC, EPIC-028-M-02 (`DEP-028-02`). The consuming app's owner settled the
> interaction model on 2026-09-04 (OD-RP-6..OD-RP-9) and approved the milestone's logic plan on
> 2026-09-05. This change is the package half of that milestone.
>
> **Gates:** no migration (this package has no database). No mockup gate of its own — the drawing was
> approved in the consuming app (`runs/current/mockups/EPIC-028-M-02/option-a.html`, owner pick
> 2026-09-05) and this change builds it.
>
> ⚠ **THE NUMBER.** The consuming app's plan called this `CR-DESIGN-SYSTEM-005`, reading `src/index.ts`
> from the SHA it had pinned (`06334768`). That pin is three changes stale: `-005`, `-006` and `-007`
> have all landed since. Corrected to **`-008`** against `main` on the remote, which is the standing
> rule — an approved plan is approval to build, not proof its identifiers are still free.

---

## 1. What this is, in one paragraph

Five new exports that let a consuming app put a table's own controls **on the table**: a column header
that sorts when you click it and can be dragged, the menu that header opens, a strip above the grid
you drag a header into to group by it, a filter row that sits directly under the headers, and the
pure arithmetic all four run on. Plus one more that is not a grid control at all: the header
date-range chrome, promoted out of the consuming app.

**Everything is additive.** No existing export changes signature, and a consumer that moves its pin
and adopts none of this sees no behaviour change.

---

## 2. Why these belong in the package and not in a page

The consuming app's guardrail G6 — *one chassis, not a second one*. It has **seventeen document
lists** on `DataTableToolbar` and **ten reports** that were never on anything. If the reports get a
column chooser built inside a page, the estate ends up with two table experiences and the module has
made things worse. A column chooser, a grouping strip and a filter row are **shared table controls**,
and shared controls belong here (TECH-CON-004, ADOPT never fork).

⚠ **`DataTableToolbar` IS NOT REPLACED AND IS NOT DEPRECATED.** The seventeen lists still run on it.
Whether they adopt the grid is that app's own decision, scheduled for a later milestone of its epic
and not taken here. Asserted in `tests/components/Grid.additive.test.tsx`.

---

## 3. The four mechanics — settled by the consuming app's owner, transcribed not re-derived

| Mechanic | Behaviour | The rejected alternative |
|---|---|---|
| **Sort** | Click the header → ascending; again → descending; again → **off**. **Shift-click** adds a second key with **1 / 2 markers** in the headers. The arrow lives *in* the header. | ❌ a separate Sort control |
| **Group** | **Drag the header itself** into a strip above the grid. ✕ on the chip ungroups. Each chip carries its own **Σ** menu. | ❌ a "Group by" dropdown |
| **Filter** | A **row directly under the headers**, one cell per column, in the shape the column declares. | ❌ chips in a toolbar behind "+ Filter" |
| **Columns** | **Right-click the header** (or press its ⋯) → sort · group by this · pin · hide · a **searchable checklist** of every column. Drag headers to reorder. | ❌ a token picker in a side panel |

🔴 **The rejected alternatives were drawn, shown and refused** — in the owner's words, they reproduced
a report-builder UI, "which is not the way that a report should be done". The fault named was putting
the controls in a **panel beside the table**. Nothing here may drift back towards one.

---

## 4. What is added

### 4.1 `src/lib/grid-view.ts` — the pure arithmetic

`gridSortToggle` · `gridSortPosition` · `gridColumnOrder` · `gridFilterSet` · `gridFilterIsEmpty`,
plus the shapes: `GridSort`, `GridGroupLevel`, `GridFilterValue`, `GridFilterValues`, `GridStoredView`.

🔴 **The shapes are declared here because the CONTROLS own them.** A consumer that re-declared "what a
two-column sort looks like as data" would drift from the control the day a third key became possible,
and a stale mirror of a control's state is a defect class the consuming estate has already paid for
(its CR-DC-049). `GridStoredView` is declared but **nothing here stores it** — persistence is the
app's feature, with its own table, permissions and scope.

### 4.2 `src/components/GridHeadCell.tsx` + `GridHeaderMenu.tsx`

The header cell renders **inside `TableHead`**, so the frame, padding, border and type all come from
the estate's own table rather than a second recipe. 🔴 **`TableHead`'s own `sortable` prop is untouched
and unused here** — it renders a chevron button and knows nothing about shift-clicking, order markers
or dragging. Every existing caller renders identically.

⚠ **At most ONE pinned column, and that is a decision rather than a staging post.** Stacking sticky
columns needs each one's rendered WIDTH to compute the next one's `left`, which a presentation
component can only get by measuring after paint — a resize observer per header and a visible jump on
first render. One pinned column needs no arithmetic (`left: 0`), covers the case the drawing shows,
and cannot be subtly wrong.

### 4.3 `src/components/GridFilterRow.tsx`

One `<th>` per column, rendering `text` · `select` · `numberMin` · `dateRange`. Typed cells are
**debounced**; every cell emits the **whole** filter state, never a patch — a control that emitted
"here is what changed" would make every consumer write the merge, and two consumers merging it
differently is how a toolbar's idea of the query and the query come apart.

### 4.4 `src/components/GridGroupStrip.tsx`

The drop target, the chips (level number · grip · label · **Σ** · ✕) and the prompts. The Σ belongs to
the **level**, which is the whole point of the ruling: two levels can subtotal differently. A
**non-additive column is offered DISABLED, labelled "not a number"** — hiding it would leave a reader
wondering where their percentage column went; offering it enabled would let them add up a ratio.

⚠ **`maxLevels` is the CONSUMER's number.** This package renders the limit and refuses a drop past it;
it does not decide what the limit is. The consuming app declares it once and its own server enforces
it independently — a bound enforced only in a browser is not a bound.

### 4.5 `src/components/DateRangeChrome.tsx`

A date range that lives in a screen's **header**, not in its filters. Promoted out of the consuming
app, where it was DC-local only because no session can push to a sibling repository.

🔴 **It holds no calendar arithmetic, no clock, and no idea what a "quick range" means.** Every string
it prints is handed to it. That is not squeamishness about scope: resolving "last 30 days" needs a
clock read in the DEPOT's zone (the consuming estate has paid for a wrong-zone day five times) and
applying "both boxes empty" needs the screen's own default. A control that resolved either itself
would be a second definition of both. What moved is the **look**; what stayed is the **meaning**.

⚠ **The menu drops out of the button** (`sideOffset={-1}`, squared bottom corners on the open
trigger). That is the owner revision of 2026-09-05 — *"any field menus show up as drop down menus not
popups"* — and it is why this is a `DropdownMenu` rather than a `Popover`. Do not improve it into a
floating card.

---

## 5. What is NOT added, and why

- **No data fetching, no query building, no permission or scope logic** (TECH-COMP-003 / ADR-001). The
  controls fire callbacks; the consuming app decides what a column MEANS and what its value does.
- **No persistence.** `GridStoredView` is a shape, not a store.
- **No grouping or subtotal MATHS.** The consuming app's own pure engine computes those, on its server,
  so its screen and its PDF render off identical arithmetic. This package renders the answer.
- **No change to `DataTableToolbar`, `Table`, `TableHead`, `TableRow`, `TableCell` or
  `TablePagination`.** Asserted, not assumed.

---

## 6. Risk, and how it is contained

| # | Risk | Containment |
|---|---|---|
| **R-1** | 🔴 **A consumer breaks on the pin bump.** Five apps pin this package by sha, and no session can read a sibling consumer to find out what it broke. | The change is **incapable** of breaking one: every new name sits beside the old, no existing signature moves, and `Grid.additive.test.tsx` asserts the untouched primitives' behaviour rather than snapshotting their markup. |
| **R-2** | A grid header quietly becomes a second `TableHead`, and the two drift. | `GridHeadCell` renders **inside** `TableHead` rather than beside it. A token change moves both. |
| **R-3** | The rejected side-panel pattern grows back, one prop at a time. | Written into this file and into the components' own headers, in the owner's words, with what was refused and why. |
| **R-4** | A Radix `DropdownMenu` trigger with `asChild` silently fails to open. | The standing harness note applies: the trigger child spreads its props. Every menu in this change is **pressed** in the suite, never only scanned. |
| **R-5** | ⚠ **The grid's own filter row could be mistaken for the report's date range.** | They are different exports, and the consuming app's suite asserts the report-level range is **not** one of the filter cells (its OD-RP-7). |

---

## 7. Proof

`tests/components/grid-view.test.tsx` — the arithmetic, including the **three-stop sort cycle** (a
two-stop cycle can never return a table to its own order) and the **single sort shows no number** rule.

`tests/components/Grid.test.tsx` — every mechanic **pressed**: header click and shift-click, the drag
that carries a column key, the strip's drop and its refusal at the limit, the per-level Σ with a
disabled non-measure, the debounced filter row emitting one whole state for four keystrokes, the
menu opened from the ⋯ **and** from a right-click, and the checklist's search scoped to one opening.

`tests/components/Grid.additive.test.tsx` — the additive guarantee, as behaviour rather than snapshots.

⚠ **These controls are also driven end to end by the consuming app's own suite**
(`tests/unit/reports/report-grid-control.test.tsx` in Bananaworld-DC), which is a second, independent
exercise of the same components through a real report.
