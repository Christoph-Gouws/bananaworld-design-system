# CR-DESIGN-SYSTEM-034 — AppShell top items (a menu slot above the first heading) — Logic Plan

> Raised 2026-11-23 for CR-BANANAWORLD-PH-016 (the packhouse landing dashboard), seam S1 of that change's plan §1. The owner approved the mockup that day
> (gist `cae4760f…/comparison.html`, which shows the Dashboard item above the six headings). Its source was read locally at
> `worktrees/CR-BANANAWORLD-PH-016/runs/current/mockups/CR-BANANAWORLD-PH-016/option-a.html`.
> **This was a planning session only. No feature code was written.** The sibling `bananaworld-dc` copy was only read.
> Base: `main` @ `f5ec58c` (CR-DESIGN-SYSTEM-032, kit **0.14.0**). Branch: `change/cr-design-system-034`.
> Role: **Solution Architect Agent (planner)**. At build: Frontend Agent (components and tests), then QA.

<!-- OWNER-BRIEF-START -->

**What you'll get.** The shared office menu gets a place for one or two links above the headings. The packhouse will use it for Dashboard, as in the design you approved today:
- In the full menu, Dashboard comes first, with its icon. It lights up like any screen you are on.
- In the slim icon menu, it is the first icon, and its name shows when you point at it.
- On tablets and phones, it comes first in the slide-out menu.

It works with the keyboard alone, and screen readers say which screen you are on. Each app can hide the link from people who should not see it.

**Please confirm.** Option A matches your drawing: Dashboard sits directly above the headings. Option B adds a thin line under it. I recommend A.

**Not included.** The packhouse does not change yet; it adds Dashboard in its own step. There is no "new" tag on the link. Every other app looks exactly as it does today.

**Risks.** Nothing changes for an app until it adds a link of its own.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md` line 1 says the next estate session is due **2027-01-10**. It is not overdue.
- **This worktree has no `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md`.** That has been the standing finding since CR-013. The rules
  come from the conductor's project rules, the estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **This is a first plan, not a revision.** No earlier `CR-DESIGN-SYSTEM-034.md` existed and no owner responses are recorded. **No clarify round was
  used** (3 remain). The request, the PH-016 plan §1 and the approved mockup settle the scope. The one look-and-feel choice (a divider or none) goes
  to the owner as a mockup pick, with A recommended because it matches the approved drawing.
- **Read in this repo:**
  - `package.json`;
  - `src/components/{app-menu.ts, AppShell.tsx, SideColumn.tsx, SideMenu.tsx, MenuRail.tsx}` (whole);
  - `src/components/index.ts:280-299`, plus the grep for `forwardRef` in `Link.tsx`;
  - `tests/components/AppShell.test.tsx:1-110` and its full `describe`/`it` list;
  - the `describe`/`it` list of `tests/components/app-menu.test.tsx`;
  - `tests/components/DragBoard.additive.test.tsx:55-137`;
  - the CR-032 plan (whole) and the handover.
- **Read in `CR-BANANAWORLD-PH-016` (another lane's worktree, read only):**
  - the logic plan, lines 1-80 plus grep hits at 256-257 and 376 (S1, `exact: true`, `OFFICE_TOP`);
  - `src/client/shell/OfficeFrame.tsx`, grep hits at 5, 45, 67-70 (today's `AppShell` call);
  - the mockup `option-a.html`, lines 1-68 plus the grep hits for the menu rows.
- **Read in the DC sibling (read only):** `package.json:57`, which pins the kit at `5c14f37`. A grep of `src/` for `AppShell|AppMenuFootItem|footItems`
  returned 0 files.
- **Not readable in this session:** CRM, RMS and Org Admin. Their part of the additive claim is checked at build (§5.5) and is not claimed here.

## 1. What exists today

| Where | What | Why it cannot draw the Dashboard item |
|---|---|---|
| `app-menu.ts:19-35` | `AppMenuGroup` (heading + items) and `AppMenuFootItem` (`id`, `label`, `href`, `icon`, `hidden`) | Every screen lives under a heading. A one-item heading would draw "Dashboard ›" with "Dashboard" again under it (PH-016 plan §1) |
| `AppShell.tsx:38-55` | `AppShellProps` has `menu` and `footItems` only | `footItems` are pinned at the **bottom** (`SideMenu.tsx:173-177`, `MenuRail.tsx:179`) |
| `SideMenu.tsx:56`, `MenuRail.tsx:61` | The kit's "on" styles: the item style (`bg-accent-subtle font-semibold text-fg` + 3 px inset accent bar) and the rail style (`bg-accent-subtle text-accent`) | Reused as they are (D-3, D-4) |
| `app-menu.ts:53-58` | `isMenuItemCurrent(item, pathname)`, with `exact` honoured | Reused unchanged (D-6) |

## 2. Decisions (the build records each one in the decision log)

### D-1 — The shape: a new `AppMenuTopItem` that is `AppMenuFootItem` plus an optional `exact`

```ts
/** An item above the first heading: a foot item's shape, plus `exact` (current only on an exact path match). */
export interface AppMenuTopItem extends AppMenuFootItem {
  readonly exact?: boolean;
}
// AppShellProps gains ONE optional field:
/** Drawn above the first heading in every mode (the packhouse puts Dashboard here). Absent = nothing drawn. */
readonly topItems?: readonly AppMenuTopItem[];
```

- **Why not `readonly AppMenuFootItem[]` word for word.** The request also says "current-marked with `isMenuItemCurrent`, `exact` honoured". `AppMenuFootItem`
  has no `exact` field. The PH-016 plan passes `exact: true` (its line 256-257). In a literal, that would be a TypeScript excess-property error against
  `AppMenuFootItem`.
- **Why not add `exact` to `AppMenuFootItem` itself.** Foot items mark "current" by `pathname === item.href` (`SideMenu.tsx:115`, `MenuRail.tsx:102`).
  A field the foot ignores would mislead. A foot that honoured it would change foot behaviour, and the lane forbids that.
- **The spec is still met.** It is the same shape as the foot items, so any `AppMenuFootItem[]` can be assigned to `readonly AppMenuTopItem[]`. The
  name is new and type-only, so it is additive.
- **No `count` on a top item.** The request's shape has none, and the mockup draws none. A later additive change can add one if an app needs it.

### D-2 — Filtering: one pure helper

`visibleTopItems(items?: readonly AppMenuTopItem[]): AppMenuTopItem[]` goes in `app-menu.ts`. It is not exported from the barrel. It returns
`(items ?? []).filter((item) => item.hidden !== true)`. `AppShell` calls it once, beside `visibleMenuGroups` (`AppShell.tsx:109`), and passes the result
down. All three modes render from that one result. The foot's own inline filter (`AppShell.tsx:110`) is **left as it is**.

### D-3 — The open menu: an item row above the accordion

- **New internal `TopLinks` in `SideMenu.tsx`.** It is rendered inside the scroll area (`SideMenu.tsx:161`), **before** `<Accordion.Root>`, and **only when
  the list is non-empty**.
- **Markup:** `<ul className="mb-0.5 flex flex-col gap-0.5">`, with one `<li>` per item, each holding the kit `Link`. Using the kit `Link` keeps the CR-018
  busy signal.
- **Row geometry is the heading's** (`SideMenu.tsx:77-79`): `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm no-underline text-fg-muted
  hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus`.
- **Contents:** the icon in an `aria-hidden` `h-5 w-5` span, then the truncated label. There is **no chevron and no count**, and it is **not** an
  accordion trigger, so it has no `aria-expanded`.
- **Current:** `aria-current="page"`, plus the exact item "on" string from `SideMenu.tsx:56`:
  `bg-accent-subtle font-semibold text-fg shadow-[inset_3px_0_0_var(--color-accent)]`. That is the mockup's teal fill and inset bar in the packhouse
  theme. In DC yellow it stays readable, because the text is `text-fg` (CR-032 D-4).
- **`onClick={onNavigate}`**, so choosing it closes the slide-out (D-5).
- **Option B only** (if the owner picks it): the `<ul>` also gets `border-b border-border pb-2 mb-2`.

### D-4 — The 64 px rail: an icon link inside the Radix NavigationMenu, no flyout

- **New internal `RailTopLink` in `MenuRail.tsx`.** It is rendered **inside `<NavigationMenu.List>`**, before the group triggers (`MenuRail.tsx:165-166`):

```tsx
<NavigationMenu.Item>
  <Tooltip>
    <TooltipTrigger asChild>
      <NavigationMenu.Link asChild active={current}>
        <Link href={item.href} aria-label={item.label} className={…}>
          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
        </Link>
      </NavigationMenu.Link>
    </TooltipTrigger>
    <TooltipContent side="right">{item.label}</TooltipContent>
  </Tooltip>
</NavigationMenu.Item>
```

- **Why inside the List.** Radix puts a list-level `NavigationMenu.Link` into the menu's own focus group, so **Tab and the arrow keys** move from
  Dashboard to the first heading icon and back. `active` gives `aria-current="page"` from Radix itself. There is no `Trigger` and no `Content`, so **no
  flyout** can open (request).
- The kit `Link` is `forwardRef` (`Link.tsx:126`), so both `asChild` slots can pass their ref and props through.
- **Classes:** the rail trigger geometry (`MenuRail.tsx:59-60`) plus `no-underline`. When current, it adds the rail "on" (`bg-accent-subtle text-accent`)
  and the item inset bar, `shadow-[inset_3px_0_0_var(--color-accent)]`. The bar tells "you are on this screen" apart from "you are in this heading".
- **The accessible name is the label (`aria-label`), and the tooltip shows the same label.** The foot icon in the rail already does this
  (`MenuRail.tsx:97-108`).
- **Hover and focus over the top link never open a flyout.** If a group flyout is open when the pointer moves onto it, Radix closes that flyout after
  its normal leave delay, exactly as when the pointer moves off the rail.

### D-5 — Under 1024 px: the slide-out

The slide-out renders the same `SideMenu` (`AppShell.tsx:82-94`). It gets the same `topItems` and therefore the same `TopLinks`, first in its scroll
area. Choosing one closes the slide-out, in two ways: through `onNavigate`, and through the existing `pathname` effect (`AppShell.tsx:107`). The
slide-out code needs no new behaviour, only the one passed prop.

### D-6 — "Current" for a top item

- **The rule:** `isMenuItemCurrent(item, pathname)`, unchanged, with `exact` honoured. `/dashboard` with `exact: true` is current at `/dashboard` and **not**
  at `/dashboard/x`. Without `exact`, it is current at both.
- **Top items take no part in `currentGroupId`.** The heading "current" mark (`SideMenu.tsx:165`, `MenuRail.tsx:170`) is unchanged.
- **Edge case: a top item and a menu item could both match.** That happens when a top item has a short, non-exact href, such as `/` without `exact`.
  Both are then marked. The kit follows the request and does not arbitrate. The README tells adopters to set `exact` on any top item whose path
  prefixes other screens. PH-016 already passes `exact: true` (R1).

### D-7 — Absent means absent: the byte-identity guarantee

In all three modes, nothing new is rendered when `topItems` is `undefined`, `[]`, or holds only hidden items. That means no empty `<ul>`, no wrapper, no
added class and no changed attribute. That is the additive claim. §5.2 proves it against HTML frozen at `f5ec58c`.

### D-8 — Nothing else moves

- No new words: the label comes from the item.
- No new dependency. No default changes. No existing class string, prop, export or token changes.
- `storageKey`, the rail memory, the layout and `<main>` are untouched.

## 3. Barrel, version, README

- **`src/components/index.ts:299`:** `export type { AppMenuGroup, AppMenuItem, AppMenuFootItem, AppMenuTopItem } from "./app-menu";`. This edits that one
  line and adds no line, so the file stays at 299 lines, under the RC-05 300-line sensor. 🔴 Never run prettier on `index.ts`.
- **`package.json`:** `version` goes from **0.14.0 to 0.15.0** (an additive minor). No dependency changes, so `pnpm-lock.yaml` is untouched.
- **`README.md`:**
  - a Changelog entry for **0.15.0**;
  - in the "App frame" section (`README.md:323`), a `topItems` paragraph covering the shape, the three modes, the `hidden` rule, and the advice to use
    `exact` on short paths.
- **Export inventory (`DragBoard.additive.test.tsx`):** **unchanged.** `AppMenuTopItem` is a type, so it adds no runtime key, and the spec's runtime count
  stays exact.

## 4. Why this is additive

- `AppShellProps` gains one **optional** field. The barrel gains one **type** name.
- Every other change is inside files that are not exported (`SideMenu`, `MenuRail`, `app-menu` helpers), and each new branch is guarded by "the list
  is non-empty".
- No default, class string, word, export or dependency changes.
- A caller that passes no `topItems` gets the DOM it got at `f5ec58c`. This is proven against frozen HTML, not argued (§5.2).

## 5. Proof (to be done at build; nothing here is claimed as done)

1. **Re-measure the baseline first** at `f5ec58c`. The handover records 850/850. Run
   `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000`.
2. **Frozen-HTML byte identity (the CR-018 frozen-copy pattern).** This step runs **before any component edit**:
   - Commit `tests/components/fixtures/app-shell-034-frozen.ts`. It holds the rendered HTML, captured at `f5ec58c`, of three states:
     - the open menu;
     - the rail, with a flyout closed;
     - the slide-out, open.
   - Use the PH-style call (menu + `footItems`, no `topItems`) and the fixture `MENU` from `AppShell.test.tsx:46-69`.
   - After the change, the spec renders the same three states three ways: with `topItems` absent, as `[]`, and as `[{…, hidden: true}]`. It asserts
     `innerHTML` equals the frozen strings.
   - It also renders `renderToString` and checks that against a frozen SSR string.
   - **Radix ids:** `useId` values must be normalised the same way on both sides, so the comparison is about structure, not id counters. The
     normaliser is written once and used for both the capture and the check.
3. **Unit tests.**
   - **`tests/components/app-menu.test.tsx`.** The existing file is `.tsx`; the request says `.ts`, and the existing file is used. Cases:
     - `visibleTopItems`: hidden items are dropped, and `undefined` gives `[]`;
     - `isMenuItemCurrent` on a top item: with `exact: true` it is current only on equality; without it, sub-paths also count.
   - **`tests/components/AppShell.test.tsx`, new `describe("top items")`:**
     - **Open:**
       - the Dashboard link comes before the first heading trigger in document order (`compareDocumentPosition`);
       - it has its icon, no chevron and no `aria-expanded`;
       - when current, it has `aria-current="page"` and the on-style classes, and on another path it has neither;
       - the current heading's mark is unaffected.
     - **Rail:**
       - the link's accessible name is the label, and it is the first focusable item inside the rail `<nav>`;
       - `aria-current="page"` is set when current;
       - Tab from the expand button reaches it, and ArrowDown from it focuses the first heading trigger;
       - focusing it opens no flyout (no NavigationMenu content in the DOM);
       - the tooltip shows the label on focus.
     - **Slide-out:** with the dialog open, the Dashboard link is the first link in the dialog's scroll area; clicking it closes the dialog;
       `aria-current` is set there too.
     - **Hidden:** a hidden top item is absent in all three modes. When all are hidden, no list element is rendered.
     - **Absent:** covered by §5.2.
     - **`exact` in the component:** with `exact: true`, `/dashboard/x` does not mark it.
4. **Real browser.** Use the committed Edge driver pattern from `runs/change-26/evidence/browser-proof/proof.mjs`, with a scratch fixture outside the
   estate tree.
   - **Screenshots of the three modes,** in packhouse teal and in DC yellow:
     - open at 1440×900, with Dashboard current and with another screen current;
     - rail at 1440×900, with the tooltip shown;
     - the slide-out at 390×844.
   - The frames go to `runs/change-NN/evidence/frames/` and are compared with the approved mockup frame.
   - **Measured:**
     - `scrollWidth === innerWidth` at 390 px;
     - keyboard-only from the address bar reaches Dashboard in each mode;
     - axe (including contrast) shows 0 violations in each mode, in both themes.
5. **DC + CRM render check (QG-CEN-003; the CR-015 method, `runs/change-12/evidence/dc-crm-recheck.md`).**
   - Use fresh clones in `%TEMP%`. On a throwaway branch, move only the kit pin, to this branch's head.
   - Before and after, run each app's unit suite, typecheck, build and screenshot set. The expected result is suite-identical and pixel-zero.
   - Grep CRM, RMS and Org Admin for `AppShell`.
   - No app's `main` pin moves, and no estate folder is touched.
6. **Mutation battery** (`runs/change-NN/output/mutation-battery.mjs`; "ANCHOR NOT FOUND" exits non-zero). Each mutant must turn a **named** spec
   red:
   - top items rendered after the accordion;
   - current decided by `pathname === href` (which ignores `exact` and sub-paths);
   - `hidden` not filtered;
   - an empty `<ul>` rendered when there are no items, which breaks §5.2;
   - the rail link without `aria-label`;
   - the rail link moved outside `NavigationMenu.List`, which breaks the arrow-key spec;
   - the slide-out top link without `onNavigate`;
   - the on-style inset bar dropped.
7. **Other checks:**
   - `pnpm typecheck`;
   - `pnpm audit --prod --audit-level=high`;
   - `quality-sensors.mjs` (LF-normalised), with `index.ts` still 299 lines;
   - `prettier --check --print-width 100` on the touched files, except `index.ts`.

## 6. Existing callers checked (the additive claim)

| Caller | What was found | Why unaffected |
|---|---|---|
| **Packhouse** (`OfficeFrame.tsx:67-70`, CR-BANANAWORLD-PH-015) | `<AppShell menu=… footItems=…>`, no `topItems` | The new branch never renders. §5.2 freezes exactly this call shape. PH-016 adds `topItems` in its own change, after pinning the merged sha |
| **DC** (pin `5c14f37`, `package.json:57`) | `src/` has no `AppShell`, `AppMenuFootItem` or `footItems` (grep, 0 files). Its pin predates the frame | No file DC renders is touched. §5.5 checks it anyway |
| **CRM** | Not readable in this session | CR-032 §6 recorded no `export *` of the kit. `AppShell` first shipped at `f5ec58c` (0.14.0). §5.5 greps it and runs the render check. **Not claimed until then** |
| **RMS, Org Admin** | Not readable in this session | Same as CRM: grep at build. Nothing reaches them unless they import `AppShell` and pass `topItems` |
| **Kit tests** | 850/850 at the handover | Every existing spec stays **unedited**, the export inventory included (D-1 is type-only) |

## 7. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/app-menu.ts` | `AppMenuTopItem` type + `visibleTopItems` | 12 |
| `src/components/AppShell.tsx` | `topItems` prop + doc line, one `visibleTopItems` call, pass it to `SideColumn` and the slide-out `SideMenu` | 8 |
| `src/components/SideColumn.tsx` | Thread `topItems` through `common` | 3 |
| `src/components/SideMenu.tsx` | `TopLinks` + prop + conditional render | 40 |
| `src/components/MenuRail.tsx` | `RailTopLink` + prop + render inside the List | 40 |
| `src/components/index.ts` | Line 299: one more type name | 1 |
| `package.json` | 0.14.0 → 0.15.0 | 1 |
| `README.md` | Changelog 0.15.0 + `topItems` paragraph | 20 |

**Paper trail (not in the estimate):**
- the frozen-HTML fixture and its spec;
- the new `describe` blocks;
- the browser proof and frames;
- the DC + CRM record;
- the mutation battery;
- the decision-log entry `CR-DESIGN-SYSTEM-034` (D-1 to D-8 and the owner's A/B pick);
- the refreshed handover and `known-issues.md`.

The archive goes in the slot the conductor names. There is **no migration** and **no consumer pin bump**. No `runs/epic-NN/`, `milestone-NN/` or
`runs/current/epic-plan/` is created or written.

## 8. Cross-app intersection map

No shared data record is touched: the kit has no database and makes no network call. The seams are the package hand-off and the frame's contract with
the app that hosts it. **The kit writes the slot. An app reads it only after it moves its own pin, to the MERGED sha on `main`, never a branch sha
(KI-M001E19-002).**

| # | Seam | Who WRITES | Who READS | This change | Owed |
|---|---|---|---|---|---|
| S1 | `topItems` slot → packhouse office frame | Kit | Packhouse (CR-BANANAWORLD-PH-016) | New optional prop + type | PH-016 pins the merged sha and passes `OFFICE_TOP` as `topItems` with `exact: true`. That change is blocked until this one merges |
| S2 | Who may see a top item | **App** sets `hidden` | Kit obeys | The kit hides; it never decides (TECH-COMP-003) | PH hides Dashboard when `dashboardSections` is empty (PH-016 D-1), and keeps its server-side route check |
| S3 | The package hand-off to DC, CRM, RMS, Org Admin | Kit `package.json` 0.15.0 | Each app, when it moves its own pin | Additive; no dependency change | None. §5.5 proves DC and CRM unchanged |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** in this repo. S1–S3 go to `known-issues.md` at build, as for CR-030 and CR-032.
Whether to create the register is still the owner's decision.

## Rule sites

**No business rule changes.** Who may open the Dashboard is the packhouse's rule (PH-016 D-1, `dashboardSections`). The kit only obeys `hidden` (S2).

Two **presentation rules** are applied to the new slot, so their sites are listed:
- **Rule 1:** *a hidden item is never drawn.* Today it holds for groups and foot items. After this change it also holds for top items.
- **Rule 2:** *how the current screen is chosen.* Menu items use `isMenuItemCurrent`; foot items use an exact href match. After this change, top items
  use `isMenuItemCurrent`.

| Site | Change / leave | Reason |
|---|---|---|
| `src/components/app-menu.ts:44` `visibleMenuGroups` filter `item.hidden !== true` | **leave** | Groups are unchanged |
| `src/components/app-menu.ts:81` `headingCount` filter `item.hidden !== true` | **leave** | Counts are unchanged; top items carry no count |
| `src/components/AppShell.tsx:110` foot filter `item.hidden !== true` | **leave** | Foot is unchanged. It is not refactored onto the new helper, to keep the foot's code path byte-stable |
| `src/components/app-menu.ts` `visibleTopItems` (new) | **add** | The single place the top-item filter is spelled; all three modes render from it |
| `src/components/app-menu.ts:53-58` `isMenuItemCurrent` | **leave (reused)** | Called for top items as it is. No edit |
| `src/components/SideMenu.tsx:115` foot `props.pathname === item.href` | **leave** | Changing the foot's current rule would alter existing callers (the lane forbids it). The difference from the top items is deliberate and goes in the README |
| `src/components/MenuRail.tsx:102` rail foot `pathname === item.href` | **leave** | Same as above |
| `tests/components/app-menu.test.tsx:55-61` (pins `isMenuItemCurrent`) | **leave** | Unchanged behaviour; new cases are added beside it |

**Search terms used (kit `src/` and `tests/`):**
- `hidden !== true`
- `pathname === item\.href`
- `isMenuItemCurrent`
- `footItems`
- `topItems` (absent today)

DC `src/`: `AppShell|AppMenuFootItem|footItems` (0 files). PH `src/client/shell/`: `design-system|AppShell|footItems|topItems`.

## 9. Residuals and open questions

- **Owner pick:** Option A (as drawn, no divider; recommended) or Option B (a thin divider under the top items). Both mockups are on disk.
- **R1 — Overlapping "current".** A non-exact top item whose href prefixes other screens is marked along with the screen under its heading (D-6).
  The README advises adopters, and PH-016 passes `exact`. If a real adopter needs the kit to arbitrate, that is a later additive change.
- **R2 — happy-dom and Radix focus groups.** If the ArrowDown spec in the rail cannot be made reliable in happy-dom, it is proven in the real browser
  (§5.4), and the evidence says so plainly.
- **R3 — Radix id normalisation in §5.2.** If the normalised frozen HTML proves brittle, the fallback is a structural DOM comparison: tag, attributes
  minus ids, and text, all in tree order. It is captured at the same base and is just as strict about added nodes.
- **R4 — Version collision.** If another kit change merges 0.15.0 first, this one takes the next minor at build.
- **R5 — The re-check (§5.5) can come back red on an app's `main`** for reasons outside this change. That is recorded with evidence, not fixed.
- **The mockup's "NEW" tag** on Dashboard (frame 1 of the PH-016 mockup) is treated as an annotation for the owner. It is not part of the slot (brief c).
- **Standing, carried:**
  - no cross-system register;
  - the 4 inert `ignoreGhsas`;
  - the gitleaks scan check (K-1);
  - the `.snap` CRLF artefact (do not stage);
  - `prettier --print-width 100`;
  - CR-032's owed DC + CRM re-check (K-1), which this change's §5.5 covers at a later head. The record says so.

## 10. After merge

- Report the **merged** `main` sha in the close-out and the handover.
- CR-BANANAWORLD-PH-016 pins that sha and wires `topItems` (S1, S2). No other app needs to do anything.

## 11. Not an epic

This is one optional prop on one existing component: one type, one helper, two small internal renderers, docs and a version bump. It touches no
service, integration, permission model or data. It cannot be split into five milestones.
