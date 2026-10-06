# Developer handover — CR-DESIGN-SYSTEM-013

> CR-DESIGN-SYSTEM-011's handover (the 8 drag rules) is at `runs/change-10/CR-DESIGN-SYSTEM-011/evidence/developer-handover.md`.

**Next agent:** the conductor — poll CI, merge on green. **Next action in this repo:** none.
**Next action elsewhere:** DC (S1) and CRM (S2) follow-ups — `runs/change-10/output/known-issues.md` §C.

## Current state
Built, closed out, PR open on `change/cr-design-system-013`. All local gates green (`runs/change-10/output/test-results.md`).

## Rules for the next person touching the tick-lists
1. 🔴 **Every `allTicked` transition, count and word is in `src/components/multi-select-reading.ts`.** Do not branch
   on the mode inside `GridFilterRow` or `DataTableToolbar`; both render `MultiSelectAllTickedList`.
2. 🔴 **"Everything except" is `excluded`, never an include list of the rest** (plan §3). An include list and an
   exclusion never sit on one key. A row with no value is KEPT by an exclusion.
3. 🔴 **"Nothing ticked" is never committed.** It is local state in `useMultiSelectAllTicked`, honoured only while
   the committed value is "all", cleared on menu close. Mutations M4/M7.
4. 🔴 **The master row still cannot narrow** (CR-010 F2): `onTickEvery` clears, `onUntickEvery` enters the draft.
5. **`MultiSelectAllRow`, `SelectCell`, `MultiSelectCell` and `MultiSelectFilterControl`'s behaviour are untouched
   on purpose** — the byte-identity proof depends on it. TD-1 records the row JSX overlap.
6. **Re-run the proofs:** `node runs/change-10/output/mutation-battery.mjs` (15 mutations; exits non-zero on any
   missed anchor); `node runs/change-10/evidence/browser-proof/proof.mjs` (needs Edge, DC's `node_modules`; writes
   only `frames/` and a self-deleting `.out/`); byte-identity per `runs/change-09/output/byte-identity-setup.mjs` +
   both harnesses.
7. ⚠ An open Radix menu `aria-hides` the trigger — locate it by `aria-label` attribute, and press `{Escape}`
   before asserting on "Clear".
