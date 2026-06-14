/**
 * @bananaworld/design-system — the single shared design system for the Bananaworld apps
 * (Bananaworld-DC + Bananaworld-CRM). One source of truth for look-and-feel; no fork (TECH-CON-004).
 *
 * Consumers ship the raw TypeScript source via Next.js `transpilePackages`. Import the design tokens
 * stylesheet once at the app root:
 *
 *     import "@bananaworld/design-system/tokens.css";
 *
 * and wrap the tree (or set `data-surface` on <body>) so per-surface variants resolve.
 */

export * from "./components";
export {
  cn,
  SurfaceProvider,
  useSurface,
  type Surface,
  formatMoney,
  currencySymbol,
  formatKg,
  formatDateZA,
  formatDateTimeZA,
  formatTimeZA,
  formatRelativeTimeZA,
} from "./lib";
