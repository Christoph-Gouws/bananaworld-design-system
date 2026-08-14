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
  // The document header's day line (CR-DESIGN-SYSTEM-002). `DocumentHeader` itself arrives through the
  // `export * from "./components"` above; this list is enumerated rather than starred, so the describer
  // has to be named here as well or a consumer cannot reach it from the package root at all.
  describeDocumentDate,
  DOCUMENT_DATE_WARN_DAYS,
  type DocumentDateMood,
  type DocumentDateDescription,
  // The toolbar filter stored-shape helpers (CR-DESIGN-SYSTEM-003). The filter TYPES arrive through the
  // `export * from "./components"` above; these two functions live in ./lib, so they have to be named
  // here as well or a consumer cannot reach them from the package root at all.
  filterValueFromStored,
  storedFromFilterValue,
  type StoredFilterReading,
  // The paging arithmetic (CR-DESIGN-SYSTEM-004). `TablePagination` itself arrives through the
  // `export * from "./components"` above; these live in ./lib, so they have to be named here as well
  // or a consumer cannot reach them from the package root at all.
  TABLE_PAGE_SIZES,
  tablePageRange,
  type TablePageState,
  type TablePageRange,
} from "./lib";
