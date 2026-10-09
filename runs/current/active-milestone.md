# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-10-09.

## Current: CR-DESIGN-SYSTEM-015 — opt-in packhouse theme — **BUILT, GREEN, CLOSED OUT, PR OPEN**

| Field | Value |
|---|---|
| Unit type | **Change Request**, archived to `runs/change-12/` |
| Branch | `change/cr-design-system-015`, off `origin/main` @ `cde6f4e` |
| Layout · ship mode | n/a (not UI-bearing) · **on-green** |
| Build status | 464/23 green; mutations 6/6; DC + CRM re-check owner-accepted |
| Remaining | Nothing in this repo. Follow-up: packhouse EPIC-001-M-02 pins the merged sha |

No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` was created.

## Current: CR-DESIGN-SYSTEM-013 — "Select all" ticks every option — **BUILT, GREEN, CLOSED OUT, PR OPEN**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-10/` (shared with CR-011; see its `README.md`) |
| Branch | `change/cr-design-system-013`, off `origin/main` @ `26fa005` |
| Layout · ship mode | **B** · **on-green** |
| Build status | 450/21 green (baseline 405/19); 10,029 caller shapes byte-identical; mutations 15/15; sensors 0 open; audit exit 0; real Edge browser 17/17 |
| PR | Open — the conductor polls CI and merges on green |
| Remaining | Nothing in this repo. Follow-ups: **CR-DC** (S1) and **CR-CRM** (S2), each in its own lane |

Opt-in `selectAll: "allTicked"` for the grid's filter cell and the list toolbar: every option ticked until the
reader unticks one; "everything except" stored as `excluded`; "Select all" re-ticks; unticking it clears every tick
without emptying the report. Defaults unchanged.

## Previous units

- **CR-DESIGN-SYSTEM-012** — a picker list can be split into sections (Combobox `group`). `runs/change-11/`; `26fa005` (PR #31).
- **CR-DESIGN-SYSTEM-011** — drag and drop, mouse or keyboard. `runs/change-10/CR-DESIGN-SYSTEM-011/`; `76fec2a` (PR #29).
- **CR-DESIGN-SYSTEM-010** — three reviewer findings on CR-009 (tick-list counts, master row, `TableCell.width`). `runs/change-09/`.
- **CR-DESIGN-SYSTEM-009** — multi-value filter cells, compact grid. `3143646` (PR #22).
- **CR-DESIGN-SYSTEM-008** — grid controls. `6ed975d` (PR #20). ⚠ No decision-log entry.
- **CR-DESIGN-SYSTEM-007 … -001** — `runs/change-07/` … `runs/change-01/`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-013 created **no** `runs/epic-NN/` folder, **no**
`milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started; most are not in this repository)

1. **CR-DC (S1)** — pin to the MERGED sha, flip `grid-props.ts:95` to `"allTicked"`, teach `f_<key>_not` end to end.
2. **CR-CRM (S2)** — flip per def; store the exclusion beside the value in the same change.
3. Carried: DC's half of CR-009; CRM pin bump + `dcLabel` (CR-005); DC's CR-002/004 pin bumps; CRM saved-view
   obligation (CR-003); retire the 4 inert `ignoreGhsas` (owner's call); OQ-8 (a browser now runs here).
