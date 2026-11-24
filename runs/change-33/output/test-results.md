# Test results and QA verdict — CR-DESIGN-SYSTEM-035

Date 2026-11-24 · branch `change/cr-design-system-035` off `306e76f` (kit 0.15.0 → **0.16.0**)

## Commands and counts
| Command | Result |
|---|---|
| `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` | **971 / 971 pass, 46 files** (baseline at `306e76f`: 870 / 870 — the handover's number; 101 new tests) |
| `npx tsc --noEmit` | clean |
| `npx prettier --check --print-width 100 --end-of-line auto` on the touched files (not `index.ts`) | clean |
| `pnpm audit:deps` | same as `main` (7 advisories, 2 high both on the existing ignore list); no dependency changed |
| `node runs/change-33/output/mutation-battery.mjs` | **9 / 9 mutants killed** (one escaped first — CountBadge uppercase — a spec line was added, then killed) |
| `pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-33/evidence/browser-proof/proof.mjs` (Microsoft Edge) | **ALL PASS, 73 checks** |
| `quality-sensors.mjs` | 0 open findings (`index.ts` is 299 lines on disk, 300 by the sensor) |

## Acceptance criteria
| # | Criterion | Verdict |
|---|---|---|
| AC-1 | StatTile `tone`: warning amber border + soft fill + amber icon; danger red border, soft fill, icon and value red; success soft green | MET — unit specs per tone; Edge: computed border/fill equal `color-mix(...)` probes, only the danger value is red; frames |
| AC-2 | `linkLabel` at the foot of a linked tile with an arrow; still one link; accessible-name rule unchanged | MET — spec: words inside the one link, arrow aria-hidden, no chevron, caller `aria-label` still wins; Edge: feet align across the row |
| AC-3 | `labelCase` upper (default) / normal | MET — spec; Edge: `text-transform` uppercase vs none |
| AC-4 | Existing StatTile callers render byte-identically | MET — 22 frozen shapes (packhouse dashboard + end-of-shift shapes, kit shapes, each in `data-surface=tablet`, one row) × 3 renders (unchanged, `tone="default"`, `labelCase="upper"`) = 66 equal to HTML captured at `306e76f` before any edit |
| AC-5 | AttentionItem: one link, tone chip (grey/amber/red), bold title, muted line, action + arrow right, hairline between rows | MET — specs + Edge frames |
| AC-6 | Action label hidden under 480 px | MET — spec on the classes; Edge: `display:none` at 479 px, shown at 480 px, and at 390 px |
| AC-7 | Keyboard and screen-reader friendly | MET (deviation noted, see known-issues K-2) — one Tab stop per row, Tab/Enter specs, visible focus ring in Edge, axe incl. colour contrast and label-in-name 0 violations. The name is the visible words with the title first, not the title alone |
| AC-8 | Count badge | MET — new `CountBadge`; 0/null/undefined/negative/NaN/Infinity draw nothing |
| AC-9 | Additive; minor version bump; no consumer pin changed | MET — 0.16.0; three new runtime names (declared in the export inventory), six type names; no removed/changed export |
| AC-10 | Unit tests and rendered screenshots of every tone, link label, normal case, AttentionItem tones | MET — `runs/change-33/evidence/frames/` (8 frames) |

## Manual verification
Steps: run the Edge proof from the package root; open `teal-browser-1440.png` and `yellow-browser-390.png`. Expected: four tones read-only and linked, foot labels aligned, three attention rows plus an icon row, three count bubbles (no bubble for 0), no sideways scroll at 390 px, action words gone at 390 px. Actual: as expected, ALL PASS.

**Overall QA verdict: PASS**
