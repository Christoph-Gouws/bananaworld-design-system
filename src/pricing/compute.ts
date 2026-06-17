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

// Currency rounding: 2 decimals (ZAR), away from zero on the .5 boundary.
function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// The discount band a quantity earns: the highest `min_qty` not exceeding the quantity. None ⇒ null
// (0%). Bands above the quantity never apply. Pure; tolerant of unsorted input.
export function selectTier(tiers: readonly PriceTier[], quantity: number): PriceTier | null {
  let best: PriceTier | null = null;
  for (const tier of tiers) {
    if (tier.min_qty <= quantity && (best === null || tier.min_qty > best.min_qty)) {
      best = tier;
    }
  }
  return best;
}

// Resolve the price for `quantity` of an item given the customer's price line (or null when the item
// is not on the customer's list). The line total is unit_price × quantity, both currency-rounded.
export function resolvePrice(line: CustomerPriceLine | null, quantity: number): PriceResolution {
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
