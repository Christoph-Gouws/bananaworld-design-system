# Developer handover — CR-DESIGN-SYSTEM-028

**Next agent / next action:** packhouse EPIC-006-M-01 pins the MERGED sha of this change and adopts `TruckDiagram` (README "Truck loading picture"); M-02 draws the delivery-note PDF from `truckDiagramRows`. Nothing else is owed in this repo.

**Current state:** built, green, PR open. Kit 0.11.0. Archive `runs/change-26/` (`output/`, `evidence/`, `evidence/frames/`, `evidence/browser-proof/`).

**Rules to keep:**
1. `TruckDiagram.tsx` and `truck-diagram-layout.ts` have no client directive and no hook (a guard spec reads both files).
2. The app decides every state, label and drop; the kit draws what it is given and never reorders drops. Last drop at the cab, first by the doors is the app's rule.
3. `taken` never shows a label and is never a button. `standardPositions` has no default.
4. Slots past `positions` fill their row (35 draws 35 and 36); an odd `positions` is honoured.
5. Additive-only: new optional props only. `src/components/index.ts` is at the 300-line sensor limit: fold comments, do not add lines.
6. Browser proof: `node runs/change-26/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only).
7. Run tests on this PC with `--pool=threads --maxWorkers=2 --testTimeout=60000`.
