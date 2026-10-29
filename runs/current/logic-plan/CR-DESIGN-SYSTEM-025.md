# CR-DESIGN-SYSTEM-025 — a shared horizontal `BarChart` in the kit — Logic Plan

> Raised by owner ruling 2026-10-29 for the packhouse end-of-shift screen (bananaworld-ph EPIC-004-M-03, layout B;
> finding E4-F21). **This was a planning session only. No feature code was written.** `bananaworld-dc` and every other
> estate app were only read. Base: `main` @ `964160b` (CR-DESIGN-SYSTEM-024, PR #43, kit **0.8.0**).

<!-- OWNER-BRIEF-START -->

**What you'll get.** One small bar chart that every app can use, first on the packhouse end-of-shift screen for the class, size and packaging-group splits. Each line shows a name, a bar, the amount and its share, with an optional total underneath. Before anything is packed, each line shows a dash and no bar. It takes each app's own colour (packhouse teal), reads well on phone, tablet and desk screen, and a screen reader reads every figure aloud. It is ready for a dark look, though no app has one yet.

**Please pick a look.**
- **A.** Name, bar and figures on one line, like the end-of-shift drawing you have already seen.
- **B (recommended).** Name and figures on top, with the bar underneath across the full width. It looks the same on a phone.
- **C.** The figures sit at the end of each bar.

**Please also confirm:** the screen gives the chart the exact figures it prints, so the chart always matches the packout table.

**Not included.** The packhouse screen itself, which comes in its own change after this one. The charts DC and Manga Verde already draw for themselves stay as they are. No line, column or pie charts.

**Risks.** None for the live apps. Nothing they show changes, and each app gets the chart only when it chooses to update.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`. The next estate session is due **2027-01-10**, so
  it is not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (searched). That has been
  the standing finding since CR-013. The rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **No plan exists yet for this CR**, so this is a fresh plan, not a revision. No owner responses are recorded.
- **No clarify round was used.** The request settles scope, states, accessibility, widths and the "no dependency" rule.
  The owner has two things left to settle: the look (a mockup pick) and a confirmation that the screen supplies the
  printed figures (brief (b), D-3).
- **Read in this repo:**
  - `src/components/index.ts` (whole), `src/lib/tokens.css` (whole), `src/lib/themes/packhouse.css`,
    `src/lib/series-colours.ts` and `src/lib/formatters.ts`.
  - `src/components/ActionTile.tsx` (the house idiom for a new primitive), the `[[data-surface=tablet]_&]` and `sr-only`
    usages across `src/components/` (grep), and the `warning` classes in `StatusBadge.tsx` / `DocumentHeader.tsx`.
  - `package.json` and `README.md` (whole).
  - `tests/components/DragBoard.additive.test.tsx` (the export inventory).
  - The CR-024 plan and estimate (format precedent) and `runs/change-12/evidence/dc-crm-recheck.md:1-40` (the CR-015
    re-check method).
- **Read in bananaworld-ph (read only):**
  - `runs/epic-04/findings-register.md:29` (E4-F21) and `runs/current/milestone-brief.md:10-34`.
  - `source-documents/active/UX_SCREEN_SPECIFICATION.md:202,321-322,490,563-564` (UX-THM-004, UX-DSH-002/003).
  - `AI_SOFTWARE_QUALITY_GOVERNANCE_STANDARD.md:120-122,252` (QG-CEN-002/003/004, S2) and
    `TESTING_QA_UAT_PLAN.md:198` (QA-REG-002).
  - `runs/current/mockups/EPIC-004-M-03/generate.mjs:47-55,152-157,184-185,276-281`, the approved chart markup and data.
  - `package.json:39` (pin `820c980`, Tailwind `^3.4`) and `tailwind.config.ts:14` (`darkMode: ["class"]`; no dark
    tokens found).
- **Read in DC (read only):**
  - `src/components/charts/BarChart.tsx` (whole) and `LineChart.tsx:1-26`.
  - `src/components/fleet/CostToServePanel.tsx:125-149` and `src/components/ui/index.ts:1-4,195-197`.
  - `package.json:57,90` (pin `5c14f377`, Tailwind `^3.4`) and the header comments of the chart-like files in §1.2.
- **Read in Manga Verde (read only):** `components/incentives/MilestoneColumns.tsx:1-30` and
  `components/receiving/BoughtVsWeighed.tsx:16-22`.

## 1. What exists today

### 1.1 The kit

The kit has no chart. `SERIES_COLOURS` (`src/lib/series-colours.ts`, CR-DC-247) is a categorical palette for maps and
lines. It is not a chart, and this change does not use it (D-6).

### 1.2 Page-local charts in the estate: listed, NOT changed here

Found by searching (search terms are under Rule sites):

| App | File | What it is | Used at |
|---|---|---|---|
| DC | `src/components/charts/BarChart.tsx` | SVG horizontal bars. Scaled to the **largest** value, prints a value label, no percentage, `role="img"` with an `aria-label` and no data table behind it | `fleet/CostToServePanel.tsx:135` (cost per drop), `servicing/ServicingView.tsx:706` |
| DC | `src/components/charts/LineChart.tsx` | SVG 12-point line with a reference line and a band | `fleet/TruckView.tsx:287` |
| DC | `src/components/reports/FleetDayChart.tsx` (via `FleetDaysCard.tsx`) | Daily weight needed against fleet capacity, plain SVG | Truck-usage report |
| DC | `src/components/servicing/WorkshopChart.tsx` | Two-week workshop timeline | Servicing page |
| DC | `src/components/fleet/DriverAwayChart.tsx` | Two-week "who is away" timeline | Drivers page |
| DC | `src/components/dispatch/PickedVsOrdered.tsx`, `delivery-run/planner/FillRail.tsx` (and, per `PickedVsOrdered.tsx:13-14`, inline track+fill in `ReceivingFlow` and `LoadSummaryStep`) | Single progress or fill bars | Pick and plan screens |
| Manga Verde | `components/incentives/MilestoneColumns.tsx` | CSS column chart of milestone bonuses ("the design system has no chart", `:8-9`) | `IncentivesView.tsx:186` |
| Manga Verde | `components/receiving/BoughtVsWeighed.tsx` | Two bars on one scale, missing part hatched | Arrivals (browser and tablet), `MangoesBoughtReport`, `DispatchReview` |
| CRM, RMS, Org Admin, packhouse, Hub, org-contract, xero-app-engine | n/a | **None.** RMS's one hit is the lucide `BarChart3` icon in `shell/Sidebar.tsx:9,35`; DC's `DcFlowStrip.tsx` draws SVG arrows, not a chart | n/a |

No app's `package.json` carries a chart library.

Each of these is the app's own code, in the app's lane. This change does not move or replace any of them. DC's
`BarChart` is the closest relative. The reason it is not simply promoted is in D-1.

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — Plain HTML and CSS, not SVG. No new dependency

- **Why not SVG.** DC's `BarChart` is a fixed `viewBox` (640 wide) scaled to fit. At 390 px it shrinks everything by
  about 0.55, so its 12 px labels draw at about 6.6 px. That fails "readable at phone 390 px". An SVG also cannot wrap a
  long label such as "Classe 3 (Refugo)" or "Ainda sem mapa".
- **Why CSS works.** Rows made of elements with a percentage-width fill keep real text at real sizes. Labels wrap, and
  the numbers stay `tabular-nums`. Each bar is two `div`s, so there is nothing to measure and no JavaScript.
- **No dependency.** None is needed, so none is added. The DC argument (`LineChart.tsx:3-18`: bundle, supply chain,
  re-theming, server rendering) applies unchanged. No `package.json` dependency line moves.
- **Server-renderable.** No hook, no `useId`, no `"use client"`. The component renders inside a server component, which
  matters for the packhouse dashboard and for DC's `force-dynamic` pages.

### D-2 — The figures are a real ARIA table, and the bars are hidden from screen readers

The request offers "a real table or aria description". The plan uses **one structure that is both the picture and the
table**:
- The root is `role="table"` with `aria-label={label}`.
- A visually hidden header row of `role="columnheader"` cells holds the names, the amounts and the shares (`words`).
- Each line is `role="row"` holding three **direct** children: `role="rowheader"` (the name), `role="cell"` (the amount)
  and `role="cell"` (the share).
- The track and its fill, and the visible " · " separator, are `aria-hidden="true"` siblings, also direct children of
  the row. CSS grid places them, so DOM order (name, amount, share) is reading order whatever the look.

Why one structure and not a hidden `<table>` beside the picture:
- A screen reader user exploring by touch lands on the figures they touch, not on a 1 px clipped copy somewhere else.
- Nothing is printed twice, so the two copies can never disagree.
- Cells are direct children of the row (no wrapper `span`), which keeps axe's `aria-required-children` and
  `aria-required-parent` rules satisfied.

Colour is never the only carrier of meaning:
- every figure is printed as text;
- a "warning" line (for example "Not mapped yet") is named by its own label. Its colour backs the label up and never
  replaces it.

### D-3 — The caller hands in the printed figures. The kit draws lengths only

"Data in, picture out." Each item carries a `value: number`, which sets the bar length, and optionally the exact text
to print:
- `valueText?: string`. Default: `String(value)`.
- `percentText?: string`. Default: the kit's own share, one decimal, `"62.3%"`.

The packhouse **must** pass both texts:
- UX-DSH-003 says the chart shows "the same values as the packout table". A share recomputed and re-rounded by the kit
  could differ in the last decimal (three-way splits) and would print an English "." where the Portuguese screen prints
  ",".
- The kit therefore computes nothing business-specific. It never rounds a figure the app shows elsewhere and never reads
  a locale.

The defaults exist only so a quick English chart works without any formatting. The README says to pass your own texts
whenever a table on the same screen shows the same figures. This is brief (b)'s "please confirm".

### D-4 — What a bar is measured against

- **The base.** `base = total?.value ?? sum(drawable values)`. A drawable value is finite and ≥ 0.
- **The fill width** is `clamp(value / base, 0, 1) × 100%`, written as an inline `style.width` with 4 significant
  decimals. An inline style renders on the server and needs no class per value.
- **Over 100%.** A value above the base (a caller passing a smaller `total.value`) fills the track and stops. The
  printed text still says what the caller gave.
- **Negative, `NaN` or `Infinity`.** No fill is drawn, and the default text prints the dash.
- **Zero.** A zero value inside a non-empty chart prints its figures ("0 · 0.0%") with **no fill element at all**, never
  a 1 px sliver or a lone rounded cap.
- **Tiny values.** A value above zero gets `min-width: 2px`, so "a little" never looks like "none".
- **`total.value`** is for a chart whose shares are of something larger than the lines shown. Pass the same base the
  app's own percentages use. The README says so.

### D-5 — The empty and zero state: a dash, no broken bars

- **No items.** One row: the dash in the name position, plus a visually hidden `words.empty` ("No figures yet") so a
  screen reader does not hear "dash" or nothing.
- **Items, but the base is 0 or not finite** (nothing packed yet). Every row keeps its **name** and an empty track, and
  prints "—" in place of both figures **even if the caller passed texts**. A "0.00 · —" mix reads as broken. The total
  row, if given, prints "—" too.
  - Each dash is `aria-hidden`, with a hidden `words.empty` beside it inside the same cell, so the cell is never empty to
    a screen reader.
  - This is the one place the kit overrides caller text. It is written in the component header and pinned by a test.

### D-6 — Colour: the theme's accent, with one warning tone. No series palette

- **Fill.** `bg-accent`, the app's theme colour: packhouse teal under `data-theme="packhouse"`, DC/CRM yellow otherwise.
- **Track.** `bg-surface-sunken`.
- **`tone: "warning"`.** Fill `bg-warning`, label `text-warning-fg`. These are the classes `StatusBadge` and
  `DocumentHeader` already use. The packhouse mockup draws its "Not mapped yet" bar in orange
  (`generate.mjs:53`, `i.nm`), so this one tone is needed by the first consumer and nothing more is added.
- **Not added:** the mockup's lighter-teal `i.l` class, which is used on no row in `generate.mjs:280-281`, and
  `SERIES_COLOURS`. One accent across all bars means "these are parts of one whole". Ten hues would say "ten different
  things".
- **Light and dark.** Every colour is a token class, and no hex appears in the component. Dark therefore works wherever
  an app redefines the tokens for dark. **No estate app does that today** (`tokens.css` has no dark block; the packhouse
  `tailwind.config.ts:14` declares `darkMode: ["class"]` but defines no dark tokens). The browser proof checks dark with
  a fixture token set (§5.4).
- **Not touched:** `tokens.css` and `packhouse.css`. A token change needs the full DC + CRM re-check (QG-CEN-003) and is
  not needed here.

### D-7 — Three widths and the tablet surface

- **Phone 390 px.** Labels wrap (`[overflow-wrap:anywhere]`, `min-w-0`) and never push the figures off the row. Figures
  are `whitespace-nowrap tabular-nums`, so "260.50 · 39.4%" never breaks in the middle. The component sets no fixed
  widths besides the label column cap in look A/C (`minmax(0, 9.5em)`).
- **Tablet.** `[[data-surface=tablet]_&]:text-base`, with a taller track (`h-4` → `h-5`). This is the same per-surface
  selector every kit primitive uses (`Button.tsx:31`, `ChoiceGroup.tsx:84`).
- **Desktop.** The chart fills its container. The app decides the card and its width.
- No viewport media queries. The chart may sit in a narrow card on a wide screen (layout B puts it next to the packout
  table), so a viewport breakpoint would answer the wrong question. Each look is built to hold from 280 px up (§5.4).

### D-8 — The look is the owner's pick. The API and accessibility are the same for all three

| Look | Row grid (DOM order is always name, amount, share; the bar and separator are `aria-hidden`) |
|---|---|
| **A** one line | `[name minmax(0,9.5em)] [track minmax(3rem,1fr)] [amount · share auto]` |
| **B** (recommended) figures above a full-width bar | `[name 1fr] [amount · share auto]`, then the track on its own line spanning both columns |
| **C** figures at the tip | `[name minmax(0,9.5em)] [fill, then amount · share, in one flex line]`, with no grey track and the fill scaled to `(100% − 8.5em) × share` |

- **Why B is recommended.** The name gets the full width and the bar gets the full width, so neither squeezes the other
  at 390 px or in a narrow card, and long Portuguese names do not shorten the bar.
- **A** is the denser look, already seen on the end-of-shift drawing. At 390 px its bar is about 90 px.
- **C** puts the figures at the tip, the most literal "printed at the end of each bar". The figures do not line up, and
  a 100% bar has to give up 8.5em for its text.
- **Only the class strings change** between looks. No look is offered as a prop: one look, chosen once, keeps every app
  consistent.

### D-9 — Words are handed in, with English defaults

`words?: Partial<BarChartWords>`, following the house idiom (`Keypad`, `LinkedRecords`). Keys and defaults:
- `item`: "Item"
- `amount`: "Amount"
- `share`: "Share"
- `empty`: "No figures yet"

Each key falls back on its own with `??`, so `{ amount: undefined }` still gets "Amount" (the CR-024 D-3 lesson). No
default object is exported. Exporting one would add a runtime name that no consumer asked for.

### D-10 — The name `BarChart`

- **The kit name.** `BarChart` / `BarChartProps` / `BarChartItem` / `BarChartTotal` / `BarChartWords` /
  `BarChartTone`.
- **No kit name begins with `Bar` today.** `NavigationBusyBar` ends with it, and the inventory is exact-match.
- **DC already has its own `BarChart`** in `@/components/charts`. That is a different module. DC's `@/components/ui`
  barrel re-exports the kit **by name**, not with `export *` (`ui/index.ts:195-197`). So the new kit name enters no DC
  namespace until DC imports it on purpose.
- **No estate app** re-exports the kit with `export *` (grep, §6).
- **If DC later adopts**, it aliases one or the other. That is noted for DC and not owed here.

## 3. The component: new file `src/components/BarChart.tsx`

```ts
export type BarChartTone = "default" | "warning";

export interface BarChartItem {
  readonly label: string;          // the row's name (rowheader)
  readonly value: number;          // sets the bar length only (D-4)
  readonly valueText?: string;     // printed amount; default String(value)
  readonly percentText?: string;   // printed share; default the kit's share, one decimal (D-3)
  readonly tone?: BarChartTone;    // default "default"
}

export interface BarChartTotal {
  readonly label: string;          // e.g. "Total packed"
  readonly value?: number;         // the base bars measure against; default the sum (D-4)
  readonly valueText?: string;     // printed; default String(value ?? sum)
}

export interface BarChartWords {
  readonly item: string; readonly amount: string; readonly share: string; readonly empty: string;
}

export interface BarChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role" | "aria-label"> {
  readonly label: string;          // the table's accessible name (the visible card heading is the app's)
  readonly items: readonly BarChartItem[];
  readonly total?: BarChartTotal;
  readonly words?: Partial<BarChartWords>;
}
```

- **A header comment** in the `ActionTile` style. It states: the boundary (horizontal shares only; any other chart type
  re-opens the dependency question, as DC wrote at `BarChart.tsx:3-9`), D-2 (one structure, both picture and table), D-3
  (caller's texts), D-5 (the one override) and D-6 (the accent and one warning tone).
- **No visible title.** The app's card heading stays the app's. The ph mockup puts the title and the caption in the
  card's own `h2` (`generate.mjs:277`). `label` names the table for assistive technology.
- **`forwardRef<HTMLDivElement>`**, with `className` merged by `cn`, and the rest of the props spread onto the root,
  like every kit primitive.
- **Pure helpers in the same file:** `chartBase(items, total)`, `fillWidth(value, base)` and
  `defaultPercent(value, base)`. They are file-local and **not exported**. They are geometry, not business rules.
- Roughly 150 lines with the header. Nothing else in `src/` changes besides the barrel.

## 4. Barrel, inventory, version, README

- **`src/components/index.ts`.** A new block after the `LinkedRecords` block: a 3-line comment citing CR-025 / E4-F21 and
  "ADDITIVE: new names only — declared in the export inventory", then
  `export { BarChart, type BarChartProps, type BarChartItem, type BarChartTotal, type BarChartWords, type BarChartTone } from "./BarChart";`.
  `src/index.ts` already does `export *` from `./components`, so it needs **no edit**.
- **`tests/components/DragBoard.additive.test.tsx`.** `ADDED_SINCE_011` gains `"BarChart"` under
  `// CR-DESIGN-SYSTEM-025`. That is one runtime name; the types are erased. `EXPORTS_AT_8387F66B` is not touched.
- **`package.json`.** `version` goes **0.8.0 → 0.9.0** (additive minor). The stale description is left alone, as at
  CR-021, CR-023 and CR-024.
- **`README.md`.**
  - A Changelog entry: **0.9.0**, "`BarChart`: horizontal bars of labelled values, amount and share printed, optional
    total, a dash when empty, theme accent, readable at 390 px, read by screen readers as a table. New names only."
  - A short `## Bar chart` section with the example, which is the kit's "stories/examples". The kit has no Storybook,
    and adding one is a dependency for a demo.
    - the example uses the packhouse class split with caller-formatted Portuguese texts;
    - pass `valueText`/`percentText` when a table on the same screen shows the same figures;
    - `total.value` is the base;
    - "Not mapped yet" style lines use `tone: "warning"` **and** say so in the label;
    - the card heading is the app's;
    - the app's Tailwind `content` must scan the package `src/` (already true for every consumer).
- **A runnable example page with every state** (normal, warning line, total, zero line, nothing yet, no items, long
  Portuguese labels, packhouse theme, DC yellow, dark fixture) is the browser-proof fixture. It is committed under
  `runs/change-NN/evidence/browser-proof/`, the CR-010 pattern.

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `964160b` (handover: 692 tests / 36 files at CR-024).
2. **Unit tests: `tests/components/BarChart.test.tsx`** (happy-dom, Testing Library, axe-core, all already dev
   dependencies). One case per rule:
   - **Structure.** One `table` named by `label`; one hidden header row with three `columnheader`s from `words`; one
     `row` per item with `rowheader` / `cell` / `cell` in that order; the track and the separator `aria-hidden`; no
     focusable element anywhere.
   - **Figures.** `valueText`/`percentText` printed exactly as given (a Portuguese "62,3%" survives untouched).
     Defaults: `String(value)` and `"62.3%"`.
   - **Lengths (D-4).**
     - The width equals `value / sum`.
     - With `total.value`, the base is that value.
     - A value above the base clamps to 100%.
     - A negative or `NaN` value gives no fill and a dash.
     - A zero value has **no fill element**.
     - `0.001` of a large base still has the `min-w` class.
   - **Empty (D-5).**
     - No items: one row, a visible "—" (`aria-hidden`) and `words.empty` in the accessible text.
     - Base 0: every name kept, every figure "—" even with caller texts, the total "—", and no fill element anywhere.
   - **Tone.** `warning` puts `bg-warning` on the fill and `text-warning-fg` on the label. `default` puts `bg-accent`.
   - **Words.** A partial override, and `{ amount: undefined }` falling back to "Amount".
   - **Server render.** `renderToString(<BarChart …/>)` succeeds with no client hook, and its markup carries the same
     figures.
   - **Spread and ref.** `className` is merged, `data-*` passes through, and the ref reaches the root.
   - **axe**, 0 violations, for normal, warning, total, empty and no-items charts.
3. **The additive claim:**
   - `git diff 964160b --stat -- src/` shows exactly `components/BarChart.tsx` (new) and `components/index.ts`.
   - The inventory test is green with exactly one declared runtime addition.
   - Every existing spec passes **unedited**, apart from that one inventory line, and the `.snap` is unchanged.
   - `pnpm typecheck` is clean.
4. **Visual check in a real browser** (the committed Edge driver, `runs/change-10/evidence/browser-proof/proof.mjs`,
   with DC's `playwright-core` + `tailwindcss` read-only and a scratch fixture outside the estate tree).
   - The fixture page from §4, at **390 px, 768 px (`data-surface="tablet"`) and 1280 px**, under packhouse teal, under
     the default yellow, and with a dark fixture token block.
   - Assertions:
     - `document.documentElement.scrollWidth === innerWidth` at each width;
     - no figure is clipped (each figure's box sits inside its row's box);
     - a long Portuguese label wraps, and its row's figures stay on one line;
     - the fill width in pixels is within 1 px of `share × track` (B) or `share × (row − 8.5em)` (C);
     - axe in the page shows 0 violations, including colour contrast of all text in all three colour sets.
   - Frames go to `runs/change-NN/evidence/frames/`.
5. **DC + CRM re-check (QG-CEN-003 / UX-THM-004 / QA-REG-002 — the packhouse's rule that a kit control added for it
   carries DC and CRM render checks in the same change).**
   - Method: the CR-015 one (`runs/change-12/evidence/dc-crm-recheck.md`). Fresh clones in `%TEMP%`, throwaway branches
     whose only diff is the kit pin set to this branch's head, then each app's own unit suite, typecheck, build and the
     same screenshot set as CR-015, before and after.
   - **Expected:** pixel-zero and suite-identical, because no existing kit file's code changes.
   - Throwaway branches are never pushed to `main` and **no pin moves on any app's `main`**. The estate folders are not
     touched (the conductor fingerprints DC).
   - Any pre-existing red on an app's `main` is recorded as pre-existing with evidence, the CR-015 way. It is never fixed
     here.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant
   must turn a **named** spec red:
   - M1: the base is computed from max, not from sum. The width spec goes red.
   - M2: no clamp. The over-100% spec goes red.
   - M3: a zero value renders a fill. The no-fill spec goes red.
   - M4: base 0 prints caller texts. The empty spec goes red.
   - M5: the track loses `aria-hidden`. The structure spec and axe go red.
   - M6: a `span` wrapper is put around the amount and share cells. axe `aria-required-children` goes red.
   - M7: `tone` is ignored. The warning spec goes red.
   - M8: the words merge by spread. The `{ amount: undefined }` spec goes red.
   - M9: `"use client"` plus a `useId` is added. The server-render spec catches the hook (or the inventory/typecheck,
     if the hook breaks it). If neither catches it, the build says so honestly.
7. **Other checks:**
   - `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`.
   - `quality-sensors.mjs`, LF-normalised.
   - `prettier --check --print-width 100` on the touched files.

## 6. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| **DC** (pin `5c14f377`, kit 0.7.0) | No existing kit file's code changes, so every kit component DC renders is byte-identical by construction (§5.3 diff check). DC's own `BarChart` lives in `@/components/charts`. DC's `ui/index.ts` re-exports the kit by name, so the new name enters no DC module. DC gets nothing until it moves its pin |
| **CRM** | Grep `export \* from "@bananaworld/design-system"` and `BarChart`: 0 hits. It renders only existing kit components, none of which change. Re-checked anyway (§5.5) |
| **RMS, Org Admin, Hub** | The same grep: 0 hits. Unaffected, and they gain the name only when they move their pin |
| **Manga Verde** (pin `3953e6d7`) | The same grep: 0 hits. Its `MilestoneColumns` / `BoughtVsWeighed` are its own code and are not touched |
| **Packhouse** (pin `820c980`) | Does not use a chart yet. EPIC-004-M-03 adopts `BarChart` after it pins this change's **merged** sha (QG-CEN-004) |
| Kit tests | All pass **unedited**, apart from the one inventory line. `DataTableToolbar.test.tsx.snap` is untouched |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/BarChart.tsx` (new) | The component, types, three file-local helpers and the header comment (§3) | 150 |
| `src/components/index.ts` | One new export block with a 3-line comment | 12 |
| `README.md` | Changelog 0.9.0 and the "Bar chart" section | 35 |
| `package.json` | `version` 0.9.0 | 1 |

Paper trail (not in the estimate):
- Tests: `tests/components/BarChart.test.tsx` and the inventory line.
- The browser fixture, proof and frames; the DC + CRM re-check record; the mutation battery.
- The decision-log entry `CR-DESIGN-SYSTEM-025` (D-1 to D-10).
- The refreshed handover and active milestone.
- `known-issues.md`, with what the packhouse owes.

The archive goes in the slot the conductor names; never overwrite (handover item 13). No migration (no database). **No
new dependency. No consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is
created or written, here or in any sibling repo.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The seams are the package hand-off and
two presentation hand-offs inside the component. **The kit writes the control. Each app reads it only when it moves its
own pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `BarChart` and its types → **packhouse** (pin `820c980`) | Kit | Packhouse EPIC-004-M-03 (OS-10: class split, size split, packaging groups) | Adds the control UX-DSH-003 / E4-F21 need, merged **before** the screen (QG-CEN-002) | **The packhouse milestone** pins the merged sha (compare `<sha>:src` / `<sha>:package.json`, the CR-015 owner rule) and passes its own `valueText`/`percentText` from the packout figures. Not done here |
| S2 | Figures: app → kit | **App** computes and formats every printed figure (packout engine, PRD-CALC) | Kit prints them at fixed spots and draws lengths from `value` | The kit never rounds, never reads a locale and never decides a share the app shows elsewhere (D-3) | None |
| S3 | Theme colour: app → kit | **App** (`data-theme`, `tokens.css` / `packhouse.css`) | Kit fill (`bg-accent`), track, warning | No token file changes (D-6) | None |
| S4 | Same names → **DC, CRM, RMS, Org Admin, Manga Verde, Hub** | Kit | Each app, only if it imports `BarChart` | Nothing they render changes (§6). DC's own `BarChart` name is in a different module (D-10) | None. Any later DC/MV adoption is that app's own change |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the eighteenth change to
note it, and the decision is the owner's. S1–S4 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The chart decides nothing about what may happen to a record, who may act, or how much.
What a class, size or packaging-group share *is* stays the packhouse packout engine's (PRD-CALC-004/005), and the chart
receives it as text (D-3). The component's own presentation rules are new and live in one place, its own file:
- the base is the total or the sum;
- the fill is clamped;
- zero means no fill;
- base 0 means dashes.

Nothing else in the kit spells them.

For transparency, the sites found that spell a related rule today, all **leave**:

| Site | Change / leave | Reason |
|---|---|---|
| DC `src/components/charts/BarChart.tsx:50,65` (scale to max, `max <= 0` → empty) | leave (read-only repo) | DC's own chart and DC's lane. A different scaling rule (largest value, for cost per drop), recorded in §1.2 |
| Manga Verde `components/incentives/MilestoneColumns.tsx:14-15,28` (`BAR_MIN_PX` 4) and `components/receiving/BoughtVsWeighed.tsx` | leave (read-only repo) | Manga Verde's lane. Its own minimum and scale |
| Packhouse `runs/current/mockups/EPIC-004-M-03/generate.mjs:276-281` (`width = share × 100%`) | leave (mockup, read-only repo) | The approved drawing this component reproduces (its D-4 base equals the mockup's share) |
| Kit `src/lib/series-colours.ts` | leave | Not used (D-6). Its rules ("colour never the only identifier") are the same principle D-2 follows |

**Search terms used:**
- Each app's `src/ app/ components/` `*.tsx`: `(?i)(bar ?chart|BarChart|<rect\b|Sparkline|chart)`, over DC, CRM, RMS,
  Org Admin, packhouse, Manga Verde, Hub, org-contract and xero-app-engine.
- Every app's `package.json`: `recharts|chart\.js|victory|nivo|visx|d3-|"d3"|echarts|apexcharts|chartjs`.
- DC `src/ app/ tests/`: `charts/(BarChart|LineChart)|<BarChart|<LineChart`.
- Every app except DC: `export \* from "@bananaworld/design-system"|BarChart`.
- Packhouse: `E4-F21|layout B|EPIC-004-M-03`, `UX-DSH-003|UX-THM-004|UX-DSH-002` and `(?i)dark|prefers-color-scheme`
  (tailwind config, CSS).
- Kit `src/components`: `useSurface|data-surface|sr-only|role="table"|role="img"` and
  `warning-fg|warning-subtle|bg-warning`.

## 9. Residuals and open questions

- **Owner pick:** look A, B or C (D-8). The recommendation is B.
- **Owner confirm:** the screen supplies the printed figures (D-3). If the owner would rather have the chart work out
  the shares itself, the defaults already do that. Only the README guidance and the packhouse's call change, not the
  component.
- **R1 — DC yellow is a pale fill.** `#fac80a` on `#efefee` is about 1.5:1, below the 3:1 non-text guideline.
  - Under WCAG 1.4.11 the bar is not *required* to understand the content, because every figure is printed.
  - No current DC/CRM screen uses the chart.
  - If DC adopts it, a darker edge for the yellow theme is a later, additive class. Not added now (simplification
    gate).
  - Packhouse teal `#0f766e` on the track is about 5:1.
- **R2 — Caller texts and lengths can disagree** if an app passes a `percentText` computed against a different base
  than `total.value`. The kit cannot know. The README says to pass the same base.
- **R3 — Dark is untested against a real app's dark tokens**, because none exists (D-6). It is proven only with the
  fixture token set.
- **R4 — DC's `BarChart` name.** If DC ever adopts the kit chart, one import is aliased (D-10).
- **R5 — The re-check (§5.5) can come back red on an app's `main` for reasons outside this change**, as CR-015's did.
  It would then be recorded with evidence, and clearing it would be the owner's call, as at CR-015.
- **Standing, carried:** no cross-system register; no CR-008 decision-log entry; 4 inert `ignoreGhsas`; OQ-8; the
  `.snap` CRLF artefact (do not stage); `prettier --print-width 100`; gitleaks scan check (K-1).

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover. The packhouse EPIC-004-M-03 is unblocked on
  E4-F21, with a build note:
  - pin that merged sha (QG-CEN-004);
  - import `BarChart` from the kit, with no page-local copy (UX-THM-004, S2);
  - pass `valueText` and `percentText` from the packout figures;
  - use `tone: "warning"` for "Not mapped yet".
- `package.json` says `0.9.0`. DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins.

## 11. Not an epic

One new presentational component, one barrel block, a changelog and a version. It touches no service, integration,
permission model or data. I cannot name five milestones this decomposes into. The packhouse adoption is its own
milestone in its own epic, not a milestone of this change.
