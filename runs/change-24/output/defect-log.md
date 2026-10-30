# Defect log — CR-DESIGN-SYSTEM-026

| # | Found | Defect | Fix |
|---|---|---|---|
| 1 | Stage 04 self-test | The header comment contained the literal `"use client"`, so the no-directive guard spec failed on its own file | Comment reworded |
| 2 | Stage 04 self-test | The server-render spec put the kit `Link` (a client component) through `renderToString` with the test mock, which uses a hook | Spec renders only read-only tiles and the row on the server |
| 3 | Browser proof | The chevron-overlap check measured the full-width label box, not the label text (false alarm, not a component bug) | Check measures the text span |
| 4 | Stage 05 | `index.ts` crossed the 300-line sensor limit | Barrel comment folded; one export line; sensor CLEAN |
