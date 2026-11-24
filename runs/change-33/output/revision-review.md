# Stage 05 revision review — CR-DESIGN-SYSTEM-035

**Reviewed** (the files in `changed-files.md`): `StatTile.tsx`, new `AttentionItem.tsx`, `StatusBadge.tsx` (CountBadge appended), `index.ts`, and the specs.

**Simplified.**
- AttentionItem lost its `useId` plumbing (three ids, labelledby/describedby, `"use client"`) when the axe finding made the content-derived name the right answer — less code and a server-renderable file.
- The first draft of StatTile had `SOFT`/`FILL` helper strings next to the literal tone classes; removed (dead). Tone classes stay literal so every consumer's Tailwind scan sees them.
- `TileFoot` split out of `TileBody` so no function nears the 50-line sensor; `toneKeyOf` written once and used by both `TileBody` and `StatTile`.
- `CountBadge` reuses `positiveCount` instead of a second "0 shows nothing" rule.

**Considered and rejected.**
- Reusing `StatusBadge` for the count: it always draws a dot and capitals and its `status` values are lifecycle states (plan D-8).
- A new amber token or the drawing's exact hex: `tokens.css` is hash-frozen with a DC + CRM re-check; the warning family is the estate's one amber (plan D-2).
- Refactoring `SideMenu`'s private `CountPill` onto `CountBadge`: would alter the AppShell frozen HTML (plan Rule sites).
- Hiding the foot words from the link name with `aria-hidden`: breaks voice control (WCAG 2.5.3).
- Keeping `aria-labelledby={title}`: fails axe label-in-name in a real browser (D-1 in the defect log).
