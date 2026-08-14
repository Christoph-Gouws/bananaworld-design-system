# Developer handover — CR-DESIGN-SYSTEM-003

> Written for the next developer in any of the four consuming repos. Everything here is either a
> contract you can rely on or work you own.

## 1. What landed, in one paragraph

`@bananaworld/design-system` gained a **third filter kind, `multiSelect`**, beside `select` and
`dateRange`. A filter definition declares which kind it is; a screen that declares `select` declares
exactly what it declared before and renders byte-identically (proved by an unchanged DOM snapshot
hash across all seven toolbar screens). The multi-select renders as a Radix `DropdownMenu` of
`CheckboxItem`s — no new dependency, the same primitive `RowActions` already ships. The package also
gained two pure helpers for the **stored shape** of a filter value, and the filter types are now
exported so a consumer can name them.

## 2. ⚠ THE PIN IS THE OTHER HALF — nothing here reaches any app yet

**No consumer pin was bumped by this change and no consumer file was touched.** Each app names this
package by an exact commit sha in its own `package.json` and moves when it chooses.

> **When you bump, bump to the sha that is MERGED on `main` — never a branch sha.**
> `KI-M001E19-002` is that exact mistake on record.

⚠ The recorded pin values disagree between two documents in this repo (`SESSION_HANDOVER.md` §1 says
DC `b1373c78` / CRM `4bc1f220`; the approved plan §1.4 says both are `365be65`). Neither is checkable
from the build worktree. **Read your app's own `package.json`, not either document.**

## 3. 🔴 CRM — the seven-point obligation before you declare ANY availability filter as `multiSelect`

CR-CRM-011 (2026-08-10) shipped saved availability views that persist every toolbar filter value
verbatim, per rep. **This package cannot see that table.** Both cross-version directions currently
fail by *silently widening* — the outcome the request explicitly names as unacceptable — and neither
is fixable from here. What this change ships is the shape contract and an honest signal; the rest is
yours.

**The contract:** a filter value is stored as a bare `string` when it holds one value, and as a
`string[]` only when it holds two or more. A multi-select holding one choice therefore writes exactly
what a single-select writes today, and an older build reads it correctly for free.

1. **Widen the stored type** to `filters: Readonly<Record<string, string | readonly string[]>>`
   (`lib/availability/view-state.ts:53`), and keep `state_version` at 1 — the reconciler is already
   the one door, exactly as CR-CRM-011 argued for the legacy `room` key.
2. **`reconcileFilters` (`:172–189`) must accept an array arm.** Today `if (typeof value !== "string"
   || value === "") continue;` skips an array **before** any `dropped.push`. 🔴 **That `continue` is
   the silent widen** — the array is not the defect, the silence is.
3. **`applyState` (`:358–360`) must stop hard-coding `{kind: "select"}`.** Build the value from the
   definition with `filterValueFromStored(def, stored)`, so a stored `"Cape Town"` restores as
   `["Cape Town"]` on a multi-select filter instead of falling through `matchesFilter` and matching
   every row.
4. **`captureCurrent` (`:366–380`) must stop hard-coding `value.kind === "select"`.** Use
   `storedFromFilterValue(value)` so one chosen value still writes a **bare string** and stays
   readable by a build on the old pin.
5. **Judge each stored value against the options individually.** Drop the ones that no longer exist
   and keep the rest, naming what went. Dropping the whole filter because one of three values retired
   widens further than necessary.
6. **`noteLegacyRoom`'s idiom applies unchanged:** the reconciler never writes on read. A re-save is
   what upgrades a row.
7. **Test the four cardinalities** the request names — none / one / several / all — plus both
   cross-version directions, plus this one, which is the whole point:

   > a pre-change row `{"depot": "Cape Town"}` opens showing **Cape Town only**, not everything.

**Until all seven are done, CRM must not declare any availability filter as `multiSelect`.** Adopting
the kind without the reconciler work is precisely the silent widen this section exists to prevent.

`StoredFilterReading.widened` is the hook for point 5's notice: the package supplies the *fact*; the
sentence a rep reads ("the depot filter is showing every depot") stays in the app, where the rest of
that vocabulary already lives (TECH-COMP-003).

## 4. The six seams, and who owns each

| Seam | What | Owner |
|---|---|---|
| **S-1** | This package writes the new kind; DC (6 screens), CRM (1) and org-admin (4) read it — each only after it bumps its own pin | Each consumer |
| **S-2** | 🔴 CRM's saved availability views — the one seam that can hurt a real person | CRM, per §3 |
| **S-3** | org-admin builds its own controls over the shared engine (`app/(console)/_components/list-controls.tsx`) and constructs `FilterValue` literals directly. It reads the **type**, not the UI, and is unaffected. If it ever wants a multi-select it must build its own trigger — the control is private to `DataTableToolbar` (D-10) | org-admin, if it ever asks |
| **S-4** | **DC keeps a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing in DC imports** (its six screens import `useTableControls` from `@/components/ui`, which re-exports this package). It will not gain the new kind and drifts further with this change | DC — delete it during the adoption change |
| **S-5** | RMS and Mangaverde have zero usages. They gain a type they do not import | Nobody; no action |
| **S-6** | No database seam anywhere. This package has none, and adds no query, migration or column | — |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist in this repo (third change to raise
it — `known-issues.md` C-3), so this table is the record.

## 5. The new export surface — additive, and safe to compile against

Nothing was renamed, moved or removed. From the package **root**:

```ts
import {
  filterValueFromStored, storedFromFilterValue,
  type StoredFilterReading,
  type FilterDef, type SelectFilterDef, type MultiSelectFilterDef, type DateRangeFilterDef,
  type FilterValue, type SelectFilterValue, type MultiSelectFilterValue, type DateRangeFilterValue,
  type FilterValues, type SelectOption,
} from "@bananaworld/design-system";
```

`SortDir`, `SortState` and `SortAccessor` are deliberately **not** exported — they are not what this
change is about. `AvailabilityView.tsx:118`'s note that `FilterDef` "is internal … so the shape is
pinned with `as const`" is now out of date: you can name the type.

### 5.1 Adopting the kind on a screen — the whole diff is one word

```diff
- { kind: "select",      key: "depot", label: "Depot", accessor: (r) => r.depot },
+ { kind: "multiSelect", key: "depot", label: "Depot", accessor: (r) => r.depot },
```

Option derivation, labelling, the "All …" wording and clearing are identical between the two kinds by
construction. What changes: the value becomes `{kind:"multiSelect", values: string[]}` (`[]` = All),
matching is a **union**, and anything of yours that reads `filterValues[key]` must handle the new
shape — positive narrowing (`v.kind === "multiSelect" ? v.values : []`), never an `else`.

## 6. Semantics you can rely on

| Case | Behaviour |
|---|---|
| `values: []` | matches every row — the All state, mirroring `select`'s `value: null` |
| `values: ["a"]` | the **identical** row set to `select` with `value: "a"` |
| `values: ["a","b"]` | rows whose accessor is `"a"` **or** `"b"` — union, never intersection |
| accessor returns `null` or `""` | excluded as soon as anything is chosen, exactly as `select` excludes it |
| every option chosen | the same rows as `[]` **except** null-accessor rows; the control still reads "several chosen" |
| def/value kind mismatch | `matchesFilter` returns `true` — it never throws, and never crashes a filter screen restoring an old view. **It does widen**, which is what `filterValueFromStored` exists to prevent |

## 7. Two things not to undo

1. **`onSelect={(e) => e.preventDefault()}` on each `CheckboxItem`.** Radix menus close on select by
   default; this line is what keeps the menu open across several ticks. Removing it makes the rep
   re-open the menu per value — the change failing at the thing it exists to do. A spec fails without
   it, and that was verified by removing the line on purpose.
2. **The `multiSelect` arm of `hasActiveControls`.** Without it a multi-select value falls into the
   date-range branch, reads `.from` on an object that has none, and `undefined !== null` leaves the
   "Clear" affordance permanently lit on any adopting screen. Two specs pin it.

Also do not "tidy" `matchesFilter`'s trailing `return true` into a throw — it is the safety net that
keeps an old saved view from crashing a screen.

## 8. Follow-up work, by lane

| Lane | Work | Blocked on |
|---|---|---|
| **CRM** | The seven points in §3, then adopt `multiSelect` on the availability filters the owner wants (open question: `depot` only, or size/grade/box type/colour as well — it changes nothing here) | This change merging to `main` |
| **DC** | Nothing is required. Six screens keep working untouched. When it next bumps its pin: delete the dead private copy of `table-controls.ts` (S-4) | — |
| **org-admin** | Nothing is required. Four screens keep working untouched | — |
| **RMS / Mangaverde** | Nothing at all | — |
| **This package** | Nothing open. If a fourth filter kind ever arrives, split `DataTableToolbar.tsx` into one file per control (`readable-code-scorecard.md`) | — |

Still open from earlier changes, unchanged by this one: CR-DESIGN-SYSTEM-001's colour-stage chips on
the tablet receiving screen, and CR-DESIGN-SYSTEM-002's DC document-header adoption (including the
five contract assertions that redden **by design** at adoption).
