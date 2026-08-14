# CR-DESIGN-SYSTEM-003 — a toolbar filter may hold several values

> Logic plan. Written 2026-08-14 on branch `change/cr-design-system-003`, which sits on `9aa20f7`
> (CR-DESIGN-SYSTEM-002 merged as PR #10/#11).
> **Nothing has been built. No feature code exists for this change.**

<!-- OWNER-BRIEF-START -->

## What this gives you

Today every filter across the top of a busy list holds one choice. Pick a second and it replaces the
first. This adds a second style of filter that holds **several at once** — two rooms, three depots —
so a rep asks one question instead of three.

Nothing on any screen changes the day this lands. The eleven lists that use these filters today keep
exactly the control they have now. A list only gains the new style when its own team asks for it, in
its own separate piece of work.

## What I need you to decide

How should a filter holding several choices read when it is **closed**? Three drawings are attached:

- name the first choice and count the rest — "Cape Town +2"
- count only — "3 of 7 depots"
- show each choice as a small tag

I recommend the first: it names something real and still fits a narrow row.

## Not included

No searching inside the list of choices, no grouping, no "pick everything matching". No change to the
search box, the date filter, or any list that adopts nothing.

## Worth knowing

The sales system's saved availability arrangements remember filter choices. I have written down
exactly what that team must do so an arrangement saved today still opens afterwards — I cannot do it
for them from here, it is their own work.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 1. The blast radius — counted, not sampled, and it differs from the request

The request says *"NINE SCREENS USE THIS TOOLBAR — eight in Bananaworld-DC, one in Bananaworld-CRM."*
I read every consumer in the estate. The real figure is **seven toolbar screens and four more
engine-only screens — eleven call sites across three apps**, not nine across two.

### 1.1 Screens that render `DataTableToolbar` (7)

| # | App | File | Filters declared |
|---|---|---|---|
| 1 | DC | `src/components/po/PurchaseOrdersView.tsx:139–158` | 3 × select (Farm / Status / Received) + 1 × dateRange |
| 2 | DC | `src/components/receipts/ReceiptsView.tsx:132–139` | 2 × select (Farm / Status) + 1 × dateRange |
| 3 | DC | `src/components/returns/ReturnsView.tsx:132–133` | 1 × select (Customer) + 1 × dateRange |
| 4 | DC | `src/components/sales-order/SalesOrdersView.tsx:148–162` | 2 × select (Customer / Status) + 1 × dateRange |
| 5 | DC | `src/components/conversion/ConversionsView.tsx:88–89` | 1 × select (Recipe) + 1 × dateRange |
| 6 | DC | `src/components/adjustment/StockAdjustmentView.tsx:258–268` | 2 × select (Type / By) + 1 × dateRange |
| 7 | CRM | `app/(browser)/availability/_components/AvailabilityView.tsx:305–323, 614` | 5 × select (Size / Grade / Box type / Depot / Colour) |

**DC has six, not eight.** `document-search/DocumentListSearch.tsx` and
`document-search/ListControlsRow.tsx` name `DataTableToolbar` only in their header comments — they
render none. Verified: `DataTableToolbar` occurs 20 times across 9 DC files; six of those files
contain a `<DataTableToolbar` element.

### 1.2 Screens that drive `useTableControls` WITHOUT the toolbar (4) — the request does not mention these

**Bananaworld-org-admin is a consumer of this filter engine and the request does not know it.** It
pins the package at `ecba2218` and renders its own controls (`app/(console)/_components/list-controls.tsx`)
over the shared engine:

| # | File | How it touches filters |
|---|---|---|
| 8 | `app/(console)/people/_components/people-list.tsx:74–120` | 3 × select defs; **constructs `{kind:"select"}` itself** at :120; reads `filterValues[key]` at :116–117 |
| 9 | `app/(console)/transport/_components/transport-list.tsx:55–106` | 1 × select def; constructs at :106; reads at :78–79 |
| 10 | `app/(console)/farms/_components/farms-list.tsx:53–104` | 1 × select def; constructs at :104; reads at :76–77 |
| 11 | `app/(console)/companies/_components/companies-list.tsx:43` | search only — **no filters at all** |

These matter because they touch the `FilterValue` type directly rather than through the toolbar. §2.3
proves they are unaffected.

### 1.3 Consumers that do not use it at all

`bananaworld-rms` (pin `ecba2218`) and `mangaverde` (pin `e3a88e35`): **zero occurrences** of
`useTableControls` or `DataTableToolbar` outside `node_modules`. No action, no risk.

### 1.4 The pins — verified, not assumed

| Consumer | Pin today | Verified at |
|---|---|---|
| Bananaworld-DC | `365be65…` | `package.json:54` |
| Bananaworld-CRM | `365be65…` | `package.json:45` |
| org-admin | `ecba2218…` | `package.json:52` |
| RMS | `ecba2218…` | per SESSION_HANDOVER §1 |
| Mangaverde | `e3a88e35…` | per SESSION_HANDOVER §1 |

The request's claim that DC and CRM are both on `365be65` is **correct**. Note that `main` has since
moved past it (CR-DESIGN-SYSTEM-002 merged as `8b7f00e`/`9aa20f7`), so both apps already lag by two
commits and neither has noticed — which is precisely how a pinned estate is supposed to behave.
**This change bumps nothing.**

## 2. The design

### 2.1 The new kind, added beside the existing two

In `src/lib/table-controls.ts`, purely by addition:

```ts
export interface MultiSelectFilterDef<Row> {
  readonly kind: "multiSelect";
  readonly key: string;
  readonly label: string;
  readonly accessor: (row: Row) => string | null;
  readonly options?: readonly SelectOption[];   // omit to derive from the data, exactly as "select"
}
export type FilterDef<Row> =
  | SelectFilterDef<Row> | DateRangeFilterDef<Row> | MultiSelectFilterDef<Row>;

export interface MultiSelectFilterValue {
  readonly kind: "multiSelect";
  readonly values: readonly string[];           // [] === "All", mirroring select's `value: null`
}
export type FilterValue =
  | SelectFilterValue | DateRangeFilterValue | MultiSelectFilterValue;
```

**The definition shape is a copy of `SelectFilterDef` with a different `kind`.** That is deliberate:
a screen converts a filter from one to several by changing one word, and the option-derivation,
labelling and clearing rules stay identical. No new concept is introduced for a rep to learn.

**Semantics, stated so a build session cannot invent them:**

| Case | Behaviour | Mirrors |
|---|---|---|
| `values: []` | matches every row — the "All" state | `select` with `value: null` |
| `values: ["a"]` | identical result set to `select` with `value: "a"` | — |
| `values: ["a","b"]` | rows whose accessor is `"a"` **or** `"b"` (union, never intersection) | — |
| accessor returns `null` | excluded as soon as anything is chosen | `select` |
| every option chosen | same rows as `[]`, but the control still reads "several chosen" | — |

Union, not intersection: a row has one depot, so an intersection would always be empty. There is no
case where "and" is meaningful here, so no option is added to choose between them.

### 2.2 The five package-internal functions that must change

All five are private to the package — none is exported from any barrel today (confirmed:
`src/lib/index.ts` does not export `table-controls` at all, and `src/components/index.ts` exports only
`DataTableToolbar`, `useTableControls` and three types).

| Function | Change | Effect on the existing two kinds |
|---|---|---|
| `emptyFilterValue` (`:73`) | third arm → `{kind:"multiSelect", values: []}` | none — the `select`/`dateRange` results are unchanged |
| `hasActiveControls` (`:88`) | 🔴 **must** gain a `multiSelect` arm (`values.length > 0`) | none |
| `matchesFilter` (`:138`) | third `if`, before the `return true` fallback | none |
| `deriveSelectOptions` (`:97`) | widen its parameter to `SelectFilterDef<Row> \| MultiSelectFilterDef<Row>` | none — a **parameter** widening is invisible to callers |
| `useTableControls`' `optionsByKey` (`DataTableToolbar.tsx:102`) | include `multiSelect` defs | none |

🔴 **`hasActiveControls` is not optional.** Today it reads
`v.kind === "select" ? v.value !== null : v.from !== null || v.to !== null`. A `multiSelect` value
would fall into the `else` and read `.from` on an object that has none — `undefined !== null` is
**true**, so the "Clear" affordance would be permanently lit on any screen that adopts the new kind,
including when nothing is chosen. Named here because it is exactly the kind of arm a build session
skips.

### 2.3 🔴 Why widening the `FilterValue` union is additive — proved against every reader

Widening a union is safe in argument position (`setFilter(key, value: FilterValue)` — callers still
pass a subtype) but **can break a reader** that narrows exhaustively, e.g.
`if (v.kind === "select") {…} else { v.from }`. So I read every consumer that reads a `FilterValue`:

| Reader | Line | Pattern | Verdict |
|---|---|---|---|
| org-admin people-list | `:116–117` | `v !== undefined && v.kind === "select" ? v.value : null` | safe — positive narrowing, no `else` branch |
| org-admin transport-list | `:78–79` | same | safe |
| org-admin farms-list | `:76–77` | same | safe |
| CRM `captureCurrent` | `AvailabilityView.tsx:371` | `value.kind === "select" ? value.value : null` | safe |
| CRM `applyState` | `AvailabilityView.tsx:359` | writes `{kind:"select", …}` | safe — argument position |
| DC × 6 | — | **no consumer reads `filterValues` at all**; the toolbar does it internally | safe |

**Not one consumer performs an exhaustive switch or an `else`-implies-dateRange narrowing.** Every
one uses the positive-test-then-fallback shape, which a widened union cannot break. This is the
concrete argument that the change is additive at the type level, and it is checkable by anyone.

### 2.4 The control — Radix DropdownMenu with checkbox items

Radix Select is single-choice by construction, so the multi-select needs a different control. **A
popover with checkboxes, built on `@radix-ui/react-dropdown-menu`, which this package already depends
on** (`package.json:41`) and already ships in `RowActions.tsx`.

| | Option | Verdict |
|---|---|---|
| **A** | Radix `DropdownMenu` + `DropdownMenu.CheckboxItem` | **CHOSEN** |
| B | Add `@radix-ui/react-popover` and hand-roll a `role="listbox" aria-multiselectable` list inside | Rejected |
| C | Render the options inline as `ChoiceGroup`-style chips, no popover | Rejected |

**Why A.** `CheckboxItem` gives, for free and correctly: a single tab stop, arrow-key roving focus,
typeahead, `role="menuitemcheckbox"` with `aria-checked` announced on every toggle, Escape closing and
returning focus to the trigger, portalling above the Sheet/SlideOver at `--z-dropdown`, and
outside-click dismissal. It is the same primitive, the same portal and the same `z` the row-actions
menu already uses, so the package gains **no new dependency and no second dropdown idiom**.

**Why B is rejected.** A new dependency plus a hand-rolled listbox — and the project rule is explicit:
*a hand-rolled replacement for a Radix control is a regression even when it looks identical.* Popover
would give a blank box and leave the whole keyboard and screen-reader contract to be re-implemented.

**Why C is rejected.** `ChoiceGroup` is Radix RadioGroup — pick exactly one — so it is the wrong
primitive outright, and an inline chip row of eleven depots turns the toolbar into a paragraph, which
is the shape the request forbids.

**The one Radix gotcha, recorded so it is not rediscovered:** `DropdownMenu` closes on select by
default. `onSelect={(e) => e.preventDefault()}` on each `CheckboxItem` is what keeps the menu open
across several toggles. Without it the rep re-opens the menu for every value, which defeats the
change.

### 2.5 The four states the request asked to see, all three drawings

| State | Treatment (all options) |
|---|---|
| **All** | The trigger reads `All {label.toLowerCase()}` — **the exact wording today's Select sentinel already uses** (`DataTableToolbar.tsx:227`), so an unset filter of either kind reads identically |
| **Several chosen** | The three options differ here, and only here — that is what the owner picks |
| **Clear all** | An "All …" row pinned at the top of the list, checked when nothing is chosen; choosing it clears. The toolbar's existing global "Clear" (`:180–188`) also clears it, unchanged |
| **Keyboard** | Tab to the trigger · Enter/Space/↓ opens · ↑↓ moves · Space/Enter toggles and **keeps the menu open** · typeahead jumps · Esc closes and returns focus to the trigger |

Trigger sizing copies `SelectTrigger` exactly (`h-9 min-w-[10rem]`, `border-border`, `rounded-md`,
`shadow-xs`, chevron right, `focus-visible:shadow-focus`, and the tablet `data-surface` step) so the
toolbar's rhythm is unchanged whichever option is chosen.

### 2.6 The closed state — the owner's decision (mockups)

`runs/current/mockups/CR-DESIGN-SYSTEM-003/{option-a,option-b,option-c,comparison}.html`

| Option | Closed trigger reads | For | Against |
|---|---|---|---|
| **A — first + more** ✅ recommended | `Cape Town +2` | names something real; one line; truncates predictably; width stable | you cannot see all of them without opening |
| **B — count only** | `3 of 7 depots` | never grows, identical width always; reads well at a glance | says nothing about *which*, so a rep must open to check their own filter |
| **C — tags in the trigger** | `Cape Town` `Durban` `+1` | most concrete; each choice visible | widest, and the one that most easily becomes a paragraph in a narrow toolbar |

## 3. Data model + scoping

**There is no data model. This package has no database, no migration, no query, and gains none.**
`migrationExpected: false`.

The model that matters is the exported type surface, and it is scoped by construction:

- `MultiSelectFilterDef.accessor` returns a plain `string | null` supplied by the caller. The package
  never learns what a depot or a room **is**, only what a row's value for it is *called*. No
  `warehouse_id`, no `legal_entity`, no tenancy identifier (TECH-COMP-003).
- `MultiSelectFilterValue.values` is a list of those same caller-supplied strings. Nothing is
  interpreted, sorted by business meaning, or validated against a master list.
- Rows arrive already scoped by the consumer's repository, exactly as today. Filtering narrows a set
  the caller already had the right to see; it can never widen it.

## 4. Permission shape

**None, and none is gained.** The filter decides which of the rows the caller already holds are
painted. Who may see a row is decided upstream by each app's own query and enforced by its server
(RBAC-PRINCIPLE-001). `PermissionGate` stays in each app.

One consequence worth stating: because a multi-select can select *several* values, an app must not
start treating "the chosen values" as an authorisation input. It is a view narrowing, nothing more.

## 5. 🔴 THE TRAP — saved views, and the exact consumer obligation

CRM shipped saved availability views on 2026-08-10 (CR-CRM-011). They persist every toolbar filter
value, per rep, in the database. **This package cannot see that table and will not try to.** What it
can do is fix the stored shape in one place and hand the consumer a precise, testable instruction.

### 5.1 What CRM actually stores, read from its source

`lib/availability/view-state.ts:53` — `readonly filters: Readonly<Record<string, string>>`.
A flat string map. `captureViewState` (`:107–109`) writes a key only when
`typeof value === "string" && value !== ""`; `reconcileFilters` (`:172–189`) reads a key only when
`typeof value === "string" && value !== ""`.

### 5.2 The two directions, and what each does today

**Direction 1 — a view saved BEFORE, opened AFTER the CRM adopts multi-select.** Stored
`{"depot": "Cape Town"}`; the screen now declares `depot` as `multiSelect`. CRM's `applyState`
(`AvailabilityView.tsx:359`) still writes `{kind: "select", value: "Cape Town"}`. The def is
`multiSelect`, the value is `select` — `matchesFilter` falls through both `if`s to `return true`
(`table-controls.ts:145`), so the filter **matches every row**. Not a crash, not "filter to nothing" —
it **silently widens to everything**, which is the one outcome the request explicitly names as
unacceptable.

**Direction 2 — a view saved AFTER, opened by a build still on the old pin** (a real case: DC, CRM and
org-admin all move independently). Stored `{"depot": ["Cape Town","Durban"]}`. `reconcileFilters:173`
is `if (typeof value !== "string" || value === "") continue;` — the array is skipped **before** any
`dropped.push`, so the arrangement opens showing every depot **with no note at all**. CRM's own file
header forbids exactly this in capitals (*"It is not silently ignored"*, `:44–47`).

Both failures are **silent widening**, and neither is fixable inside this package.

### 5.3 What this package ships to make it fixable — the stored-shape contract

**The contract: a filter value is stored as a bare `string` when it holds one value, and as a
`string[]` only when it holds two or more.** So a multi-select holding a single choice writes exactly
what a single-select writes today, and an old build reads it correctly for free. Only the genuinely
multi-value case needs new reader code.

Two small pure functions, exported from `src/lib/table-controls.ts` through both barrels:

```ts
export interface StoredFilterReading {
  readonly value: FilterValue;
  /** True when the stored shape could not be represented and the filter opened WIDER than saved. */
  readonly widened: boolean;
}

// Turn an untrusted stored value (string | string[] | anything) into this def's FilterValue.
export function filterValueFromStored<Row>(def: FilterDef<Row>, stored: unknown): StoredFilterReading;

// The narrowest storable shape for a live value. null = "All", and is simply not stored.
export function storedFromFilterValue(value: FilterValue): string | readonly string[] | null;
```

Reading rules, all of which widen rather than narrow, never throw, and never guess:

| def kind | stored | result | `widened` |
|---|---|---|---|
| `multiSelect` | `"Cape Town"` | `{multiSelect, ["Cape Town"]}` | false — **this is the request's case, and it just works** |
| `multiSelect` | `["a","b"]` | `{multiSelect, ["a","b"]}` (empties/non-strings dropped) | false |
| `multiSelect` | `null` / `""` / junk | `{multiSelect, []}` = All | false |
| `select` | `"a"` | `{select, "a"}` — byte-identical to today | false |
| `select` | `["a","b"]` | `{select, null}` = All | **true** — a consumer must say so |
| `dateRange` | anything | `emptyFilterValue(def)` | true when something was stored |

`widened: true` is the hook the consumer needs: it is what lets CRM push a sentence into its existing
`dropped` list instead of widening in silence. The package supplies the fact; the wording stays in the
app, where the rest of that vocabulary already lives.

### 5.4 The consumer obligation, written out — CRM's adoption change owes this

Recorded here and repeated verbatim in the developer handover at close. **This change performs none
of it.**

1. Widen the stored type: `filters: Readonly<Record<string, string | readonly string[]>>`, and keep
   `state_version` at 1 — the reconciler is already the one door, exactly as CR-CRM-011 argued for the
   legacy `room` key.
2. `reconcileFilters` (`:172–189`): accept an array arm. 🔴 **An array that reaches the current
   `continue` is a silent widen** — that is the defect, not the array itself.
3. `applyState` (`:358–360`): stop hard-coding `{kind: "select"}`. Build the value from the def via
   `filterValueFromStored`, so a stored `"Cape Town"` restores as `["Cape Town"]` on a multi-select
   filter.
4. `captureCurrent` (`:366–380`): stop hard-coding `value.kind === "select"`; use
   `storedFromFilterValue` so one chosen value still writes a bare string and stays old-build readable.
5. `PresentControls`/`reconcileFilters` value-existence check: judge **each** stored value against the
   options; drop the ones that no longer exist and keep the rest, naming what went. Dropping the whole
   filter because one of three values retired would widen further than necessary.
6. `noteLegacyRoom`'s idiom applies unchanged: **the reconciler never writes on read**; a re-save is
   what upgrades a row.
7. Test the four cases the request names — none, one, several, all — plus the two cross-version cases
   in §5.2, and one test that a pre-change row (`{"depot":"Cape Town"}`) opens showing **Cape Town
   only**, not everything.

**Until CRM does all seven, it must not declare any availability filter as `multiSelect`.** Adopting
the kind without the reconciler work is precisely the silent widen this section exists to prevent.

## 6. Files I expect to touch

All paths relative to this worktree.

| # | File | Action | Est. lines |
|---|---|---|---|
| 1 | `src/lib/table-controls.ts` | modified — new def + value types, 4 function arms, 2 stored-shape helpers | ~+95 |
| 2 | `src/components/DataTableToolbar.tsx` | modified — `MultiSelectFilterControl` (private), the render switch, `multiSelectValuesOf`, `optionsByKey` | ~+115 |
| 3 | `src/lib/index.ts` | modified — export the filter types + the 2 helpers | ~+14 |
| 4 | `src/components/index.ts` | modified — export the filter def/value types alongside the toolbar | ~+8 |
| 5 | `src/index.ts` | modified — enumerate the new `./lib` names (this barrel enumerates, it does not star) | ~+10 |

**Source estimate: 5 files, ~240 lines.** Tests are excluded per the runner's rule.

### 6.1 The export additions — additive, nothing moved, nothing removed

```ts
// src/components/index.ts — beside the existing DataTableToolbar block
export type {
  FilterDef, SelectFilterDef, MultiSelectFilterDef, DateRangeFilterDef,
  FilterValue, SelectFilterValue, MultiSelectFilterValue, DateRangeFilterValue,
  FilterValues, SelectOption,
} from "../lib/table-controls";

// src/lib/index.ts + enumerated again in src/index.ts
export { filterValueFromStored, storedFromFilterValue, type StoredFilterReading }
  from "./table-controls";
```

⚠ **These filter types are not exported today, and that absence has already cost a consumer.**
`AvailabilityView.tsx:118` says so in place: *"`FilterDef` is internal to the design system's
table-controls module and is not re-exported from its barrel, so the shape is pinned with `as const`."*
A consumer writing a two-shape reconciler must be able to *name* `MultiSelectFilterValue` or it will
re-declare it locally and drift. Exporting a type adds a name and changes no existing one — the same
reasoning as CR-DESIGN-SYSTEM-002's D-7. Checked for collisions: `SelectOption` and the rest collide
with nothing already exported (`Table.tsx` exports `SortDirection`, `Combobox` exports
`ComboboxOption`; no overlap). **`SortDir`/`SortState`/`SortAccessor` are deliberately NOT exported —
they are not what this change is about.**

### 6.2 Files deliberately NOT touched

| File | Why |
|---|---|
| `package.json` | **No new dependency.** `@radix-ui/react-dropdown-menu@^2.1.16` is already there and already shipped in `RowActions`. No new token either — every class used exists in `tokens.css` and is already used by `Select`/`RowActions`/`Checkbox` |
| `vitest.config.ts` | `tests/components/**/*.test.tsx` already globs what I will add |
| `src/components/Select.tsx` | Untouched. The single-select path keeps its Radix Select and its `__all__` sentinel exactly as-is |
| `src/components/Checkbox.tsx` | Untouched. The menu's tick is `DropdownMenu.ItemIndicator`, not this form control — mixing a Radix Checkbox into a Radix menu item nests two interactive roles |
| Anything under `bananaworld-dc/`, `bananaworld-crm/`, `bananaworld-org-admin/` | Not this repo, not this lane. **No consumer pin moves** |
| `runs/epic-*/`, `runs/current/epic-plan/`, any `milestone-NN/` | A closed epic is immutable. `runs/epic-020/` is cited nowhere and written to nowhere |

## 7. 🔴 CROSS-APP INTERSECTION MAP

**Six seams. Not "none".**

### S-1 — This package writes the new kind; three apps read it, each on its own clock

| | |
|---|---|
| **Writer** | This change, in this repo. `multiSelect` becomes a kind `FilterDef` accepts |
| **Readers** | DC (6 screens), CRM (1), org-admin (4) — **only after each bumps its own pin, in its own change** |
| **This change does NOT** | bump any pin, edit any app file, or declare a `multiSelect` filter anywhere |

Every consumer must bump against the **merged sha on `main`, never a branch sha** (KI-M001E19-002 is
that mistake on record).

### S-2 — 🔴 CRM saved availability views: the stored value shape

The one seam that can hurt a real person. **Writer of the shape contract:** this package (§5.3).
**Writer of the rows:** CRM's `availability_saved_views` table, which this package cannot see.
**Reader:** CRM's `reconcileViewState`, and any older build of it still on an older pin.
**Owner of the fix:** CRM's adoption change, per the seven-point obligation in §5.4. Recorded before
it can be discovered, which is the whole point of naming it here.

### S-3 — org-admin builds its own controls over the shared engine

`app/(console)/_components/list-controls.tsx` + four list screens use `useTableControls` and
**construct `FilterValue` literals directly** without ever rendering `DataTableToolbar`. They are
readers of the type, not of the UI. Proved unaffected in §2.3 (all three readers use positive
narrowing). If org-admin ever wants a multi-select it must build its own trigger too — the package's
control lives inside the toolbar and org-admin does not render it. **Stated, not solved**: solving it
would mean exporting the control as a standalone primitive, which is anticipatory configurability for
a consumer that has not asked.

### S-4 — DC keeps a stale private copy of this engine

`bananaworld-dc/src/lib/table-controls.ts` is a byte-for-byte duplicate of this package's
`src/lib/table-controls.ts`, and **nothing in DC's `src/` imports it** (its six screens import
`useTableControls` from `@/components/ui`, which re-exports this package). It will not gain the new
kind and will drift further. **DC-lane debt, named not fixed** — deleting a file in another repo is
not this change, and touching it from here would be a lane violation.

### S-5 — RMS and Mangaverde read nothing new

Zero usages. They gain a type they do not import. **No action required from either.**

### S-6 — No database seam anywhere

This package has no database and adds no query, no migration and no column. The only persistence
anywhere near this change is CRM's saved-views row, covered by S-2 and owned by CRM.

### Register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo and there is no
`governance/` directory** — verified by glob, and the same finding CR-DESIGN-SYSTEM-001 recorded as
D-12 and CR-DESIGN-SYSTEM-002 as D-10. Creating one is a governance decision, not part of this change.
**Third change running to raise it.** The seams above are the record.

## 8. Testing

### 8.1 🔴 The baseline problem, stated first

**There is no test for `DataTableToolbar` or `table-controls` in this package today.**
`tests/` holds `ChoiceGroup`, `Combobox`, `DocumentHeader`, `document-date`, `Select`, and the pricing
/ sales-order engines — nothing for the filter engine. So "the package suite is green" currently
proves **nothing** about the seven toolbar screens, and citing a green suite as the additive proof
would be hollow.

Therefore the change opens by writing **characterisation tests for the existing single-select and
date-range behaviour, before touching a line of source**, and those must pass unchanged after. That is
what turns "no existing caller changes behaviour" from an assertion into a proof, and it is the
request's *"prove it, do not assert it"* read literally.

### 8.2 Provable here — `pnpm test` + `pnpm typecheck`

Record the baseline (last known: 115 passed / 9 files) before any edit.

**`tests/components/table-controls.test.tsx` — characterisation, written FIRST:**
1. `emptyFilterValue` / `emptyFilterValues` for `select` and `dateRange` — unchanged shapes.
2. `hasActiveControls` — false when cleared; true for a set select; true for either date bound.
3. `matchesFilter` via `applyTableControls` — select null = all; select value = exact; date bounds
   inclusive on the day; a `null` accessor excluded once set.
4. `deriveSelectOptions` — fixed options win; derived options are distinct, sorted, `""`/null skipped.
5. Sort + search behaviour untouched.

**Then the multi-select specs, in the same files:**
6. The four cardinalities the request names — **none / one / several / all** chosen — each asserting
   the exact visible row set, and that "none" equals "all values chosen" in rows while differing in
   what the trigger reads.
7. `values: ["a"]` returns **the identical array** to `select` with `value: "a"` — the two kinds agree.
8. Union not intersection, on a two-value selection.
9. `hasActiveControls` true only when `values.length > 0` — the `:88` trap in §2.2, pinned.
10. `clear()` empties a multi-select back to `[]`.
11. Kind mismatch (`multiSelect` def, `select` value) still `return true`s and never throws — §5.2
    direction 1's safety net, pinned deliberately so nobody "tidies" it away.
12. `filterValueFromStored` / `storedFromFilterValue` — every row of §5.3's table, both directions,
    plus a round-trip, plus `null`/`undefined`/`{}`/`[1,2]`/`[""]` junk inputs.
13. One value round-trips as a **bare string**, two as an **array** — the old-build-readability rule.

**`tests/components/DataTableToolbar.test.tsx` — the additive proof for the seven screens:**
14. 🔴 **The six DC filter declarations and the CRM's five, reproduced verbatim from the real source**
    (§1.1's table), rendered with **no multi-select declared**, asserting the DOM: one `combobox`
    trigger per select filter, the `All {label}` sentinel item, both date inputs with their
    `aria-label`s, the `Clear` button appearing only when active. **Snapshotted before the source
    edit and re-run after** — this is the "renders unchanged" proof, per screen, not sampled.
15. The toolbar renders **no** extra element for a screen that declares nothing new — no wrapper, no
    attribute, no `""`-valued prop. (The `ChoiceGroup` rule from CR-DESIGN-SYSTEM-001: assert the
    attributes are **absent**, not empty.)
16. Multi-select control: opens on Enter, `menuitemcheckbox` roles with correct `aria-checked`, the
    "All …" row checked when nothing is chosen.
17. **Keyboard-only**, via `@testing-library/user-event`: tab to trigger → Enter → ↓↓ → Space toggles
    → **the menu is still open** → Space again untoggles → Esc closes → focus is back on the trigger.
18. Keyboard-only clearing: navigate to the "All …" row, Space, assert `values` is `[]`.
19. The closed trigger's text for none / one / several / all, in the owner's chosen option's wording.

**Standalone-build proof (the request's explicit ask):** `pnpm typecheck` runs `tsc --noEmit` with no
app path alias, so an `@/…` import cannot resolve; plus a spec scanning the two edited sources for
`@/` and `bananaworld-` — the same guard CR-DESIGN-SYSTEM-002 shipped.

**Barrel proof:** a spec importing the new type names and both helpers **from the package root**
(`../../src`), not from the deep file.

**Additive proof:** `git diff --stat` on `src/` — insertions only; any deletion must be justified line
by line in the evidence, and I expect **zero** outside the five arms in §2.2 that gain a branch.

### 8.3 NOT provable here — handed over, not hidden

**DC's, CRM's and org-admin's suites cannot be run from this sandboxed worktree** (no checkout of them
in this lane, the same limitation CR-DESIGN-SYSTEM-001 and -002 both recorded). Any claim that the
eleven call sites were *executed* from here would be a fabrication. What I can and will do is
reproduce their filter declarations verbatim in this package's own suite (spec 14) and state the
provenance line-by-line. The consuming suites run in each consumer's own adoption change, if it ever
has one — and six of the eleven screens need no adoption change at all, because they change nothing.

## 9. Decisions

| # | Decision | Rationale |
|---|---|---|
| D-1 | **`multiSelect` is ADDED as a third kind. `select` is not reshaped, not deprecated, not migrated.** | Additive-only is the lane rule. Reshaping would migrate eleven call sites across three repos inside a package change — the epic the request forbids |
| D-2 | **`values: []` means All**, mirroring `select`'s `value: null` | One mental model for both kinds; `clear()` and `emptyFilterValue` then need no special case |
| D-3 | **Union, never intersection**, and no option to choose | A row holds one value per filter, so "and" is always empty. Anticipatory configurability |
| D-4 | **Radix `DropdownMenu.CheckboxItem`, not a new Popover dependency and not a hand-rolled list** | Keyboard, focus and screen-reader behaviour are why the primitive exists (project rule). Already a dependency, already shipped in `RowActions` |
| D-5 | **`onSelect` preventDefault keeps the menu open across toggles** | Otherwise the menu closes per value and the change fails at the thing it exists to do |
| D-6 | **The "All" wording is reused verbatim from the Select sentinel** | An unset filter must read identically whichever kind it is, or the toolbar has two vocabularies |
| D-7 | **The stored shape is `string` for one value, `string[]` for two or more** | Maximises what an old-pin build reads correctly; a single-value multi-select is invisible to it |
| D-8 | **Two pure stored-shape helpers ship, with a `widened` flag; the wording of any notice stays in the app** | The package supplies the fact; "the depot filter now shows every depot" is app vocabulary (TECH-COMP-003) |
| D-9 | **The filter def/value types are added to the barrels** | Their absence is already recorded as a wart in CRM's own source (`AvailabilityView.tsx:118`); a consumer writing a two-shape reconciler must be able to name them. Additive; same reasoning as CR-002's D-7 |
| D-10 | **The multi-select control is private to `DataTableToolbar.tsx`**, like `SelectFilterControl` and `DateRangeFilterControl` | Exporting it as a standalone primitive is anticipatory — org-admin (S-3) has not asked |
| D-11 | **Characterisation tests for the existing kinds are written BEFORE any source edit** | There is no filter-engine test today (§8.1). Without them, "unchanged" is an assertion, and the request says prove it |
| D-12 | **`uiBearing: true`** | A rep reads and picks something genuinely new the first time a screen adopts it, and the owner must choose the closed-state reading. Three mockups + a comparison page |
| D-13 | **`epicRecommended: false`** | One filter kind, one control, five files. No new service, integration, tenancy or authorisation model. It does not decompose into five controlled units of work |
| D-14 | **No consumer pin is bumped and no consumer file is edited** | Consumers move their own pins in their own changes, against the merged sha |
| D-15 | **The stale DC copy of `table-controls.ts` is not touched** | Another repo, another lane. Named as S-4 debt |

## 10. Open questions

1. **(For the owner — the brief's decide point.)** Which closed-state reading: A (first + more),
   B (count), or C (tags)? A is recommended. Everything else in the plan is independent of the answer.
2. **(Non-blocking, carried.)** The request says nine screens across two apps; there are seven toolbar
   screens across two apps plus four engine-only screens in org-admin (§1). No scope changes — all
   eleven are proved unaffected — but the owner should know the estate is wider than the request
   assumed.
3. **(For CRM's own change, not this one.)** Whether CRM adopts multi-select on `depot` only, or on
   size/grade/box type/colour as well. It changes nothing here; the seven-point obligation in §5.4 is
   the same either way.
4. **(Non-blocking, carried for the third time.)** The cross-system change register still does not
   exist in this repo.

## 11. Risks

| Risk | Reality |
|---|---|
| One of the eleven call sites renders differently | **The core claim, and it is tested per screen, not sampled** (§8.2 spec 14) — every one of the eleven declarations reproduced verbatim and asserted before and after the source edit. Nothing renders until a screen declares the new kind |
| A consumer's typecheck breaks on the widened union | Every reader in every consumer uses positive narrowing, checked line by line in §2.3. No exhaustive switch exists anywhere in the estate |
| The "Clear" affordance lights up permanently on an adopting screen | Real, and caused by `hasActiveControls`'s `else` branch. §2.2 names it; §8.2 spec 9 pins it |
| A saved availability view opens showing everything | **Real, in both directions, and not fixable here** (§5.2). The package makes it fixable and §5.4 says exactly how; until CRM does all seven points it must not declare a multi-select filter |
| The menu closes after each tick | D-5. Pinned by the keyboard-only spec (17), which fails if the menu closes |
| A hand-rolled control creeps in | D-4. The control is Radix `DropdownMenu`, the same primitive `RowActions` already ships |
| Scope creep into search-in-list / grouping / select-all | Explicitly out (the request). No option, no prop, no dead code left behind for them |
| An app import sneaks into the package | `tsc --noEmit` with no alias configured cannot resolve `@/…`, plus the source scan spec |
