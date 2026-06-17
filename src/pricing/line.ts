// Shared line-pricing engine — multi-UOM → Kg conversion + full line pricing. Pure — no IO.
//
// THE single shared line-pricing computation for both Bananaworld apps (CRM ADR-007). Promoted verbatim from
// Bananaworld-DC src/lib/sales-order/uom.ts (EPIC-006-M002) so a CRM quote line and a DC sales-order line —
// which both take item + container + quantity + UOM (+ override) — price IDENTICALLY. Builds on resolvePrice.
//
// The model has one sellable container granularity — the box. "units"/"containers" are the same box-level
// unit (the container type IS the box); a "pallet" is `units_per_pallet` boxes. Kg is the common bridge
// between any two UOMs (DC PRD-FUNC-038/039, DEC-008/009/013).

import { resolvePrice } from "./compute";
import type { CustomerPriceLine, PriceUom } from "./types";

// Currency rounding: 2 decimals (ZAR). Matches the pricing engine.
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Kg rounding: 3 decimals (the DC Kg columns are numeric(_,3)).
export function roundKg(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export interface ContainerKg {
  readonly nominal_kg: number;
  readonly units_per_pallet: number | null;
}

// The Kg one unit of `uom` represents for this container type. Null ⇒ 'pallets' but the container has no
// configured units_per_pallet (the caller raises a "pallet UOM not configured" error).
export function kgPerUom(uom: PriceUom, container: ContainerKg): number | null {
  switch (uom) {
    case "Kg":
      return 1;
    case "units":
    case "containers":
      return container.nominal_kg;
    case "pallets":
      return container.units_per_pallet === null
        ? null
        : container.units_per_pallet * container.nominal_kg;
  }
}

// Convert a quantity in `uom` to Kg for this container type. Null ⇒ pallets without units_per_pallet.
export function quantityToKg(
  quantity: number,
  uom: PriceUom,
  container: ContainerKg,
): number | null {
  const per = kgPerUom(uom, container);
  if (per === null) return null;
  return roundKg(quantity * per);
}

export type LinePricingStatus = "priced" | "unpriced";

export interface PricedLine {
  readonly status: LinePricingStatus;
  readonly line_net_kg: number;
  // The price-list breakdown (informational; populated whenever a list line exists, even under override).
  readonly listed_unit_price: number | null;
  readonly applied_discount_pct: number | null;
  readonly applied_tier_min_qty: number | null;
  // The free-form override, when set (per the order UOM).
  readonly override_unit_price: number | null;
  // What the line is actually charged at.
  readonly effective_unit_price: number;
  readonly effective_price_uom: PriceUom;
  readonly line_total: number;
  readonly is_estimate: boolean;
}

export interface PriceLineRequest {
  readonly quantity: number;
  readonly uom: PriceUom;
  readonly container: ContainerKg;
  // The resolved customer price line for (customer, item), or null when the item is not on the list.
  readonly priceLine: CustomerPriceLine | null;
  // The rep's free-form override (per the order UOM), or null.
  readonly override: number | null;
}

// Compute a fully-priced line (DC PRD-FUNC-038/039). line_net_kg must be computable (the caller validates
// the pallets-UOM/units_per_pallet precondition first). Precedence: a free-form override wins; else the
// customer list price after its best qty-tier discount; else `unpriced`.
export function priceLine(req: PriceLineRequest): PricedLine {
  const lineNetKg = quantityToKg(req.quantity, req.uom, req.container);
  if (lineNetKg === null) {
    throw new Error("priceLine called for a pallets line without units_per_pallet — validate first.");
  }

  // Listed breakdown (when the item is on the customer's list). The discount band is earned on the quantity
  // expressed in the LIST's UOM, so bridge through Kg (DEC-009).
  let listedUnitPrice: number | null = null;
  let appliedDiscountPct: number | null = null;
  let appliedTierMinQty: number | null = null;
  let listedEffectiveUnitPrice: number | null = null;
  let listedPriceUom: PriceUom | null = null;
  let listedLineTotal: number | null = null;

  if (req.priceLine !== null) {
    const kgPerListUom = kgPerUom(req.priceLine.price_uom, req.container);
    if (kgPerListUom !== null && kgPerListUom > 0) {
      const qtyInListUom = lineNetKg / kgPerListUom;
      const resolution = resolvePrice(req.priceLine, qtyInListUom);
      if (resolution.status === "listed") {
        listedUnitPrice = resolution.base_unit_price;
        appliedDiscountPct = resolution.applied_discount_pct;
        appliedTierMinQty = resolution.applied_tier_min_qty;
        listedEffectiveUnitPrice = resolution.unit_price;
        listedPriceUom = resolution.price_uom;
        listedLineTotal = resolution.line_total;
      }
    }
  }

  // Override wins (per the order UOM).
  if (req.override !== null) {
    const unit = roundCurrency(req.override);
    return {
      status: "priced",
      line_net_kg: lineNetKg,
      listed_unit_price: listedUnitPrice,
      applied_discount_pct: appliedDiscountPct,
      applied_tier_min_qty: appliedTierMinQty,
      override_unit_price: unit,
      effective_unit_price: unit,
      effective_price_uom: req.uom,
      line_total: roundCurrency(unit * req.quantity),
      is_estimate: req.uom === "Kg",
    };
  }

  // List price after discount.
  if (listedEffectiveUnitPrice !== null && listedPriceUom !== null && listedLineTotal !== null) {
    return {
      status: "priced",
      line_net_kg: lineNetKg,
      listed_unit_price: listedUnitPrice,
      applied_discount_pct: appliedDiscountPct,
      applied_tier_min_qty: appliedTierMinQty,
      override_unit_price: null,
      effective_unit_price: listedEffectiveUnitPrice,
      effective_price_uom: listedPriceUom,
      line_total: listedLineTotal,
      is_estimate: listedPriceUom === "Kg",
    };
  }

  // No list line + no override ⇒ unpriced (the rep must enter a price — DC DEC-001).
  return {
    status: "unpriced",
    line_net_kg: lineNetKg,
    listed_unit_price: null,
    applied_discount_pct: null,
    applied_tier_min_qty: null,
    override_unit_price: null,
    effective_unit_price: 0,
    effective_price_uom: req.uom,
    line_total: 0,
    is_estimate: false,
  };
}
