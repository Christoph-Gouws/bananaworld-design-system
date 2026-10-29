# Revision review (Stage 05) — CR-DESIGN-SYSTEM-025

**Reviewed:** `src/components/BarChart.tsx`, the barrel block, `tests/components/BarChart.test.tsx`, README section.

**Simplified:** one structure serves as picture and table (no hidden duplicate table); three tiny file-local helpers, none exported; no default-words object exported; no hook, no `useId`, no client directive.

**Considered and rejected:**
- A `look` prop for A/B/C — one look, chosen once, keeps every app consistent (plan D-8).
- A series palette / more tones — one accent plus one `warning` tone is all the first consumer needs (D-6).
- Promoting DC's SVG `BarChart` — fixed viewBox shrinks text at 390 px and cannot wrap labels (D-1).
- A share cell on the total row — the total has no share of itself worth printing; two cells keep it honest.

**Departures from the plan text (note, not a premise change):** look A is built with a CSS subgrid (`grid-cols-subgrid`) so amounts and shares line up across rows while each row stays a `role="row"` with direct cells; the plan described a per-row grid.
