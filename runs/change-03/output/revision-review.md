# Revision review (Stage 05) — CR-DESIGN-SYSTEM-003

**Scope: only the files in `changed-files.md`.** Verdict: **PASS.**

## 1. Built to the approved plan — clause by clause

| # | Plan clause | Built? | Note |
|---|---|---|---|
| 1 | §2.1 `MultiSelectFilterDef` = a copy of `SelectFilterDef` with a different `kind` | ✅ | Same four fields plus optional `options`. One word converts a filter |
| 2 | §2.1 `MultiSelectFilterValue.values`, `[]` = All | ✅ | Mirrors `select`'s `value: null` (D-2) |
| 3 | §2.1 semantics table (5 rows) | ✅ | Each row has a spec; the "all chosen ≠ [] for null-accessor rows" subtlety is asserted explicitly |
| 4 | §2.2 `emptyFilterValue` third arm | ✅ | |
| 5 | §2.2 🔴 `hasActiveControls` multiSelect arm | ✅ | Pinned by an engine spec **and** a UI spec — the trap the plan said a build session skips |
| 6 | §2.2 `matchesFilter` third `if` before the fallback | ✅ | Union, never intersection |
| 7 | §2.2 `deriveSelectOptions` parameter widening | ✅ | Parameter-only; invisible to existing callers |
| 8 | §2.2 `optionsByKey` includes multiSelect defs | ✅ | |
| 9 | §2.4 Radix `DropdownMenu` + `CheckboxItem` (option A) | ✅ | No new dependency; same portal and `--z-dropdown` as `RowActions` |
| 10 | §2.4 `onSelect` preventDefault keeps the menu open | ✅ | Mutation-tested (`defect-log.md` D-4) |
| 11 | §2.5 the four states, "All" wording reused verbatim | ✅ | Now literally shared — see §3 |
| 12 | §2.5 trigger sizing copies `SelectTrigger` incl. the tablet step | ✅ | |
| 13 | §2.6 layout **A** — `Cape Town +2` | ✅ | The owner's decision, and the only place the three options differed |
| 14 | §5.3 `filterValueFromStored` / `storedFromFilterValue` + `widened` | ✅ | Every row of the table has a spec |
| 15 | §6.1 the export additions | ✅ | Ten types + two functions + one interface; `SortDir`/`SortState`/`SortAccessor` deliberately **not** exported, as instructed |
| 16 | §6.2 files deliberately not touched | ✅ | All seven held (`changed-files.md` §4) |
| 17 | §8.1 characterisation tests written **before** any source edit | ✅ | 36 of them, green pre-edit, unchanged post-edit |
| 18 | §8.2 specs 1–19 | ✅ | All present; 74 specs total |
| 19 | D-10 the control stays **private** to `DataTableToolbar.tsx` | ✅ | Not exported. org-admin (S-3) has not asked for a standalone primitive |

**Nothing in the plan was skipped, and nothing outside it was built** — with one exception, recorded
rather than smuggled: §3 below.

## 2. Deviation from the plan — one, and it is additive

| Deviation | Why | Risk |
|---|---|---|
| The menu content caps its height to `--radix-dropdown-menu-content-available-height` and scrolls inside it. The plan did not mention it | **CR-DC-008 is exactly this bug on `Select`**: no height cap means nothing overflows, so a long list silently looks like it ends. Applying the lesson costs one class and prevents re-paying for it on a customer list of fifty | None. It affects only the new control, which no screen renders yet |

## 3. The one refactor accepted at this stage

`allOptionLabel(label)` — the unset wording, `All {label.toLowerCase()}`, now exists **once** and both
kinds call it. Before, the multi-select repeated the string literal that `SelectFilterControl` already
held. D-6 says an unset filter must read identically whichever kind it is; this makes that structural
instead of a promise that drifts on the first edit.

**It touches an existing render line, so it was proved rather than argued:** the seven screens'
snapshot hash is unchanged (`ce7bd849…`) after the substitution. Full note in `accepted-refactors.md`.

## 4. Review dimensions

| Dimension | Finding |
|---|---|
| **Correctness** | The five semantics rows each have a spec; the two that a reader would guess wrong ("all chosen" excludes null-accessor rows; a kind mismatch returns every row) are asserted explicitly so they read as decisions |
| **Additive-only** | 0 fields removed, 0 defaults changed, 0 exports moved. All 25 deleted lines are rewrites of the arms that gained a branch, itemised in `changed-files.md` §1.1, and the DOM proof is a hash |
| **Altitude** | The engine stays pure (no React, no DOM); the control stays private to the toolbar; the stored-shape helpers are pure functions that know nothing of any database. The package never learns what a depot *is* |
| **Naming** | `multiSelect` mirrors `select`/`dateRange`; `values` mirrors `value`; `filterValueFromStored` / `storedFromFilterValue` name their direction. `StoredFilterReading.widened` says what it means without a comment |
| **Comments** | Dense, deliberately, at the four places a future session would otherwise undo something load-bearing: the `hasActiveControls` else-branch, the `onSelect` preventDefault, the `matchesFilter` fall-through, and "date ranges are not carried by this contract" |
| **Tests** | 74 new specs, 0 existing specs edited. The characterisation half is the additive proof; the mutation check proves at least one guard genuinely bites |
| **Dead code** | None. No prop, option or branch was added toward the excluded features (search-in-list, grouping, select-all) |

## 5. Over-build temptations declined

| Temptation | Declined because |
|---|---|
| Export the multi-select control as a standalone primitive so org-admin can render it | Anticipatory configurability — org-admin has not asked (D-10 / seam S-3). Stated, not solved |
| An `and`/`or` option on the filter | A row holds one value per filter, so "and" is always empty (D-3) |
| A `maxVisible` / "show N names before +N" prop | Layout A is the owner's decision, not a configuration point. One reading, no knob |
| A `widenedMessage` string in the package | The wording is app vocabulary (D-8, TECH-COMP-003). The package supplies the fact |
| Deriving the closed label from a `formatter` callback | Same reason. Nothing has asked |
| Fixing DC's stale private copy of `table-controls.ts` | Another repo, another lane (D-15 / seam S-4) |
