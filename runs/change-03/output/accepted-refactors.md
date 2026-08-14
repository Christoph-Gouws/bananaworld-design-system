# Accepted refactors (Stage 05) — CR-DESIGN-SYSTEM-003

**Accepted: 1 · applied: 1 · reverted: 0.**

## R-1 · `allOptionLabel(label)` — the unset wording, defined once

**Before.** `` `All ${label.toLowerCase()}` `` appeared three times: once in `SelectFilterControl`'s
sentinel item (pre-existing), and twice in the new multi-select (the closed trigger and the All row).

**After.** One 3-line function; three call sites.

```ts
// The unset wording, in ONE place for both kinds. A filter holding nothing must read identically
// whichever kind it is, or the toolbar has two vocabularies for the same state (D-6).
function allOptionLabel(label: string): string {
  return `All ${label.toLowerCase()}`;
}
```

**Why accepted.** Decision D-6 is that an unset filter reads the same whichever kind it is. Two copies
of a literal make that a promise that survives until someone edits one of them; one function makes it
true by construction. This is the smallest possible expression of an approved decision.

**It touches an existing render line, so it was measured, not argued.** Replacing
`All {def.label.toLowerCase()}` with `{allOptionLabel(def.label)}` changes React's children from two
nodes to one, which could in principle alter the serialised DOM:

```
snapshot hash before the refactor:  ce7bd84978bd36072116bbdb5dd61145cc08d8e2149ef1d198584ae2619eb7c1
snapshot hash after  the refactor:  ce7bd84978bd36072116bbdb5dd61145cc08d8e2149ef1d198584ae2619eb7c1
```

Identical across all seven existing screens, and 189/189 specs green. Had the hash moved, the refactor
would have been reverted — a cosmetic tidy is never worth a byte of a consumer's DOM.

**Second, smaller effect of the same pass:** `multiSelectTriggerLabel` took a
`MultiSelectFilterDef<unknown>` and forced a cast at its only call site, purely to read `.label`. It
now takes the `label: string` it actually uses, and the cast is gone.

## Considered and NOT accepted

Five candidates were rejected with reasons in `simplification-opportunities.md` (S-2 … S-6). The
common thread: every one of them would have improved this file at the cost of changing a type or a
rendered output that four pinned consumers already depend on. In an additive-only lane, that trade is
never available for a tidy.
