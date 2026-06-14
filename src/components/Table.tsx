"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib";

/**
 * Table — the canonical dense data-table primitive (EPIC-002-M003).
 *
 * The first list primitive in the system: a Stripe/Linear-style table with a quiet header row,
 * 44px body rows (UX-DS-005 browser density), tabular numerals on numeric columns, sortable
 * column headers, and hover affordance. Every later admin + transactional list (Pallets, POs,
 * Sales Orders, Users) composes these parts. Pure presentation — no data fetching, no business
 * rules (TECH-COMP-003).
 *
 * Composition:
 *   <TableContainer>
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead sortable sortDir="asc" onSort={...}>Code</TableHead>
 *           <TableHead align="right">Nominal (kg)</TableHead>
 *         </TableRow>
 *       </TableHeader>
 *       <TableBody>
 *         <TableRow interactive onClick={...}>
 *           <TableCell>ITM-001</TableCell>
 *           <TableCell align="right" numeric>18.140</TableCell>
 *         </TableRow>
 *       </TableBody>
 *     </Table>
 *   </TableContainer>
 */

// Rounded, bordered frame around the table so the corners read crisply (the table itself can't
// carry a border-radius on its own cells).
export const TableContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TableContainer({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full overflow-x-auto rounded-lg border border-border bg-surface",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(function Table(
  { className, ...props },
  ref,
) {
  return (
    <table
      ref={ref}
      className={cn("w-full border-collapse text-sm text-fg", className)}
      {...props}
    />
  );
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn("bg-surface-muted", className)} {...props} />;
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn("", className)} {...props} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Adds hover + pointer affordance for clickable rows. */
  interactive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, interactive, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border last:border-0",
        interactive &&
          "cursor-pointer transition-colors duration-fast hover:bg-surface-muted focus-within:bg-surface-muted",
        className,
      )}
      {...props}
    />
  );
});

type Align = "left" | "right" | "center";

function alignClass(align: Align | undefined): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export type SortDirection = "asc" | "desc";

function sortIndicator(sortDir: SortDirection | null | undefined) {
  if (sortDir === "asc") return ChevronUp;
  if (sortDir === "desc") return ChevronDown;
  return ChevronsUpDown;
}

function ariaSort(sortDir: SortDirection | null | undefined): "ascending" | "descending" | "none" {
  if (sortDir === "asc") return "ascending";
  if (sortDir === "desc") return "descending";
  return "none";
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** Render a clickable sort control. */
  sortable?: boolean;
  /** Current sort direction for this column, or null when not the active sort column. */
  sortDir?: SortDirection | null;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, align, sortable, sortDir, onSort, children, ...props },
  ref,
) {
  const base = cn(
    "px-3 py-2.5 text-2xs font-semibold uppercase tracking-wide text-fg-muted",
    "border-b border-border whitespace-nowrap select-none",
    alignClass(align),
    className,
  );
  if (sortable !== true) {
    return (
      <th ref={ref} scope="col" className={base} {...props}>
        {children}
      </th>
    );
  }
  const Indicator = sortIndicator(sortDir);
  return (
    <th ref={ref} scope="col" aria-sort={ariaSort(sortDir)} className={base} {...props}>
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "inline-flex items-center gap-1 hover:text-fg transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:text-fg",
          align === "right" && "flex-row-reverse",
        )}
      >
        {children}
        <Indicator
          className={cn("h-3.5 w-3.5", sortDir === null && "text-fg-subtle")}
          aria-hidden="true"
        />
      </button>
    </th>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** Tabular numerals + right alignment default for numeric columns. */
  numeric?: boolean;
  /** Dim the cell — used for deactivated rows. */
  muted?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, numeric, muted, ...props },
  ref,
) {
  // A numeric cell right-aligns by default (matching its right-aligned header); an explicit `align`
  // always wins. Emit exactly ONE alignment class so twMerge can't drop it (a stray default
  // `text-left` previously overrode `numeric`'s `text-right`, mis-aligning numeric columns).
  const effectiveAlign: Align = align ?? (numeric ? "right" : "left");
  return (
    <td
      ref={ref}
      className={cn(
        "px-3 py-2 align-middle",
        numeric && "tabular-nums",
        muted && "text-fg-subtle",
        alignClass(effectiveAlign),
        className,
      )}
      {...props}
    />
  );
});
