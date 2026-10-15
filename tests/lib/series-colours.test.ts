// CR-DC-247 — the series palette's three promises: legible with white text, nowhere near the colours that
// already mean "careful" or "failed", and no two alike. Measured, not eyeballed.
import { describe, expect, it } from "vitest";

import { SERIES_COLOURS, seriesColour } from "../../src/lib/series-colours";

// The status colours a series hue must never resemble (tokens.css: warning, danger; the map's amber).
const AVOID = ["#ea580c", "#dc2626", "#b42318", "#e8a317", "#b45309"];

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (hex: string) =>
  [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)) as [number, number, number];
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastWithWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05);

// CIE76 colour difference — "how different do these look", not "how different are the numbers".
function lab(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
const deltaE = (a: string, b: string) => {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

describe("SERIES_COLOURS", () => {
  it("holds ten distinct hexes", () => {
    expect(SERIES_COLOURS).toHaveLength(10);
    expect(new Set(SERIES_COLOURS).size).toBe(10);
  });

  it("every hue carries white bold text at 4.5:1 or better", () => {
    for (const hex of SERIES_COLOURS) {
      expect(contrastWithWhite(hex), hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("no hue is near amber, orange or red", () => {
    for (const hex of SERIES_COLOURS) {
      for (const bad of AVOID) {
        expect(deltaE(hex, bad), `${hex} vs ${bad}`).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it("no two hues are close enough to be confused", () => {
    for (let i = 0; i < SERIES_COLOURS.length; i += 1) {
      for (let j = i + 1; j < SERIES_COLOURS.length; j += 1) {
        const [a, b] = [SERIES_COLOURS[i] as string, SERIES_COLOURS[j] as string];
        expect(deltaE(a, b), `${a} vs ${b}`).toBeGreaterThanOrEqual(20);
      }
    }
  });
});

describe("seriesColour", () => {
  it("walks the set in order and wraps after ten", () => {
    expect(seriesColour(0)).toBe(SERIES_COLOURS[0]);
    expect(seriesColour(9)).toBe(SERIES_COLOURS[9]);
    expect(seriesColour(10)).toBe(SERIES_COLOURS[0]);
    expect(seriesColour(23)).toBe(SERIES_COLOURS[3]);
  });

  it("never returns undefined for a negative or fractional index", () => {
    expect(seriesColour(-1)).toBe(SERIES_COLOURS[9]);
    expect(seriesColour(2.7)).toBe(SERIES_COLOURS[2]);
  });
});
