# Simplification opportunities (Stage 05) — CR-DESIGN-SYSTEM-003

**Candidates considered: 6 · accepted: 1 · rejected: 5.** Reviewed only the files in
`changed-files.md`. Verdict: **PASS — not over-built.**

## Accepted

### S-1 · The "All …" wording exists once, and both kinds call it — **ACCEPTED**

The multi-select repeated the string literal `` `All ${label.toLowerCase()}` `` that
`SelectFilterControl` already held, in two places of its own (the trigger and the All row). Extracted
to `allOptionLabel(label)`; three call sites now, one definition.

**Why it is worth touching an existing line:** D-6 requires an unset filter to read identically
whichever kind it is. Two copies of a string make that a promise; one function makes it structural.
**Proved safe:** the seven screens' snapshot hash is unchanged after the substitution
(`ce7bd849…` before and after). Detail in `accepted-refactors.md`.

## Rejected, with reasons

### S-2 · Fold `MultiSelectFilterDef` into `SelectFilterDef` with a `multiple?: boolean` — **REJECTED**

It would remove a type. It would also change the shape of a type that eleven call sites across three
repos already build, and make `FilterValue`'s discriminant no longer match its def's — the exact
reshaping the request forbids ("if the design pulls you toward reshaping the single-select to make
room, stop and say so"). One extra interface is much cheaper than a discriminant that lies.

### S-3 · Share one component between `SelectFilterControl` and `MultiSelectFilterControl` — **REJECTED**

They wrap different Radix primitives (Select vs DropdownMenu) with different DOM, different roles and
different open/close semantics. The only genuinely common parts are the caption span and the trigger
chrome — a shared wrapper would abstract 6 lines and change what the existing control renders, which
is precisely the thing this change must not do. The two comments explain the parallel instead.

### S-4 · Reuse `RowActions`' menu chrome for the new menu — **REJECTED**

Same reason from the other side: `RowActions` is a public export with its own props, its own
`align="end"` and its own click-stopping behaviour for table rows. Generalising it would change what
every existing row-actions menu renders — a change to a shipped primitive in a package four apps pin.
The classes are duplicated deliberately, and the duplication is 4 lines.

### S-5 · Drop the `chosen`-order normalisation and store values in tick order — **REJECTED**

It would delete two lines and reintroduce a visible wobble: the closed trigger would rename itself
depending on which value the rep happened to tick first. The spec that ticks Durban then Cape Town and
expects `Cape Town+1` exists to keep that deleted line deleted.

### S-6 · Drop the `values[0] ?? ""` fallback in the trigger label — **REJECTED**

`chosen[0]` is always defined for values that came through the control, so the fallback looks dead.
It is not: a consumer can call `setFilter` directly with a value that is not in the current options
(org-admin does construct `FilterValue` literals — seam S-3). Without it the trigger would read
`undefined`. One `??` against a blank control.

## Simplifications that were built in, not bolted on

| # | What | Instead of |
|---|---|---|
| 1 | The def is a **copy** of `SelectFilterDef` with one word changed | A new vocabulary of options/labels/derivation for the second kind |
| 2 | `[]` means All, mirroring `value: null` | A separate `all: boolean`, which `clear()` and `emptyFilterValue` would each need to special-case |
| 3 | `deriveSelectOptions` widened by **parameter**, not overloaded or duplicated | A second `deriveMultiSelectOptions` that drifts |
| 4 | Union only — no `and`/`or` switch | A configuration point for a case that is always empty |
| 5 | Two pure functions for the stored shape, no class, no registry, no state | A "view state manager" the package has no business owning |
| 6 | The `widened` flag is a boolean fact; the sentence stays in the app | A message catalogue in a pure-UI package |
