# Milestone evidence — CR-DESIGN-SYSTEM-032

Project: bananaworld-design-system · Unit: Change Request (archived `runs/change-30/`) · Date: 2026-11-22 · Layout A · Ship mode on-green

## Artifacts (pointers only)
| Artifact | Path | Status |
|---|---|---|
| Test results + QA verdict | `runs/change-30/output/test-results.md` | PASS — 850 of 850 pass; 9 of 9 criteria MET; mutation battery 11/11 |
| Defect log | `runs/change-30/output/defect-log.md` | 7 found in build, all fixed; none open |
| Deployed verification | `runs/change-30/output/deployed-verification.md` | N/A (shared package, nothing deployed); Edge run stands in |
| Revision review | `runs/change-30/output/revision-review.md` | done |
| Readable code / Centrality | `runs/change-30/output/readable-code-scorecard.md`, `centrality-scorecard.md` | PASS 11/11, PASS 8/8 |
| Changed files, known issues, summary | `runs/change-30/output/changed-files.md`, `known-issues.md`, `implementation-summary.md` | present |

## Does this change draw anything?
Yes — the whole office frame. Driven in a real browser (Microsoft Edge): `node runs/change-30/evidence/browser-proof/proof.mjs` → **ALL PASS** (30 checks). The real `AppShell`, `UserMenu` and `PageHeader` are built into a scratch page with the apps' Tailwind theme, in packhouse teal (frames 1–6) and the DC's yellow (frame 7). Measured: open menu 240 px, rail 64 px and remembered across a reload; the current screen and its heading are marked; Admin (all items hidden) is absent; opening Stock closes Loads; header and menu rectangles do not move after a 4,000 px wheel, the document does not scroll and `main` does; at 1920 px the page content starts 24 px right of the menu; a 1366×640 long menu scrolls inside the menu with Help still in view; keyboard focus opens a rail flyout beside the rail fully on screen, Esc closes it, hover opens and closes it; the language choice keeps the user menu open and Esc returns focus to the name; at 820 px the menu is hidden and the header shows the menu button, the slide-out shows the same menu, traps focus, closes on Esc (focus back on the button) and on a tap outside; no sideways scroll at 820 and 390 px; the empty page keeps its PageHeader beside the EmptyState; axe (incl. colour contrast) 0 violations in each state, two Radix-internal rules recorded in `known-issues.md` K-3.
Frames: `runs/change-30/evidence/frames/01-open-menu.png`, `02-rail.png`, `03-rail-flyout.png`, `04-user-menu.png`, `05-narrow.png`, `06-slide-out.png`, `07-dc-yellow-empty.png`.

## Manual verification
1. Steps: run the proof command from the package root (Edge installed). Expected: every line PASS, "ALL PASS". Actual: ALL PASS (30).
2. Steps: open `01-open-menu.png` and `06-slide-out.png`. Expected: Loads open with Waiting marked and a `2` pill on the heading and on Waiting; Help pinned at the foot; the slide-out shows the same menu over a grey scrim. Actual: as expected.
3. NOT done here: a real screen reader, Safari/iPad, an app consuming the frame (Run 2).

## Stage 07 amendments
No `source-documents/active/*` rule, contract or workflow changed: one new presentation component family, additive. Only the decision log gained an entry (CR-DESIGN-SYSTEM-032).

## Operator SOP / user manual
N/A — this package has no operator SOP or user manual (no `docs/operator-guides/SOP/`), and no app changes in this run. SOP owed: the packhouse's operators will see a new side menu, rail, header name menu and slide-out menu when Run 2 adopts the frame; that app's SOP picks it up then.

## Not run / not claimed
CI (the conductor polls it); consumer apps (read-only, no pin moved); plan §5.5 DC + CRM re-check (`known-issues.md` K-1); Safari/iPad; a real screen reader.
