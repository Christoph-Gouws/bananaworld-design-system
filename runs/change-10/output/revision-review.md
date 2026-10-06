# Revision review (Stage 05) — CR-DESIGN-SYSTEM-013

**Reviewed:** every file in `changed-files.md` (9 source, 5 spec, `package.json`, `pnpm-lock.yaml`) against the
approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-013.md`, clause by clause, and the two generated
scorecards (`readable-code-scorecard.md` **PASS 11/11**, `centrality-scorecard.md` **PASS 8/8**; sensors 0 open).

**Verdict: ACCEPT.** The change is the plan: §1 state machine (all four states, every transition), §3 exclude-list
decision, §4.1–4.5 shapes/functions/surfaces/barrels, §5 proof (baseline first, byte-identity, snapshot, named
callers, pure specs, mutation battery with a non-zero "anchor not found" exit). Deviations from the plan's letter,
each recorded as a decision: module placement (D-1), the not-opted-in read-back guard (D-2), the inventory spec
extension (D-3), the audit override (D-4), the archive slot (D-5).

## Simplified (applied)

| # | What | Effect |
|---|---|---|
| S-1 | The mode's arithmetic out of `MultiSelectMenu.tsx` into `multi-select-reading.ts` (pure) + `MultiSelectAllTicked.tsx` (React) | RC-05 cleared by design, not by justification; `MultiSelectMenu.tsx` diff is two `export` keywords and a comment |
| S-2 | ONE open list (`MultiSelectAllTickedList`) and ONE draft hook (`useMultiSelectAllTicked`) rendered by both surfaces | each surface's new control is chrome only; the grid and toolbar cannot word or count this mode differently |
| S-3 | The toolbar's trigger chrome and menu chrome hoisted into `MULTI_TRIGGER_CHROME` / `MULTI_MENU_CONTENT` (arrays spread into `cn` in the original order) | one copy instead of two; the seven-screen snapshot proves the shipped bytes did not move |
| S-4 | `storedStrings` — one reader for a stored `string \| string[]`; the pre-existing multiSelect arm of `filterValueFromStored` now calls it | 12 lines → 1; behaviour pinned by the untouched characterisation suite |

## Considered and rejected

| Candidate | Why not |
|---|---|
| Making `MultiSelectAllRow` serve both modes (a mode flag), or extracting a shared row frame | `MultiSelectAllRow` is what every `"master"` caller renders and an open-menu row cannot be reached by the static byte-identity harness — leaving its bytes alone IS the proof. ~20 lines of row JSX overlap knowingly kept: `technical-debt.md` TD-1 |
| Folding `AllTickedCell` into `MultiSelectCell` (or `AllTickedFilterControl` into `MultiSelectFilterControl`) with a branch | the CR-009 precedent: a separate component is what makes "the default path is literally untouched" provable |
| Hoisting the grid's menu-content class literal into `SelectCell` / `MultiSelectCell` | would edit both untouched cells for a cosmetic gain; the new cell uses a named constant and says why |
| Teaching `matchesFilter` that an include list covering every option means "not narrowed" | changes behaviour for every existing multiSelect caller (CR-010 handover item 5). Only the opt-in mode collapses, and it does so in its own arithmetic |
| A new union member (`kind: "selectExcept"`) | breaks DC's structural mirror at `tsc` on its pin bump (plan §3, rejected there) |
| Deriving the noun for "5 of 6 batches" from a new `noun` prop | widens the API for something the empty text already carries; a non-"All …" empty text falls back to "shown" |
| A `QUALITY-JUSTIFY` for the 322-line combined module | the sensor did not register it on a new file, and the split is the better design anyway (the repo's own pure/React convention) |
