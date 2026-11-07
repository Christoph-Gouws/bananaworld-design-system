# Defect log — CR-DESIGN-SYSTEM-028

| # | Found | Defect | Fix |
|---|---|---|---|
| 1 | Owner diagnosis + Stage 04 | `truckDiagramRows(30,[filled(35)])` ended on a null cell | Rows past `positions` are filled to an even count (`truck-diagram-layout.ts`) |
| 2 | Stage 04 | Interaction tests used a comma that the accessible name does not have | Tests corrected to `/^Position 7 /` |
| 3 | Stage 04 | Floor test counted 12 spaces for `positions={8}` with slots to 12 (correct kit behaviour) | Test uses `positions={12}` |
| 4 | Stage 05 | `index.ts` crossed the 300-line sensor limit | Three comments folded; exports on one line each |
