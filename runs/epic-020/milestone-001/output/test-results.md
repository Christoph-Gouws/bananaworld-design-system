# Test Results — EPIC-020-M001

```
Run:        2026-07-26 (local, Windows) — CI runs the same on ubuntu / node 22
Branch:     epic-020/m001-pricing-engine-tests  (off main 516889e)
Migration:  NONE · New runtime dep: NONE (vitest is devDependencies only) · public API surface: UNCHANGED
```

## Gate summary

| Gate | Result |
|---|---|
| `pnpm typecheck` (`tsc --noEmit`, now incl. `tests/**`) | **PASS** — exit 0 |
| `pnpm test` (`vitest run`) | **PASS** — **4 files / 51 tests**, 0 failing |
| `prettier --check` (my changed + new files) | **PASS** — all matched files |
| `pnpm audit --prod --audit-level=high` | unaffected — vitest is a devDependency; `--prod` tree unchanged |

> Repo-wide `format:check` still reports pre-existing drift on ~35 untouched files (the known follow-up
> named in `ci.yml`); deferred to GL-204 → MS-5. Not a CI gate in this repo today.

## The A4 §Test list — coverage

| Group | File | A4 items | Status |
|---|---|---|---|
| A · roundCurrency / roundKg | `tests/pricing/rounding.test.ts` | T-R1..R5 (+R6 magnitude, R7 non-finite) | ✅ |
| B · selectTier | `tests/pricing/compute.test.ts` | T-T1..T6 | ✅ |
| C · resolvePrice (+ T-P7 sweep) | `tests/pricing/compute.test.ts` | T-P1..P7 | ✅ |
| D · priceLine | `tests/pricing/line.test.ts` | T-L1..L14 | ✅ |
| E · kgPerUom / quantityToKg | `tests/pricing/line.test.ts` | T-K1..K4 | ✅ |
| F · aggregation parity | `tests/pricing/line.test.ts` | T-A1 | ✅ |
| G · sales-order validation | `tests/sales-order/validation.test.ts` | T-V1..V10 | ✅ |

**T-A2 (dispatch pro-rata reconciliation)** is deliberately absent — A4 assigns it to DC (MS-3), where
the pro-rata reprice lives.

## Canary proofs (a regression pin is worthless unless proven to bite)

### F1 — the money fix
The rounding block was temporarily reverted to the pre-fix primitive
(`Math.round((v + Number.EPSILON) * scale) / scale`) and the suite re-run:

```
Tests  5 failed | 46 passed (51)
  × T-P5  discount boundary vector — GLD-010 up-result   (8.58/858 expected; old code gives 8.57/857)
  × T-R3  half-cent boundary above R2 rounds up          (8.575→8.58, 2.675→2.68)
  × T-R4  negative boundary symmetric — away from zero   (-1.005→-1.01)
  × T-R4b sub-half-cent negative returns +0, never -0
  × T-R7  non-finite input yields NaN
```
The three **F1 pins (T-P5, T-R3, T-R4) fail on the old code and pass on the fix** — the R1.00 undercharge
class is now regression-guarded. Reverted; file restored byte-for-byte.

### F5 — the tier snap is load-bearing (not merely defensive)
The snap was temporarily bypassed (`resolvePrice(req.priceLine, qtyInListUom)`), and T-P7 re-run:

```
× T-P7  tier-boundary property sweep
    + "nominal_kg=0.007, qty=50 → null"
    + "nominal_kg=0.007, qty=100 → null"
    + "nominal_kg=0.014, qty=50 → null"   … (discount silently dropped)
```
So F5 is a **real, reproducing** defect in the swept space, not a theoretical one — the snap fixes it.
⚠ **Honest caveat:** the reproducing weights in this sweep (0.007, 0.014 kg) are far below realistic
produce-container weights, and A4's hand-probes at realistic weights (13.3, 18.14 kg) were rescued by
IEEE rounding. So the **live** risk at today's master data is low; the snap's value is **certifying the
whole (weight, qty) space** so no future container weight can silently drop a tier. Reverted; restored.

## ⚠ CI: Dependency Audit is RED — pre-existing, not from this milestone

On PR #5 the new **Test job passes on CI** (18s), as do Typecheck, SAST, and Gitleaks. The
**Dependency Audit** job fails: `pnpm audit --prod --audit-level=high` reports **6 high / 6 moderate**
(1 ignored). **This is pre-existing estate advisory debt, surfaced not caused by MS-1:**

- All 6 high are in the auto-installed **`next` peer** tree (paths `.>next` and `.>next>postcss`):
  Next.js DoS `GHSA-m99w-x7hq-7vfj`, SSRF `GHSA-89xv-2m56-2m9x` / `GHSA-p9j2-gv94-2wf4`, PostCSS
  `GHSA-6g55-p6wh-862q` / `GHSA-r28c-9q8g-f849`.
- `next@15.5.19` and `postcss@8.4.31` are **byte-identical to `main`** — so `main` fails this same audit
  today. This milestone's lockfile change added **only vitest's dev subtree** (`@rolldown/*`,
  `@emnapi/*`); the `--prod` tree is unchanged, and the audit ignore list was **not** touched.
- Same category as the owner-ratified sharp ignore (2026-07-22): the library ships **no** next/postcss
  (`files:["src"]`); consumers provide and patch their own next.

**Disposition is an owner call (Hard Rule 2 — extending a security-gate ignore needs written approval)
and is tracked in the go-live register.** MS-1's code + tests are complete and green on every code gate.

## Notes

- Tests live under `tests/` (outside `src/`), so `package.json` `files:["src"]` never publishes them.
  `tsconfig.json` was extended to include `tests/**` so the existing typecheck job also guards them.
- The public API surface is unchanged: `roundCurrency` / `roundKg` are still exported from
  `@bananaworld/design-system/pricing` (now re-exported from `compute.ts`, their single home). Consumers
  need no import change — only a pin bump to pick up the corrected behaviour (MS-2/MS-3).
