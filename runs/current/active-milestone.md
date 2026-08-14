# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-14.

## Current: CR-DESIGN-SYSTEM-003 — **CLOSED OUT, PR open, awaiting CI + merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-03/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-003** |
| Title | A toolbar filter can hold one value. Let it hold several, without disturbing the screens that hold one |
| Branch | `change/cr-design-system-003`, off `origin/main` @ `9aa20f7` |
| Approved layout | **A** — the closed trigger reads `Cape Town +2` (D-16) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **189 passed / 11 files** · 0 open defects · `src/` **+347 / −26**, every deletion itemised |
| Additive proof | The seven toolbar screens' DOM snapshot **hash unchanged** across the source edit (`ce7bd849…`), from characterisation specs written **before** any source edit |
| CI | Not waited for, by instruction. The conductor polls and merges |
| Remaining | **Nothing in this lane.** No decision is open. No consumer pin was bumped and none may be bumped from here |

## Previous units

- **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package. Archived to
  `runs/change-02/`; merged to `main` as `9aa20f7` (PR #10 / #11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. Archived to `runs/change-01/`;
  merged as `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-003 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started, and not in this repository)

1. 🔴 **CRM's adoption change** — the only one this change actively gates. Bump CRM's pin against the
   **merged `main` sha**, then complete the **seven-point saved-view obligation** before declaring any
   availability filter as `multiSelect`: `runs/change-03/evidence/developer-handover.md` §3. Adopting
   the kind without the reconciler work is a silent widen of every saved arrangement.
2. **DC** — nothing required; its six screens keep working untouched. At its next pin bump, delete the
   dead private copy of `src/lib/table-controls.ts` (seam S-4).
3. **org-admin** — nothing required; its four engine-only screens keep working untouched.
4. Still open from earlier changes: DC's document-header adoption (CR-002, with five contract
   assertions that redden **by design**) and CR-001's colour-stage chips on the tablet receiving screen.
