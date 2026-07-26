# Changed Files — EPIC-020-M001

## Source (behaviour)
- `src/pricing/compute.ts` — **F1/F9.** New `roundToScale` (half-away-from-zero, ULP-based representation
  correction); `roundCurrency`/`roundKg` now exported from here as the single canonical home; F9
  currency-precision note in the header.
- `src/pricing/line.ts` — imports `roundCurrency`/`roundKg` from `./compute` (removed the duplicate
  definitions); **F5** tier-quotient snap before band selection.
- `src/pricing/index.ts` — barrel re-exports `roundCurrency`/`roundKg` from `./compute` instead of
  `./line`. **Public import surface unchanged.**

## Tests (new)
- `tests/pricing/rounding.test.ts` — A4 group A (+ magnitude / non-finite).
- `tests/pricing/compute.test.ts` — A4 groups B, C (incl. T-P7 F5 sweep).
- `tests/pricing/line.test.ts` — A4 groups D, E, F (T-A1).
- `tests/sales-order/validation.test.ts` — A4 group G.

## Tooling / CI
- `package.json` — `"test": "vitest run"` script; `vitest` added to `devDependencies`.
- `pnpm-lock.yaml` — vitest + its transitive dev tree (the large hunk; no `--prod` / runtime change).
- `vitest.config.ts` — new; `include: tests/**`, node environment.
- `tsconfig.json` — `include` extended with `tests/**` + `vitest.config.ts` so typecheck guards tests.
- `.github/workflows/ci.yml` — new `test` job (`pnpm test`). Baseline added-to, not weakened (COMP-04).

## Untouched on purpose
- The 28 UI primitives, `sales-order` contract logic, and the pre-existing prettier drift across ~35
  files (→ MS-5 hygiene).
