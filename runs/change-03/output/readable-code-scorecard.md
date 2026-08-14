# Readable-code scorecard (Stage 05) — CR-DESIGN-SYSTEM-003

**12 / 12 PASS.** Scored against the 8 files in `changed-files.md`.

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **Names say what the thing is** | PASS | `MultiSelectFilterDef`, `MultiSelectFilterValue`, `filterValueFromStored`, `storedFromFilterValue`, `StoredFilterReading.widened`, `allOptionLabel`, `multiSelectTriggerLabel`. Each new name mirrors the existing one beside it (`values` ↔ `value`, `multiSelect` ↔ `select`), so a reader who knows one kind can read the other |
| 2 | **A reader can find the entry point** | PASS | `DataTableToolbar` maps `filters` through a three-arm switch, and the three arms sit in the file in the order the switch names them. In the engine, `applyTableControls` remains the single door |
| 3 | **Functions are small and single-purpose** | PASS | `allOptionLabel` 3 lines, `multiSelectValuesOf` 3, `multiSelectTriggerLabel` 8, `storedFromFilterValue` 9, `MultiSelectItem` a single Radix item. The longest is `MultiSelectFilterControl` (~70 lines) and it is a render, not branching logic |
| 4 | **No nested conditionals in JSX** | PASS | One `{more > 0 && …}` and one ternary for the footer count. The trigger's wording is computed above the JSX by a named function, not inline |
| 5 | **Comments explain WHY, not WHAT** | PASS | The four load-bearing fences each record a decision and what breaks without it: the `hasActiveControls` else-branch trap, `onSelect` preventDefault, the `matchesFilter` fall-through ("NOT to be tidied into a throw"), and union-not-intersection |
| 6 | **Comments are TRUE** | PASS | Checked line by line, including the pre-existing ones the diff sits beside. `deriveSelectOptions`' comment was updated when its parameter widened rather than left describing a select-only function; the header comment gained the third kind rather than continuing to promise two |
| 7 | **Magic values are named** | PASS | No new literal. The one string that mattered — the unset wording — is now `allOptionLabel`, defined once for both kinds (R-1) |
| 8 | **The types make the wrong call impossible** | PASS | `kind` discriminates all three ways; `values` is `readonly string[]`, so a caller cannot mutate the live filter; `filterValueFromStored` takes `unknown` deliberately, because its whole job is untrusted input, and returns a `widened` a caller has to look at to ignore |
| 9 | **Tests read as claims, not as mechanics** | PASS | *"one chosen behaves exactly like a single-select holding that value"*, *"🔴 a pre-change row opens showing THAT depot only — not everything"*, *"several chosen names the first and counts the rest — Cape Town +1"* |
| 10 | **Tests say what would break if they failed** | PASS | The characterisation header states it outright: *"if one of these goes red, the change that turned it red is not additive"*. The `hasActiveControls` spec names the permanently-lit Clear button; the keyboard spec names the rep re-opening the menu per value |
| 11 | **No dead code** | PASS | Nothing added toward the excluded features. The one line that could look dead — `values[0] ?? ""` — is justified in `simplification-opportunities.md` S-6 and reachable from `setFilter` |
| 12 | **The diff is reviewable** | PASS | 347 insertions / 26 deletions in `src/`, and **every deleted line is itemised** in `changed-files.md` §1.1 against the plan clause that required it. Three barrels are appended blocks with a comment saying why |

## The weakest point, stated honestly rather than trimmed

**`DataTableToolbar.tsx` now holds three filter controls in one file (275 → ~450 lines).**

A reader looking for the date-range control scrolls past a 70-line menu to reach it. The obvious tidy —
one file per control — was considered and not done, for two reasons. First, `SelectFilterControl` and
`DateRangeFilterControl` are already private to this file and moving them would change nothing a
consumer can see while making the diff of an additive change look like a restructure. Second, the
three controls are read together far more often than separately: the thing a maintainer needs to know
is that the toolbar has three kinds and where the switch is, and that is visible on one screen today.

If a fourth kind ever arrives, splitting is the right move and this is the note that says so.

## A second honest note: the comment density in `table-controls.ts` is high

Roughly a third of the added lines are comment. Three of them are load-bearing in a specific way — they
exist to stop a future session from *removing* something that looks removable (the `return true`
fall-through, the `preventDefault`, the multiSelect arm of `hasActiveControls`). The plan predicted
each of those as the arm a build session skips, so the fences are placed where the record says the
mistake actually happens, not sprinkled evenly.
