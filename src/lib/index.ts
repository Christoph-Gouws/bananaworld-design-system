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
// The stored-shape contract for toolbar filter values (CR-DESIGN-SYSTEM-003 §5.3). Pure and tiny: one
// value stores as a bare string, several as an array, and reading back reports whether the stored shape
// could not be represented — so a consumer restoring a SAVED VIEW can say "this filter opened wider than
// you left it" instead of widening in silence. The wording of that notice stays in the app; this side
// supplies only the fact (TECH-COMP-003).
export {
  filterValueFromStored,
  storedFromFilterValue,
  type StoredFilterReading,
} from "./table-controls";
// The paging arithmetic behind `TablePagination` (CR-DESIGN-SYSTEM-004). Exported in its own right
// because the consumer needs the SAME numbers the bar prints: `offset` is what its query asks the
// server for, so the window an operator reads and the window that was fetched cannot disagree.
export {
  TABLE_PAGE_SIZES,
  tablePageRange,
  type TablePageState,
  type TablePageRange,
} from "./table-paging";
// The grid's pure state arithmetic (CR-DESIGN-SYSTEM-008). Exported in its own right because the
// consumer needs the SAME shapes the controls produce: what it puts in a URL, what it sends to a
// server and (later) what it saves under a name all have to be one value, or the screen's idea of the
// query and the query drift apart.
export {
  gridSortToggle,
  gridSortPosition,
  gridColumnOrder,
  gridFilterSet,
  gridFilterIsEmpty,
  type GridSortDir,
  type GridSort,
  type GridGroupLevel,
  type GridFilterKind,
  type GridFilterValue,
  type GridFilterValues,
  type GridStoredView,
} from "./grid-view";
