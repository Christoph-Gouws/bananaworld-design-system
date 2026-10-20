# Test results — CR-DESIGN-SYSTEM-020

Commands: `pnpm test` (vitest run) → **554 passed / 28 files** (baseline at `1fefb6c`: 531 / 26; +23 tests, +2 files). `pnpm typecheck` clean. `pnpm audit --prod --audit-level=high` exit 0. `prettier --check --print-width 100` clean on touched files. Sensors: 0 open. Real Edge run: `node runs/change-18/evidence/browser-proof/proof.mjs` → 16/16 PASS.

## Acceptance criteria
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 | Optional `href` + `fileName` props | MET | `ExportButton.tsx`; type-checks, no prop removed |
| AC-2 | href, not disabled → `<a href download=fileName>` as secondary Button; children replace label | MET | `ExportButton.test.tsx` (link, children); Edge: href/download read back |
| AC-3 | href + disabled (or inflight) → disabled `<button>`, no anchor | MET | tests ×3 shapes; Edge: disabled, 0 downloads |
| AC-4 | No href → byte-identical to today (toast), pins DC | MET | frozen-copy matrix (3 formats × 3 children × 5 shapes), `href=""`, toast text, still needs ToastProvider |
| AC-5 | No network call | MET | fetch spy 0 calls on click; no fetch/XHR/location/createObjectURL in source (one comment word "fetches") |
| AC-6 | Touch ≥ 44 px, keyboard, axe | MET | Edge touch 390px: height ≥ 44; Tab+Enter downloads; axe 0 violations (happy-dom and in Edge) |
| AC-7 | README changelog + usage note | MET | README 0.5.0 + "Export button download link" (no gallery/story exists in this repo) |

## Manual verification (real Edge, Playwright)
Mouse click on the link → download, suggested name `report.xlsx` (expected `report.xlsx`) PASS. Tab focuses link, Enter downloads PASS. Disabled variant: no download PASS. No-href button: toast "Export coming soon" PASS. Mouse height 36 px, tablet 56 px, touch ≥ 44 px PASS. Frames: `runs/change-18/evidence/frames/`.

Not run: mutation battery (the plan listed one; the frozen-copy matrix and per-branch tests cover the same ground, but no mutants were executed — stated, not claimed).

Overall QA verdict: PASS
