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
//
// ============================================================================
// A `select` CELL MAY HOLD SEVERAL VALUES (CR-DESIGN-SYSTEM-009)
// ============================================================================
// A cell declared `multiple` becomes a tick-list: a Radix DropdownMenu of CheckboxItems that STAYS
// OPEN while the reader ticks, with a tri-state "Select all" master row carrying "3 of 12". It is
// OPT-IN and the one-value cell below is untouched — see `GridFilterCellDef.multiple` for why that
// is a correctness property and not a migration convenience. The value shape it emits, and the wire
// encoding a consumer writes it to, are stated in `lib/grid-view.ts`.
//
// The row also reads its enclosing `<Table>`'s density, so a compact table's filter boxes tighten
// with its rows rather than sitting tall above short ones.
//
// QUALITY-JUSTIFY RC-05 — This file is one row and the five cells it can put in that row, and the
// five cells are not independently useful: none is exported, none is reachable except through the
// row, and every one of them shares `CELL_BASE`, `CELL_SET` and the same density read. Moving them to
// a sibling module would export three shared constants across a file boundary purely to satisfy a
// line count, split one control's behaviour across two files a reader must hold open together, and
// still leave the cells file over the 300-line threshold. The one extraction that WAS worth making
// was made: the tick-list's shared parts moved to `MultiSelectMenu.tsx`, because those genuinely are
// used by a second surface (`DataTableToolbar`) and drift between the two was the stated defect.

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, X } from "lucide-react";

import { cn } from "../lib";
import {
  gridFilterSelect,
  gridFilterSelected,
  gridFilterSet,
  type GridFilterKind,
  type GridFilterValue,
  type GridFilterValues,
} from "../lib/grid-view";
import {
  MultiSelectAllRow,
  MultiSelectItem,
  multiSelectChosenLabels,
  multiSelectToggle,
  multiSelectTriggerLabel,
  type MultiSelectOption,
} from "./MultiSelectMenu";
import { useColumnWidthClass, useTableDensity, type TableColumnWidth, type TableDensity } from "./Table";

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
  /**
   * `select` only. Let this cell hold SEVERAL options at once — a tick-list with a "Select all"
   * master row, staying open while the reader ticks (CR-DESIGN-SYSTEM-009 §A).
   *
   * 🔴 DEFAULT FALSE, AND OPT-IN RATHER THAN "SELECT CELLS ARE MULTI FROM NOW ON". If the cell went
   *    multi by default, a consumer would pick up a menu that can emit two ids while its own query
   *    writer still writes one — three ticks on screen, one room in the query, and a total nobody can
   *    tell is wrong. Opting in makes that state unreachable: a consumer turns this on in the same
   *    change that teaches its parser to read the repeated parameter (see `grid-view.ts`'s header).
   */
  readonly multiple?: boolean;
  /**
   * How much room this column may take before its values are cut. Applied to this cell's own `<th>`,
   * and only while the enclosing `<Table>` is truncating — the box INSIDE already truncates, so the
   * `<th>` only ever needed the ceiling.
   *
   * ⚠ PASS THE SAME STEP TO ALL THREE OF A COLUMN'S ROWS (this, its `GridHeadCell`, its `TableCell`).
   *   Wiring two of the three defeats the cap silently: the widest one wins, and it looks like a
   *   rendering bug in this package when it is a wiring gap in the consumer.
   */
  readonly width?: TableColumnWidth;
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

// ONE COMPLETE STRING PER DENSITY, never a base plus an override (`Table.tsx`'s own rule: twMerge
// keeps the LAST of two conflicting classes, so a second one is a silent, invisible override). The
// "default" entry is byte for byte what shipped, so a table that asks for no density renders it.
//
// ⚠ THE TYPE STEP DOES NOT MOVE. Compact tightens the box — 28px to 24px — and keeps `text-xs`.
//   Dropping to `text-2xs` would be a one-pixel reduction the owner never judged, and `text-2xs` is
//   not defined in this package's own `tokens.css` (it resolves in the consuming app's Tailwind
//   config), so reaching for a third type step here would deepen a dependency rather than pay for one.
const CELL_CHROME: Record<TableDensity, string> = {
  default: "flex h-7 w-full items-center gap-1.5 rounded-sm border border-border bg-surface-muted px-2",
  compact: "flex h-6 w-full items-center gap-1 rounded-sm border border-border bg-surface-muted px-1.5",
};
const CELL_TYPE = "text-xs font-normal normal-case tracking-normal text-fg-subtle";
const CELL_SET = "border-info bg-info-subtle font-semibold text-info-fg";

// Composed once at module load, exactly as the single `CELL_BASE` constant was before there were two
// densities to compose — a per-render `cn()` would rebuild the same two strings on every keystroke.
const CELL_BASE: Record<TableDensity, string> = {
  default: cn(CELL_CHROME.default, CELL_TYPE),
  compact: cn(CELL_CHROME.compact, CELL_TYPE),
};

// The filter row's own `<th>` padding, on the same one-class-per-axis rule.
const TH_PAD: Record<TableDensity, string> = { default: "px-2 py-1.5", compact: "px-1 py-1" };

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
  const density = useTableDensity();
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
    <div className={cn(CELL_BASE[density], set && CELL_SET)}>
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
  const density = useTableDensity();
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
          className={cn(CELL_BASE[density], set && CELL_SET, "disabled:opacity-60", "text-left")}
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

/**
 * The same cell holding SEVERAL options (CR-DESIGN-SYSTEM-009 §A, owner's option C).
 *
 * 🔴 A SEPARATE COMPONENT, SO THE ONE-VALUE PATH ABOVE IS LITERALLY UNTOUCHED. A cell that declares
 *    no `multiple` runs `SelectCell`'s original code, unedited — which is what makes byte-identity
 *    provable rather than argued. The two share the parts that must not drift (`MultiSelectItem`, the
 *    trigger arithmetic, the master row) through `MultiSelectMenu`, which is the whole point of the
 *    extraction; they do not share a branch inside one function.
 *
 * ⚠ AND THE VALUE ARITHMETIC IS SHARED TOO (CR-DESIGN-SYSTEM-010 F1). Every count and every commit
 *   below goes through `MultiSelectMenu`'s functions rather than a local `options.filter(...)`, which
 *   is what had this cell reading "1 chosen" on a filter narrowing by two rooms — and then deleting
 *   the second one on the next tick — while the toolbar in the identical state read "2 chosen".
 */
function MultiSelectCell({
  def,
  selected,
  onCommit,
}: {
  readonly def: GridFilterCellDef;
  readonly selected: readonly string[];
  readonly onCommit: (next: readonly string[]) => void;
}): ReactElement {
  const density = useTableDensity();
  // `{id,label}` → the `{value,label}` shape the shared arithmetic reads. Memoised on the option list
  // itself, so a re-render caused by a tick does not rebuild it.
  const options = useMemo<readonly MultiSelectOption[]>(
    () => (def.options ?? []).map((o) => ({ value: o.id, label: o.label })),
    [def.options],
  );
  // Displayed-option order for the ids the list still offers, then the stored ids it no longer does —
  // so the trigger reads the same whichever way round they were ticked, and a retired room is still
  // counted rather than silently dropped out of the "+N".
  const { text, more } = multiSelectTriggerLabel(
    def.placeholder,
    multiSelectChosenLabels(options, selected),
  );
  // 🔴 THE STORED ARITY, NEVER THE MATCHED-OPTION COUNT. A cell holding only ids the options no longer
  //    offer is still narrowing the query, and reading `chosen.length` here rendered it as completely
  //    unset — grey chrome, resting placeholder — with no signal that the column was filtered at all.
  const set = selected.length > 0;

  const toggle = (id: string, checked: boolean): void => {
    onCommit(multiSelectToggle(options, selected, id, checked));
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={options.length === 0}
          aria-label={`Filter by ${def.label}`}
          className={cn(CELL_BASE[density], set && CELL_SET, "disabled:opacity-60", "text-left")}
        >
          {/* The "+N" sits INSIDE the label span, so a screen reader reads "Cold room 1 +2" as one
              accessible name rather than as two unrelated fragments. */}
          <span className="min-w-0 flex-1 truncate">
            {text}
            {more > 0 && <span className="ml-1 tabular-nums">{`+${String(more)}`}</span>}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={2}
          className="z-[var(--z-dropdown)] max-h-[15rem] w-[13rem] overflow-y-auto rounded-md border border-border-strong bg-surface p-1 shadow-lg animate-fade-in"
        >
          {/* The top row is the owner's A: one tri-state tick that means "nothing is being hidden",
              carrying "All 12" unset and "3 of 12" once some are named. Tapping it stops the
              narrowing — and `onCommit([])` → `gridFilterSelect([])` → `null` → `gridFilterSet` DROPS
              THE KEY, which is the one empty state this row has always had. So it writes no wire
              parameter at all rather than the twelve repeats the shipped version wrote. */}
          <MultiSelectAllRow
            size="compact"
            chosen={selected.length}
            total={options.length}
            onShowEverything={() => {
              onCommit([]);
            }}
          />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {options.map((option) => (
            <MultiSelectItem
              key={option.value}
              size="compact"
              checked={selected.includes(option.value)}
              onToggle={(checked) => toggle(option.value, checked)}
              label={option.label}
            />
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {/* The footer keeps the shipped toolbar's wording verbatim. The master row above already
              carries the denominator, so repeating "of 12" here would be a second vocabulary for one
              count — one arithmetic, one wording. */}
          <DropdownMenu.Label className="flex items-center justify-between px-2 py-1 text-2xs text-fg-subtle">
            <span>{set ? `${String(selected.length)} chosen` : "None chosen"}</span>
            <span className="rounded border border-border px-1 font-mono">Esc</span>
          </DropdownMenu.Label>
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
  const density = useTableDensity();
  const set = value.from !== null || value.to !== null;
  const summary = set ? `${value.from ?? "…"} → ${value.to ?? "…"}` : def.placeholder;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${def.label}`}
          className={cn(CELL_BASE[density], set && CELL_SET, "text-left")}
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

/**
 * One filter cell's `<th>`.
 *
 * ⚠ ITS OWN COMPONENT BECAUSE THE WIDTH IS A HOOK READ, and a hook cannot be called inside the
 *   `columns.map` of the row below. It also puts the column's ceiling on the `<th>` itself, which is
 *   the point of §C.4a: the box inside already truncates, but a `<th>` free to grow re-widens the
 *   whole column from the header down and the cap is silently defeated.
 */
function FilterHeadCell({
  def,
  density,
  children,
}: {
  readonly def: GridFilterCellDef;
  readonly density: TableDensity;
  readonly children: ReactElement;
}): ReactElement {
  const widthClass = useColumnWidthClass(def.width);
  return (
    <th
      className={cn(
        "border-b border-border bg-surface",
        TH_PAD[density],
        widthClass,
        "align-middle font-normal",
      )}
    >
      {children}
    </th>
  );
}

export function GridFilterRow({
  columns,
  values,
  onChange,
  debounceMs = 300,
  leadingCells = 0,
}: GridFilterRowProps): ReactElement {
  const density = useTableDensity();

  function commit(def: GridFilterCellDef, value: GridFilterValue | null): void {
    onChange(gridFilterSet(values, def.key, value));
  }

  return (
    <tr data-grid-filter-row="true">
      {Array.from({ length: leadingCells }, (_, i) => (
        <th
          key={`lead-${String(i)}`}
          className={cn("border-b border-border bg-surface", TH_PAD[density])}
        />
      ))}
      {columns.map((def) => (
        <FilterHeadCell key={def.key} def={def} density={density}>
          {def.kind === "select" ? (
            def.multiple === true ? (
              <MultiSelectCell
                def={def}
                selected={gridFilterSelected(values[def.key])}
                onCommit={(next) => commit(def, gridFilterSelect(next))}
              />
            ) : (
              <SelectCell
                def={def}
                value={textOf(values[def.key])}
                onCommit={(next) =>
                  commit(def, next.length === 0 ? null : { kind: "select", value: next })
                }
              />
            )
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
        </FilterHeadCell>
      ))}
    </tr>
  );
}
