# @bananaworld/design-system

The **single shared design system** for the Bananaworld apps — **Bananaworld-DC** and
**Bananaworld-CRM**. One source of truth for look-and-feel; no fork (TECH-CON-004 / ADR-001).

Created at **Bananaworld-CRM EPIC-001-M001** by extracting Bananaworld-DC's `src/components/ui/`
(verbatim) plus the design-system internals it depends on (`cn`, the `data-surface` `SurfaceContext`,
formatters, and the design tokens). This is its own small neutral repository so both apps — which
deploy independently — can consume it identically.

## What's in it

- **28 pure UI primitives** (`src/components/`): Button, Input, Select, Combobox, Table, Modal,
  SlideOver, Sheet, Toast, Tooltip, StatusBadge, Skeleton, EmptyState, ErrorState, DataTableToolbar,
  RowActions, etc.
- **Design-system internals** (`src/lib/`): `cn` (Tailwind class composer), `SurfaceProvider` /
  `useSurface` (the `data-surface` per-surface variant mechanism), formatters, the pure
  `table-controls` engine, and `tokens.css` (the CSS-variable design tokens).

**Pure presentation only** — no network calls, no `warehouse_id`/`legal_entity` references, no
business rules, no permission logic (TECH-COMP-003). Three app-coupled components stay in each app and
are intentionally **not** here: `PermissionGate` (RBAC), `SyncStatusIndicator` + `SyncStatusDetail`
(offline-queue).

## Consuming it (both apps)

Both consumers are Next.js apps that ship this package's TypeScript source via `transpilePackages`:

```ts
// next.config.ts
const nextConfig = { transpilePackages: ["@bananaworld/design-system"] };
```

```ts
// app/globals.css  (import the tokens once, at the app root)
@import "@bananaworld/design-system/tokens.css";
```

```tsx
import { Button, Icon, useSurface } from "@bananaworld/design-system";
```

Set `data-surface="browser"` (or `"tablet"`) on the layout root (`<body>`) so per-surface variants
resolve. The package also requires the consumer's Tailwind theme to define the Bananaworld token scale
(the `bg`/`surface`/`accent`/… colours, radii, shadows) — see each app's `tailwind.config.ts`.

## Themes

A theme redeclares the **accent family only** (five colour tokens) and nothing else; sizes, shapes and every other
colour stay `tokens.css`'s. Themes are **opt-in**: an app sees one only if it BOTH imports the file AND sets the
attribute. No existing caller does either, so they render exactly as before.

```css
/* app/globals.css: tokens first, then the theme */
@import "@bananaworld/design-system/tokens.css";
@import "@bananaworld/design-system/themes/packhouse.css";
```

```tsx
<html data-theme="packhouse"> {/* on <html>, with data-surface on <body> as usual */}
```

**Placement:** put `data-theme` on `<html>`. The focus halo (`--shadow-focus`) is resolved where `tokens.css` declares
it, so a theme attribute on a tablet-surface element with no themed ancestor keeps the yellow halo.

| Theme | Source | `--color-accent` | `-hover` | `-subtle` | `--color-fg-on-accent` | `--color-ring` |
|---|---|---|---|---|---|---|
| `packhouse` (teal) | packhouse DLC-DEC-054, option B | `#0F766E` | `#0B5F58` | `#D5F3EF` | `#FFFFFF` | `#0F766E` |

## Navigation busy signal

A thin accent bar across the top of the content area, plus a small spinner on the clicked `Link`, while a client
navigation is in flight. **Opt-in per app:** until an app mounts `NavigationBusyProvider`, every kit `Link` renders
exactly as before.

```tsx
// app/(console)/layout.tsx — a client boundary or a client child component
<NavigationBusyProvider>
  <Sidebar />                                  {/* kit <Link>s: each gets the spinner automatically */}
  <main aria-busy={useNavigationBusy()}>       {/* read the hook in a client child */}
    <NavigationBusyBar />                      {/* first child of the scrolling content area, outside its padding */}
    <div className="p-6">{children}</div>
  </main>
</NavigationBusyProvider>
```

- Fed by `useLinkStatus` from `next/link` (**next 15.3+**; on older `next` the bar simply never shows). Needs no
  Suspense boundary and no `loading.tsx`, and makes no request (tablet keeps `prefetch={false}`).
- Nothing shows for a navigation shorter than 150 ms. Reduced motion: the bar is a still full-width line, the spinner
  a still ring. While busy the bar is `role="progressbar"` (indeterminate); idle, it is `aria-hidden`.
- `<Link pendingIndicator={false}>` hides that link's spinner; it still feeds the bar.
- Only kit `Link`s feed the signal (plain `next/link` does not). `router.push` and back/forward are not covered.
- The bar uses core Tailwind utilities only (no custom keyframes), but the app's Tailwind `content` must scan this
  package's `src/`.

### Changelog

- **0.3.1** — Behaviour fix: a `Button` with `inflight` is now always disabled, even when the caller passes
  `disabled={false}` (it used `disabled ?? inflight`, so `false` kept it clickable and a second tap double-submitted).
  Callers that passed both will see the button grey while in flight, like every other busy button. No new prop, export
  or default.
- **0.3.0** — Navigation busy signal (`NavigationBusyProvider`, `NavigationBusyBar`, `useNavigationBusy`, and a
  `pendingIndicator` prop on `Link`). Opt-in: an app that does not mount the provider renders every `Link` as before.
- **0.2.0** — Opt-in packhouse theme (`./themes/packhouse.css`). DC and CRM unaffected: neither imports the file nor
  sets the attribute. `tokens.css` unchanged.

## Local development

Linked locally via a `file:` dependency (`"@bananaworld/design-system": "file:../bananaworld-design-system"`).
For independent CI/Vercel builds the consumers resolve it from this repo (git dependency or a published
package) — see each app's DevOps notes.

## Governance

Changes here are change-controlled in **both** apps (it is shared infrastructure). Keep it pure: if a
component needs app state (auth, offline queue, routing logic), it belongs in the app, not here.
