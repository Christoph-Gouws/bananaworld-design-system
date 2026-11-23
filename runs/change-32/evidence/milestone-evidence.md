# Milestone evidence — CR-DESIGN-SYSTEM-034

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-32/`) · Date: 2026-11-23 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-32/output/test-results.md` | PASS — 870 of 870 pass; 11 of 11 criteria MET; mutation battery 13/13 |
| Defect log | `runs/change-32/output/defect-log.md` | 4 found in build, all fixed; none open |
| Deployed verification | `runs/change-32/output/deployed-verification.md` | N/A (shared package, nothing deployed); Edge run stands in |
| Revision review | `runs/change-32/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-32/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 (machine-generated) |
| Changed files, known issues, summary | `runs/change-32/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — a link in the office menu in all three modes. Driven in a real browser (Microsoft Edge): `pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-32/evidence/browser-proof/proof.mjs` → **ALL PASS** (42 checks). The real `AppShell` is built into a scratch page with the apps' Tailwind theme, in packhouse teal and the DC's yellow. Measured: Dashboard sits above the first heading with an icon, no chevron and no `aria-expanded`; when current it has `aria-current="page"`, the tinted fill and the inset bar, and no heading is marked; on another screen it is plain and the Loads heading is current; in the 64 px rail it is the first icon, named "Dashboard", marked current, reachable by Tab, its tooltip reads "Dashboard", focusing it opens no flyout, and ArrowDown moves to the first heading; at 390 px there is no sideways scroll, the slide-out has Dashboard first and current, and choosing it closes the menu; with no `topItems` the menu starts at the first heading; axe (incl. colour contrast) 0 violations in each mode and both themes.
Frames (`runs/change-32/evidence/frames/`): `01-open-dashboard-current-teal.png`, `01-…-yellow.png`, `02-open-other-current-teal.png`, `02-…-yellow.png`, `03-rail-tooltip-teal.png`, `03-…-yellow.png`, `04-slide-out-teal.png`, `04-…-yellow.png`, `05-absent-control.png`.

## Manual verification
1. Steps: run the proof command from the package root (Edge installed, network for `pnpm dlx`). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (42).
2. Steps: open `01-open-dashboard-current-teal.png` and `03-rail-tooltip-teal.png`. Expected: Dashboard above Loads, teal fill and bar; in the rail the first icon is focused with a "Dashboard" tooltip. Actual: as expected.
3. NOT done here: a real screen reader, Safari/iPad, an app consuming the slot (PH-016), the DC + CRM render check (`known-issues.md` K-1).

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: one optional prop on an existing component, additive. Only the decision log gained an entry (CR-DESIGN-SYSTEM-034).

## Operator SOP / user manual
N/A — this package has no operator SOP or user manual, and no app changes in this run. SOP owed: the packhouse's operators will see a Dashboard link above the headings (menu, rail icon with tooltip, slide-out) when PH-016 adopts `topItems`; that app's SOP picks it up then.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check; Safari/iPad; a real screen reader.
