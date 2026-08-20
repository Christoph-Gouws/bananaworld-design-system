# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-20.

## Current: CR-DESIGN-SYSTEM-005 — **CLOSED OUT, PR open, awaiting CI + merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-05/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-005** |
| Title | The depot slot's label is chosen by the app wearing the header |
| Branch | `change/cr-design-system-005`, off `origin/main` @ `0633476` |
| Approved layout | **A** — the slot is always present; an app with nothing for it gets the existing dash. Omission NOT offered (D-4) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **246 passed / 13 files** · 0 open defects · `src/` **+30 / −1** |
| Additive proof | **All three barrels byte-identical**; the single `src/` deletion itemised (a one-line `return` → its braced form); 234 of 235 pre-existing specs pass **unedited**, the 235th with one assertion **narrowed, never relaxed** (D-7); 4 mutations run, 4 caught |
| CI | Not waited for, by instruction. The conductor polls and merges |
| Remaining | **Nothing in this lane.** No decision is open. No consumer pin was bumped and none may be bumped from here |

## Previous units

- **CR-DESIGN-SYSTEM-004** — a shared paging control for long lists. `runs/change-04/`; merged to
  `main` as `0633476` (PR #14).
- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. `runs/change-03/`; merged as
  `fc2c5b8` (PR #13).
- **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package. `runs/change-02/`;
  merged as `9aa20f7` (PR #10 / #11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; merged as
  `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-005 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started, and not in this repository)

1. 🔴 **The CRM's pin bump + adoption — the other half of CR-CRM-015's unblock, and a SEPARATE change.**
   Bump the CRM's pin to CR-005's **merged `main` sha** (never a branch sha, KI-M001E19-002), then pass
   its own word as `dcLabel`. **CR-CRM-015 — blocked since 2026-08-18 — is not unblocked until that
   lands.** If the CRM has nothing for the slot it passes `dcName: null` and plans for a four-slot
   header; it cannot drop the slot.
2. 🔴 **DC's pin bump, whenever DC chooses.** Nothing in DC breaks today. **One thing to check at that
   bump:** whether DC's `tests/contract/transaction-form-standard.test.ts` pins the full
   `label="DC" value={props.origin.dcName}` substring — **unverifiable from here**, and if it does it is
   a one-line narrowing on an assertion DC already has to visit
   (`runs/change-02/evidence/developer-handover.md` §3). DC's thirteen render sites need no edit.
3. 🔴 **DC's pin bump for CR-004, then CR-DC-052 — paginate DC's transaction lists.** Owes the consumer
   obligation shipped with the paging control: a server-paged table must **not** use `useTableControls`
   for search or filter, and `totalCount` must be scoped to what that person may see.
   `runs/change-04/evidence/developer-handover.md` §2.
4. **CRM's adoption change (from CR-003)** — the **seven-point saved-view obligation** before declaring
   any availability filter as `multiSelect`: `runs/change-03/evidence/developer-handover.md` §3.
   Unaffected by CR-005.
5. **org-admin / RMS** — nothing required by CR-005. Neither imports `DocumentHeader`.
6. Still open from earlier changes: DC's document-header adoption (CR-002, five contract assertions
   redden **by design**) and CR-001's colour-stage chips on the tablet receiving screen.
