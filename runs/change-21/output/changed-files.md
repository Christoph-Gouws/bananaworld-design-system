# Changed files — CR-DESIGN-SYSTEM-023

## Source (`src/`)
- `src/components/LinkedRecords.tsx` — new (`LinkedRecords`, `LinkedRecordsItem`, private `SummaryCard`, `InfoButton`, `useCannotHover`)
- `src/components/DocumentHeader.tsx` — optional `linked` prop + private `HeaderFrame`; slot array and `slots.map(` untouched
- `src/components/index.ts` — +14 lines (comment + export block); no existing line moved

## Tests
- `tests/components/LinkedRecords.test.tsx` — new
- `tests/components/DocumentHeader.linked.test.tsx` — new (byte-identity vs frozen copy, `linked` placement)
- `tests/components/fixtures/DocumentHeader.frozen-bb6c22e.tsx` — new frozen copy of the header at bb6c22e
- `tests/components/DragBoard.additive.test.tsx` — two names declared in `ADDED_SINCE_011`

## Package / docs
- `package.json` — version 0.6.0 → 0.7.0
- `README.md` — changelog 0.7.0 + "Linked records"
- `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CR-DESIGN-SYSTEM-023 entry

## Paper trail
- `runs/change-21/output/*` (incl. `mutation-battery.mjs`), `runs/change-21/evidence/*` (incl. `browser-proof/` and `frames/`)
- `runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md`
- `runs/current/logic-plan/CR-DESIGN-SYSTEM-023.*`, `runs/current/mockups/CR-DESIGN-SYSTEM-023/` (planning artefacts)
- `organization/CONTEXT_USAGE_LOG.md` row (outside this worktree; written by the logging script)

Deleted: none.
