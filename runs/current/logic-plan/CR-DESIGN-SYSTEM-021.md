# CR-DESIGN-SYSTEM-021 — a tablet number pad (`Keypad`) and a big icon-and-label button (`ActionTile`) — Logic Plan

> Companion of **CR-DC-256** (DC market crate station, part 2 of 3: the tablet screens; plan approved 2026-10-22,
> layout A). That change is blocked at build until this one merges (its plan §7.1). **This was a planning session
> only. No feature code was written.** `bananaworld-dc` and the CR-DC-256 worktree were only read. Base: `main` @
> `3953e6d` (CR-DESIGN-SYSTEM-020, PR #38, kit **0.5.0**). DC's pin, from its own `package.json:57`:
> `1fefb6c6038a52a96a44eae8be93472254ab7f89`.

<!-- OWNER-BRIEF-START -->

**What you'll have.** The shared screen kit gets two new pieces for the market tablet. First, a number pad with big keys that work with gloves on: 1 to 9, then Clear, 0 and a delete key. It counts whole crates only, up to four digits, and can show a figure beside the count to compare against, such as "expected 40". Second, a big button with a picture above a short name and, if needed, a small number on it. These are the "Crates out / Crates in / New client" buttons. The two figure boxes on the home screen need nothing new: the kit's existing card already shows them.

**Please decide.**
1. The look. I recommend **A**: the count sits in a box above the keys and the "expected" figure sits small beside it. **B** shows both figures at the same size. **C** has no box: the screen shows the count in its own row.

**Not included.** The market screens themselves. They come in the warehouse change that is waiting on this one. No other app changes. Each one keeps its current kit version until it chooses to move.

**Risks.** None for the apps already live. Nothing they use today changes.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: next estate session due **2027-01-10**. Not overdue.
- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` in this worktree.** This has been recorded since
  CR-013. The standing rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **No existing plan for this CR.** This is a fresh plan, not a revision. No owner responses are recorded. No clarify
  round was used: the request is fully specified. The one real judgement left, whether the pad draws its own number box,
  is a mockup pick (brief (b)1).
- **Read in this repo:**
  - `src/components/` `ListCard.tsx`, `Button.tsx`, `NumericInput.tsx`, `Icon.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `Link.tsx`, `ExportButton.tsx`, `index.ts` (all whole).
  - `src/lib/tokens.css`, `package.json`, `README.md`, `vitest.config.ts`.
  - Tests: `tests/components/DragBoard.additive.test.tsx` (the export inventory) and `fixtures/next-link-mock.tsx`.
  - The CR-020 plan (format precedent).
- **Read in DC (read only):**
  - `package.json:57` (pin).
  - `tailwind.config.ts:5-12` (content scans the kit's `src/`) and `:26-35` (`surface`, `fg` colour keys exist, so `bg-fg` / `text-surface` resolve).
  - `src/components/dashboard/ManagerHomeDashboard.tsx:179-251` (a private `KpiCard`).
  - `ListCard` callers (`ServicingView.tsx:502,554,619`; `GallerySections.tsx:295,305`).
- **Read in the CR-DC-256 worktree (read only):** its plan (whole; §7.1 is the prerequisite) and
  `runs/current/mockups/CR-DC-256/option-a.html` (layout A: two figure cards, three tiles at `min-height:86px`, and a
  3-column pad below three count rows).
- **Not readable from here:** Manga Verde (so `components/tablet/PinKeypad.tsx` was **not** read and nothing is ported
  from it), CRM, RMS, Org Admin. No claim is made about their code.
- **Searched:** `Keypad|ActionTile|FigureTile|keypad` over the kit's `src/` and `tests/`. The only hits are two comments
  about the OS keypad (`Input.tsx:10`, `NumericInput.tsx:8`). So the kit at `3953e6d` has no pad and no tile, which
  confirms the request. In DC (`src/`, `app/`, `tests/`), `\bKeypad\b|\bActionTile\b|\bFigureTile\b` has 0 hits, so
  the new names cannot collide with a DC name.

## 1. Item (3) first: the figure tile adds nothing

**Finding: an existing part covers it. No `FigureTile` is added.** `ListCard` (`src/components/ListCard.tsx:12-55`) is a
bordered `div` (`bg-surface border border-border`, `density="card"`: `min-h-[80px] p-4 rounded-lg`, tablet 96 px /
`p-5`) that renders **any children**. Layout A's figure is a caption, a big number and a sub-text inside a bordered
box. That is three lines of the app's own text inside `<ListCard density="card">`, with `className` for spacing if
wanted. This is composition, not a fork: no kit class is copied and no kit control is re-implemented.

The estate already does exactly this. DC's `ManagerHomeDashboard.tsx:212-251` `KpiCard` is the same shape: label,
`text-2xl font-semibold tabular-nums` value, sub-text, in `rounded-lg border border-border bg-surface p-4`. It is a
private helper in DC's lane. Promoting it is **not** asked for and is not done here. It is recorded as residual R5 so
DC can choose to swap it for `ListCard` later.

The usage note in the README (§5) shows the figure-card composition, so CR-DC-256 has one spelling to copy. The
evidence at build repeats this finding (request item 3).

## 2. `Keypad` (new: `src/components/Keypad.tsx` + pure `src/components/keypad-entry.ts`)

### 2.1 Props

```ts
export interface KeypadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value: string;                       // digits only, e.g. "" | "0" | "35"
  onChange: (next: string) => void;    // called only when the value actually changes
  maxDigits?: number;                  // default 4; a value < 1 or not a whole number falls back to 4
  label?: string;                      // names the pad (role=group) and heads the number box, e.g. "Standard Crate"
  target?: number | string;            // shown beside the entry for comparison, e.g. 40
  targetLabel?: string;                // default "Expected"
  disabled?: boolean;
  words?: { clear?: string; deleteLastDigit?: string; empty?: string }; // defaults "Clear" · "Delete last digit" · "empty"
}
```

- **Controlled only.** There is no internal value state, so the app is the one owner of the count (CR-DC-256's three
  rows each hold their own string and point the pad at the active one).
- `words` exists because the kit's three built-in words are English and the next likely adopter (Manga Verde) is
  Portuguese. That is the `ExportButton` `children` precedent (CR-020). It is optional and has English defaults. If the
  Stage 05 simplification gate judges it premature, it is the first thing to cut. It is 4 lines.
- **Option C only** (if the owner picks C): one more optional prop, `showEntry?: boolean` (default `true`). `false`
  hides the number box **visually only**. The polite announcement stays, in a `sr-only` node.

### 2.2 Digit rules (pure, `keypad-entry.ts`, not exported from the barrel)

`pressKeypadKey(value: string, key: KeypadKey, maxDigits: number): string`, where `KeypadKey = "0".."9" | "clear" |
"backspace"`:

| Key | Rule | Examples |
|---|---|---|
| digit | `value === "0"` → the digit replaces it (**leading zero dropped**). Else, if `value.length >= maxDigits`, the value is **unchanged**. Else, append | `""+0→"0"`, `"0"+5→"5"`, `"0"+0→"0"`, `"12"+3→"123"`, `"9999"+1→"9999"` (max 4) |
| backspace | drop the last character; `""` stays `""` | `"123"→"12"`, `"5"→""`, `""→""` |
| clear | `""` | `"123"→""`, `""→""` |

`resolveMaxDigits(maxDigits?: number): number` does the fallback to 4. The component calls `onChange` only when the
result differs from `value`, so a fifth digit, backspace on empty and clear on empty make **no** call. There are no
decimals, no rounding, no minus sign and no parsing to a number: the string is the count. The value the app hands in is
displayed as given; the rules operate on it as given (documented contract: digits only).

### 2.3 Markup and look (option A shown; B and C differ only in the number box, §7)

```
<div role="group" aria-labelledby={labelId?} onKeyDown=… data-disabled=…>   (w-full; the app sets the width)
  number box: [label]                     [big value | "—"] [targetLabel target]
              <output aria-live="polite" aria-atomic="true">{value || words.empty (sr-only)}</output>
  <div class="grid grid-cols-3 gap-2">
    1 2 3 / 4 5 6 / 7 8 9 / [Clear] 0 [⌫ aria-label="Delete last digit"]
  </div>
</div>
```

- **Every key is a native `<button type="button">`** (never submits a surrounding form). Digits have their digit as
  the accessible name. Clear's name is its visible text; Backspace shows lucide `Delete` via `Icon` (aria-hidden) and
  has `aria-label={words.deleteLastDigit}`. **No Radix primitive exists for a keypad**, so there is no Radix control to
  replace. Native buttons give keyboard, focus and screen-reader behaviour for free, which is the point of the lane rule.
- **Size:** keys `h-12` with a mouse, **`h-16` (64 px) on touch** (`[@media(pointer:coarse)]:h-16`, the CR-020 variant,
  DC on `tailwindcss ^3.4`) **and on the tablet surface** (`[[data-surface=tablet]_&]:h-16`). That is above the 44 px
  floor. Digits are `text-2xl tabular-nums`; the number box value is `text-4xl font-semibold tabular-nums`.
- **Clear and Backspace are visually secondary:** `bg-surface-muted text-fg-muted text-base`. Digits are `bg-surface
  text-fg`. All keys have `border border-border rounded-lg`, `hover:bg-surface-muted`, `active:bg-surface-sunken`, the
  kit focus ring `focus-visible:outline-none focus-visible:shadow-focus`, and `touch-manipulation` (no double-tap zoom
  when tapping fast).
- **Empty:** the box shows a muted `—` (aria-hidden). The live region carries `words.empty` in `sr-only`, so pressing
  Clear is heard.
- **Target:** `{targetLabel} {target}` in `text-sm text-fg-subtle tabular-nums`. It is **outside** the live region, so
  it is not re-announced on every keystroke. It is part of the group's description (`aria-describedby`), so it is heard
  once on entry.
- **Disabled:** every key is natively `disabled` (out of the tab order) and the box gets `opacity-50`. The key handler
  is inert.
- **At max:** the digit keys stay enabled and a further digit is a silent no-op. They are **not** disabled at max,
  because disabling the focused key would drop focus to `<body>`, and the physical keyboard would stop reaching the pad.

### 2.4 Physical keyboard

`onKeyDown` sits on the group root, so it fires whenever **focus is on any key inside the pad** ("when it has focus").
The root itself is not a tab stop, which avoids a thirteenth stop.

| Key | Action |
|---|---|
| `0`–`9` (top row and numpad: `event.key` is the digit) | that digit |
| `Backspace` | delete last digit |
| `Delete` | **clear** (the Windows Calculator convention: Backspace = last digit, Del = clear entry) |
| with `Ctrl` / `Meta` / `Alt` held | ignored (browser shortcuts untouched) |
| anything else (`Tab`, `Enter`, `Space`, arrows) | not handled, native behaviour (Enter/Space press the focused key) |

Handled keys call `preventDefault()`. When disabled, nothing is handled.

> The request says "Backspace and Delete also work". Mapping `Delete` to **clear** rather than to a second backspace is
> a design decision, recorded here and in the decision log. It is pinned by a test, so a reviewer who prefers the
> other mapping changes one line and one assertion.

### 2.5 No network, no business rule

The pad makes no call, imports no app state and knows nothing about crates. `maxDigits` stops a runaway count on the
screen. Whether 15 crates back is allowed is CR-DC-256's server rule R1, not the pad's.

## 3. `ActionTile` (new: `src/components/ActionTile.tsx`)

### 3.1 Props (a union keyed on `href`)

```ts
type ActionTileOwnProps = {
  icon: IconProps["as"];               // a lucide icon component, rendered through the kit's Icon (size "lg")
  label: string;                       // short; wraps, never truncates
  hint?: string;                       // optional one-line hint under the label
  count?: number;                      // optional badge; rendered whenever a number is given (0 included)
  variant?: "default" | "primary";     // default "default"; primary = the dark tile in layout A
  disabled?: boolean;
};
export type ActionTileProps =
  | (ActionTileOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { href?: undefined })
  | (ActionTileOwnProps & Omit<LinkProps, "children" | "href"> & { href: string });
export const ActionTile: ForwardRefExoticComponent<ActionTileProps & RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
```

### 3.2 Render

- **No `href`** → native `<button type="button">` (caller's `type` wins).
- **`href`** → the kit's own **`Link`** (`./Link`). It keeps the tablet `prefetch={false}` rule (UX-DS-022) and feeds
  the CR-018 navigation busy signal for free. It does not use a bare `<a>`.
- **`href` + `disabled`** → a disabled `<button>`, because an anchor cannot be disabled (CR-019 R1 / CR-020 precedent).
- **Accessible name and description:** `aria-labelledby` = the label span (+ the badge span when `count` is set), so the
  name is "Crates in" or "Crates in 3". `aria-describedby` = the hint span, so the hint is a description, not part of
  the name. Ids come from `useId`. The icon is `aria-hidden` (Icon's default with no `label`). An app may pass its own
  `aria-label` when a badge number needs words.
- **Look:** `relative flex h-full w-full min-h-[86px] flex-col items-center justify-center gap-1.5 rounded-lg border
  p-3 text-center text-base font-semibold leading-tight whitespace-normal [overflow-wrap:anywhere] touch-manipulation
  select-none`, plus the kit ring `focus-visible:outline-none focus-visible:shadow-focus` and `disabled:cursor-not-allowed
  disabled:opacity-50`.
  - `h-full w-full` makes the tile **fill its grid cell**. The tile sets **no grid** itself; the app's grid places it.
  - `whitespace-normal [overflow-wrap:anywhere]` makes the **label wrap** at 375 px three-across (~111 px per tile)
    instead of truncating. The hint wraps too: "one-line" is the content guidance, and truncation would hide words.
  - `default`: `bg-surface text-fg border-border hover:bg-surface-muted hover:border-border-strong
    active:bg-surface-sunken`.
  - `primary`: `bg-fg text-surface border-fg hover:bg-fg/90`. This is the **dark** tile. Not the accent yellow:
    `tokens.css:43` says the accent is "primary CTA only, never large fills", and the packhouse theme only re-colours
    the accent, so the dark tile is theme-neutral.
  - Link path: `Link` brings `text-fg … hover:text-accent rounded-sm` (`Link.tsx:64-68`). The tile's classes come last
    through `cn` (tailwind-merge), and each variant states its own `hover:text-*` (`hover:text-fg` / `hover:text-surface`),
    so the dark tile's words never turn yellow on hover. This is pinned by a test on the merged class list.
  - Badge: `absolute right-2 top-2 min-w-6 h-6 rounded-full bg-accent text-fg-on-accent text-xs font-bold tabular-nums
    px-1.5`. It is small, so the accent use is within the token rule.
- **Ref:** it is attached on both paths (`HTMLButtonElement | HTMLAnchorElement`). It is a new component, so no existing
  ref type has to be preserved.

## 4. Barrel, version, inventory

- `src/components/index.ts`: two new lines with a CR comment, in the file's style: `export { Keypad, type KeypadProps }
  from "./Keypad";` and `export { ActionTile, type ActionTileProps } from "./ActionTile";`. **No existing line moves.**
  `keypad-entry.ts` is not exported (internal, like `multi-select-reading.ts`).
- `tests/components/DragBoard.additive.test.tsx` `ADDED_SINCE_011` gains `"ActionTile"` and `"Keypad"` under a
  `// CR-DESIGN-SYSTEM-021` comment. `EXPORTS_AT_8387F66B` is **not** edited. The spec still fails on any name nobody
  declared.
- `package.json` `version` **0.5.0 → 0.6.0** (additive minor). The `description`'s "28 pure UI primitives" is left
  alone: it is already stale, and fixing it is not this change's.

## 5. README (stands in for a gallery; see §6.4)

- `### Changelog` **0.6.0**: "`Keypad` (on-screen whole-number pad, 64 px keys on touch) and `ActionTile` (large
  icon-and-label button or link). New names only; nothing existing changed. A figure card is `ListCard` with your own
  caption, number and sub-text."
- `## Tablet counting and big buttons` (≈15 lines): a controlled `Keypad` example with `maxDigits` / `target`; the key
  map (§2.4); "the pad never rounds, never parses and never decides whether a count is allowed"; an `ActionTile` grid
  example (`grid grid-cols-3 gap-2`: the grid is the app's); the `ListCard` figure-card composition (§1).

## 6. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** (handover: 554 tests / 28 files at CR-020; re-check at `3953e6d`).
2. **`tests/components/Keypad.test.tsx`** (happy-dom, `user-event`):
   - **Digit rules** on `pressKeypadKey`, table-driven over every row of §2.2: max digits 4 (and 2, and 0/-1/2.5 → 4),
     leading zero, `0`+`0`, backspace on empty, clear on empty, backspace to empty.
   - **Component:** each tap calls `onChange` with the next value; **no call** at max, on backspace when empty or on
     clear when empty; 12 buttons with names `1`…`9`, `0`, `Clear`, `Delete last digit`; all `type="button"`; `words`
     override the three words.
   - **Keyboard:** with focus on a key, `5` → append; numpad `5` (`{Numpad5}` → key "5") → append; `Backspace` → last
     digit gone; `Delete` → cleared; `Control+5` → no call; `Enter` on the focused `7` key → `7` (native click);
     disabled → no call for any key.
   - **Announce:** the `output` has `aria-live="polite"` and holds the value; empty → it holds `empty`; the target is
     outside it.
   - **Disabled:** all 12 keys are `disabled`.
   - **Size classes:** a key carries `[@media(pointer:coarse)]:h-16` and `[[data-surface=tablet]_&]:h-16`.
   - **axe** (`axe-core`, already a devDependency since CR-020): empty, typed, at max, disabled, with target → 0
     violations.
3. **`tests/components/ActionTile.test.tsx`:**
   - No `href` → `button` named "Crates in", `type="button"`; `onClick` fires.
   - `count={3}` → name "Crates in 3"; hint → description, not name.
   - `href` → `link` (via `fixtures/next-link-mock.tsx`) with the `href`, `data-prefetch` per surface.
   - `href` + `disabled` → a disabled `button`, no `a`.
   - The primary class list contains `bg-fg text-surface` and **no** `hover:text-accent` (link path).
   - Fills the cell: `h-full w-full`; wraps: `whitespace-normal`, no `truncate`.
   - Ref attached on both paths.
   - axe (default, primary, disabled, badge, link) → 0 violations.
4. **The additive claim:** the export inventory (§4) stays green with exactly two declared additions.
   `git diff 3953e6d --stat -- src/` must show **only** `index.ts` (+lines, 0 −lines) and the three new files.
   `pnpm typecheck` stays clean. Every existing test passes **unedited**, except the one inventory line in §4.
5. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant
   must turn a test red:
   - leading zero kept;
   - max check `>` instead of `>=`;
   - `onChange` called on a no-op;
   - `Delete` mapped to backspace;
   - modifier keys not ignored;
   - handler active when disabled;
   - key `type` dropped;
   - live region `off`;
   - link path loses the hover override;
   - `href` + `disabled` renders a link;
   - `truncate` added to the label.
6. `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` (LF-normalised), and
   `prettier --check --print-width 100` on the touched files.
7. **Render proof at 375 px and 1024 px** (the committed Edge driver, `runs/change-10/evidence/browser-proof/proof.mjs`
   pattern, DC's `playwright-core` + `tailwindcss` read-only, scratch fixture outside the estate tree). A **state gallery
   fixture** renders, under `data-surface="tablet"`:
   - the pad empty / typed "35" with "Expected 40" / at max "9999" / disabled;
   - the tile default / primary / disabled / with badge / link, three across;
   - two `ListCard` figure cards.

   It runs at 375×812 and 1024×768, with touch emulation (`hasTouch`, coarse pointer). It asserts:
   - key box height ≥ 64 px, tile height ≥ 86 px;
   - tiles equal width within the grid, and the label's `scrollWidth <= clientWidth` (no truncation) at 375;
   - no horizontal page scroll;
   - axe in the page → 0 violations;
   - real keyboard typing `1`,`2`,`Backspace`,`Delete` → the value sequence.

   Frames go to `runs/change-NN/evidence/frames/`. **This fixture plus its frames is the "gallery/stories" of request
   item (4).** The kit has no gallery or Storybook (CR-020 §0: grep `stories|gallery` finds none), and adding one is
   new tooling, not this change. DC's own gallery (`app/design-system/`) is DC's lane. CR-DC-256 may add a section
   at its pin bump.

## 7. Mockup options (`runs/current/mockups/CR-DESIGN-SYSTEM-021/`)

All three have the same keys, the same rules, the same tile, and the same figure cards (`ListCard`). They differ in how
the **count and the "expected" figure** are shown.

- **A — number box above the keys, the "expected" figure small beside the count (recommended).** The pad works on its
  own anywhere (day-one count, a single count screen), and the number is large right next to the keys. In layout A's
  three-row step, the active row's count also shows in the box. That repeat is minor and makes the number easier to
  see with gloves on.
- **B — the box shows the count and the "expected" figure side by side at equal size**, with the badge inline after
  the tile label. This is clearer for a straight comparison. It gives equal weight to a number the operator is not
  typing, and the badge pushes long labels to two lines sooner.
- **C — no box: the screen shows the count in its own row** (layout A's drawing exactly). The pad is the leanest, but
  it adds one on/off setting to the kit (`showEntry`), and every screen must then draw the count itself. The spoken
  announcement still happens.

## 8. Existing callers checked (the additive claim)

No existing component file changes. Only `index.ts` gains lines. So no existing caller can render differently, by
construction. The callers checked:

| Caller | Why unaffected |
|---|---|
| DC (pin `1fefb6c6`), `src/components/ui/index.ts` named re-exports | Named re-exports, no `export *` (grep: 0 hits). New names are not pulled in until DC adds them in CR-DC-256. No DC name `Keypad`/`ActionTile`/`FigureTile` exists (grep: 0), so there is nothing to shadow |
| DC `ListCard` callers (`ServicingView.tsx:502,554,619`; `GallerySections.tsx:295,305`) | `ListCard.tsx` is not edited. The figure-card finding adds **no** prop to it |
| DC `NumericInput` / `Input` users | Not edited. The pad does not replace the OS keypad for anyone |
| DC `Link`, `Icon`, `Button` users | `Link.tsx` and `Icon.tsx` are **imported** by `ActionTile`, not edited. `Button` is not used |
| Kit tests (all 28 files) | Pass unedited, except the one inventory declaration (§4) |
| CRM, RMS, Org Admin, Manga Verde | Not readable. They cannot be affected: no existing module's code changes, and they gain the names only when they move their pin |

## 9. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/Keypad.tsx` | new: the pad (§2.1, §2.3, §2.4) | 140 |
| `src/components/keypad-entry.ts` | new: pure digit rules (§2.2) | 40 |
| `src/components/ActionTile.tsx` | new: the tile (§3) | 110 |
| `src/components/index.ts` | +2 export lines with a comment | 8 |
| `README.md` | Changelog 0.6.0 + usage section | 30 |
| `package.json` | `version` 0.6.0 | 1 |

Paper trail (not in the estimate):
- tests: `Keypad.test.tsx`, `ActionTile.test.tsx`, plus the inventory line;
- the gallery fixture and browser proof, the frames, the mutation battery;
- the decision-log entry `CR-DESIGN-SYSTEM-021` (FigureTile not added; Delete = clear; dark primary; `words`);
- the handover / active-milestone refresh, and `known-issues.md` (R1–R5, the owed DC pin bump).

The archive goes in the slot the conductor names (never overwrite; handover item 13). No migration (no database). No
new dependency. **No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is
created or written.

## 10. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The only seams are the package hand-off to
each consumer. **The kit writes the controls. Each app reads them only when it moves its own pin, to the MERGED sha on
`main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | Kit `Keypad` / `ActionTile` → **DC** (pin `1fefb6c6`) | Kit | DC market tablet | Adds the two parts CR-DC-256 §7.1 requires. The figure card is `ListCard` (already in DC's pin) | **CR-DC-256** bumps DC's pin to the merged sha reported at close and re-exports the two names through `src/components/ui/index.ts`. Not done here |
| S2 | Kit → **CRM, RMS, Org Admin, Manga Verde** | Kit | Each app | Nothing they render changes (§8) | Nothing owed; they get the names at their next bump |
| S3 | Count value: pad → app | App (owns the string through `onChange`) | Pad (displays it) | The pad never stores, sends or judges a count | CR-DC-256 owns the count and its server rules (R1–R4 there) |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the fifteenth change to note
it; the decision is the owner's. S1–S3 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The pad's digit rules (whole digits only, at most `maxDigits`, leading zero dropped) are
**input mechanics of a control**, like `NumericInput`'s `pattern`. They are not a rule about what may happen to a crate.
Whether a count is allowed (for example "crates back may not exceed what the buyer holds") is CR-DC-256's server rule R1,
spelled in DC's `slip-rules.ts`, and the kit does not mirror it. No existing rule is moved, retired or re-spelled.

For transparency, the nearby places that spell number entry today, all **left**:

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/NumericInput.tsx:15` (`inputMode="decimal"`, `pattern`) | leave | The OS keypad route stays for every current caller. The new pad is a separate, opt-in part |
| `src/components/Input.tsx:10,47` (OS keypad comment, `tabular-nums`) | leave | Not touched |
| `src/components/ListCard.tsx:12-55` | leave | Covers the figure card as is (§1) |
| DC `src/components/dashboard/ManagerHomeDashboard.tsx:212-251` (`KpiCard`) | leave (read-only repo) | DC's private figure card. DC's to consolidate (R5) |

**Search terms used:** `Keypad|ActionTile|FigureTile|keypad` (kit `src/` + `tests/`); `\bKeypad\b|\bActionTile\b|\bFigureTile\b|export \*
from "@bananaworld/design-system"` (DC `src/ app/ tests/`); `ListCard` (DC `src/ app/`); `StatCard|KpiCard|MetricCard|FigureCard|StatTile|text-3xl
font-semibold tabular-nums` (DC `src/`); `tabular|stories|gallery|Gallery` (kit `src/` + `README.md`); `fg:|surface:|content:` (DC
`tailwind.config.ts`).

## 11. Residuals and open questions

- **Owner pick:** the look, A / B / C (§7). If C is picked, add `showEntry` (§2.1); otherwise it is not added.
- **R1 — `Delete` = clear** (§2.4). This is a decision, not a request quote. It is pinned by a test and logged.
- **R2 — at max a digit is a silent no-op.** The keys are not disabled, to keep focus (§2.3). If owners later want a
  visible "full" cue, it is an additive class.
- **R3 — 12 tab stops.** Every key is a real button in the tab order, as asked. Arrow-key roving focus is not added. The
  physical-keyboard path (digits anywhere in the pad) is the efficient one.
- **R4 — no gallery tooling in the kit.** The state gallery is a proof fixture plus frames (§6.7). Owner housekeeping, if
  wanted: a real kit gallery is its own change.
- **R5 — DC's private `KpiCard`** duplicates what `ListCard` composes. It is DC's lane. Noted, not acted on.
- **Manga Verde's `PinKeypad`** was not readable from this session. Nothing was ported from it. If MV later adopts
  `Keypad` for PIN entry, masking is a separate additive question.
- Standing, carried: no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the `.snap`
  CRLF artefact (do not stage); `prettier --print-width 100`.

## 12. After merge

Report the **merged** `main` sha in the close-out and the handover. CR-DC-256 moves DC's pin from `1fefb6c6` to it. That
move also carries CR-020's `ExportButton` link variant (`3953e6d`). It is additive, and DC's callers pass no `href`.
CR-DC-256's build should know this, and it is noted in `known-issues.md`. No other pin is moved. `package.json` says
`0.6.0`.

## 13. Not an epic

Two new components, one pure helper, two barrel lines, a changelog and a version. I cannot name five milestones this
decomposes into. DC's adoption is CR-DC-256's own change, not a milestone of this one.
