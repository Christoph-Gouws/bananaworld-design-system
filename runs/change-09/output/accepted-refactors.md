# Accepted refactors — CR-DESIGN-SYSTEM-010

> Stage 05. What was actually taken from `simplification-opportunities.md`, and what each one is
> guarded by. Three taken, six refused with reasons.

## S-1 · The value arithmetic moves into `MultiSelectMenu`

**Was.** `DataTableToolbar` owned `chosenLabelsInOptionOrder` (which preserved a stored id the options
no longer offered) and its own tick reducer (which then deleted it). `GridFilterRow`'s
`MultiSelectCell` owned a *different* inline version of the first (which dropped it) and its own copy
of the second.

**Is.** `MultiSelectMenu` exports `MultiSelectOption`, `multiSelectChosenLabels` (the toolbar's body,
moved unchanged) and `multiSelectToggle` (new — known ids in displayed order, then the stored ids the
options no longer offer, in stored order). Both surfaces call both.

**Why it is simpler.** One function was deleted outright; two inline reducers became two call sites of
one named function. The count both surfaces read is now `values.length` in both, which is what makes
"the trigger, the footer and the master row agree" structural rather than a thing to remember.

**Guarded by.** `Grid.test.tsx` §"a value the column no longer offers" (4 specs) ·
`DataTableToolbar.test.tsx` §"a value the data no longer offers" (4 specs) · mutations **M-3, M-4,
M-7, M-8** · byte-identity: 12 shapes of a `multiple` cell whose ids the options still offer, all
0-difference, so the move changed nothing for the states that already worked.

**Export surface.** Unmoved. `MultiSelectMenu` is internal and not barrelled;
`src/components/index.ts` is byte-unchanged.

## S-2 · `MultiSelectAllRow.onToggle` → `onShowEverything`

**Was.** `onToggle: (all: boolean) => void`. Radix hands the next checked state; both call sites read
`all === true` as "commit every option id".

**Is.** `onShowEverything: () => void`. The boolean is discarded at the one place it arrives, with the
reason written beside it. The row receives `chosen` and `total` for its display and no id list at all.

**Why it is simpler.** One parameter fewer, one branch fewer at each of two call sites, and the
defective answer becomes **unwritable**: there is nothing to branch on and no options to map. The
owner's layout **A** then lands entirely inside this function's body — two lines, `state` and `count`
— which is why the owner's pick cost the rest of the change nothing.

**Guarded by.** `Grid.test.tsx` §"the 'Select all' master row — the owner's option A" (4 specs) ·
`DataTableToolbar.test.tsx` (4 specs, incl. the blank-valued row and the Clear affordance) ·
mutations **M-1, M-2, M-5, M-6**.

**Export surface.** Unmoved — same reason as S-1. This is a rename on a component no consumer can
reach, whose only two callers are both in this package and both changed here. It is recorded
explicitly because a rename is the one shape that *looks* like a lane-rule breach and is not.

## S-3 · `isColumnWidth`

**Was.** Nothing — `width` was assumed to be a step and destructured away.

**Is.** One predicate, four comparisons against the union's own members, used twice in `TableCell`:
once to pick the design-system step, once to pick what reaches the `<td>`.

**Why it is simpler.** The two meanings are separated in exactly one place, named. The alternative
that looks cheaper — renaming the prop to `columnWidth` — removes `width` from the export surface,
which the lane rule forbids, and would leave the head and the cell with two names for one column
answer.

**Guarded by.** `Grid.additive.test.tsx` §"`TableCell.width`" (4 specs) · mutations **M-9, M-10** ·
`Table.test.tsx` T-34…T-38, **unedited and green**, which is what M-10 reddens · byte-identity: 2,560
`TableCell` shapes at 0 differences, plus the 3 legacy-width shapes asserted to differ *and* to be
identical again once the one restored attribute is stripped.

---

## Refused, with the reason recorded

**S-4** unify `SelectCell` / `MultiSelectCell` — a standing rule (CR-009 handover point 2); it would
trade the byte-identity **proof** for an argument · **S-5** teach `matchesFilter` that "every option"
means "no filter" — changes behaviour for every existing multiSelect caller · **S-6** merge the
trigger and master-row readings — different arithmetic; sharing needs a mode flag, which is F2's shape
· **S-7** extract the known/unknown partition — the symmetry between the two functions is the property
being asserted · **S-8** hoist the option mapping into `GridFilterRow` — pushes a multi-select shape
into a row that renders five kinds, and touches `SelectCell` · **S-9** retire the inert `ignoreGhsas`
entries — a security-posture change, out of this lane, still the owner's call.

Full reasoning in `simplification-opportunities.md`.

## Sensors after the refactors

`quality-sensors.mjs` over all 7 changed files: **0 open findings**, 4 justified, 0 weak.
`readable-code-scorecard.md` **PASS** (11/11) · `centrality-scorecard.md` **PASS** (8/8).
