# CR-DESIGN-SYSTEM-018 — a "page is on its way" signal: a top bar and a spinner on the clicked link — Logic Plan

> Raised by the owner's ruling of 2026-10-11 under **CR-ORGADMIN-015** (Org Admin removes `app/(console)/loading.tsx`;
> the owner chose a thin bar, option "bar instead", over a skeleton as the replacement busy signal).
> **Planning session only. No feature code was written.** `bananaworld-dc` was **read only** (reads and greps).
> Base: `main` @ `820c980` (CR-DESIGN-SYSTEM-015, PR #34). DC's pin, from its own `package.json:57`: `cde6f4e`.

<!-- OWNER-BRIEF-START -->

**What you'll have.** When someone clicks to another page, a thin yellow line runs across the top of the page area, and a small spinner turns beside the link they clicked. The current page stays on screen, with nothing jumping around, until the new one is ready. Then the line finishes and disappears. It works the same on the tablet and uses no extra data. People who have asked their device for less movement see a still line instead of a moving one.

**Please confirm.**
1. Each app turns this on for itself. Once an app turns on the line, every link in it gets the spinner automatically, and any single link can be left without one. Apps that haven't turned it on look exactly the same as today. Org Admin turns it on first. The warehouse app only follows if its own test shows the same stuck button.
2. Quick page changes (under about a sixth of a second) show nothing, so the screen doesn't flicker.
3. Pick a look from the three pictures. I recommend A.

**Not included.** Turning it on in any app, which each app does in its own step. Page changes the system makes by itself after a save, and the browser back button, don't show the line yet.

**Risks.** None to live screens. Nothing changes until an app switches it on.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 0. Orientation, what was read, and the session's limits

- **No `CLAUDE.md`, `CONTEXT.md`, `ANCHORS.md` or `FOUNDATION_QUICKREF.md` exists in this worktree** (recorded since
  CR-013). Nor does one exist in `teams/AI Dev Team 6/projects/bananaworld-design-system/`. The standing rules come from
  the conductor's project rules, the estate `CLAUDE.md` and `runs/current/SESSION_HANDOVER.md`.
- **Compliance heartbeat:** `organization/COMPLIANCE_REGISTER.md:1`: next estate session due **2027-01-10** (held
  2026-10-10). Not overdue.
- **No existing plan for this CR**, so this is a fresh plan, not a revision. No owner responses are recorded, and no
  clarify round was used. The one real tension (owner's "every consumer gets it" against the lane rule "never change a
  default") is resolved by design in §2.1 and put to the owner as confirm point 1, not as a question.
- **Read in this repo:** `package.json`, `README.md` (incl. its `### Changelog`; **there is no `CHANGELOG.md`**, the
  CR-015 precedent puts the entry there), `src/components/Link.tsx` (whole), `src/components/Button.tsx`,
  `src/components/Skeleton.tsx:1-40`, `src/components/index.ts` (whole), `src/lib/SurfaceContext.tsx`,
  `src/lib/tokens.css` (whole), `vitest.config.ts`, `tests/components/DragBoard.additive.test.tsx` (export inventory),
  the CR-015 plan, the decision-log headings.
- **Read in DC (read only):** `package.json:57` (pin `cde6f4e`), `package.json:81` (`next ^15.5.24`),
  `src/components/ui/index.ts:120` (DC re-exports the kit `Link`), `tailwind.config.ts:8-11` (scans the kit's `src/`)
  and `:91-118` (the kit's `animate-pulse-soft`/`fade-in` come from the CONSUMER's config). Greps for `legacyBehavior`
  over `src/` and `app/`: **0 hits**. No CSP header in `next.config.*` / middleware.
- **CRM, RMS, org-admin: not readable from here.** No claim is made about their code. In particular I **cannot see
  whether Org Admin's navigation uses the kit `Link`** (§7, S1).

## 1. What changes, in one paragraph

Three new runtime exports in one new file (`NavigationBusyProvider`, `NavigationBusyBar`, `useNavigationBusy`) and one
new optional prop on the existing `Link` (`pendingIndicator?: boolean`). The busy signal is fed by **Next.js's own
navigation status for a `<Link>`** (`useLinkStatus` from `next/link`, 15.3+), read inside the kit `Link`. That status
is tied to the navigation transition and ends when the new route commits. It needs **no React Suspense boundary, no
`loading.tsx`, no history patching and no network**. **Outside a `NavigationBusyProvider` the kit `Link` renders
exactly the React tree it renders today**, so every existing caller in every consumer is unchanged until that app
mounts the provider.

## 2. Design

### 2.1 Why the provider is the on-switch (owner rule vs lane rule)

The request says the link spinner goes "inside the existing UX-DS-022 Link (so every consumer gets it), with an
opt-out prop". The lane rule says "never change a default; every existing caller must render byte-identically". A
spinner that switched itself on in every app at its next pin bump would break the lane rule: DC would gain spinners
the day it bumped for an unrelated reason.

**Resolution:** the spinner is on by default **inside a `NavigationBusyProvider`** and absent outside one. An app
turns the whole signal on by mounting the provider (which it must do anyway to show the bar). From then on **every
kit `Link` in that app** gets the spinner with no per-link edit, and `pendingIndicator={false}` opts a single link
out. That meets both the owner's intent ("every consumer gets it", once it opts in) and the lane rule (no app changes
until it chooses). It is confirm point 1 in the brief.

### 2.2 The pieces (new file `src/components/NavigationBusy.tsx`, `"use client"`)

| Export | Shape | What it does |
|---|---|---|
| `NavigationBusyProvider` | `({ children }: NavigationBusyProviderProps)` | Holds a **count** of kit links whose navigation is pending. Renders **no DOM** (context only), so mounting it shifts nothing |
| `NavigationBusyBar` | `({ label?, className? }: NavigationBusyBarProps)` | The thin accent bar. Placed by the consumer as the first child of its content area. Default `label` "Loading page" |
| `useNavigationBusy` | `() => boolean` | `true` while any navigation is pending (after the delay, §2.4). For the consumer to set `aria-busy` on its own `<main>` |

Internal, not exported: `NavigationBusyContext` (default `null`), `useReportNavigationPending(pending)`,
`NAVIGATION_BUSY_DELAY_MS = 150`.

**Barrel** (`src/components/index.ts`): one block after `Link`, with the comment style of its neighbours. Runtime
names added: **3**. Types added: `NavigationBusyProviderProps`, `NavigationBusyBarProps`. No name in the barrel begins
`NavigationBusy` or `useNavigationBusy` today (grep §Rule sites), so nothing is shadowed.

### 2.3 The `Link` change (`src/components/Link.tsx`)

- `LinkProps` gains `pendingIndicator?: boolean` ("Show a spinner while this link's navigation is pending, inside a
  `NavigationBusyProvider`. Default true; `false` hides the spinner but the link still feeds the bar").
- `Link` reads `useContext(NavigationBusyContext)` (always called, before any branch).
  - **No provider, or `legacyBehavior` set →** returns **exactly today's JSX**:
    `<NextLink ref prefetch={resolvedPrefetch} className={cn(…)} {...props} />`. Same element, same props, same
    order. `pendingIndicator` is destructured out so it never reaches the DOM. `legacyBehavior` is excluded because
    Next.js requires exactly one child there, and a sibling would throw (0 uses in DC; unknown elsewhere, so it is
    guarded, not assumed).
  - **Provider present →** the same `NextLink` with children `{children}<LinkPendingMark show={pendingIndicator !==
    false} />`. `LinkPendingMark` must be a **descendant** of `NextLink`, which is where `useLinkStatus` works.
- `LinkPendingMark` (private, same file): reads `{ pending }`, calls `useReportNavigationPending(pending)` (effect:
  `+1` when pending turns true, `-1` in cleanup, so unmounting a link mid-navigation, which is the normal case when
  the old page goes away, still balances the count; StrictMode double-effects balance too). Renders `null` unless
  `show && pending && delayElapsed`. Otherwise renders a **zero-width** wrapper `<span aria-hidden="true"
  data-link-pending className="relative inline-block w-0 align-middle">` holding an absolutely positioned 12px ring
  (16px on tablet via `[[data-surface=tablet]_&]:`), `animate-spin motion-reduce:animate-none`, colour
  `text-fg-subtle`. **Zero width = the link's text and anything after it never move.**
- **Older Next.js:** `useLinkStatus` exists from next 15.3. The kit's peer range stays `^15.0.0` (not tightened; the
  `package.json` note on overrides explains why the peer is left alone). It is resolved by namespace lookup with a
  `() => ({ pending: false })` fallback, so an app on <15.3 that mounts the provider gets a bar that never shows,
  never a crash. DC is `^15.5.24`. Org Admin is ≥15.4.2 by the regression's own description. Documented in README.
- The surface prefetch rule (`prefetch=false` on tablet, `Link.tsx:27`) is untouched in both branches. This is the
  "no extra network" requirement, and it is asserted by test.

### 2.4 Timing, motion and the bar's states

- **Delay:** neither the bar nor the spinner shows until a navigation has been pending for **150 ms**
  (`NAVIGATION_BUSY_DELAY_MS`). A navigation that lands sooner shows nothing, so there is no flicker. Next.js also
  skips the pending state entirely for an already-prefetched route. This is a JS timer (testable with fake timers)
  rather than a CSS animation delay, because the kit's animations come from the consumer's Tailwind config
  (DC `tailwind.config.ts:91-118`), and Org Admin's config cannot be read from here. Brief confirm point 2.
- **Bar = option A (recommended; final look per the owner's mockup pick):** `sticky top-0 h-0 z-[var(--z-sticky)]`
  wrapper (zero height: **takes no space, never shifts layout**, stays at the top of a scrolling content area) holding
  an `absolute inset-x-0 top-0 h-[3px]` (`[[data-surface=tablet]_&]:h-1`) `bg-accent origin-left` strip with
  `pointer-events-none`. States: **idle** (`opacity-0 scale-x-0`, `aria-hidden`, no role) → **busy** (`opacity-100
  scale-x-[0.85]`, `transition-transform duration-[8000ms] ease-out`, which creeps and never "finishes" on its own) →
  **done** (`scale-x-100` over 200 ms, then fades, then snaps back to idle without a transition). A busy that ends
  inside the delay never leaves idle. Built only from core Tailwind utilities, arbitrary values and existing tokens
  (`bg-accent`, `--z-sticky`). **No custom keyframes**, so it does not depend on a consumer's `tailwind.config`.
  - Option B (sliding stripe) would need a looping keyframe. If chosen, it ships as a React 19 hoisted `<style
    href precedence>` inside the bar. That is one more mechanism, which is why A is recommended.
  - Option C (A + old page dims) adds `data-navigation-busy` to the bar and README guidance for the consumer to dim
    its own content (`useNavigationBusy()`); the kit cannot dim a consumer's `<main>` it does not render.
- **Reduced motion:** `motion-reduce:transition-none motion-reduce:scale-x-100`. While busy the bar is a still,
  full-width line. The spinner is a still ring (`motion-reduce:animate-none`).
- **Screen readers:** while busy the strip carries `role="progressbar"`, `aria-label={label}`, no `aria-valuenow`
  (indeterminate, per ARIA), and `aria-busy="true"`. When idle it is `aria-hidden` with no role, so it is not read out
  between navigations. The link spinner is `aria-hidden` (decorative; the bar is the announcement). The README tells
  consumers to put `aria-busy={useNavigationBusy()}` on their content region.
- **"Page stays on the old screen until the new one is ready":** that is App Router behaviour once `loading.tsx` is
  gone, since the old tree stays committed until the new RSC payload arrives. The kit adds nothing that could swap
  the screen early.

### 2.5 What this deliberately does NOT do

- **No Suspense boundary, no `loading.tsx`, no `useSearchParams`** (which demands a Suspense boundary in static
  routes). A guard test greps the new file and `Link.tsx` for `Suspense` and fails on any hit.
- **No global click listener or `history.pushState` patch** (the nextjs-toploader approach). Those are known to
  stick on same-URL clicks, modifier-clicks and search-param-only changes. `useLinkStatus` is the framework's own
  signal.
- **Programmatic navigation (`router.push` after a save) and back/forward do not show the bar.** Named in the brief.
  A later additive change can add a `useNavigationBusy`-fed transition helper if a consumer needs it. Not built
  speculatively (Stage 05 simplification gate).
- No consumer pin bump. No change to `tokens.css` (CR-015's hash tripwire stays green).

## 3. The additive proof (to be done at build, NOT claimed now)

1. **Byte-identity, no provider:** a harness renders a frozen copy of `Link.tsx` from `820c980` and the new `Link`
   side by side over a matrix of caller shapes (href string/object, className, prefetch true/false/undefined,
   surface browser/tablet, children text/element/nested, `replace`, `scroll`, `target`, `aria-*`, `legacyBehavior`
   with a single `<a>` child) and asserts identical `outerHTML` for every shape. This is the CR-013
   `byte-identity-013.harness` pattern.
2. **Byte-identity at rest, inside a provider:** same matrix, provider mounted, nothing pending → identical
   `outerHTML` (the mark renders `null`).
3. **Export inventory:** `tests/components/DragBoard.additive.test.tsx` gets the 3 names under a
   `// CR-DESIGN-SYSTEM-018` line in `ADDED_SINCE_011`. Every existing name is still asserted present.
4. Re-measure the baseline first (handover: 464 tests / 23 files), then `pnpm test`, `pnpm typecheck`,
   `pnpm audit --prod --audit-level=high`, `quality-sensors.mjs` (LF-normalised), `prettier --check` on touched files.

**Existing callers checked, and why they are unaffected:**
- **DC** (pin `cde6f4e`): re-exports the kit `Link` (`src/components/ui/index.ts:120`). `legacyBehavior`: 0 uses in
  `src/` and `app/`. `NavigationBusyProvider` does not exist at any sha DC can pin today, so DC cannot be inside one.
  Every DC `Link` takes the no-provider branch, which is today's JSX (proof 1). DC is on `next ^15.5.24`, so even the
  `useLinkStatus` lookup resolves, though it is never reached without a provider.
- **CRM, RMS, org-admin:** unreadable here. Unaffected by construction: same no-provider branch. The build greps fresh
  clones for `legacyBehavior` and kit-`Link` imports and records the counts.

## 4. Files expected to change

| File | What | ~lines |
|---|---|---|
| `src/components/NavigationBusy.tsx` | new: provider, bar, hook, internal reporter + delay | 140 |
| `src/components/Link.tsx` | `pendingIndicator` prop, provider branch, `LinkPendingMark`, guarded `useLinkStatus` | 50 |
| `src/components/index.ts` | export block | 12 |
| `README.md` | "Navigation busy signal" section (mount provider, place bar, `aria-busy`, Tailwind-scan note, next ≥15.3 note, opt-out) + **0.3.0** changelog line | 45 |
| `package.json` | `version` 0.2.0 → 0.3.0 (no dependency, export-map or peer change; lockfile untouched, confirmed with `pnpm install --frozen-lockfile`) | 1 |

Paper-trail side (not in the estimate): `tests/components/NavigationBusy.test.tsx` (new),
`tests/components/Link.additive.test.tsx` (new, §3.1-3.2), one line in `DragBoard.additive.test.tsx`, and the fixture
app (§6). The archive goes in the slot the conductor names (never overwrite; handover item 13), together with the
decision-log entry `CR-DESIGN-SYSTEM-018` and the handover / active-milestone refresh. No migration (no database). No
`runs/epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` is created or written.

## 5. Unit tests (`tests/components/NavigationBusy.test.tsx`, happy-dom)

`next/link` is mocked with a stand-in that renders `<a>` and exposes a controllable link-status context to its
children, so `useLinkStatus` can be driven true/false per link. Fake timers drive the delay.

1. Provider + one link pending < 150 ms then settled → bar never gains `role`, spinner never renders.
2. Pending ≥ 150 ms → bar has `role="progressbar"`, `aria-label="Loading page"`, `aria-busy="true"`; spinner
   `[data-link-pending]` is inside the clicked anchor and `aria-hidden`; `useNavigationBusy()` reads `true`.
3. Settles → bar runs done → idle; role removed; hook `false`.
4. `pendingIndicator={false}` → no spinner, **bar still shows**.
5. Two links pending, one settles → still busy; both settle → idle. Count never goes below 0 (extra cleanup).
6. Pending link **unmounts** while pending → count returns to 0 (the real route-change case).
7. StrictMode → same results (double effects balance).
8. `legacyBehavior` inside a provider → single child, no mark, no throw.
9. Tablet surface inside provider → `prefetch` still `false`; spinner/bar carry the tablet size classes.
10. Reduced-motion classes present on bar and spinner (`motion-reduce:*`).
11. `useLinkStatus` absent (mock without it) → no throw, never busy.
12. **Guard:** source of `NavigationBusy.tsx` and `Link.tsx` contains no `Suspense`, no `useSearchParams`.
13. Bar outside a provider → renders the idle strip and never busy (no throw); hook outside provider → `false`.

**Mutation battery** (`runs/change-NN/output/`, "ANCHOR NOT FOUND" exits non-zero): drop the cleanup decrement; drop
the delay; render the mark without a provider; remove `legacyBehavior` guard; flip `pendingIndicator` default; remove
`role` while busy; drop tablet `prefetch` rule. Every mutant must turn a test red.

## 6. Fixture page and real-browser proof ("story/fixture page"; the repo has no Storybook)

- **Fixture app** committed to the archive as `runs/change-NN/evidence/nav-busy-fixture/`: a minimal Next.js 15.5 App
  Router app with `<NavigationBusyProvider>`, `<NavigationBusyBar />` at the top of a sidebar-plus-content shell, three
  routes, one of which awaits a 1.5 s server delay, a link with `pendingIndicator={false}`, a `data-surface` toggle,
  **no `loading.tsx` anywhere**, and one server-action form calling `revalidatePath` (the CR-ORGADMIN-015 shape) to show
  the button settles.
- **Run from a scratch copy outside the estate tree** (`%TEMP%\cr-ds-018-fixture`) with the kit linked by `file:` to
  this worktree. Never inside `bananaworld-dc`.
- **Driven in Edge** (the CR-013 `browser-proof/proof.mjs` driver) at **1280×800 (desktop)** and **820×1180 (tablet,
  `data-surface="tablet"`)**: frames for idle, pending (bar + spinner), landed. Plus one with
  `emulateMedia({ reducedMotion: "reduce" })`, one asserting zero layout shift (`getBoundingClientRect` of the
  content's first heading identical in idle and pending), and one network log asserting **no request** on tablet
  before the click (no prefetch). Frames to `runs/change-NN/evidence/frames/`.
- **Server-action check:** 64 submissions of the revalidating form with no `loading.tsx` → button returns from
  "Working…" each time. This is evidence that the kit's signal does not reintroduce the stall. It is not a claim
  about Org Admin, whose own E2E remains the authority.

## 7. Cross-app intersection map

| # | Seam | Who WRITES | Who READS | This change | Follow-up |
|---|---|---|---|---|---|
| **S1** | Kit busy signal → **Org Admin** (CR-ORGADMIN-015) | **Kit** writes provider, bar, hook, `Link` prop | **Org Admin** mounts the provider in `app/(console)/layout.tsx`, places the bar atop its content, sets `aria-busy` on `<main>` | Ships all four, opt-in | Org Admin's own change: pin to the **merged** `main` sha (never the branch sha, KI-M001E19-002); **confirm its navigation uses the kit `Link`**: plain `next/link` links will not feed the bar (unverifiable from here); confirm its Tailwind `content` scans the kit's `src/` (DC's does) |
| **S2** | Kit → **DC** (pin `cde6f4e`) | Kit | DC | None. No provider means today's `Link` | Only if DC's draft-PR proof (#478/#479) shows the same stall: DC's own change mounts the provider. Not before |
| **S3** | Kit → CRM, RMS | Kit | CRM, RMS | None, by construction (§3) | None |
| **S4** | Next.js `useLinkStatus` → kit `Link` | **Next.js** (the consumer's installed `next`) | Kit | Read-only dependency on a framework hook (15.3+), guarded fallback | If a consumer is <15.3, its bar stays silent. README says so |

No shared data record is touched; this is presentation state inside one browser tab. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md`
**still does not exist** in this repo (twelfth change to raise it; the decision is the owner's). S1–S4 go to
`known-issues.md` at build.

## Rule sites

No business rule changes. This adds presentation feedback during navigation. It changes nothing about what may
happen, when, to whom, or how much. Searches over this repo's `src/` confirming there is no existing busy/navigation
mechanism to amend or keep in step:
- `useLinkStatus|Suspense|aria-busy|progressbar|prefers-reduced-motion|motion-reduce|NavigationBusy|pendingIndicator`
  → only `Button.tsx:102` (`aria-busy` for `inflight`) and `PrintPreview.tsx:201` (`aria-busy` while a preview
  loads). Both **leave**: they are per-control busy states, unrelated to navigation.
- `Link\b` → `Link.tsx` (change), `index.ts:125` (leave: the existing export line is unchanged; a new block is added
  after it), `Button.tsx:18` (leave: a doc comment about `asChild`).
- `animate-|keyframes|pulse-soft` → the kit's existing animations all depend on consumer config (e.g.
  `Skeleton.tsx:26`, `Modal.tsx:38`). **Leave**. This is why the bar uses none.

## 8. Open questions and residuals

1. **Owner confirm 1:** the on-switch is per app (provider), with spinners automatic on every kit link inside it and
   a per-link opt-out. This interprets "every consumer gets it" within the lane rule.
2. **Owner confirm 2:** the 150 ms "don't flicker" delay.
3. **Owner pick:** A / B / C. A is recommended (simplest build, no keyframes). B and C costs are in §2.4.
4. **Not covered:** `router.push` and back/forward (named in the brief).
5. **Org Admin specifics are unverified** (S1): kit `Link` usage and Tailwind scan. These are Org Admin's to check in
   its own change.
6. Standing, carried from the handover: no cross-system register; no CR-008 decision-log entry; 4 inert
   `ignoreGhsas`; OQ-8; the `.snap` CRLF artefact (do not stage).

## 9. Not an epic

One new file, one optional prop, an export block, docs. I cannot name five milestones it decomposes into.

## 10. Mockups

`runs/current/mockups/CR-DESIGN-SYSTEM-018/option-{a,b,c}.html` and `comparison.html` (self-contained). Each option
shows the shell at desktop and tablet widths with a looping click → wait → new page cycle, plus the reduced-motion still.
A = filling bar (recommended). B = sliding stripe. C = filling bar + the old page dims while waiting. The link spinner
is the same in all three.
