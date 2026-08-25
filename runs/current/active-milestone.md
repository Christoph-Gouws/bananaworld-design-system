# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-25.

## Current: CR-DESIGN-SYSTEM-007 — **CLOSED OUT, PR open, awaiting CI + merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-07/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-007** |
| Title | When a row instruction and a single box disagree, the box wins |
| Type | **Review follow-up on CR-DESIGN-SYSTEM-006** — 1 finding (F1, medium/medium), **confirmed present before it was fixed** |
| Branch | `change/cr-design-system-007`, off `origin/main` @ `ce47010` |
| Approved layout | **A** — the cell's own answer wins (D-2) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **269 passed / 14 files** · 0 open defects · `src/` **+31 / −13** (3 lines of behaviour) |
| Additive proof | **All three barrels byte-identical**; no field added or removed, no default moved, no export changed; **1,536 caller shapes rendered against `main@ce47010` and diffed on whole `innerHTML` — byte-identical**; **0 existing specs edited, 0 reddened**; 5 mutations run, **5 caught** |
| CI | Not waited for, by instruction. The conductor polls and merges |
| Remaining | **Nothing in this lane.** No decision is open. No consumer pin was bumped and none may be bumped from here |

### What it did

CR-006 computed `askedForValign` from the **row-resolved** value, so a row-level `valign` took the
after-`className` emission slot and **silently beat a cell's own vertical utility in `className`** —
inverting D-6 (cell > row > default) for that pair. The fix is **one predicate**:
`cellAskedForValign = valign !== undefined` — *"the cell itself asked"*, not *"anybody asked"*.

**Final precedence, now written into the file header and both `valign` doc-comments:**
**cell `valign` prop > cell `className` > row `valign` prop > the `"middle"` default.**

- 🔴 **The default did not move** — value or position. D-2 intact, pinned by T-1/T-8.
- 🔴 **Both class-emission positions stay.** This change *depends* on both existing.
- **Two files**, `src/components/Table.tsx` and `tests/components/Table.test.tsx` (new §8, T-17…T-22).
- ⚠ **One declared behaviour change, measured:** of 576 row-`valign` shapes, 456 identical, 72
  class-**order**-only, **48 rendering changes — every one exactly the defect's shape.** **Zero
  consumers can observe it today.**

## Previous units

- **CR-DESIGN-SYSTEM-006** — a row of fields can line up along the top. `runs/change-06/`; merged to
  `main` as `ce47010` (PR #17).
- **CR-DESIGN-SYSTEM-005** — the depot slot's label is chosen by the app wearing the header.
  `runs/change-05/`; merged as `fc6f6c6` (PR #15).
- **CR-DESIGN-SYSTEM-004** — a shared paging control for long lists. `runs/change-04/`; merged as
  `0633476` (PR #14).
- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. `runs/change-03/`; merged as
  `fc2c5b8` (PR #13).
- **CR-DESIGN-SYSTEM-002** — the document header moves into the shared package. `runs/change-02/`;
  merged as `9aa20f7` (PR #10 / #11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; merged as
  `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-007 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started, and not in this repository)

1. 🔴 **The CRM's pin bump, then its sales-order grid adoption — a SEPARATE change, and the only thing
   that actually fixes the misaligned row on screen.** Bump to the **merged `main` sha** (never a
   branch sha, KI-M001E19-002), then pass `valign="top"`. **Neither CR-006 nor CR-007 fixes any
   screen.** Three steps, in order — and fixing precedence now means the CRM never meets the bug.
2. 🔴 **Every consumer owes ONE grep before it bumps its pin: `grep -rn "valign" src`.** **DC is proven
   clean — 0 occurrences repo-wide.** CRM, RMS, org-admin and Manga Verde are **unreadable from a
   build worktree and were not checked**. **New:** a consumer adopting `<TableRow valign>` should also
   grep for `align-top|align-middle|align-bottom` in its cells' `className` — those now keep their own
   answer, which is intended but *is* a rendering difference from CR-006's behaviour.
3. **DC, optionally and at its own discretion (CR-006 OQ-5):** its sales-order grid hand-rolls raw
   `<td>`s with `align-top` and may now fold back onto `TableCell`. **Nothing in DC is broken and no
   action is required.**
4. 🔴 **The CRM's pin bump + `dcLabel` adoption from CR-005** — the other half of CR-CRM-015's unblock.
   Unchanged by this change and still outstanding.
5. **DC's pin bumps for CR-002 and CR-004, then CR-DC-052** — paginate DC's transaction lists.
6. **CRM's adoption change from CR-003** — the seven-point saved-view obligation.
7. **org-admin / RMS / Manga Verde** — nothing required. The option is opt-in; their tables are
   byte-identical whether they bump or not.
8. Still open from earlier changes: CR-001's colour-stage chips on the tablet receiving screen.
