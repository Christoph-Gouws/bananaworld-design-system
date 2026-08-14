# Implementation summary — CR-DESIGN-SYSTEM-003

| Field | Value |
|---|---|
| Change | A toolbar filter can hold one value. Let it hold several, without disturbing the screens that hold one |
| Unit | Change Request. Archive: `runs/change-03/` |
| Branch | `change/cr-design-system-003`, off `origin/main` @ `9aa20f7` |
| Approved layout | **A** — the closed trigger reads `Cape Town +2` |
| Ship mode | **on-green** |
| Date | 2026-08-14 |
| Result | 5 source files modified (**+347 / −26**), 3 test files added (+910), **0 existing tests edited**, 189/189 green, typecheck clean |

## 1. 🔴 Plan-vs-code check — every fact the plan cites, verified against the code I actually have

The plan was written against `9aa20f7`; this session started from a fresh copy of the same commit and
spot-checked each citation before building. **Everything is still exactly as the plan describes.**

| Plan cites | Found | ✓ |
|---|---|---|
| `table-controls.ts:73` `emptyFilterValue` | line 73 | ✅ |
| `table-controls.ts:88` `hasActiveControls`, with the `else`-reads-`.from` trap | line 88, exactly that shape | ✅ |
| `table-controls.ts:97` `deriveSelectOptions(rows, def: SelectFilterDef)` | line 97 | ✅ |
| `table-controls.ts:138` `matchesFilter` with a `return true` fallback at :145 | lines 138–146 | ✅ |
| `DataTableToolbar.tsx:102` `optionsByKey` | line 102 | ✅ |
| `DataTableToolbar.tsx:227` the `All {label.toLowerCase()}` sentinel | line 227 | ✅ |
| `DataTableToolbar.tsx:180–188` the global Clear | lines 180–188 | ✅ |
| `package.json:41` `@radix-ui/react-dropdown-menu@^2.1.16` already a dependency | line 41 | ✅ |
| `src/lib/index.ts` does not export `table-controls` at all | confirmed | ✅ |
| `src/components/index.ts` exports only `DataTableToolbar`, `useTableControls` + 3 types | confirmed | ✅ |
| No collision for `SelectOption` / `FilterDef` / … in any barrel | grepped `src/` — no other definition or export of any of the ten names | ✅ |
| **No test exists for `DataTableToolbar` or `table-controls`** (§8.1) | confirmed: `tests/` held ChoiceGroup, Combobox, DocumentHeader, document-date, Select, pricing, sales-order | ✅ |
| Baseline suite "last known 115 / 9" | measured: **115 passed / 9 files** | ✅ |
| `RowActions.tsx` already ships Radix DropdownMenu at `--z-dropdown` | confirmed | ✅ |
| `vitest.config.ts` already globs `tests/components/**/*.test.tsx` | confirmed | ✅ |

**Nothing had moved; the plan's premise holds in full.** One inconsistency was noticed and it changes
nothing here — the pin values in `SESSION_HANDOVER.md` §1 (DC `b1373c78`, CRM `4bc1f220`) differ from
the plan's §1.4 (both `365be65`). Neither is checkable from this sandboxed worktree, and **this change
bumps no pin either way**. Recorded in `known-issues.md` C-4 for whoever bumps first.

## 2. What was built

### 2.1 The engine — `src/lib/table-controls.ts` (+122 / −11)

A third kind, added beside the two:

```ts
export interface MultiSelectFilterDef<Row> { kind: "multiSelect"; key; label; accessor; options? }
export interface MultiSelectFilterValue    { kind: "multiSelect"; values: readonly string[] }
```

`[]` means All, mirroring `select`'s `value: null` (D-2), so `clear()` and `emptyFilterValue` need no
special case. Four functions gained an arm — `emptyFilterValue`, `hasActiveControls`, `matchesFilter`
and (by parameter) `deriveSelectOptions`. Matching is a **union, never an intersection**: a row holds
one depot, so "and" would always be empty (D-3).

The `hasActiveControls` arm is the one the plan flagged as skippable and it is not optional: without
it a multi-select value falls into the date-range branch, reads `.from` on an object that has none, and
`undefined !== null` leaves the "Clear" affordance permanently lit. Two specs pin it.

### 2.2 The stored-shape contract (§5.3)

```ts
filterValueFromStored(def, stored: unknown): { value: FilterValue; widened: boolean }
storedFromFilterValue(value): string | readonly string[] | null
```

**One value stores as a bare string; two or more as an array.** So a multi-select holding one choice
writes exactly what a single-select writes today and a build on an older pin reads it correctly for
free — only the genuinely multi-value case needs new reader code. Reading never throws and always errs
wider, and says so: `widened: true` is the hook a consumer needs to tell a rep "this filter opened
wider than you left it" instead of widening in silence. The **wording stays in the app**
(D-8, TECH-COMP-003).

### 2.3 The control — `src/components/DataTableToolbar.tsx` (+190 / −15)

Radix `DropdownMenu` + `CheckboxItem` (D-4), the same primitive, portal and `--z-dropdown` the
row-actions menu already uses: no new dependency, no second dropdown idiom, and the keyboard and
screen-reader contract comes from the primitive rather than from hand-written key handlers.

- **Closed, layout A:** `All depots` → `Durban` → `Cape Town +2`. One line, the name truncates, the
  count does not. "First" is first in displayed option order, so it does not shuffle under the rep.
- **Open:** an "All …" row pinned at the top (checked when nothing is chosen; choosing it clears
  everything), a separator, one checkbox item per option, and a footer reading `3 chosen` with the
  `Esc` hint — the menu the owner approved.
- 🔴 `onSelect={(e) => e.preventDefault()}` keeps the menu open across ticks (D-5).
- Trigger chrome and the tablet `data-surface` step copied from `SelectTrigger`, so the toolbar's
  rhythm is unchanged whichever kind a screen declares.

### 2.4 The barrels (+35 / −0)

Ten filter def/value/option **types** from `src/components/index.ts` (D-9 — CRM's own source records
the cost of their absence), and the two helpers plus `StoredFilterReading` from `src/lib/index.ts`,
enumerated again in `src/index.ts`. `SortDir` / `SortState` / `SortAccessor` deliberately not exported.

## 3. How the additive claim was proved rather than asserted

1. **36 characterisation specs written and passing BEFORE a line of source changed** — there was no
   test for this engine at all, so a green suite would otherwise have proved nothing (D-11).
2. **The seven toolbar screens snapshotted pre-edit and re-run post-edit** — snapshot file hash
   `ce7bd849…` unchanged. Any changed attribute, class or element anywhere in those trees fails it.
3. **The four org-admin engine-only screens** answered at the type level: every reader in the estate
   uses positive narrowing, so a widened union cannot break them (`qa-report.md` §4).
4. **All 25 → 26 deleted source lines itemised** against the plan clause that required each one.
5. **Zero existing tests edited**; the 115 that existed still pass as written.

## 4. What this change deliberately does NOT do

No consumer pin bumped · no consumer file touched · no screen declares a multi-select · no new
dependency · no database, migration or query · no search-in-list, grouping or select-all · no change
to the search box, the date-range filter or the layout · the control is not exported as a standalone
primitive (D-10) · DC's stale private copy of the engine is left alone (D-15).

## 5. Honest limits

- **DC, CRM and org-admin cannot be read or run from this sandboxed worktree.** Their filter
  declarations are transcribed from the plan's inventory and labelled as such; no consumer suite was
  executed and nothing here claims one was.
- **`pnpm audit` is permission-blocked in this session.** The CI job was reproduced in Node against
  npm's bulk advisory endpoint (`test-results.md` §5): six highs, all six already on the standing
  owner-approved ignore list, none new. CI's own job remains authoritative.
- **No browser, no deployed instance** — and no screen to look at yet, because none adopts the kind.
