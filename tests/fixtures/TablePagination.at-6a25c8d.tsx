"use client";

// FROZEN COPY of src/components/TablePagination.tsx exactly as it stood at 6a25c8d (kit 0.7.1), before
// CR-DESIGN-SYSTEM-024. Only the relative imports and the exported name changed. It exists so the
// byte-identity spec can prove the new component renders the same markup when `labels` is absent.
// Do not "improve" it.

import { type ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../src/lib";
import {
  TABLE_PAGE_SIZES,
  tablePageRange,
  type TablePageRange,
  type TablePageState,
} from "../../src/lib/table-paging";

import { Button } from "../../src/components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/Select";

export type TablePaginationPlacement = "top" | "bottom";

export interface TablePaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly onChange: (next: TablePageState) => void;
  readonly placement?: TablePaginationPlacement;
  readonly pageSizes?: readonly number[];
  readonly className?: string;
}

export function TablePaginationAt6a25c8d({
  page,
  pageSize,
  totalCount,
  onChange,
  placement = "top",
  pageSizes = TABLE_PAGE_SIZES,
  className,
}: TablePaginationProps): ReactElement {
  const range = tablePageRange({ page, pageSize }, totalCount);
  const isTop = placement === "top";

  const goTo = (next: number): void => onChange({ page: next, pageSize: range.pageSize });

  const arrows = (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={range.isFirst}
        onClick={() => goTo(range.page - 1)}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Previous
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={range.isLast}
        onClick={() => goTo(range.page + 1)}
      >
        Next <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  if (!isTop) {
    return (
      <nav
        aria-label="List paging, end of list"
        className={cn("flex flex-wrap items-center justify-end gap-3 pt-2.5", className)}
      >
        {arrows}
      </nav>
    );
  }

  return (
    <nav
      aria-label="List paging"
      className={cn("flex flex-wrap items-center justify-between gap-3 pb-2.5", className)}
    >
      <p role="status" className="m-0 text-sm text-fg-muted tabular-nums">
        {"Showing "}
        <span className="font-medium text-fg">{positionLabel(range)}</span>
        {" of "}
        <span className="font-medium text-fg">{range.total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-fg-muted">Rows per page</span>
          <Select
            value={String(range.pageSize)}
            onValueChange={(next) => onChange({ page: 1, pageSize: Number(next) })}
          >
            <SelectTrigger className="h-9 w-[5.25rem] tabular-nums" aria-label="Rows per page">
              <SelectValue>{range.pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {arrows}
      </div>
    </nav>
  );
}

function positionLabel(range: TablePageRange): string {
  if (range.total === 0) return "0";
  return `${range.from}–${range.to}`;
}
