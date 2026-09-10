# Technical debt — CR-DESIGN-SYSTEM-010

> Debt this change knowingly creates or inherits. Written to **this change's own archive** — never
> appended to a closed epic's register.

## Created by this change: **0**

Nothing was deferred to make this change land. The three findings are fixed outright; no shim, no
compatibility branch, no "temporary" second path.

## Inherited, and narrowed rather than cleared

### TD-1 (from CR-DESIGN-SYSTEM-009) — the two tick-lists still differ in their TOP ROW

**What.** The grid's filter cell renders the tri-state "Select all" master row; the shipped toolbars
render the `"All depots"` item, because `MultiSelectFilterDef.selectAll` defaults to what every
shipped screen renders today. They converge when DC and the CRM each pass `selectAll: "master"` in
their own change.

**Changed by this CR.** **Narrowed to that one row and nothing else.** Before this change the two
menus also disagreed about which stored ids count as chosen, what a tick commits and what "everything"
commits — that was F1 and F2, and it is gone. What remains is a defaulted flag, not two
implementations.

**Owed by.** DC and the CRM, each in its own change, at its own gate. Not this package's to force.

### TD-2 — the `(blank)` entry option C would have needed

**What.** Layout **C** in the mockups (tick the master row ⇒ every item reads ticked) is only honest
about rows with no value recorded if the menu also offers a `(blank)` entry. The plan flagged it as
debt-if-C-is-picked.

**Status. NOT INCURRED — the owner picked A.** Recorded so the next session does not go looking for
it, and so that a later move to C knows the entry is a prerequisite and not a nicety.

### TD-3 — an unknown value has no wording of its own (plan OQ-3)

**What.** When a filter holds an id the option list no longer offers, the trigger reads the **raw id**
as its label — `Cold room 1 +1` where the `+1` is `cold-9`. That is what the toolbar has always done,
and it is now what the grid does too, which is the fix. It is still not *good*: the reader sees a
value they cannot identify and cannot un-tick from the menu.

**Why it was not taken.** Inventing a "(retired)" affix — or any other wording — is a new idea and a
wording decision the owner has not been asked, in a change whose whole subject is fixing defects
rather than adding behaviour.

**Shape of the fix, when it is wanted.** A wording decision first, then one change to
`multiSelectChosenLabels` — which is now a single function with two callers, so it lands in both
surfaces at once. That is a direct dividend of this change.

**Cost of leaving it.** Low and bounded: the value is *correct* and is *counted*; only its display
name is unhelpful. "Select all" clears it, which is the escape hatch.

### TD-4 — `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist

**What.** Nine changes in this package have now written a cross-app seam map into their own plan
because there is nowhere shared to put one. The plan's §4 six-seam map is archived with this change
and is the record meanwhile.

**Why it was not taken.** Creating a governance artefact is a **decision for the owner**, not
something a change may invent for itself.

**Cost of leaving it.** Each change re-derives the same map, and no consumer team has one place to
look for "what changed under me". Raised for the ninth time.

---

## Explicitly NOT debt

- **`table-controls.ts` was not taught that "every option" means "not narrowed".** That is a refusal
  on the merits (`simplification-opportunities.md` S-5), not a deferral — the engine is right, and
  changing it would move behaviour for every existing multiSelect caller.
- **`SelectCell` and `MultiSelectCell` were not unified.** A standing rule (CR-009 handover point 2),
  and this change depends on it: 900 of its byte-identity shapes are 0-difference *because*
  `SelectCell`'s bytes never moved.
- **The 4 inert `ignoreGhsas` entries were not retired.** Out of lane, still the owner's call —
  `known-issues.md` C-4.
