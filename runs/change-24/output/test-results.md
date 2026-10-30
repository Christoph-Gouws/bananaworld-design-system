# Test results — CR-DESIGN-SYSTEM-026

Commands (package root): `pnpm typecheck` · `pnpm vitest run --testTimeout=60000` · `node runs/change-24/evidence/browser-proof/proof.mjs`

| Check | Result |
|---|---|
| `pnpm typecheck` | clean |
| Full suite | **729 pass / 729** in 38 files (baseline at `f92eab5`: 710 tests; +19 new in `tests/components/StatTile.test.tsx`). With the default 5 s timeout two cold-import specs (`DocumentHeader`, `table-controls`) time out as at CR-025 (K-3); both pass with `--testTimeout=60000` |
| Real Edge browser proof | **93 / 93 PASS**, 390 / 768 (tablet surface) / 1280 px × yellow, packhouse teal, dark |
| `pnpm audit:deps` | same advisories as `main` (2 high, owner-ignored); no dependency changed |
| Additive claim | `git diff f92eab5 --stat -- src/` = `StatTile.tsx` (new) + `index.ts` (comment reworded, one export line). Inventory test green with exactly two declared runtime names (`StatTile`, `StatTileRow`). All existing specs pass unedited; the `.snap` is unchanged (its CRLF artifact is not staged) |

## Acceptance criteria

| # | Criterion | Verdict |
|---|---|---|
| AC-1 | Label with optional icon, one large value, optional unit/sub-line | MET — order + structure specs; frames |
| AC-2 | Optional accent top rule in the theme colour | MET — spec; 3 px rule in teal and yellow frames |
| AC-3 | Optional link opens a target; plain read-only tile without `href` | MET — read-only `div` has nothing focusable; link named by its text |
| AC-4 | Empty shows a dash, never 0 | MET — `null`/`""` dash + spoken `words.empty`, unit hidden; `"0"` prints 0 |
| AC-5 | Row of 2–4 wraps at 390 / tablet / desktop | MET — 2-up at 390 and 768, 4-up at 1280; 3 tiles wrap 2+1 then share a line |
| AC-6 | Light and dark ready | MET — tokens only; dark fixture axe-clean incl. contrast |
| AC-7 | Accessible: label and value read together, never colour alone | MET — one `<p>`; chevron + hover/focus ring on links; axe 0 violations |
| AC-8 | No business logic, no new dependency, plain CSS | MET — value printed as given; `package.json` deps untouched |
| AC-9 | Additive only | MET — see above |

## Manual verification
1. Steps: run the proof command with Edge installed. Expected: every line PASS. Actual: ALL PASS (93).
2. Steps: open `runs/change-24/evidence/frames/390-phone-teal.png`. Expected: look A — icon + name on top, big figure, sub-line, teal rule, dash for the empty tile, chevron on the Waiting tile. Actual: as expected.

Not run: the plan's mutation battery M1–M9 and the DC + CRM re-check (§5.5–5.6); CI (the conductor polls it).

Overall QA verdict: PASS
