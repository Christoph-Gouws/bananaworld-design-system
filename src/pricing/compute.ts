// Shared pricing engine — the pure computation.
//
// THE single source of truth for the Bananaworld price calculation (CRM ADR-007 / PRD-FUNC-060; DC
// PRD-FUNC-039/040, TECH-LOGIC-003). Ported verbatim from Bananaworld-DC src/lib/pricing/compute.ts
// (EPIC-006-M001) and promoted into the shared package at CRM EPIC-004-M001. Pure — no IO.
//
// Precedence (DC PRD-FUNC-039): a customer price-list line, when present, is the base; the requested
// quantity earns the best matching qty-tier discount; an item with NO line resolves to `unpriced`
// (the rep enters a free-form price, captured as a line override). The free-form override itself is
// the LAST step and lives on the order/quote line, not here.

import type { CustomerPriceLine, PriceResolution, PriceTier } from "./types";

// Estate money-rounding policy (GLD-010, go-live G1 2026-07-16): a value exactly on the half rounds
// UP, away from zero — and it must do so at EVERY price magnitude.
//
// The previous primitive, `Math.round((value + Number.EPSILON) * 100) / 100`, only rounded up below
// ~R2, where a single-ULP nudge happened to land on the right side; above that the nudge was absorbed
// and a true half-cent such as 8.575 rounded DOWN to 8.57 — a R1.00 undercharge on a 100-unit line
// (go-live audit A4, finding F1). A true half-cent boundary is not representable in binary64 and lands
// a few ×10⁻¹⁶ BELOW the real value, so `Math.round` sees it as short of the half and rounds down.
//
// Correction: before rounding, nudge the scaled magnitude up by a FIXED NUMBER OF ULPs — `abs ×
// Number.EPSILON × 8` (~8 units in the last place). Because one ULP already scales with the
// magnitude, 8 ULPs is a constant, magnitude-independent correction: it always exceeds the binary64
// representation error at a genuine boundary (~1–2 ULPs even after a couple of chained multiplies),
// yet stays ~10¹³× below the 0.5-cent decision margin for every amount the estate will ever see
// (it would only reach 0.5 at scaled magnitudes above ~1e14 — i.e. a line above R1e12). A magnitude-
// proportional nudge like `abs × 1e-9` was rejected precisely because it grows without bound and
// would corrupt an order-total sum above ~R5,000,000. Sign is applied last, so negatives round away
// from zero symmetrically (pinned in tests; every money boundary also blocks negatives upstream).
// Assumes a 2-minor-unit currency — ZAR, MZN, USD, EUR, GBP are all 2dp; a 0- or 3-dp currency (e.g.
// JPY, some dinars) would be mis-rounded, and none is used in the estate (A4 F9).
const CENTS_PER_UNIT = 100;
const THOUSANDTHS_PER_UNIT = 1000;
const REPRESENTATION_ULPS = 8;

function roundToScale(value: number, scale: number): number {
  if (!Number.isFinite(value)) return NaN;
  const scaled = Math.abs(value) * scale;
  const epsilon = scaled * Number.EPSILON * REPRESENTATION_ULPS;
  const rounded = Math.round(scaled + epsilon);
  if (rounded === 0) return 0; // never surface -0 for a sub-half-unit negative
  return (Math.sign(value) * rounded) / scale;
}

// Currency rounding: 2 decimals, half away from zero (GLD-010). THE single home — `line.ts` and both
// consumer apps import this one (A4 F6: no local re-implementations).
export function roundCurrency(value: number): number {
  return roundToScale(value, CENTS_PER_UNIT);
}

// Kg rounding: 3 decimals (the DC Kg columns are numeric(_,3)), half away from zero.
export function roundKg(value: number): number {
  return roundToScale(value, THOUSANDTHS_PER_UNIT);
}

// The discount band a quantity earns: the highest `min_qty` not exceeding the quantity. None ⇒ null
// (0%). Bands above the quantity never apply. Pure; tolerant of unsorted input.
export function selectTier(
  tiers: readonly PriceTier[],
  quantity: number,
): PriceTier | null {
  let best: PriceTier | null = null;
  for (const tier of tiers) {
    if (
      tier.min_qty <= quantity &&
      (best === null || tier.min_qty > best.min_qty)
    ) {
      best = tier;
    }
  }
  return best;
}

// Resolve the price for `quantity` of an item given the customer's price line (or null when the item
// is not on the customer's list). The line total is unit_price × quantity, both currency-rounded.
export function resolvePrice(
  line: CustomerPriceLine | null,
  quantity: number,
): PriceResolution {
  if (line === null) {
    return { status: "unpriced" };
  }
  const tier = selectTier(line.tiers, quantity);
  const discountPct = tier?.discount_pct ?? 0;
  const unitPrice = roundCurrency(line.unit_price * (1 - discountPct / 100));
  return {
    status: "listed",
    price_uom: line.price_uom,
    base_unit_price: line.unit_price,
    applied_discount_pct: discountPct,
    applied_tier_min_qty: tier?.min_qty ?? null,
    unit_price: unitPrice,
    line_total: roundCurrency(unitPrice * quantity),
  };
}
