# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-04.

## Current: CR-DESIGN-SYSTEM-001 — **CLOSED OUT, PR open, awaiting conductor merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-01/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-001** |
| Title | A ChoiceGroup chip may carry a colour swatch and its own accessible name, additively |
| Branch | `change/cr-design-system-001`, off `origin/main` @ `b1373c7` |
| Approved layout | **B** — full-height colour stripe |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` 79 passed / 7 files · 0 open defects |
| Remaining | **Conductor merges on green.** This session does not wait for CI and does not merge. |

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-001 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next unit (not started, and not in this repository)

Bananaworld-DC's follow-up: bump DC's design-system pin **against the merged `main` sha** (never a
branch sha), then build the colour-stage chips on the tablet receiving screen using the two new
fields. See `runs/change-01/evidence/developer-handover.md`.
