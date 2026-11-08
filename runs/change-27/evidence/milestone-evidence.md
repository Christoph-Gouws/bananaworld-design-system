# Milestone evidence — CR-DESIGN-SYSTEM-029

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-27/`) · Date: 2026-11-08 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-27/output/test-results.md` | PASS — 782 of 782 pass; 7 of 7 criteria MET |
| Defect log | `runs/change-27/output/defect-log.md` | none |
| Deployed verification | `runs/change-27/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-27/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-27/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-27/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the truck loading picture at a compact size. Driven in a real browser (Microsoft Edge): `node runs/change-27/evidence/browser-proof/proof.mjs` → **ALL PASS** (58 checks): at 360 and 390 px, under both the browser and tablet surface, in yellow and packhouse teal: compact spaces are 40 px (default 48, or 56 on the tablet surface), at least 48 px wide, two across, no sideways scroll; Cab, Drop 2, Drop 1, Doors in order; a taken space shows no pallet number and is not a button; the past-30 warning stays; the truck is about a quarter to a third shorter (788 px vs 1012 / 1112 px); a real tap on a 40 px space reports its position; axe 0 violations including contrast. At 768, 1440 and A4 print, compact is pixel-identical to default.
Frames: `runs/change-27/evidence/frames/compact-{360,390}-{yellow,teal}.png` (tablet surface, as the packhouse phone) and `default-390-teal.png` for comparison.

## Manual verification
1. Steps: run the proof command from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS.
2. Steps: open `compact-390-teal.png` beside `default-390-teal.png`. Expected: the same Cab, drop dividers, spaces and Doors; compact rows slimmer with number and pallet on one line. Actual: as expected.

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: one optional presentation prop. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.2 frozen fixtures (an in-test equality spec instead), §5.5 DC + CRM re-check and §5.6 mutation battery; real touch devices (40 px with gloves is the owner's accepted risk, plan D-4).
