"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
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
 * Three table-wide answers are asked ONCE on `<Table>` and read by every part beneath it — `density`
 * (how tightly the table is set), `wrap` (what a value too wide for its column does) and
 * `columnWidth` (how much room a column may take before it is cut). All three default to what has
 * always shipped, so a table that declares none of them renders byte-identically; §"THREE TABLE-WIDE
 * ANSWERS" below has the detail, and the per-axis class records are what keep them honest.
 *
 * A cell may override two of the three for its own column — `wrap` (a column holding a chip wants one
 * line and NO clipping) and `width` (a customer name deserves more room than a reference code). The
 * table's answer is the default; the cell's is the exception. `GridHeadCell` and `GridFilterRow` take
 * the same `width`, because a column is three elements in three rows and the widest one wins.
 *
 * ⚠ `TableCell`'s `width` ALSO STILL CARRIES THE LEGACY HTML ATTRIBUTE React declares on a `<td>` —
 *   one of the four step names is the ceiling, anything else is forwarded to the DOM untouched. See
 *   `TableCellProps.width`; CR-DESIGN-SYSTEM-010 F3 is what that repairs.
 *
 * QUALITY-JUSTIFY RC-05 — This file is ONE table element family (container, table, header, body, row,
 * head, cell) plus the three table-wide answers those seven parts read; 43% of its lines are the
 * comments carrying rules the family cannot be maintained without, and its executable code is 262
 * lines. Splitting the density/wrap/width vocabulary out would separate those class records from the
 * only components that emit them — weakening the one-class-per-axis rule this file exists to state —
 * and would still leave the file over 300 lines, which is ceremony for no reduction. The estate's own
 * precedent agrees: `DocumentHeader.tsx` (585) and `Combobox.tsx` (371) are single component families
 * kept whole for the same reason.
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
 *
 * ============================================================================
 * 🔴 THREE TABLE-WIDE ANSWERS, ASKED ONCE (CR-DESIGN-SYSTEM-009)
 * ============================================================================
 * `density`, `wrap` and `columnWidth` are asked on `<Table>` and read by everything under it —
 * `TableHead`, `TableCell`, and the grid's own `GridHeadCell` and `GridFilterRow`, which render
 * inside this tree. That is not tidiness: a table that went compact while its filter row did not is
 * a row of tall boxes over short rows, which is worse than either density on its own. One switch
 * reaching all of them makes that state UNREACHABLE rather than merely discouraged.
 *
 * 🔴 AND EVERY ONE OF THEM DEFAULTS TO WHAT SHIPS TODAY. Five apps pin this package by git sha; a
 *    consumer that moves its pin and declares nothing new renders byte-identically, because
 *    `density="default"`, `wrap="wrap"` and an uncapped column emit the exact class strings that are
 *    in this file today, in the same positions. Asserted in `Grid.additive.test.tsx`, not hoped for.
 *
 * ⚠ `TableHeader` AND `TableRow` TAKE NO DENSITY CLASS, AND THAT IS A DECISION RATHER THAN AN
 *   OMISSION. Neither carries a size class today: a row's HEIGHT is its cells' padding. Inventing a
 *   row-level height, or a `[&>td]` override, would put a second class on an axis the cell already
 *   owns — and twMerge keeps the LAST of a conflicting pair, so one of them would be a silent,
 *   invisible override. The compact row is 24px because its cells say `py-1`, and for no other reason.
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

/**
 * How tightly the whole table is set. "default" is the 44px browser row (UX-DS-005) and it does not
 * move; "compact" is for a wide report that has to be read whole on one screen.
 *
 * Naming follows `ListCard`'s existing `density` variant rather than inventing a second vocabulary.
 */
export type TableDensity = "default" | "compact";

/**
 * What a head or a cell does with a value wider than its column.
 *
 * - "wrap" — today's behaviour: a body cell breaks onto a second line. **The default, and it stays.**
 * - "nowrap" — one line, nothing clipped. What a column holding a CHIP wants: `overflow:hidden` would
 *   slice the chip's ring.
 * - "truncate" — one line, cut with an ellipsis at the column's width step, and recoverable on hover
 *   for a plain-string cell.
 */
export type TableWrap = "wrap" | "nowrap" | "truncate";

/**
 * How much room a column may take before it is cut. A CEILING, not a fixed width — under auto table
 * layout a column never takes room it does not need, which is what stops a capped report from looking
 * like a grid of equal boxes.
 *
 * ⚠ "full" means NEVER CUT THIS COLUMN, and it is what every column gets unless the table asks to
 *   truncate. Three steps rather than a pixel field is the point: a design system's job here is to
 *   stop 27 magic numbers being invented column by column and app by app.
 */
export type TableColumnWidth = "narrow" | "medium" | "wide" | "full";

// ⚠ STATIC ARBITRARY VALUES, NEVER `max-w-[${n}px]` BUILT BY CONCATENATION. This package does not
//   depend on Tailwind — the consumer compiles these strings against its own config, and a class
//   assembled at runtime is invisible to the scanner and emits no CSS at all. Arbitrary values rather
//   than `max-w-24` for the same reason: the spacing-scale name exists only in some Tailwind versions.
const COLUMN_WIDTH: Record<TableColumnWidth, string> = {
  narrow: "max-w-[6rem]", //  96px — a code, a status word, a date, a count
  medium: "max-w-[11rem]", // 176px — most columns
  wide: "max-w-[20rem]", // 320px — a customer name, an address, a note
  full: "", // uncapped: never cut this column (chips, and today's behaviour)
};

// 🔴 A WIDTH IS EMITTED ONLY WHERE THE ELEMENT IS TRUNCATING. Capping a column that is not clipping
//    its overflow just makes the value spill visibly out of its cell, so the two belong together —
//    and it is also what keeps every existing render byte-identical, since nothing truncates by
//    default. A chip column therefore needs nothing beyond the `wrap="nowrap"` it already wanted.
function columnWidthClass(wrap: TableWrap, width: TableColumnWidth): string {
  return wrap === "truncate" ? COLUMN_WIDTH[width] : "";
}

/**
 * Is this `width` one of the four design-system steps, or the legacy HTML attribute?
 *
 * 🔴 `TableCellProps.width` HAS TO CARRY BOTH MEANINGS (CR-DESIGN-SYSTEM-010 F3). React's
 *    `TdHTMLAttributes` declares `width?: number | string`, so `<TableCell width={120}>` was legal
 *    before CR-DESIGN-SYSTEM-009 and rendered `<td width="120">`. Declaring the step under the SAME
 *    NAME narrowed the inherited prop and destructured it away, so that consumer's `tsc` fails on a
 *    file it did not touch the moment it moves its pin — and a cast or an untyped file loses the
 *    column's sizing silently instead. This predicate is how one name serves both.
 */
function isColumnWidth(width: unknown): width is TableColumnWidth {
  return width === "narrow" || width === "medium" || width === "wide" || width === "full";
}

// The three table-wide answers, carried as one record so `<Table>` provides them in one place and a
// nested table resets all three together. A provider renders no DOM node — the same argument
// `RowValignContext` carries below — so the HTML of an existing table is untouched.
interface TableLayout {
  readonly density: TableDensity;
  readonly wrap: TableWrap;
  readonly columnWidth: TableColumnWidth;
}

const TABLE_LAYOUT_DEFAULT: TableLayout = {
  density: "default",
  wrap: "wrap",
  columnWidth: "full",
};

const TableLayoutContext = createContext<TableLayout>(TABLE_LAYOUT_DEFAULT);

/**
 * The density the enclosing `<Table>` asked for — "default" outside one.
 *
 * Exported because a consumer's report is not built only from this package's cells: it renders raw
 * `<th>`s of its own beside these (an Actions column, group and subtotal rows). Without a reader it
 * would hard-code a second copy of the density, and the two would drift at the first token change.
 */
export function useTableDensity(): TableDensity {
  return useContext(TableLayoutContext).density;
}

/** The wrap treatment the enclosing `<Table>` asked for — "wrap" outside one. Exported for the same
 * reason as `useTableDensity`: a consumer's own cells have to match, not guess. */
export function useTableWrap(): TableWrap {
  return useContext(TableLayoutContext).wrap;
}

/**
 * Everything one cell needs from its table, resolved against that cell's own overrides.
 *
 * 🔴 EVERY HOOK IS CALLED UNCONDITIONALLY AND THE PROPS RESOLVE OVER THE RESULT. Written once, here,
 *    rather than twice in `TableHead` and `TableCell`, because the tempting spelling —
 *    `wrap ?? useTableWrap()` — short-circuits and calls a hook conditionally. That is the exact trap
 *    CR-DESIGN-SYSTEM-007 recorded against the row context, and one shared reader makes it structural
 *    instead of a comment that has to be repeated and obeyed in two places.
 */
function useCellLayout(
  wrap: TableWrap | undefined,
  width: TableColumnWidth | undefined,
): { readonly density: TableDensity; readonly wrap: TableWrap; readonly widthClass: string } {
  const layout = useContext(TableLayoutContext);
  const effectiveWrap = wrap ?? layout.wrap;
  return {
    density: layout.density,
    wrap: effectiveWrap,
    widthClass: columnWidthClass(effectiveWrap, width ?? layout.columnWidth),
  };
}

/**
 * The width class for a RAW cell in this table that is neither a `TableHead` nor a `TableCell` —
 * which in this package means the grid's filter `<th>`.
 *
 * ⚠ INTERNAL (not barrelled). It exists for one reason: a filter box wider than the cap re-widens the
 *   whole column from the header down, so all three of a column's rows have to take the same ceiling
 *   or the cap is silently defeated.
 */
export function useColumnWidthClass(width: TableColumnWidth | undefined): string {
  return useCellLayout(undefined, width).widthClass;
}

const TABLE_TYPE: Record<TableDensity, string> = { default: "text-sm", compact: "text-xs" };

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** How tightly this table is set. Defaults to "default" — the 44px row, unmoved. */
  density?: TableDensity;
  /** What every head and cell under this table does with an over-wide value. Defaults to "wrap". */
  wrap?: TableWrap;
  /**
   * The width step a column gets when it declares none of its own. Defaults to "full" — uncapped —
   * EXCEPT under `wrap="truncate"`, where it defaults to "medium".
   *
   * ⚠ A TABLE THAT ASKS TO CUT MUST CUT. `text-overflow: ellipsis` fires only when the box has a
   *   definite width, so a truncating table with no cap anywhere would silently cut nothing and the
   *   sideways scroll would come straight back — a setting named "cut it" that does not is a footgun.
   */
  columnWidth?: TableColumnWidth;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, density = "default", wrap = "wrap", columnWidth, ...props },
  ref,
) {
  const layout = useMemo<TableLayout>(
    () => ({
      density,
      wrap,
      columnWidth: columnWidth ?? (wrap === "truncate" ? "medium" : "full"),
    }),
    [density, wrap, columnWidth],
  );
  return (
    <TableLayoutContext.Provider value={layout}>
      <table
        ref={ref}
        className={cn("w-full border-collapse", TABLE_TYPE[density], "text-fg", className)}
        {...props}
      />
    </TableLayoutContext.Provider>
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

// ONE CLASS PER AXIS, so density is not an extra class appended to the existing one — each element
// picks one COMPLETE padding string from a two-entry record. Nothing merges, nothing overrides, and
// the `default` entry is the exact string that has always been there.
const HEAD_PAD: Record<TableDensity, string> = { default: "px-3 py-2.5", compact: "px-1.5 py-1" };
const CELL_PAD: Record<TableDensity, string> = { default: "px-3 py-2", compact: "px-1.5 py-1" };

// A body cell emits nothing on the whitespace/overflow axis today.
const CELL_WRAP: Record<TableWrap, string> = {
  wrap: "",
  nowrap: "whitespace-nowrap",
  truncate: "truncate",
};
// 🔴 A HEAD ALREADY NEVER WRAPS, AND THAT DOES NOT CHANGE. The table-level switch only decides
//    whether a head also TRUNCATES. A record shared with the cell — `wrap: ""` — would DROP
//    `whitespace-nowrap` from every existing header, which is a rendering change on every table in
//    the estate, and `Table.test.tsx`'s exact-head-string assertion would redden on the way past.
const HEAD_WRAP: Record<TableWrap, string> = {
  wrap: "whitespace-nowrap",
  nowrap: "whitespace-nowrap",
  truncate: "truncate",
};

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** Render a clickable sort control. */
  sortable?: boolean;
  /** Current sort direction for this column, or null when not the active sort column. */
  sortDir?: SortDirection | null;
  onSort?: () => void;
  /** Override the enclosing table's `wrap` for this column's header. Defaults to the table's answer. */
  wrap?: TableWrap;
  /**
   * How much room this column may take before it is cut. Defaults to the table's `columnWidth`.
   *
   * ⚠ A COLUMN IS THREE ELEMENTS IN THREE ROWS — this header, the grid's filter cell, and one
   *   `TableCell` per body row — and IF THEY DISAGREE THE WIDEST ONE WINS and the cap is defeated.
   *   Declare the step once in the consumer's own column list and pass it to all three.
   */
  width?: TableColumnWidth;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, align, sortable, sortDir, onSort, wrap, width, children, ...props },
  ref,
) {
  const { density, wrap: effectiveWrap, widthClass } = useCellLayout(wrap, width);
  const base = cn(
    HEAD_PAD[density],
    "text-2xs font-semibold uppercase tracking-wide text-fg-muted",
    "border-b border-border",
    HEAD_WRAP[effectiveWrap],
    "select-none",
    // Emitted BEFORE `className`, so a caller with a bespoke width in `className` still wins under
    // twMerge — the same precedence rule this file already relies on. No escape hatch to invent.
    widthClass,
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
  /**
   * Override the enclosing table's `wrap` for this cell. Defaults to the table's answer.
   *
   * ⚠ A CELL HOLDING A CHIP WANTS "nowrap", NOT "truncate": `overflow:hidden` clips the chip's ring
   *   and badge, and it also clips an absolutely-positioned child. Every menu in the grid is Radix
   *   and portals to `body`, so none is affected — but a future inline, non-portalled popover in a
   *   truncating cell would be, and this is how it opts out.
   */
  wrap?: TableWrap;
  /**
   * How much room this column may take before it is cut. See `TableHeadProps.width` — the header,
   * the filter cell and this must all be given the SAME step or the widest one defeats the cap.
   *
   * ⚠ PLUS THE LEGACY HTML `width` ATTRIBUTE, which React's `TdHTMLAttributes` also declares on this
   *   element (`width?: number | string`). A value that is one of the four steps is the design-system
   *   ceiling; **anything else is forwarded to the `<td>` untouched**, exactly as it was before
   *   CR-DESIGN-SYSTEM-009 destructured it out. That is why the union is widened rather than the prop
   *   renamed: renaming it to `columnWidth` would REMOVE `width` from the export surface, which the
   *   additive-only lane rule forbids outright.
   *
   * 🔴 `ThHTMLAttributes` DECLARES NO `width`, so `TableHeadProps` has no collision and is
   *    deliberately NOT widened to match. The asymmetry is React's, not this file's: `<TableHead
   *    width={120}>` was already a type error before CR-DESIGN-SYSTEM-009 and still is.
   */
  width?: TableColumnWidth | number | (string & {});
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, numeric, muted, valign, wrap, width, title, children, ...props },
  ref,
) {
  // One prop, two meanings, split here and nowhere else: the four literals are the design-system
  // ceiling, everything else is the DOM attribute this element has always forwarded. The four steps
  // are not valid HTML widths, so no value changes meaning in either direction.
  const step = isColumnWidth(width) ? width : undefined;
  const htmlWidth = isColumnWidth(width) ? undefined : width;
  const { density, wrap: effectiveWrap, widthClass } = useCellLayout(wrap, step);
  // The whole value is not lost when it is cut: hovering shows it in full. Only for a PLAIN STRING —
  // where the children are elements no `title` is invented, because a fabricated tooltip reading
  // "[object Object]", or an empty one, is worse than no tooltip. A caller's own `title` still wins.
  //
  // ⚠ This is an addition for sighted mouse users, not an accessibility fix. CSS truncation hides
  //   nothing from assistive technology — the DOM text node stays whole either way.
  const cutTitle =
    effectiveWrap === "truncate" && typeof children === "string" && children.length > 0
      ? children
      : undefined;
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
      title={title ?? cutTitle}
      // `undefined` on every path a caller reaches today, so React sets no attribute and an existing
      // `<td>` is byte-identical — it is emitted only when a consumer passed a legacy HTML width.
      width={htmlWidth}
      className={cn(
        CELL_PAD[density],
        // THE CELL DID NOT ASK: the default — or its row's answer, which is a default for exactly
        // these cells — sits where `align-middle` has always sat, so an existing cell's class string
        // is byte-identical, including one that overrides vertical alignment through `className`,
        // which wins only because `className` is emitted last.
        !cellAskedForValign && vertical,
        numeric && "tabular-nums",
        muted && "text-fg-subtle",
        // Both empty on every path a caller reaches today, so they take no position in the string
        // until they are asked for. `truncate` is used as the single Tailwind token rather than its
        // three constituents: twMerge cannot split a token, so it cannot half-override it.
        CELL_WRAP[effectiveWrap],
        widthClass,
        alignClass(effectiveAlign),
        className,
        // THE CELL ASKED, on its own prop: emitted AFTER `className` so a stray utility there cannot
        // silently defeat the prop. twMerge keeps the last of a conflicting pair, so the answer the
        // caller asked for wins. A ROW's answer never reaches here — see the predicate above.
        cellAskedForValign && vertical,
      )}
      {...props}
    >
      {children}
    </td>
  );
});
