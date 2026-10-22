# Revision review (Stage 05) — CR-DESIGN-SYSTEM-021

**Reviewed:** `Keypad.tsx`, `keypad-entry.ts`, `ActionTile.tsx`, the barrel lines (files in `changed-files.md`). Sensors: 0 open findings.

**Simplified:** `ActionTile`'s body was extracted to `TileBody` (function-size hook flagged 61 lines); then the `useId` / `aria-labelledby` / `aria-describedby` machinery was removed altogether once the real-browser axe run showed the visible text is the right accessible name. Result: fewer ids, no extra props, a smaller component.

**Considered and rejected:**
- Removing the `words` prop (plan: first to cut if premature). Kept: 3 lines, and Manga Verde is the likely Portuguese adopter.
- Disabling digit keys at max. Rejected: disabling the focused key drops focus to `<body>` and the physical keyboard stops reaching the pad.
- Sharing the key classes with `Button`. Rejected: different sizes/looks; coupling would risk `Button` callers.
- A `FigureTile`. Rejected: `ListCard` covers it.
