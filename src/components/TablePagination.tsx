"use client";

// TablePagination — the shared paging bar for a long list (CR-DESIGN-SYSTEM-004). It sits BESIDE the
// table, never inside it: `Table`, `DataTableToolbar` and `table-controls` are untouched by this
// component and gain no prop because of it.
//
// The owner's layout (approved 2026-08-14, option A): the rows-per-page picker at the TOP RIGHT, the
// Previous/Next arrows at the top right AND the bottom right, and "Showing 1–25 of 312" at the top
// left. One component rendered twice, switched by `placement` — the same props object both times, so
// the two bars can never disagree about which page the list is on.
//
//   <DataTableToolbar … />                              {/* unchanged */}
//   <TablePagination placement="top"    {...paging} />
//   <TableContainer><Table>…</Table></TableContainer>    {/* unchanged */}
//   <TablePagination placement="bottom" {...paging} />
//
// Pure UI (TECH-COMP-003): no network, no fetching, no state of its own. `page`, `pageSize` and
// `totalCount` are INPUTS; computing the total is the consumer's job.
//
// 🔴 THE CONSUMER OBLIGATION THAT COMES WITH THIS CONTROL — do not delete this comment.
//
//    A table whose rows are paged BY THE SERVER must not use `useTableControls` for searching or
//    filtering. `useTableControls` narrows only the rows it holds, which is one page. Send the search
//    text and the filter values to the server and let it decide both the rows and the total; feed the
//    total back into `TablePagination.totalCount`. Using both together produces a search that hides
//    matching records with no indication that it has — which, to an operator, is indistinguishable
//    from data loss, and is invisible on a short list.
//
//    Two more obligations while you are here:
//    · `totalCount` must be the count of rows THAT PERSON MAY SEE — the same scope filter as the page
//      query. A total computed without it leaks the existence of records through a number.
//    · The bottom bar is a companion, never the whole control: it carries the arrows only. Render the
//      top bar too, or render only the top bar. `placement` defaults to "top" for exactly that reason.
//
// 🔴 Two lines that must not be "tidied":
//    · Only `placement="top"` carries `role="status"`. Two live regions around one list would announce
//      every page change twice (D-19).
//    · The picker renders in the top bar only. Two pickers would be two sources of truth for one
//      number (D-20).

import { type ReactElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../lib";
import {
  TABLE_PAGE_SIZES,
  tablePageRange,
  type TablePageRange,
  type TablePageState,
} from "../lib/table-paging";

import { Button } from "./Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

export type TablePaginationPlacement = "top" | "bottom";

export interface TablePaginationProps {
  /** The current page, 1-based. Out-of-range values render clamped; nothing is called back. */
  readonly page: number;
  readonly pageSize: number;
  /** The total number of rows the operator may see — NOT the number of rows on this page. */
  readonly totalCount: number;
  /** Always emits a complete, valid pair. Changing the page size emits page 1. */
  readonly onChange: (next: TablePageState) => void;
  /**
   * "top" (default) — the full bar: range text, "Rows per page" picker, Previous / Next.
   * "bottom" — the arrows again, right-aligned, for the end of a long list.
   */
  readonly placement?: TablePaginationPlacement;
  /** The offered page sizes. Defaults to TABLE_PAGE_SIZES (25/50/100/200). */
  readonly pageSizes?: readonly number[];
  readonly className?: string;
}

export function TablePagination({
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

  // One callback, always a complete pair (D-5). Two callbacks would let a consumer land on page 9
  // with a size of 200 against a total of 312 — a state this bar would then have to render as
  // "showing nothing".
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
      {/* The range is TEXT A SCREEN READER READS, not an aria-label bolted onto a decoration: the
          announced string and the visible string are the same characters. `role="status"` (implicit
          aria-live="polite") is what acknowledges a page change — pressing Next otherwise replaces
          the rows in silence. */}
      <p role="status" className="m-0 text-sm text-fg-muted tabular-nums">
        {"Showing "}
        <span className="font-medium text-fg">{positionLabel(range)}</span>
        {" of "}
        <span className="font-medium text-fg">{range.total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {/* The <label>-wraps-a-Radix-trigger idiom the toolbar's SelectFilterControl already uses, so
            the caption is the control's name and the keyboard/typeahead/portal behaviour is Radix's,
            not ours. Radix ships no pagination primitive, so the picker is the only part of this bar
            with non-trivial screen-reader behaviour — and it is not hand-rolled. */}
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-fg-muted">Rows per page</span>
          <Select
            value={String(range.pageSize)}
            // Changing the size returns to page 1 (D-6). Holding position would need stable row
            // identity, which a server re-query does not give.
            onValueChange={(next) => onChange({ page: 1, pageSize: Number(next) })}
          >
            <SelectTrigger className="h-9 w-[5.25rem] tabular-nums" aria-label="Rows per page">
              {/* Named rather than derived from the chosen item, so the trigger reads the size
                  actually in force even if a consumer passes one that is not on its own list. */}
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

// "Showing 312–312 of 312" is left literal on purpose (D-8): collapsing it to "Showing 312 of 312"
// reads as a COUNT rather than a POSITION, and that ambiguity in a control four apps share is worse
// than an ugly dash. The en dash matches the one the toolbar's date range already prints.
function positionLabel(range: TablePageRange): string {
  if (range.total === 0) return "0";
  return `${range.from}–${range.to}`;
}
