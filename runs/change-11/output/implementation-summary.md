# Implementation summary — CR-DESIGN-SYSTEM-012

`ComboboxOption` gains an optional `group`. A heading (`<li role="presentation">`) is drawn wherever the group
changes between neighbouring FILTERED options. Headings are not options (no role, no handler, not counted by
`activeIndex`); the keep-in-view effect now reads a per-option ref because `list.children[i]` would be offset by
headings. No export, prop or component added. Without `group` the markup is byte-identical (asserted).

Consumer: Bananaworld-DC CR-DC-210 (the tablet batch picker: *In this room* / *Elsewhere in the DC*).
Plan: `runs/current/logic-plan/CR-DESIGN-SYSTEM-012.md`. Decisions D-1…D-4: the decision log.
