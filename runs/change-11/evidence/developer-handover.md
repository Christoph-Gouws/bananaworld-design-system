# Developer handover — CR-DESIGN-SYSTEM-012

**State:** built, rehearsed green, PR opened and merged on green by the raising session (D-4). No debt.

**Next agent should know:**
1. 🔴 A heading is NOT an option. Anything that indexes the listbox's children by `activeIndex` is wrong once a
   consumer passes `group` — use `optionRefs` (one entry per option).
2. 🔴 The component never sorts. A consumer passing non-contiguous groups gets a heading per run, by design.
3. The byte-identical spec's literal was captured from `76fec2a0`; if a later change alters the ungrouped markup
   on purpose, re-capture it from the version being replaced and say so in that change's record.

**Next action:** none here. The consumer (Bananaworld-DC) moves its pin in CR-DC-210.
