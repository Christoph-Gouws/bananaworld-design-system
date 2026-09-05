"use client";

// GridHeaderMenu — the menu a grid column header opens (CR-DESIGN-SYSTEM-008).
//
// Anchors: the consuming estate's OD-RP-6 ruling — *"COLUMNS = RIGHT-CLICK A HEADER (or its ⋯) →
//          sort / group by this / hide / a SEARCHABLE CHECKLIST of every column"*, and the
//          owner-approved drawing that ruling was settled against (state 3).
//
// ============================================================================
// 🔴 THE CONTROLS LIVE ON THE TABLE. THAT IS THE WHOLE POINT OF THIS COMPONENT.
// ============================================================================
// The alternative — a "Customise" panel beside the grid holding column tokens — was drawn, shown, and
// REJECTED by the owner of the consuming app, in those words, because it reproduces a report-builder
// UI rather than a report. This menu is the replacement. It is not a variant of that panel and must
// not grow back into one: nothing here belongs anywhere except hanging off a column header.
//
// PURE UI (TECH-COMP-003 / ADR-001): it fires callbacks and renders what it is handed. It holds no
// knowledge of reports, queries, permissions or scope, and it never decides what a column MEANS.

import { useMemo, useState, type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowDownAZ, ArrowUpAZ, Check, EyeOff, Pin, Rows3, Search } from "lucide-react";

import { cn } from "../lib";
import type { GridSortDir } from "../lib/grid-view";

/** One row of the searchable checklist: every column the grid COULD show, shown or not. */
export interface GridHeaderMenuColumn {
  readonly key: string;
  readonly label: string;
  readonly visible: boolean;
  /** A short right-hand note, e.g. "sums" for a measure column. Purely informational. */
  readonly tag?: string;
  /**
   * A column the reader may not hide.
   *
   * ⚠ IT IS RENDERED, DISABLED AND TICKED — never omitted. A checklist that silently lacks a column
   *   the grid is showing reads as a complete list and is not one.
   */
  readonly locked?: boolean;
}

export interface GridHeaderMenuProps {
  /** The column this menu hangs off. Used for the accessible name only. */
  readonly columnLabel: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** The ⋯ button (or any element) the menu anchors to. */
  readonly trigger: ReactElement;
  /** False when the grid cannot group on this column — the item renders disabled, not absent. */
  readonly canGroup: boolean;
  /** False for a column the reader may not hide (the last visible one, a locked one). */
  readonly canHide: boolean;
  /** Is THIS column the pinned one? See `GridHeadCell.pinned` — there is at most one. */
  readonly pinned: boolean;
  readonly columns: readonly GridHeaderMenuColumn[];
  readonly onSort: (dir: GridSortDir) => void;
  readonly onGroupBy: () => void;
  readonly onTogglePin: () => void;
  readonly onHide: () => void;
  readonly onToggleColumn: (key: string) => void;
  readonly onResetColumns: () => void;
}

const ITEM_CLASS = cn(
  "flex cursor-pointer select-none items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm outline-none",
  "text-fg-muted data-[highlighted]:bg-surface-muted data-[highlighted]:text-fg",
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
);

export function GridHeaderMenu({
  columnLabel,
  open,
  onOpenChange,
  trigger,
  canGroup,
  canHide,
  pinned,
  columns,
  onSort,
  onGroupBy,
  onTogglePin,
  onHide,
  onToggleColumn,
  onResetColumns,
}: GridHeaderMenuProps): ReactElement {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      needle.length === 0
        ? columns
        : columns.filter((c) => c.label.toLowerCase().includes(needle)),
    [columns, needle],
  );
  const showing = columns.filter((c) => c.visible).length;

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(next) => {
        // The search box is scoped to one opening: a menu reopened on another column that still held
        // yesterday's needle would show a filtered checklist and claim to be the whole list.
        if (next === false) setQuery("");
        onOpenChange(next);
      }}
    >
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          aria-label={`${columnLabel} column menu`}
          className={cn(
            "z-[var(--z-dropdown)] w-[17rem] overflow-hidden rounded-md border border-border-strong",
            "bg-surface p-1 text-fg shadow-lg animate-fade-in",
          )}
        >
          <DropdownMenu.Item className={ITEM_CLASS} onSelect={() => onSort("asc")}>
            <ArrowUpAZ className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sort A → Z
          </DropdownMenu.Item>
          <DropdownMenu.Item className={ITEM_CLASS} onSelect={() => onSort("desc")}>
            <ArrowDownAZ className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sort Z → A
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            className={ITEM_CLASS}
            disabled={canGroup === false}
            onSelect={() => onGroupBy()}
          >
            <Rows3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Group by this column
          </DropdownMenu.Item>
          <DropdownMenu.Item className={ITEM_CLASS} onSelect={() => onTogglePin()}>
            <Pin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {pinned ? "Unpin from the left" : "Pin to the left"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={ITEM_CLASS}
            disabled={canHide === false}
            onSelect={() => onHide()}
          >
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            Hide this column
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <p className="px-2.5 pb-1 pt-1 text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
            Columns on this report
          </p>
          {/* 🔴 NOT A `DropdownMenu.Item`. A Radix item swallows every keystroke into its own typeahead,
              so a search box built as one cannot be typed in. It is a plain input inside the menu, and
              the keydown stop is what keeps the menu's arrow-key navigation off it. */}
          <div
            className="mx-1.5 mb-1.5 flex items-center gap-2 rounded-sm border border-border-strong bg-surface-muted px-2"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search columns…"
              aria-label="Search columns"
              className="h-7 w-full bg-transparent text-xs text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>
          <div className="max-h-[11.5rem] overflow-y-auto pb-1">
            {matches.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-fg-subtle">No column matches that.</p>
            )}
            {matches.map((column) => (
              <DropdownMenu.CheckboxItem
                key={column.key}
                checked={column.visible}
                disabled={column.locked === true}
                // The menu STAYS OPEN while columns are ticked: choosing four of them should be four
                // clicks, not four re-openings.
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => onToggleColumn(column.key)}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-xs outline-none",
                  "text-fg data-[highlighted]:bg-surface-muted",
                  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-border-strong",
                    column.visible && "border-fg bg-fg text-surface",
                  )}
                >
                  {column.visible && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                </span>
                {column.label}
                {column.tag !== undefined && (
                  <span className="ml-auto text-[10px] text-fg-subtle">{column.tag}</span>
                )}
              </DropdownMenu.CheckboxItem>
            ))}
          </div>

          <div className="-mx-1 -mb-1 flex items-center justify-between gap-3 border-t border-border bg-surface-muted px-2.5 py-1.5 text-xs text-fg-muted">
            <span>
              {showing} of {columns.length} showing
            </span>
            <button
              type="button"
              onClick={() => onResetColumns()}
              className="font-medium text-fg hover:underline focus-visible:outline-none focus-visible:underline"
            >
              Reset to default
            </button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** What a header drag carries, so a drop target can tell a column drag from anything else. */
export const GRID_COLUMN_MIME = "application/x-bananaworld-grid-column";

/** Read a dragged column key off a drop event's transfer, or null when it carries none. */
export function gridDraggedColumn(transfer: {
  getData: (format: string) => string;
} | null): string | null {
  if (transfer === null) return null;
  const key = transfer.getData(GRID_COLUMN_MIME);
  return typeof key === "string" && key.length > 0 ? key : null;
}
