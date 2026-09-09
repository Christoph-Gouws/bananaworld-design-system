# Technical debt — CR-DESIGN-SYSTEM-009

> Debt this change **knowingly** creates. One item, and it is the one the approved plan (§9) said it
> would create when the owner picked option C.
> ⚠ Recorded here, in this change's own archive — **never appended to a closed epic's register.**

---

## TD-1 · Two tick-lists read differently in their top row until each consumer flips one word

**Created deliberately. Accepted by the owner at the plan gate when he chose C over A.**

### What it is

This package now ships **one** multi-select implementation (`components/MultiSelectMenu.tsx`) with a
**two-value top row**:

| `selectAll` | Top row | Who renders it |
|---|---|---|
| `"allOption"` *(default)* | an `All depots` tick that clears the filter | every shipped `DataTableToolbar` screen — DC's and the CRM's legacy lists |
| `"master"` | the tri-state **`Select all`** carrying `3 of 12` | the grid's filter cell |

So for a period, a rep who opens a tick-list in a **report** sees "Select all · 3 of 12", and one who
opens a tick-list in a **document list** sees "All depots". Same product, same gesture, two wordings.

### Why this is debt and not a defect

- It is **one optional flag on one shared component**, not two implementations. The item, the trigger
  arithmetic and the counting are literally the same code — which is precisely what the CR demanded
  (*"two multi-select menus in one product that look or count differently is the defect"*).
- The divergence is **bounded and closes by opt-in**, one word per consumer, at each consumer's own
  gate, against a merged sha. It cannot drift further: there is nowhere for a second behaviour to live.
- The alternative was worse. Making `"master"` the default would have **changed what shipped CRM and DC
  toolbars render** at their next pin bump — the lane rule broken in the one way that is invisible
  until four apps move.

### What is owed, and by whom

| Owed by | Action | Blocked on |
|---|---|---|
| **bananaworld-dc** | pass `selectAll: "master"` on its `MultiSelectFilterDef`s | this merging, then DC's own pin bump to the **merged** `main` sha |
| **bananaworld-crm** | the same | the same |

Neither is this package's to make. Both are one line in the consumer's own change.

### How to discharge it

1. Consumer bumps its pin to the merged `main` sha (**never a branch sha** — KI-M001E19-002).
2. Adds `selectAll: "master"` to its `multiSelect` filter defs.
3. When **both** consumers have flipped, `selectAll` may be considered for removal — but only as its
   own additive-lane change, and only after every consumer is confirmed off the default. Until then
   the default stays, because that is what protects RMS, org-admin and Manga Verde, whose repositories
   **cannot be read from a build worktree** and whose usage is unverifiable from here.

### Interest, if it is never paid

Low and non-compounding. The wording difference is cosmetic, both rows do the same job (take
everything / clear), and both are keyboard- and screen-reader-correct Radix `CheckboxItem`s. The cost
of leaving it is that two surfaces of one product read slightly differently; the cost of forcing it is
an unreviewed rendering change in four apps.

---

## Explicitly NOT recorded as debt

| Item | Why it is not debt |
|---|---|
| **OQ-8 — the truncation cap is unverified in a browser** | an **open verification**, not accepted debt. `known-issues.md` §C, with a ready-to-run probe and a named fallback |
| **The three blocking advisories** | pre-existing on `main` and not created by this change. Escalated to the owner and **ANSWERED — option A**, take the repaired versions. What remains is an **owed action**, not accepted debt: one `pnpm update next` commit on this branch by an actor with package-manager permission (`known-issues.md` §A, decisions **D-9 / D-10**). Filing it as debt would imply someone chose to live with two unauthenticated RCEs, and the owner chose the opposite |
| **Patching `next`/`sharp` in the four consuming apps** | 🔴 **Real, and deliberately not this change's to carry.** Repairing this package's peer fixes **this repo's CI** and patches no running app — DC, the CRM, RMS, org-admin and Manga Verde each pin their own `next` and are presumably on the same vulnerable range. That is five separate lanes and a `COMPLIANCE_REGISTER.md` question. Flagged on the owner's card and in the decision log so it is not mistaken for handled; it belongs to the owner, and a change may not open five other apps' lanes |
| **`quality-sensors.mjs` ignoring justifications on CRLF** | a bug in **estate tooling**, outside this project's lane — `known-issues.md` §D |
| **`Table.tsx` / `GridFilterRow.tsx` over 300 lines** | **justified in the source** with `QUALITY-JUSTIFY RC-05` and the measurement behind it; the sensor reports **0 open findings**. A justified finding is a decision, not a debt |
| **No prettier / eslint / `audit:deps` config** | pre-existing repo drift, out of lane, recorded for the fourth time |
| **`CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist** | a governance decision for the owner — **eighth** change to raise it |
