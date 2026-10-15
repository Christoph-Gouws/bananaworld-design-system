// Categorical "series" colours (CR-DC-247) — ten hues for telling several THINGS of one kind apart on a
// canvas: the runs on a delivery map, the lines on a chart. Pure presentation: no business meaning, no
// naming of what they are used for.
//
// HEX, NOT CSS VARIABLES, ON PURPOSE. A WebGL/canvas surface (MapLibre) cannot read a CSS variable, which
// is the same reason a status colour is also a hex elsewhere. tokens.css is deliberately NOT touched: a
// token change needs the full DC + CRM re-check (QG-CEN-003), and this set is purely additive — a new
// export no existing consumer reads. A swatch in the DOM paints the same hex inline.
//
// THE RULES THE SET WAS CHOSEN UNDER (tests/lib/series-colours.test.ts holds each one):
//   · every hue reads at ≥ 4.5 : 1 against white, so bold white text on a fill of it is legible;
//   · NONE is near amber, orange or red. Those mean "be careful" and "failed" in the status palette, and a
//     series colour that looked like them would say something it does not mean;
//   · no two are close enough to be confused at a glance.
// Ten is not a limit on how many things there can be — callers wrap round (`seriesColour(i)`) and must
// carry a second identifier (a label, a name) so colour is never the ONLY way to tell two apart.

export const SERIES_COLOURS = [
  "#1f5fd6", // blue
  "#6b3fc4", // violet
  "#0b7a70", // teal
  "#c0306a", // raspberry
  "#2f7d32", // green
  "#8e2a8a", // plum
  "#0a6d9a", // ocean
  "#5f6b12", // olive
  "#24407a", // navy
  "#8c4a5e", // rose-brown
] as const;

export type SeriesColour = (typeof SERIES_COLOURS)[number];

// The colour for the n-th thing (0-based), wrapping after ten.
export function seriesColour(index: number): SeriesColour {
  const n = SERIES_COLOURS.length;
  return SERIES_COLOURS[((Math.trunc(index) % n) + n) % n] as SeriesColour;
}
