# Milestone evidence — CR-DESIGN-SYSTEM-035

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-33/`) · Date: 2026-11-24 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-33/output/test-results.md` | PASS — 971 of 971 pass; 10 of 10 criteria MET; mutation battery 9/9 |
| Defect log | `runs/change-33/output/defect-log.md` | 4 found in build, all fixed; none open |
| Deployed verification | `runs/change-33/output/deployed-verification.md` | N/A (shared package, nothing deployed); Edge run stands in |
| Revision review | `runs/change-33/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-33/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 (machine-filled, judgment rows answered) |
| Changed files, known issues, summary | `runs/change-33/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |
| Technical debt | `runs/change-33/technical-debt.md` | TD-1 barrel at the file-size limit |

## Does this change draw anything?
Yes — StatTile tones / link label / normal-case label, the attention list and the count badge. Driven in a real browser (Microsoft Edge): `pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-33/evidence/browser-proof/proof.mjs` → **ALL PASS** (73 checks). The real components are built into a scratch page with the apps' Tailwind 3.4 theme, in packhouse teal and the DC's yellow, on the browser and tablet surfaces, at 1440 and 390 px. Measured: Tailwind emitted the color-mix classes and `min-[480px]:`; each tone's computed border/fill equals the `color-mix` of the kit tokens; only the danger value is red; labels are uppercase by default and normal when asked; the four foot labels align; the attention action label is shown at 480 px and hidden at 479 and 390 px; count bubbles draw for 3/1/12 and not for 0; Tab reaches tile links then attention rows with a visible focus ring; no sideways scroll at 390 px; axe (every rule except `region`, incl. colour contrast and label-in-name) 0 violations in every combination.
Frames (`runs/change-33/evidence/frames/`): `teal-browser-1440.png`, `teal-browser-390.png`, `teal-tablet-1440.png`, `teal-tablet-390.png`, `yellow-browser-1440.png`, `yellow-browser-390.png`, `yellow-tablet-1440.png`, `yellow-tablet-390.png`. The mockup gate was confirmed by the owner (look already approved; layout A).

## Manual verification
1. Steps: run the proof command from the package root (Edge installed, network for `pnpm dlx`). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (73).
2. Steps: open `teal-browser-1440.png` and `yellow-browser-390.png`. Expected: four tones (default, amber, red with red value, green), linked tiles with "Cold rooms →" at the foot and no chevron, a chevron tile and a dash tile, "Needs your attention" with three count bubbles and four rows (red, amber, grey, amber-with-icon). Actual: as expected.
3. NOT done here: a real screen reader, Safari/iPad, the packhouse consuming the parts, the DC + CRM render check (`known-issues.md` K-1).

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: three optional props on an existing component plus two new small components, additive. Only the decision log gained an entry (CR-DESIGN-SYSTEM-035).

## Operator SOP / user manual
N/A — this package has no operator SOP or user manual, and no app changes in this run. SOP owed: when the packhouse adopts the parts, operators will see tinted figure boxes with "where it leads" words at the foot, and a "needs your attention" list with a count bubble; that app's SOP picks it up then.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.6 DC + CRM re-check; Safari/iPad; a real screen reader.
