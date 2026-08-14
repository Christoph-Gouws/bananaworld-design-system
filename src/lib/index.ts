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
// The document header's day line (CR-DESIGN-SYSTEM-002). ⚠ NOT a duplicate of `formatDateZA` above and
// not to be merged with it: that one prints a date, this one describes a chosen day against a given
// today — a mood and two sentences the header colours itself by. Merging them would change what an
// existing caller of either renders.
export {
  describeDocumentDate,
  DOCUMENT_DATE_WARN_DAYS,
  type DocumentDateMood,
  type DocumentDateDescription,
} from "./document-date";
