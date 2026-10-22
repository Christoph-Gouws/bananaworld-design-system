# Changed files — CR-DESIGN-SYSTEM-021

## Source (`src/`)
- `src/components/Keypad.tsx` — new
- `src/components/keypad-entry.ts` — new (pure digit rules, not exported from the barrel)
- `src/components/ActionTile.tsx` — new
- `src/components/index.ts` — +5 lines (comment + two export lines); no existing line moved

## Tests
- `tests/components/Keypad.test.tsx` — new
- `tests/components/ActionTile.test.tsx` — new
- `tests/components/DragBoard.additive.test.tsx` — two names declared in `ADDED_SINCE_011`

## Package / docs
- `package.json` — version 0.5.0 → 0.6.0; `next@<15.5.24` override floor raised to `next@<15.5.28` (audit, see known-issues.md K-1)
- `pnpm-lock.yaml` — follows the override (next 15.5.25 → 15.5.28 in this repo's CI closure only)
- `README.md` — changelog 0.6.0 + "Tablet counting and big buttons"
- `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CR-DESIGN-SYSTEM-021 entry

## Paper trail
- `runs/change-19/output/*`, `runs/change-19/evidence/*` (incl. `browser-proof/` and `frames/`)
- `runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md`
- `runs/current/logic-plan/CR-DESIGN-SYSTEM-021.*`, `runs/current/mockups/CR-DESIGN-SYSTEM-021/` (planning artefacts, committed with the change)
- `organization/CONTEXT_USAGE_LOG.md` row (outside this repo's worktree; written by the logging script)

Deleted: none.
