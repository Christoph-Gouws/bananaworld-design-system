# Implementation summary — CR-DESIGN-SYSTEM-021

Plan premise check: the files and lines the plan cites (`Link.tsx`, `Icon.tsx`, `ListCard.tsx`, `index.ts`, the export inventory test) are as described on fresh `main` `3953e6d`; baseline re-measured 554 tests / 28 files. Built to the approved plan, layout **A**, on-green.

- **`Keypad`** (`Keypad.tsx` + pure `keypad-entry.ts`): controlled, 3-column pad, native buttons, `maxDigits` (default 4), `label`, `target`/`targetLabel`, `disabled`, `words`. Keys 48 px with a mouse, 64 px on coarse pointer and on `data-surface=tablet`. Leading zero dropped; `onChange` only on a real change. Keyboard on the group: digits, Backspace = last digit, Delete = clear; Ctrl/Meta/Alt ignored. Polite `<output>` live region; target outside it.
- **`ActionTile`**: button, or the kit `Link` when `href` is given (`href` + `disabled` = disabled button). Icon above label, optional hint and count badge; default/primary (dark) variants; `h-full w-full min-h-[86px]`, wraps, sets no grid.
- **`FigureTile`: not added.** `ListCard density="card"` with the app's own caption/number/sub-text covers it (shown in the README and in the gallery frames).
- Barrel: two new export lines; version 0.6.0; README; export inventory declares the two names.

## Where the build departed from the plan text (approach unchanged)
1. **ActionTile accessible name.** Plan: `aria-labelledby` (label + badge) with the hint as `aria-describedby`. The first real-browser axe run failed `label-content-name-mismatch` (WCAG 2.5.3: visible text must be in the name). Now the name is the tile's visible text (label, count, hint), with spacing text nodes; no ids, no `useId`. A caller `aria-label` still wins.
2. **Disabled pad box.** Plan: `opacity-50` on the box. axe `color-contrast` failed on the faded label (the box is not a disabled control). Now a muted background, text unfaded; the keys are still natively disabled and faded.
3. **Numpad test.** user-event's `{Numpad5}` does not report key "5"; the test fires a keydown with `key:"5", code:"Numpad5"` instead.
4. **Audit.** See known-issues K-1.

Existing callers checked (additive claim): no existing component file changed; `src/` diff is `index.ts` (+5, 0 −) and three new files. All 554 existing tests pass unedited except the one inventory declaration. DC (pin `1fefb6c6`) uses named re-exports with no `export *` and has no `Keypad`/`ActionTile` name; `ListCard`, `Link`, `Icon`, `NumericInput`, `Input` are imported or untouched, never edited. CRM, RMS, Org Admin: not readable here; they gain the names only when they move their pin. No pin bumped.
