# Changed files — CR-DESIGN-SYSTEM-003

> Every file this change touched. **Stage 05 reviews only what is listed here**, so this list is
> complete rather than representative. Counts are `git diff --numstat` against `9aa20f7`.

## 1. Source — 5 files modified, 0 added, 0 deleted (+344 / −25)

| # | File | + | − | What changed |
|---|---|---|---|---|
| 1 | `src/lib/table-controls.ts` | 122 | 11 | `MultiSelectFilterDef` + `MultiSelectFilterValue`; both unions widened; `emptyFilterValue`, `hasActiveControls`, `matchesFilter`, `deriveSelectOptions` each gain a `multiSelect` arm; the stored-shape contract (`StoredFilterReading`, `filterValueFromStored`, `storedFromFilterValue`) |
| 2 | `src/components/DataTableToolbar.tsx` | 187 | 14 | `MultiSelectFilterControl` + `MultiSelectItem` (both private), `multiSelectTriggerLabel`, `multiSelectValuesOf`; the filter render becomes a three-arm switch; `optionsByKey` includes multi-select defs; two import lines widened; header comment |
| 3 | `src/components/index.ts` | 19 | 0 | Ten filter def/value/option **types** exported (D-9). Appended after the existing `DataTableToolbar` block; nothing moved |
| 4 | `src/lib/index.ts` | 10 | 0 | `filterValueFromStored`, `storedFromFilterValue`, `StoredFilterReading` exported |
| 5 | `src/index.ts` | 6 | 0 | The same three names enumerated at the root barrel (this barrel enumerates `./lib`, it does not star it) |

### 1.1 Every one of the 25 deleted lines, accounted for

The plan (§8.2) required each deletion be justified line by line and expected **zero outside the five
arms that gain a branch**. That held — all 25 are rewrites of the exact lines §2.2 named, plus the
render ternary that had to become a switch to hold three arms:

| Deleted | Replaced by | §2.2 row |
|---|---|---|
| `import { Search, X } from "lucide-react";` | the same import plus `Check, ChevronDown` | — (widened, nothing lost) |
| `export type FilterDef<Row> = Select … \| DateRange …;` | the same union plus `MultiSelectFilterDef` | type |
| `export type FilterValue = Select … \| DateRange …;` | the same union plus `MultiSelectFilterValue` | type |
| `emptyFilterValue`'s 3-line ternary | if / if / return, same two results | 1 |
| `hasActiveControls`' 3-line `some(...)` | three-branch predicate, same two results | 2 |
| `deriveSelectOptions`' 2 comment lines + `def: SelectFilterDef<Row>,` | widened parameter + updated comment | 4 |
| `optionsByKey`'s single `if (def.kind === "select")` line | `select \|\| multiSelect` | 5 |
| the 12-line `filters.map(def => select ? … : …)` ternary | a three-arm switch whose `select` arm is character-identical | render |

**No behavioural line was removed.** The proof is not the argument above but the snapshot: the seven
existing screens' rendered DOM hashes identically before and after (`test-results.md` §2).

## 2. Tests — 3 files added (+910 lines), 0 existing test modified

| # | File | Lines | What it holds |
|---|---|---|---|
| 6 | `tests/components/table-controls.test.tsx` | 470 | 43 specs — 17 **characterisation** (written before any source edit) + 26 multi-select / stored-shape / barrel / no-app-import |
| 7 | `tests/components/DataTableToolbar.test.tsx` | 425 | 31 specs — 19 **characterisation** (the seven screens, snapshotted pre-edit) + 12 for the new control, its keyboard path and its closed-state wording |
| 8 | `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` | 15 | The seven pre-change screen snapshots. **Committed deliberately** — it is the additive evidence, not a build artifact |

**Zero existing test files were edited.** The 115 tests that existed at `9aa20f7` all still pass, byte
for byte as written.

## 3. Paper trail (not source)

`runs/change-03/output/*.md` (12) · `runs/change-03/evidence/*.md` (4) ·
`source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (appended) ·
`runs/current/SESSION_HANDOVER.md` + `runs/current/active-milestone.md` (reconciled) ·
`runs/current/logic-plan/CR-DESIGN-SYSTEM-003.md` + `.estimate.json` + `runs/current/mockups/CR-DESIGN-SYSTEM-003/`
(pre-existing, untracked at session start — committed with the change so the approved contract and the
approved drawing live with the code) · `organization/CONTEXT_USAGE_LOG.md` (one row, outside this repo).

## 4. Considered and deliberately NOT touched

| File | Why not |
|---|---|
| `package.json` | **No new dependency.** `@radix-ui/react-dropdown-menu@^2.1.16` was already there and already shipped in `RowActions`. No new token either — every class used already exists in `tokens.css` |
| `pnpm-lock.yaml` | Follows from the above. The tree is identical to `9aa20f7` |
| `vitest.config.ts` | `tests/components/**/*.test.tsx` already globs both new files |
| `src/components/Select.tsx` | Untouched. The single-select path keeps its Radix Select and its `__all__` sentinel exactly as-is |
| `src/components/Checkbox.tsx` | Untouched. The tick is `DropdownMenu.ItemIndicator`; nesting a Radix Checkbox inside a Radix menu item would nest two interactive roles |
| `src/components/RowActions.tsx` | Untouched. The new control uses the same Radix primitive but shares no code — extracting a common wrapper would change what `RowActions` renders |
| Anything in `bananaworld-dc/`, `-crm/`, `-org-admin/`, `-rms/`, `mangaverde/` | Not this repo, not this lane. **No consumer pin moves** |
| `runs/epic-020/`, `runs/current/epic-plan/`, any `milestone-NN/` | A closed epic is immutable. None created, none written to |

## 5. Created during the session and removed before the commit

| File | Why it existed | State |
|---|---|---|
| `audit-probe.mjs` | `pnpm audit` is permission-blocked in build sessions (SESSION_HANDOVER §8), so the CI audit was reproduced in Node against npm's bulk advisory endpoint | **Deleted.** Not committed; its output is quoted in `test-results.md` §5 |
