"use client";

import {
  createContext,
  forwardRef,
  useContext,
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
 *
 * A row whose cells are of unequal height (a chip or hint sits under one field, making its cell
 * taller) lines up along the top with `<TableRow valign="top">`, and a single column opts back out
 * with `<TableCell valign="middle">`. The default is "middle" everywhere and does not move.
 *
 * Vertical-alignment precedence, most specific first:
 *   cell `valign` prop  >  cell `className`  >  row `valign` prop  >  the "middle" default
 * The middle rung is what CR-DESIGN-SYSTEM-007 restored: a `className` utility is a CELL-level
 * answer — before the row option existed it was the only way to write one — so a ROW-level answer
 * must not silently override it.
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

// The vertical axis of a table cell. Module-private, exactly as `Align` below is: a union used only
// inside interfaces that are already exported needs no export of its own and moves no barrel.
type VAlign = "top" | "middle" | "bottom";

// Emit exactly ONE vertical-alignment class on every path — the same rule `alignClass` below obeys,
// and for the same reason: twMerge keeps the LAST of two conflicting classes, so a second one
// emitted anywhere is a silent, invisible override waiting to happen.
function valignClass(valign: VAlign | undefined): string {
  if (valign === "top") return "align-top";
  if (valign === "bottom") return "align-bottom";
  return "align-middle";
}

// A row's answer for its own cells, so a wide grid asks once instead of on every cell. Private —
// the API is the two `valign` props; this is only how the row reaches its own children.
const RowValignContext = createContext<VAlign | undefined>(undefined);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Adds hover + pointer affordance for clickable rows. */
  interactive?: boolean;
  /**
   * Vertical alignment for every cell in this row — asked once, instead of repeated on all six
   * cells of a wide grid. Defaults to "middle"; see `TableCellProps.valign` for why that default
   * does not move.
   *
   * This is a DEFAULT FOR ITS CELLS, not an override of them: a cell that expresses its own
   * vertical answer — through its `valign` prop OR through a vertical utility in its `className` —
   * keeps that answer. Precedence is cell prop > cell `className` > this > "middle".
   */
  valign?: VAlign;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, interactive, valign, ...props },
  ref,
) {
  // Provided ALWAYS, including when `valign` is undefined. A provider renders no DOM node, so the
  // HTML is untouched either way — and always providing means a row RESETS the value for anything
  // nested inside it, so a table inside a top-aligned row's cell does not silently inherit that
  // row's alignment. (Providing only when set keeps the React tree literally unchanged for existing
  // tables, at the price of exactly that leak; the leak's failure mode is silent visual
  // misalignment, which is the bug this option exists to fix, so correctness wins.)
  return (
    <RowValignContext.Provider value={valign}>
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
    </RowValignContext.Provider>
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
  /**
   * Vertical alignment. Defaults to "middle" — 🔴 AND THAT DEFAULT IS ESTATE-WIDE CONTRACT. Five
   * apps pin this package by git sha; flipping it would move the contents of every table in the
   * estate at their next bump. This option is opt-in and nothing else.
   *
   * Set "top" when a row holds cells of unequal height — a field with a chip or hint under it makes
   * its cell taller, and every middle-aligned neighbour then sits visibly lower than it.
   * `<TableRow valign="top">` asks once for a whole row; this wins over that, and so does a
   * vertical utility written in this cell's own `className`. Precedence is
   * this prop > this cell's `className` > the row's prop > "middle".
   *
   * ⚠ This CONSUMES React's deprecated `TdHTMLAttributes.valign` presentational attribute — exactly
   * as `align` above consumes `TdHTMLAttributes.align`. Passing it was already possible and already
   * visually inert (the `align-middle` class beat it); it now does what it says, and is no longer
   * forwarded to the DOM.
   */
  valign?: VAlign;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, numeric, muted, valign, ...props },
  ref,
) {
  // A numeric cell right-aligns by default (matching its right-aligned header); an explicit `align`
  // always wins. Emit exactly ONE alignment class so twMerge can't drop it (a stray default
  // `text-left` previously overrode `numeric`'s `text-right`, mis-aligning numeric columns).
  const effectiveAlign: Align = align ?? (numeric ? "right" : "left");
  // The same one-class rule on the vertical axis. The cell's own answer wins over its row's.
  const rowValign = useContext(RowValignContext);
  const vertical = valignClass(valign ?? rowValign);
  // 🔴 Only the CELL's own prop earns position (B) — after `className`. A row-level answer is a
  //    DEFAULT for cells that express no vertical answer of their own, so it is emitted at position
  //    (A), exactly where the untouched `align-middle` default sits, and a cell's own `className`
  //    still beats it. Computing this from the RESOLVED value let a row-level answer silently beat
  //    a cell-level one, inverting the cell > row precedence (CR-DESIGN-SYSTEM-007 F1).
  const cellAskedForValign = valign !== undefined;
  return (
    <td
      ref={ref}
      className={cn(
        "px-3 py-2",
        // THE CELL DID NOT ASK: the default — or its row's answer, which is a default for exactly
        // these cells — sits where `align-middle` has always sat, so an existing cell's class string
        // is byte-identical, including one that overrides vertical alignment through `className`,
        // which wins only because `className` is emitted last.
        !cellAskedForValign && vertical,
        numeric && "tabular-nums",
        muted && "text-fg-subtle",
        alignClass(effectiveAlign),
        className,
        // THE CELL ASKED, on its own prop: emitted AFTER `className` so a stray utility there cannot
        // silently defeat the prop. twMerge keeps the last of a conflicting pair, so the answer the
        // caller asked for wins. A ROW's answer never reaches here — see the predicate above.
        cellAskedForValign && vertical,
      )}
      {...props}
    />
  );
});
