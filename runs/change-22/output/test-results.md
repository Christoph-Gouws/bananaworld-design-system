# Test results — CR-DESIGN-SYSTEM-024

Commands: `pnpm test` → **692 passed / 36 files** (baseline at `6a25c8d` per the CR-022 handover: 682 / 35; +10 tests, +1 file, no existing spec edited bar the one inventory line). `pnpm typecheck` clean. `pnpm audit:deps`: "4 vulnerabilities found … (2 ignored)" — the owner-ignored advisories only, no new one. `prettier --check --print-width 100 --end-of-line auto` clean on `TablePagination.tsx` and the fixture (`src/components/index.ts` already failed prettier before this change; untouched style). Sensors (`quality-sensors.mjs`, 3 changed files): 0 open. Real Edge run `node runs/change-22/evidence/browser-proof/proof.mjs` → **ALL PASS** (22 checks, 1270 px and 375 px).

NOT run: the plan's mutation battery (M1–M8). The byte-identity spec compares `renderToString` output and client DOM against a frozen copy, which is the guard for M1 (two text nodes); the other mutants were not executed this session.

## Acceptance criteria
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 | Optional `labels?: Partial<TablePaginationLabels>` with previous, next, rowsPerPage, listPaging, listPagingEnd, range; every key optional, default English, exported as `DEFAULT_TABLE_PAGINATION_LABELS` | MET | `TablePagination.tsx`; `TablePagination.labels.test.tsx` "partial labels" |
| AC-2 | Byte-identical render when `labels` absent (server markup and client DOM) | MET | `TablePagination.labels.test.tsx` "byte-identical…": 7 states × 3 placements × 2 size lists × 2 classNames × 5 label shapes (420 cells) vs frozen `6a25c8d` copy; opened listbox too |
| AC-3 | Header-comment rules kept (one `role=status`, picker top only, D-8 literal, tabular numbers) | MET | "keeps the structure rules" + "keeps D-8 through a translation" (313–313, `0 de 0`); header comment untouched, one paragraph appended |
| AC-4 | `TablePaginationLabels` exported from the package index | MET | test imports it from `../../src`; `src/components/index.ts` |
| AC-5 | Portuguese labels render in both placements with the same accessibility tree | MET | "renders the words in both placements", "same accessibility outline as English"; Edge 22/22; axe 0 violations (happy-dom and Edge) |
| AC-6 | Minor version + changelog | MET | `package.json` 0.8.0; `README.md` Changelog 0.8.0 + "Translating the paging bar" |
| AC-7 | No other component changes | MET | `git diff --stat -- src/` shows only `TablePagination.tsx` and `components/index.ts` |

## Manual verification
Steps, expected and actual are in `runs/change-22/evidence/milestone-evidence.md`.

Overall QA verdict: PASS
