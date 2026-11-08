# Test results — CR-DESIGN-SYSTEM-029

| Check | Result |
|---|---|
| `pnpm exec vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` (full suite) | **782 pass / 782**, 40 files (baseline 773; 9 new compact specs in `TruckDiagram.test.tsx`; existing specs unedited) |
| `pnpm typecheck` | clean |
| `prettier --print-width 100` on the two touched files | applied |
| Real Edge proof `node runs/change-27/evidence/browser-proof/proof.mjs` | **ALL PASS** (58 checks) |
| Quality sensors | 0 open findings |
| `pnpm audit --prod --audit-level=high` | 2 high / 2 moderate, existing; 2 ignored; no dependency changed |

## Acceptance criteria
| # | Criterion | Verdict |
|---|---|---|
| AC-1 | Optional `density`; absent/`default` renders byte-identically (`renderToString` equality spec) | MET |
| AC-2 | Compact spaces 40 px (under 48), one short line, below 640 px, also under `data-surface=tablet` (browser, 360/390 × browser/tablet × yellow/teal) | MET |
| AC-3 | Drop dividers, Cab/Doors, past-30 warning kept; taken shows no pallet number and is not a button | MET |
| AC-4 | Accessible names, buttons, `<ol start>`, groups identical to default (unit spec) | MET |
| AC-5 | Prints and ≥ 640 px unchanged: compact pixel-identical to default at 768, 1440 and A4 print | MET |
| AC-6 | Stories/tests for compact at 360 and 390 px (browser proof) | MET |
| AC-7 | DC and CRM render checks unchanged | MET by construction: neither imports `TruckDiagram` (grep); full DC+CRM re-check not run, see `known-issues.md` |

## Manual verification
Steps: run the proof command from the package root (Edge installed). Expected: every line PASS. Actual: ALL PASS. Truck height at 390 px: 788 px compact vs 1012 px default (browser surface) and 1112 px default on the tablet surface the packhouse phone uses.

Overall QA verdict: PASS
