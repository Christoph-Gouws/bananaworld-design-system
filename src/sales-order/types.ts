// Shared sales-order CONTRACT types — the order PAYLOAD that crosses the Bananaworld apps.
//
// This subpath ships ONLY the order INPUT shape + its pure validation (below). It is the single
// "published language" both writers agree on: Bananaworld-DC is the SOLE writer of an operational
// sales order, and Bananaworld-CRM builds a handoff payload that must match it exactly. By importing
// the same definition, the CRM payload is compile-time guaranteed to match what DC accepts (no drift).
//
// The READ shapes (list/detail/allocation rows, form options) stay app-local in DC — they describe DC's
// internal reads, not the cross-app contract. Pricing is resolved server-side (never trust a client
// price); the only client-supplied price is the free-form override.
//
// Anchors: CRM ADR-002 / C-4 (HTTP contract to DC's SO service; never a raw public.* write),
//          DC PRD-FUNC-037 (header + lines), PRD-FUNC-039/041 (pricing + override), DEC-015 (item fixes
//          class+size, so a line does NOT carry class/size).

import type { PriceUom } from "../pricing";

export interface SalesOrderLineInput {
  // The item carries its own class + size (item master is a single class+size combo), so the line does
  // NOT capture class/size — they are derived from the item server-side (DC DEC-015).
  readonly item_id: string;
  readonly container_type_id: string;
  readonly quantity: number;
  readonly uom: PriceUom;
  // The rep's free-form price (per the line's order UOM). Present only when typed — it wins over the
  // price-list value (override-last). Absent ⇒ use the resolved list price.
  readonly override_unit_price?: number | null;
}

export interface SalesOrderInput {
  readonly customer_id: string;
  readonly delivery_address_id?: string | null;
  // The business date the order was captured (defaults to today server-side when omitted).
  readonly order_date?: string | null;
  readonly requested_dispatch_date?: string | null;
  readonly sales_rep_user_id?: string | null;
  readonly notes?: string | null;
  readonly custom_fields?: Record<string, unknown>;
  readonly lines: readonly SalesOrderLineInput[];
}
