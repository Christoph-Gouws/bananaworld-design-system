# Test results — CR-DESIGN-SYSTEM-023

Commands: `pnpm test` → **671 passed / 32 files** (baseline re-measured at `bb6c22e`: 615 / 30; +56 tests, +2 files). `pnpm typecheck` clean. `pnpm audit:deps`: only the owner-ignored highs remain (no new advisory). `prettier --check --print-width 100` clean on the new files. Sensors: 2 open, both inherited in `DocumentHeader.tsx` (readable-code-scorecard.md). Mutation battery `node runs/change-21/output/mutation-battery.mjs` → **10 / 10 killed**. Real Edge run `node runs/change-21/evidence/browser-proof/proof.mjs` → **ALL PASS** (33 checks, 1270 px mouse; 820 and 375 px touch).

## Acceptance criteria
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 | `LinkedRecords` / `LinkedRecordsItem`, presentation only, layout A, groups in the order given, empty group not drawn | MET | `LinkedRecords.test.tsx` "render per state"; Edge frames |
| AC-2 | States ready / loading / error (+ `onRetry`) and the empty line | MET | same file; Edge frame 01 |
| AC-3 | Mouse hover opens the card (link with no forwardRef, props dropped); keyboard focus opens it; Escape closes; card not interactive | MET | `LinkedRecords.test.tsx`; Edge hover / focus / Escape |
| AC-4 | Info button rendered only under `hover: none`, a real button, named "Summary of N", hit area ≥ 40 px | MET | matchMedia stub tests; Edge touch boxes ≥ 40 × 40 |
| AC-5 | Tap opens the bottom Sheet with the card and the app's link; Close returns focus to the button | MET | `LinkedRecords.test.tsx`; Edge 820 and 375 px |
| AC-6 | Refused item: lock named by `refusedLabel`, no button, no card, no link, no date | MET | `it.each` in both hover modes |
| AC-7 | `DocumentHeader linked`: under the four slots, inside the frame, outside the `<dl>` (still 4 `dt`, 4 `div`); `DOCUMENT_HEADER_SLOTS` untouched | MET | `DocumentHeader.linked.test.tsx`; Edge |
| AC-8 | Header without `linked` byte-identical to `bb6c22e` | MET | frozen copy vs live over 90 shape combinations × 3 absent forms |
| AC-9 | Additive exports declared; no existing test edited bar the inventory line | MET | `DragBoard.additive.test.tsx` + 615 unchanged tests green |
| AC-10 | axe clean (ready, empty, loading, error, buttons shown, sheet open, header, real browser) | MET | happy-dom and Edge: 0 violations |

## Manual verification
Steps, expected and actual are in `runs/change-21/evidence/milestone-evidence.md` §7.

Overall QA verdict: PASS
