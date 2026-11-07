# Milestone evidence — CR-DESIGN-SYSTEM-028

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-26/`) · Date: 2026-11-07 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-26/output/test-results.md` | PASS — 773 of 773 pass; 10 of 10 criteria MET |
| Defect log | `runs/change-26/output/defect-log.md` | 4 items, fixed |
| Deployed verification | `runs/change-26/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-26/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-26/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-26/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the truck loading picture. Driven in a real browser (Microsoft Edge) this session: `node runs/change-26/evidence/browser-proof/proof.mjs` → **ALL PASS** at 360, 390, 768 (tablet surface) and 1440 px, each under default yellow and packhouse teal, plus print emulation: no sideways scroll; 30 spaces two across, all inside the picture; every space ≥ 48 px (56 px tablet); Cab at the top, Drop 2 then Drop 1, Doors at the bottom; a taken space shows no pallet number and is not a button; 34 pallets show the warning words and no drop lines; three drops draw three labelled blocks with tags on the shared rows; an odd count of 23 draws 23; Portuguese words and a long label stay inside the space; a real tap and Enter report the position; focus ring shown; axe 0 violations including contrast.
Frames: `runs/change-26/evidence/frames/{360-phone,390-phone,768-tablet,1440-desktop}-{yellow,teal}.png` and `print-shared.png`.

## Manual verification
1. Steps: run the proof command above from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS.
2. Steps: open `390-phone-teal.png`. Expected: Cab block on top, "Drop 2 · unloaded last" divider over hatched taken spaces, "Drop 1 · unloaded first" divider over our pallet numbers with one selected (check icon), Doors block at the bottom. Actual: as expected.

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: a new presentation component. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check and §5.6 mutation battery; real touch devices; a real printer.
