# CR-DESIGN-SYSTEM-032 — the shared office app frame (`AppShell`, `UserMenu`, `PageHeader`) — Logic Plan

> Raised by the owner 2026-11-22 (Run 1 of `organization/scripts/epic-runner/epics/pending-requests/office-shell-redesign.md`;
> Run 2 is the packhouse adopting it). Mockup the owner already picked: the gist `e9f8b979…/comparison.html`, frames 1–6. Its
> source was read locally (path in §0).
> **This was a planning session only. No feature code was written.** `bananaworld-dc` and `bananaworld-ph` were only read.
> Base: `main` @ `1118553` (happy-dom bump after CR-DESIGN-SYSTEM-030, kit **0.13.0**). Branch `change/cr-design-system-032`.

<!-- OWNER-BRIEF-START -->

**What you'll get.** The office layout you picked on 22 November becomes one shared piece that any Bananaworld office app can use:
- the side menu with headings and icons, one heading open at a time, and the waiting counts;
- Help at the bottom of the menu;
- the button beside the logo that shrinks the menu to icons, remembered on each computer;
- the header with your name menu: My settings, language, Sign out and the 2-step mark;
- pages that use the full width, with only the page scrolling;
- the slide-out menu on tablets and narrow windows.

Each app keeps its own menu, words and colours.

**Please confirm.** The pictures show your design redrawn exactly as it will be built. There are three small differences:
- The count badges are light orange with dark text, which is easier to read than white on orange.
- The heading for the screen you are on shows in dark bold with a coloured icon, so it also reads well in the DC's yellow.
- When a computer has nothing remembered yet, the menu starts open.

**Not included.** No app changes in this step. The packhouse switches over in the next step. The DC and the other apps stay exactly as they are until each chooses to move.

**Risks.** If someone chose the icon menu, it may flash open for a moment when a page first loads.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Role:** planner. **Compliance heartbeat:** next estate session due **2027-01-10**, so it is not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`.** That has been the standing finding since
  CR-013. The rules come from the conductor's project rules, the estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **Re-check, 2026-11-22 (second planning session).** The conductor started this session again with the plan, estimate and
  mockups already on disk and **no owner notes recorded**, so nothing was revised. Facts re-checked and still true: `main` is
  still at `1118553`; the kit is `0.13.0` with only `react-dialog`/`react-dropdown-menu` from the two Radix families this plan
  uses; `AppShell`/`PageHeader`/`UserMenu` are absent from `src/`; DC `BrowserAdminShell.tsx` still has `:643` `bw.nav.pinned`,
  `:700`/`:887`/`:962` (the empty-group rule) and `:1263` (the 1440 px cap). `comparison.html` makes no external request and
  stacks into one column on a phone. No feature code was written in either session.
- **This is a first plan, not a revision.** No owner responses are recorded. **No clarify round was used** (3 remain). The request
  and the picked mockup settle scope, behaviour and what is out. The three presentation differences go to the owner as
  confirmations (brief b).
- **The mockup.** The gist could not be fetched (no web tool). Its generator and rendered frames were found and read locally:
  `C:/Users/USER-PC/AppData/Local/Temp/claude/d--Projects-Team-Builder/ph-ui/mock/make.cjs`, plus `f1.png`/`f2.png` from the same
  folder. The request file cites that path as the source. Its rendering facts are taken from there: 248 px side menu, 64 px
  rail, 56 px header, 24 px page padding, the `.head.act`, `.subs a.on` and `.dot`/`.cnt` treatments, and the `.umenu` content.
- **Mockups: one option only, by the owner's instruction** ("present THIS design for confirmation, not new options").
  `runs/current/mockups/CR-DESIGN-SYSTEM-032/option-a.html` and `comparison.html` redraw frames 1–6 from the same generator, with
  the three brief (b) differences applied. They add frame 7, the same frame in DC colours with a reused `EmptyState`. The pages
  are self-contained; they use inline CSS and an inline script, and make no external request. Below 620 px they scale the frames
  down to avoid sideways scroll. No `option-b`/`option-c` was made.
- **Read in this repo:** `package.json`, `src/components/index.ts` (whole, 300 lines), `Sheet.tsx`, `SlideOver.tsx`, `EmptyState.tsx`,
  `ChoiceGroup.tsx`, `Link.tsx`, `src/lib/tokens.css`, `src/lib/themes/packhouse.css`,
  `tests/components/DragBoard.additive.test.tsx:55-134`, the CR-030 plan, and the handover.
- **Read in `bananaworld-dc` (read only):** `src/components/browser-admin/BrowserAdminShell.tsx` (whole), `UserMenu.tsx`,
  `user-menu-grouping.ts`, `tailwind.config.ts` (content globs, `2xs`, the animate plugin), and the `package.json` pin `5c14f37`.
- **Read in `bananaworld-ph` (read only, for the adopter's needs; it is not an allowed write target):**
  `src/client/shell/OfficeFrame.tsx`, `PhoneMenu.tsx`, `tailwind.config.ts`, and the `package.json` pin `c7ed455`.

## 1. What exists today

| Where | What | Why it cannot simply be moved |
|---|---|---|
| DC `BrowserAdminShell.tsx:732-1065` | Rail + accordion + hover flyout, the `bw.nav.pinned` memory, count pills | Bound to DC auth, RBAC, feature flags and Next hooks (`:745-842`). Its flyout is CSS `group-hover` only (`:906`), so a keyboard cannot open it. Its accordion is a hand-rolled `aria-expanded` button (`:969-986`). Its default is the rail (`:749`); the mockup's default is open |
| DC `BrowserAdminShell.tsx:1226-1266` | Fixed header, `main` as the only scroller (`h-screen overflow-hidden`, `min-h-0 overflow-auto`) | Proven layout (CR-DC-047). It is **copied**. It also has the 1440 px cap (`:1263`), which the request removes for the frame |
| DC `UserMenu.tsx` | Radix DropdownMenu identity menu | DC-specific content (DC switcher, email). The Radix pattern and classes are copied (`:33-34`, `:66-83`) |
| PH `OfficeFrame.tsx` / `PhoneMenu.tsx` | The packhouse's flat menu and its right-side SlideOver | Run 2 replaces them. Its prop shape is the best guide to what an adopter must pass in (`OfficeFrame.tsx:19-35`) |
| Kit | No frame. `EmptyState` exists and is reused unchanged | — |

## 2. Decisions taken here (the chassis is mine; each goes in the decision log at build)

### D-1 — Three exported components; everything else stays internal

- **Exported (runtime):** `AppShell`, `UserMenu`, `PageHeader`.
- **Exported (types):** `AppShellProps`, `AppShellWords`, `AppMenuGroup`, `AppMenuItem`, `AppMenuFootItem`, `UserMenuProps`,
  `UserMenuLanguage`, `PageHeaderProps`.
- **Internal, in their own files, not exported:** `SideMenu`, `MenuRail` (with its flyout), `AppHeader`, and the pure `app-menu.ts`.
- **Why:** additive-only means **an export can never be removed**. The request names the family "for example". An adopter needs
  the frame, the user menu it hands to the header, and the page header. Exporting the inner parts would freeze their props
  forever for no adopter's benefit. If a real need appears, exporting one later is additive. Un-exporting never is.

### D-2 — The data shapes

```ts
export interface AppMenuItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** Current only on an exact path match (DC `NavLeaf.exact`). Default: the path or anything under it. */
  readonly exact?: boolean;
  /** The app's own decision (role, switch). Hidden items are never rendered and never counted. */
  readonly hidden?: boolean;
  /** A waiting count. null, undefined or 0 shows nothing (DC `leafCount`, :719-722). */
  readonly count?: number | null;
}

export interface AppMenuGroup {
  readonly id: string;
  readonly label: string;
  /** The heading's icon. The app passes its own (e.g. a lucide element). Items carry none (request (1)). */
  readonly icon: ReactNode;
  readonly items: readonly AppMenuItem[];
  /** Overrides the roll-up. Default: the sum of the VISIBLE items' counts (D-5). */
  readonly count?: number | null;
}

export interface AppMenuFootItem {   // the foot slot (request (3)); the packhouse passes Help
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: ReactNode;
  readonly hidden?: boolean;
}

export interface AppShellWords {
  readonly menu: string;          // the <nav> accessible name
  readonly openMenu: string;      // the header menu button, under 1024 px
  readonly closeMenu: string;     // the slide-out's close button
  readonly collapseMenu: string;  // beside the logo, menu open
  readonly expandMenu: string;    // on the rail
}

export interface AppShellProps {
  readonly brand: { readonly name: string; readonly mark: ReactNode };
  readonly menu: readonly AppMenuGroup[];
  readonly footItems?: readonly AppMenuFootItem[];
  /** The current path. The app passes `usePathname()`; the kit reads no router (testable, no Next hook). */
  readonly pathname: string;
  readonly breadcrumb?: ReactNode;
  /** Shown instead of the breadcrumb under 1024 px (mockup frame 5). Default: the breadcrumb. */
  readonly compactTitle?: ReactNode;
  readonly tools?: ReactNode;
  /** Normally a <UserMenu/>. */
  readonly user?: ReactNode;
  readonly words: AppShellWords;
  /** localStorage key for open/rail. Default "bw.app-shell.menu". Each app is its own origin. */
  readonly storageKey?: string;
  readonly children: ReactNode;
}
```

- **The foot slot is structured, not a free node.** In the rail the foot must shrink to an icon (mockup `rail-foot`). The kit can
  only do that if it knows the icon and the label.
- **Every word is required. No English defaults.** This follows the `PrintPreviewPanel` convention. The packhouse is bilingual and
  a silent English default would leak into Portuguese.
- **No permission logic in the kit (TECH-COMP-003).** The app decides `hidden`. The kit only obeys it (§Rule sites).

### D-3 — Layout: the page area is the only scroller (request (5))

The CR-DC-047 layout, copied:

- **Root:** `flex h-dvh overflow-hidden bg-bg`.
- **Menu column:** `h-full flex flex-col shrink-0`, width `w-[var(--layout-sidebar-width)]` (240 px; the mockup draws 248, an 8 px
  difference, and the token wins so `Sheet` and every app agree). In the rail it is `w-16` (64 px).
- **Menu scroll area:** `flex-1 min-h-0 overflow-y-auto`. Long menus scroll inside it. The brand row and the foot are `shrink-0`,
  so the foot stays pinned at the bottom.
- **Right column:** `flex-1 min-w-0 flex flex-col`.
- **Header:** `h-[var(--layout-header-height)] shrink-0` (56 px, the height `Sheet` positions itself against, `Sheet.tsx:43`).
- **`<main>`:** `flex-1 min-h-0 overflow-auto p-6`. That gives 24 px padding at every width, **no max-width and no `mx-auto`**.
- **One `<main>` landmark.** Adopters must not render a second one (§8 S7).
- `--layout-content-max-width` is **not** used and **not** changed.

### D-4 — The open side menu: Radix Accordion (request (1))

- **New dependency `@radix-ui/react-accordion`**, `type="single" collapsible`. That gives one heading open at a time, a click on the
  open heading closes it, and `aria-expanded`, `aria-controls`, region roles and arrow-key movement between headings.
  🔴 DC's hand-rolled button (`:969-986`) is exactly what the lane rule calls a regression in a shared primitive. It is not
  copied.
- **Controlled value.** On mount, and whenever `pathname` moves into a different group, the current screen's group opens (DC
  `:764-767`). A heading the person opens by hand stays open until the next navigation changes groups.
- **Heading:** icon, label, roll-up badge (D-5) and chevron. **Items:** plain text links, indented, with an optional count. **No
  icon on any item.**
- **Current screen.** The item gets `aria-current="page"`, `bg-accent-subtle font-semibold text-fg` and a 3 px inset accent bar
  (`shadow-[inset_3px_0_0_var(--color-accent)]`, the mockup's `.subs a.on`). The heading of the current group is
  **`font-semibold text-fg` with the icon in `text-accent`**, open or closed. **Deviation from the mockup, brief (b):** the mockup
  colours the heading text teal. `text-accent` as text is yellow in the DC and unreadable (`tokens.css:44`). The weight and the
  icon carry the mark in every theme. The heading also carries `data-current` for tests.
- **Links** use the kit's own `Link`, so the CR-018 busy signal works when the app mounts its provider.

### D-5 — Counts (request (1))

- **Item:** shown when `count > 0`. The accessible name becomes `"<label> — <n>"`, which is DC's form (`:1113`). The pill is
  `aria-hidden`.
- **Heading:** shows `group.count` if given, otherwise **the sum of the visible items' counts**. It shows open or closed, as the
  mockup draws it (Loads `2` in frames 1 and 6). A hidden item's count is never summed, so a number never leaks from a screen the
  person cannot open. The heading's accessible name carries the number in the same form.
- **Rail:** a dot on the heading icon (DC `:899-904`), with the number in the trigger's accessible name and the full pill in the
  flyout.
- **Colour, brief (b):** the pill is `bg-warning-subtle text-warning-fg` (#ffedd5 / #7c2d12, about 9:1). The mockup's solid amber
  with white text is about 2:1 and fails AA at 11 px. The rail dot is `bg-warning` (#ea580c, 3.3:1 against the menu grey, which
  passes the 3:1 non-text rule). The same tokens apply in every theme.

### D-6 — Hidden headings (request (1))

`visibleMenuGroups(menu)` (pure, in `app-menu.ts`, not exported) drops `hidden` items, then drops any group left with none. The
open menu, the rail and the slide-out all render from its result and only from it. Foot items are filtered the same way.

### D-7 — The rail and its flyouts: Radix NavigationMenu (request (2))

- **The collapse button sits in the brand row**, beside the name: `PanelLeftClose`, with `aria-label` and a kit `Tooltip` showing
  `words.collapseMenu`. On the rail the mark sits on top with the expand button under it (`PanelLeftOpen`, `words.expandMenu`),
  as in the mockup.
- **New dependency `@radix-ui/react-navigation-menu`**, `orientation="vertical"`. It is the Radix primitive for a navigation
  disclosure of links. It gives hover open with an intent delay, Esc to close with focus returned to the trigger, arrow keys
  between triggers, and `NavigationMenu.Link active` → `aria-current="page"`. DropdownMenu was rejected: it is `role="menu"`, the
  wrong semantics for page links, and it does not open on hover.
- **Keyboard focus opens the flyout** (request (2)). The value is controlled, and the trigger's `onFocus` sets it when the trigger
  matches `:focus-visible`. A mouse click focus does not double-open. Tab then moves into the flyout's links.
- **Each trigger** is the heading icon button. Its accessible name is the heading label (plus the count). The current group gets
  `bg-accent-subtle`.
- **The flyout is `position: fixed`.** Its `left` is the rail edge + 4 px. Its `top` is the trigger's `getBoundingClientRect().top`,
  measured on open and clamped to the viewport. **This is deliberate.** The rail list must be `overflow-y-auto` for long menus,
  and an absolutely positioned flyout would be clipped by it. `z-[var(--z-sticky)]`.
- **Flyout content:** the heading label as a small uppercase title, then the visible items as plain links with counts. This is
  the same `MenuItems` renderer the accordion uses (one renderer, two places).
- **Foot items in the rail:** the icon link, with `aria-label` and a kit `Tooltip`. `AppShell` mounts its own `TooltipProvider`
  around the menu, so adopters need nothing extra.

### D-8 — Remembering open or rail

- The stored values are `"open"` and `"rail"` under `storageKey`. Anything else, or nothing, means **open** (the mockup's frame 1;
  brief (b)). Writes happen on toggle. Read and write errors are swallowed (DC `:754-760`, `:771-777`).
- **It is read in a mount effect, never during render.** That keeps server and client first paint identical (open). A rail user
  therefore sees the open menu for one frame before the rail appears: the brief's risk. A cookie the server could read would
  remove it, but that needs the app's server, so it is the adopter's option (R2). It is not built here.
- Under 1024 px the stored mode is ignored: the menu is hidden and the slide-out is always open-style.

### D-9 — Under 1024 px: the slide-out (request (6))

- **The side column is `hidden lg:flex`** (`lg` = 1024 px; neither DC's nor PH's Tailwind config overrides `screens`, which was
  checked. CRM, RMS and Org Admin get checked at build).
- **The header shows a menu button `lg:hidden`** (`Menu` icon, `words.openMenu`). It is a `Dialog.Trigger`, **Radix Dialog**
  (already a dependency), so focus returns to it on close.
- **The slide-out content** is `fixed inset-y-0 left-0`, `w-[var(--layout-sidebar-width)] max-w-[85vw]`, over a `bg-fg/40` scrim
  (the `SlideOver` overlay classes). Radix gives the focus trap, Esc, tap outside to close and the scroll lock. It has a
  `Dialog.Title` (`sr-only`, `brand.name`) and a close button (`X`, `words.closeMenu`) in place of the collapse button, as
  mockup frame 6 draws it.
- **It holds the same `SideMenu`** (the accordion, the counts, the foot), never the rail.
- **Choosing a screen closes it.** It closes on the link's click and again when `pathname` changes (PH `PhoneMenu.tsx:24`).
- **The slide motion is a plain `transition-transform` on `data-state`, not `tailwindcss-animate`.** The DC loads that plugin
  (`tailwind.config.ts:2,122`); the packhouse config was not seen to, so the `SlideOver` animate classes would be inert there.
  Owed check at build: if the PH config does load it, the build may use the same classes as `SlideOver`.

### D-10 — The header and the user menu (request (4))

- **Header** (internal `AppHeader`): `[menu button (narrow)] [breadcrumb (lg) | compactTitle (narrow)] … [tools] [user]`, with
  `bg-surface border-b border-border px-5`. Everything inside the slots belongs to the app (the trace box, Ask, Help).
- **`UserMenu`** is Radix **DropdownMenu** (already a dependency), DC's pattern (`UserMenu.tsx:65-83`):

```ts
export interface UserMenuLanguage {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { readonly id: string; readonly name: string }[];
  readonly onChange: (id: string) => void;
}
export interface UserMenuProps {
  readonly name: string;
  readonly initials: string;
  readonly triggerLabel: string;               // accessible name of the trigger
  readonly rolesLine?: string;                  // "Order centre · Senior manager · …"
  readonly secondStep?: string | null;          // "2-step sign-in on"; null/undefined = no mark
  readonly settings?: { readonly href: string; readonly label: string; readonly hint?: string };
  readonly language?: UserMenuLanguage;         // optional: the DC has no language choice
  readonly signOut: { readonly label: string; readonly onSelect: () => void };
}
```

- **Trigger:** an avatar (`bg-accent text-fg-on-accent`), the name (`hidden lg:inline`, truncated at 180 px) and a chevron.
  `data-[state=open]:border-accent`.
- **Content:** the identity block (name, roles line, the 2-step mark with a shield icon in `text-success-fg`). Then **My settings**
  (`DropdownMenu.Item asChild` around the kit `Link`, with the hint on the right). Then **Language**, a `DropdownMenu.Label`
  followed by a `DropdownMenu.RadioGroup` whose `RadioItem`s are styled as a segmented control; the selected one is
  `bg-accent text-fg-on-accent`. Each `onSelect` calls `preventDefault()`, so the menu stays open and shows the new choice. Then
  **Sign out** (`text-danger`, separator above).
  🔴 The segments are Radix menu radio items, **not** `ChoiceGroup`. A RadioGroup nested inside a menu fights the menu's own arrow
  keys and typeahead. `RadioItem` is the Radix control made for exactly this place.
- `z-[var(--z-dropdown)]` and portalled, as DC.

### D-11 — `PageHeader` (request (7))

```ts
export interface PageHeaderProps {
  readonly title: ReactNode;          // rendered as the page's <h1>
  readonly description?: ReactNode;   // one line under it
  readonly actions?: ReactNode;       // right-aligned
  readonly className?: string;
}
```

- `flex flex-wrap items-start justify-between gap-3 mb-4`.
- **Title:** `text-[length:var(--font-size-h2)] font-semibold tracking-tight` (22 px = the mockup's `.ph h1`).
- **Description:** `mt-1 text-sm text-fg-muted`.
- **Actions:** `flex items-center gap-2`. On a narrow page they wrap under the title.
- "One line" is a content rule for the adopter. Truncating would hide words.
- Empty pages use the existing `EmptyState` **unchanged**. The README shows the pairing.

### D-12 — Focus, names, sensors, dependencies

- **Focus:** every interactive element has `focus-visible:outline-none focus-visible:shadow-focus` (the kit convention).
- **Names:** `<nav aria-label={words.menu}>` in all three modes.
- **Code style:** `"use client"` on every component file. Lucide is used for the kit's own chrome icons only (chevrons, the panel
  toggles, `Menu`, `X`, `Shield`, `Globe`, `Settings`, `LogOut`).
- **Sensors:** no function over 50 lines (RC-04). `index.ts` is at the 300-line RC-05 line today, so every added export line needs
  a comment line folded. Comment text only; no export moves (the CR-028 and CR-030 practice).
- **Two new runtime dependencies,** pinned to the caret range of the Radix family already locked:
  `@radix-ui/react-accordion` and `@radix-ui/react-navigation-menu`.
  At build: `pnpm why @radix-ui/react-dismissable-layer` should show **one** version. A second copy would split Radix's layer
  stack, and Esc ordering between a flyout and a dialog would then be unreliable. `pnpm audit --prod --audit-level=high` must
  exit 0.

## 3. Barrel, version, README

- **`src/components/index.ts`:** one export block for the three runtime names and the eight types (about 4 lines), with the same
  number of comment lines folded (D-12).
- **`tests/components/DragBoard.additive.test.tsx`:** `"AppShell"`, `"PageHeader"` and `"UserMenu"` under `ADDED_SINCE_011`, with the
  CR id. This inventory is what holds "added exactly these and nothing else".
- **`package.json`:** `version` **0.13.0 → 0.14.0** (an additive minor), plus the two dependencies. `pnpm-lock.yaml` regenerated.
- **`README.md`:** Changelog **0.14.0** and an "App frame" section covering:
  - the props;
  - the words;
  - the one-`<main>` rule;
  - the `pathname` and `hidden` contracts;
  - `EmptyState` with `PageHeader`;
  - the CSP-free, token-only colours;
  - the new dependencies.

## 4. Why this is additive

Everything is new files and new names. No existing component, prop, default, class string, token or export changes.
`tokens.css` and `packhouse.css` are untouched. A consumer that imports none of the three names runs no new code.

The new dependencies only enter a consumer's install when that consumer moves its pin, and they render nothing unless imported.
**No consumer re-exports the kit with `export *`**, which was searched in DC, RMS, Org Admin, PH `src/` and the whole CRM tree.
So the three new names cannot collide with an app's own `UserMenu` (DC has one, `browser-admin/UserMenu.tsx`) or with a
`PageHeader`. DC's barrel re-exports named items only (CR-030 §6).

## 5. Proof (to be done at build, NOT claimed now)

1. **Re-measure the baseline first** at `1118553` (CR-030 recorded 803/803). Use
   `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000`.
2. **Additive proof:** `git diff 1118553 --stat -- src/` lists only the seven new files and `components/index.ts`. The `index.ts`
   diff is added exports plus folded comments only. Every other kit test passes **unedited**, apart from the three inventory lines.
3. **Unit tests** (happy-dom; `matchMedia` and `localStorage` stubbed). Planned spec files: `tests/components/AppShell.test.tsx`,
   `UserMenu.test.tsx`, `PageHeader.test.tsx`, `tests/components/app-menu.test.ts`.
   - **Open:** every visible heading has its icon, and items have none. The current item has `aria-current="page"`. The current
     group's heading is marked while open and **while closed**. The foot item renders, and is pinned outside the scroll area.
   - **Accordion:** the current group opens on mount. Opening another closes the first. Clicking the open one closes it. A
     `pathname` change into another group opens that group. `aria-expanded` is right in each step. Arrow keys move between
     headings.
   - **Badges:** an item count shows and goes into its accessible name. The heading roll-up sums only visible items, `group.count`
     overrides it, and 0, null and undefined show nothing. The rail dot appears, with the count in the trigger name.
   - **Hidden:** a hidden item is absent from all three modes. A group with all items hidden is absent from all three, and so are
     its counts. A hidden foot item is absent.
   - **Rail:** the collapse button switches to the rail and writes `"rail"`. Expand writes `"open"`. Hover opens a flyout listing
     exactly the visible items. Keyboard focus (`userEvent.tab`) opens it, Tab reaches its links, and Esc closes it with focus
     back on the trigger. The flyout's current item has `aria-current`.
   - **Persistence:** a stored `"rail"` mounts as the rail after the effect. A junk value or nothing gives open. A throwing
     `localStorage` is not fatal. A custom `storageKey` is honoured. `renderToString` renders open and touches no storage.
   - **Narrow:** the menu button opens the dialog and focus is inside it. Tab stays inside. Esc closes and focus returns to the
     button. A scrim click closes. Choosing an item closes. A `pathname` change closes. The dialog holds the same accordion and
     never the rail.
   - **User menu:** the trigger name is right. The name, roles line and 2-step mark show only when given. My settings is a link
     to `settings.href`. The language segments are radio items with `aria-checked`; choosing one calls `onChange(id)` once and the
     menu stays open. Sign out calls `onSelect` once. With no `language` there is no segment. Keyboard: Enter opens, arrows
     move, Esc closes with focus returned.
   - **PageHeader:** a single `<h1>`. The description and actions are optional.
   - **Words:** every visible word comes from props (a source-reading guard finds no English literal in the new files).
   - **Layout classes:** a source and DOM guard checks:
     - `<main>` has `overflow-auto` and `p-6`;
     - `<main>` has no `max-w-`/`mx-auto`;
     - the root is `h-dvh overflow-hidden`;
     - the file has no hex colour;
     - the file has no `window.open`.
   - **axe:** 0 violations in each state (open, rail with flyout open, narrow dialog open, user menu open).
4. **Real browser** (the committed Edge driver pattern, `runs/change-26/evidence/browser-proof/proof.mjs`, with a scratch fixture
   outside the estate tree). It uses the packhouse menu from the mockup, in packhouse teal and DC yellow.
   - **Sizes:**
     - 1440×900 for frames 1–4;
     - 820×1000 for frames 5–6;
     - plus 1920×1080 and 390×844.
   - **Frames:** the build renders the mockup's six states, then compares them **side by side with `f1.png`…`f6.png`** in a
     contact sheet in `runs/change-NN/evidence/frames/`. Any visible difference beyond the three brief (b) items and the
     240-vs-248 px width is listed as a defect or a justified deviation.
   - **Measured:** after a 4,000 px wheel on `main`:
     - the header and menu `getBoundingClientRect()` are unchanged;
     - `document.scrollingElement.scrollHeight === innerHeight`;
     - `main.scrollTop > 0` (the CR-DC-047 measurement).
   - **More measurements:**
     - at 1920 px, `main`'s content box spans from the menu's right edge to the viewport minus 24 px on each side;
     - `scrollWidth === innerWidth` at 390 px;
     - a long menu (all groups open, at 1366×640) scrolls inside the menu while the foot stays in view;
     - the flyout is not clipped by the scrolling rail.
   - **Behaviour:**
     - keyboard-only: the flyout opens on Tab focus;
     - the slide-out: focus is trapped and returns to the button;
     - Esc behaves in each layer;
     - axe (including contrast) shows 0 violations in each state, in both themes.
5. **DC + CRM render check** (the CR-015 method, `runs/change-12/evidence/dc-crm-recheck.md`):
   - use fresh clones in `%TEMP%`, on a throwaway branch where only the kit pin moves to this branch's head;
   - run each app's unit suite, typecheck, build and screenshot set, before and after;
   - expected result: suite-identical and pixel-zero;
   - no app's `main` pin moves, and no estate folder is touched.
   This is not strictly required by the request. It is the honest proof of "every existing caller renders byte-identically" when
   the lockfile gains packages.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant must turn a
   **named** spec red:
   - accordion `type="multiple"`;
   - the roll-up counts hidden items;
   - the empty-group filter removed;
   - the current-heading mark only when open;
   - the flyout does not open on focus;
   - the stored value is read during render;
   - a junk stored value means rail;
   - the narrow dialog has no focus return (trigger not a `Dialog.Trigger`);
   - choosing an item does not close the slide-out;
   - `max-w-[1440px]` is added to `main`;
   - `onSelect` on a language item does not `preventDefault`.
7. **Other checks:**
   - `pnpm typecheck`;
   - `pnpm audit --prod --audit-level=high`;
   - `pnpm why @radix-ui/react-dismissable-layer` (D-12);
   - `quality-sensors.mjs`, LF-normalised;
   - `prettier --check --print-width 100` on the touched files.

## 6. Existing callers checked (the additive claim)

| Caller | What was found | Why unaffected |
|---|---|---|
| **DC** (pin `5c14f37`) | Its own `BrowserAdminShell` / `UserMenu` (not kit components). No `export *` of the kit in `src/` | No kit file DC renders changes. The new names never reach DC's barrel unless DC adds them. Re-checked anyway (§5.5) |
| **CRM** | No `export *` of the kit anywhere in its tree | Re-checked anyway (§5.5) |
| **RMS, Org Admin** | No `export *` of the kit in `src/` | Nothing is visible to them unless they import it |
| **Packhouse** (pin `c7ed455`) | `OfficeFrame` / `PhoneMenu` use the kit's `SlideOver` only (`PhoneMenu.tsx:5`) | `SlideOver.tsx` is untouched. The packhouse adopts the frame in Run 2 after pinning the merged sha |
| **Kit tests** | Export inventory pinned | Three declared lines added (§3). Every other test is unedited |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/app-menu.ts` | New, pure: types, `visibleMenuGroups`, `isMenuItemCurrent`, `currentGroupId`, `headingCount`, mode read/write | 95 |
| `src/components/AppShell.tsx` | New: layout root, mode state, narrow Dialog, `TooltipProvider` | 175 |
| `src/components/SideMenu.tsx` | New, internal: brand row, Radix Accordion, `MenuItems`, foot | 175 |
| `src/components/MenuRail.tsx` | New, internal: Radix NavigationMenu rail and fixed-position flyout | 160 |
| `src/components/AppHeader.tsx` | New, internal: header slots, narrow menu button | 60 |
| `src/components/UserMenu.tsx` | New: Radix DropdownMenu | 140 |
| `src/components/PageHeader.tsx` | New | 35 |
| `src/components/index.ts` | Export block + folded comments | 8 |
| `package.json` | Version + two dependencies | 3 |
| `pnpm-lock.yaml` | Regenerated for the two dependencies | ~40 (generated) |
| `README.md` | Changelog + "App frame" | 70 |

**Paper trail (not in the estimate):**
- the four spec files and the three inventory lines;
- the browser fixture, proof, frames and contact sheet;
- the DC + CRM record;
- the mutation battery;
- decision-log entry `CR-DESIGN-SYSTEM-032` (D-1 to D-12 and the owner's confirmation);
- the refreshed handover and `known-issues.md`.

The archive goes in the slot the conductor names. There is no migration. **No consumer pin is bumped.** No `runs/epic-NN/`,
`milestone-NN/` or `runs/current/epic-plan/` is created or written.

## 8. Cross-app intersection map

No shared data record is touched: the kit has no database and makes no network call. The seams are the package hand-off and the
contracts between the frame and the app that hosts it. **The kit writes the frame. Each app reads it only when it moves its own
pin, to the MERGED sha on `main`, never a branch sha (KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | Frame → packhouse office screens | Kit | Packhouse (Run 2) | New exports | **Run 2** pins the merged sha and maps `office-nav.ts` to `AppMenuGroup[]`. Its permission checks set `hidden`, unchanged. It also supplies EN + PT words, moves My settings, language, Sign out and the 2-step mark into `UserMenu`, and puts Help in `footItems` (hidden when the help switch is off) |
| S2 | Who may see a screen | **App** sets `hidden` | Kit obeys | The kit hides; it never decides (TECH-COMP-003) | Each adopter keeps its server-side route checks; the menu is presentation only |
| S3 | Waiting counts | **App** supplies `count` | Kit shows, sums visible items | D-5 | The adopter fetches the numbers (PH: load changes waiting) |
| S4 | Language choice | Kit emits `onChange(id)` | **App** persists and re-renders | D-10 | PH maps its `LanguageChip` logic to `onChange` |
| S5 | Sign out | Kit calls `signOut.onSelect` | **App** runs its sign-out (PH server action) | D-10 | PH passes its existing action |
| S6 | Open/rail memory | Kit writes `localStorage[storageKey]` on the app's own origin | Kit | D-8 | DC's existing `bw.nav.pinned` is a different key with the opposite default. If DC adopts, its own change decides whether to migrate that memory |
| S7 | One `<main>`, page padding and width | Kit owns `<main>`, `p-6`, no cap | App pages | D-3 | Adopters remove their own `<main>`, their max-width cap and their outer padding (PH `OfficeFrame.tsx:108`) |
| S8 | The two new Radix packages | Kit `package.json` | Every consumer's install, when it moves its pin | D-12 | None. The §5.5 re-check proves DC and CRM render unchanged with them installed |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. S1–S8 go to `known-issues.md` at build, as for
CR-030. Whether to create the register stays the owner's call.

## Rule sites

**No business rule changes.** Who may open which screen stays each app's rule (DC `canShow` `BrowserAdminShell.tsx:802-824`; PH
`office-nav.ts`, per the Run 2 request). The kit only obeys `hidden` (S2).

One **presentation rule** is carried into the kit, so it is listed the same way: *a heading whose items are all hidden is not
shown.* Today it is spelled in DC only. After this change it is also spelled once in the kit.

| Site | Change / leave | Reason |
|---|---|---|
| DC `src/components/browser-admin/BrowserAdminShell.tsx:700` `runs.filter((run) => run.items.length > 0)` | **leave** | DC's own shell, another app's lane. It applies only until DC adopts the frame |
| DC `BrowserAdminShell.tsx:887` `if (runs.length === 0) return null;` (rail) | **leave** | Same |
| DC `BrowserAdminShell.tsx:962` `if (runs.length === 0) return null;` (accordion) | **leave** | Same |
| PH `src/client/shell/OfficeFrame.tsx:55-60` / `PhoneMenu.tsx:43-48` | **leave** | Flat list: a group label shows only when an item follows it, so an empty group never shows. Run 2 replaces both files |
| Kit `src/components/app-menu.ts` `visibleMenuGroups` (new) | **add** | The single place; all three modes render from it (D-6) |

**Search terms used:**
- DC `BrowserAdminShell.tsx`: `runs.length === 0|items.length > 0|toRuns|canShow`.
- PH `src/client/shell/`: `group !== items\[index - 1\]`.
- Kit `src/`: `AppShell|SideMenu|MenuRail|PageHeader|UserMenu`, all absent today.
- `export \* from ["']@bananaworld/design-system` in DC `src/`, RMS `src/`, Org Admin `src/`, PH `src/` and the CRM tree (excluding
  `node_modules`). All returned no matches.
- DC and PH `tailwind.config.ts`: `screens|content|design-system|2xs|animate`.

## 9. Residuals and open questions

- **Owner confirmation (brief b):**
  - the badge colour (D-5);
  - the current-heading mark (D-4);
  - the menu starting open by default (D-8).
- **R1 — Width:** 240 px (token) against the mockup's 248 px. It is shown in the comparison page and listed in the frame comparison.
- **R2 — Rail flash on first load** (D-8). The remedy is the adopter's: a cookie read on the server, passed as an initial mode.
  That would need an optional `initialMenuMode` prop, an additive later change, and it is not built now.
- **R3 — happy-dom and NavigationMenu hover.** Radix's pointer-intent timing may not simulate faithfully in happy-dom. If the hover
  unit spec cannot be made reliable, hover is proven in the real browser (§5.4) and the unit suite keeps the keyboard and click
  paths. The evidence will say so, not hide it.
- **R4 — Tailwind breakpoints in CRM, RMS and Org Admin** are unchecked here. They only matter when one of them adopts.
- **R5 — Version collision:** if another kit change merges 0.14.0 first, this one takes the next minor at build.
- **R6 — The re-check (§5.5) can come back red on an app's `main`** for reasons outside this change. That would be recorded with
  evidence, not fixed (the CR-015 practice).
- **R7 — Size.** About 900 lines of component code is near the one-session guide. It is still one component family in one package
  (§11).
- **Standing, carried:**
  - no cross-system register;
  - no CR-008 decision-log entry;
  - 4 inert `ignoreGhsas`;
  - OQ-8;
  - the `.snap` CRLF artefact (do not stage);
  - `prettier --print-width 100`;
  - the gitleaks scan check (K-1);
  - the CR-030 DC + CRM re-check and battery, which are still owed; this change's §5.5 covers a later head, and the record says
    so.

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover.
- **Build note for packhouse Run 2:**
  - pin the merged sha;
  - follow S1, S4, S5 and S7;
  - pass `usePathname()` as `pathname`;
  - pair every empty page's `EmptyState` with a `PageHeader`.
- DC, CRM, RMS, Org Admin, Hub and Manga Verde see nothing until they move their own pins, and nothing changes for them when they
  do.

## 11. Not an epic

This is one component family in one package: three exports, four internal files, a barrel block, docs and a version bump. It
touches no service, integration, permission model or data. The work does not split into five independently controlled
milestones: the menu, rail, header and slide-out share one state and one layout and only work together. The packhouse
adoption is already its own separate change (Run 2), raised by the owner.
