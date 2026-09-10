# Simplification opportunities — CR-DESIGN-SYSTEM-010

> Stage 05. Candidates considered across **the 7 files in `changed-files.md`**. Each is either taken
> (→ `accepted-refactors.md`) or refused with a reason. The gate is "is this simpler *and* still
> correct", not "is this fewer lines".

## Taken

| # | Opportunity | Where | Status |
|---|---|---|---|
| **S-1** | **Delete the duplicated value arithmetic** — `chosenLabelsInOptionOrder` existed in `DataTableToolbar` while `MultiSelectCell` carried a divergent inline version, and both carried their own tick reducer | `MultiSelectMenu.tsx` ← `DataTableToolbar.tsx`, `GridFilterRow.tsx` | **TAKEN.** This is F1's fix and the change's spine — one function deleted, two inline reducers replaced by one shared call |
| **S-2** | **Delete a branch that only ever had one right answer** — the master row's `(all: boolean)` had two call-site interpretations and both were wrong | `MultiSelectMenu.tsx` | **TAKEN.** This is F2's fix. Fewer parameters, no branch, and the wrong answer becomes unwritable |
| **S-3** | **One predicate instead of a repeated four-way comparison** for the width split | `Table.tsx` | **TAKEN.** `isColumnWidth` is used twice in one function and named once |

## Considered and refused

### S-4 — unify `SelectCell` and `MultiSelectCell` in `GridFilterRow`

They share chrome, density read, trigger shape and portal. Merging them would remove ~30 lines.

**REFUSED, and this is a standing rule rather than a judgement call.** CR-009 handover point 2:
*"DO NOT unify `SelectCell` and `MultiSelectCell`. The one-value path being the shipped function
**unedited** is what makes byte-identity provable rather than argued."* This change relies on exactly
that: 900 of its 9,936 byte-identity shapes are single-value filter rows, and they are 0-difference
because `SelectCell`'s bytes never moved. A merge would trade a proof for an argument, in the change
whose entire subject is a proof that came apart.

### S-5 — teach the engine that "every option" means "not narrowed"

`matchesFilter` could return `true` when `value.values` covers every derived option, which would make
F2 harmless wherever it recurs.

**REFUSED.** It changes behaviour for **every existing multiSelect caller**: a reader who ticks the
last box by hand would suddenly see blank-valued rows appear. That is a bigger, quieter change than
the defect, and it is not additive. The plan refused it at §2.5 for the same reason; the code agrees.

### S-6 — collapse the master row's count into `multiSelectTriggerLabel`

Both compute a reading from `(chosen, total)`.

**REFUSED — they are not the same arithmetic.** The trigger reads *first label + how many more*; the
master row reads *how many of how many*, with a distinct unset wording (`All N`). Sharing them would
force one to carry a mode flag, which is the shape that produced F2. Two small functions with one
caller each beats one function with a switch.

### S-7 — extract the two "known then unknown" partitions in `MultiSelectMenu`

`multiSelectChosenLabels` and `multiSelectToggle` both partition `values` into known and unknown.

**REFUSED, narrowly.** A shared `partition(options, values)` returning `{known, unknown}` would save
two lines and cost a reader one indirection to learn that one branch maps to `.label` and the other
does not. At this size the duplication is two `filter` calls that are *deliberately* symmetric, and
the symmetry is the property being asserted — the whole finding is that these two functions must agree.
Recorded here so the next change does not re-derive the question.

### S-8 — hoist the grid's `{id,label}` → `{value,label}` map into `GridFilterRow`

`MultiSelectCell` maps its options; the row could hand them down already mapped.

**REFUSED.** It would push the multi-select's data shape into the row that renders **five** cell
kinds, four of which never need it, and `SelectCell` would then have to un-map or take a second prop
— touching the one function this change must leave unedited (see S-4). The `useMemo` inside
`MultiSelectCell` costs one line and keeps the shape where it is used.

### S-9 — retire the 4 now-inert `ignoreGhsas` entries

**REFUSED — out of lane.** Carried from CR-009's `known-issues.md`. Retiring an owner-approved
security exception is a security-posture change in its own right, not a side effect of a defect fix.
Still the owner's call, still a standalone housekeeping change.

## Not applicable

`GUIDE-CE-01/05` (design tokens, API clients in components) and `CE-08`/`RC-09` (wiring discipline)
are **not scanned for this project** — no `componentGlobs` or `wiringGlobs` are configured for it.
That is an estate-tooling gap carried from CR-009 (`known-issues.md` §B), not a finding, and it is
recorded rather than reported as a pass.
