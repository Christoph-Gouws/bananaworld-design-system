# CR-DESIGN-SYSTEM-010 — logic plan

> Review follow-up on CR-DESIGN-SYSTEM-009. Three defects an independent reviewer found in code that
> has already merged (`3143646`, PR #22). Planned together, because two of them share one cause.
> **Planning session only — no feature code was written, and nothing outside this worktree was read
> for writing. `bananaworld-dc` was read only.**

<!-- OWNER-BRIEF-START -->

**What this is.** An outside checker looked at last week's filter work and found three faults. All
three are still in the code today. This fixes them.

**What you get.**

1. **"Select all" will actually show everything.** Today it *hides* rows that have nothing recorded in
   that column, and switches "Clear" on — on a tap you made to see more, not less.
2. **A remembered choice that is no longer offered stops going missing.** Narrow a saved layout to two
   rooms, then close one of them: the box now shows one room and says "1 chosen" while the list is
   still narrowed to two — and the closed room is thrown away the next time anything is ticked. It
   will be counted and kept.
3. **A column-width setting shares its name with an older one**, which would break an app the moment
   it picks this work up. It will accept both.

**Decide:** three looks for the top row of the tick-list — please pick one from the page. They behave
the same; only the tick differs.

**Not included:** no screen changes yet; each app picks this up in its own change, at its own gate.
The smaller review notes stay unfixed.

**Risk:** low — no app runs this code yet, so nothing on a live screen moves.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Every finding re-confirmed against the code as it is now

`main` is at `3143646` (CR-009, PR #22, merged). This branch is off it. All three findings were
re-read in the current source before any fix was designed; **all three still hold**, and one is worse
than reported.

| # | Verdict | Where it is now |
|---|---|---|
| **F1** | **CONFIRMED** (and worse than reported) | `src/components/GridFilterRow.tsx:284, 289, 293, 343` |
| **F2** | **CONFIRMED**, in both surfaces | `src/components/DataTableToolbar.tsx:399` · `src/components/GridFilterRow.tsx:326` |
| **F3** | **CONFIRMED** | `src/components/Table.tsx:483` (declared) + `:487` (destructured out) |

### F1 — the grid's tick-list under-counts and discards a value the option list no longer offers

```ts
// GridFilterRow.tsx:284
const chosen = options.filter((o) => selected.includes(o.id));   // unknown ids vanish
const { text, more } = multiSelectTriggerLabel(def.placeholder, chosen.map((o) => o.label));
const set = chosen.length > 0;                                    // :289
…
<DropdownMenu.Label>{set ? `${String(chosen.length)} chosen` : "None chosen"}</…>  // :343
```

against the toolbar, which was **deliberately taught the opposite** in the same change:

```ts
// DataTableToolbar.tsx:317-324 — "⚠ A VALUE THE DATA NO LONGER OFFERS KEEPS ITS RAW ID rather than
// vanishing… One entry per stored value, always."
function chosenLabelsInOptionOrder(options, values) { … known labels, then unknown raw ids … }
const chosenNone = values.length === 0;                                   // :341
<span>{chosenNone ? "None chosen" : `${values.length} chosen`}</span>     // :419
```

This contradicts plan §A.5 verbatim — *"C and A differ **only in that top row** — the ticks, the
separator, the footer `N chosen` and the trigger arithmetic are the same."* The footer and the
trigger arithmetic are **not** the same: the toolbar counts stored values, the grid counts matched
options.

**Worse than the reviewer had room to say:** `set` (line 289) is also derived from `chosen`, so a
value restored as **only** unknown ids (`f_room=cold-9` where `cold-9` has been retired) renders the
cell **completely unset** — grey chrome, reading its placeholder "All rooms" — while the query is
narrowed to `cold-9`. The reader has no signal at all that the column is filtered.

**One part of F1 is NOT a divergence** and must not be "fixed" as one: `toggle()` drops unknown ids in
the grid (`:293`) — and the toolbar does exactly the same at `:348`, with a comment defending it. So
the *discard* half is shared, symmetric behaviour, not drift. It is still wrong (the toolbar shows the
unknown value on the trigger and then silently deletes it on the next tick), and the fix below repairs
both, but the plan states plainly that this is a **behaviour correction in already-shipped toolbar
code**, not a re-alignment.

### F2 — "Select all" narrows the table instead of widening it

```ts
// DataTableToolbar.tsx:395-400
{def.selectAll === "master" ? (
  <MultiSelectAllRow chosen={values.length} total={options.length}
    onToggle={(all) => onChange(all ? options.map((opt) => opt.value) : [])} />
// GridFilterRow.tsx:322-327 — the same gesture
  onToggle={(all) => onCommit(all ? options.map((o) => o.id) : [])}
```

`matchesFilter`'s multiSelect arm (`table-controls.ts:293-298`) returns `actual !== null &&
value.values.includes(actual)`, and `deriveSelectOptions` (`:243-256`) never produces an option for a
`null` or `""` accessor result. So committing every option id **excludes every row whose value is
blank**, and `hasActiveControls` (`:231-238`) then returns true, lighting "Clear". The row it replaces
(`selectAll: "allOption"`, `:402-406`) calls `onChange([])` — genuinely everything.

The change's own specs pin the defect rather than catch it:

- `tests/components/DataTableToolbar.test.tsx:497-504` — after tapping the master row,
  `visibleRows()` is asserted to be `["Cape Town","Durban","Johannesburg"]` with the `"—"` row
  **absent**, and it returns only on the second tap.
- `tests/components/Grid.test.tsx:486-521` — asserts `onChange` receives all three ids.

Against plan §A.5: *"Tapping it once takes everything"* and *"C and A differ ONLY in that top row"*.
What ships takes every **listed option**, which is strictly less than everything.

### F3 — `TableCellProps.width` shadows the DOM attribute and is swallowed

```ts
// Table.tsx:449
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  …
  width?: TableColumnWidth;                                         // :483
}
// :487 — destructured out of `...props`, so it never reaches the <td>
function TableCell({ className, align, numeric, muted, valign, wrap, width, title, children, ...props }, ref)
```

React's `TdHTMLAttributes` declares `width?: string | number` (and `height`, `valign`); its
`ThHTMLAttributes` declares none of the three — which is why `TableHead` (`:384-401`) has no collision
and the hazard is asymmetric. `TableColumnWidth` is assignable to `string | number`, so the interface
extension compiles while **narrowing** the inherited prop: `<TableCell width={120}>` was legal and
rendered `<td width="120">` before CR-009 and is a type error after it. This breaks §0 of the CR-009
plan — *"A consumer that moves its pin and declares nothing new renders byte-identically"* — because
the consumer does not even have to declare anything new; it only has to have used a legacy HTML
attribute the primitive used to forward.

CR-DESIGN-SYSTEM-007 recorded this exact hazard for `valign` and imposed a per-consumer grep before
bumping. CR-009 introduced a second prop on the same interface with the same collision and recorded
no equivalent obligation. **`node_modules` is not installed in this planning worktree**, so the React
type shapes above are stated from the published `@types/react` definitions and from this file's own
comment at `:466-469` (which documents `valign` and `align` as consumed inherited attributes). The
build session must confirm by compiling — the test in §5 does exactly that.

## 1. The shared cause

CR-009's stated remedy for "two multi-selects that look or count differently is the defect" was to
**move the shared parts into `MultiSelectMenu.tsx`**. What actually moved was the **presentation** —
the item, the master row, the trigger's `first + N` arithmetic. What did **not** move is the **value
arithmetic**: which stored ids count as chosen, what labels they produce, what a tick commits, and
what "everything" commits. That was left duplicated at each call site, and three of the four
duplicates now disagree (F1) while the fourth is wrong in both copies (F2).

So the fix is not three edits. It is **finishing the extraction**: the value arithmetic moves into the
shared module, both surfaces call it, and the master row is given a shape that cannot express
"narrow". F3 is a separate cause in the same change (a new prop name colliding with a DOM attribute —
the lesson CR-007 recorded for `valign` was not applied to `width`) and is fixed on its own terms.

## 2. The fix

### 2.1 `MultiSelectMenu.tsx` — the value arithmetic joins the presentation

Three additions, all **internal** (this module is not barrelled — `components/index.ts` is untouched):

```ts
/** The option shape both surfaces reduce to. The toolbar's `SelectOption` is this already; the grid's
 *  `GridFilterOption` is `{id,label}` and maps to it at the call site. */
export interface MultiSelectOption { readonly value: string; readonly label: string }

/** MOVED VERBATIM from DataTableToolbar's `chosenLabelsInOptionOrder` — known labels in displayed
 *  order, then any stored value the options no longer offer, as its raw id. */
export function multiSelectChosenLabels(
  options: readonly MultiSelectOption[], values: readonly string[]): readonly string[]

/** What one tick commits: known ids in DISPLAYED order, then the stored ids the options no longer
 *  offer, in their stored order. A value the list cannot show is not a value the reader deleted. */
export function multiSelectToggle(
  options: readonly MultiSelectOption[], values: readonly string[],
  value: string, checked: boolean): readonly string[]
```

and the count both surfaces read is `values.length` — the stored arity, never `options.filter(...)`.

**`MultiSelectAllRow` loses the ability to narrow.** Its `onToggle: (all: boolean) => void` becomes
`onShowEverything: () => void`. Radix hands the next checked state and **both** answers now mean the
same thing (clear the narrowing), so a boolean the call site must interpret is exactly how F2 got in.
With no id list reaching the row and no boolean to branch on, the defect becomes unreachable rather
than fixed — the same argument `useCellLayout` makes about conditional hooks in `Table.tsx:196-200`.

Its displayed state stays derived from `(chosen, total)` — which is enough for all three mockup
options, so **the owner's pick changes only this function's body**:

| Owner's pick | `chosen === 0` | `0 < chosen < total` | `chosen === total` |
|---|---|---|---|
| **A** (recommended) | ticked · `All 3` | dash · `2 of 3` | ticked · `3 of 3` |
| **B** | unticked · `0 of 3` | dash · `2 of 3` | ticked · `3 of 3` |
| **C** | ticked, **and every item reads ticked** · `3 of 3` | dash · `2 of 3` | ticked · `3 of 3` |

⚠ **C is not a body change alone** — it also inverts each item's `checked` and needs a `(blank)`
entry before it is honest about rows with no value (see `option-c.html`). If the owner picks C, the
build session must treat the `(blank)` entry as **out of scope** and record it as technical debt, or
the change grows a second new idea. A and B are contained.

### 2.2 `GridFilterRow.tsx` — `MultiSelectCell` reads the shared arithmetic

```ts
const options = useMemo(                      // {id,label} → {value,label}, once per option list
  () => (def.options ?? []).map((o) => ({ value: o.id, label: o.label })), [def.options]);
const { text, more } = multiSelectTriggerLabel(def.placeholder, multiSelectChosenLabels(options, selected));
const set = selected.length > 0;                                   // was chosen.length > 0
const toggle = (id, checked) => onCommit(multiSelectToggle(options, selected, id, checked));
…
<MultiSelectAllRow size="compact" chosen={selected.length} total={options.length}
                   onShowEverything={() => onCommit([])} />
…
<span>{set ? `${String(selected.length)} chosen` : "None chosen"}</span>
```

`onCommit([])` → `gridFilterSelect([])` → `null` → `gridFilterSet` **drops the key**
(`grid-view.ts:151-160`), which is the one empty state the row has always had. So "Select all" writes
no parameter at all rather than N repeated ones — the second half of F2.

`SelectCell` (the one-value path, `:205-260`) is **not touched**. Handover point 2 stands.

### 2.3 `DataTableToolbar.tsx` — the same two calls

`chosenLabelsInOptionOrder` is deleted here and imported from `MultiSelectMenu` (same body, same
output); `toggle` (`:346-349`) becomes `multiSelectToggle(...)`; the master row's `onToggle` becomes
`onShowEverything={() => onChange([])}`. The `selectAll: "allOption"` branch (`:402-406`), the
trigger, the footer and every class string are untouched.

### 2.4 `Table.tsx` — `width` accepts both meanings again

```ts
/** How much room this column may take before it is cut … PLUS the legacy HTML `width` attribute,
 *  which `TdHTMLAttributes` also declares on this element. A value that is one of the four steps is
 *  the design-system ceiling; anything else is forwarded to the <td> untouched, exactly as it was
 *  before CR-DESIGN-SYSTEM-009 destructured it out. `ThHTMLAttributes` declares no `width`, so
 *  `TableHeadProps` has no collision and is deliberately NOT widened to match. */
width?: TableColumnWidth | number | (string & {});
```

```ts
function isColumnWidth(w: unknown): w is TableColumnWidth { return w === "narrow" || … }
const step = isColumnWidth(width) ? width : undefined;      // → useCellLayout(wrap, step)
const htmlWidth = isColumnWidth(width) ? undefined : width; // → <td width={htmlWidth}>
```

Additive in both directions: `width={120}` typechecks and reaches the DOM as it always did;
`width="wide"` gets the cap. The only values that change meaning are the four literals themselves,
which are not valid HTML widths. `(string & {})` is the idiom that keeps the four steps in
autocompletion while admitting `"120"`; if the build session finds it fights the lint setup, plain
`| string` is an acceptable fallback that loses only the editor hint.

**Rejected:** renaming the prop to `columnWidth`. That removes `width` from the export surface, which
the lane rule forbids outright — and it would leave the head and the cell with two different names for
one column answer, defeating §C.4a's "declare the step once and pass it to all three".

### 2.5 What is deliberately NOT changed

- **`table-controls.ts` is not touched.** The reviewer cites `matchesFilter`'s multiSelect arm, but
  the engine is right: `[]` means "not narrowed" and a non-empty list means "these values only". If
  the engine were taught to treat "every option" as "no filter", every existing multiSelect caller
  would change behaviour the moment a reader ticked the last box by hand. The defect is at the
  control that builds the list, and that is where it is fixed.
- **Ticking every option by hand still excludes blank rows**, in both surfaces. That is the reader
  asking for N named values, and it is a different gesture from "show everything". The `All 3` vs
  `3 of 3` reading in option A is what distinguishes them on screen.
- **No consumer pin is bumped** (project rule; KI-M001E19-002).

## 3. Data model, scoping and permissions

**None — and that is structural, not an omission.** `@bananaworld/design-system` is a pure
presentation package (TECH-COMP-003 / ADR-001): no database, no migrations, no network, no
`warehouse_id`, no `legal_entity`, no roles. The only "state" involved is the filter value shape a
control hands back to its caller (`GridFilterValue`, `FilterValue`), and **this change alters no
shape** — it changes which ids the controls put into shapes that already exist. `migrationExpected:
false`.

## 4. Cross-app intersection map — who writes, who reads

| # | Seam | Writer | Reader | Decision |
|---|---|---|---|---|
| **S1** | The `select` filter value shape (`GridFilterValue`, `grid-view.ts:117-140`) | **This package declares it** | DC's `ReportGrid` / list screens receive it from `onChange` | **Shape unchanged.** `values` still absent below arity 2, still displayed-option order for the ids the options offer. Only *which* ids survive a tick changes (unknown ones now do). DC compiles unchanged; DC reads. |
| **S2** | The URL wire encoding `f_<key>` (repeated parameter, stated in `grid-view.ts:20-35`) | **DC writes and parses it** (`grid-state.ts`, `grid-request.ts`) | The package neither writes nor reads a URL | "Select all" now writes **no key** where it used to write N repeats. An absent key is already today's cleared state in every consumer parser, so this is the direction that needs no consumer work. Package states, DC implements. |
| **S3** | Saved views / persisted filter values on disk (CRM's per-rep values, CR-CRM-011; DC's saved view definitions) | DC / CRM | DC / CRM, and anyone a view is shared with | **Nothing migrates.** A stored id the option list no longer offers is now **preserved** through a tick instead of being deleted, so a saved view stops silently losing values it holds. No stored row changes meaning; the shape written back is one this package already produced. |
| **S4** | The four pinned consumers (DC, CRM, RMS, org-admin) + Manga Verde | — | They read this package | **They adopt nothing, and nothing on a live screen moves.** `MultiSelectFilterDef.selectAll` and `GridFilterCellDef.multiple` did not exist before `3143646` (2026-09-10) and **DC pins `6ed975d`** (`bananaworld-dc/package.json:55` — CR-008, pre-CR-009). No consumer can be on a sha that has the code being fixed. |
| **S5** | The legacy HTML `width` attribute on a `<td>` a consumer writes in its own JSX | Consumers | The browser | **The package must forward it, and will again (§2.4).** DC passes none — grep for `(TableCell\|TableHead\|GridHeadCell)[^>]*\bwidth=` across `bananaworld-dc/src` returns **0 matches**. CRM, RMS, org-admin and Manga Verde **cannot be read from this worktree**: each greps its own tree before its own pin bump, exactly as CR-007 required for `valign`. After this fix that grep is a courtesy rather than a gate — the attribute keeps working either way. |
| **S6** | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` | — | — | **Still does not exist in this repo — the ninth change to raise it.** Creating it is a governance decision for the owner, not something a change may invent. This table is the record meanwhile, and it goes into `runs/change-NN/` at close. |

## 5. Files expected to touch

**Source (4):**

| File | What |
|---|---|
| `src/components/MultiSelectMenu.tsx` | `MultiSelectOption`; `multiSelectChosenLabels` (moved in from the toolbar, body unchanged); `multiSelectToggle` (new, preserves unknown ids); `MultiSelectAllRow` — `onToggle` → `onShowEverything`, and its state/label derivation per the owner's pick. |
| `src/components/GridFilterRow.tsx` | `MultiSelectCell` only: map options once, read the shared arithmetic, count `selected.length`, `onCommit([])` on the master row. `SelectCell` untouched. |
| `src/components/DataTableToolbar.tsx` | Delete the local `chosenLabelsInOptionOrder` and the local `toggle` reducer in favour of the shared ones; master row → `onShowEverything`. `"allOption"` branch untouched. |
| `src/components/Table.tsx` | `TableCellProps.width` widened to admit the legacy attribute; `isColumnWidth`; forward `htmlWidth` to the `<td>`. `TableHead` deliberately unchanged. |

**Tests (4 files, excluded from the estimate as work that would be done anyway):**

- `tests/components/Grid.test.tsx` — **`:486-521` currently pin the F2 defect and get rewritten**: the
  master row commits `{}`, blank-valued rows survive it, and the second tap is a no-op rather than a
  reversal. New: a cell whose `values` hold a retired id reads `Cold room 1 +1` / `2 chosen` / set
  chrome, and a tick keeps that id.
- `tests/components/DataTableToolbar.test.tsx` — **`:486-505` likewise**: after the master tap the
  `"—"` row is **present** and "Clear" is **off**. New: the unknown-id toggle case. The seven-screen
  DOM snapshot must stay **zero-diff** (no shipped screen declares `selectAll` or `multiSelect`).
- `tests/components/Grid.additive.test.tsx` — new: `<TableCell width={120}>` renders `<td
  width="120">` and typechecks; `<TableCell width="wide">` emits `max-w-[20rem]` under `truncate` and
  no DOM `width`; a `MultiSelectFilterDef` without `selectAll` still renders "All depots" unchanged.
- `tests/components/Table.test.tsx` — the width-step assertions still green; one path emits at most
  one `max-w-` class.

🔴 **Two existing specs assert the defective behaviour and will be rewritten.** That is the point of
this change and must be called out in the evidence: they are not being edited to make a build pass —
the assertions themselves are what CR-009 got wrong (the `"—"` row's disappearance is *written into*
`DataTableToolbar.test.tsx:499`). Every other spec in the suite must stay untouched and green.

**Not touched:** `src/lib/table-controls.ts`, `src/lib/grid-view.ts`, `src/components/index.ts`,
`src/lib/index.ts` (no export moves), `package.json`, `pnpm-lock.yaml`, any `runs/epic-*/`, any
`milestone-NN/`, anything under `runs/current/epic-plan/`, and **anything at all inside
`bananaworld-dc`**.

## 6. How the additive claim gets proven

1. `pnpm typecheck` and `pnpm test` — baseline **re-measured before any edit** (CR-009 closed at
   363/17), then after.
2. **Byte-identity harness reused** (`runs/change-08/`, handover point 10 — normalise
   `radix-[A-Za-z0-9_:-]+` first): every caller shape rendered against `main@3143646` and against the
   build. The expected diff set is **exactly** the states the findings name — the master row, a
   tick-list holding an id its options do not offer, and a `<td>` that was given a legacy `width`.
   Anything else differing is a regression.
3. **The `DataTableToolbar` DOM snapshot stays zero-diff** — the shipped `"allOption"` toolbars are
   the caller population that actually exists.
4. **Named callers checked, and why they are unaffected:**
   - `bananaworld-dc` — pins `6ed975d`, **before** CR-009. Declares no `multiSelect` filter
     (`kind: "multiSelect"` → 0 matches in `src`), no `selectAll`, no `multiple: true`, and passes no
     `width` to `TableCell` / `TableHead` / `GridHeadCell` (0 matches). Unaffected on every axis.
   - CRM, RMS, org-admin, Manga Verde — **not readable from this worktree, and no claim is made about
     them beyond this**: `selectAll` and `multiple` are one day old, so no pin can hold them; the
     `width` hazard is repaired rather than documented, so a grep is a courtesy not a gate.
   - Inside the package: `MultiSelectMenu` has exactly two callers, both changed here.
5. Mutation battery on the fixed lines, restoring **original bytes** (never `git checkout --` —
   handover point 7).

## 7. Open questions

- **OQ-1 — the owner's pick (A / B / C).** Blocking for the master row's rendering only; the rest of
  the change is independent of it. Recommendation: **A**.
- **OQ-2 — `(string & {})` under this repo's TS config.** If it is rejected, fall back to `| string`
  (§2.4). No behavioural difference.
- **OQ-3 — should the trigger say something when a filter holds an id the list no longer offers?**
  Today it reads the raw id as a label, which is what the toolbar has always done. Left as-is:
  inventing a "(retired)" affix is a new idea and a wording decision, not a defect fix. Recorded as
  debt.
- **OQ-4 (carried, unresolved, not this change's)** — handover point 13: whether `max-width` caps a
  `<td>` under `table-layout: auto`. Untouched here; the probe still ships at
  `runs/change-08/output/truncate-probe.html`.

## 8. Migration

**None.** This package has no database by construction, and nothing already written to disk by a
consumer changes meaning (§4, S1/S3).

## 9. Technical debt this change knowingly creates or inherits

For `runs/change-NN/technical-debt.md` when built — **never into a closed epic's archive**:

1. **TD-1 from CR-009 stands**: the grid's tick-list and the shipped toolbars still differ in their top
   row until DC and the CRM each pass `selectAll: "master"` in their own change. This change narrows
   the divergence to that one row and nothing else.
2. If the owner picks **C**, the `(blank)` entry needed to make "untick to narrow" honest about rows
   with no value is debt, not scope (§2.1).
3. OQ-3's wording for a retired value.
4. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist (§4, S6) — a governance decision
   for the owner, raised for the ninth time.
