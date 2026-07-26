// A4 §Test list — group A: roundCurrency / roundKg policy.
//
// The money-rounding policy is GLD-010 (go-live G1, 2026-07-16): half rounds UP, away from zero, at
// EVERY magnitude. T-R3 and T-R4 are the F1 regression pins — they FAIL on the pre-fix primitive
// (`Math.round((v + Number.EPSILON) * 100) / 100`, which yields 8.57 / −1.00) and pass on the fix.
import { describe, expect, it } from "vitest";
import { roundCurrency, roundKg } from "../../src/pricing";

describe("roundCurrency / roundKg — GLD-010 half-away-from-zero", () => {
  it("T-R1 rounds a clean sub-half-cent value to the nearest cent", () => {
    expect(roundCurrency(9.25925)).toBe(9.26);
    expect(roundCurrency(16.654)).toBe(16.65);
    expect(roundCurrency(0)).toBe(0);
  });

  it("T-R2 half-cent boundary below R2 rounds away from zero", () => {
    expect(roundCurrency(1.005)).toBe(1.01);
  });

  it("T-R3 half-cent boundary above R2 also rounds up (F1 regression pin)", () => {
    // These are the values A4 proved the old primitive got wrong (8.575 → 8.57).
    expect(roundCurrency(8.575)).toBe(8.58);
    expect(roundCurrency(2.675)).toBe(2.68);
    expect(roundCurrency(12.25 * 0.7)).toBe(8.58);
  });

  it("T-R4 negative boundary is symmetric — away from zero (F1 regression pin)", () => {
    expect(roundCurrency(-1.005)).toBe(-1.01);
    expect(roundCurrency(-8.575)).toBe(-8.58);
  });

  it("T-R4b a sub-half-cent negative returns +0, never −0", () => {
    // Guards the roundToScale −0 branch: Object.is(−0, 0) is false, so a leaked −0 would break toBe(0).
    expect(Object.is(roundCurrency(-0.0001), 0)).toBe(true);
  });

  it("T-R5 roundKg rounds to 3 decimals, half up", () => {
    expect(roundKg(725.5999)).toBe(725.6);
    expect(roundKg(0.0005)).toBe(0.001);
    expect(roundKg(0)).toBe(0);
  });

  it("T-R6 stays exact at large money magnitudes (numeric(14,2) domain)", () => {
    expect(roundCurrency(185000)).toBe(185000);
    expect(roundCurrency(185000.005)).toBe(185000.01);
    expect(roundKg(185000)).toBe(185000);
  });

  it("T-R7 non-finite input yields NaN, not a thrown error", () => {
    expect(roundCurrency(Number.POSITIVE_INFINITY)).toBeNaN();
    expect(roundCurrency(Number.NaN)).toBeNaN();
    expect(roundKg(Number.NaN)).toBeNaN();
  });
});
