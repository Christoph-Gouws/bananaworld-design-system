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
export { ListCard, type ListCardProps } from "./ListCard";
export {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type SortDirection,
} from "./Table";
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
export {
  RowActions,
  RowActionItem,
  RowActionSeparator,
  type RowActionsProps,
  type RowActionItemProps,
} from "./RowActions";
