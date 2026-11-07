# Changed files — CR-DESIGN-SYSTEM-028

- `src/components/TruckDiagram.tsx` (new) — `TruckDiagram`, `TruckDiagramProps`, `TruckDiagramWords`
- `src/components/truck-diagram-layout.ts` (new) — `truckDiagramRows` and the slot/row/cell types (pure, no React)
- `src/components/index.ts` — one new export block
- `tests/components/TruckDiagram.test.tsx` (new) — 24 specs
- `tests/components/truck-diagram-layout.test.tsx` (new) — 20 specs
- `tests/components/DragBoard.additive.test.tsx` — inventory gains `TruckDiagram`, `truckDiagramRows`
- `package.json` — version 0.10.0 → 0.11.0
- `README.md` — 0.11.0 changelog, "Truck loading picture" section
- `runs/change-26/evidence/browser-proof/` (`main.tsx`, `proof.mjs`, `index.html`, `tailwind.config.cjs`) — browser proof; frames in `runs/change-26/evidence/frames/`
- `runs/current/logic-plan/CR-DESIGN-SYSTEM-028.md`, `.estimate.json`, `runs/current/mockups/CR-DESIGN-SYSTEM-028/` — plan and mockups
- `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`, `runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md`
- `runs/change-26/**` — the paper trail
