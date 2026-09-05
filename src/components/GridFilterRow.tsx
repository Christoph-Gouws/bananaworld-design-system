"use client";

// GridFilterRow — the filter row that sits DIRECTLY UNDER the column headers (CR-DESIGN-SYSTEM-008).
//
// Anchors: the consuming estate's OD-RP-6 — *"FILTER = A FILTER ROW DIRECTLY UNDER THE HEADERS, one
//          cell per column — filtering where the eye already is. ❌ NEVER chips in a toolbar behind a
//          '+ Filter' button"*, confirmed again by the owner on 2026-09-04 against the alternative of
//          burying each filter inside its own column menu.
//
// ============================================================================
// 🔴 IT EMITS THE WHOLE FILTER STATE, NEVER A PATCH
// ============================================================================
// `onChange` receives the complete `GridFilterValues` every time. A control that emitted "here is what
// changed" would make every consumer write the merge, and a consumer that merged it differently from
// the one beside it is how a toolbar's idea of the query and the server's come apart — the exact
// divergence the consuming estate has already paid for once (CR-DC-049).
//
// ⚠ AND A CLEARED FILTER IS A DROPPED KEY, not a key holding an empty string. See `gridFilterSet`.
//
// PURE UI (TECH-COMP-003 / ADR-001): no knowledge of what a column means, or of the query its value
// will end up in.

import { useEffect, useRef, useState, type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, X } from "lucide-react";

import { cn } from "../lib";
import {
  gridFilterSet,
  type GridFilterKind,
  type GridFilterValue,
  type GridFilterValues,
} from "../lib/grid-view";

export interface GridFilterOption {
  readonly id: string;
  readonly label: string;
}

/** One filter cell, declared by the consumer beside the column it sits under. */
export interface GridFilterCellDef {
  readonly key: string;
  readonly kind: GridFilterKind;
  /** The column's own label — the accessible name of this cell's control. */
  readonly label: string;
  readonly align?: "left" | "right";
  /** The resting text: "Contains…", "All rooms", "≥ min", "Any date". */
  readonly placeholder: string;
  /** `select` only. A cell whose column offers no options renders disabled rather than empty. */
  readonly options?: readonly GridFilterOption[];
}

export interface GridFilterRowProps {
  readonly columns: readonly GridFilterCellDef[];
  readonly values: GridFilterValues;
  readonly onChange: (next: GridFilterValues) => void;
  /**
   * How long a typed value settles before it is emitted. Typing fires one request per keystroke
   * without it; the default matches the estate's list toolbars.
   */
  readonly debounceMs?: number;
  /** Leading cells with no filter of their own (a pinned gutter, a chevron column). */
  readonly leadingCells?: number;
}

const CELL_BASE = cn(
  "flex h-7 w-full items-center gap-1.5 rounded-sm border border-border bg-surface-muted px-2",
  "text-xs font-normal normal-case tracking-normal text-fg-subtle",
);
const CELL_SET = "border-info bg-info-subtle font-semibold text-info-fg";

/** A typed cell: local while the reader types, emitted once they stop. */
function TypedCell({
  def,
  value,
  debounceMs,
  onCommit,
}: {
  readonly def: GridFilterCellDef;
  readonly value: string;
  readonly debounceMs: number;
  readonly onCommit: (next: string) => void;
}): ReactElement {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

  // The parent's value wins whenever it changes underneath — a reset, a saved view, a cleared filter.
  // Comparing against what THIS cell last emitted is what stops the echo of its own commit from
  // clobbering a keystroke typed in the meantime.
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = draft;
      onCommit(draft);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, debounceMs, onCommit]);

  const set = draft.trim().length > 0;
  return (
    <div className={cn(CELL_BASE, set && CELL_SET)}>
      <input
        type={def.kind === "numberMin" ? "number" : "text"}
        inputMode={def.kind === "numberMin" ? "numeric" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={def.placeholder}
        aria-label={`Filter by ${def.label}`}
        className={cn(
          "w-full min-w-0 bg-transparent outline-none placeholder:text-fg-subtle",
          def.align === "right" && "text-right",
        )}
      />
      {set && (
        <button
          type="button"
          aria-label={`Clear the ${def.label} filter`}
          onClick={() => {
            committed.current = "";
            setDraft("");
            onCommit("");
          }}
          className="shrink-0 text-info-fg hover:opacity-70 focus-visible:outline-none"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function SelectCell({
  def,
  value,
  onCommit,
}: {
  readonly def: GridFilterCellDef;
  readonly value: string;
  readonly onCommit: (next: string) => void;
}): ReactElement {
  const options = def.options ?? [];
  const chosen = options.find((o) => o.id === value);
  const set = chosen !== undefined;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={options.length === 0}
          aria-label={`Filter by ${def.label}`}
          className={cn(CELL_BASE, set && CELL_SET, "disabled:opacity-60", "text-left")}
        >
          <span className="min-w-0 flex-1 truncate">{chosen?.label ?? def.placeholder}</span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={2}
          className="z-[var(--z-dropdown)] max-h-[15rem] w-[13rem] overflow-y-auto rounded-md border border-border-strong bg-surface p-1 shadow-lg animate-fade-in"
        >
          <DropdownMenu.Item
            onSelect={() => onCommit("")}
            className="flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-xs text-fg-muted outline-none data-[highlighted]:bg-surface-muted"
          >
            {def.placeholder}
          </DropdownMenu.Item>
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.id}
              onSelect={() => onCommit(option.id)}
              className={cn(
                "flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-xs outline-none",
                "text-fg data-[highlighted]:bg-surface-muted",
                option.id === value && "font-semibold",
              )}
            >
              {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function DateRangeCell({
  def,
  value,
  onCommit,
}: {
  readonly def: GridFilterCellDef;
  readonly value: { readonly from: string | null; readonly to: string | null };
  readonly onCommit: (next: { from: string | null; to: string | null }) => void;
}): ReactElement {
  const set = value.from !== null || value.to !== null;
  const summary = set ? `${value.from ?? "…"} → ${value.to ?? "…"}` : def.placeholder;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${def.label}`}
          className={cn(CELL_BASE, set && CELL_SET, "text-left")}
        >
          <span className="min-w-0 flex-1 truncate">{summary}</span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={2}
          // Plain inputs, not menu items: a Radix item closes on the first keystroke and steals the
          // arrow keys a date box needs.
          onKeyDown={(e) => e.stopPropagation()}
          className="z-[var(--z-dropdown)] w-[13rem] space-y-2 rounded-md border border-border-strong bg-surface p-2.5 shadow-lg animate-fade-in"
        >
          <label className="block text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
            From
            <input
              type="date"
              value={value.from ?? ""}
              aria-label={`${def.label} from`}
              onChange={(e) =>
                onCommit({ from: e.target.value.length > 0 ? e.target.value : null, to: value.to })
              }
              className="mt-0.5 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs font-normal normal-case tracking-normal text-fg outline-none focus-visible:shadow-focus"
            />
          </label>
          <label className="block text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
            To
            <input
              type="date"
              value={value.to ?? ""}
              aria-label={`${def.label} to`}
              onChange={(e) =>
                onCommit({ from: value.from, to: e.target.value.length > 0 ? e.target.value : null })
              }
              className="mt-0.5 h-8 w-full rounded-sm border border-border bg-surface px-2 text-xs font-normal normal-case tracking-normal text-fg outline-none focus-visible:shadow-focus"
            />
          </label>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function textOf(value: GridFilterValue | undefined): string {
  if (value === undefined || value.kind === "dateRange") return "";
  return value.value;
}

function rangeOf(value: GridFilterValue | undefined): {
  readonly from: string | null;
  readonly to: string | null;
} {
  if (value === undefined || value.kind !== "dateRange") return { from: null, to: null };
  return { from: value.from, to: value.to };
}

export function GridFilterRow({
  columns,
  values,
  onChange,
  debounceMs = 300,
  leadingCells = 0,
}: GridFilterRowProps): ReactElement {
  function commit(def: GridFilterCellDef, value: GridFilterValue | null): void {
    onChange(gridFilterSet(values, def.key, value));
  }

  return (
    <tr data-grid-filter-row="true">
      {Array.from({ length: leadingCells }, (_, i) => (
        <th key={`lead-${String(i)}`} className="border-b border-border bg-surface px-2 py-1.5" />
      ))}
      {columns.map((def) => (
        <th
          key={def.key}
          className="border-b border-border bg-surface px-2 py-1.5 align-middle font-normal"
        >
          {def.kind === "select" ? (
            <SelectCell
              def={def}
              value={textOf(values[def.key])}
              onCommit={(next) =>
                commit(def, next.length === 0 ? null : { kind: "select", value: next })
              }
            />
          ) : def.kind === "dateRange" ? (
            <DateRangeCell
              def={def}
              value={rangeOf(values[def.key])}
              onCommit={(next) => commit(def, { kind: "dateRange", from: next.from, to: next.to })}
            />
          ) : (
            <TypedCell
              def={def}
              value={textOf(values[def.key])}
              debounceMs={debounceMs}
              onCommit={(next) =>
                commit(def, def.kind === "numberMin"
                  ? { kind: "numberMin", value: next }
                  : { kind: "text", value: next })
              }
            />
          )}
        </th>
      ))}
    </tr>
  );
}
