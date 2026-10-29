# Milestone evidence — CR-DESIGN-SYSTEM-025

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-23/`) · Date: 2026-10-29 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-23/output/test-results.md` | PASS — 709 of 710 pass, the 1 is an import-time timeout that passes with a longer timeout; 8 of 8 criteria MET |
| Defect log | `runs/change-23/output/defect-log.md` | 1 self-review defect, fixed |
| Deployed verification | `runs/change-23/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-23/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-23/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-23/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the bar chart. Driven in a real browser (Microsoft Edge) this session: `node runs/change-23/evidence/browser-proof/proof.mjs` → **ALL PASS**, 63 checks, at 390 px, 768 px (tablet surface) and 1280 px, each under the default yellow, packhouse teal and a dark token fixture: no sideways scroll, every figure inside its row and on one line, fill width within 1 px of share × track, nothing-yet shows names + dashes + no bars, no-items shows a dash and a spoken reason, long label never overlaps the figures, figures present in the accessible table, axe 0 violations including colour contrast.
Frames: `runs/change-23/evidence/frames/{390-phone,768-tablet,1280-desktop}-{yellow,teal,dark}.png`.

## Manual verification
1. Steps: run the proof command above from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (63/63).
2. Steps: open `390-phone-teal.png`. Expected: name, bar, amount · share on one line (look A), warning line orange and named, total underneath, dashes and no bars when nothing packed. Actual: as expected.

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: a new presentation component. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check and §5.6 mutation battery M1–M9; real touch devices.
