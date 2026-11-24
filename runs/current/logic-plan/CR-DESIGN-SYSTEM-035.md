# CR-DESIGN-SYSTEM-035 — StatTile tones, link label and normal-case label; AttentionItem rows; a count badge — Logic Plan

> Raised 2026-11-24 for the packhouse landing dashboard (CR-BANANAWORLD-PH-016), whose look the owner approved on 2026-11-23
> (gist `cae4760f…/comparison.html`; built-vs-mockup gist `e2daca2e…/dash-compare.html`). The approved drawing's source was read locally at
> `teams/AI Dev Team 6/projects/bananaworld-ph/runs/current/mockups/CR-BANANAWORLD-PH-016/option-a.html` (lines 1-51 CSS, 72-202 markup).
> **This was a planning session only. No feature code was written.** The sibling `bananaworld-dc` copy and the packhouse project were only read.
> Base: `main` @ `306e76f` (CR-DESIGN-SYSTEM-034, kit **0.15.0**). Branch: `change/cr-design-system-035`.
> Role: **Solution Architect Agent (planner)**. At build: Frontend Agent (components and tests), then QA.

<!-- OWNER-BRIEF-START -->

**What you'll get.** The shared screen pieces gain what your approved dashboard drawing needs:
- A figure box can be tinted: amber for "look at this", red for "something is wrong" (the number turns red too), green for "all good".
- A figure box can say where it leads, at its foot, like "Cold rooms →".
- Box names can be written in normal letters instead of capitals.
- A new "needs your attention" line: a coloured marker, a bold headline, a quiet second line, and where it leads on the right. On narrow phones the right-hand words drop away. Each line opens with one tap, works by keyboard, and a screen reader reads the headline.
- A small count bubble for a card heading.

**Please confirm.** Two small differences from the drawing, both so words stay easy to read: the "Cold rooms →" words are dark with a teal arrow (all-teal words would be unreadable in the depot app's yellow), and the count bubble is soft amber with a dark number (white on amber is too faint).

**Not included.** The packhouse dashboard does not change yet; it switches over in its own step. No other app changes.

**Risks.** None for today's screens: every existing figure box looks exactly as it does now.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md` line 1: next estate session due **2027-01-10**. Not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`** (the standing finding since CR-013). Rules come from the
  conductor's project rules, the estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **First plan, not a revision.** No earlier `CR-DESIGN-SYSTEM-035.md` existed; no owner responses are recorded. **No clarify round was used** (3 remain):
  the request, the approved drawing and the repo settle every owner-level question. The two readability differences from the drawing are carried
  as a confirm point in the brief (b), not as a question.
- **Read in this repo:** `src/components/StatTile.tsx` (whole), `StatusBadge.tsx` (whole), `BarChart.tsx:20-49`, `Link.tsx:1-60`, `index.ts:270-299`,
  the `CountPill`/`count` grep of `SideMenu.tsx` and `app-menu.ts`, `src/lib/tokens.css` (whole), `src/lib/themes/packhouse.css` (whole),
  `tests/components/StatTile.test.tsx` (whole), `tests/components/DragBoard.additive.test.tsx:25-134`, `tests/themes/packhouse-theme.test.ts` (whole),
  `package.json`, the handover, the CR-034 plan, `runs/change-32/` handover/known-issues/readable-code scorecard (grep).
- **Read in the packhouse project (read only):** the approved drawing (above); `src/client/dashboard/DashboardParts.tsx` (whole);
  `src/client/packout/EndOfShiftOffice.tsx:98-136`; `src/app/globals.css` grep (`tokens.css`, `color-mix`, `warning`); `package.json:44,62`;
  the PH-016 plan grep (`amber|warning|tone|StatTile|…`) and lines 125-194.
- **Read in the DC sibling (read only):** `package.json:57` (kit pin `5c14f37`, Tailwind `^3.4` at :92), `tailwind.config.ts` (whole), a grep of `src/`
  for `StatTile` (0 files) and for `AttentionItem` (DC's own fleet type, see §6).
- **Not readable here:** CRM, RMS, Org Admin. Their share of the additive claim is checked at build (§5.6), not claimed here.

## 1. What exists today

| Where | What | Gap against the drawing |
|---|---|---|
| `StatTile.tsx:53-66` | `TILE`, `LINKED`, `LABEL` (`uppercase tracking-wide`), `ICON`, `VALUE` literal class strings | No tone; label always capitals; no foot label |
| `StatTile.tsx:84-92` | Accent rule; a top-right chevron on linked tiles | The drawing has a foot label "Cold rooms →" instead |
| `StatTile.tsx:47-49` | `StatTileProps` = read-only `div` branch ∪ linked `Link` branch | — |
| `SideMenu.tsx:27-35` | Private `CountPill` (`bg-warning-subtle text-warning-fg`, hidden when ≤ 0) | Not exported; no public count badge exists |
| `StatusBadge.tsx:16-39` | Status pill: business display states, always a leading dot, uppercase | Does **not** fit a count (D-8) |
| `app-menu.ts:83-85` | `positiveCount` (null/undefined/≤0 → 0) | Reused by the count badge (D-8) |
| Packhouse `DashboardParts.tsx:61-79` | Its own attention list: plain text links, no chip/second line/action | Replaced by `AttentionItem` in PH's own change |
| Packhouse `globals.css:78-102` | Mockup "light amber" drawn as the **warning family** via `color-mix(… 40-50%, surface)` | The precedent this plan follows (D-2) |

## 2. Decisions (the build records each in the decision log)

### D-1 — StatTile gains three optional props; absent = today, byte for byte

```ts
export type StatTileTone = "default" | "warning" | "danger" | "success";
export type StatTileLabelCase = "upper" | "normal";
// StatTileOwnProps gains:
/** Tints the tile. warning: amber border + soft fill, icon amber. danger: red border + soft fill, icon and value red. success: soft green. */
tone?: StatTileTone;            // absent or "default" = today
/** "normal" draws the label as given (no capitals, no letter spacing). Absent or "upper" = today. */
labelCase?: StatTileLabelCase;
// The LINKED branch only gains:
/** Visible words at the tile's foot, with a small arrow. Part of the link's text; no aria-label is added. */
linkLabel?: string;
// The read-only branch gains `linkLabel?: undefined` (a label with nothing to open is a type error).
```

- **Byte-identity by construction:** the existing literals `TILE`, `LINKED`, `LABEL`, `VALUE` are **not edited**. Every new look is a **new literal**
  selected only when the new prop is present and not its default. `tone="default"` and `labelCase="upper"` take exactly today's code path.
- **No default changes.** No existing prop changes meaning.
- The file stays **hook-free and without `"use client"`** (the existing file-rule spec, `StatTile.test.tsx:152-156`, stays green unedited).

### D-2 — Tone colours: the kit's warning / danger / success families, softened with `color-mix` (no new token)

| Tone | Border | Fill | Icon | Value | Linked hover |
|---|---|---|---|---|---|
| warning | `color-mix(warning 50%, surface)` | `color-mix(warning-subtle 40%, surface)` | `text-warning` | unchanged | border → `warning` |
| danger | `color-mix(danger 50%, surface)` | `color-mix(danger-subtle 40%, surface)` | `text-danger` | `text-danger` (not on the dash) | border → `danger` |
| success | `color-mix(success 50%, surface)` | `color-mix(success-subtle 40%, surface)` | unchanged | unchanged | border → `success` |

- **Written as Tailwind arbitrary values with a `color:` type hint**, e.g.
  `border-[color:color-mix(in_srgb,var(--color-warning)_50%,var(--color-surface))]`. They need no consumer Tailwind config change (each app's
  config already scans the kit source, DC `tailwind.config.ts:10-11`). This is the **same recipe the packhouse already uses** for the drawing's
  "light amber" (`globals.css:83-102`), so the dashboard and its neighbours agree.
- **Why not the drawing's exact amber hex.** "Tokens only, no hex" is the kit rule (`StatTile.tsx:23`). A new amber token would mean editing `tokens.css`,
  which is hash-frozen with a full DC + CRM re-check (`packhouse-theme.test.ts:15-17,78-83`), or the packhouse theme, which may hold only the five accent
  tokens (`:46-54`). The warning family is the estate's one warning colour (menu count pill, status badge, bar chart). The drawing's amber maps onto it,
  as the packhouse already decided.
- **Danger value contrast:** `danger` on the danger tint is about 4.2:1 (browser) and higher on tablet. The value is 24 px+ bold, i.e. large text, so it needs
  3:1. Axe in the real browser confirms it (§5.4).
- **Empty value:** the dash keeps `text-fg-subtle` in every tone. A missing figure is not itself an alarm, and the app chose the tone anyway.
- **The accent rule** (`accent`) combines with any tone unchanged.

### D-3 — `labelCase="normal"`

A new literal `LABEL_NORMAL` = `LABEL` minus `uppercase tracking-wide`. The kit draws the label **as given**: it never re-cases text (Portuguese and
proper names). The app passes sentence case, as the drawing does ("Bunches in"). That is how "normal draws the label in sentence case" is met.

### D-4 — `linkLabel`: the foot of a linked tile

- **Markup** (inside the one existing `<Link>`, after the sub-line): `{" "}<span class="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-fg
  [[data-surface=tablet]_&]:text-sm">{linkLabel}<ArrowRight aria-hidden class="h-3.5 w-3.5 shrink-0 text-accent"/></span>`.
- **The tile stays one link.** The link's accessible name is still "its visible text", computed as today; it now ends with the foot words. **No
  `aria-label` is added**, so a caller's own `aria-label` still wins (the existing spec at `StatTile.test.tsx:97-98`).
  - *How "accessible name unchanged" was read:* the naming rule is unchanged. Hiding the foot words from the name (`aria-hidden`) was rejected. A voice-control
    user saying "click Cold rooms" must find the link (WCAG 2.5.3 label in name).
- **Foot pinned to the bottom:** only with `linkLabel`, the link gains `flex flex-col` (so `mt-auto` lines every foot up across a `StatTileRow`, whose
  cells are `h-full`).
- **The top-right chevron is not drawn when `linkLabel` is present**, and the label loses its `pr-5`. The drawing has no chevron, and the foot arrow is
  the non-colour link cue. Without `linkLabel`, the chevron and `pr-5` are exactly as today.
- **Words dark, arrow in the theme accent** (brief b). `text-accent` *text* is 5.5:1 in packhouse teal but about 1.6:1 in DC yellow. The kit already settled
  this in CR-032 D-4: text stays `text-fg`, and only icons take the accent. A readable accent-text token would need the frozen `tokens.css` (D-2).

### D-5 — `AttentionItem` and `AttentionList` (new file `src/components/AttentionItem.tsx`)

```ts
export type AttentionItemTone = "default" | "warning" | "danger";
export interface AttentionListProps extends HTMLAttributes<HTMLUListElement> {}
export type AttentionItemProps = Omit<LinkProps, "children"> & {
  /** The bold first line, and the link's whole accessible name. */
  title: string;
  /** The muted second line (the link's description). */
  detail?: ReactNode;
  /** Words on the right with an arrow, e.g. "Cold rooms". Hidden under 480 px (the link's description). */
  actionLabel?: string;
  /** Default grey, warning amber, danger red. Colours the chip. */
  tone?: AttentionItemTone;
  /** An element drawn in the chip (aria-hidden). None: warning/danger draw a small tone square, default an empty chip (as drawn). */
  icon?: ReactNode;
};
```

- **`AttentionList`** = `<ul className="m-0 list-none p-0 divide-y divide-border">`. The hairline between rows is the list's own. **`AttentionItem`** =
  `<li>` holding **one kit `<Link>`**. Using the kit `Link` keeps the surface prefetch rule and the CR-018 busy signal; no `<a>` is hand-rolled.
- **Row:** `flex items-center gap-3 rounded-md px-1.5 py-2.5 text-fg no-underline hover:bg-surface-muted focus-visible:outline-none
  focus-visible:shadow-focus` (tablet: `py-3`, larger text).
  - **Chip:** `h-8 w-8 shrink-0 rounded-md` in `bg-surface-muted text-fg-muted` (default), `bg-warning-subtle text-warning`, or
    `bg-danger-subtle text-danger`. The tone square is `h-3 w-3 rounded-sm bg-current`. The chip is `aria-hidden`.
  - **Text column:** `min-w-0 flex-1`. The title is `text-sm font-semibold [overflow-wrap:anywhere]`; the detail is `text-xs text-fg-muted`.
  - **Action:** `hidden min-[480px]:inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-fg`, plus `ArrowRight` in `text-accent`
    (the D-4 rule).
- **Keyboard and screen reader:** one link per row, so one Tab stop. **Name = title** via `aria-labelledby={titleId}`. **Description** = detail and
  action via `aria-describedby`. If the caller passes `aria-label`, `aria-labelledby` is omitted so the caller's name wins.
  - The ids come from `useId`, so the file is `"use client"`. That is normal for the kit's interactive parts; `Link` itself is a client component.
  - Tone is never colour alone: the title says what is wrong (the app's words).
- **No words of its own:** every visible string comes from the app.
- **Using it outside `AttentionList`** is documented as unsupported (an orphan `<li>`).

### D-6 — The 480 px rule

`min-[480px]:` is a Tailwind ≥ 3.2 arbitrary breakpoint. DC and the packhouse are on `^3.4`. Below 480 px the action words **and** their arrow are
`display:none`, as the drawing hides `.att em`. The row remains a full-width link.

### D-7 — Hover and focus

Linked tiles keep `LINKED`'s focus ring. Toned linked tiles use new literals (`LINKED_WARNING` etc.) that **keep the tint** on hover and deepen the border.
`hover:bg-surface-muted` would wipe out the meaning, so it is not used on toned tiles. Attention rows use `hover:bg-surface-muted` and the kit focus ring.

### D-8 — The count badge: a new `CountBadge` (StatusBadge does not fit)

- **Why not reuse `StatusBadge`:**
  - It always draws a leading status dot (`StatusBadge.tsx:81-95`).
  - It is uppercase with letter spacing.
  - Its `status` values are lifecycle display states such as `on_hold` and `waste` (its doc block, `:7-15`). Abusing `on_hold` to mean "3 things" would be
    semantically wrong, and it draws "● 3".
  - The request allows a new part "if the kit has none". The kit's only count pill is private (`SideMenu.tsx:27`).
- **Shape:**

```ts
export type CountBadgeTone = "default" | "warning" | "danger";
export interface CountBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** null, undefined, 0, negative or not finite: nothing is rendered (the menu count rule). */
  count: number | null | undefined;
  tone?: CountBadgeTone; // default "default"
}
```

- **Look:** `inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 tabular-nums`.
  - **Tones:** default `bg-neutral-subtle text-neutral-fg`; warning `bg-warning-subtle text-warning-fg` (the menu count pill's colours); danger
    `bg-danger-subtle text-danger-fg`.
  - **Not the drawing's white-on-solid-amber** (brief b). White on `warning` is 3.6:1 (browser), which fails AA for 12 px text. Dark text on the tablet's
    darker `warning` fails as well, so **no** solid fill passes on both surfaces.
- **The number** is `String(count)`, plain visible text. "Needs your attention 3" reads naturally inside the heading. A caller may add `aria-label`.
- **The rule "≤ 0 shows nothing" is written once:** it calls `positiveCount` from `app-menu.ts:83`. That is an internal import; it is not added to the barrel.
- **Where it lives:** in `StatusBadge.tsx`, beside the other badge, so the barrel line 91 grows instead of adding a line (§3). `StatusBadge`'s own code
  and class strings are **not touched**.

### D-9 — Nothing else moves

- No change to `tokens.css` or `packhouse.css` (both guarded).
- No new dependency (`ArrowRight` is from the existing `lucide-react`).
- No default changes, and no existing literal, export, word or Radix part changes.
- `StatTileRow` is untouched. The waste gauge inside a tile stays the app's own `sub` content.

## 3. Barrel, version, README

- **`src/components/index.ts`** is 299 lines; the readable-code sensor flags files **over** 300. 🔴 Never run prettier on it.
  - Line 91: `export { StatusBadge, CountBadge, type StatusBadgeProps, type CountBadgeProps, type CountBadgeTone } from "./StatusBadge";` (edited, no new line).
  - Line 292: adds `type StatTileTone, type StatTileLabelCase` (edited, no new line).
  - **One new line 300:** `export { AttentionList, AttentionItem, type AttentionListProps, type AttentionItemProps, type AttentionItemTone } from "./AttentionItem"; // CR-DESIGN-SYSTEM-035 (ADDITIVE)`.
  - The file ends at **300 lines: at the limit, not over it.** The barrel is now full, recorded as technical debt for the next exporting change
    (`runs/change-NN/technical-debt.md`).
- **`package.json`:** `0.15.0 → 0.16.0` (additive minor). No dependency change, so `pnpm-lock.yaml` is untouched.
- **`README.md`:** Changelog 0.16.0, the StatTile section (tone / labelCase / linkLabel, with the readable-words rule), and an "Attention list and count
  badge" section.
- **Export inventory (`DragBoard.additive.test.tsx:64-102`):** three runtime names are added under a `// CR-DESIGN-SYSTEM-035` comment: `AttentionItem`,
  `AttentionList`, `CountBadge`. That is the inventory's own designed procedure, the same one CR-021/023/025/026/032 followed. No other existing spec
  is edited.

## 4. Why this is additive

- `StatTileProps` gains optional fields only, and the linked branch gains one. Three new runtime names and six new type names are added.
- The existing literals and render paths are untouched, and every new class appears only under a non-default new prop.
- No default, token, theme, word, export removal or dependency change.
- A caller that passes none of the new props gets the HTML it got at `306e76f`. This is **proven against frozen HTML** (§5.2), not argued.

## 5. Proof (to be done at build; nothing here is claimed as done)

1. **Baseline first** at `306e76f`: `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` (the handover records 870/870). Restore
   `tests/components/__snapshots__` afterwards (CRLF artefact, do not stage).
2. **Frozen-HTML byte identity for StatTile (the CR-018 / CR-034 pattern),** written and committed **before any component edit**:
   - The fixture `tests/components/fixtures/stat-tile-035-frozen.ts` holds `innerHTML`, captured at `306e76f`, of every existing caller shape:
     - the five packhouse shapes: `DashboardParts.tsx:36`, i.e. `accent href prefetch={false} label value sub={<>…</>} words data-testid`; and
       `EndOfShiftOffice.tsx:102-133`, i.e. `accent icon value sub words`, with `unit`, with a `null` value, and without `words`;
     - the kit spec shapes: plain, linked with a caller `aria-label`, `className` + `data-*`, empty `""`;
     - each of the above inside `data-surface="tablet"`;
     - one `renderToString` of a read-only `StatTileRow`.
   - After the change the spec renders every shape three ways: unchanged; plus `tone="default"`; plus `labelCase="upper"`. It asserts equality with the
     frozen strings. (StatTile uses no `useId`, so no id normalisation is needed.)
3. **Unit tests** (new `describe` blocks; existing specs unedited except the inventory, §3):
   - **StatTile:**
     - each tone puts its class on the root and its colour on the icon wrapper (warning/danger) and on the value (danger only);
     - the danger dash stays `text-fg-subtle`;
     - `labelCase="normal"` drops `uppercase` and `tracking-wide`;
     - `linkLabel`: the words are inside the one link and come last in its name ("Waiting 7 pal. Cold rooms"); the arrow is aria-hidden; no
       chevron; the root has `flex flex-col`; a caller `aria-label` still wins;
     - a read-only tile has no foot (and `linkLabel` on the div branch is a `@ts-expect-error`);
     - axe passes for a row of every tone, linked and read-only.
   - **AttentionItem / AttentionList:**
     - exactly one link per row, named exactly the title, with a description containing the detail and the action;
     - a caller `aria-label` wins;
     - chip classes per tone; the tone square appears only for warning/danger without `icon`; the icon is aria-hidden;
     - the action carries `hidden min-[480px]:inline-flex`;
     - `<ul>` > `<li>` > `<a>` structure with `divide-y`;
     - Tab moves row to row; Enter follows the link (`next-link-mock`);
     - axe passes for a list of all three tones.
   - **CountBadge:**
     - `null`, `undefined`, `0`, `-1`, `NaN` and `Infinity` render nothing; `3` renders "3";
     - tone classes;
     - `className`, `aria-label` and the ref pass through;
     - `StatusBadge` snapshots are untouched.
4. **Real browser** (the committed Edge driver pattern, `runs/change-26/evidence/browser-proof/proof.mjs`, with a scratch fixture outside the estate tree,
   compiled with a consumer's **Tailwind 3.4** so the arbitrary `color-mix` classes and `min-[480px]:` are proven to generate):
   - **Screenshots:**
     - StatTile in every tone × with/without `linkLabel` × `upper`/`normal`;
     - AttentionList in all three tones, with and without icons;
     - CountBadge in each tone;
     - at 1440×900 and 390×844, in packhouse teal and DC yellow, and on the browser and tablet surfaces;
     - side by side with the approved drawing's frame.
   - **Measured:**
     - the computed `border-color` and `background-color` of each tone equal the `color-mix` values;
     - the action label is `display:none` at 479 px and shown at 480 px;
     - the foot labels line up across a row;
     - `scrollWidth === innerWidth` at 390 px;
     - keyboard-only Tab order;
     - **axe including colour contrast: 0 violations** in both themes and both surfaces.
   - Frames go to `runs/change-NN/evidence/frames/`.
5. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant must turn a **named** spec red:
   - `LABEL` edited (e.g. `tracking-wide` dropped), which breaks §5.2;
   - the tone classes applied when `tone` is `"default"`;
   - the danger value colour applied to the dash;
   - `linkLabel` rendered outside the link;
   - the chevron kept with `linkLabel`;
   - `aria-labelledby` removed from AttentionItem (the name becomes the whole row);
   - the action shown under 480 px (`hidden` dropped);
   - CountBadge rendering `0`;
   - CountBadge given the StatusBadge dot.
6. **DC + CRM render check (QG-CEN-003; the CR-015 method, `runs/change-12/evidence/dc-crm-recheck.md`):**
   - Use fresh clones in `%TEMP%`. On a throwaway branch, move only the kit pin, to this branch's head.
   - Before and after: unit suite, typecheck, build and screenshot set. The expected result is suite-identical and pixel-zero.
   - Grep CRM, RMS and Org Admin for `StatTile`, `CountBadge` and `AttentionList`, and for an `export *` of the kit.
   - No app's `main` pin moves, and no estate folder is touched.
   - **Packhouse:** its five StatTile call sites are covered by §5.2's frozen shapes. Its own suite runs at pin bump time in PH's change.
7. **Other checks:**
   - `pnpm typecheck`;
   - `pnpm audit --prod --audit-level=high`;
   - `quality-sensors.mjs` (LF-normalised), with `index.ts` at 300 lines, `StatTile.tsx` under 300, and every function ≤ 50 lines (split `TileBody` if
     the foot pushes it over);
   - `prettier --check --print-width 100 --end-of-line auto` on the touched files, except `index.ts`.

## 6. Existing callers checked (the additive claim)

| Caller | What was found | Why unaffected |
|---|---|---|
| **Packhouse** `DashboardParts.tsx:36` (pin `306e76f`) | `<StatTile accent href prefetch={false} label value sub words data-testid>` | No new prop is passed; frozen in §5.2. PH adopts tone/linkLabel/labelCase in its own change, after pinning the merged sha |
| **Packhouse** `EndOfShiftOffice.tsx:102,110,118,127` | `accent icon value sub words`, one with `unit`, one without `words` | Same as above; each shape frozen in §5.2 |
| **Packhouse** `StatusBadge` users (`BatchesView`, `DevicesView`, `BoardCardView`, `EmailLines`, `setup/packhouses/layout`) | Use `StatusBadge` only | `StatusBadge`'s code and classes are untouched; `CountBadge` is a separate export in the same file |
| **DC** (pin `5c14f37`, `package.json:57`) | `src/` has 0 `StatTile` hits; its pin predates StatTile | Nothing DC renders is touched. DC's **own** `AttentionItem` *type* (`src/lib/fleet/types.ts:330`, imported from `@/lib/fleet/...`) is a different module; DC imports kit names explicitly, so no name clash arises. §5.6 re-checks |
| **CRM, RMS, Org Admin** | Not readable in this session | StatTile first shipped in 0.10.0. §5.6 greps them and runs the CRM render check. **Not claimed until then** |
| **Kit tests** | 870/870 at the handover | Existing specs are unedited, except the export inventory gaining three declared names (§3) |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/StatTile.tsx` | Tone/labelCase/linkLabel types; new literals (`LABEL_NORMAL`, `TONE_*`, `LINKED_*`); foot; chevron rule | 80 |
| `src/components/AttentionItem.tsx` (new) | `AttentionList`, `AttentionItem`, tone chip | 110 |
| `src/components/StatusBadge.tsx` | `CountBadge` appended (StatusBadge untouched) | 35 |
| `src/components/index.ts` | Lines 91 and 292 edited; line 300 added | 3 |
| `package.json` | 0.15.0 → 0.16.0 | 1 |
| `README.md` | Changelog + two sections | 70 |

**Paper trail (not in the estimate):**
- the frozen fixture and its spec;
- the new `describe` blocks and new test file(s);
- the inventory entry;
- the browser proof and frames;
- the DC + CRM record;
- the mutation battery;
- the decision-log entry `CR-DESIGN-SYSTEM-035` (D-1 to D-9 and the owner's confirmation);
- the refreshed handover, `known-issues.md` and `technical-debt.md` (the barrel at 300 lines).

The archive takes the slot the conductor names. There is **no migration** and **no consumer pin bump**. No `runs/epic-NN/`, `milestone-NN/` or
`runs/current/epic-plan/` is created or written.

## 8. Cross-app intersection map

No shared data record is touched: the kit has no database and makes no network call. The seams are the package hand-off and the presentation contract
with the apps. **The kit writes the parts. An app reads them only after it moves its own pin to the MERGED sha on `main`, never a branch sha
(KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | StatTile `tone`/`linkLabel`/`labelCase`, `AttentionList`/`AttentionItem`, `CountBadge` → packhouse dashboard | Kit | Packhouse (CR-BANANAWORLD-PH-016 or its follow-up) | New optional props and parts | PH pins the merged sha and swaps `DashboardParts.tsx` `Tiles`/`AttentionList`/heading count onto them. PH maps its `Tone` (`bad`/`warn`/`good`/`neutral`) to `danger`/`warning`/`success`/`default` |
| S2 | Which tone a figure or row gets, and what counts | **App** decides (e.g. PH-016 D-4 waste over level → danger; D-5 aged > 0 → warning) | Kit draws | The kit decides no business state | None in the kit |
| S3 | Package hand-off to DC, CRM, RMS, Org Admin | Kit `package.json` 0.16.0 | Each app, when it moves its own pin | Additive; no dependency, token or theme change | None. §5.6 proves DC and CRM unchanged |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. S1–S3 go to `known-issues.md` at build, as for CR-030/032/034.
Whether to create the register is still the owner's decision.

## Rule sites

**No business rule changes.** When a figure is "a warning" or "danger", and what needs attention, are the packhouse's rules (PH-016 D-4, D-5, A1–A7).
The kit only draws the tone it is given (S2).

One **presentation rule** is reused by the new part, so its sites are listed:
- **Rule:** *a count of null, undefined, 0 or less shows nothing.* Today it holds for the menu's count pill. After this change it also holds for `CountBadge`,
  by calling the same helper.

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/app-menu.ts:83-85` `positiveCount` | **leave (reused)** | `CountBadge` calls it, so the rule stays written once |
| `src/components/app-menu.ts:88-93` `headingCount` | **leave** | Menu roll-up unchanged |
| `src/components/SideMenu.tsx:27-28` `CountPill` `if (count <= 0) return null` | **leave** | Its callers already pass `positiveCount(...)`. It is not refactored onto `CountBadge`, so the AppShell frozen-HTML specs (CR-032/034) stay byte-stable |
| `src/components/StatusBadge.tsx` `CountBadge` (new) | **add** | Calls `positiveCount`; renders `null` at 0 |
| `tests/components/app-menu.test.tsx` (pins `positiveCount`/`headingCount`) | **leave** | Unchanged behaviour |

**Search terms used:**
- Kit `src/`: `count`, `Count`, `positiveCount`, `CountPill`, `StatTile`, `StatusBadge`, `warning|danger|success`, `Tone|tone`, `text-accent`,
  `color-mix`, and `\b(bg|text|border)-(amber|red|green|…)-\d` (0 hits: the kit uses no raw palette classes).
- Packhouse `src/`: `<StatTile\b`, `from '@bananaworld/design-system'`.
- DC `src/`: `StatTile`, `AttentionItem`.

## 9. Residuals and open questions

- **Owner confirm (brief b):** dark foot/action words with a teal arrow (D-4), and the soft amber count bubble (D-8). If the owner insists on all-teal
  words, that is a token change. That is a separate change carrying the full QG-CEN-003 re-check, not this one.
- **Mockups: one option, by request.** The request says the look is approved and asks for "no new options". So `option-a.html` is the build as planned, and
  `comparison.html` shows it next to the approved drawing, which is labelled as reference and is not an option. No B or C was invented.
- **R1 — Tailwind generation of the arbitrary `color-mix` classes.** Tailwind 3.4 with the `color:` hint is expected to emit them. §5.4 proves it with a
  consumer's Tailwind. If one fails to generate, the fallback is the same colours through a `style` custom property on the root, still from tokens, still
  additive. The evidence will say which was used.
- **R2 — tailwind-merge and a caller's own `bg-*`/`border-*` on a toned tile.** `cn` may not detect a conflict with `bg-[color:…]`. Today no caller passes
  colours. The README says a caller's colour classes on a toned tile are unsupported. A spec records the behaviour, whatever it is.
- **R3 — `TileBody` size.** The foot may push it past the 50-line function sensor. If so, a private `TileFoot` is extracted; behaviour is unchanged and
  §5.2 guards it.
- **R4 — Version collision.** If another kit change merges 0.16.0 first, this one takes the next minor at build.
- **R5 — The DC/CRM re-check (§5.6) can come back red on an app's `main`** for reasons outside this change. That is recorded with evidence, not fixed.
- **Standing, carried:**
  - no cross-system register;
  - the 4 inert `ignoreGhsas`;
  - the gitleaks scan check;
  - the `.snap` CRLF artefact;
  - `prettier --print-width 100`;
  - CR-032/034's owed DC + CRM re-check, which §5.6 covers at a later head.

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover.
- The packhouse pins that sha in its own change and adopts the parts (S1). No other app needs to do anything.

## 11. Not an epic

This is three optional props on one existing component, one new small component pair, one small badge, docs and a version bump. It touches no service,
integration, permission model or data, and does not split into five milestones.
