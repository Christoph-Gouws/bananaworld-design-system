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

## Local development

Linked locally via a `file:` dependency (`"@bananaworld/design-system": "file:../bananaworld-design-system"`).
For independent CI/Vercel builds the consumers resolve it from this repo (git dependency or a published
package) — see each app's DevOps notes.

## Governance

Changes here are change-controlled in **both** apps (it is shared infrastructure). Keep it pure: if a
component needs app state (auth, offline queue, routing logic), it belongs in the app, not here.
