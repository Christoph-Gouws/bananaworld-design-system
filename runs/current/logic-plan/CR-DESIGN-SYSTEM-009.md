# CR-DESIGN-SYSTEM-009 — a filter cell that holds several values, and a compact way to read the grid

> Logic plan. Written 2026-09-09 against `change/cr-design-system-009`, off `main` @ `6ed975d`
> (CR-DESIGN-SYSTEM-008, PR #20). **Revised three times the same day:** first after the owner's note
> about column fields wrapping (§C), then after the owner picked **tick-list C, density C,
> long-values 2**, and now after his third note — *reports should just OPEN smaller*, and *columns
> must not all be equally narrow*. Every option in this plan is resolved to a single answer and
> **nothing is left for the owner to choose.** **Nothing has been built.** No file under `src/` or
> `tests/` was touched in this session.

<!-- OWNER-BRIEF-START -->

**What changed since you last read this**

- *No value wraps onto a second line any more.* Every one stays on a single line.
- *You chose C, C and 2.* One "Select all" tick carrying the count; the smaller, tighter report; a
  too-long value cut with a "…" and shown whole when you hover it.
- *Reports just open smaller.* Settled — no switch, nothing to remember, and nothing else in the
  business moves.
- *Columns are no longer all the same width.* Each gets one of three sizes: roomy for names and
  descriptions, ordinary for most things, tight for dates, references and numbers.

**What you'll be able to do**

Tick as many things as you like at once instead of one at a time — the list stays open while you
tick, and one tap takes everything or clears it. And a report opens smaller and tighter, so far more
of it fits on the screen, with the columns that hold names still given the room to be read.

**One assumption to check**

Names and addresses get the roomiest columns; dates, references and numbers the tightest. Once you
see a real report, name any column you want changed — that is a small adjustment, not a rebuild.

**What is not included**

Making the report wider on screen — that is the report screen's own job and follows separately. Nor
dragging a column's edge to resize it yourself.

**Risks**

Low. Reports you have saved or shared keep working exactly as now. The tick-lists on other screens
keep their current wording until each screen chooses to match, so nothing moves under you.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. What this change is, in one line each

| | |
|---|---|
| **A** | `GridFilterRow`'s `SelectCell` learns to hold SEVERAL option ids, as a Radix `DropdownMenu` of `CheckboxItem`s, reusing the shape and the trigger arithmetic of the `MultiSelectFilterControl` this package already ships. Top row = **the owner's option C**: one tri-state "Select all" tick carrying "3 of 12". |
| **B** | The table family (`Table` → `TableHeader` / `TableHead` / `TableRow` / `TableCell`, plus `GridHeadCell` and `GridFilterRow`) gains a `compact` density, asked for ONCE on `Table` and read by all of them. **Pinned to the owner's option C** — one scale, no variants left open. |
| **C** | A cell's value stays on ONE LINE: `Table` gains a `wrap` switch. **Pinned to the owner's option 2** — a value too long for its column is CUT with an ellipsis and recoverable on hover. |
| **D** | **New in revision 3.** Cutting needs a width to cut at, and the owner has ruled that width must NOT be the same for every column. So the width is a **three-step named scale declared per column** (`narrow` / `medium` / `wide`, plus `full` for "never cut me"), not one number for the whole table. |
| **Not this change** | The report's WIDTH. `bananaworld-dc`'s shell caps content at `max-w-[1440px]`; that is DC's file, DC's lane, DC's change. |
| **Not this change** | Any consumer pin bump. DC moves its own pin against the MERGED `main` sha, never a branch sha (KI-M001E19-002). |

All four parts are **strictly opt-in**. A consumer that moves its pin and declares nothing new
renders byte-identically: no `multiple` flag on a filter cell def, no `density` prop, no `wrap` prop,
no `width` prop, no change.

🔴 **"Reports just open smaller" is DC ALWAYS ASKING, never this package's default moving.** The
owner's third note settles OQ-5: there is no reader-facing density switch, and the report opens
compact every time. That is `density="compact"` written once in DC's `ReportGrid` — **the package
default stays `"default"`**, because the CRM, RMS, org-admin and Manga Verde render tables from these
same parts and none of them asked to shrink. Moving the default would be the lane rule broken in the
one way that is invisible until four apps bump their pins.

---

## A. The multi-value select filter

### A.1 The value-shape route taken, and why

`lib/grid-view.ts` states in its own header (lines 16-18) that the filter value shapes are this
package's to declare, so the shape decision is made here and the consumer's parser is built to it.

**Route taken: widen the existing `select` arm with ONE optional field. No fifth kind.**

```ts
// lib/grid-view.ts — the select arm, after
| {
    readonly kind: "select";
    /** The FIRST chosen id in displayed-option order. Derived, never authored — see gridFilterSelect. */
    readonly value: string;
    /** Present ONLY when two or more are chosen, and then it holds ALL of them, values[0] === value. */
    readonly values?: readonly string[];
  }
```

Three routes were considered:

| Route | Verdict |
|---|---|
| A fifth `kind: "multiSelect"` value + def kind | **Rejected.** DC declares **27** columns as `kind: "select"` in `src/lib/reports/columns.ts` alone (135 occurrences across 38 DC files), shaped in `src/components/reports/grid-props.ts:66-77`. A fifth kind makes every one of them a migration on both sides of the wire, and every stored `f_room=cold-1` a value of a kind that no longer exists. |
| Widen `value` to `string \| readonly string[]` | **Rejected, and this is the one that looks cheapest.** It is a breaking change to an EXPORTED type in the read direction. DC's `ReportGrid` hands `onChange`'s `GridFilterValues` straight into its own `ListFilterValues` (`ReportGrid.tsx:257`), and its `appendFilters` calls `value.value.trim()` (`grid/grid-state.ts:88`, read this session). A union there fails DC's `typecheck` the moment it bumps its pin — a consumer that adopts nothing would be broken by adopting nothing, which is exactly what the lane rule forbids. |
| **Add optional `values`** | **Taken.** `value: string` stays required and keeps its meaning, so every existing reader still compiles and still reads a real chosen id. An extra optional property is assignable into DC's narrower `SelectFilterValue` (excess-property checks do not apply to non-literal assignment), so DC typechecks unchanged at its bump. It is also the precedent this package already set: CR-DESIGN-SYSTEM-003's `storedFromFilterValue` writes "a bare string for one value, an array only for two or more, so an older build reads it exactly as it always did" (`lib/table-controls.ts:167-177`). |

**The invariant, stated once and enforced by construction:** `values` is absent for zero or one chosen
id; when present it holds two or more, in displayed-option order, and `values[0] === value`. It is
never authored by hand — the only constructor is `gridFilterSelect`, the only reader
`gridFilterSelected`. Two fields that can disagree is a defect class; the way it is kept out is that
nothing else in this package or in a consumer builds this object.

### A.2 New pure helpers (`lib/grid-view.ts`, exported through `lib/index.ts`)

```ts
/** Every chosen id, whatever the arity. [] for absent, empty, or another kind. */
export function gridFilterSelected(value: GridFilterValue | undefined): readonly string[];

/** The value for a set of chosen ids, or null for none (which gridFilterSet then DROPS). */
export function gridFilterSelect(ids: readonly string[]): GridFilterValue | null;
```

- `gridFilterSet` and `GridFilterValues` are untouched: `gridFilterSelect([])` returns `null`, which
  is already the "drop the key" input (`grid-view.ts:115-124`). One empty state, still `{}`.
- `gridFilterIsEmpty` gains one clause: a `select` is empty when its `value` is blank **and**
  `values` is empty. For every value expressible before this change the answer is bit-for-bit what it
  is today, because `values` did not exist.
- `GridStoredView.filters` needs no edit — it is typed `GridFilterValues` and inherits the widening.

### A.3 The wire encoding this package states (the consumer's parser will be built to it)

**A repeated parameter, in displayed-option order:**

```
one value    f_room=cold-1                     ← byte-identical to what is written today
several      f_room=cold-1&f_room=cold-2&f_room=ripening-3
none         the parameter is absent           ← unchanged
```

Why this one:

- **No escaping, no separator to collide with.** An option id containing a comma or a pipe needs no
  special case, so there is no encode/decode pair to get wrong on one side only.
- **A single value reads identically under BOTH readers.** DC's parser today is
  `params.get(\`f_${column.key}\`)` (`grid/grid-request.ts:225`, read this session); after DC adopts
  it becomes `params.getAll(...)`. For one value `get` returns `"cold-1"` and `getAll` returns
  `["cold-1"]` — so an already-saved view round-trips through the old parser AND the new one to the
  same rows.
- **Saved and shared views on disk are untouched.** DC persists the state as a query string
  (`savedViewDefinition`, `grid/grid-state.ts:151`, consumed by `saved-view.ts:48,156`), and rows
  already exist holding `f_room=cold-1`. Those bytes keep their meaning. `sp.sort()` in that function
  is a key-stable sort, so repeated entries for one key keep their relative order — the chosen order
  survives the sort.
- **The alternative considered and rejected:** a single comma-joined parameter (`f_room=a,b`). It is
  shorter but it is a second escaping contract, and a stored id that legitimately contains a comma
  becomes two filters silently.

⚠ **This package ships NO URL codec for it.** The `f_` prefix, the parameter names and the saved-view
definition are DC's (`GRID_PARAM`, `grid-state.ts:100-120`), and a codec here would have to know
them. The package states the encoding in `grid-view.ts`'s header and supplies the arity helpers; DC
writes `append` instead of `set` and `getAll` instead of `get` in its own change. Recorded as **OQ-2**
in case the owner would rather the package own the codec too.

### A.4 The cell (`components/GridFilterRow.tsx`)

`GridFilterCellDef` gains one optional field:

```ts
/** Let this cell hold SEVERAL options. Default false — the one-value menu, byte for byte. */
readonly multiple?: boolean;
```

- `multiple !== true` → **the existing menu, unchanged code path** (`GridFilterRow.tsx:170-188`):
  plain `DropdownMenu.Item`s, one commit, closes. Not refactored, not "unified" — that is what makes
  byte-identity provable rather than argued.
- `multiple === true` → a `DropdownMenu` of `CheckboxItem`s with `onSelect={(e) => e.preventDefault()}`
  (the one Radix gotcha, already documented at `DataTableToolbar.tsx:395-398`: without it the menu
  closes on the first tick and the whole change is defeated), the **"Select all" master row (§A.5)**,
  the ticks, and the footer count row.
- The trigger stays one line: chosen label + `+N`, then the chevron. It keeps `CELL_BASE`/`CELL_SET`
  (`GridFilterRow.tsx:66-70`) and the `aria-label` it has today, so a set cell still reads as set.
- A cell whose column offers no options still renders disabled, exactly as now.

**Why opt-in rather than "select cells are multi from now on":** if the cell went multi by default,
DC would pick up a menu that can emit two values while its own `appendFilters` still writes one
(`sp.set`, `grid-state.ts:88`) — three ticks on screen, one room in the query, and a total the
manager cannot tell is wrong. Opt-in makes that state unreachable: DC turns `multiple` on in the same
change that teaches its parser `getAll`. It is one line in DC's `filterCells` for all 27 columns.

### A.5 The owner picked C — the tri-state "Select all" row, and how it stays ONE menu

**What C is** (mockup `option-c.html`, `comparison.html` choice 1): the top row is itself a tick.
Unticked ⇒ nothing chosen; ticked ⇒ everything; **a dash while only some are chosen**; and it carries
`3 of 12` at its right edge. Tapping it once takes everything, again clears.

**What ships today on the other filter surface** (`DataTableToolbar.tsx:356-360`, read this session)
is mockup option **A**: a `MultiSelectItem` labelled `All depots` (`allOptionLabel`, line 270-272),
checked when nothing is chosen, whose toggle calls `onChange([])`. C and A differ **only in that top
row** — the ticks, the separator, the footer `N chosen` and the trigger arithmetic are the same.

🔴 **The CR's rule — "do not write a second multi-select menu" — is honoured by extraction, not by
picking the same top row.** The two parts the grid cell must share are **moved, not copied**, into a
new internal module `src/components/MultiSelectMenu.tsx`:

| Extracted | Shape after extraction |
|---|---|
| `multiSelectTriggerLabel` | `(emptyText: string, chosenLabels: readonly string[]) => { text: string; more: number }` — the arithmetic verbatim from lines 277-288: nothing chosen ⇒ the empty text; otherwise the FIRST chosen label **in displayed order**, plus how many more. |
| `MultiSelectItem` | Same component (lines 382-410), plus `size?: "default" \| "compact"`. `"default"` emits today's exact class string, including the `[[data-surface=tablet]_&]` variants. |
| `MultiSelectAllRow` | **New.** The tri-state master row: `checked={all ? true : some ? "indeterminate" : false}` on a Radix `CheckboxItem`, label "Select all", count `N of M`. |

**How the divergence is bounded and eventually closed — additively:**

`MultiSelectFilterDef` gains one optional field, `selectAll?: "allOption" | "master"`, defaulting to
`"allOption"` — which is the exact render shipped today. The grid cell passes `"master"`. So:

- **Nothing an existing caller renders moves.** Every shipped toolbar keeps `All depots`, because no
  caller passes the new field. That is the lane rule satisfied by construction, not by care.
- **There is exactly ONE implementation** of the menu, the item and the arithmetic, with a documented
  two-value top row. The failure the CR names — "two multi-selects that look or count differently"
  because they are two pieces of code — cannot occur.
- **Convergence is a one-line opt-in per consumer, at each consumer's own pace.** DC and the CRM flip
  `selectAll: "master"` in their own changes, against a merged sha, at their own gates. This is what
  the mockup card promised the owner when he picked C ("I would match the other screens' tick-list to
  this afterwards"), expressed as a switch rather than as a promise.
- **The residue is recorded, not forgotten.** Until each consumer flips it, the grid's tick-list and
  the toolbars' read differently in their top row. That goes in this change's own
  `runs/change-NN/technical-debt.md` (never into a closed epic's archive), naming DC and the CRM as
  the two flips owed.

Other details of C:

- The grid cell passes `def.placeholder` as the empty text. DC already sets that to
  `All ${header.toLowerCase()}` (`grid-props.ts:71-74`), which is the same wording `allOptionLabel`
  produces — so the two menus read identically without either one importing the other's label rule.
- **Neither module is added to the public barrel.** They are internal shared parts, as `cn` is.
  Nothing is removed from the barrel and nothing moves.
- The footer keeps the existing wording pattern (`DataTableToolbar.tsx:371-374`): `None chosen` /
  `N chosen`. C's mockup shows `3 of 12 chosen` in the footer; **the master row already carries
  `3 of 12`**, so repeating the denominator in the footer is redundant. Decision: the master row
  carries `N of M`, the footer keeps `N chosen` verbatim from the shipped menu. One count arithmetic,
  one wording, no second vocabulary.

⚠ **A count-first TRIGGER ("3 of 12 rooms") remains NOT proposed.** The owner's C changes the top row
of the open list, not the closed box; the box still reads `Cold room 1 +2` in all three mockups, which
is what `multiSelectTriggerLabel` already produces. Changing the trigger wording would be a rendering
change in shipped CRM/DC screens with no way to make it opt-in per call site cheaply. Recorded as
**OQ-1**.

⚠ **Hand-rolling is out of the question.** The keyboard, the focus trap, the typeahead and the
`menuitemcheckbox` roles are why the Radix primitive exists (standing project rule). The multi cell
is Radix `DropdownMenu.CheckboxItem` end to end, including the tri-state master row — Radix's
`checked="indeterminate"` gives `aria-checked="mixed"` for free, which a hand-rolled dash would not.

---

## B. The compact density — pinned to the owner's option C

### B.1 The mechanism: asked once on `Table`, read by everything under it

```ts
// components/Table.tsx
export type TableDensity = "default" | "compact";
const TableDensityContext = createContext<TableDensity>("default");
export function useTableDensity(): TableDensity;      // additive export
export interface TableProps extends HTMLAttributes<HTMLTableElement> { density?: TableDensity }
```

- `Table` provides the context. A provider renders no DOM node — the same argument
  `RowValignContext` already carries at `Table.tsx:132-137` — so the HTML of an existing table is
  untouched, and the default context value means every class string is byte-identical.
- `GridHeadCell` renders a `TableHead` (`GridHeadCell.tsx:29,146`), and `GridFilterRow` renders its
  `<tr>` inside `<TableHeader>` inside `<Table>`. Both are inside the provider in the React tree, so
  **one switch reaches all of them**. A table that went compact while its filter row did not — tall
  boxes over short rows — is unreachable by construction, not by discipline.
- Naming follows `ListCard`'s existing `density` variant (`ListCard.tsx:26-33`).
- ⚠ `Table` today takes bare `HTMLAttributes<HTMLTableElement>` and is not generic over a props
  interface (`Table.tsx:69`). Introducing `TableProps` is additive — the new interface *extends* the
  attribute set it already accepted, so every existing call site still typechecks.

### B.2 One class per axis — the file's own rule, obeyed

`Table.tsx:100-102` states it: *twMerge keeps the LAST of two conflicting classes, so a second one
emitted anywhere is a silent, invisible override.* So density is **not** an extra class appended to
the existing one. Each element picks **one complete padding/type string** from a two-entry record:

```ts
const CELL_PAD: Record<TableDensity, string> = { default: "px-3 py-2", compact: "px-1.5 py-1" };
```

Nothing merges, nothing overrides, and the `default` entry is the exact string that is there today.

### B.3 What each part emits — ONE scale, the owner's C

| Part | Default (unchanged) | Compact (C) |
|---|---|---|
| `Table` | `text-sm` | `text-xs` |
| `TableHeader` | `bg-surface-muted` | unchanged — it carries no size class |
| `TableHead` | `px-3 py-2.5` + `text-2xs` | `px-1.5 py-1`; **type stays `text-2xs`** |
| `TableRow` | `border-b border-border last:border-0` | **unchanged, deliberately.** The row carries no size class today; its height IS its cells' padding. Inventing a row-level height or a `[&>td]` override would fight the cell's own class — the exact conflict §B.2 forbids. Stated so it reads as a decision, not an omission. |
| `TableCell` | `px-3 py-2` | `px-1.5 py-1` |
| `GridHeadCell` | `px-2.5`, grip `h-3.5 w-3.5`, ⋯ button `h-5 w-5`, ⋯ icon `h-3.5 w-3.5` | `px-1.5`, grip `h-3 w-3`, ⋯ button `h-4 w-4`, ⋯ icon `h-3 w-3` |
| `GridFilterRow` `<th>` | `px-2 py-1.5` | `px-1 py-1` |
| `GridFilterRow` `CELL_BASE` | `h-7 gap-1.5 px-2 text-xs` | `h-6 gap-1 px-1.5`; **type stays `text-xs`** |

Resulting body row height: `py-1` (4+4px) + `text-xs`'s 16px line box = **24px**, against today's
~36-44px. That is mockup C's measured scale (`comparison.html` `.t.cC`: 12px type, 4px/6px cell
padding, 24px filter box) reproduced in Tailwind tokens. Where C's CSS used a 3px pad, `py-1` (4px)
is the nearest token and errs toward legibility; where it used a 9px heading, the heading **keeps
`text-2xs`** — a one-pixel type reduction is not what the owner judged, and it is not worth a new
token (see the caution below).

🔴 **No new design token is introduced.** Every compact class is either stock Tailwind spacing
(`px-1`, `px-1.5`, `py-1`, `h-6`, `gap-1`, `h-3`, `w-3`, `h-4`, `w-4`) or a type token already
emitted by a shipped component (`text-xs`, `text-2xs`). **Caution, found this session and worth
recording:** `text-2xs` is **not defined in this package's `src/lib/tokens.css`** — it resolves in
the consuming app's Tailwind configuration, and has since it was introduced. That is pre-existing and
out of this change's lane; it is the reason compact does **not** reach for a third type step, and the
reason the compact filter cell keeps `text-xs` rather than dropping to `text-2xs`.

`GridHeadCell`'s `className` currently overrides `TableHead`'s horizontal padding (`px-2.5`, line 166),
so it must switch its own value or the header would stay wide while the body shrank.

### B.4 Why `useTableDensity` is exported

DC's report is not built only from this package's cells: `ReportGrid.tsx:239-244` renders a raw `<th>`
for the Actions column with `px-3 py-2`, and `ReportGridRows.tsx` renders group and summary rows.
Without a reader, DC would hard-code a second copy of the density and the two would drift at the first
token change. Exporting the hook is additive (no existing name is shadowed) and it is what makes DC's
half a read rather than a guess. **OQ-3** if the owner's reviewer would rather keep it internal.

---

## C. Values that stay on one line — pinned to the owner's option 2 (cut with an ellipsis)

> *"What I really want to try and avoid is for column fields to wrap. What would be the best way to
> achieve that, for it not to wrap and for it to still show all the columns?"* (owner, plan note 1)
> → answered below. **Plan note 2 chose option 2: cut it with a "…".**

### C.1 What actually wraps today — measured in the files, not assumed

| Part | Whitespace behaviour today | Wraps? |
|---|---|---|
| `TableHead` | `whitespace-nowrap` in its base string (`Table.tsx:191`) | **No** — column headings already never wrap |
| `GridHeadCell` | renders a `TableHead`; label span is `min-w-0 … truncate` (`GridHeadCell.tsx:193-199`) | **No** — but the `truncate` never FIRES, see C.4 |
| `GridFilterRow` cells | fixed-height `flex h-7` box, label `min-w-0 flex-1 truncate` (`GridFilterRow.tsx:66-70, 160, 214`) | **No** — already one line, already ellipsised |
| **`TableCell`** | **no whitespace class at all** (`Table.tsx:269-284`) | **YES — and it is the only thing that does** |

DC's grid adds nothing of its own: `ReportGridRows.tsx:188-201` passes `align`, `numeric`, a sticky
class and an indent `style`, and no whitespace utility. So a long customer name or note becomes a
two-line body cell, and **one such value makes the whole row double height** — which is precisely
what would defeat §B's compact density. The fix therefore belongs on `TableCell`, and the header must
be given the matching width cap or it re-widens the column from above.

### C.2 The honest constraint: not wrapping does not create space

Turning wrapping off moves the overflow from the vertical axis to the horizontal one. Each column
then becomes as wide as its widest value, and a 27-column report exceeds any screen.
`TableContainer` already carries `overflow-x-auto` (`Table.tsx:60`), so it slides sideways rather
than breaking — but "still show all the columns" then means "scroll to reach them".

There are exactly three levers, and no fourth: **cut** (narrow each column, ellipsis), **slide**
(horizontal scroll), **show fewer** (the header menu's column checklist and hide/pin, already shipped
by CR-DESIGN-SYSTEM-008 — no work).

**The owner chose CUT (option 2).** So: the columns are capped so the whole grid fits at the compact
size; the sideways slide stays as the safety net for reports that still overflow; the column checklist
remains the reader's own escape hatch. All three coexist — the choice was only about the default.
**And per his third note the cap is not one number: it is a three-step scale chosen per column
(§C.4), so a customer name is cut later than a reference code and a date is not cut at all.**

### C.3 The mechanism — asked ONCE on `Table`, exactly like density

```ts
// components/Table.tsx
export type TableWrap = "wrap" | "nowrap" | "truncate";
const TableWrapContext = createContext<TableWrap>("wrap");
export function useTableWrap(): TableWrap;      // additive export

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
  /** How every head and cell under this table treats a value wider than its column. Default "wrap" — today. */
  wrap?: TableWrap;
  /** The width step a column gets when it declares none of its own. Default "full" — uncapped, i.e. today. */
  columnWidth?: TableColumnWidth;
}
```

⚠ **Changed in revision 3: the `columnMaxWidth?: number` this section carried in revision 2 is
GONE**, replaced by the named scale in §C.4. It was one pixel number for the whole table, which is
precisely the "all columns equally narrow" the owner rejected, and it forced an inline style whose
precedence against a caller's own `style` had to be reasoned about. The scale is strictly simpler and
does more.

- **The same context mechanism as §B.1**, and for the same reason: the switch must reach the header,
  the body and the filter row together, or the reader gets a half-treated table. It also reaches DC's
  own raw `<th>` (`ReportGrid.tsx:239-244`) and its group/summary rows through `useTableWrap()`.
- **All three values earn their place** — `"nowrap"` is not dead weight now that `"truncate"` is the
  chosen default. DC's `cellRenderers` put CHIPS in cells (`ColourStageCell`, `DrillCell`), and
  `overflow:hidden` would clip a chip's ring or badge. Those columns want **one line and no clipping**,
  which is exactly `"nowrap"` — the per-cell override (`TableHeadProps.wrap` / `TableCellProps.wrap`)
  is how they ask for it.
- **Default `"wrap"` everywhere ⇒ not one existing rendered class moves.** Same additive shape as
  `density`, proven the same way (§4).

**One class per axis — and here the rule bites, so it is stated rather than assumed.** `TableHead`
ALREADY emits `whitespace-nowrap` unconditionally (`Table.tsx:191`), and
`tests/components/Table.test.tsx:459` asserts that head's **exact class string, in order**. Appending
`truncate` next to it would put two classes on the overflow/whitespace axis, and twMerge's resolution
of that pair is exactly the silent invisible override `Table.tsx:100` forbids. So each element picks
one string from its own record — **and the two records have DIFFERENT defaults, because the two
elements start from different places:**

```ts
// A body cell emits nothing on this axis today.
const CELL_WRAP: Record<TableWrap, string> = {
  wrap: "", nowrap: "whitespace-nowrap", truncate: "truncate",
};
// 🔴 A HEAD ALREADY NEVER WRAPS, and that does not change. The table-level switch only decides
//    whether a head TRUNCATES. A shared record with wrap:"" would DROP `whitespace-nowrap` from
//    every existing head — a rendering change, and Table.test.tsx:459 would redden.
const HEAD_WRAP: Record<TableWrap, string> = {
  wrap: "whitespace-nowrap", nowrap: "whitespace-nowrap", truncate: "truncate",
};
```

The head's class is built so the default emits the identical string in the identical position:
`` `border-b border-border ${HEAD_WRAP[wrap]} select-none` ``. `truncate` is deliberately used as the
single Tailwind token rather than its three constituents (`overflow-hidden text-ellipsis
whitespace-nowrap`): twMerge cannot split a token, so it cannot half-override it.

### C.4 The width a column is cut at — a NAMED SCALE PER COLUMN (the owner's third note)

> *"I don't want all columns necessarily to be equally narrow because then that will also look
> awkward. Some columns deserve to be wider, like a customer name for instance."* (owner, plan note 3)

**First, why a width is needed at all.** `text-overflow: ellipsis` fires only when the box has a
definite width. In an auto-layout table a `<td>` sizes to its content, so `truncate` **alone would
never cut anything** — the column would simply grow and the sideways scroll would come back. (This is
also why `GridHeadCell`'s existing `truncate` on its label has never visibly fired: the `<th>` widens
to fit it.) A `wrap="truncate"` that silently cuts nothing is a footgun; a setting named "cut it"
must cut.

**What revision 2 had, and why the owner is right to reject it.** One `columnMaxWidth` number for the
whole table. Under auto layout that is *not* literally "every column the same width" — a date column
still shrinks to its content — but it does mean **every column that is too long is cut at the SAME
place**, so a customer name gets exactly as much room as a note or a reference code. That is the
awkwardness he described, and it is a real one.

**The route taken: three width steps, declared per column, plus an opt-out.**

```ts
// components/Table.tsx
export type TableColumnWidth = "narrow" | "medium" | "wide" | "full";

// One class per axis (§B.2's rule, on the width axis). Every entry is a STATIC string.
const COLUMN_WIDTH: Record<TableColumnWidth, string> = {
  narrow: "max-w-[6rem]",    //  96px — a code, a status word, a date, a count
  medium: "max-w-[11rem]",   // 176px — most columns
  wide:   "max-w-[20rem]",   // 320px — a customer name, an address, a note
  full:   "",                // uncapped: NEVER cut this column (chips, and today's behaviour)
};
```

- **A width class is emitted ONLY where the element is truncating.** Capping a column that is not
  clipping its overflow just makes the value spill visibly out of its cell, so the two belong
  together: under `wrap="wrap"` or `wrap="nowrap"` **no `max-w-` class is emitted at all**. That is
  what keeps every existing render byte-identical, and it also means a chip column needs nothing more
  than the `wrap="nowrap"` it already wanted (§C.3) — there is no second thing to remember.
- **The table-level default is `"full"`, EXCEPT under `truncate`, where it is `"medium"`.** Same
  argument as the sentence above about footguns: a table that asks to cut must cut, even before its
  consumer has assigned a step to a single column. A column that wants more room then says `wide`;
  one that must never be cut says `full` (or simply `wrap="nowrap"`). `Table`'s `columnWidth` sets
  the step for columns that declare none; a `TableHead` / `TableCell` / `GridHeadCell` / filter-cell
  def with its own `width` overrides it for that column.
- **Three steps, not a pixel field.** A design system's job here is to stop 27 magic numbers from
  being invented column by column and app by app — the same argument `ListCard`'s `density` variant
  already won. Three steps are enough to express "roomy / ordinary / tight", which is exactly the
  distinction the owner drew.
- **Static arbitrary values (`max-w-[6rem]`), not spacing-scale utilities (`max-w-24`).** This
  package does **not** depend on Tailwind — it is not in `package.json`; the consumer compiles these
  class strings against its own config, and `max-w-24` exists only in some Tailwind versions.
  A static arbitrary value compiles everywhere and is visible to the scanner. (Contrast
  `max-w-[${n}px]` built by concatenation, which is invisible to the scanner and emits no CSS at all
  — the reason revision 2 needed an inline style, and the reason this revision does not.)
- **A caller can still be bespoke, and wins by construction.** The width class is emitted BEFORE
  `className`, so `className="max-w-[22rem]"` beats it under twMerge — the same precedence rule the
  file already relies on. No escape hatch needs inventing.
- **No inline `style` is written any more**, so the question of whether the package's style clobbers
  DC's group-indent `style` (`ReportGridRows.tsx:198-200`) disappears rather than being managed.

### C.4a How one column's width reaches all THREE of its rows

A column is three elements in three rows: its `GridHeadCell`, its `GridFilterRow` cell, and one
`TableCell` per body row. **If they disagree the widest one wins and the cap is defeated** — a filter
box wider than the cap re-widens the whole column from the header down. So all three take `width`:

| Element | How it gets the width |
|---|---|
| `TableHead` / `TableCell` | new optional `width?: TableColumnWidth` prop |
| `GridHeadCell` | new optional `width?: TableColumnWidth`, passed straight through to its `TableHead` |
| `GridFilterRow` | new optional `width?: TableColumnWidth` on `GridFilterCellDef`, applied to that cell's `<th>` under `truncate` only, like the others. The box INSIDE it already truncates (`min-w-0 flex-1 truncate`, `GridFilterRow.tsx:160`) — the `<th>` only ever needed the ceiling. |

The consumer declares it **once** — DC adds one optional `width` to its own `ReportColumn` descriptor
(`src/lib/reports/column.ts`, which has no width field today, checked this session) and passes
`column.width` at the three call sites it already has. That is DC's change, not this one; the seam is
**S8** below.

⚠ **The desync is the failure mode worth naming.** Three passes from one declaration can be wired to
two of the three. It looks like a package rendering bug (a column that will not narrow) and it is not
one. The package's own test asserts head, filter cell and body cell emit the *same* width class for
the same step; DC's own gate owns the wiring.

**Rejected alternatives, so the choice reads as a decision:**

⚠ **`<colgroup>` / `<col style="width:…">`** — genuinely tempting, because it is HTML's own "this
column is this wide" and would be ONE declaration reaching all three rows. Rejected: under
`table-layout: auto` a `<col>` width is a *suggestion*, not a cap, so it does not reliably drive the
ellipsis; and it is **positional** — the `<col>` list must match the rendered cell order including
DC's leading gutter cells and its raw Actions `<th>`, so a hidden or reordered column silently shifts
every width by one. A per-element prop cannot desync from its own element.

⚠ **`table-layout: fixed`** — would make ellipsis trivially reliable, but it gives every column an
equal share regardless of content unless the consumer declares a width for **all 27**, which is the
owner's complaint restated as a layout mode. Auto layout plus a per-column cap keeps columns
content-sized (a date column still shrinks below `narrow`) AND bounds the long ones. It is also a far
smaller change to a primitive five apps render.

⚠ **Doing it in the consumer instead** — DC could pass `className="max-w-[14rem] truncate"` per body
cell today with zero package change, but the HEAD is `GridHeadCell`'s, so DC cannot cap it, and each
of the four apps would then invent its own numbers. The switch belongs where the header and the cell
meet, which is this package.

⚠ **A `minWidth` as well** — not proposed. It would help a column whose heading is long and whose
values are short, which is not a reported problem, and it is the one addition that could make a
report *wider* than today. Left out deliberately.

⚠ **The one real technical risk in this change, named rather than discovered later.** `max-width` on
a table cell in `table-layout: auto` is honoured for *shrinking* by every current browser when it is
paired with `overflow:hidden` — that is the standard "truncate inside a table" pattern — but it is
weaker than a block box's `max-width`, and a cell with unbreakable content can still push past it.
**The build must verify this in a real browser, not only in jsdom** (jsdom does no layout, so a unit
test can only assert the class, never that the ellipsis appeared). **Named fallback if it does not
hold:** wrap the truncating cell's children in an inner `<span class="block truncate">` carrying the
width class, where `max-width` is fully reliable. That fallback touches only the
`wrap === "truncate"` path, so it cannot move an existing render either way.

### C.5 The whole value is not lost — the hover the owner was shown

When a cell truncates **and its children are a plain string**, `TableCell` sets `title` to that
string, so hovering shows the value in full — the tooltip drawn in mockup option 2. DC gets this with
no work of its own: its grid feeds `renderText(formatCell(column, row))`, which returns a **bare
string** for every non-empty value (`ReportGridRows.tsx:28-31`). Where children are elements, **no
`title` is invented** — a fabricated tooltip reading `[object Object]`, or nothing, is worse than no
tooltip.

Accessibility: CSS truncation hides nothing from assistive technology — the DOM text node is
complete, so a screen reader reads the whole value whether or not it is visually cut. The `title` is
an addition for sighted mouse users, not the accessible name.

⚠ One clipping caveat, recorded rather than discovered later: `overflow:hidden` clips absolutely
positioned children of that cell. Every menu/popover in the grid is Radix and portals to `body`
(DC's row-actions `TableCell`, `GridHeaderMenu`, the filter menus), so none is affected — but a
future inline non-portalled popover in a truncating cell would be. Which is a second reason the
per-cell `wrap` override exists.

### C.6 Deliberately NOT in this change

- **Column resizing by dragging a header edge.** It is the other obvious answer to "make this column
  narrower" and it is a genuinely bigger feature: drag handles and a pointer capture, a width per
  column in `GridState`, that width entering the saved-view definition and therefore the wire format,
  and a reset. It is not needed to stop wrapping. If the owner wants it, it is its own change.
- **A per-column cap the READER sets, or one that is remembered.** §C.4's width is a **declaration in
  the app's own column list** — static, in code, identical for everyone who opens the report. It
  never enters `GridState`, never enters the saved-view definition, and never enters the wire format.
  That is the whole distinction from column resizing above, and it is why the per-column width is in
  and resizing is out (OQ-7).
- **A `minWidth`.** §C.4's last rejection — it is the one addition that could make a report wider.
- **The report's width** (`max-w-[1440px]`) — DC's file, DC's lane.

---

## 2. Cross-app intersection map — who writes, who reads

This package writes no record and reads none: it is pure presentation (TECH-COMP-003 / ADR-001). The
seams are **shape and wire-format** seams, and there are eight.

| # | Seam | Writer | Reader | Decision |
|---|---|---|---|---|
| S1 | **The `select` filter value shape** (`GridFilterValue`) | **This package declares it** — `grid-view.ts:16-18` says the shapes are the controls' to state | DC's `ReportGrid` receives it from `onChange` and stores it in its own `ListFilterValues` | Package writes the shape; DC reads. DC's narrower `SelectFilterValue` still accepts it (optional extra property), so DC compiles unchanged at its bump. DC widens its own type in DC's change. |
| S2 | **The URL wire format `f_<key>`** | **DC writes it** (`gridQuery` / `appendFilters`, `grid-state.ts:88`) and **DC parses it** (`parseGridRequest`, `grid-request.ts:225`) | The package neither writes nor reads a URL | Package STATES the encoding (repeated parameter, §A.3); DC implements both ends in its own change. One value is byte-identical to today's, so the seam is crossable in either order. |
| S3 | **Saved and shared views on disk** (`savedViewDefinition` strings, DC's own table) | DC | DC, and anyone the view is shared with | **Nothing migrates.** Existing rows hold one-value filters and mean exactly what they meant. A view saved with three rooms after DC adopts is read by an OLDER DC build as its first room only — the harmless direction, and DC's `droppedFilters`/`widened` machinery (`table-controls.ts:132-166`, `grid-request.ts:130`) already exists to say so out loud. |
| S4 | **The other four pinned consumers** (CRM, RMS, org-admin, Manga Verde) | — | They read this package | **They adopt nothing.** Neither `multiple`, `density`, `wrap` nor `selectAll` has a value that changes anything until it is passed. Asserted in `Grid.additive.test.tsx`, not hoped for. |
| S5 | **DC's non-package table parts** (the Actions `<th>`, group rows, summary rows, `ReportBoundsChrome`) | DC | DC | The package exposes `useTableDensity` and `useTableWrap`; DC shrinks and un-wraps its own cells with them. A DC screen that goes compact and leaves those at full size is DC's defect to catch at DC's own gate — named here so it is on the record before it happens. |
| S6 | **Which columns may be cut** — the per-cell `wrap` override (§C.3) | **DC decides**, per column | The package renders what it is told | The package sets the table-level default; **DC must opt its CHIP columns (`ColourStageCell`, `DrillCell`) to `wrap="nowrap"`**, or `overflow:hidden` clips them. Stated here because it is the one part of §C a consumer can get wrong silently, and the clipping would look like a rendering bug in this package. |
| S7 | **The tick-list's top row** (`selectAll`, §A.5) | **This package ships both shapes**, defaulting to the one rendered today | DC's and the CRM's toolbars read the default; the grid cell asks for `"master"` | **Nothing moves for anyone.** The grid gets the owner's C; every shipped toolbar keeps `All depots` until DC and the CRM each flip one line in their own change, at their own gate, against a merged sha. The two-menu wording divergence in the meantime is recorded in `runs/change-NN/technical-debt.md`. |
| S8 | **How wide each column may grow** (`width`, §C.4) — new in revision 3 | **This package declares the SCALE** (`narrow`/`medium`/`wide`/`full`); **DC declares which step each column gets** | The package renders the step it is handed | Package writes the vocabulary, DC writes the assignment. DC adds one optional `width` to its own `ReportColumn` (no width field exists there today) and passes it at its **three** call sites — head, filter cell, body cell. ⚠ Wiring two of three defeats the cap silently (§C.4a); DC's gate owns it. The declaration is static code — it never enters `GridState`, the saved view or the wire format, which is what keeps it out of S2/S3 entirely. |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo** — this is the **eighth**
change to raise it. Creating it is a governance decision for the owner, not something a change may
invent, so the seam map above is the record and this change's `runs/change-NN/` output carries it.

---

## 3. Files expected to touch

**Source (8):**

| File | What |
|---|---|
| `src/lib/grid-view.ts` | Widen the `select` arm with optional `values`; add `gridFilterSelected` / `gridFilterSelect`; one clause in `gridFilterIsEmpty`; state the wire encoding in the header. |
| `src/lib/index.ts` | Export the two helpers. Additive. |
| `src/components/MultiSelectMenu.tsx` | **New, internal.** `multiSelectTriggerLabel` + `MultiSelectItem` moved out of the toolbar, plus the new `MultiSelectAllRow` (the tri-state master, option C). |
| `src/components/DataTableToolbar.tsx` | Import the extracted parts; add optional `selectAll` to `MultiSelectFilterDef`, defaulting to today's render; keep a thin wrapper so its output is unchanged. Net: fewer lines, same render. |
| `src/components/GridFilterRow.tsx` | `multiple?` on the def; the checkbox branch in `SelectCell` with `selectAll="master"`; read `useTableDensity` for the cell chrome. **Plus §C.4a:** `width?` on `GridFilterCellDef`, emitted on that cell's `<th>` so the filter box cannot re-widen its column. |
| `src/components/Table.tsx` | `TableDensity`, its context, `useTableDensity`, `density` on `Table`, the two-entry class records on `TableHead` / `TableCell`. **Plus §C:** `TableWrap`, its context, `useTableWrap`, `wrap` + `columnWidth` on `Table`, `wrap` + `width` on `TableHead` / `TableCell`, the **two** wrap records (`HEAD_WRAP` replacing `TableHead`'s hard-coded `whitespace-nowrap` one-for-one, `CELL_WRAP` new), the `COLUMN_WIDTH` record and its context default, and the string-children `title`. |
| `src/components/GridHeadCell.tsx` | Read `useTableDensity` for its own padding and icon sizes. **Plus §C.4a:** an optional `width` passed straight through to its `TableHead` — its existing `truncate` label finally fires once a cap exists. No other §C edit: the wrap treatment is inherited. |
| `src/components/index.ts` | Export `TableDensity`, `useTableDensity`, `TableWrap`, `useTableWrap`, `TableColumnWidth`, `type TableProps`. Additive; no name moves. |

**Tests (5, excluded from the estimate as work that would be done anyway):**
`tests/components/grid-view.test.tsx` (shape + arity + round-trip), `Grid.test.tsx` (the menu: ticks
several, stays open, the master row's three states and its `N of M`, the trigger label),
`Grid.additive.test.tsx` (a def without `multiple`, a `Table` without `density`/`wrap`/`columnWidth`,
a head/cell without `width`, and a `MultiSelectFilterDef` without `selectAll` all render exactly as
today), `Table.test.tsx` (both densities, all three wrap values, **exactly one whitespace/overflow
class and AT MOST one `max-w-` class emitted on every path**, `Table.test.tsx:459`'s exact head
string still green, **all four width steps, `"full"` and every non-`truncate` wrap emitting no width
class at all, a caller's own `max-w-` in `className` beating the step**, the same step producing the
same class on `TableHead`,
`TableCell`, `GridHeadCell` and a filter cell (§C.4a's desync guard), `title` present for string
children and absent for element children), `DataTableToolbar.test.tsx` (+ its snapshot — the
extraction changed nothing).

**Not touched:** `package.json`, `pnpm-lock.yaml` (no new dependency — Radix `DropdownMenu` is already
a direct import in both files), `src/lib/tokens.css` (no new token — §B.3), any `runs/epic-*/`, any
`milestone-NN/`, anything under `runs/current/epic-plan/`, and **anything at all inside
`bananaworld-dc`** (read-only; this session issued reads only).

## 4. How the additive claim will be PROVEN, not asserted

Reusing the harness the handover describes (item 5), which cost ~10 minutes for 1,536 shapes:

1. **Baseline first.** Run `pnpm test` and record the count BEFORE any edit (CR-007 measured 269/14
   after its own additions; re-measure, never quote).
2. **Caller-shape render diff.** Render every existing caller shape of `Table` / `TableHead` /
   `TableRow` / `TableCell` / `GridHeadCell` / `GridFilterRow` / `DataTableToolbar` against
   `git show 6ed975d:src/components/<file>` and against the new one; compare whole `innerHTML`.
   Expect **zero** differences, since every new behaviour is behind a prop that no existing shape
   passes. Any difference is a bug in this change, not a class-order footnote — but classify each one
   anyway (same class set ⇒ order-only ⇒ identical rendering).
3. **`git add` BEFORE any mutation battery.** `git checkout --` restores from the INDEX, and an
   unstaged fix is silently reverted by it (CR-007 `defect-log.md` D-1).
4. **A real-browser check for §C.4**, because jsdom does no layout and cannot tell a working ellipsis
   from an inert class. If the cap does not hold on a `<td>`, take the named inner-span fallback.
5. **Named callers checked, and why each is unaffected** — to be stated explicitly in the QA report:
   DC's `ReportGrid.tsx` (passes no `density`, no `wrap`, no `columnWidth`, no `width`, no `multiple`; its `onChange` target still
   accepts the value), DC's `grid-props.ts` `filterCells` (builds defs without `multiple`), DC's
   legacy list screens and `SalesOrdersListLegacy`/`ReceiptsListLegacy`/… (use `DataTableToolbar`,
   whose render is snapshot-pinned and whose `MultiSelectFilterDef`s carry no `selectAll`), and every
   in-package caller. **CRM, RMS, org-admin and Manga Verde cannot be read from this worktree and no
   claim will be made about running their suites** — the eighth change to record that.
6. **Dependency audit:** reproduce in Node, keep the third sanity check (every parsed advisory id
   non-empty and `/^GHSA-/`), and report both closure sizes (deps-only ≈66, with optional edges ≈106).

## 5. Accessibility

- Multi cell: Radix `DropdownMenu.CheckboxItem` ⇒ `role="menuitemcheckbox"` + `aria-checked`, arrow
  keys, typeahead, focus return to the trigger on `Esc`. The trigger keeps
  `aria-label="Filter by ${def.label}"`.
- The master row uses Radix's `checked="indeterminate"`, which emits `aria-checked="mixed"` — the
  correct reading of "some but not all", and one more reason not to hand-roll the dash.
- The trigger's `+N` is inside the same `<span>` the label is in, so a screen reader reads
  "Cold room 1 +2" as one accessible name; the footer row states "3 chosen" as text.
- Compact density changes padding and type size only — no interactive target loses its hit area
  below the existing filter-row baseline (`h-7` → `h-6` is 28px → 24px on a browser-only surface;
  the `data-surface=tablet` variants are untouched, so tablet targets do not shrink).
- Truncation is visual only; the DOM text node stays whole (§C.5).

## 6. Open questions

| # | Question | Status / recommendation |
|---|---|---|
| OQ-1 | Count-first TRIGGER wording ("3 of 12 rooms") instead of "Cold room 1 +2"? | **No, not here.** Every mockup the owner approved shows the box reading `Cold room 1 +2`, and changing it would move shipped CRM/DC toolbars. A separate estate-wide wording change if ever wanted. |
| OQ-2 | Should this package ship the `f_<key>` URL codec rather than only state the encoding? | **No.** The parameter names are DC's (`GRID_PARAM`); a codec here would import an app's vocabulary into a pure UI package. |
| OQ-3 | Export `useTableDensity` / `useTableWrap`, or keep them internal? | **Export.** DC provably has table parts of its own (`ReportGrid.tsx:239`) that must match. |
| OQ-4 | Two density values or three (`default` / `compact` / `dense`)? | **Two.** One switch with one alternative; the owner's C is `compact`. |
| OQ-5 | Does the reader get a switch, or does the app choose the density? | **ANSWERED by plan note 3 — the app chooses: *"I want reports to just open smaller."*** No reader-facing switch; DC passes `density="compact"` once. The package default does not move (§0). |
| OQ-6 | Cut long values, or keep them whole and slide sideways? | **ANSWERED — cut (option 2).** Truncate + cap is the table default; the sideways slide stays as the safety net. |
| OQ-7 | Should the cut width be per-column rather than one number for the table? | **ANSWERED by plan note 3 — per column, as a three-step named scale (§C.4).** Revision 2 said "one cap" on the grounds that a per-column map is column resizing wearing a smaller hat; **that reasoning holds only for a width the READER sets and the system REMEMBERS**, which is what would drag a width into `GridState`, the saved view and the wire format. A step declared in the app's column list is static code and touches none of them (§C.6). The owner asked for the second thing, not the first. |
| OQ-8 | Does the `max-width` cap hold on a `<td>` in auto table layout? | **A build-time verification, not an owner question** (§C.4). Named fallback recorded; either way it cannot move an existing render. |
| OQ-9 | Which step does each of DC's 27 report columns get? | **DC's, not this package's** — it is the assignment half of seam S8, made in DC's own change against a merged sha. The brief states the assumption the owner can correct (names/descriptions `wide`, most columns `medium`, codes/dates/numbers `narrow`); a column can be moved a step with a one-word edit. |

## 7. Why this is a CHANGE, not an epic

It does not decompose into five controlled units of work. It is four related edits to one package's
existing components, behind optional props that all default to today's behaviour, with no new
service, no integration, no tenancy or authorisation model and no new section of the system.
`epicRecommended: false`. Size stays inside the one-session guide (8 source files, ~560 lines) — and
revision 3 *removed* machinery (the runtime pixel cap and its inline style) while adding the scale,
so it is barely larger than revision 2.
The one thing in this territory that WOULD be its own change is column resizing, which is why §C.6
puts it out of scope rather than smuggling it in.

## 8. Migration

**None.** This package has no database by construction, and nothing already written to disk by a
consumer changes meaning (§2, S3). `migrationExpected: false`.

## 9. Technical debt this change knowingly creates

One item, for `runs/change-NN/technical-debt.md` when the change is built (never into a closed epic's
archive): **the grid's tick-list and the toolbars' tick-list read differently in their top row** until
DC and the CRM each pass `selectAll: "master"` in their own change. The divergence is one optional
flag on one shared component, not two implementations (§A.5), and it is what the owner accepted when
he picked C over A.
