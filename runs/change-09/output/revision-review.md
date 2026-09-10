# Revision review — CR-DESIGN-SYSTEM-010

> Stage 05. A read of **the 7 files in `changed-files.md`** and nothing else, asking whether what
> landed is the simplest correct thing and whether it says what it does.

## Verdict

**ACCEPT.** The change is smaller than three separate fixes would have been, because two of the three
findings share one cause and were fixed by finishing an extraction rather than by patching two call
sites. Nothing was added that the plan did not ask for.

## 1. The shape of the fix

The plan's §1 diagnosis holds up in the code: CR-009 moved the tick-list's **presentation** into
`MultiSelectMenu` and left its **value arithmetic** — which stored ids count as chosen, what labels
they produce, what a tick commits, what "everything" commits — duplicated at each call site. Three of
those four duplicates disagreed (F1); the fourth was wrong in both copies (F2).

So the fix is one move plus one type widening:

```
MultiSelectMenu.tsx      + MultiSelectOption            the shape both surfaces reduce to
                         + multiSelectChosenLabels      moved in from the toolbar, body unchanged
                         + multiSelectToggle            new — the unknown-id-preserving reducer
                         ~ MultiSelectAllRow            onToggle(boolean) → onShowEverything()
GridFilterRow.tsx        ~ MultiSelectCell              calls the above; counts selected.length
DataTableToolbar.tsx     − chosenLabelsInOptionOrder    deleted; the moved copy serves both
                         ~ MultiSelectFilterControl     calls the above
Table.tsx                ~ TableCellProps.width         widened; isColumnWidth; htmlWidth forwarded
```

**Net effect on duplication: down.** One function was deleted outright and two call sites that each
carried their own reducer now carry none.

## 2. The design decisions worth stating

**Making the defect unreachable beat fixing it.** `MultiSelectAllRow`'s prop could have stayed
`onToggle: (all: boolean) => void` with both call sites corrected to `onChange([])` on either branch.
That would have fixed F2 and left the next caller free to reintroduce it, because a boolean named
`all` *invites* `all ? everything : nothing` — which is precisely how F2 got in. `onShowEverything:
() => void` removes the branch: there is no boolean to read and no option list reaching the row.
This is the same argument `useCellLayout` already makes about conditional hooks in `Table.tsx:196-200`
and it is why the change is a rename rather than a two-line correction.

**One prop, two meanings, split in exactly one place.** `Table.tsx` could have grown two props. It
must not: removing `width` from the export surface is what the additive-only lane rule forbids
outright, and two names for one column answer would defeat §C.4a's "declare the step once and pass it
to all three". `isColumnWidth` is four comparisons against the union's own members, called twice in
one function; the alternative (a `Set`, a lookup record, a branded type) buys nothing at this size.

**`values.length` is the count everywhere now, and that is the actual repair.** F1's several symptoms
— the trigger's `+N`, the footer's `N chosen`, the master row's `N of M`, the set/unset chrome — were
four readings of one wrong number. They are one reading of one right number.

## 3. What was deliberately NOT changed

- **`src/lib/table-controls.ts`.** The reviewer's F2 cites `matchesFilter`'s multiSelect arm, but the
  engine is right: `[]` means "not narrowed", a non-empty list means "these values only". Teaching it
  that "every option" means "no filter" would change behaviour for **every existing multiSelect
  caller** the moment a reader ticked the last box by hand — a much larger blast radius than the
  defect. The defect is at the control that builds the list, and that is where it is fixed.
- **`TableHeadProps.width`.** `ThHTMLAttributes` declares no `width`, so `<TableHead width={120}>` was
  already a type error before CR-009 and still is. Widening it would be a new feature wearing a
  repair's clothes.
- **`SelectCell`.** Untouched, bytes unchanged — which is what makes the single-value path's
  byte-identity provable rather than argued (CR-009 handover point 2, still standing).
- **Ticking every option by hand still excludes blank rows**, in both surfaces. That is a request for
  N named values, and it is a different gesture from "show everything". `All 3` vs `3 of 3` is what
  distinguishes them on screen, and both readings are asserted.
- **A "(retired)" affix on an unknown value's label.** Plan OQ-3: inventing wording is a new idea and
  a decision the owner has not been asked. The raw id stands in, which is what the toolbar has always
  done. Recorded as debt.

## 4. Comments

The four source files gained comment blocks at each repaired site, each naming the finding and what
the wrong version cost. That is this codebase's established register — 43% of `Table.tsx` is already
comments carrying rules the family cannot be maintained without — and the ratio here is not out of
step with what surrounds it. The `MultiSelectMenu` header gained a second banner because the module's
purpose genuinely widened: it was "the parts a tick-list is made of" and is now "the parts *and* the
arithmetic".

**One comment was corrected rather than added:** `DataTableToolbar`'s `toggle` carried "An unknown
value … is dropped by the same pass, which is what a rep sees anyway" — a defence of the behaviour
being removed. Leaving it would have left the file arguing against itself.

## 5. Function and file sizes

Sensor: **0 open findings** on RC-04 (function size) and RC-05 (file size) across all 7 files, with
**4 justifications recognised and 0 weak**. `DataTableToolbar.tsx` got **shorter** again (a function
deleted); `MultiSelectMenu.tsx` grew by two small pure functions and their rationale, and remains the
smallest of the four. `useTableControls` is flagged by the file-size sensor's context only because
the scorecard scans changed files — **it is untouched by this change**, exactly as it was untouched by
CR-009, and carries its own `QUALITY-JUSTIFY RC-04`.

## 6. Follow-ups this review raises

Nothing blocking. See `simplification-opportunities.md` for the two candidates considered and
`accepted-refactors.md` for what was taken.
