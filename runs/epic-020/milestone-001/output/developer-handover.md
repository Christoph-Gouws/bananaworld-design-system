# Developer Handover — EPIC-020-M001 → the rest of GL-204

## What shipped
The shared price engine is now **correct on the .5 boundary** (GLD-010) and **tested** (51 tests, CI test
gate). `roundCurrency`/`roundKg` have one home (`compute.ts`) and are still exported from
`@bananaworld/design-system/pricing`.

## ⚠ The behaviour change to communicate when consumers bump the pin

Adopting this engine **changes a customer-visible number** on true half-cent boundaries: a line that
previously rounded *down* now rounds *up* (e.g. 12.25 × 30% → **8.58**/unit, not 8.57 — +R1.00 on a
100-unit line). This is the intended GLD-010 correction, not a regression. When MS-2/MS-3 bump the pin:
- Re-run each consumer's own pricing suite; **any golden test that asserts an old down-rounded boundary
  value must be updated to the up-value** (it was encoding the F1 bug).
- The change only moves prices that land exactly on a half-cent; ordinary lines are unaffected.

## Next milestones that depend on THIS one (do not start until this PR is merged and a new SHA exists)

**GL-204 → MS-2 (`bananaworld-crm`):** bump `@bananaworld/design-system` pin to this milestone's merge
SHA, then **F6** — delete the two local rounding re-impls (`lib/quote/repository.ts`,
`lib/direct-order/repository.ts`) and import `roundCurrency` from `@bananaworld/design-system/pricing`.
Also F3 (VAT-excl label), F7 (reject negative manual price), the SO-M009 renames, and the org-contract
re-pin. (Separate from MS-4, the integration rebase — one session per repo.)

**GL-204 → MS-3 (`bananaworld-dc`):** bump the pin, then **F6** — delete DC's three re-impls
(`dispatch/repository.ts`, `sales-order/repository.ts`, `delivery-run/repository.ts`) and import the
shared function; **F2** dispatch largest-remainder fix **+ T-A2** (the dispatch reconciliation pin A4
assigned to DC — write it in DC's suite, using the fixed shared `roundCurrency`); F12 (round PO math).

## For the next engine change in THIS repo
There is now a `test` job in CI and a `vitest run` script. Add to `tests/` when you touch `pricing` or
`sales-order`; the property sweep (T-P7) is the pattern for certifying float-round-trip behaviour.
`format:check` is still not a gate here (pre-existing drift) — that lands with GL-204 → MS-5.
