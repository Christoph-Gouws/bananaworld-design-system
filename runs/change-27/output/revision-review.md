# Revision review — CR-DESIGN-SYSTEM-029 (Stage 05)

**Reviewed:** `src/components/TruckDiagram.tsx` diff, the new `describe("TruckDiagram compact")`, README, package version.

**Simplified:** compact strings are the default constants plus `max-sm:` overrides, so the default entries stay byte-identical and only the tablet `min-h-14` is moved behind `sm:`. One `compact` boolean is passed down instead of a density lookup table per element.

**Considered and rejected:**
- Look B (two lines, reordered visible text): edits `SpaceBody`; the plan recommended A and the owner approved A.
- A row-number gutter: a second numbering and a DOM change (plan D-2).
- A new exported `TruckDensity` type: grows the export surface for nothing; the union is inline.
- Compact on tablets: tablets stay on the gloved-hand floor (plan D-3).

**Plan fit:** `main` is `eefc0c8`; `TruckDiagram.tsx` (SPACE, LIST, DIVIDER, WARNING, END_BLOCK, check icon) and its tests are as the plan cites. One difference: the plan said "one complete string per density"; the compact strings extend the default constants with `max-sm:` classes (same effect, default untouched). Size chosen: 40 px, the plan's recommendation; the owner approved the plan without picking another size.
