import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import * as pkg from "../../src";
import {
  GRID_COLUMN_MIME,
  GridHeadCell,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  gridDraggedColumn,
  type GridHeadCellProps,
} from "../../src";

// ============================================================================
// 🔴 CR-DESIGN-SYSTEM-011 IS ADDITIVE, AND THAT IS AN ACCEPTANCE CRITERION
// ============================================================================
// The drag control is NEW names only. A consumer that moves its pin and adopts none of it must see
// nothing: every export it could import before still exists, and the grid's own column drag — the
// only drag this package had — behaves exactly as it shipped. No session can read a sibling consumer
// to find out what it broke, so the change has to be INCAPABLE of breaking one (R-028-01's precedent,
// `Grid.additive.test.tsx`).

// Every RUNTIME export of the package root at `main` @ 8387f66b, read off the module itself before this
// change was written. Types are erased at run time; they are held by the compile-time check below.
const EXPORTS_AT_8387F66B = [
  "AuditLogSkeleton", "BrowserListSkeleton", "Button", "Checkbox", "ChoiceGroup", "ColourSwatch",
  "Combobox", "DOCUMENT_DATE_WARN_DAYS", "DOCUMENT_HEADER_SLOTS", "DOCUMENT_NUMBER_WHERE_TO_SET",
  "DashboardSkeleton", "DataTableToolbar", "DateRangeChrome", "DocumentHeader", "EmptyState",
  "ErrorState", "ExportButton", "FormSkeleton", "GRID_COLUMN_MIME", "GridFilterRow", "GridGroupStrip",
  "GridHeadCell", "GridHeaderMenu", "Icon", "Input", "Label", "LineageGraphSkeleton", "Link",
  "ListCard", "Modal", "ModalClose", "ModalContent", "ModalDescription", "ModalFooter", "ModalHeader",
  "ModalTitle", "ModalTrigger", "NumericInput", "PrintPreview", "Radio", "RadioGroup",
  "ReportSkeleton", "RowActionItem", "RowActionSeparator", "RowActions", "Select", "SelectContent",
  "SelectGroup", "SelectItem", "SelectSeparator", "SelectTrigger", "SelectValue", "Sheet",
  "SheetBody", "SheetClose", "SheetContent", "SheetDescription", "SheetFooter", "SheetHeader",
  "SheetTitle", "SheetTrigger", "Skeleton", "SlideOver", "SlideOverBody", "SlideOverClose",
  "SlideOverContent", "SlideOverDescription", "SlideOverFooter", "SlideOverHeader", "SlideOverTitle",
  "SlideOverTrigger", "StationHomeSkeleton", "StatusBadge", "SurfaceProvider", "TABLE_PAGE_SIZES",
  "Table", "TableBody", "TableCell", "TableContainer", "TableHead", "TableHeader", "TablePagination",
  "TableRow", "TableSkeleton", "Textarea", "ToastClose", "ToastDescription", "ToastProvider",
  "ToastProviderRoot", "ToastRoot", "ToastTitle", "ToastViewport", "Tooltip", "TooltipContent",
  "TooltipProvider", "TooltipTrigger", "cn", "currencySymbol", "describeDocumentDate",
  "filterValueFromStored", "formatDateTimeZA", "formatDateZA", "formatKg", "formatMoney",
  "formatRelativeTimeZA", "formatTimeZA", "gridColumnOrder", "gridDraggedColumn",
  "gridFilterIsEmpty", "gridFilterSelect", "gridFilterSelected", "gridFilterSet", "gridGroupHint",
  "gridSigmaSummary", "gridSortPosition", "gridSortToggle", "storedFromFilterValue",
  "tablePageRange", "useSurface", "useTableControls", "useTableDensity", "useTableWrap", "useToast",
] as const;

// The six names this change adds — and NOTHING else.
const ADDED_BY_011 = [
  "DRAG_BOARD_MIME",
  "DragBoard",
  "DragGrip",
  "DragKeyboardHint",
  "useDragBoard",
  "useDropTarget",
] as const;

// 🔴 A COMPILE-TIME CHECK, not a runtime one: if a later edit narrowed or renamed a grid prop this
//    change sits beside, `tsc` fails here before a consumer's does.
const gridHeadCellStillTakes = {
  columnKey: "room",
  label: "Room",
  onColumnDropped: (_key: string) => undefined,
} satisfies GridHeadCellProps;

afterEach(() => {
  cleanup();
});

describe("a consumer that adopts NOTHING sees nothing", () => {
  it("🔴 every runtime export that existed at 8387f66b still exists", () => {
    const now = new Set(Object.keys(pkg));
    const missing = EXPORTS_AT_8387F66B.filter((name) => !now.has(name));
    expect(missing).toEqual([]);
  });

  it("🔴 the change adds exactly its six names — counted, and named", () => {
    const before = new Set<string>(EXPORTS_AT_8387F66B);
    const added = Object.keys(pkg)
      .filter((name) => !before.has(name))
      .sort();
    expect(added).toEqual([...ADDED_BY_011].sort());
    expect(Object.keys(pkg)).toHaveLength(EXPORTS_AT_8387F66B.length + ADDED_BY_011.length);
  });

  it("the new names use their OWN mime token, never the grid's", () => {
    expect(pkg.DRAG_BOARD_MIME).not.toBe(GRID_COLUMN_MIME);
  });
});

describe("the grid's own column drag is untouched (CR-DESIGN-SYSTEM-008)", () => {
  function fakeTransfer(): DataTransfer {
    const data = new Map<string, string>();
    return {
      setData: (type: string, value: string) => void data.set(type, value),
      getData: (type: string) => data.get(type) ?? "",
      get types() {
        return [...data.keys()];
      },
      effectAllowed: "none",
      dropEffect: "none",
    } as unknown as DataTransfer;
  }

  it("🔴 a header dragged onto another still reports the dragged column, through its own mime", () => {
    const dropped: string[] = [];
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <GridHeadCell columnKey="batch" label="Batch" />
            <GridHeadCell
              {...gridHeadCellStillTakes}
              onColumnDropped={(key) => void dropped.push(key)}
            />
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    const batch = container.querySelector("[data-grid-column=batch]") as HTMLElement;
    const room = container.querySelector("[data-grid-column=room]") as HTMLElement;
    const transfer = fakeTransfer();
    // It is draggable, and it is NOT one of the new grips.
    expect(batch.getAttribute("draggable")).toBe("true");
    expect(batch.querySelector("[data-drag-grip]")).toBeNull();
    fireEvent.dragStart(batch, { dataTransfer: transfer });
    expect(gridDraggedColumn(transfer)).toBe("batch");
    // Its dragover still prevents the default — outside any DragBoard, as it always did.
    expect(fireEvent.dragOver(room, { dataTransfer: transfer })).toBe(false);
    fireEvent.drop(room, { dataTransfer: transfer });
    expect(dropped).toEqual(["batch"]);
  });
});
