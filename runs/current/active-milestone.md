# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-14.

## Current: CR-DESIGN-SYSTEM-004 — **CLOSED OUT, PR open, awaiting CI + merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-04/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-004** |
| Title | Add a shared paging control to `@bananaworld/design-system` |
| Branch | `change/cr-design-system-004`, off `origin/main` @ `fc2c5b8` |
| Approved layout | **A** — count top left; picker + arrows top right; arrows bottom right (D-13, D-18) |
| Approved option | **(a)** — presentation only; the narrowing trap is a written contract (D-2), never mixed with (b) (D-3) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **235 passed / 13 files** · 0 open defects · `src/` **+24 / −0** |
| Additive proof | **Zero deletions and zero modified lines** in `src/`; two new files nothing imports yet; toolbar snapshot hash unchanged (`ce7bd849…`); all 189 pre-existing specs pass **unedited** |
| CI | Not waited for, by instruction. The conductor polls and merges |
| Remaining | **Nothing in this lane.** No decision is open. No consumer pin was bumped and none may be bumped from here |

## Previous units

- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. Archived to `runs/change-03/`;
  merged to `main` as `fc2c5b8` (PR #13).
- **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package. `runs/change-02/`;
  merged as `9aa20f7` (PR #10 / #11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; merged as
  `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-004 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started, and not in this repository)

1. 🔴 **DC's pin bump — the only thing this change gates, and it is a SEPARATE change.** Bump DC's pin
   to CR-004's **merged `main` sha** (never a branch sha, KI-M001E19-002). **CR-DC-052 cannot start
   until that lands.** Nothing in DC breaks at the bump: no existing DC screen imports anything CR-004
   adds.
2. 🔴 **CR-DC-052 — paginate DC's transaction lists.** Runs after the pin bump, and owes the consumer
   obligation that ships with the control: a server-paged table must **not** use `useTableControls`
   for search or filter, and `totalCount` must be scoped to what that person may see.
   `runs/change-04/evidence/developer-handover.md` §2.
3. **CRM's adoption change (from CR-003)** — bump the pin, then complete the **seven-point saved-view
   obligation** before declaring any availability filter as `multiSelect`:
   `runs/change-03/evidence/developer-handover.md` §3. Unaffected by CR-004.
4. **org-admin / RMS** — nothing required by CR-004. Their screens import nothing it adds.
5. Still open from earlier changes: DC's document-header adoption (CR-002, with five contract
   assertions that redden **by design**) and CR-001's colour-stage chips on the tablet receiving screen.
