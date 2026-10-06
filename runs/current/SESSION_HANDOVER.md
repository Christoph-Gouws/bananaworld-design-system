# Session handover — `bananaworld-design-system`

> Last updated: 2026-10-06, at the close of **CR-DESIGN-SYSTEM-013**.

## Most recent unit of work: CR-DESIGN-SYSTEM-013 — "Select all" ticks every option

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-013** (owner-raised 2026-10-06; not an epic, not a milestone) |
| Branch | `change/cr-design-system-013`, off `origin/main` @ `26fa005` (CR-012, PR #31) |
| Approved layout · ship mode | **B** (the box counts, the list names what is hidden) · **on-green** |
| Status | **Built, green, closed out, PR open.** The conductor polls CI and merges |
| Archive | `runs/change-10/` (⚠ shared with CR-011 — read `runs/change-10/README.md`) |

**What it did.** An opt-in `selectAll: "allTicked"` mode for both tick-lists (grid filter cell, list toolbar):
every option ticked while nothing is narrowed; unticking one hides just that one, stored as an **exclude list**
(`excluded`, wire `f_<key>_not`); Select all re-ticks everything; unticking it clears every tick as a draft while
the report keeps showing everything. Three new exports: `gridFilterExclude`, `gridFilterExcluded`,
`storedExclusionFromFilterValue`. Defaults unchanged; every existing caller byte-identical.

**Verification:** 450/21 (baseline 405/19) · typecheck clean · 10,029 caller shapes 0 differences vs `26fa005` ·
seven-screen snapshot zero-line diff · mutation battery 15/15 · sensors 0 open · audit exit 0 · **real Edge
browser 17/17, frames `runs/change-10/evidence/frames/01…06`** · context-usage row logged.

## What the next session needs to know

1. 🔴 **The `allTicked` state machine is `src/components/multi-select-reading.ts`; its React half is
   `MultiSelectAllTicked.tsx`.** Both surfaces render `MultiSelectAllTickedList`. Rules:
   `runs/change-10/evidence/developer-handover.md`.
2. 🔴 **"Everything except" is `excluded`, never the include list of the rest** — tomorrow's batch is not left out,
   and an older reader widens instead of inverting. A row with no value is kept by an exclusion.
3. 🔴 **"Nothing ticked" is never committed** — local to the open menu, gone on close.
4. 🔴 **`MultiSelectAllRow` CANNOT NARROW** (CR-010) — still true; the new `MultiSelectEveryRow` cannot either.
5. 🔴 **The count is `values.length`** for include lists (CR-010); "except" counts offered options it does not hide.
6. 🔴 **Do NOT unify `SelectCell` / `MultiSelectCell` / `AllTickedCell`** — the byte-identity proof depends on the
   untouched paths.
7. **Consumer follow-ups (plan §7):** **S1 CR-DC** — pin to the MERGED sha, flip `grid-props.ts:95`, teach `_not` to
   URL writer, parser (same 40-value clamp), SQL (`expr IS NULL OR expr NOT IN (…)`), echo and saved views, **in one
   change**. **S2 CR-CRM** — flip per def and store `storedExclusionFromFilterValue` beside the value **in the same
   change**; check exhaustive `switch`es over `selectAll`. Detail: `runs/change-10/output/known-issues.md` §C.
8. **CRLF rules:** normalise to LF before matching or before running `quality-sensors.mjs`; write original bytes
   back. ⚠ The sensor also ignored a `QUALITY-JUSTIFY` in a NEW file (`known-issues.md` B-2).
9. ⚠ **An open Radix menu `aria-hides` the page** — press `{Escape}` before asserting "Clear"; in a browser driver,
   find the trigger by `aria-label` attribute.
10. **Proof tooling is committed:** byte-identity `runs/change-09/output/` + `runs/change-10/output/byte-identity-013.harness.test.tsx`;
    mutation battery `runs/change-10/output/mutation-battery.mjs`; browser proof
    `runs/change-10/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only).
    **A real browser IS executable from this sandbox** (handover item 12 of CR-010 said otherwise) — OQ-8 could now
    be checked with the same driver.
11. **Additive-only is the lane rule.** Read each app's own `package.json` for its pin (DC: `26fa005`).
12. **Dependency audit:** a `source-map-js` override was added (D-4) for GHSA-68fv-2mgg-jv7q, which failed the audit
    on `main`. Overrides, never new ignores. 4 inert `ignoreGhsas` still await the owner's housekeeping call.
13. **Archive numbering collides** between the runner and sessions — CR-011's archive moved to
    `runs/change-10/CR-DESIGN-SYSTEM-011/` (D-5). Take the slot the conductor names; never overwrite.
14. **Standing, carried:** no `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` (tenth change to raise it); no
    decision-log entry for CR-008; no lint/ESLint/prettier config; the `.snap` CRLF artifact (do not stage); CRM
    pin bump + `dcLabel` (CR-005, CR-CRM-015); DC's pin bumps for CR-002/004 then CR-DC-052; CRM's saved-view
    obligation (CR-003); DC's dead private copy of `table-controls.ts`; OQ-8.
15. **Technical debt:** TD-1 (row JSX overlap kept to protect the proof), TD-2 (browser proof not in CI) —
    `runs/change-10/technical-debt.md`.

## State of the repository

- **`main` is at `26fa005`** (CR-012). CR-013 sits on its own branch, pushed, PR open.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; no `epic-NN/`, `milestone-NN/` or
  `runs/current/epic-plan/` was created.
- **No migrations.** This package has no database.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan · mockups | `runs/current/logic-plan/CR-DESIGN-SYSTEM-013.md` · `runs/current/mockups/CR-DESIGN-SYSTEM-013/` |
| Stage 04 / 05 artifacts | `runs/change-10/output/` |
| Evidence roll-ups + frames | `runs/change-10/evidence/` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CR-DESIGN-SYSTEM-013, D-1…D-5 |
| Previous changes | CR-012 `runs/change-11/` (`26fa005`) · CR-011 `runs/change-10/CR-DESIGN-SYSTEM-011/` (`76fec2a`) · CR-010 `runs/change-09/` · CR-009 `runs/change-08/` · `change-07`…`change-01` |
