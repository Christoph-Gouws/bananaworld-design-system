// Shared design-system internals — pure presentation helpers only.
//
// Extracted from Bananaworld-DC's src/lib/design-system/ (ADR-001, CRM EPIC-001-M001 / DC §C-a).
// PURE: no network, no business rules, no scope/permission logic. The per-surface variant mechanism
// (data-surface) and the class-name composer every primitive uses live here.

export { cn } from "./cn";
export { SurfaceProvider, useSurface, type Surface } from "./SurfaceContext";
export {
  formatMoney,
  currencySymbol,
  formatKg,
  formatDateZA,
  formatDateTimeZA,
  formatTimeZA,
  formatRelativeTimeZA,
} from "./formatters";
