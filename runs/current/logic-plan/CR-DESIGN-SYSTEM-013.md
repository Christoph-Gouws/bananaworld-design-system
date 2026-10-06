# CR-DESIGN-SYSTEM-013 — logic plan: "Select all" ticks every option, so the reader can untick what they don't want

> Raised by the owner, 2026-10-06. **Planning session only. No feature code was written.**
> `bananaworld-dc` was **read only** (reads and greps; nothing written, staged or formatted).
> Base: `main` @ `26fa005` (CR-DESIGN-SYSTEM-012). DC's pin, read from its own `package.json:57`: `26fa005`.

<!-- OWNER-BRIEF-START -->

**What you'll be able to do.** Open any filter list (batches, rooms, customers) and every entry is already ticked. Untick the two batches you don't want and only those two disappear. "Select all" ticks everything again. Untick "Select all" and every tick clears, so you can tick just the few you want. The box at the top says what you're seeing, for example "All except SBF-003".

**Please confirm.**
1. "Everything except these two" is remembered that way, so a batch received tomorrow shows up in saved, shared and scheduled reports. Remembering the ticked ones instead would quietly leave new batches out, and breaks past 40 batches.
2. Rows with no batch filled in keep showing when you untick a batch.
3. If you untick everything and close the list without ticking anything, the report shows everything again rather than an empty page.
4. Pick a look (A, B or C) from the page.

**Not included.** The warehouse and sales apps don't change yet. Each one switches this on in its own follow-up. The warehouse follow-up also teaches saved reports, shared links and schedules to remember "except".

**Risk.** Nothing changes on any live screen until an app switches it on. Saved reports you already have open exactly as they do today.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation and what was read

- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (globbed for all four, recursively). The standing rules come from the conductor prompt's project rules, the estate `CLAUDE.md`, and `runs/current/SESSION_HANDOVER.md`. That handover is one change stale: it describes CR-011, while `main` already carries CR-012 (`26fa005`, PR #31). Nothing in CR-012 (Combobox `group`) touches the tick-list.
- **Read in this repo:** `src/components/MultiSelectMenu.tsx`, `GridFilterRow.tsx`, `DataTableToolbar.tsx`, `src/lib/grid-view.ts`, `src/lib/table-controls.ts`, the barrels, the CR-010 and CR-012 plans and the CR-010 mockup (design direction).
- **Read in DC (read-only):** `package.json:57` (pin), `src/components/reports/grid-props.ts:65-101` (the one mapper that sets `multiple: true` on all 27 select columns), `src/lib/list-filter-sort/select-values.ts` (DC's asserted twin of `gridFilterSelected`/`gridFilterSelect`), `src/lib/list-filter-sort/types.ts:134-165`, `src/lib/reports/grid/grid-request.ts:294-345`, `src/lib/reports/bounds.ts:205-257`, `src/lib/reports/saved-view.ts:140-176`, `src/lib/reports/transactions/batch-movement.ts:815-837`, `src/lib/list-filter-sort/sql.ts:103-143`, plus greps.
- **CRM, RMS, org-admin: not readable from here.** No claim is made about their code.

## 1. The behaviour, as a state machine

Today (`selectAll: "master"` in the grid; `"master"`/`"allOption"` in the toolbar): an empty list means "not narrowed" and shows **no** option ticked. Ticking one narrows to **only** that one.

The new mode, **`selectAll: "allTicked"`**, adds a committed **exclusion** state and an uncommitted **nothing-ticked** draft:

| State | Stored value | Option ticks | Master row | Master count | Trigger |
|---|---|---|---|---|---|
| **Everything** (not narrowed) | absent key / `values: []` — **unchanged** | every option ticked | ✓ | `All 14` | placeholder ("All batches"), unset chrome |
| **Everything except E** | new `excluded: E` | options not in E | – (mixed) | `12 of 14` | per layout A/B/C, set chrome |
| **Only I** | `values: I` — **unchanged include-list** | options in I | – (mixed) | `3 of 14` | `SBF-001 +2` (today's wording) |
| **Nothing ticked** (draft) | **nothing committed**: the filter reads as *Everything* | none | ☐ | `0 of 14` | placeholder |

**Transitions (all in one shared function, §4):**

- From **Everything**: untick `v` → **Except [v]**. Untick master → **Nothing ticked**.
- From **Except E**: untick `v` → **Except E+v**; re-tick `v` → **Except E−v**, and an empty E → **Everything**. If E would cover every option the list offers → **Nothing ticked**. Master (mixed) tap → **Everything**.
- From **Only I**: tick `v` → **Only I+v**, and once I covers every option offered → **Everything** (all boxes ticked means nothing is hidden). Untick the last → **Nothing ticked**. Master (mixed) tap → **Everything**.
- From **Nothing ticked**: tick `v` → **Only [v]**. Master tap → **Everything**.

**Which form a filter takes follows how the reader got there.** Starting from everything and unticking gives "everything except"; starting from nothing and ticking gives "only these". Each form is then labelled for what it is. This is the predictable reading, and it is what makes Excel's list feel natural.

**The Nothing-ticked draft (owner confirm point 3).** A live, committing menu has no "OK" button to grey out the way Excel does. So zero ticks is held **inside the open menu only** (local `useState`, reset by `onOpenChange(false)`), and the committed filter at that moment is **Everything**. The footer reads `Nothing ticked — showing everything until you tick one`, so the gap between the boxes and the table is stated, not hidden. Closing the menu leaves Everything; reopening shows every box ticked. The alternative, an empty table, needs a third stored state ("show nothing") that no consumer's query writer can express. Every narrower failure in this estate has been the silent kind, so the plan does not take that route.

**Rows with no value (owner confirm point 2).** In **Except E**, a row whose value is blank is **kept**: it is not one of the excluded values. In **Only I** it is still left out, as today (a request for named values). This is the CR-010 rule seen from the other side: unticking hides *exactly* what was unticked.

## 2. Why this is opt-in, and how it becomes "the standard"

The owner wants this to be standard for every tick-list. The **lane rule** is that every existing caller in every consumer renders byte-identically, with no default changed. Those two goals are reconciled the way CR-009 did it for `selectAll: "master"`: the package ships the behaviour **behind one word**, and each app flips that word in its own change, at its own gate, against the merged sha. In DC that is **one line**: `grid-props.ts:95` already builds all 27 select cells through one mapper, so `selectAll: "allTicked"` there reaches every report, transaction list and document list at once.

Opt-in is also **required for correctness**, not just for the lane. The new mode can emit a value carrying `excluded`. A consumer whose query writer has not been taught to write and read it would receive a filter it cannot express. (Its failure direction is *wider*, see §3. It is still wrong.) So a consumer turns the mode on in the same change that teaches its parser, which is the argument `GridFilterCellDef.multiple`'s doc already makes (`GridFilterRow.tsx:87-92`).

**Defaults do not move:** the grid's `selectAll` defaults to `"master"` (what every multi cell renders today) and the toolbar's to `"allOption"` (unchanged).

## 3. 🔴 The design decision: exclusion is stored as an EXCLUDE list

**Decision: "everything except X" is stored as an exclude list, in a NEW field, not as an include list of the remaining options.**

Evidence, from the code and not from preference:

1. **The include list breaks at DC's own bound.** `bounds.ts:228` caps one select filter at `MAX_FILTER_VALUES = 40`, and `grid-request.ts:337-338` keeps only the first 40 and names the column. The batch facet holds *"every batch this depot has ever had, CLOSED-OUT ONES INCLUDED"* (`batch-movement.ts:815-817`). "Everything except one" of 200 batches as an include list is 199 ids. It would be **clamped to 40 batches**, which is a different report from the one on screen. The 4 000-character `saved_view.definition` CHECK (`bounds.ts:233-245`) would refuse the save outright long before the clamp. An exclude list of one is one id.
2. **New values.** An include list silently leaves out tomorrow's batch from every saved view, share and schedule. The owner named this risk; the exclude form avoids it by construction.
3. **Existing stored values are untouched.** No existing value shape changes meaning. An include list (`f_batch=A&f_batch=B`) still parses and narrows exactly as today, so every saved view, share and schedule on disk keeps its meaning. `batch-movement.ts:821-836` warns about killing stored views, and nothing here does. Exclusion lives in a **new field** with a **new wire parameter**. It is a new value, not a reinterpretation of an old one.
4. **The failure direction on a reader that does not know the field is WIDER, never inverted.** The exclusion value is `{ kind: "select", value: "", excluded: [...] }`. DC's `selectedValues` (`select-values.ts:40-44`) and the package's `gridFilterSelected` read `value: ""` as **nothing chosen**, so an un-taught reader shows *everything*, including X. It never shows *only* X. The rejected alternative was to put the excluded ids in `value`/`values` with a mode flag. An old reader would then show precisely the batches the reader hid. That is the worst possible failure, and this shape rules it out.

**Rejected: a new union member** (`kind: "selectExcept"`). `ListFilterValue` in DC mirrors the select arm *verbatim* because `ReportGrid` hands `state.filters` straight to `GridFilterRow` (`types.ts:141-144`). A new union member breaks that assignment at `tsc` on DC's pin bump. An optional field does not: structural assignability holds, and nothing is a fresh literal.

## 4. The shapes and functions (all additive)

### 4.1 `src/lib/grid-view.ts` (the grid's filter value)

- `GridFilterValue` select arm gains `readonly excluded?: readonly string[]`. **Invariant:** present only when non-empty. When present, `value === ""` and `values` is absent. Never authored by hand, with one constructor and one reader, as for `values`.
- **New export** `gridFilterExclude(ids: readonly string[]): GridFilterValue | null`. Drops blanks and repeats, keeps displayed order, returns `null` for none (which `gridFilterSet` drops).
- **New export** `gridFilterExcluded(value: GridFilterValue | undefined): readonly string[]`. The one reader. Returns `[]` for anything else.
- `gridFilterIsEmpty` select arm also answers **false** when `excluded` is non-empty. For every value expressible before this change it answers bit for bit what it answers today, because no such value carries `excluded`.
- `gridFilterSelected`: **unchanged**. For an exclusion it returns `[]`, documented as "an exclusion names no included id; read `gridFilterExcluded`."
- **Wire encoding stated in the header** (the package writes no URL, but it states the encoding a parser is built to, as §A.3 did): **a repeated `f_<key>_not=<id>` parameter**, in displayed-option order. It follows the existing `_from`/`_to` suffix idiom (`grid-state.ts:188-189`). A build that does not know `_not` ignores it and widens. An include list and an exclusion never appear on the same key together.

### 4.2 `src/lib/table-controls.ts` (the toolbar engine)

- `MultiSelectFilterValue` gains `readonly excluded?: readonly string[]`. Same invariant: when present, `values` is `[]`.
- `MultiSelectFilterDef.selectAll` union gains `"allTicked"`. ⚠ This widens a string-literal union on an exported type. Consumers *write* this field and do not read it. A consumer with an exhaustive `switch` over its own `def.selectAll` would need a case at its pin bump. Searched DC (`selectAll` → 0 hits in `src/`); CRM is unreadable, so this is named as a residual for the CRM follow-up.
- `matchesFilter` multiSelect arm: **before** the existing `values.length === 0` line, add `if ((value.excluded ?? []).length > 0) return actual === null || !value.excluded.includes(actual)`. Unreachable for every existing value.
- `hasActiveControls` multiSelect arm: `v.values.length > 0 || (v.excluded ?? []).length > 0`.
- **Stored contract (CRM's saved filters, CR-CRM-011):** `storedFromFilterValue` keeps its signature *and* its body. For an exclusion it already returns `null` (because `values` is `[]`), and that is now **documented as "carries no inclusion; store the exclusion with the sibling"**. **New export** `storedExclusionFromFilterValue(value): readonly string[] | null`. `filterValueFromStored` gains an **optional third parameter** `storedExcluded?: unknown`. Omitted, it behaves exactly as today. ⚠ A consumer that opts the toolbar into `"allTicked"` and does not store the exclusion would save "everything". That is why the CRM follow-up must ship the flip and the storage together (§7, S2).

### 4.3 `src/components/MultiSelectMenu.tsx` (the shared arithmetic and parts, internal, not barrelled)

One arithmetic, as CR-010 established, so the two surfaces cannot drift:

- `type MultiSelectReading = { mode: "all" } | { mode: "only"; values } | { mode: "except"; excluded } | { mode: "none" }`. `"none"` is the draft and is never committed.
- `multiSelectTicked(options, reading, value): boolean`: which boxes show ticked.
- `multiSelectAllTickedToggle(options, reading, value, checked): MultiSelectReading`: every transition in §1, in one place. Stored ids the options no longer offer are **preserved** in either list (CR-010 F1's rule, unchanged).
- `multiSelectAllTickedLabel(placeholder, options, reading)`: the trigger wording, per the approved layout.
- **New part `MultiSelectEveryRow`** (the master row for this mode). Radix `checked` is `true` / `false` / `"indeterminate"` from the reading. Its two gestures are `onTickEvery` (which can only clear) and `onUntickEvery` (which can only enter the draft). It branches on **its own known state**, never on the boolean Radix hands over (when ticked → untick every; otherwise → tick every). This keeps CR-010's "the master row cannot narrow" property: neither gesture can commit an id list. `MultiSelectAllRow` is **not touched**.
- `MultiSelectItem` is reused as is.

### 4.4 The two surfaces: a new path each, so the existing paths are literally untouched

- `GridFilterCellDef` gains `selectAll?: "master" | "allTicked"` (default `"master"`, meaningful only with `multiple: true`).
- `GridFilterRow.tsx`: a new `AllTickedCell` beside `MultiSelectCell`, chosen at the dispatch (`:507-522`) when `def.multiple === true && def.selectAll === "allTicked"`. `MultiSelectCell` and `SelectCell` keep their bytes. This follows the CR-009 precedent (`GridFilterRow.tsx:272-276`) that made byte-identity provable rather than argued. It commits through `gridFilterSelect` / `gridFilterExclude` and reads through `gridFilterSelected` / `gridFilterExcluded`.
- `DataTableToolbar.tsx`: a new `AllTickedFilterControl` chosen at the dispatch (`:228-238`) when `def.selectAll === "allTicked"`. The trigger chrome string is hoisted into a module constant shared with `MultiSelectFilterControl`, so the two cannot drift. Its rendered class is unchanged, and that is proven by the seven-screen snapshot.
- Both surfaces' footers in this mode: `12 of 14 shown` / `Nothing ticked — showing everything until you tick one`, finalised by the layout pick.

### 4.5 Barrels

`src/index.ts` and `src/lib/index.ts` gain `gridFilterExclude`, `gridFilterExcluded`, `storedExclusionFromFilterValue`. Nothing is removed or renamed.

## 5. Proving the additive claim (to be done at build, NOT claimed now)

- **Re-measure the baseline** before any edit (`pnpm test`, `pnpm typecheck`).
- **Byte-identity:** re-run the committed harness `runs/change-09/output/{byte-identity-setup.mjs, byte-identity.harness.test.tsx}` against `main@26fa005` (normalise `radix-…` ids first, and LF before matching). Expect 0 differences across every existing caller shape, because no existing shape sets `selectAll: "allTicked"` or carries `excluded`.
- **The seven shipped toolbar screens:** whole-DOM snapshot, zero-line diff.
- **Existing callers checked and why they are unaffected:** DC's 27 grid select cells (`grid-props.ts:95` sets `multiple: true`, no `selectAll`, so the `"master"` default holds: `MultiSelectCell`, untouched). DC's toolbar does not adopt `multiSelect` (`from-table-controls.ts:45-46, 90`). DC's dead private copy of `table-controls.ts` is never imported against the package (handover item 14). CRM/RMS/org-admin are unreadable: the claim rests on "no caller can set a value that did not exist before".
- **Pure-function specs** for every transition in §1, both forms, retired-id preservation, blank-row keep in Except, and the empty-flags on `gridFilterIsEmpty`/`hasActiveControls`.
- **Mutation battery** (keep the "ANCHOR NOT FOUND" non-zero exit): master row committing an id list; Except dropping blank rows; collapse-to-Everything removed; draft committing "show nothing"; `gridFilterIsEmpty` ignoring `excluded`.
- **Remember from the handover:** press `{Escape}` before asserting on toolbar "Clear" (an open menu `aria-hidden`s the page). Normalise CRLF before running `quality-sensors.mjs`.

## 6. Files expected to change

| File | What |
|---|---|
| `src/components/MultiSelectMenu.tsx` | reading type, `multiSelectTicked`, `multiSelectAllTickedToggle`, `multiSelectAllTickedLabel`, `MultiSelectEveryRow` |
| `src/components/GridFilterRow.tsx` | `GridFilterCellDef.selectAll`, `AllTickedCell`, dispatch branch |
| `src/components/DataTableToolbar.tsx` | `AllTickedFilterControl`, dispatch branch, hoisted trigger chrome constant |
| `src/lib/grid-view.ts` | `excluded` field, `gridFilterExclude`, `gridFilterExcluded`, `gridFilterIsEmpty` arm, wire-encoding header |
| `src/lib/table-controls.ts` | `excluded` field, `"allTicked"`, `matchesFilter` + `hasActiveControls` arms, stored sibling + optional param |
| `src/index.ts`, `src/lib/index.ts` | three new exports |
| tests: `Grid.test.tsx`, `DataTableToolbar.test.tsx`, `grid-view.test.tsx`, `table-controls.test.tsx`, a new `MultiSelectMenu` spec | new specs (no existing spec should need rewriting; any that does is a red flag to stop on) |

Paper trail lands in `runs/change-NN/` (next free number at build time). No migration: this package has no database.

## 7. Cross-app intersection map

| # | Seam | Who WRITES | Who READS | This change | Follow-up |
|---|---|---|---|---|---|
| **S1** | Grid filter value → DC report/list URL → `saved_view.definition`, saved-view **shares**, **schedules**, PDF echo | Package writes the **value shape** (`excluded`). DC writes the **wire** (`f_<key>_not`) and the **stored definition** | DC's `grid-request.ts` parser, SQL builder, schedule dispatch, PDF/echo, saved-view summary | Shape, constructor/reader, stated encoding. **No DC byte moves.** | **CR-DC (new), per app.** Bump the pin to the **merged** sha on `main` (never this branch, KI-M001E19-002). `grid-props.ts:95` → `selectAll: "allTicked"`. `grid-state.ts:~214` appends `f_<key>_not`. `grid-request.ts:315-339` reads it with the same `MAX_FILTER_VALUES` clamp (for an exclusion the clamp *widens*, and it must still be named). `grid-request.ts:413-435` dropped-filter detection learns `_not`. `select-values.ts` twins and the equality spec extend to `gridFilterExclude`/`Excluded`. `sql.ts:135-143` emits `AND (expr IS NULL OR expr NOT IN (…))` (blank rows kept, §1). Echo/PDF/summary sentence "All except …". Existing include-list definitions must be asserted byte-identical on round-trip. Schedules and shares carry the definition string, so they inherit it. |
| **S2** | Toolbar filter value → CRM's persisted per-rep filters (CR-CRM-011) | Package writes `MultiSelectFilterValue` and the stored helpers. **CRM writes** the stored map | CRM reads back via `filterValueFromStored` | Field, `"allTicked"`, sibling stored helper, optional param | **CR-CRM (new).** Pin bump on the merged sha. Flip `selectAll` per def. Store `storedExclusionFromFilterValue` beside the existing value, **in the same change**, or a saved exclusion re-opens as "everything". Check any exhaustive `switch` over `selectAll`. **Unverified here: CRM is unreadable.** |
| S3 | DC's flag-OFF list toolbar (`from-table-controls.ts`) | n/a | n/a | none | none: it ignores `multiSelect` by design |
| S4 | DC's dead private copy of `table-controls.ts` | n/a | n/a | none | already-owed cleanup (handover item 14), not widened here |
| S5 | RMS, org-admin | n/a | n/a | none: opt-in, and nothing they can render changes | none unless they choose to adopt |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the tenth change to raise it, and the decision belongs to the owner. S1 and S2 are recorded here and in the change's `known-issues.md` at build.

## Rule sites

**The rule.**
- *Today:* a tick-list filter shows only the ticked values, and nothing ticked means "not narrowed". A row with no value is excluded once any value is chosen.
- *After:* the same, **plus**, in the opt-in `"allTicked"` mode, a filter may be "everything except these". That form **keeps** rows with no value and keeps values that appear later. Ticking every option collapses to "not narrowed". Zero ticks is an uncommitted draft that shows everything.

**Sites (found by search):**

| Site | Change / leave | Reason |
|---|---|---|
| `src/lib/table-controls.ts:293-298` `matchesFilter` multiSelect arm | **change** | add the `excluded` arm ahead of the include arm |
| `src/lib/table-controls.ts:231-238` `hasActiveControls` | **change** | an exclusion is active ("Clear" must light) |
| `src/lib/table-controls.ts:178-211` `filterValueFromStored` | **change** | optional `storedExcluded` param |
| `src/lib/table-controls.ts:215-224` `storedFromFilterValue` | leave (doc only) | body already returns `null` for an exclusion. The signature is a contract, so the sibling carries the exclusion |
| `src/lib/table-controls.ts:140-151` `emptyFilterValue(s)` | leave | empty is still `values: []`, no `excluded`: one empty state |
| `src/lib/grid-view.ts:163-172` `gridFilterIsEmpty` | **change** | an exclusion is not empty, or `gridFilterSet` would drop it |
| `src/lib/grid-view.ts:180-184` `gridFilterSelected` | leave | includes only. An exclusion names no included id (and this is what makes an old reader widen, §3.4) |
| `src/lib/grid-view.ts:193-199` `gridFilterSelect` | leave | the include constructor is unchanged |
| `src/lib/grid-view.ts:151-160` `gridFilterSet` | leave | delegates to `gridFilterIsEmpty` |
| `src/components/MultiSelectMenu.tsx:92-102` `multiSelectToggle` | leave | include arithmetic for the existing modes |
| `src/components/MultiSelectMenu.tsx:196-247` `MultiSelectAllRow` (`chosen === 0 ? true`) | leave | `"master"` mode keeps today's meaning |
| `src/components/GridFilterRow.tsx:283-374` `MultiSelectCell` (`selected.length > 0`, "None chosen") | leave | default path, byte-identity |
| `src/components/GridFilterRow.tsx:507-522` dispatch | **change** | route `"allTicked"` to the new cell |
| `src/components/DataTableToolbar.tsx:320-430` `MultiSelectFilterControl` (`chosenNone`, `onChange([])`) | leave (except the hoisted constant) | default paths, seven-screen snapshot |
| `src/components/DataTableToolbar.tsx:228-238` dispatch | **change** | route `"allTicked"` |
| `tests/components/{Grid,DataTableToolbar,grid-view,table-controls}.test.tsx` (33 hits on the terms below) | leave | they pin the *default* modes, which do not change. New specs are added beside them |
| DC `select-values.ts:40-64`, `grid-request.ts:315-339, 413-435`, `grid-state.ts:188-217`, `sql.ts:135-143`, `grid-props.ts:95` | leave **here** | read-only sibling. Every one is named in S1 for the DC follow-up |

**Search terms used:** `MultiSelectAllRow|MultiSelectItem|multiSelectToggle|multiSelectChosenLabels|multiSelectTriggerLabel` (src) · `gridFilterSelect|gridFilterSelected|gridFilterIsEmpty|storedFromFilterValue|filterValueFromStored|MultiSelectFilterValue` (barrels) · `None chosen|All 3|of 3|onShowEverything|hasActiveControls\(|gridFilterIsEmpty\(` (tests) · in DC: `saved view|savedView|multiple: true|multiSelect`, `multiple|multiSelect|selectAll|gridFilterSelected|gridFilterSelect\b`, `MAX_FILTER_VALUES|filterValueFor|getAll\(|f_\$\{`, `function selectClauses|= ANY\(|IN \(`.

## 8. Open questions / residuals

1. **Owner confirm points 1–3** in the brief: exclusion form, blank rows kept in Except, zero-ticks shows everything. Each is the plan's decision. A REVISE on any of them changes §1/§3 only.
2. **Layout pick A/B/C** (trigger wording and footer, see the mockups). The state machine is identical across all three.
3. CRM's handling of `selectAll` and of its stored map is **unverified** (unreadable).
4. The handover's standing items (cross-system register, CR-008 decision-log entry, OQ-8) are untouched and still open.

## 9. Not an epic

This is one behaviour in one shared control family, with two app follow-ups that are each a single change. I cannot name five milestones it decomposes into, so it is not an epic.
