// A4 §Test list — group B (selectTier) + group C (resolvePrice), incl. T-P7, the F5 tier-boundary
// property sweep across the Kg round-trip (exercises priceLine, the real consumer path).
import { describe, expect, it } from "vitest";
import {
  priceLine,
  resolvePrice,
  selectTier,
  type CustomerPriceLine,
  type PriceTier,
} from "../../src/pricing";

const BANDS: readonly PriceTier[] = [
  { min_qty: 10, discount_pct: 5 },
  { min_qty: 50, discount_pct: 10 },
  { min_qty: 100, discount_pct: 15 },
];

describe("selectTier — the discount band a quantity earns", () => {
  it("T-T1 below the first band → null", () => {
    expect(selectTier(BANDS, 9)).toBeNull();
  });

  it("T-T2 an exact threshold earns the band", () => {
    expect(selectTier(BANDS, 10)?.discount_pct).toBe(5);
    expect(selectTier(BANDS, 50)?.discount_pct).toBe(10);
    expect(selectTier(BANDS, 100)?.discount_pct).toBe(15);
  });

  it("T-T3 between bands takes the lower", () => {
    expect(selectTier(BANDS, 49)?.discount_pct).toBe(5);
    expect(selectTier(BANDS, 99)?.discount_pct).toBe(10);
  });

  it("T-T4 unsorted input is tolerated", () => {
    const reversed: readonly PriceTier[] = [
      { min_qty: 100, discount_pct: 15 },
      { min_qty: 10, discount_pct: 5 },
      { min_qty: 50, discount_pct: 10 },
    ];
    expect(selectTier(reversed, 50)?.min_qty).toBe(50);
  });

  it("T-T5 empty tiers → null", () => {
    expect(selectTier([], 1_000_000)).toBeNull();
  });

  it("T-T6 zero / negative quantity → null (permissiveness pinned)", () => {
    expect(selectTier(BANDS, 0)).toBeNull();
    expect(selectTier(BANDS, -5)).toBeNull();
  });
});

describe("resolvePrice — list price after the earned discount", () => {
  it("T-P1 a null line → unpriced", () => {
    expect(resolvePrice(null, 10)).toEqual({ status: "unpriced" });
  });

  it("T-P2 no band earned → list price", () => {
    const line: CustomerPriceLine = {
      unit_price: 18.5,
      price_uom: "units",
      tiers: [{ min_qty: 40, discount_pct: 10 }],
    };
    const r = resolvePrice(line, 39);
    expect(r.status).toBe("listed");
    if (r.status !== "listed") return;
    expect(r.unit_price).toBe(18.5);
    expect(r.line_total).toBe(721.5);
    expect(r.applied_discount_pct).toBe(0);
    expect(r.applied_tier_min_qty).toBeNull();
  });

  it("T-P3 earned tier + rounding", () => {
    const line: CustomerPriceLine = {
      unit_price: 18.5,
      price_uom: "units",
      tiers: [{ min_qty: 40, discount_pct: 10 }],
    };
    const r = resolvePrice(line, 40);
    if (r.status !== "listed") throw new Error("expected listed");
    expect(r.unit_price).toBe(16.65);
    expect(r.line_total).toBe(666);
    expect(r.applied_tier_min_qty).toBe(40);
    expect(r.applied_discount_pct).toBe(10);
  });

  it("T-P4 sub-cent unit rounding, half up", () => {
    const line: CustomerPriceLine = {
      unit_price: 10.01,
      price_uom: "Kg",
      tiers: [{ min_qty: 1, discount_pct: 7.5 }],
    };
    const r = resolvePrice(line, 3);
    if (r.status !== "listed") throw new Error("expected listed");
    expect(r.unit_price).toBe(9.26);
    expect(r.line_total).toBe(27.78);
  });

  it("T-P5 discount boundary vector — GLD-010 up-result (THE F1 regression pin)", () => {
    const line: CustomerPriceLine = {
      unit_price: 12.25,
      price_uom: "units",
      tiers: [{ min_qty: 1, discount_pct: 30 }],
    };
    const r = resolvePrice(line, 100);
    if (r.status !== "listed") throw new Error("expected listed");
    // Pre-fix code produced 8.57 / 857.00 — a R1.00 undercharge on this line.
    expect(r.unit_price).toBe(8.58);
    expect(r.line_total).toBe(858);
  });

  it("T-P6 a 100% discount → zero, still a listed line", () => {
    const line: CustomerPriceLine = {
      unit_price: 20,
      price_uom: "units",
      tiers: [{ min_qty: 1, discount_pct: 100 }],
    };
    const r = resolvePrice(line, 5);
    if (r.status !== "listed") throw new Error("expected listed");
    expect(r.unit_price).toBe(0);
    expect(r.line_total).toBe(0);
  });

  it("T-P7 tier-boundary property sweep — F5 certification (every whole-qty order earns its band)", () => {
    // For a customer whose price list is in the SAME UOM as the order, ordering EXACTLY the tier
    // quantity is the modal discounted order. The Kg round-trip (qty → net-kg → qty-in-list-uom) must
    // never leave the quotient a hair under the integer and silently drop the discount. Sweep the full
    // nominal-weight space A4 specified; assert the band is earned every time.
    const QUANTITIES = [1, 2, 5, 10, 40, 50, 100, 150, 200];
    const misses: string[] = [];
    for (let milliKg = 1; milliKg <= 25_000; milliKg++) {
      const nominalKg = milliKg / 1000;
      for (const qty of QUANTITIES) {
        const priced = priceLine({
          quantity: qty,
          uom: "units",
          container: { nominal_kg: nominalKg, units_per_pallet: null },
          priceLine: {
            unit_price: 10,
            price_uom: "units",
            tiers: [{ min_qty: qty, discount_pct: 10 }],
          },
          override: null,
        });
        if (priced.applied_tier_min_qty !== qty) {
          misses.push(
            `nominal_kg=${nominalKg}, qty=${qty} → ${priced.applied_tier_min_qty}`,
          );
          if (misses.length > 5) break;
        }
      }
      if (misses.length > 5) break;
    }
    expect(misses).toEqual([]);
  });
});
