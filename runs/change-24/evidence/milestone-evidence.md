# Milestone evidence — CR-DESIGN-SYSTEM-026

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-24/`) · Date: 2026-10-30 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-24/output/test-results.md` | PASS — 729 of 729 pass; 9 of 9 criteria MET |
| Defect log | `runs/change-24/output/defect-log.md` | 4 self-review items, fixed |
| Deployed verification | `runs/change-24/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-24/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-24/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-24/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the headline figure tile. Driven in a real browser (Microsoft Edge) this session: `node runs/change-24/evidence/browser-proof/proof.mjs` → **ALL PASS**, 93 checks, at 390 px, 768 px (tablet surface) and 1280 px, each under default yellow, packhouse teal and a dark token fixture: no sideways scroll; 2 tiles across at 390 and 768, 4 at 1280; equal heights per line; every value inside its tile; chevron never over the label; 3 px accent rule; empty tile shows one dash and a spoken reason; a real zero prints 0; 3 tiles wrap 2 + 1 then share a line; Waiting tile is a link named by its text with a focus ring; read-only tile has nothing focusable; axe 0 violations including contrast.
Frames: `runs/change-24/evidence/frames/{390-phone,768-tablet,1280-desktop}-{yellow,teal,dark}.png`.

## Manual verification
1. Steps: run the proof command above from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (93/93).
2. Steps: open `390-phone-teal.png`. Expected: look A — icon + name on top, big figure, sub-line, teal top rule, dash on the empty tile, chevron on the Waiting tile. Actual: as expected.

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: a new presentation component. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check and §5.6 mutation battery M1–M9; real touch devices.
