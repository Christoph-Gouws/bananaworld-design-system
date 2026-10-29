# Test results and QA verdict — CR-DESIGN-SYSTEM-025

Plan facts re-checked against `main` @ `964160b` (kit 0.8.0, barrel, inventory test, `ActionTile` idiom): still as described.

## Commands
- `pnpm test` → 710 tests / 37 files: **709 pass, 1 times out** (baseline at CR-024: 692 / 36; this change adds 18 specs in `BarChart.test.tsx`). The one red is `table-controls.test.tsx` "exports both helpers … from `src/index.ts`": it does the first `await import("../../src")` inside the test, and the cold import of the whole barrel takes ~6–8 s on this machine against vitest's 5 s default. Re-run with `--testTimeout=60000`: 49/49 pass. I could not run it against an unmodified `main` here, so I do not claim it is a pre-existing timeout; it is an import-time timeout with no failing assertion.
- `pnpm vitest run tests/components/BarChart.test.tsx tests/components/DragBoard.additive.test.tsx` → pass (inventory: exactly one declared runtime addition, `BarChart`).
- `pnpm typecheck` → clean.
- `pnpm audit:deps` → exit non-zero is the pre-existing state (4 vulnerabilities, 2 ignored); no dependency was added or changed, `pnpm-lock.yaml` untouched.
- `prettier --check --print-width 100` → `BarChart.tsx` and `BarChart.test.tsx` clean. `src/components/index.ts` fails the check, and it fails identically on the unmodified HEAD copy (pre-existing).
- `node runs/change-23/evidence/browser-proof/proof.mjs` (Edge) → **ALL PASS, 63 checks** (390 / 768 tablet / 1280 px × yellow / packhouse teal / dark fixture).

## Acceptance criteria
| # | Criterion | Verdict |
|---|---|---|
| AC-1 | Horizontal bars, label, bar, amount and share printed per line (look A) | MET (frames) |
| AC-2 | Optional total | MET (unit + frame) |
| AC-3 | Empty/zero: dash, no broken bars | MET (unit; nothing-yet and no-items frames) |
| AC-4 | Theme-aware, light and dark, token classes only | MET (yellow, teal, dark fixture; sensor CE-01 0) |
| AC-5 | Readable at 390 px, tablet, desktop | MET (no sideways scroll, no clipped figure, figures on one line, long label does not overlap) |
| AC-6 | Accessible: real table behind the picture, colour never the only carrier | MET (role=table/row/rowheader/cell, axe 0 incl. contrast at all widths and colour sets) |
| AC-7 | No new dependency; computes nothing business-specific | MET (`package.json` dependencies unchanged; caller passes texts) |
| AC-8 | Additive only | MET (diff of `src/`: new `BarChart.tsx` + barrel block; inventory test; no existing kit file's code changed) |

## Not run
Plan §5.5 DC + CRM re-check and §5.6 mutation battery M1–M9: not executed this session (stated honestly; no existing kit file's code changed, so the additive claim rests on the diff and the inventory test).

Overall QA verdict: PASS
