/**
 * @bananaworld/design-system — UI primitives.
 *
 * Extracted verbatim from Bananaworld-DC's src/components/ui/ (ADR-001 / TECH-COMP-003).
 * These are PURE UI primitives — no network calls, no warehouse_id/legal_entity references, no
 * business rules, no permission logic. Per-surface variants resolve via the `data-surface` attribute
 * on a parent layout root (SurfaceProvider), not via prop drilling.
 *
 * App-coupled components stay in each consuming app and are NOT part of this package:
 *   - PermissionGate        (depends on the app's RBAC matrix / usePermission)
 *   - SyncStatusIndicator   (depends on the app's offline-queue)
 *   - SyncStatusDetail      (depends on the app's offline-queue)
 */

export { Button, type ButtonProps } from "./Button";
export { Input, type InputProps } from "./Input";
export { NumericInput } from "./NumericInput";
export { Textarea, type TextareaProps } from "./Textarea";
export { Label } from "./Label";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from "./Select";
export { Combobox, type ComboboxOption, type ComboboxProps } from "./Combobox";
export { Checkbox } from "./Checkbox";
export { RadioGroup, Radio } from "./Radio";
export { ChoiceGroup, type ChoiceOption, type ChoiceGroupProps } from "./ChoiceGroup";
export { ListCard, type ListCardProps } from "./ListCard";
export {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type TableProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type SortDirection,
  // The three table-wide answers (CR-DESIGN-SYSTEM-009). ADDITIVE: no name here already existed, and
  // `Table` gained a props interface that EXTENDS the attribute set it already accepted, so every
  // existing call site typechecks and renders unchanged. The two hooks are exported because a
  // consumer's report renders raw cells of its own beside these — an Actions header, group and
  // subtotal rows — and a consumer that could not READ the density would hard-code a second copy of
  // it, which drifts at the first token change.
  useTableDensity,
  useTableWrap,
  type TableDensity,
  type TableWrap,
  type TableColumnWidth,
} from "./Table";
// The paging bar for a long list (CR-DESIGN-SYSTEM-004). It sits BESIDE the Table block above — the
// table is not forked, not wrapped, and gains no prop. Additive: no name here begins `TablePage`
// today, so nothing is shadowed and nothing moves.
export {
  TablePagination,
  type TablePaginationProps,
  type TablePaginationPlacement,
} from "./TablePagination";
export {
  SlideOver,
  SlideOverTrigger,
  SlideOverClose,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
  SlideOverDescription,
  SlideOverBody,
  SlideOverFooter,
} from "./SlideOver";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "./Sheet";
export { StatusBadge, type StatusBadgeProps } from "./StatusBadge";
export { ColourSwatch, type ColourSwatchProps } from "./ColourSwatch";
export { Icon, type IconProps, type IconSize } from "./Icon";
export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "./Modal";
export {
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProviderRoot,
  type ToastRootProps,
} from "./Toast";
export { ToastProvider, useToast, type ToastTone, type ToastOptions } from "./ToastProvider";
export {
  Skeleton,
  StationHomeSkeleton,
  BrowserListSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ReportSkeleton,
  LineageGraphSkeleton,
  AuditLogSkeleton,
} from "./Skeleton";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { ErrorState, type ErrorStateProps } from "./ErrorState";
export { Link, type LinkProps } from "./Link";
export { ExportButton, type ExportButtonProps, type ExportFormat } from "./ExportButton";
export { PrintPreview, type PrintPreviewProps } from "./PrintPreview";
export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./Tooltip";
export {
  DataTableToolbar,
  useTableControls,
  type DataTableToolbarProps,
  type TableControls,
  type UseTableControlsConfig,
} from "./DataTableToolbar";
// ⚠ THE FILTER TYPES ARE EXPORTED FROM CR-DESIGN-SYSTEM-003 (decision D-9). Their absence has already
//   cost a consumer: Bananaworld-CRM's AvailabilityView pins the shape with `as const` and says so in
//   place, because "FilterDef is internal to the design system's table-controls module and is not
//   re-exported from its barrel". A consumer writing a reconciler that must read BOTH stored shapes has
//   to be able to NAME MultiSelectFilterValue, or it will re-declare it locally and drift.
//   Additive: adds names, moves none. SortDir/SortState/SortAccessor are deliberately NOT exported —
//   they are not what that change was about.
export type {
  FilterDef,
  SelectFilterDef,
  MultiSelectFilterDef,
  DateRangeFilterDef,
  FilterValue,
  SelectFilterValue,
  MultiSelectFilterValue,
  DateRangeFilterValue,
  FilterValues,
  SelectOption,
} from "../lib/table-controls";
export {
  RowActions,
  RowActionItem,
  RowActionSeparator,
  type RowActionsProps,
  type RowActionItemProps,
} from "./RowActions";
// 🔴 THE DOCUMENT HEADER, PROMOTED OUT OF Bananaworld-DC AT CR-DESIGN-SYSTEM-002. This re-export is the
//    line between "not one of DC's fourteen import lines changes" and fourteen broken forms: DC keeps
//    importing from its own `@/components/ui`, whose barrel re-exports this package exactly as it
//    already re-exports every other shared primitive here.
// ⚠ `DocumentDateSlotState` IS EXPORTED THOUGH DC'S BARREL DOES NOT RE-EXPORT IT TODAY (decision D-7).
//   DC's `use-document-date.ts` reaches it by deep path into DC's own tree; after DC adopts, that path
//   is gone and its follow-up needs somewhere to point. Additive, and it costs nothing.
export {
  DocumentHeader,
  DOCUMENT_HEADER_SLOTS,
  DOCUMENT_NUMBER_WHERE_TO_SET,
  type DocumentHeaderProps,
  type DocumentHeaderSlot,
  type DocumentNumberSlotState,
  type DocumentDateSlotState,
  type DocumentOrigin,
} from "./DocumentHeader";
// 🔴 THE GRID CONTROLS (CR-DESIGN-SYSTEM-008). They sit BESIDE the `Table` block above — the table is
//    not forked, not wrapped, and gains no prop; `TableHead`, `TableRow`, `TableCell` and
//    `DataTableToolbar` keep their signatures byte for byte, so a consumer that moves its pin and
//    adopts none of this sees no change at all. That is asserted in this package's own suite
//    (`tests/components/Grid.additive.test.tsx`) rather than hoped for: no session can read a sibling
//    consumer to find out what it broke, so the change has to be incapable of breaking one.
//
// ⚠ THE CONTROLS LIVE ON THE TABLE, AND THAT IS THE WHOLE DESIGN. Sorting is the header; grouping is
//   a header dragged into the strip; filtering is the row under the headers; column choice is the
//   header's own menu. The rejected alternative — a "Customise" panel of column tokens beside the
//   grid — is the thing these exist instead of. Do not add one here later.
export {
  GridHeadCell,
  type GridHeadCellProps,
} from "./GridHeadCell";
export {
  GridHeaderMenu,
  GRID_COLUMN_MIME,
  gridDraggedColumn,
  type GridHeaderMenuProps,
  type GridHeaderMenuColumn,
} from "./GridHeaderMenu";
export {
  GridFilterRow,
  type GridFilterRowProps,
  type GridFilterCellDef,
  type GridFilterOption,
} from "./GridFilterRow";
export {
  GridGroupStrip,
  gridGroupHint,
  gridSigmaSummary,
  type GridGroupStripProps,
  type GridGroupChipView,
  type GridSigmaOption,
} from "./GridGroupStrip";
// The header date range as PERMANENT CHROME (OD-RP-7) — presentation only. Every string it prints is
// handed to it, because resolving "last 30 days" needs a clock read in the DEPOT's zone and applying
// "both boxes empty" needs the screen's own default, and neither belongs to a UI package.
export {
  DateRangeChrome,
  type DateRangeChromeProps,
  type DateRangeQuickChoice,
  type DateRangeDraft,
} from "./DateRangeChrome";
