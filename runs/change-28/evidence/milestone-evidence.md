# Milestone evidence — CR-DESIGN-SYSTEM-030

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-28/`) · Date: 2026-11-08 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-28/output/test-results.md` | PASS — 803 of 803 pass; 9 of 9 criteria MET |
| Defect log | `runs/change-28/output/defect-log.md` | none in shipped code |
| Deployed verification | `runs/change-28/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-28/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-28/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-28/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the print panel (preview, Download, Print). Driven in a real browser (Microsoft Edge): `node runs/change-28/evidence/browser-proof/proof.mjs` → **ALL PASS** (60 checks). The real kit component is hosted in a real Sheet and a real SlideOver at 360×640, 390×844, 768×1024 and 1440×900, on the browser and tablet surfaces, in packhouse teal and DC yellow: no sideways scroll; the panel and preview stay inside the host; Download and Print are both in view (at 360×640 the lower button ends at 537–557 px of 640); buttons are at least 36 px (browser) and 56 px (tablet) tall; axe 0 violations including contrast. Flows: Print calls `print()` once and `load()` once, the frame prints exactly once, no window or tab opens, no history entry is added, focus returns to Print and Escape then closes the host; a refused Print (`null`) changes nothing and says nothing; Download saves with the suggested name `nota-de-entrega-0042.pdf`; with no PDF viewer the note says so, no preview loads, and Print saves the file through `print()`; a real PDF blob prints without error or window.
Frames: `runs/change-28/evidence/frames/sheet-{360,390,768,1440}-teal.png`, `slideover-{360,390,768,1440}-teal.png`, `print-after-390-teal.png`, `no-viewer-390-teal.png`, `slideover-pdf-1440-yellow.png`.

## Manual verification
1. Steps: run the proof command from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS.
2. Steps: open `sheet-360-teal.png`. Expected: the note first, Download and Print side by side underneath, both visible. Actual: as expected.
3. NOT done here: a real printer and the print dialog on a real PDF (packhouse Gate D / QA-UAT-002).

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: one new presentation component, additive. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check and §5.6 mutation battery; Safari/iPad; a real printer.
