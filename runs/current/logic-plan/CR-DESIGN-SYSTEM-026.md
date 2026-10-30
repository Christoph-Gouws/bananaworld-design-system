# CR-DESIGN-SYSTEM-026 — a shared headline figure tile (`StatTile`) in the kit — Logic Plan

> Raised by owner ruling 2026-10-30 for the packhouse end-of-shift screen (bananaworld-ph EPIC-004-M-03, layout B;
> finding E4-F21). It is the companion to CR-DESIGN-SYSTEM-025 (the shared bar chart, look A). **This was a planning
> session only. No feature code was written.** `bananaworld-dc` and every other estate app were only read. Base: `main`
> @ `f92eab5` (CR-DESIGN-SYSTEM-025, PR #44, kit **0.9.0**). CR-025 has merged, so the "build after CR-025" condition
> is already met.

<!-- OWNER-BRIEF-START -->

**What you'll get.** One headline figure box for every app, first for the four boxes on the packhouse end-of-shift screen: bunches in, pallets packed, waste, and pallets waiting in the cold rooms. Each box shows a short name with a small picture, one big figure, and an optional line underneath, such as "12 fallen bunches", with a thin line in the app's own colour along the top. A box can open a list when tapped, such as the waiting pallets, or simply be read. Phones and tablets show two boxes per row; desk screens up to four. A screen reader reads the name and figure together. Dark look ready.

**Please decide or confirm.**
- Pick a look. **A (recommended):** the name sits on top, as on the end-of-shift drawing. **B:** the big figure comes first. **C:** the picture sits on the left.
- When nothing has been recorded, the box shows a dash. A real zero shows 0. The screen tells the box which one applies.

**Not included.** The packhouse screen itself, which comes in its own change. The figure boxes the other apps already draw for themselves stay as they are. They are listed for later.

**Risks.** None for the live apps. Nothing they show changes.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`. The next estate session is due **2027-01-10**, so
  it is not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (searched). That has been
  the standing finding since CR-013. The rules come from the conductor's project rules, the estate `CLAUDE.md` and
  `runs/current/SESSION_HANDOVER.md`.
- **No plan existed for this CR**, so this is a fresh plan, not a revision. No owner responses are recorded.
- **No clarify round was used.** The request already settles the parts, the empty state, the link, the widths,
  accessibility and the "no dependency" rule. Two things are left for the owner: the look (a mockup pick) and a
  confirmation of who decides "nothing recorded" (brief (b), D-3).
- **Read in this repo:**
  - `src/components/ActionTile.tsx`, `BarChart.tsx`, `ListCard.tsx`, `Icon.tsx` and `Link.tsx:1-60`.
  - `src/components/index.ts`, `src/lib/tokens.css` and `src/lib/themes/packhouse.css` (all whole).
  - `src/components/Skeleton.tsx:110-122` (`DashboardSkeleton`, a 4-tile row) and the viewport-breakpoint usages in
    `src/components/` (grep).
  - `package.json`, `README.md:120-230` and `tests/components/DragBoard.additive.test.tsx:62-120` (the export inventory).
  - The CR-025 plan, estimate and comparison page (the format precedent) and the handover.
- **Read in bananaworld-ph (read only):**
  - `runs/epic-04/findings-register.md:29` (E4-F21: "a stat tile if shared") and `runs/current/milestone-brief.md:10`
    ("BarChart + StatTile … must land first").
  - `runs/current/mockups/EPIC-004-M-03/generate.mjs`:
    - `:25-33` and `:93-102`: the approved tile CSS. It has a 3 px accent rule, an uppercase label with an icon, a 30 px
      value (24 px on phone) with a small unit, and the sub-line. Tiles are 4 across on desktop and 2 across on phone and
      tablet.
    - `:179-182` and `:201-204`: the EN/PT tile words.
    - `:248-258`: the four tiles, with a dash and no sub-line when empty. The waiting tile always has a figure.
  - `src/**/*.tsx`: a tile-name search. It found no figure tile. `floor/RosterGroupCard.tsx:61` `Tile` and
    `floor/PalletParts.tsx:51` `TileGroup` are pickers, not figures.
- **Read in DC, CRM, RMS, Org Admin, Hub and Manga Verde (read only):** see §1.2.

## 1. What exists today

### 1.1 The kit

- **No figure tile exists.**
  - `ActionTile` (CR-021) is a tap target (a `<button>` or link). It has an icon above a label and an optional count
    badge, and no headline figure.
  - CR-021 decided "a figure card is `ListCard` with your own text — there is no FigureTile". That is written at
    `README.md:140-141` (changelog 0.6.0), `README.md:217-221` (example) and `src/components/index.ts:272` (comment).
- **This change reverses that decision on the owner's ruling.** The README example and the barrel comment are updated
  to point at `StatTile`. They are text only, and no runtime name changes. The 0.6.0 changelog line stays, because it
  is history.

### 1.2 Page-local figure tiles in the estate: listed, NOT changed here

Found by name search (search terms are under Rule sites). Entries marked **(opened)** were read. The others were
identified from their name and signature line only.

| App (pin) | File:line | Shape |
|---|---|---|
| DC (`5c14f377`) | `components/dashboard/ManagerHomeDashboard.tsx:212` `KpiCard` **(opened)** | Uppercase label, 2xl value, sub, `tone` warning, optional `href` to the kit `Link`. 4-up `grid-cols-2 xl:grid-cols-4` (`:179`). **Closest relative** |
| DC | `components/reports/FleetDayParts.tsx:23` `Tile` **(opened)** | Label, value with a `small` unit, sub, danger border when `short` |
| DC | `components/day-plan/DayPlanHeader.tsx:223` `Kpi` **(opened)** | Value-first strip cell (`flex-wrap`), not a card |
| DC | `components/ui/SyncStatusDetail.tsx:561` `SummaryTile` | Icon, label, value, tone |
| DC | `components/reports/FleetTiles.tsx:57` `Tiles`; `deliveries/EstimateStrip.tsx:179` and `deliveries/MeasuredStrip.tsx:109` `Tile`; `quality-check/QualityCheckReport.tsx:306` `Tile`; `ripening/TabletRunHistory.tsx:406` and `ripening/RunRoomHistory.tsx:76` `Tile`; `market/ClientHistoryPanel.tsx:110` `Tiles`; `tablet/MarketStationHome.tsx:46` `Figure`; `room-occupancy/RoomContentsPanel.tsx:305`, `crates/CrateOpeningPreview.tsx:39` and `servicing/ServicingView.tsx:449` `Stat` | Label/value figure tiles and stat cells |
| CRM (`54597acd`) | `app/(browser)/_dashboard/DashboardScreen.tsx:109` `KpiStrip` **(opened)** | Inline tile: label, value with tone, sublabel. `grid-cols-2 lg:grid-cols-4` |
| RMS (`ecba2218`) | `components/dashboard/AccountabilityDashboard.tsx:35` `KpiTile` **(opened)** | Label, 3xl value, sub |
| RMS | `components/feed-health/FeedHealthView.tsx:147` and `reconciliation/LossReconciliationView.tsx:43` `Kpi`; `admin/ReconciliationAdminView.tsx:574` and `scan/SignalCheckView.tsx:179` `Stat` | Figure tiles and stat cells |
| Manga Verde (`964160b7`) | `components/browser/PlantDashboard.tsx:37` `Tile` **(opened)** | Label, accent value, note. `null` means "withheld" (lock + words), never a zero |
| Manga Verde | `components/logistics/ReportPanel.tsx:17` `Tile` (unit, sub); `app/(browser)/storage/raw/page.tsx:129`, `tablet/StationFigures.tsx:31` and `app/(browser)/buying/daily-price/page.tsx:301` `Tile`; `incentives/IncentivesView.tsx:22` `Stat`; `app/(browser)/config/suppliers/page.tsx:567` `StatStrip`; `hr/HoursReport.tsx:16` and `reports/PurchaseDetailReport.tsx:82` `Tiles`; `app/(browser)/processing/batches/[id]/page.tsx:377` `Figure`; `app/(browser)/finance/accounting/page.tsx:477` `KpiTile`; `finance/wallet/WalletStatementScreen.tsx:24` `Figures` | Figure tiles and stat strips |
| Org Admin (`f508f994`), Hub, packhouse `src/` | — | **None.** Org Admin's `SummaryField` (`audit-viewer.tsx:480`) is an audit field. The packhouse has only the mockup |

There are about 35 page-local copies in four apps. That confirms the estate rule is worth enforcing from here on. Each
copy is that app's own code, in its own lane. Migrating any of them is that app's own change (§10), and **this change
does not touch any of them.**

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — Plain HTML and Tailwind token classes. No new dependency. Renders on the server

- **No dependency.** `lucide-react` is already a kit dependency, and the link chevron comes from it. No `package.json`
  dependency line moves.
- **No `"use client"` and no hook in `StatTile.tsx`.** The packhouse dashboard and DC's `force-dynamic` pages render
  their headline row in a server component.
  - The kit `Link` is a client component already. A server-rendered `StatTile` passes it only serialisable props
    (`href`, `className`, and children that are rendered JSX).
- **The icon slot is a `ReactNode`, not a component type.** This is deliberately unlike `ActionTile` (`icon:
  IconProps["as"]`).
  - A component type is a function. It cannot cross from a server component into a client one ("Functions cannot be
    passed directly to Client Components"), and `Icon` is `"use client"`.
  - So the caller passes an element (`icon={<Scale />}`), and the kit wraps it in an `aria-hidden` span. The span sizes
    any child `svg` (`[&_svg]:h-4 [&_svg]:w-4`, and `h-5 w-5` on tablet).
  - The README says so.

### D-2 — Accessibility: one reading unit, never colour alone

- **DOM order is the reading order:** label, value, unit, then sub-line.
  - The label, value and unit sit in **one `<p>`** (spans styled as block lines), so "Bunches in 1 240" is one
    paragraph to a screen reader, not three stops.
  - The sub-line is its own `<p>`.
  - `{" "}` text nodes keep the words apart in the accessible text (the `ActionTile` idiom, `ActionTile.tsx:46-47`).
- **Decorative parts are `aria-hidden`:** the icon wrapper, the accent rule and the link chevron.
- **Read-only tile:** a plain `<div>`. It has no role, no `tabIndex` and nothing focusable, because a figure is not a
  control.
- **Linked tile:** the whole tile is the kit `Link` (an `<a>`). Its accessible name is its own visible text (label,
  value, unit, sub), which meets WCAG 2.5.3 Label in Name, as `ActionTile` does. An app may still pass `aria-label`.
  - The link affordance is **not colour alone**. A chevron is drawn in the top-right, and the hover/focus states change
    the surface. Focus uses the kit's `focus-visible:shadow-focus`.
- **The accent rule carries no meaning.** It is decoration in the theme colour. A warning lives in the caller's sub-line
  words ("2 with no temperature"), and colour only backs the words up (D-6).
- **Not Radix.** There is no Radix primitive for a figure or a link. A native `<a>` through the kit `Link` is the
  correct control, so nothing is hand-rolled in place of a Radix control.

### D-3 — The value is printed exactly as given. `null` means a dash

"Data in, picture out."
- **`value: string | null` is required**, so every caller makes the choice on purpose.
- **The kit never formats a number.** There is no locale and no rounding. The packhouse prints "1 240" and "2 814,00"
  the Portuguese way, and that formatting is its own.
- **`null` or `""` prints the dash.** The dash is `aria-hidden` "—", with a visually hidden `words.empty` ("Nothing
  recorded yet") beside it, so a screen reader never hears "dash" or silence. This is the BarChart D-5 idiom.
- **`"0"` prints `0`.** The kit cannot know whether nothing was recorded or a true zero happened. **The app decides and
  says so by passing `null`.** That is the brief's "please confirm".
  - It matches the packhouse mockup (`generate.mjs:251-253`: `empty ? DASH : …`).
  - It matches Manga Verde's "a zero that reads as a fact" rule (`PlantDashboard.tsx:33-36`).
- **With the dash, `unit` is hidden.** "— kg" reads as broken.
- **The sub-line is shown as given.** The packhouse passes none when empty (`generate.mjs:251`). The kit does not
  second-guess the caller here, unlike BarChart's override, because a sub-line can truthfully say "no shift opened yet".

### D-4 — The link: `href` only

- **`href?: string`.** When given, the tile renders the kit `Link`. When absent, it renders a plain read-only `<div>`.
- **No `onClick` / button variant.** The request is "opens a target (e.g. the Waiting list)". That is navigation, and a
  page anchor or a `?tab=` URL also covers an in-page list. A button variant would be a second interactive shape that
  nobody has asked for (simplification gate). It could be added later as a new optional prop.
- **The app decides whether the target may be opened.** If the viewer may not open the Waiting list, the app passes no
  `href`, and the tile is a plain figure (S5).
- **Inside a `NavigationBusyProvider`,** the kit `Link`'s waiting ring already sits correctly in a block or tile link
  (kit 0.7.1, CR-022). A test pins that the tile link keeps the ring outside the figure.

### D-5 — The row: a tiny `StatTileRow`, so four apps do not choose four breakpoints

- **The request** says tiles must work "in a row of 2-4 tiles that wraps on phone 390 px, tablet and desktop".
- **A second runtime name, `StatTileRow`.** It is a `<div>` grid:
  - always `grid-cols-2`;
  - at `lg` (≥1024 px viewport), as many columns as it has children, capped at 4 (`lg:grid-cols-2|3|4`, literal
    strings so every consumer's Tailwind scan sees them);
  - one child gives one column;
  - gap `gap-3`, or `gap-4` on the tablet surface.
- **Why viewport breakpoints here, when BarChart avoided them.** A headline row is page-width chrome, not a card that
  may sit in a narrow column.
  - The approved drawing is 2-up on phone **and** tablet, and 4-up on desk (`generate.mjs:25,93,102`).
  - DC (`ManagerHomeDashboard.tsx:179`), CRM (`DashboardScreen.tsx:111`) and the kit's own `DashboardSkeleton`
    (`Skeleton.tsx:114`) already use `sm:`/`lg:`.
  - `auto-fit` was tried on paper and rejected. At 504–675 px it leaves a 3 + 1 orphan, and on the tablet surface it
    gives 3 + 1 at 720 px.
- **`StatTile` itself sets no grid** (the `ActionTile` rule). It is `h-full min-w-0`, so tiles in one row are the same
  height whether or not each has a sub-line. An app with its own grid can skip `StatTileRow`.
- **The counting is `Children.toArray(children).length`.** It is server-safe and needs no hook.

### D-6 — Colour and themes: tokens only, one optional accent rule

- **`accent?: boolean`, default `false`.** When on, an `aria-hidden` span sits along the top: `absolute inset-x-0 top-0
  h-[3px] bg-accent`. It is packhouse teal under `data-theme="packhouse"` and DC/CRM yellow otherwise.
  - The drawing uses an inset box-shadow (`generate.mjs:26`). A span is chosen instead because a box-shadow would be
    **replaced** by `focus-visible:shadow-focus` on a focused linked tile. The rule would vanish while the tile has
    focus.
- **Surface:**
  - `bg-surface border-border text-fg`;
  - label `text-fg-muted`, sub-line `text-fg-muted`;
  - unit `text-fg-muted`, dash `text-fg-subtle`;
  - linked tile hover: `hover:bg-surface-muted hover:border-border-strong`.
- **The icon inherits the label colour (`text-fg-muted`), not the accent.** The drawing paints it teal
  (`generate.mjs:28`). In DC yellow, an accent icon on white would be about 1.6:1. It would be legible only because it
  is decorative, and it would look washed out. An app that wants a teal icon passes `<Scale className="text-accent" />`.
  This is noted for the packhouse.
- **No `tone` prop.** The request asks for none. Warnings live in the caller's sub-line text, which can be coloured with
  `text-warning-fg` **and** says it in words. DC's `KpiCard` `tone` is a candidate for a later additive prop, if DC ever
  adopts.
- **Light and dark.** Every colour is a token class, and no hex appears in the component. No estate app defines dark
  tokens yet (the CR-025 finding, D-6 there). The browser proof checks dark with a fixture token set.
- **Not touched:** `tokens.css` and `packhouse.css`.

### D-7 — Sizes at the three widths and on the tablet surface

- **Tile padding** is `px-4 py-3`, or `px-5 py-4` on tablet. There is no fixed width or height.
- **Label:** `text-xs font-semibold uppercase tracking-wide`, or `text-sm` on tablet, with `[overflow-wrap:anywhere]`.
  The label wraps and never truncates.
- **Value:** `text-2xl font-bold tabular-nums leading-tight whitespace-nowrap`, then `sm:text-3xl`, and `text-4xl` on
  tablet.
  - 24 px at 390 px matches the drawing's phone size (`generate.mjs:95`).
  - A 2-up tile at 390 px has about 141 px inside. "2 814,00" at 24 px is about 115 px.
  - A value is never broken or truncated. A figure that does not fit is the caller's sign to move detail into the
    sub-line, and the README says to keep values short.
- **Unit:** `text-sm font-semibold ml-1`. It may wrap under the value at very narrow widths.
- **Sub-line:** `text-xs`, or `text-sm` on tablet. It wraps freely.
- **Linked tile:** the label row reserves `pr-5` so the chevron never overlaps the label.

### D-8 — The look is the owner's pick. The API and accessibility are the same for all three

| Look | Layout |
|---|---|
| **A** (recommended) name on top | Accent rule, then icon + uppercase label, the big value (+ unit), then the sub-line. The drawing's look |
| **B** figure first | Accent rule, then the big value (+ unit), the icon + label under it (sentence case), then the sub-line |
| **C** picture on the left | Accent rule, then a 32 px tinted square (`bg-accent-subtle`) holding the icon on the left; label, value and sub-line stacked to its right |

- **Why A.** It is the approved end-of-shift drawing.
  - It is the order every existing estate tile uses (DC `KpiCard`, CRM, RMS, Manga Verde), so apps that adopt later do
    not change their look.
  - Its reading order (name, then figure) is also its visual order.
- **B** puts the figure first on screen and therefore also first to a screen reader ("1 240 Bunches in"), because DOM
  order follows the visual order (WCAG 1.3.2).
- **C** gives the picture more weight, but costs about 42 px of a 2-up phone tile. Labels like "Waiting to dispatch"
  then wrap to three lines.
- **Only class strings and the order of two spans change between looks.** No look is a prop.

### D-9 — Words are handed in, with an English default

- `words?: Partial<StatTileWords>`, with the single key `empty` (default "Nothing recorded yet"). It falls back with
  `??` per key (the CR-024 D-3 lesson).
- No default object is exported, because no consumer asked for one (the BarChart D-9 rule).

### D-10 — The names

- `StatTile`, `StatTileRow`, `StatTileProps`, `StatTileRowProps` and `StatTileWords`.
- **No kit export begins with `Stat` today.** `StatusBadge` is a different full name, and the inventory is exact-match.
- **No estate app imports or declares `StatTile`** (grep §Rule sites: 0 hits).
- **No estate app re-exports the kit with `export *`** (0 hits). So the new names enter no app namespace until the app
  imports them on purpose.

## 3. The component: new file `src/components/StatTile.tsx`

```ts
export interface StatTileWords { readonly empty: string }

type StatTileOwnProps = {
  readonly label: string;               // short name, first in reading order
  readonly value: string | null;        // printed as given; null or "" → dash (D-3)
  readonly unit?: string;               // small text after the value; hidden with the dash
  readonly icon?: ReactNode;            // decorative element, wrapped aria-hidden (D-1)
  readonly sub?: ReactNode;             // the sub-line, as given
  readonly accent?: boolean;            // theme-colour top rule; default false (D-6)
  readonly words?: Partial<StatTileWords>;
};

export type StatTileProps =
  | (StatTileOwnProps & Omit<HTMLAttributes<HTMLDivElement>, "children"> & { href?: undefined })
  | (StatTileOwnProps & Omit<LinkProps, "children" | "href"> & { href: string });

export interface StatTileRowProps extends HTMLAttributes<HTMLDivElement> {}
```

- **A header comment** in the `ActionTile` / `BarChart` style. It states:
  - D-2: one reading unit, decorative parts hidden, the link name is its visible text;
  - D-3: value as given, `null` is a dash, and the app decides zero versus nothing;
  - D-4: `href` only;
  - D-5: the tile sets no grid, `StatTileRow` does;
  - D-6: tokens only.
- **`forwardRef<HTMLDivElement | HTMLAnchorElement>`**, with `className` merged by `cn` and the rest spread on the
  root, like `ActionTile`.
- **`StatTileRow`:** `forwardRef<HTMLDivElement>`, using a frozen file-local `LG_COLS` map of literal class strings.
- **No `"use client"` and no hook** (D-1). The imports are `Link`, `cn` and the `ChevronRight` icon from `lucide-react`.
- Roughly 110 lines with the header. Nothing else in `src/` changes besides the barrel.

## 4. Barrel, inventory, version, README

- **`src/components/index.ts`:**
  - Change the comment at `:272` from "A figure card is `ListCard` with your own text (README)" to "A read-only figure
    tile is `StatTile` (CR-026)". This is a comment, so no runtime change.
  - Add a new block after `BarChart`: a 3-line comment citing CR-026 / E4-F21 and "ADDITIVE: new names only — declared
    in the export inventory", then
    `export { StatTile, StatTileRow, type StatTileProps, type StatTileRowProps, type StatTileWords } from "./StatTile";`.
  - `src/index.ts` already does `export *` from `./components`, so it needs no edit.
- **`tests/components/DragBoard.additive.test.tsx`:** `ADDED_SINCE_011` gains `"StatTile"` and `"StatTileRow"` under
  `// CR-DESIGN-SYSTEM-026`. Those are two runtime names; the types are erased.
- **`package.json`:** `version` goes **0.9.0 → 0.10.0** (additive minor). The stale description is left alone, as at
  CR-021 to CR-025.
- **`README.md`:**
  - Add a Changelog entry for **0.10.0**: "`StatTile` / `StatTileRow`: a read-only headline figure (label + optional
    icon, one large value, optional unit and sub-line, optional theme-colour top rule, optional link); a dash when the
    app passes `null`; 2-up on phone and tablet, up to 4-up on desk. New names only."
  - Add a `## Headline figures` section. It holds the packhouse four-tile example with Portuguese words, which serves as
    the kit's "stories/examples" (there is no Storybook). It covers:
    - `null` versus `"0"`;
    - the icon is an element;
    - keep values short;
    - no `href` when the viewer may not open the target;
    - a warning says so in words;
    - Tailwind `content` must scan the package `src/`.
  - Replace the `ListCard` "figure card … there is no FigureTile" example at `:217-221` with a pointer to the new
    section.
- **A runnable example page with every state** is committed as the browser-proof fixture under
  `runs/change-NN/evidence/browser-proof/` (the CR-010 pattern). Its states:
  - the four packhouse tiles, normal and nothing recorded;
  - a linked waiting tile;
  - a real zero;
  - a long Portuguese label;
  - a 2-tile and a 3-tile row;
  - packhouse teal, DC yellow and a dark fixture.

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `f92eab5`. The handover records 709/710 at CR-025, with one import timeout.
2. **Unit tests: `tests/components/StatTile.test.tsx`** (happy-dom, Testing Library, axe-core and the existing
   `next-link-mock` fixture, all already present). One case per rule:
   - **Order.** `textContent` reads label → value → unit → sub. Label, value and unit share one `<p>`.
   - **Decoration hidden.** The icon wrapper, the accent rule and the chevron are each `aria-hidden`. The rule exists
     only with `accent`. The chevron exists only with `href`.
   - **Value (D-3):**
     - `"2 814,00"` is printed untouched;
     - `"0"` prints `0`;
     - `null` and `""` print a visible `aria-hidden` "—" plus `words.empty` in the accessible text;
     - the unit is absent with the dash;
     - the sub-line is still shown with the dash.
   - **Read-only:** the root is a `div` with no role and no `tabIndex`, and there is no focusable descendant.
   - **Linked:** one `<a>` with the `href`. Its accessible name is label + value + unit + sub, and a caller `aria-label`
     wins.
   - **Words:** an override works, and `{ empty: undefined }` falls back to the default.
   - **Row:** 1, 2, 3, 4 and 5 children give `grid-cols-1`, `lg:grid-cols-2`, `lg:grid-cols-3`, `lg:grid-cols-4` and
     `lg:grid-cols-4` respectively. `grid-cols-2` is the base for 2 or more.
   - **Server render:** `renderToString` of a row of four, one of them linked, succeeds and carries the figures. A guard
     reads the file and asserts it has no `"use client"` and no `use[A-Z]` hook call.
   - **NavigationBusy:** inside a provider, a pending tile link's ring is outside the value `<p>` (the CR-022 invariant).
   - **Spread and ref:** `className` is merged, `data-*` passes through, and the ref reaches the `div` or the `a`.
   - **axe**, 0 violations, for read-only, linked, empty, accented and a full row.
3. **The additive claim:**
   - `git diff f92eab5 --stat -- src/` shows exactly `components/StatTile.tsx` (new) and `components/index.ts` (one
     comment line and one new block).
   - The inventory is green with exactly two declared runtime additions.
   - Every existing spec passes **unedited**, apart from those inventory lines, and the `.snap` is unchanged.
   - `pnpm typecheck` is clean.
4. **Visual check in a real browser.** It uses the committed Edge driver (`runs/change-10/evidence/browser-proof/proof.mjs`),
   DC's `playwright-core` + `tailwindcss` read-only, and a scratch fixture outside the estate tree.
   - Widths: **390 px, 768 px with `data-surface="tablet"`, and 1280 px.** Colour sets: packhouse teal, default yellow
     and a dark fixture.
   - Assertions:
     - `document.documentElement.scrollWidth === innerWidth`;
     - every value box sits inside its tile box (nothing pokes out);
     - 2 columns at 390 and 768, and 4 at 1280;
     - tiles in one row have equal heights;
     - a long Portuguese label wraps and the chevron does not overlap it;
     - the accent rule is still visible with a linked tile focused;
     - axe in the page shows 0 violations, including text contrast in all three colour sets.
   - Frames go to `runs/change-NN/evidence/frames/`.
5. **DC + CRM re-check** (QG-CEN-003 / UX-THM-004 / QA-REG-002). It uses the CR-015 method
   (`runs/change-12/evidence/dc-crm-recheck.md`):
   - fresh clones in `%TEMP%`;
   - throwaway branches whose only diff is the kit pin, set to this branch's head;
   - each app's unit suite, typecheck, build and the CR-015 screenshot set, before and after.
   - **This also discharges CR-025's owed re-check**, because this head contains `BarChart`. The record says so.
   - Expected: pixel-zero and suite-identical. No pin moves on any app's `main`, and estate folders are not touched.
   - Any pre-existing red is recorded with evidence and not fixed.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant
   must turn a **named** spec red:
   - M1: `null` prints `""`. The dash spec goes red.
   - M2: `"0"` is treated as empty. The zero spec goes red.
   - M3: the unit is shown with the dash. The unit spec goes red.
   - M4: the icon wrapper loses `aria-hidden`. The decoration spec and axe go red.
   - M5: the chevron is drawn without `href`. The read-only spec goes red.
   - M6: `lg:grid-cols-4` is fixed regardless of count. The row spec goes red.
   - M7: label and value are split into separate `<p>`s. The order spec goes red.
   - M8: the words merge by spread. The `{ empty: undefined }` spec goes red.
   - M9: `"use client"` plus `useId` is added. The server guard goes red.
7. **Other checks:**
   - `pnpm test`, `pnpm typecheck`, `pnpm audit --prod --audit-level=high`;
   - `quality-sensors.mjs`, LF-normalised;
   - `prettier --check --print-width 100` on the touched files;
   - a CR-025 mutation battery is still owed. That is noted, and it is not folded in here because it is CR-025's own
     evidence.

## 6. Existing callers checked (the additive claim)

| Caller | Why unaffected |
|---|---|
| **DC** (pin `5c14f377`, kit 0.7.0) | No existing kit file's code changes. The only `index.ts` edit to existing lines is a comment. Every kit component DC renders is byte-identical by construction (§5.3). DC's `ui/index.ts` re-exports the kit by name, so the new names enter no DC module. DC's own `KpiCard`, `Tile` and `Stat` are local functions with different names |
| **CRM** (pin `54597acd`) | Grep for `export *` from the kit and for `StatTile`: 0 hits. It renders only existing kit components. Re-checked anyway (§5.5) |
| **RMS** (`ecba2218`), **Org Admin** (`f508f994`), **Hub** | The same grep: 0 hits. They gain the names only when they move their pin |
| **Manga Verde** (pin `964160b7`) | The same grep: 0 hits. Its tiles are its own code |
| **Packhouse** (pin `820c980`) | Has no tile in `src/`. EPIC-004-M-03 adopts `StatTile` after pinning this change's **merged** sha |
| Kit tests | All pass **unedited**, apart from the two inventory lines |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/StatTile.tsx` (new) | `StatTile`, `StatTileRow`, the types and the header comment (§3) | 110 |
| `src/components/index.ts` | One comment line reworded and one new export block with a 3-line comment | 12 |
| `README.md` | Changelog 0.10.0, the "Headline figures" section, and the old ListCard figure-card example replaced | 45 |
| `package.json` | `version` 0.10.0 | 1 |

Paper trail (not in the estimate):
- Tests: `tests/components/StatTile.test.tsx` and the inventory lines.
- The browser fixture, proof and frames; the DC + CRM re-check record; the mutation battery.
- The decision-log entry `CR-DESIGN-SYSTEM-026` (D-1 to D-10).
- The refreshed handover and active milestone.
- `known-issues.md`, with what the packhouse owes.

The archive goes in the slot the conductor names; never overwrite. No migration (no database). **No new dependency. No
consumer pin is bumped.** No `runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written, here
or in any sibling repo.

## 8. Cross-app intersection map

No shared data record is touched. The kit has no database and makes no call. The seams are the package hand-off and
presentation hand-offs inside the component. **The kit writes the control. Each app reads it only when it moves its own
pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `StatTile` / `StatTileRow` → **packhouse** (pin `820c980`) | Kit | Packhouse EPIC-004-M-03 (the four headline tiles, layout B) | Adds the tile E4-F21 needs, merged before the screen (QG-CEN-002) | **The packhouse milestone** pins the merged sha (compare `<sha>:src` / `<sha>:package.json`, the CR-015 owner rule), passes `null` when nothing was recorded, and passes its own formatted figures, words and `href`. Not done here |
| S2 | Figures and words: app → kit | **App** computes and formats every figure, unit and sub-line, and decides "nothing recorded" (`null`) versus zero | Kit prints them in fixed spots | The kit never formats, rounds or reads a locale (D-3) | None |
| S3 | Theme colour: app → kit | **App** (`data-theme`, `tokens.css` / `packhouse.css`) | Kit accent rule and surface tokens | No token file changes (D-6) | None |
| S4 | Navigation target: app → kit | **App** decides the `href` and whether this viewer may open it | Kit renders a link or a plain tile | The kit holds no permission logic (D-4) | None |
| S5 | Same names → **DC, CRM, RMS, Org Admin, Manga Verde, Hub** | Kit | Each app, only if it imports `StatTile` | Nothing they render changes (§6) | None. Migrating their ~35 local tiles (§1.2) is each app's own change |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. This is the nineteenth change to note
it, and the decision is the owner's. S1–S5 go to `known-issues.md` at build.

## Rule sites

**No business rule changes.** The tile decides nothing about what may happen to a record, who may act, or how much.

- **Owned by each app:**
  - what a figure *is* ("bunches in", "waiting", 18 kg units);
  - whether "nothing was recorded" (the packhouse's own shift state);
  - whether the viewer may open a target.
- **The tile's presentation rules are new and live in one file, `StatTile.tsx`:**
  - `null`/`""` prints the dash;
  - the unit is hidden with the dash;
  - the row's column count.

For transparency, the sites found that spell a related rule today, all **leave**:

| Site | Change / leave | Reason |
|---|---|---|
| Packhouse `runs/current/mockups/EPIC-004-M-03/generate.mjs:251-253` (`empty ? DASH : …`, no sub when empty) | leave (mockup, read-only repo) | The approved drawing this component reproduces. Its rule becomes the caller's `null` |
| Manga Verde `components/browser/PlantDashboard.tsx:33-48` (`value === null` means withheld; never a zero) | leave (read-only repo) | Manga Verde's lane. It is the same principle, and MV keeps its lock-and-words variant |
| DC `components/dashboard/ManagerHomeDashboard.tsx:183-205` (sub-line words chosen on count, `tone` on count) | leave (read-only repo) | DC's own business wording. A DC adoption would keep that logic in DC and pass the result |
| Kit `README.md:140-141` (changelog 0.6.0, "A figure card is `ListCard`…") | leave | History. The current-guidance copies at `README.md:217-221` and `src/components/index.ts:272` **change** (§4) |
| Kit `README.md:217-221`, `src/components/index.ts:272` | **change** | Text that says the kit has no figure tile; it would be false after this change |

**Search terms used:**
- Each app's `src/ app/ components/ lib/` `*.tsx`:
  `(?i)(function (Kpi|Stat|Tile|Figure|Metric|Summary|Headline)\w*\b|StatTile|KpiCard|MetricCard)`, over DC, CRM, RMS,
  Org Admin, Hub, packhouse and Manga Verde.
- The same with `StatCard|KpiTile|MetricTile|FigureCard|FigureTile|SummaryCard|SummaryTile|HeadlineTile|NumberTile|CountTile|StatBlock`
  over DC `src/`.
- Every app: `export \* from "@bananaworld/design-system"|\bStatTile\b`.
- Every app's `package.json`: `"@bananaworld/design-system"` (for the pins).
- Packhouse: `E4-F21|tBunch|tPal|tWaste|tWait|DASH =` and `d-tile|d-tiles` in the mockup.
- Kit: `figure card|FigureTile|ListCard` in `README.md`, and `(sm|md|lg|xl):` in `src/components`.

## 9. Residuals and open questions

- **Owner pick:** look A, B or C (D-8). The recommendation is A.
- **Owner confirm:** the screen decides "nothing recorded" (dash) versus a real zero (D-3). If the owner wanted the tile
  to treat zero as nothing, that would be a business rule inside the kit. The plan refuses it, because a zero
  waiting-pallet count is a real fact.
- **R1 — DC yellow accent rule.** `#fac80a` on white is about 1.6:1. It is decoration only, carries no meaning, and no
  DC screen uses the tile yet. Packhouse teal is about 5.4:1.
- **R2 — Long values.** A value wider than about 140 px at 390 px (over about 9 characters at 24 px) would extend past
  its tile, because a value is never broken or truncated (D-7). The packhouse's longest is "2 814,00", and the browser
  proof pins it. The README advises keeping values short.
- **R3 — Dark is untested against a real app's dark tokens**, because none exists. It is proven with the fixture only
  (the CR-025 R3).
- **R4 — Screen-reader grouping across real devices.** The one-`<p>` grouping (D-2) is the standard approach and passes
  axe. TalkBack and VoiceOver were not run in this sandbox at CR-021/025 either; the build records honestly whether a
  real device was used.
- **R5 — The re-check (§5.5) can come back red on an app's `main`** for reasons outside this change. It would then be
  recorded with evidence, as at CR-015.
- **Standing, carried:**
  - no cross-system register;
  - no CR-008 decision-log entry;
  - 4 inert `ignoreGhsas`;
  - OQ-8;
  - the `.snap` CRLF artefact (do not stage);
  - `prettier --print-width 100`;
  - the gitleaks scan check (K-1);
  - CR-025's mutation battery.

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover. The packhouse EPIC-004-M-03 is then fully
  unblocked on E4-F21 (BarChart at 0.9.0, StatTile at 0.10.0). Build note:
  - pin that merged sha (QG-CEN-004);
  - render `StatTileRow` with four `StatTile`s, `accent` on;
  - pass `null` for bunches in, pallets packed and waste when no shift data exists;
  - pass the waiting count always, with `href` to the Waiting list only when the viewer may open it;
  - format every figure and sub-line in the screen's own locale;
  - put the "with no temperature" warning in words, with `text-warning-fg`.
- DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins. The §1.2 list is the
  candidate list for each app's own optional migration change.

## 11. Not an epic

One new presentational component (with a tiny row companion), one barrel block, a changelog and a version. It touches
no service, integration, permission model or data. I cannot name five milestones this decomposes into. The packhouse
adoption is a milestone of the packhouse's own epic, and migrations in other apps would be their own changes.
