// Shared pricing engine — types.
//
// THE single source of truth for the Bananaworld price calculation, shared by Bananaworld-DC (Sales
// Orders / delivery receipts) and Bananaworld-CRM (quotes) so a quote and the eventual order price
// IDENTICALLY (CRM ADR-007 / PRD-FUNC-060; DC PRD-FUNC-039/040, TECH-LOGIC-003).
//
// Ported verbatim from Bananaworld-DC src/lib/pricing (EPIC-006-M001) and promoted into the shared
// package at CRM EPIC-004-M001 so both apps import ONE copy (owner decision 2026-06-17). PURE — no IO,
// no network, no scope/permission logic. The DB lookup of the price line + its tiers lives in each
// app's repository; this engine takes data in and returns a resolution. Lives under a dedicated
// `pricing` subpath (`@bananaworld/design-system/pricing`) so importing it never drags in the UI/React
// layer and the presentation barrel stays pure-presentation.

// The units a price (and an order/quote line) can be expressed in. Mirrors the DB CHECK on
// customer.preferred_order_uom / customer_price.price_uom.
export type PriceUom = "Kg" | "units" | "containers" | "pallets";

export const PRICE_UOMS: readonly PriceUom[] = ["Kg", "units", "containers", "pallets"];

export function isPriceUom(value: unknown): value is PriceUom {
  return typeof value === "string" && (PRICE_UOMS as readonly string[]).includes(value);
}

// One percentage quantity-discount band: at/above `min_qty` (in the line's price_uom), take
// `discount_pct` off the list price (DC DEC-002).
export interface PriceTier {
  readonly min_qty: number;
  readonly discount_pct: number;
}

// A resolved customer price line for one (customer, item): the list price + its qty-tier bands.
export interface CustomerPriceLine {
  readonly unit_price: number;
  readonly price_uom: PriceUom;
  readonly tiers: readonly PriceTier[];
}

// The outcome of pricing a quantity. `listed` = a price-list line applied (with whatever qty-tier
// discount the quantity earns); `unpriced` = the item is not on the customer's list, so the sales
// rep must enter a free-form price (DC DEC-001 — captured as an SO-line / quote-line override).
export type PriceResolution =
  | {
      readonly status: "listed";
      readonly price_uom: PriceUom;
      // The list price before any discount.
      readonly base_unit_price: number;
      // The qty-tier discount applied (0 when no band matched).
      readonly applied_discount_pct: number;
      // The threshold of the band that applied, or null when none did.
      readonly applied_tier_min_qty: number | null;
      // The per-unit price after the discount.
      readonly unit_price: number;
      // unit_price × quantity.
      readonly line_total: number;
    }
  | { readonly status: "unpriced" };
