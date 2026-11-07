# CR-DESIGN-SYSTEM-028 — a shared truck loading picture (`TruckDiagram`) in the kit — Logic Plan (revision 2)

> Raised by owner ruling 2026-11-07 for the packhouse dispatch screens (bananaworld-ph EPIC-006-M-01 loading, M-02
> delivery note). It follows the same pattern as CR-DESIGN-SYSTEM-025 (bar chart) and 026 (StatTile), DLC-DEC-221.
> **Revision 2 (2026-11-07)** answers the owner's `plan REVISE` from the packhouse EPIC-006-M-01 mockup gate: reefers
> load from the back, so the picture draws **drop blocks** (last drop at the cab, first drop by the doors).
> **This was a planning session only. No feature code was written.** `bananaworld-dc`, `bananaworld-ph` and every other
> estate app were only read. Base: `main` @ `0e9ed06` (CR-DESIGN-SYSTEM-026, PR #45, kit **0.10.0**).

<!-- OWNER-BRIEF-START -->

**What changed (your note of 7 November).**
- Drop blocks added: the last drop sits at the cab, the first drop by the doors, with a bold labelled line between them ("Drop 2 · unloaded last", "Drop 1 · unloaded first").
- Cab is written at the top, Doors at the bottom.
- Every example is redrawn: the other packhouse's drop 2 at the cab, our drop 1 by the doors.
- Your loading screen still decides each space and its drop. The picture only draws them.
- Everything else stays: no pallet numbers on taken spaces, the past-30 warning, black-and-white printing, no sideways scrolling.

**What you'll get.** One truck picture for every app, first on the packhouse loading screen. Two pallets side by side, spaces numbered from the cab. Each space is empty, a pallet number, "taken" or "picked". Works on phone, tablet and desk, in English or Portuguese.

**Please decide or confirm.**
- Pick a look. **A (recommended):** a truck outline. **B:** a plain grid with row numbers. **C:** like A, lying sideways on wide screens.
- A truck with one drop shows no drop lines.
- If two drops share a row, the odd space gets a small drop tag.
- Space 1 is on the left. The delivery note draws the same picture.

**Not included.** The loading screen and delivery note themselves. Deciding the drop order.

**Risks.** None for the live apps.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`. The next estate session is due **2027-01-10**, so it
  is not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (searched). That has been
  the standing finding since CR-013. The rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **This is revision 2.** Revision 1 (same date) was read in full and is amended, not replaced. The owner's one recorded
  response is a `plan REVISE`:
  - reefers are loaded from the BACK only: the LAST drop sits at the cab and the FIRST drop by the doors;
  - the picture shows DROP BLOCKS: an optional drop number per slot, a clear labelled divider between blocks, Cab at the
    top and Doors at the bottom;
  - every example, story and test with drop 1 next to the cab is redrawn with drop 1 by the doors;
  - the app still decides each slot's state and drop; the kit only draws the blocks;
  - everything else is kept.
  What changed in this file: D-2 (block rules), D-3 (DOM per block), D-4 (divider row), D-6 (taken no longer carries
  "drop N" in `note`), D-11 (`dropLabel`), new **D-13** (drop blocks), §3 types, §4 fixture redrawn, §5 tests and
  mutants, §7 sizes, §8 S1/S3, Rule sites (rule 4), §9 R7–R9, the mockups. Nothing else moved.
- **No clarify round was used** (3 remain). The REVISE settles the drop question. Two edges of it (one-drop trucks, a row
  shared by two drops) are presentation, so they are mine; both are put to the owner as confirms in brief (b), not as
  blocking questions.
- **Read in this repo:**
  - `src/components/StatTile.tsx` (whole), `src/components/PrintPreview.tsx` (whole), `src/components/index.ts:268-299`.
  - `src/lib/tokens.css` (whole), `package.json` (whole), `README.md` (whole).
  - `tests/components/DragBoard.additive.test.tsx:64-121` (the export inventory, `ADDED_SINCE_011`).
  - The CR-026 plan, estimate and comparison page (the format precedent) and the handover.
  - Revision 2: a grep of `src/` for `drop`, `unload`, `reefer`, `cab`, `truck` (see Rule sites). "Drop" in the kit today
    means drag-and-drop only (`DragBoard.tsx`, `DropTarget.ts`, `DragGrip.tsx`) — see R7.
- **Read in bananaworld-ph (read only):**
  - `runs/current/logic-plan/EPIC-006-M-01.md` (lines 1-250): §1 (kit dependency), §2 Q3/Q4, §3.2 (the diagram on
    FS-10, `:97-98`), §4.3 (positions, `:165-173`), §5 (`:203` `trip_for_load` gives "its drop order, positions taken
    by other drops"), **§6.3 (the proposed API, `:242-245`)**. Revision 2 re-read `:160-249`; the M-01 plan does **not
    yet** carry the reefer ruling (grep `unloaded|reefer|last drop|drop block` over the whole repo: no file). See R9.
  - `runs/current/epic-plan/EPIC-006.md` (M-01 and M-02 outcomes: "truck diagram with pallet numbers" on the note).
  - `source-documents/active/UX_SCREEN_SPECIFICATION.md:87,110,268,527,580,665` (UX-SCR-009, UX-DOC-002, OQ-39 closed:
    one standard two-wide diagram, front to back, DLC-DEC-272).
  - `source-documents/active/TECHNICAL_ARCHITECTURE.md:221` **TA-DOC-001: every PDF is rendered on the server with the
    estate's React-PDF approach.** This decides D-9.
  - `src/shared/floor/batch.ts:30` `BATCH_PALLET_WARNING_AFTER = 30`; `supabase/migrations/20261105100000_load_changes.sql:488`
    `packhouse.load_pallets()`. The "30" is a packhouse business value. This decides D-5.
  - `package.json:39` (kit pin `0e9ed064`, i.e. current `main`), `:55` (`tailwindcss ^3.4`, so `print:` works).
  - Revision 2: a grep of `src/` for `drop_order|drop order|positions_taken` — nothing (no dispatch code yet).
- **Read in DC (read only):** `package.json:71,90` (`@react-pdf/renderer ^4`, the estate PDF approach; `tailwindcss ^3.4`).
  A name search for a truck or pallet-position picture found nothing to port. `room-occupancy/RoomOccupancyView.tsx`
  counts room positions in a table column, not a picture.

## 1. What exists today

- **No truck picture exists** in the kit or in any estate app (search terms under Rule sites).
- The packhouse has no dispatch code yet. M-01 will be the first caller, and M-02 the second (the delivery note).
- The kit's nearest relatives are `ActionTile` (a big tap target) and `StatTile` (server-renderable, no hook, words
  handed in). `TruckDiagram` follows both idioms.

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — Plain HTML, native buttons, Tailwind token classes. No new dependency. Renders on the server

- **No dependency.** `lucide-react` (already a dependency) gives the check and warning icons. No `package.json`
  dependency line moves.
- **No `"use client"` and no hook in `TruckDiagram.tsx`.**
  - The loading screen is a client component and passes `onSlotTap`. The delivery-note screen preview (and any read-only
    view) can render it from a server component with no `onSlotTap`, because then nothing interactive is drawn.
  - A server component cannot pass a function, so `onSlotTap` is only ever given by a client parent. This is the
    StatTile D-1 reasoning. `dropLabel` (D-11) is a function too; a server parent leaves it unset and gets the English
    default, or the packhouse renders the note preview from a client boundary — see R8.
- **Not Radix.** No Radix primitive is a "grid of spaces". Radix `ToggleGroup` is the nearest, but it is not a kit
  dependency, and a tap here is not a toggle: what a tap means (start a move, finish a move, open "Take off the truck")
  is the app's. Each tappable space is a **native `<button type="button">`**, which gives keyboard, focus and
  screen-reader behaviour for free. Nothing hand-rolls a Radix control.

### D-2 — The layout: two wide, numbered from the cab, drop blocks, in one pure function

- **New file `src/components/truck-diagram-layout.ts`** (the `keypad-entry.ts` / `multi-select-reading.ts` pattern),
  exported as `truckDiagramRows(positions, slots, standardPositions?)`. It returns rows:
  `{ row, cells: [left, right | null], overStandard, drop, dropEnd, startsBlock }`, each cell
  `{ position, state, label?, note?, drop?, showDrop, overStandard }`.
- **Geometry rules (unchanged from revision 1):**
  - Row `r` holds positions `2r-1` (left) and `2r` (right). Row 1 is at the cab. An odd last position leaves the right
    cell `null`, and no space is drawn there.
  - The number of spaces drawn is `max(positions, the highest valid slot position)`. **A pallet is never hidden**
    because `positions` was passed too small.
  - A slot with a position that is not a whole number ≥ 1 is ignored. If two slots share a position, the first wins.
  - A position with no slot is `empty`.
  - **A `taken` slot never carries a label.** The kit drops it even if the caller passes one (D-6).
  - A position past `standardPositions` is `overStandard`. With no `standardPositions`, nothing is.
  - `positions` that is negative, fractional or not a number is floored to a whole number ≥ 0.
- **Drop-block rules (new in revision 2, D-13):**
  - A slot's `drop` is kept only if it is a whole number ≥ 1; anything else is "no drop".
  - Walking rows from the cab, a row's **block drop** is its left cell's drop, else its right cell's drop, else the
    previous row's block drop (an undropped row — e.g. empty spaces the app gave no drop — stays in the block above it),
    else none.
  - A **block** is a run of consecutive rows with the same block drop. `startsBlock` is true on its first row.
  - **If the picture has fewer than two blocks, drop blocks are not drawn**: every row's `drop` is `null` and no row
    starts a block. A load on its own, or a trip of one drop, looks exactly as in revision 1.
  - With two or more blocks: `dropEnd` is `"cab"` on the first block's rows, `"doors"` on the last block's rows, and
    `null` in between.
  - A cell's `showDrop` is true when it has a drop and that drop differs from its row's block drop (computed before the
    fewer-than-two collapse). This marks the odd space in **a row shared by two drops** with its own drop tag.
  - **The kit never reorders, checks or "corrects" drops.** If an app puts drop 1 at the cab, the kit draws drop 1 at
    the cab, labelled by its end. The order is the app's rule (owner: "the app still decides each slot state and
    drop").
- **Why a separate exported function:** the delivery note is a React-PDF document (TA-DOC-001), which cannot draw a DOM
  component. M-02 draws its PDF picture from the **same rows**, so the numbering, the "taken has no number" rule, the
  over-30 split and the drop blocks live in one place for screen and paper (D-9).

### D-3 — The DOM shape and accessibility

- **Root:** a `<div>` (props spread, `className` merged by `cn`, `forwardRef<HTMLDivElement>`).
- **Inside, in reading order:**
  1. The cab block with `frontLabel` (visible text, read first).
  2. The body: one or more **sections**, each a run of rows. A new section starts at the first row, at every
     `startsBlock` row, and at the first over-standard row.
     - A section that starts a drop block opens with a **divider** `<p id=…>`: the visible `dropLabel(drop, dropEnd)`
       text between two rules, and wraps its list in `<div role="group" aria-labelledby=…>`. The id is derived from the
       root `id` prop or the block's drop and position (no `useId`, D-1).
     - A section that starts at the over-standard boundary opens with the warning `<p>` (`words.overStandard`, a
       warning icon `aria-hidden`). **The warning is words, not colour alone.**
     - Each section's spaces are an `<ol start={first position}>` laid out with `grid grid-cols-2`. DOM order is
       numeric order, which is also visual order (WCAG 1.3.2).
  3. The doors block with `backLabel`.
- Without drop blocks (D-2 collapse) and within a standard truck this is exactly revision 1's single `<ol>`.
- **Each space is an `<li>`.**
  - With `onSlotTap` and a state of `empty`, `filled` or `selected`: the `<li>` holds a `<button type="button">` that
    calls `onSlotTap(position)`.
  - A `taken` space is **never a button**, even with `onSlotTap`: it is another packhouse's space, and a button that
    does nothing is worse than no button.
  - Without `onSlotTap`: every space is a plain block, nothing is focusable.
- **The name of each space is its visible text,** with the state word in screen-reader-only text where it is not
  visible: "Position 7, 1INC2546-01", "Position 23, Empty", "Position 3, Taken", "Position 12, 1INC2546-06, Selected",
  and with a drop tag "Position 4, 1INC2546-01, Drop 2". The block's own drop is announced once by the group label, not
  repeated per space. This meets WCAG 2.5.3 Label in Name.
- **No `aria-pressed`.** Tap meaning is the app's, so the spaces are not toggle buttons. "Selected" is said in the name,
  and shown by a thicker border plus a check icon (not colour alone).
- **Focus:** `focus-visible:outline-none focus-visible:shadow-focus`, the kit idiom.
- **Keyboard:** one tab stop per tappable space (up to ~30). A roving-focus grid was considered and rejected: it is a
  hand-rolled composite widget, the riskier choice. Recorded as R2.

### D-4 — States: kit tokens only, never colour alone

| State | Screen | Print (black and white) |
|---|---|---|
| `empty` | `border-dashed border-border-strong bg-surface`, position number in `text-fg-subtle` | dashed border, number |
| `filled` | `border-accent bg-accent-subtle text-fg`, label bold `tabular-nums`, position small | solid 2 px border, label bold |
| `selected` | as filled, plus `border-2 border-fg` and a check icon | as filled (a print never has a selection in practice) |
| `taken` | `border-border bg-surface-sunken text-fg-muted`, a diagonal hatch from token colours, the word "Taken" plus `note` | dotted border, the word "Taken" plus note |
| over standard | `border-warning`; an empty one also `bg-warning-subtle`; the warning `<p>` in `text-warning-fg` | the warning `<p>` words; border unchanged |
| drop divider (new) | `font-extrabold text-fg`, two `border-t-[3px] border-fg` rules either side of the words | the same: black rules plus words, no colour needed |
| drop tag (new) | a small `border border-fg bg-surface text-fg` chip with `dropLabel(drop, null)` | the same chip, black |

- **Theme:** `bg-accent-subtle` / `border-accent` follow `data-theme="packhouse"` (teal) and DC/CRM yellow otherwise.
  The divider and tag use `fg`, so they read the same in every theme and on paper.
- **No hex in the component.** The hatch is an arbitrary value built from `var(--color-surface-sunken)` and
  `var(--color-surface-muted)`. No token file changes.

### D-5 — The "30" is the app's, passed in as `standardPositions`

- **The request says "may exceed 30".** The 30 is the packhouse's business value (`BATCH_PALLET_WARNING_AFTER = 30`,
  `ph src/shared/floor/batch.ts:30`; `packhouse.load_pallets()` in SQL). The kit holds no business values (README
  "Pure presentation only"; the `tokens.css` header rule).
- **So `standardPositions?: number` is an optional prop with no default.** The packhouse passes
  `standardPositions={BATCH_PALLET_WARNING_AFTER}`. Without it, nothing is over standard.
  - This keeps the 30 in one place in the estate, and leaves the kit honest for an app with a different standard truck.
  - On a truck trip the trip's limit is a hard limit (M-01 Q3). The app passes `positions = pallet_limit`, so no space
    past it ever exists. That is the app's rule, and the kit does not know about trips.
- An odd `standardPositions` would split a row; the over-standard section then starts at the first row holding an
  over-standard cell, and each cell keeps its own `overStandard` flag (the same row-boundary rule as drop blocks).

### D-6 — "Taken" never shows a pallet number (defence in depth)

- The real guard is the packhouse wall: `truck_positions_taken` returns positions and drop order only (M-01 §4.3).
- The kit **also** drops `label` on a `taken` slot (D-2). A caller mistake therefore cannot print another packhouse's
  pallet number on the floor screen or the note. A test pins it.
- **Revision 2:** a taken space's drop now travels in `drop`, not as "drop N" text in `note`, so it lands in the right
  block. `note` is still shown for any state when the app writes one.

### D-7 — Sizes and widths

- **Every space is at least 48 px tall** (`min-h-12`), and at least 56 px (`min-h-14`) on the tablet surface. At 360 px
  each column is about 150 px wide, so the target is far over 48 px wide.
- **Width:** the root is `w-full max-w-md mx-auto` (448 px), and `max-w-lg` on tablet. A two-wide truck stretched across
  1440 px would be misleading, and the caller can widen it with `className`. The root sets `min-w-0`, and labels,
  dividers and tags use `[overflow-wrap:anywhere]`, so nothing pushes the page sideways at 360 px (a long Portuguese
  divider such as "Entrega 2 · descarregada por último" wraps under its rules).
- **Text:** position `text-xs`; label `text-sm font-bold sm:text-base`; note `text-xs`; divider `text-sm`; tag
  `text-[0.6875rem]`.
- **Look C only:** from `lg` the picture lies on its side (cab on the left), using `lg:grid-flow-col lg:grid-rows-2`
  with the same DOM order; sections sit side by side and the dividers become upright rules with the words on top
  (`lg:border-l-[3px]`). D-3 holds unchanged.

### D-8 — Print

- Tailwind `print:` (Tailwind 3.4 in DC and the packhouse):
  - the root gets `print:break-inside-avoid`;
  - spaces shrink to `print:min-h-8` so 30 spaces fit beside the rest of a page;
  - backgrounds drop out (browsers do not print them by default), so the print column of D-4 uses borders and words only;
  - the drop dividers and tags are black rules and words already, so they print unchanged;
  - focus and hover styles never print.
- **This covers printing a screen** (the browser's own print). The PDF delivery note is D-9.

### D-9 — The delivery note PDF draws from `truckDiagramRows`, not from the DOM component

- TA-DOC-001 requires React-PDF on the server. React-PDF draws its own `View`/`Text` elements and cannot render a DOM or
  Tailwind component.
- **Adding React-PDF to the kit was rejected.** It would add a dependency every consumer installs when it bumps its pin,
  and the kit would hold a second drawing of the same truck in a different engine.
- **So the kit gives M-02 the layout** (`truckDiagramRows`, D-2). M-02 maps the rows to React-PDF boxes in the
  packhouse's own note template.
  - The numbering, the "taken has no number" rule, the over-standard split and **the drop blocks** (`drop`, `dropEnd`,
    `startsBlock`, `showDrop`) are shared, so screen and paper cannot disagree.
  - The colours, fonts and divider words on paper are the note's own (it passes the same EN/PT words).
- This is brief (b), last bullet.

### D-10 — The look is the owner's pick. The API and accessibility are the same for all three

| Look | Layout |
|---|---|
| **A** (recommended) truck outline | A rounded cab block with `frontLabel`, the spaces and drop dividers inside a bordered truck body, a door bar with `backLabel`. Each space shows its position small top-left and the pallet number large |
| **B** plain grid with row numbers | No outline: a `frontLabel` bar, a narrow gutter on the left with row numbers 1, 2, 3…, the spaces, drop dividers across, a `backLabel` bar |
| **C** turns on wide screens | A below `lg`. From `lg` the truck lies on its side, cab on the left, two rows of spaces running to the doors on the right, upright drop dividers |

- **Why A.** It reads as a truck at a glance on a phone in a loading bay. It is the same shape on every screen and on the
  printed note, so a driver sees one picture. Its body frames the drop blocks cleanly. It needs no extra row numbers.
- **B** is denser. Its row gutter duplicates the position numbers, adding a second numbering to read.
- **C** suits a desk screen, but turns the picture on a laptop the tablet-trained dispatcher may also use. Its print
  form (lying) differs from the phone form (standing). At 60 spaces it needs about 1320 px wide.
- **Only class strings change between looks** (plus the row gutter in B). No look is a prop.

### D-11 — Words are handed in, with English defaults

- `frontLabel` and `backLabel` are **required strings** (the request says the caller supplies EN and PT). The
  packhouse passes "Cab" / "Doors" and the Portuguese pair.
- `words?: Partial<TruckDiagramWords>`, with keys `diagram` ("Truck loading positions"), `position` ("Position"),
  `empty` ("Empty"), `taken` ("Taken"), `selected` ("Selected") and `overStandard` ("More than a standard truck"). Each
  falls back with `??` per key (the CR-024 D-3 lesson). No default object is exported (the BarChart D-9 rule).
- **New in revision 2: `dropLabel?: (drop: number, end: "cab" | "doors" | null) => string`** — the divider words and the
  tag words (the tag is called with `end = null`). A function because the words carry a number and Portuguese word
  order is the app's (the BarChart `valueText` precedent). The default is English:
  `"Drop 2 · unloaded last"` (cab end), `"Drop 1 · unloaded first"` (doors end), `"Drop 2"` (middle, tag). "Unloaded
  last / first" is a fact of the end of a back-loaded truck, not of the drop number, so the default never contradicts
  the app's order.

### D-12 — The names

- Runtime: `TruckDiagram`, `truckDiagramRows`.
- Types: `TruckDiagramProps`, `TruckSlot`, `TruckSlotState`, `TruckDiagramWords`, `TruckDiagramRow`, `TruckDiagramCell`,
  and (revision 2) `TruckDropEnd`.
- **No kit export begins with `Truck`/`truck` today** (grep `src/`: only a comment in `DragBoard.tsx:14`).
- No estate app declares or imports `TruckDiagram`, and no estate app re-exports the kit with `export *` (CR-026 §6,
  re-checked at build).

### D-13 — Drop blocks (new in revision 2)

- **What the owner ruled:** reefers load from the back only, so the LAST drop sits at the cab and the FIRST drop by the
  doors; the picture shows blocks per drop with a clear labelled divider; Cab on top, Doors at the bottom; the app
  decides every slot's state and drop, the kit only draws.
- **Numbering does not change.** Position 1 is still at the cab (UX-SCR-009, DLC-DEC-272). Only the grouping is new.
- **Blocks are by row**, never mid-row: a divider that cut a row in half would break the two-wide geometry
  (position 6 would slide under position 5). A row shared by two drops stays in the block of its left cell, and the odd
  space carries a drop tag (D-2 `showDrop`). Brief (b) asks the owner to confirm.
- **One drop, no lines** (D-2 collapse). A standalone load or a one-drop trip has nothing to separate; a lone "Drop 1"
  heading would be noise. Brief (b) asks the owner to confirm.
- **Every block is labelled,** including the first one under the cab, so the reader never has to infer which drop the
  top block is.
- **Empty spaces:** the app may give an empty space a drop (a planned space). An empty row with no drop stays in the
  block above (the doors-end empty rows of a trip still loading read as part of the last-loaded block until the app
  says otherwise).
- **Not the kit's:** which drop is which, whether the order is right, and how positions are allocated per drop. The
  packhouse owns that (S3, R9).

## 3. The component and the helper

```ts
// src/components/truck-diagram-layout.ts (pure, no React)
export type TruckSlotState = "empty" | "filled" | "taken" | "selected";
export type TruckDropEnd = "cab" | "doors";
export interface TruckSlot {
  readonly position: number;
  readonly label?: string;   // the pallet number; dropped for "taken"
  readonly state: TruckSlotState;
  readonly note?: string;    // e.g. "picked · reprint label"
  readonly drop?: number;    // the drop this space belongs to (the app's); whole number ≥ 1, else ignored
}
export interface TruckDiagramCell extends TruckSlot {
  readonly overStandard: boolean;
  readonly showDrop: boolean;                                  // the odd space in a row shared by two drops
}
export interface TruckDiagramRow {
  readonly row: number;                                        // 1 = behind the cab
  readonly cells: readonly [TruckDiagramCell, TruckDiagramCell | null];
  readonly overStandard: boolean;                              // either cell over standard
  readonly drop: number | null;                                // block drop; null when fewer than two blocks
  readonly dropEnd: TruckDropEnd | null;                       // "cab" first block, "doors" last block
  readonly startsBlock: boolean;
}
export function truckDiagramRows(
  positions: number, slots: readonly TruckSlot[], standardPositions?: number,
): TruckDiagramRow[];

// src/components/TruckDiagram.tsx (no "use client", no hook)
export interface TruckDiagramWords {
  readonly diagram: string; readonly position: string; readonly empty: string;
  readonly taken: string; readonly selected: string; readonly overStandard: string;
}
export interface TruckDiagramProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly positions: number;
  readonly slots: readonly TruckSlot[];
  readonly onSlotTap?: (position: number) => void;   // absent → read-only, nothing focusable
  readonly frontLabel: string;                        // "Cab"
  readonly backLabel: string;                         // "Doors"
  readonly standardPositions?: number;               // no default (D-5)
  readonly words?: Partial<TruckDiagramWords>;
  readonly dropLabel?: (drop: number, end: TruckDropEnd | null) => string;   // D-11
}
```

- **Header comments** in the StatTile style, stating D-1 (no client directive, native buttons, not Radix), D-2 (one
  layout function), D-3 (reading order), D-5 (the app's standard), D-6 (taken has no number), D-9 (the PDF uses the
  rows) and D-13 (drop blocks: the kit draws, the app decides; "drop" here is a delivery stop, not drag-and-drop — R7).
- **Size:** about 210 lines for the component, and about 110 for the helper.
- Every `slots` value the request names is honoured. `drop` on a slot is the owner's revision. `standardPositions`,
  `words` and `dropLabel` are the only other additions to the §6.3 proposal. All are optional, and §6.3's example call
  compiles unchanged.

## 4. Barrel, inventory, version, README

- **`src/components/index.ts`:** a new block after `StatTile` with a 3-line comment citing CR-028 / UX-THM-004 and
  "ADDITIVE: new names only — declared in the export inventory", then the runtime names `TruckDiagram` and
  `truckDiagramRows`, and the seven types. `src/index.ts` already does `export *`, so it needs no edit.
- **`tests/components/DragBoard.additive.test.tsx`:** `ADDED_SINCE_011` gains `"TruckDiagram"` and
  `"truckDiagramRows"` under `// CR-DESIGN-SYSTEM-028`.
- **`package.json`:** `version` **0.10.0 → 0.11.0** (additive minor). The stale description is left alone, as at CR-021
  to CR-026.
- **`README.md`:** a Changelog **0.11.0** line, and a `## Truck loading picture` section. The section holds the
  packhouse example with Portuguese words (the kit's "stories"; there is no Storybook) and covers:
  - `standardPositions` comes from the app;
  - `taken` never shows a label;
  - **drop blocks:** the app sets `drop` per slot; on a back-loaded reefer the last drop is at the cab and the first by
    the doors; the kit draws what it is given and never reorders; one drop draws no lines; a shared row tags the odd
    space; `dropLabel` for EN/PT;
  - no `onSlotTap` means read-only, which suits server rendering and print;
  - the PDF note maps `truckDiagramRows`;
  - Tailwind `content` must scan the package `src/`.
  - **The README example puts drop 2 at the cab and drop 1 by the doors** (owner REVISE).
- **A runnable example page with every state** is committed as the browser-proof fixture under
  `runs/change-NN/evidence/browser-proof/` (the CR-010 pattern). Redrawn in revision 2 — **no example puts drop 1 at
  the cab**:
  - a shared truck: 1–6 taken **drop 2** (cab end, "unloaded last"), 7–20 ours filled **drop 1** with one selected,
    21–30 empty (doors end, "unloaded first");
  - three drops with shared rows: 1–3 taken drop 3, 4–7 drop 2, 8–10 drop 1 (tags on 4 and 8);
  - a 34-pallet standalone load (one drop, no lines, the over-30 warning);
  - an odd count (23);
  - zero positions;
  - a long Portuguese label and Portuguese divider words;
  - packhouse teal, DC yellow, and print emulation.

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `0e9ed06`. The handover records 729/729 at CR-026.
2. **Unit tests for the pure layout, `tests/components/truck-diagram-layout.test.ts`.** One case per rule:
   - 22 positions give 11 rows; row 1 is [1, 2] and row 11 is [21, 22];
   - 23 positions give a last row of [23, null];
   - 0 positions, a negative number, `NaN` and `2.7` give 0, 0, 0 and 2 spaces respectively;
   - a slot at 35 with `positions` 30 draws 36 spaces (one row of 35, 36), and nothing is hidden;
   - invalid positions (0, -1, 1.5) are ignored;
   - for a duplicate position, the first slot wins;
   - a `taken` slot with a `label` comes back with no label and keeps its note and drop;
   - with `standardPositions` 30 and 34 positions, 31–34 are over standard and 1–30 are not; without it, none are;
   - **drops (revision 2), every fixture with the last drop at the cab:**
     - 1–6 drop 2, 7–20 drop 1, 21–30 no drop: rows 1–3 `drop 2, dropEnd "cab"`, row 1 `startsBlock`; rows 4–15
       `drop 1, dropEnd "doors"`, row 4 `startsBlock`; no cell `showDrop`;
     - all slots drop 1, or no drops at all: every row `drop null`, `dropEnd null`, no `startsBlock`, no `showDrop`;
     - three drops 3/2/1 with rows [3:d3, 4:d2] and [7:d2, 8:d1]: three blocks, the middle `dropEnd null`, cells 4 and 8
       `showDrop`;
     - a drop that appears only as the odd cell of a shared row: one block (collapse), but that cell still `showDrop`;
     - `drop` 0, -1, 1.5, `NaN` are ignored;
     - **the kit does not reorder:** drop 1 at 1–4 and drop 2 at 5–8 gives drop 1 `dropEnd "cab"` (the kit draws what it
       is given);
   - the input array is not mutated.
3. **Unit tests for the component, `tests/components/TruckDiagram.test.tsx`** (happy-dom, Testing Library, axe-core,
   all present):
   - **Order:** `textContent` reads front label, positions 1…n in order, back label. One `<ol>` without a standard or
     blocks; with a standard and over-standard spaces, `<ol>`, the warning `<p>`, then `<ol start=31>`.
   - **Drop blocks:** with the 2/1 fixture, `textContent` reads "Cab", "Drop 2 · unloaded last", 1–6, "Drop 1 · unloaded
     first", 7–30, "Doors"; each block is a `role="group"` named by its divider; `<ol start=7>` for the second block; a
     `dropLabel` override (Portuguese) replaces both dividers and the tag; the shared-row tag is in the space's name;
     one-drop and no-drop renders have no group and no divider.
   - **Interaction:** with `onSlotTap`, tapping empty, filled and selected spaces calls it with the position (user-event,
     plus `Enter` and `Space` on a focused button). A taken space has no button and a tap calls nothing.
   - **Read-only:** without `onSlotTap` there are no buttons and no focusable element.
   - **Names:** each button's accessible name is "Position N" plus the label or the state word plus the note, and
     selected includes `words.selected`.
   - **Taken has no number:** a taken slot passed a `label` does not show it in the text.
   - **Never colour alone:** the selected space has the check icon (`aria-hidden`) and the word; the over-standard
     warning and the drop dividers are `<p>`s with words.
   - **Tokens only:** a guard reads the file and finds no `#` hex colour and no `rgb(`.
   - **Touch size:** every space carries `min-h-12`, and the tablet `min-h-14` class.
   - **Words:** an override works, and `{ empty: undefined }` falls back to the default.
   - **Server render:** `renderToString` without `onSlotTap` (and without `dropLabel`) succeeds, drops included. A guard
     asserts no `"use client"` and no `use[A-Z]` hook call.
   - **Spread and ref:** `className` is merged, `data-*` passes through, and the ref reaches the root `div`.
   - **axe:** 0 violations for read-only, interactive, shared (two drops), three drops, over-standard and zero cases.
4. **The additive claim:**
   - `git diff 0e9ed06 --stat -- src/` shows exactly `components/TruckDiagram.tsx` (new),
     `components/truck-diagram-layout.ts` (new) and `components/index.ts` (one new block).
   - The inventory is green with exactly two declared runtime additions.
   - Every existing spec passes **unedited** apart from those inventory lines, and the `.snap` is unchanged.
   - `pnpm typecheck` is clean.
5. **Visual check in a real browser.** It uses the committed Edge driver
   (`runs/change-10/evidence/browser-proof/proof.mjs`), DC's `playwright-core` + `tailwindcss` read-only, and a scratch
   fixture outside the estate tree.
   - Widths: **360, 390, 768 (`data-surface="tablet"`) and 1440 px.** Colour sets: packhouse teal and DC yellow.
   - Assertions:
     - `document.documentElement.scrollWidth === innerWidth`;
     - every space box is ≥ 48 px tall (≥ 56 on tablet) and ≥ 48 px wide;
     - row 1 sits directly under the cab block, position 1 is left of position 2, and the doors block is last;
     - **the "Drop 2 · unloaded last" divider sits above position 1 and below the cab; the "Drop 1 · unloaded first"
       divider sits between positions 5–6 and 7–8;**
     - a long Portuguese label and a long Portuguese divider wrap inside the picture;
     - axe in the page shows 0 violations, including contrast.
   - **Print:** `emulateMedia({ media: "print" })` at A4 width. The 30-space picture with two blocks is no taller than
     about 600 px, and each state and each divider is told apart by border style and words in a greyscale screenshot.
   - Frames go to `runs/change-NN/evidence/frames/`.
6. **DC + CRM re-check** (UX-THM-004 / QA-REG-002, the CR-015 method `runs/change-12/evidence/dc-crm-recheck.md`):
   - fresh clones in `%TEMP%`;
   - throwaway branches whose only diff is the kit pin, set to this branch's head;
   - each app's unit suite, typecheck, build and the CR-015 screenshot set, before and after.
   - **This also discharges the re-checks owed by CR-025 and CR-026**, because this head contains `BarChart` and
     `StatTile`. The record says so.
   - Expected: pixel-zero and suite-identical. No pin moves on any app's `main`, and estate folders are not touched. Any
     pre-existing red is recorded with evidence and not fixed.
7. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant
   must turn a **named** spec red:
   - M1: the right cell takes `2r-1`. The order spec goes red.
   - M2: taken keeps its label. The taken spec goes red.
   - M3: taken becomes a button. The interaction spec goes red.
   - M4: `overStandard` uses `>=`. The standard spec goes red.
   - M5: the space count ignores higher slots. The never-hidden spec goes red.
   - M6: `min-h-12` is removed. The touch spec goes red.
   - M7: the state word is dropped from the name. The names spec goes red.
   - M8: the words merge by spread. The `{ empty: undefined }` spec goes red.
   - M9: `"use client"` plus `useId` is added. The server guard goes red.
   - M10: a default of 30 is added to `standardPositions`. The "without it, none" spec goes red.
   - M11 (rev 2): the fewer-than-two-blocks collapse is removed. The one-drop spec goes red.
   - M12 (rev 2): `dropEnd` assigns `"cab"` to the last block. The 2/1 fixture spec goes red.
   - M13 (rev 2): an undropped row starts its own block instead of inheriting. The 21–30 doors-end spec goes red.
   - M14 (rev 2): the kit sorts blocks by drop number. The "does not reorder" spec goes red.
   - M15 (rev 2): `showDrop` is never set. The shared-row tag spec goes red.
8. **Other checks:**
   - `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`;
   - `quality-sensors.mjs`, LF-normalised;
   - `prettier --check --print-width 100` on the touched files.

## 6. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| **DC** (pin `5c14f377`, kit 0.7.0) | No existing kit file's code changes. The only `index.ts` edit is a new block. DC re-exports the kit by name, so the new names enter no DC module. DC has no truck picture of its own |
| **CRM** (pin `54597acd`) | Renders only existing kit components; no `export *`, no `TruckDiagram` (CR-026 grep, re-run at build). Re-checked anyway (§5.6) |
| **RMS**, **Org Admin**, **Hub**, **Manga Verde** | Same grep. They gain the names only when they move their pin |
| **Packhouse** (pin `0e9ed064`) | Has no dispatch code yet. M-01 adopts `TruckDiagram`, and M-02 `truckDiagramRows`, after pinning this change's **merged** sha |
| Kit tests | All pass **unedited**, apart from the two inventory lines |

Revision 2 adds no existing-file change: `drop`, `dropLabel` and the block fields live only in the two new files.

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/TruckDiagram.tsx` (new) | The component, types and header comment (§3), sections and dividers | 210 |
| `src/components/truck-diagram-layout.ts` (new) | `truckDiagramRows`, the block rules and its types | 110 |
| `src/components/index.ts` | One new export block with a 3-line comment | 15 |
| `README.md` | Changelog 0.11.0, and the "Truck loading picture" section with drop blocks | 60 |
| `package.json` | `version` 0.11.0 | 1 |

Paper trail (not in the estimate):
- tests `tests/components/TruckDiagram.test.tsx` and `truck-diagram-layout.test.ts`, plus the inventory lines;
- the browser fixture, proof and frames; the DC + CRM re-check record; the mutation battery;
- the decision-log entry `CR-DESIGN-SYSTEM-028` (D-1 to D-13);
- the refreshed handover and active milestone;
- `known-issues.md`, with what the packhouse owes.

The archive goes in the slot the conductor names; never overwrite. No migration (no database). **No new dependency. No
consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written, here or
in any sibling repo.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The seams are the package hand-off and the
presentation hand-offs inside the component. **The kit writes the control. Each app reads it only when it moves its own
pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `TruckDiagram` → **packhouse M-01** loading screen (FS-10) | Kit | Packhouse EPIC-006-M-01 | Adds the control UX-THM-004 requires, merged before the screen (M-01 §1 build-start check) | **M-01** pins the merged sha, passes `standardPositions={BATCH_PALLET_WARNING_AFTER}` on a standalone load, `positions = pallet_limit` on a trip, each slot's `drop` (taken ones from `truck_positions_taken`'s drop order), `frontLabel` "Cab" / `backLabel` "Doors" and EN/PT `words` + `dropLabel`. Its §6.3 call and §3.2 "taken · drop N" note move to the `drop` field. Not done here |
| S2 | `truckDiagramRows` → **packhouse M-02** delivery note PDF (React-PDF) | Kit (layout) | Packhouse M-02 note template | One numbering and one set of drop blocks for screen and paper (D-9) | **M-02** maps the rows (incl. `drop`, `dropEnd`, `startsBlock`, `showDrop`) to React-PDF boxes and passes the same `standardPositions` and words |
| S3 | Slot data: app → kit | **App** decides each position's state, pallet number, note **and drop** | Kit draws them | The kit never decides a state or a drop and never reorders blocks. It only drops a `taken` label (D-6) | **The packhouse owns "last drop at the cab"**: its position allocation (M-01 §4.3, "lowest free number") must put the last drop's pallets nearest the cab (R9). The packhouse wall (`truck_positions_taken`, numbers and drop order only) stays the real guard on taken |
| S4 | Tap: kit → app | Kit reports `onSlotTap(position)` | **App** decides what a tap means (move, take off) and who may do it | The kit holds no permission or move logic | None |
| S5 | Theme colour and words: app → kit | **App** (`data-theme`, `frontLabel`, `backLabel`, `words`, `dropLabel`) | Kit | No token file changes | None |
| S6 | Same names → **DC, CRM, RMS, Org Admin, Manga Verde, Hub** | Kit | Each app, only if it imports them | Nothing they render changes (§6) | None |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the twentieth change to note
it, and the decision is the owner's. S1–S6 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The picture decides nothing about what may be loaded, by whom, how many, or in which
order. It **draws** four packhouse rules, and each stays owned and spelled in the packhouse:

1. **"A standard truck is 30 pallets; past it, warn, never block"** (PRD-FLR-009, M-01 Q3). Today: packhouse code only.
   After: the same, because the kit takes it as `standardPositions` with **no default** (D-5), so the kit spells no 30.
2. **"Another packhouse's spaces show as taken, without pallet numbers"** (M-01 Q4; the packhouse wall). Today: M-01
   plan only, no code yet. After: the packhouse spells it in its read (`truck_positions_taken`), and the kit adds a
   presentation guard that drops a `taken` label (D-6). That is defence in depth, not a second owner of the rule.
3. **"Two wide, numbered from the cab to the doors"** (DLC-DEC-272, UX-SCR-009). Today: documents only. After: the
   geometry lives in `truckDiagramRows` (kit) and is used by both the screen and the note (D-9). The packhouse's
   **position numbers** (`loading_position`, the next free one) stay in its SQL.
4. **(Revision 2) "Reefers load from the back: the last drop sits at the cab, the first drop by the doors"** (owner
   ruling 2026-11-07). Today: the owner's REVISE only; the M-01 plan says "loading order across packhouses is the
   drivers' business" (`:169`) and allocates the lowest free number (`:166-167`). After: still the packhouse's (and the
   order centre's drop order). The kit **draws** blocks from the app's `drop` values and **never reorders or checks**
   them (D-2, M14). Its only words on it are the default divider text "unloaded last" at the cab end and "unloaded
   first" at the doors end, which describe the truck's ends, not the drop numbers — so the kit spells no drop-order rule.

| Site | Change / leave | Reason |
|---|---|---|
| ph `src/shared/floor/batch.ts:30` `BATCH_PALLET_WARNING_AFTER = 30` | leave (read-only repo) | The one home of the 30. M-01 passes it to the kit |
| ph `supabase/migrations/20261105100000_load_changes.sql:488,650` `packhouse.load_pallets()` / `load_full` | leave (read-only repo) | The order-side limit, a different rule (a load's ordered pallets); not touched |
| ph `src/server/errors/catalogue.ts:102` `load_full` | leave (read-only repo) | Same; order-side |
| ph `runs/current/logic-plan/EPIC-006-M-01.md:68,69,166-173,243-245` | leave (read-only repo) | The packhouse plan the kit follows; §6.3 gains optional props (`drop`, `standardPositions`, `words`, `dropLabel`), recorded in S1 |
| ph `runs/current/logic-plan/EPIC-006-M-01.md:97-98` "taken · drop N" | leave (read-only repo) | Owed by M-01's own revision: the drop moves to the slot's `drop` (S1) |
| ph `runs/current/logic-plan/EPIC-006-M-01.md:166-169` lowest free position; "loading order … drivers' business" | leave (read-only repo) | Rule 4's home. Owed by M-01's own revision (S3, R9); the kit cannot and must not enforce it |
| ph `src/` dispatch code | none exists | Grep `drop_order|drop order|positions_taken`: no match |
| ph `source-documents/active/UX_SCREEN_SPECIFICATION.md:110,268,665` | leave (read-only repo) | The source of the two-wide, cab-to-doors numbering |
| Kit `src/` | **new** `truck-diagram-layout.ts` | The geometry, the taken-label drop and the drop-block grouping, in one place |
| Kit `src/components/DragBoard.tsx`, `DropTarget.ts`, `DragGrip.tsx` "drop" | leave | Drag-and-drop, a different meaning of the word (R7); no delivery rule |

**Search terms used:**
- Kit `src/`: `\b(Truck|truck)\w*|\bSlot\w*\b|TRUCK`; revision 2: `(?i)\bdrops?\b|unload|reefer|\bcab\b|\b(Truck|truck)\w*`.
- Packhouse `src/`: `(?i)truck|PALLETS_PER|STANDARD_LOAD|over_?30|> ?30\b|MAX_PALLETS`; revision 2:
  `(?i)drop_order|drop order|positions_taken`.
- Packhouse `src/**/*.ts(x)` and `supabase/migrations/*.sql`: `load_full|LOAD_PALLET|PALLETS_PER_LOAD|BATCH_.*30|= 30\b`.
- Packhouse `supabase/migrations`: `(?i)truck|PALLETS_PER|>\s*30\b|30 pallets`.
- Packhouse `source-documents`: `(?i)UX-SCR-009|OQ-39|UX-SCR-008|DLC-DEC-272|front to back|two wide|delivery note.*diagram`.
- Packhouse whole repo (revision 2): `(?i)unloaded|reefer|last drop|drop block`; M-01 plan: `(?i)drop|cab|reefer|doors`.
- DC `{src,components,app,lib}/**/*.{ts,tsx}`: `(?i)truck ?diagram|TruckDiagram|TruckLayout|PalletGrid|pallet[_ ]position|loadPlan`.
- Packhouse and DC `package.json`: `tailwind|react-pdf|"@bananaworld/design-system"`.

## 9. Residuals and open questions

- **Owner pick:** look A, B or C (D-10). The recommendation is A.
- **Owner confirm (rev 2):** a truck with one drop shows no drop lines (D-13).
- **Owner confirm (rev 2):** a row shared by two drops stays in the cab-side block and the odd space gets a drop tag
  (D-13). If the owner prefers the row to join the doors-side block instead, only the block-drop rule in
  `truckDiagramRows` changes (right cell before left), before build.
- **Owner confirm:** space 1 is on the left behind the cab, and 2 on the right (D-2). If the owner says the other way,
  only the cell order in `truckDiagramRows` flips, before build.
- **Owner confirm:** the PDF delivery note draws its own copy from the shared layout (D-9).
- **R1 — The API grows by optional props** over M-01 §6.3 (`drop` on a slot, `standardPositions`, `words`,
  `dropLabel`). The §6.3 call still compiles. M-01 must pass `standardPositions` to get the over-30 warning and `drop`
  to get blocks. That is written into S1, and the packhouse is told in `known-issues.md`.
- **R2 — Keyboard:** up to ~30 tab stops through a full truck. The loading screen is touch-first (FS-10, tablet). A
  roving-focus grid can be added later as an additive change if a keyboard user needs it.
- **R3 — DC yellow `bg-accent-subtle`** (`#fef3c7`) behind dark text passes contrast. The yellow `border-accent` is
  decoration only. Filled versus empty is also told apart by solid versus dashed border and by the pallet number.
- **R4 — Print emulation is not a printer.** The proof uses print media emulation and a greyscale screenshot. The
  delivery note's real paper path is M-02's (React-PDF).
- **R5 — The re-check (§5.6) can come back red on an app's `main`** for reasons outside this change. It would then be
  recorded with evidence, as at CR-015.
- **R6 — Version collision.** No CR-DESIGN-SYSTEM-027 plan exists in this repo. If one merges first with 0.11.0, this
  change takes the next minor at build. That is a version-line edit only.
- **R7 (rev 2) — The word "drop" already means drag-and-drop in the kit** (`DragBoard`, `DropTarget`). The new field is
  `drop` on `TruckSlot` only, and the type `TruckDropEnd` is prefixed; no new export is named `Drop…`. The header comment
  says "drop = a delivery stop" so a reader of the kit is not misled.
- **R8 (rev 2) — `dropLabel` is a function**, so a server component cannot pass it (as with `onSlotTap`). A server-side
  preview gets the English default; the packhouse note preview, if rendered on the server in Portuguese, either renders
  through a small client wrapper or (the expected path) is the React-PDF note itself, which uses the rows (D-9). If the
  build finds the packhouse needs server-rendered Portuguese dividers, an additive `dropWords` string-template prop can
  follow; it is not added now (simplification gate).
- **R9 (rev 2) — The packhouse M-01 plan does not yet carry the reefer ruling.** Its §4.3 allocates the lowest free
  position and calls cross-packhouse loading order "the drivers' business". Lowest-free is correct only if loads are
  loaded last-drop-first. The kit cannot fix that and must not: it is M-01's own revision (S3). Recorded for the
  packhouse in `known-issues.md`.
- **Standing, carried:**
  - no cross-system register;
  - no CR-008 decision-log entry;
  - 4 inert `ignoreGhsas`;
  - OQ-8;
  - the `.snap` CRLF artefact (do not stage);
  - `prettier --print-width 100`;
  - the gitleaks scan check (K-1);
  - the CR-025 and CR-026 mutation batteries.

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover. The packhouse EPIC-006-M-01 build-start check is
  then met.
- Build note for M-01:
  - pin the merged sha;
  - pass the truck's positions (the trip's `pallet_limit`, or `max(30, live pallets)` standalone);
  - pass `standardPositions={BATCH_PALLET_WARNING_AFTER}` on a standalone load only;
  - pass each slot's `drop` (taken slots from `truck_positions_taken`'s drop order, no label);
  - allocate positions so the last drop is nearest the cab (R9) — the kit only draws;
  - mark the first tap of a move `selected`;
  - pass `frontLabel` "Cab" / `backLabel` "Doors", EN/PT `words` and `dropLabel`.
- Build note for M-02: map `truckDiagramRows` (with the block fields) to the React-PDF note.
- DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins.

## 11. Not an epic

One new presentational component, one pure layout function, one barrel block, a changelog and a version. The drop
blocks add grouping to the same two files. It touches no service, integration, permission model or data. I cannot name
five milestones this decomposes into. Its adoption is two milestones of the packhouse's own epic.
