# EPIC-020-M001 — Pricing-engine test suite + F1 rounding fix

> Repo: `bananaworld-design-system` (shared library slice) · Branch: `epic-020/m001-pricing-engine-tests`
> Driven by the go-live programme: **GL-204 → MS-1** (the dependency root of the money-correctness thread).
> Source audit: `bananaworld-golive/phases/01-audits/output/A4_pricing_vat_check.md`. Owner policy: **GLD-010**.

## Why this milestone exists

A4 graded the shared price engine **conditional FAIL for go-live**: "the engine must not carry real
money until GL-204 lands the test suite … and findings F1–F4 are dispositioned." Three of those live in
this repo:

- **F1 (HIGH, money-visible):** `roundCurrency` violated its own documented ".5 rounds away from zero"
  policy at ordinary price magnitudes — proven undercharge of **R1.00** on a 100-unit line (12.25 × 30%
  charged 8.57/unit where policy says 8.58). Magnitude-dependent: correct below ~R2, wrong above.
- **F5 (MEDIUM):** tier eligibility decided by unguarded float equality across the Kg round-trip — a
  customer ordering exactly the tier quantity could silently lose the discount.
- **F10 (LOW, escalating):** the engine repo has **zero tests and no test script**, so a bad engine
  change merges green and only surfaces when a pin bump ships it to both apps at once.

The engine also lives behind a **version pin**: nothing changes for DC/CRM until they bump the pin
(GL-204 → MS-2/MS-3). So this milestone can land safely without moving any production price — it makes
the engine correct and tested; the consumers adopt it under their own gates.

## Scope (this milestone)

| Item | Finding | What |
|---|---|---|
| Fix `roundCurrency` / `roundKg` | **F1** | Half-away-from-zero at every magnitude, per GLD-010. Single canonical home in `compute.ts`; `line.ts` and the barrel import it (removes the intra-package duplicate — sets up MS-2/MS-3's F6 deletes). |
| Snap the tier quotient | **F5** | Snap a Kg-round-trip quotient within 1e-9 of an integer before the band is chosen. |
| Currency-precision note | **F9** | Documented: the engine assumes a 2-minor-unit currency (all estate currencies are 2dp). |
| Test suite | **F10** | The full A4 §Test list — `tests/pricing/{rounding,compute,line}.test.ts` + `tests/sales-order/validation.test.ts`; a `vitest` dev-dep + `test` script. |
| CI test gate | GL-204 "design-system audit gate" | A `test` job added to `ci.yml` (baseline added-to, never weakened — COMP-04). |

## Owner decisions consumed (not re-opened)

- **GLD-010** (owner, G1 2026-07-16): half-cent rounds **UP, away from zero**. T-R3 / T-R4 / T-P5 are
  pinned to the up-result and are the F1 regression pins — they **fail on the pre-fix primitive**
  (proven, see `test-results.md`). No new owner decision was required to build this milestone.

## Deliberate scope boundaries (chassis decisions)

- **F6 (delete the 5 local rounding re-impls) is NOT here** — those live in the consumer repos
  (`bananaworld-crm`, `bananaworld-dc`). This milestone makes the single canonical `roundCurrency`
  importable; MS-2/MS-3 delete the clones and import it.
- **F2 / T-A2 (dispatch pro-rata reconciliation) is NOT here** — A4 places that pin in DC, where the
  pro-rata reprice lives (MS-3). This suite carries T-A1 (aggregation parity) only.
- **F7/F8/F11 boundary guards are NOT here** — they are consumer-app boundary checks (MS-2), not engine
  behaviour. The engine's permissiveness (accepts qty 0 / negative / >2dp override) is instead **pinned
  as documented behaviour** (T-L11/T-L12/T-L6, T-T6) so a future refactor can't quietly remove the outer
  guards believing the engine checks.
- **`format:check` as a CI gate is deferred to MS-5 (hygiene).** The repo carries pre-existing prettier
  drift across ~35 files (a version bump, unrelated to pricing); adopting it here would balloon this
  money diff with 30+ untouched component files. My own changed files are prettier-clean; the drift and
  the format gate move together in the hygiene batch. There is no `lint`/`build` gate to add — this is a
  pure-TS-source library with no eslint config and no build step (consumers transpile it).

## Approach — the F1 fix

Round on the **absolute** scaled magnitude, then re-apply the sign, so ".5 up" is symmetric
(away from zero). Correct binary64 representation error with an epsilon of a **fixed number of ULPs**
(`abs × Number.EPSILON × 8`), not a fixed relative fraction: one ULP already scales with magnitude, so
8 ULPs is a constant correction that (a) always exceeds the ~1–2 ULP representation error at a genuine
boundary and (b) never approaches the 0.5-cent decision margin until absurd magnitudes (>R1e12). A first
draft used `abs × 1e-9`; it was rejected because that grows without bound and corrupts an order-total
sum above ~R5M — caught by the T-A1 aggregation test during the build, which is exactly why the suite
exists.
