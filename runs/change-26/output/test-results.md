# Test results — CR-DESIGN-SYSTEM-028

| Check | Result |
|---|---|
| `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` (full suite) | **773 pass / 773**, 40 files (TruckDiagram 24 + truck-diagram-layout 20 are new) |
| `npx tsc --noEmit` | clean |
| `npx prettier --print-width 100 --check` on the two new source files | clean |
| Real Edge browser proof `node runs/change-26/evidence/browser-proof/proof.mjs` | **ALL PASS**, 360 / 390 / 768 (tablet surface) / 1440 px × yellow and packhouse teal, plus print emulation |
| Quality sensors | 0 open findings (`index.ts` folded to 300 lines) |

Run flags: this PC is short of memory, so the suite ran on threads with 1–2 workers (owner chat 2026-11-07).

## Defects fixed this round (owner chat diagnosis)
1. Geometry: a slot past `positions` left a null cell (35 with positions 30). Slots past `positions` now add whole rows (35 and 36 drawn); an odd `positions` itself (23) is still honoured.
2. Interaction tests looked for the name `Position 7,`; the real accessible name is `Position 7 P7` (space-joined). Tests corrected; the buttons were already native `<button>`s.
3. The 48 px / 56 px floor test used `positions={8}` with slots up to 12, so 12 spaces were correctly drawn. Test now uses 12.

## Acceptance criteria
AC-1 to AC-10 (rows 1–10 below): all MET. `pnpm audit:deps` reports 2 high / 2 moderate in existing dependencies; no dependency was added or changed by this change.

| # | Criterion | Verdict |
|---|---|---|
| 1 | Two spaces wide, numbered from the cab to the doors | MET |
| 2 | `positions` may exceed 30; extra spaces show a warning style and words (`standardPositions`, no default) | MET |
| 3 | Slots with label, state empty/filled/taken/selected, note; `onSlotTap(position)` | MET |
| 4 | `taken` never shows a pallet number and is never a button | MET |
| 5 | Drop blocks: drop 2 at the cab, drop 1 by the doors, labelled dividers; one drop draws none; shared row tags the odd space | MET |
| 6 | `frontLabel` / `backLabel` and every word supplied by the caller (EN and PT) | MET |
| 7 | Kit tokens only; touch targets ≥ 48 px (56 px tablet) | MET |
| 8 | Renders at 360, 390, 768, 1440 px with no sideways scroll | MET |
| 9 | Prints cleanly (print emulation: no overflow, labels and Taken word present; state never colour alone) | MET |
| 10 | Additive only: new names, existing exports unchanged (export inventory test) | MET |

## Manual verification
Steps: run the proof command from the package root. Expected: every line PASS. Actual: ALL PASS. Frames in `runs/change-26/evidence/frames/`.

Overall QA verdict: PASS
