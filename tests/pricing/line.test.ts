// A4 §Test list — group D (priceLine), group E (kgPerUom / quantityToKg), group F/T-A1 (aggregation
// parity). The dispatch-reconciliation pin (T-A2) is deliberately NOT here — A4 places it in DC, where
// the pro-rata reprice lives (GL-204 → MS-3).
import { describe, expect, it } from "vitest";
import {
  kgPerUom,
  priceLine,
  quantityToKg,
  roundCurrency,
  type ContainerKg,
} from "../../src/pricing";

describe("priceLine — fully priced line, multi-UOM → Kg", () => {
  it("T-L1 typical listed line (V1)", () => {
    const r = priceLine({
      quantity: 40,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: 60 },
      priceLine: {
        unit_price: 18.5,
        price_uom: "units",
        tiers: [{ min_qty: 40, discount_pct: 10 }],
      },
      override: null,
    });
    expect(r).toEqual({
      status: "priced",
      line_net_kg: 740,
      listed_unit_price: 18.5,
      applied_discount_pct: 10,
      applied_tier_min_qty: 40,
      override_unit_price: null,
      effective_unit_price: 16.65,
      effective_price_uom: "units",
      line_total: 666,
      is_estimate: false,
    });
  });

  it("T-L2 Kg-priced list, ordered in units — cross-UOM + estimate (V4)", () => {
    const r = priceLine({
      quantity: 40,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: {
        unit_price: 2.5,
        price_uom: "Kg",
        tiers: [{ min_qty: 500, discount_pct: 5 }],
      },
      override: null,
    });
    expect(r.line_net_kg).toBe(740);
    expect(r.effective_unit_price).toBe(2.38);
    expect(r.effective_price_uom).toBe("Kg");
    expect(r.line_total).toBe(1761.2);
    expect(r.is_estimate).toBe(true);
    expect(r.applied_discount_pct).toBe(5);
  });

  it("T-L3 pallets line, null discount / empty tiers (V6)", () => {
    const r = priceLine({
      quantity: 2,
      uom: "pallets",
      container: { nominal_kg: 18.5, units_per_pallet: 56 },
      priceLine: { unit_price: 950, price_uom: "pallets", tiers: [] },
      override: null,
    });
    expect(r.line_net_kg).toBe(2072);
    expect(r.effective_unit_price).toBe(950);
    expect(r.line_total).toBe(1900);
    expect(r.applied_tier_min_qty).toBeNull();
  });

  it("T-L4 order-pallets / price-units, tier earned via the Kg bridge", () => {
    const r = priceLine({
      quantity: 20,
      uom: "pallets",
      container: { nominal_kg: 18, units_per_pallet: 48 },
      priceLine: {
        unit_price: 250,
        price_uom: "units",
        tiers: [{ min_qty: 500, discount_pct: 10 }],
      },
      override: null,
    });
    expect(r.line_net_kg).toBe(17280);
    expect(r.effective_unit_price).toBe(225);
    expect(r.line_total).toBe(216000);
  });

  it("T-L5 override wins; list breakdown still informational (V5)", () => {
    const r = priceLine({
      quantity: 25,
      uom: "units",
      container: { nominal_kg: 4.5, units_per_pallet: 120 },
      priceLine: {
        unit_price: 14,
        price_uom: "units",
        tiers: [{ min_qty: 20, discount_pct: 5 }],
      },
      override: 13.333,
    });
    expect(r.override_unit_price).toBe(13.33);
    expect(r.effective_unit_price).toBe(13.33);
    expect(r.effective_price_uom).toBe("units");
    expect(r.line_total).toBe(333.25);
    expect(r.listed_unit_price).toBe(14);
    expect(r.applied_discount_pct).toBe(5);
    expect(r.is_estimate).toBe(false);
  });

  it("T-L6 an override with >2 decimals silently rounds (F8 pin)", () => {
    const base = {
      quantity: 1,
      uom: "units" as const,
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: null,
    };
    expect(priceLine({ ...base, override: 13.333 }).override_unit_price).toBe(
      13.33,
    );
    expect(priceLine({ ...base, override: 0.005 }).override_unit_price).toBe(
      0.01,
    );
  });

  it("T-L7 override on an off-list item", () => {
    const r = priceLine({
      quantity: 10,
      uom: "pallets",
      container: { nominal_kg: 18, units_per_pallet: 48 },
      priceLine: null,
      override: 5000,
    });
    expect(r.status).toBe("priced");
    expect(r.line_total).toBe(50000);
    expect(r.listed_unit_price).toBeNull();
    expect(r.applied_discount_pct).toBeNull();
  });

  it("T-L8 a Kg-UOM override is an estimate", () => {
    const r = priceLine({
      quantity: 500,
      uom: "Kg",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: null,
      override: 12,
    });
    expect(r.line_total).toBe(6000);
    expect(r.is_estimate).toBe(true);
  });

  it("T-L9 unpriced — no list line, no override (V7)", () => {
    const r = priceLine({
      quantity: 10,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: null,
      override: null,
    });
    expect(r.status).toBe("unpriced");
    expect(r.effective_unit_price).toBe(0);
    expect(r.line_total).toBe(0);
    expect(r.line_net_kg).toBe(185);
  });

  it("T-L10 a pallets line without units_per_pallet throws", () => {
    expect(() =>
      priceLine({
        quantity: 2,
        uom: "pallets",
        container: { nominal_kg: 18.5, units_per_pallet: null },
        priceLine: { unit_price: 950, price_uom: "pallets", tiers: [] },
        override: null,
      }),
    ).toThrow(/pallets line without units_per_pallet/);
  });

  it("T-L11 zero quantity is permissive (V8 pin)", () => {
    const r = priceLine({
      quantity: 0,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: {
        unit_price: 14,
        price_uom: "units",
        tiers: [{ min_qty: 10, discount_pct: 5 }],
      },
      override: null,
    });
    expect(r.status).toBe("priced");
    expect(r.line_total).toBe(0);
    expect(r.line_net_kg).toBe(0);
  });

  it("T-L12 negative quantity produces a negative total — documents why boundaries must guard (V9)", () => {
    const r = priceLine({
      quantity: -5,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: { unit_price: 14, price_uom: "units", tiers: [] },
      override: null,
    });
    expect(r.line_total).toBe(-70);
    expect(r.line_net_kg).toBe(-92.5);
  });

  it("T-L13 a zero-Kg container skips the listed branch → unpriced", () => {
    const r = priceLine({
      quantity: 10,
      uom: "units",
      container: { nominal_kg: 0, units_per_pallet: null },
      priceLine: { unit_price: 14, price_uom: "units", tiers: [] },
      override: null,
    });
    expect(r.status).toBe("unpriced");
    expect(r.line_total).toBe(0);
    expect(r.line_net_kg).toBe(0);
  });

  it("T-L14 a large order stays cent-exact (V12)", () => {
    const r = priceLine({
      quantity: 10000,
      uom: "units",
      container: { nominal_kg: 18.5, units_per_pallet: null },
      priceLine: { unit_price: 18.5, price_uom: "units", tiers: [] },
      override: null,
    });
    expect(r.line_total).toBe(185000);
    expect(r.line_net_kg).toBe(185000);
  });
});

describe("kgPerUom / quantityToKg — the Kg bridge", () => {
  const c18: ContainerKg = { nominal_kg: 18, units_per_pallet: 48 };

  it("T-K1 kgPerUom for each UOM", () => {
    expect(kgPerUom("Kg", c18)).toBe(1);
    expect(kgPerUom("units", c18)).toBe(18);
    expect(kgPerUom("containers", c18)).toBe(18);
    expect(kgPerUom("pallets", c18)).toBe(864);
  });

  it("T-K2 pallets without units_per_pallet → null", () => {
    expect(
      kgPerUom("pallets", { nominal_kg: 18, units_per_pallet: null }),
    ).toBeNull();
    expect(
      quantityToKg(3, "pallets", { nominal_kg: 18, units_per_pallet: null }),
    ).toBeNull();
  });

  it("T-K3 quantityToKg converts to net Kg", () => {
    expect(quantityToKg(300, "units", c18)).toBe(5400);
    expect(quantityToKg(20, "pallets", c18)).toBe(17280);
    expect(quantityToKg(5000, "Kg", c18)).toBe(5000);
  });

  it("T-K4 quantityToKg rounds to 3 decimals", () => {
    expect(
      quantityToKg(1, "units", { nominal_kg: 0.0005, units_per_pallet: null }),
    ).toBe(0.001);
  });
});

describe("T-A1 aggregation parity — sum-then-round === round-each-step", () => {
  // Pins V13: CRM sums with a per-line round, DC sums raw then rounds once. They must never diverge for
  // any realistic estate order, so a future refactor of either cannot silently drift the two apps apart.
  function roundOnce(values: readonly number[]): number {
    return roundCurrency(values.reduce((acc, v) => acc + v, 0));
  }
  function roundEachStep(values: readonly number[]): number {
    return values.reduce((acc, v) => roundCurrency(acc + v), 0);
  }

  it("agrees on ten lines of 0.10", () => {
    const tenth = new Array<number>(10).fill(0.1);
    expect(roundOnce(tenth)).toBe(1);
    expect(roundEachStep(tenth)).toBe(1);
  });

  it("agrees on 200 deterministic cent-exact line totals up to R1,000,000", () => {
    // Deterministic LCG (no Math.random) → reproducible cent-exact values.
    let seed = 123456789;
    const nextCents = (): number => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % 100_000_001; // 0 .. 1,000,000.00 in whole cents
    };
    for (let trial = 0; trial < 40; trial++) {
      const lines = Array.from({ length: 200 }, () => nextCents() / 100);
      expect(roundEachStep(lines)).toBe(roundOnce(lines));
    }
  });
});
