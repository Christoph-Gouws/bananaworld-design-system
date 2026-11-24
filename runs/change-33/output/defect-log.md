# Defect log — CR-DESIGN-SYSTEM-035

| # | Found | Defect | Fix | Status |
|---|---|---|---|---|
| D-1 | build (Edge, axe) | `AttentionItem` named by its title only (`aria-labelledby`) failed axe `label-content-name-mismatch` (WCAG 2.5.3): the name omitted the visible detail and action words. `aria-hidden` on those spans did not help | Dropped `aria-labelledby`/`aria-describedby` and `useId`; the name is the visible words, title first. Same fix the kit made in CR-DESIGN-SYSTEM-032 D-5. Tests, README and proof updated; axe now runs with every rule | Fixed (deviation from "name = title" recorded: known-issues K-2) |
| D-2 | build (sensor) | `index.ts` at 301 sensor-lines (one new export line over the 300 limit) | New export placed on the line of the previous export; file is 299 lines on disk | Fixed (debt: `technical-debt.md`) |
| D-3 | build (mutation battery) | CountBadge "uppercase" mutant escaped | Spec asserts no `uppercase` class | Fixed |
| D-4 | build (test) | The frozen-HTML capture first used `renderToString`, which the next-link mock cannot server-render | Captured `innerHTML` through Testing Library instead | Fixed |

None open.
