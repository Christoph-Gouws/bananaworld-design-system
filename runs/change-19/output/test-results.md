# Test results — CR-DESIGN-SYSTEM-021

Commands: `pnpm test` → **615 passed / 30 files** (baseline at `3953e6d`: 554 / 28; +61 tests, +2 files). `pnpm typecheck` clean. `pnpm audit --prod --audit-level=high`: only the 2 owner-ignored highs remain (see known-issues K-1). `prettier --check --print-width 100` clean on the new files. Sensors: 0 open. Mutation battery `node runs/change-19/output/mutation-battery.mjs` → **11 / 11 killed**. Real Edge run `node runs/change-19/evidence/browser-proof/proof.mjs` → **ALL PASS** (34 checks, 375 px and 1024 px, touch emulation).

## Acceptance criteria
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 | Keypad: keys 1-9, Clear, 0, Backspace; controlled; `maxDigits` default 4; label; target; disabled | MET | `Keypad.test.tsx`; Edge: 12 keys, taps 1,2 → 12, fifth digit ignored |
| AC-2 | Keys ≥ 64 px on touch; tabular digits; Clear/Backspace secondary | MET | class test; Edge: every key ≥ 64 px at 375 and 1024 |
| AC-3 | Leading zeros dropped; backspace on empty and clear on empty make no call; no decimals/rounding/network | MET | table-driven `pressKeypadKey`; no-call tests; no fetch in source |
| AC-4 | Physical digits, Backspace, Delete work with focus; accessible names; polite announce; axe clean | MET | keyboard tests; Edge keyboard 9 / Backspace / Delete; axe 0 violations in happy-dom and in Edge |
| AC-5 | ActionTile: icon above label, hint, badge, default/primary, disabled, button or link, ≥ 86 px, fills cell, wraps at 375 | MET | `ActionTile.test.tsx`; Edge: tiles ≥ 86 px, equal width, no label clipped at 375 |
| AC-6 | FigureTile only if needed | MET (not added) | `ListCard` composition rendered in the gallery frames; README |
| AC-7 | Exported from the index; shown with their states; unit tests; render proof at 375 and 1024 | MET | inventory test; `browser-proof/main.tsx` states; frames `01-gallery-375.png`, `02-gallery-1024.png` |
| AC-8 | Additive: no consumer pin changed, no existing caller changed | MET | `src/` diff = `index.ts` +5/−0 + 3 new files; 554 existing tests pass unedited except the inventory declaration |

## Manual verification (real Edge via Playwright, `hasTouch`)
Steps: open the gallery at 375×812 and 1024×768; tap 1, 2 on the live pad; focus a key; press Backspace, 9, Delete, then 5,0,0,0,7; tap the link tile; run axe. Expected / actual: 12 → 1 → 19 → "empty" announced → 5000 (fifth digit ignored); hash `#new-client`; axe 0 violations. All matched. The first run found two axe failures (label-in-name on tiles, contrast on a faded disabled label), fixed in the code (implementation-summary.md departures 1-2) and re-run green.

Overall QA verdict: PASS
