# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-24.

## Current: CR-DESIGN-SYSTEM-006 — **CLOSED OUT, PR open, awaiting CI + merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-06/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-006** |
| Title | A row of fields can line up along the top |
| Branch | `change/cr-design-system-006`, off `origin/main` @ `fc6f6c6` |
| Approved layout | **A** — a row-level default (`<TableRow valign>`) **with** a per-cell override (`<TableCell valign>`) (D-4) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **263 passed / 14 files** · 0 open defects · `src/` **+77 / −13** (**+67 / −3** ignoring whitespace) |
| Additive proof | **All three barrels byte-identical**; only **3 real deletions**, each itemised (the other 10 are the `<tr>` re-indented into the provider); **384 existing-caller shapes rendered against `main@fc6f6c6` and diffed on whole `innerHTML` — byte-identical**; T-1/T-2/T-15/T-16 committed GREEN against the unmodified component (`f59f2c7`) and unedited after; 5 mutations run, 4 caught, 1 proven inert |
| CI | Not waited for, by instruction. The conductor polls and merges |
| Remaining | **Nothing in this lane.** No decision is open. No consumer pin was bumped and none may be bumped from here |

### What it did

Added **two** optional fields, both defaulting to `"middle"`: `valign?: VAlign` on `TableCellProps`
and on `TableRowProps`, where `VAlign = "top" | "middle" | "bottom"`. A row asks once for all its
cells through a module-private context; a cell's own `valign` wins over its row's.

- 🔴 **The default did not move** — `align-middle` still answers every cell that does not ask, **and
  it is still emitted in the same POSITION**. That second half is the trap: moving it to the end of
  the class list would silently revert every caller using today's `className="align-top"` workaround.
- **Two files**, one existing (`src/components/Table.tsx`) and one new
  (`tests/components/Table.test.tsx` — this package's **first** Table specs; there were none).
- `VAlign` is **module-private**, exactly as `Align` is. **Zero barrel edits.**

## Previous units

- **CR-DESIGN-SYSTEM-005** — the depot slot's label is chosen by the app wearing the header.
  `runs/change-05/`; merged to `main` as `fc6f6c6` (PR #15).
- **CR-DESIGN-SYSTEM-004** — a shared paging control for long lists. `runs/change-04/`; merged as
  `0633476` (PR #14).
- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. `runs/change-03/`; merged as
  `fc2c5b8` (PR #13).
- **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package. `runs/change-02/`;
  merged as `9aa20f7` (PR #10 / #11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; merged as
  `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-006 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started, and not in this repository)

1. 🔴 **The CRM's pin bump, then its sales order grid adoption — a SEPARATE change, and the only thing
   that actually fixes the misaligned row on screen.** Bump the CRM's pin to CR-006's **merged `main`
   sha** (never a branch sha, KI-M001E19-002), then pass `valign="top"` on the sales order line row.
   **This change makes the option exist; it does not fix any screen.** Three steps, in order.
2. 🔴 **Every consumer owes ONE grep before it bumps its pin: `grep -rn "valign" src`.** The new prop
   name shadows React's deprecated `TdHTMLAttributes.valign` presentational attribute, which used to
   be accepted and inert. **DC is proven clean — 0 occurrences repo-wide.** CRM, RMS, org-admin and
   Manga Verde are **unreadable from a build worktree and were not checked**.
   `runs/change-06/evidence/developer-handover.md` §2.
3. **DC, optionally and at its own discretion (OQ-5):** DC's sales order grid hand-rolls raw `<td>`s
   with `align-top` (`SalesOrderForm.tsx:1026`) precisely because this option did not exist. It may now
   fold back onto `TableCell`. **Nothing in DC is broken today and no action is required.**
4. 🔴 **The CRM's pin bump + `dcLabel` adoption from CR-005 — the other half of CR-CRM-015's unblock.**
   Unchanged by this change and still outstanding.
5. **DC's pin bumps for CR-002 and CR-004, then CR-DC-052** — paginate DC's transaction lists, with
   the consumer obligation in `runs/change-04/evidence/developer-handover.md` §2.
6. **CRM's adoption change from CR-003** — the seven-point saved-view obligation before declaring any
   availability filter as `multiSelect`: `runs/change-03/evidence/developer-handover.md` §3.
7. **org-admin / RMS / Manga Verde** — nothing required by CR-006. The option is opt-in; their tables
   are byte-identical whether they bump or not.
8. Still open from earlier changes: CR-001's colour-stage chips on the tablet receiving screen.
