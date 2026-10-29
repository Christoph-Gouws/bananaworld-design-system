# Milestone evidence — CR-DESIGN-SYSTEM-024

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-22/`) · Date: 2026-10-29 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-22/output/test-results.md` | PASS — 692 tests / 36 files; 7 of 7 criteria MET |
| Defect log | `runs/change-22/output/defect-log.md` | 3 build-time defects, all fixed |
| Deployed verification | `runs/change-22/output/deployed-verification.md` | N/A (no deployed surface); Edge run stands in |
| Revision review | `runs/change-22/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-22/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-22/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the paging bar's words. Driven in a real browser (Microsoft Edge) this session: `node runs/change-22/evidence/browser-proof/proof.mjs` → **ALL PASS**, 22 checks (English bar unchanged "Showing 1–25 of 312"; Portuguese bar "A mostrar 1–25 de 312", picker named "Linhas por página", Anterior/Seguinte in both bars, both `nav`s named in Portuguese, one status and one picker, no English word, no sideways scroll, pressing Seguinte in the bottom bar moves the top status to "A mostrar 26–50 de 312", axe 0 violations) at 1270 px and 375 px.
Frames: `runs/change-22/evidence/frames/01-english-and-portuguese-1270.png`, `02-english-and-portuguese-375.png`.

## Manual verification
1. Steps: run the proof command above from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (22/22).
2. Steps: open the two frames. Expected: English and Portuguese bars are visually the same layout (look A). Actual: same layout; the Portuguese caption is longer and wraps without overflow at 375 px.

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: the change adds an optional prop to a presentation component. Only the decision log gained an entry.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); the plan's mutation battery M1–M8; real touch devices.
