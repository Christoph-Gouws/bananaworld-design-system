"use client";

// GridHeadCell — a grid column header that IS its own control (CR-DESIGN-SYSTEM-008).
//
// Anchors: the consuming estate's OD-RP-6 (*"SORT = CLICK THE COLUMN HEADER… the arrow lives IN the
//          header. ❌ NEVER a separate Sort control"*, *"GROUP = DRAG THE COLUMN HEADER ITSELF up into
//          a strip above the grid"*), OD-RP-9 (*"multi-column sort by shift-click, with 1 / 2 order
//          markers in the headers"*), and the owner-approved drawing those were settled against.
//
// ============================================================================
// 🔴 IT IS A `TableHead`, NOT A SECOND HEADER COMPONENT
// ============================================================================
// The frame, the padding, the border and the uppercase type all come from `TableHead` — this renders
// INSIDE one. A grid header that re-declared that recipe would be a fork of the estate's table
// (TECH-CON-004), and the first token change would move every table except the grids.
//
// ⚠ `TableHead`'s OWN `sortable` PROP IS NOT USED HERE, and that is not an oversight. It renders a
//   chevron button around its children and knows nothing about shift-clicking, sort ORDER markers or
//   dragging. Its signature is untouched by this change; every existing caller renders identically.
//
// PURE UI (TECH-COMP-003 / ADR-001): fires callbacks, renders what it is handed, knows nothing about
// reports, queries, permissions or scope.

import { useState, type DragEvent, type ReactElement } from "react";
import { ArrowDown, ArrowUp, GripVertical, MoreHorizontal, Rows3 } from "lucide-react";

import { cn } from "../lib";
import type { GridSortDir } from "../lib/grid-view";
import { TableHead, useTableDensity, type TableColumnWidth, type TableDensity } from "./Table";
import { GridHeaderMenu, GRID_COLUMN_MIME, gridDraggedColumn } from "./GridHeaderMenu";
import type { GridHeaderMenuColumn } from "./GridHeaderMenu";

export interface GridHeadCellProps {
  readonly columnKey: string;
  readonly label: string;
  readonly align?: "left" | "right";
  /** This column's direction, or null when it is not one of the sort keys. */
  readonly sortDir?: GridSortDir | null;
  /** The 1-based marker, or null for none. See `gridSortPosition` — a single sort shows no number. */
  readonly sortPosition?: number | null;
  /** True when this column is one of the grouping levels: the header says so and stops being draggable. */
  readonly grouped?: boolean;
  /**
   * At most ONE column is pinned, and it is pinned to the left edge.
   *
   * 🔴 ONE, NOT A SET, AND THAT IS A DECISION RATHER THAN A STAGING POST. Stacking several sticky
   *    columns needs each one's rendered WIDTH to compute the next one's `left` offset, which a
   *    presentation component can only get by measuring the DOM after paint — a resize observer per
   *    header, and a visible jump on first render. One pinned column needs no arithmetic at all
   *    (`left: 0`), covers the case the drawing shows, and cannot be subtly wrong.
   */
  readonly pinned?: boolean;
  /**
   * How much room this column may take before its values are cut. Passed straight through to the
   * `TableHead` below, and only bites while the enclosing `<Table>` is truncating.
   *
   * ⚠ THE SAME STEP MUST REACH ALL THREE OF A COLUMN'S ROWS — this header, its `GridFilterRow` cell
   *   and its body `TableCell`. The widest of the three wins, so wiring two of them narrows nothing.
   *   (This header's label span has carried `truncate` since CR-DESIGN-SYSTEM-008 and has never
   *   visibly fired, for exactly the reason §C.4 gives: a `<th>` with no ceiling simply widens.)
   */
  readonly width?: TableColumnWidth;
  /** Fired on click. `additive` is the shift key — see `gridSortToggle`. */
  readonly onSort?: (additive: boolean) => void;
  /** Fired when another column header is dropped ON this one: put that column before this one. */
  readonly onColumnDropped?: (draggedKey: string) => void;
  /** Everything the ⋯ / right-click menu needs, minus the parts this component supplies itself. */
  readonly menu?: {
    readonly canGroup: boolean;
    readonly canHide: boolean;
    readonly columns: readonly GridHeaderMenuColumn[];
    readonly onSortDir: (dir: GridSortDir) => void;
    readonly onGroupBy: () => void;
    readonly onTogglePin: () => void;
    readonly onHide: () => void;
    readonly onToggleColumn: (key: string) => void;
    readonly onResetColumns: () => void;
  };
}

function SortMark({
  dir,
  position,
}: {
  readonly dir: GridSortDir;
  readonly position: number | null;
}): ReactElement {
  const Arrow = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <span className="inline-flex shrink-0 items-baseline text-fg">
      <Arrow className="h-3 w-3 self-center" aria-hidden="true" />
      {/* ⚠ THE NUMBER IS WHAT MAKES A TWO-COLUMN SORT LEGIBLE RATHER THAN MYSTERIOUS (OD-RP-9). It is
          rendered only when there IS an order to read — see `gridSortPosition`. */}
      {position !== null && (
        <sup className="ml-px text-[8.5px] font-bold text-info">{position}</sup>
      )}
    </span>
  );
}

// The header's own chrome, one complete string per axis per density (`Table.tsx`'s rule). The
// "default" entries are byte for byte what shipped, so a table that asks for no density renders it.
//
// ⚠ THE HEADER MUST SHRINK WITH THE BODY OR THE COLUMN DOES NOT NARROW AT ALL: this cell overrides
//   `TableHead`'s horizontal padding with its own (`px-2.5` over `px-3`), so leaving that alone would
//   hold every column open from above while the rows underneath tightened.
const HEAD_PAD: Record<TableDensity, string> = { default: "px-2.5", compact: "px-1.5" };
const GRIP_SIZE: Record<TableDensity, string> = { default: "h-3.5 w-3.5", compact: "h-3 w-3" };
const MENU_BUTTON_SIZE: Record<TableDensity, string> = { default: "h-5 w-5", compact: "h-4 w-4" };
const MENU_ICON_SIZE: Record<TableDensity, string> = { default: "h-3.5 w-3.5", compact: "h-3 w-3" };

export function GridHeadCell({
  columnKey,
  label,
  align = "left",
  sortDir = null,
  sortPosition = null,
  grouped = false,
  pinned = false,
  width,
  onSort,
  onColumnDropped,
  menu,
}: GridHeadCellProps): ReactElement {
  const density = useTableDensity();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState(false);
  // A grouped column's header is no longer in the grid's own order, so there is nothing to reorder it
  // against — and dragging it back out is the group chip's ✕, not a second gesture that means the same.
  const canDrag = grouped === false;

  function onDragStart(e: DragEvent<HTMLTableCellElement>): void {
    e.dataTransfer.setData(GRID_COLUMN_MIME, columnKey);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: DragEvent<HTMLTableCellElement>): void {
    // 🔴 WITHOUT `preventDefault` ON DRAGOVER, `drop` NEVER FIRES. It is not decoration: the browser's
    //    default for a dragover is "this is not a drop target", so the handler below would be dead.
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(true);
  }

  function onDrop(e: DragEvent<HTMLTableCellElement>): void {
    e.preventDefault();
    setDropTarget(false);
    const dragged = gridDraggedColumn(e.dataTransfer);
    if (dragged !== null && dragged !== columnKey) onColumnDropped?.(dragged);
  }

  const trigger = (
    <button
      type="button"
      aria-label={`${label} column menu`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex",
        MENU_BUTTON_SIZE[density],
        "shrink-0 items-center justify-center rounded-sm text-fg-subtle",
        "hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
        "data-[state=open]:bg-surface data-[state=open]:text-fg",
        align === "right" ? "ml-1.5" : "ml-auto",
      )}
    >
      <MoreHorizontal className={MENU_ICON_SIZE[density]} />
    </button>
  );

  return (
    <TableHead
      align={align}
      width={width}
      scope="col"
      aria-sort={sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none"}
      draggable={canDrag}
      onDragStart={canDrag ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDragLeave={() => setDropTarget(false)}
      onDrop={onDrop}
      // 🔴 RIGHT-CLICK OPENS THE SAME MENU THE ⋯ DOES (OD-RP-6). One menu, two ways in — never two
      //    menus that drift.
      onContextMenu={
        menu === undefined
          ? undefined
          : (e) => {
              e.preventDefault();
              setMenuOpen(true);
            }
      }
      className={cn(
        HEAD_PAD[density],
        sortDir !== null && "bg-surface-sunken text-fg",
        grouped && "bg-surface-sunken text-fg-subtle",
        dropTarget && "shadow-[inset_2px_0_0_0_var(--color-info)]",
        pinned && "sticky left-0 z-[1] bg-surface-muted",
      )}
      data-grid-column={columnKey}
      data-grid-pinned={pinned ? "true" : undefined}
    >
      <span
        className={cn(
          "flex items-center gap-1.5",
          align === "right" ? "flex-row-reverse" : undefined,
        )}
      >
        {canDrag && (
          <GripVertical
            className={cn(GRIP_SIZE[density], "shrink-0 cursor-grab text-border-strong")}
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          // The whole label is the sort control. `e.shiftKey` is the only difference between "sort by
          // this" and "and then by this" (OD-RP-9).
          onClick={(e) => onSort?.(e.shiftKey)}
          disabled={onSort === undefined}
          className={cn(
            "inline-flex min-w-0 items-center gap-1 truncate uppercase tracking-wide",
            "hover:text-fg focus-visible:outline-none focus-visible:text-fg",
            "disabled:cursor-default disabled:hover:text-inherit",
          )}
        >
          <span className="truncate">{label}</span>
          {sortDir !== null && <SortMark dir={sortDir} position={sortPosition} />}
        </button>
        {grouped && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-surface px-1 text-[10px] font-medium normal-case tracking-normal text-fg-muted"
            title={`Grouped by ${label}`}
          >
            <Rows3 className="h-2.5 w-2.5" aria-hidden="true" />
            grouped
          </span>
        )}
        {menu !== undefined && (
          <GridHeaderMenu
            columnLabel={label}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            trigger={trigger}
            canGroup={menu.canGroup}
            canHide={menu.canHide}
            pinned={pinned}
            columns={menu.columns}
            onSort={menu.onSortDir}
            onGroupBy={menu.onGroupBy}
            onTogglePin={menu.onTogglePin}
            onHide={menu.onHide}
            onToggleColumn={menu.onToggleColumn}
            onResetColumns={menu.onResetColumns}
          />
        )}
      </span>
    </TableHead>
  );
}
