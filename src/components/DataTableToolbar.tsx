"use client";

// DataTableToolbar + useTableControls — the shared filter/sort glue for the busy admin tables
// (EPIC-009-M005, REF-018). The toolbar picked by the owner sits ABOVE the table: a search box, then a
// row of column-filter controls (a select per categorical column + an inline date-range), and a "Clear"
// affordance once anything is active. One toolbar, every busy table (QUALITY-CENTRAL) — the pure
// search/filter/sort logic lives in `src/lib/table-controls.ts`; this is the React + presentation skin.
//
// Pure UI (TECH-COMP-003): the rows arrive already DC-scoped; no network, no warehouse_id, no business
// rules. The Select-filter "All" choice uses a sentinel value because Radix Select cannot hold "".
//
// A filter may also be a `multiSelect` and hold SEVERAL values (CR-DESIGN-SYSTEM-003). It is a third
// kind ADDED beside the two — a screen that declares a `select` declares exactly what it declared before
// and renders exactly what it rendered before. Radix Select is single-choice by construction, so the
// multi-select is a Radix DropdownMenu of CheckboxItems: the same primitive, portal and z-layer the
// row-actions menu already uses, so no new dependency and no second dropdown idiom.

import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "../lib";
import {
  applyTableControls,
  deriveSelectOptions,
  emptyFilterValues,
  hasActiveControls,
  type FilterDef,
  type FilterValue,
  type FilterValues,
  type MultiSelectFilterDef,
  type SelectFilterDef,
  type SelectOption,
  type SortAccessor,
  type SortDir,
  type SortState,
} from "../lib/table-controls";

import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

const ALL_SENTINEL = "__all__";

export interface UseTableControlsConfig<Row> {
  readonly getSearchText?: (row: Row) => string;
  readonly filters?: readonly FilterDef<Row>[];
  readonly sortAccessors?: Readonly<Record<string, SortAccessor<Row>>>;
  readonly initialSort?: SortState | null;
}

export interface TableControls<Row> {
  readonly query: string;
  readonly setQuery: (q: string) => void;
  readonly filterValues: FilterValues;
  readonly setFilter: (key: string, value: FilterValue) => void;
  readonly sort: SortState | null;
  readonly toggleSort: (key: string) => void;
  /** The current sort direction for a column, or null when it is not the active sort. */
  readonly sortDirFor: (key: string) => SortDir | null;
  readonly visible: readonly Row[];
  readonly filters: readonly FilterDef<Row>[];
  /** Derived (or fixed) options per select filter, for the toolbar controls. */
  readonly optionsFor: (key: string) => readonly SelectOption[];
  readonly active: boolean;
  readonly clear: () => void;
  readonly hasSearch: boolean;
}

// Owns the search / filter / sort state for one table and returns the visible rows + the bindings the
// toolbar and sortable headers consume.
export function useTableControls<Row>(
  rows: readonly Row[],
  config: UseTableControlsConfig<Row>,
): TableControls<Row> {
  const filters = useMemo(() => config.filters ?? [], [config.filters]);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>(() => emptyFilterValues(filters));
  const [sort, setSort] = useState<SortState | null>(config.initialSort ?? null);

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setFilterValues(emptyFilterValues(filters));
  }, [filters]);

  const toggleSort = useCallback((key: string) => {
    setSort((prev) =>
      prev !== null && prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }, []);

  const visible = useMemo(
    () =>
      applyTableControls(rows, {
        query,
        getSearchText: config.getSearchText,
        filters,
        filterValues,
        sort,
        sortAccessors: config.sortAccessors,
      }),
    [rows, query, config.getSearchText, filters, filterValues, sort, config.sortAccessors],
  );

  const optionsByKey = useMemo(() => {
    const out = new Map<string, readonly SelectOption[]>();
    for (const def of filters) {
      // Both categorical kinds derive their options the same way — that is what lets a screen convert
      // a filter from one value to several by changing one word.
      if (def.kind === "select" || def.kind === "multiSelect") {
        out.set(def.key, deriveSelectOptions(rows, def));
      }
    }
    return out;
  }, [rows, filters]);

  return {
    query,
    setQuery,
    filterValues,
    setFilter,
    sort,
    toggleSort,
    sortDirFor: (key) => (sort !== null && sort.key === key ? sort.dir : null),
    visible,
    filters,
    optionsFor: (key) => optionsByKey.get(key) ?? [],
    active: hasActiveControls(query, filterValues),
    clear,
    hasSearch: config.getSearchText !== undefined,
  };
}

export interface DataTableToolbarProps<Row> {
  readonly controls: TableControls<Row>;
  readonly searchPlaceholder?: string;
  readonly searchAriaLabel?: string;
  /** Extra controls rendered inline after the filters (e.g. a "Show cancelled" checkbox). */
  readonly children?: ReactNode;
}

// The owner-chosen toolbar: search + a select per categorical filter + an inline date-range + Clear.
export function DataTableToolbar<Row>({
  controls,
  searchPlaceholder = "Search…",
  searchAriaLabel = "Search",
  children,
}: DataTableToolbarProps<Row>): ReactElement {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {controls.hasSearch && (
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            type="search"
            value={controls.query}
            onChange={(e) => controls.setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            className="pl-9"
          />
        </div>
      )}

      {controls.filters.map((def) => {
        if (def.kind === "select") {
          return (
            <SelectFilterControl
              key={def.key}
              def={def}
              options={controls.optionsFor(def.key)}
              value={selectValueOf(controls.filterValues[def.key])}
              onChange={(value) => controls.setFilter(def.key, { kind: "select", value })}
            />
          );
        }
        if (def.kind === "multiSelect") {
          return (
            <MultiSelectFilterControl
              key={def.key}
              def={def}
              options={controls.optionsFor(def.key)}
              values={multiSelectValuesOf(controls.filterValues[def.key])}
              onChange={(values) => controls.setFilter(def.key, { kind: "multiSelect", values })}
            />
          );
        }
        return (
          <DateRangeFilterControl
            key={def.key}
            label={def.label}
            from={dateRangeFrom(controls.filterValues[def.key])}
            to={dateRangeTo(controls.filterValues[def.key])}
            onChange={(from, to) => controls.setFilter(def.key, { kind: "dateRange", from, to })}
          />
        );
      })}

      {children}

      {controls.active && (
        <button
          type="button"
          onClick={controls.clear}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-fg-muted hover:text-fg"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      )}
    </div>
  );
}

function selectValueOf(value: FilterValue | undefined): string | null {
  return value !== undefined && value.kind === "select" ? value.value : null;
}
function multiSelectValuesOf(value: FilterValue | undefined): readonly string[] {
  return value !== undefined && value.kind === "multiSelect" ? value.values : [];
}
function dateRangeFrom(value: FilterValue | undefined): string | null {
  return value !== undefined && value.kind === "dateRange" ? value.from : null;
}
function dateRangeTo(value: FilterValue | undefined): string | null {
  return value !== undefined && value.kind === "dateRange" ? value.to : null;
}

function SelectFilterControl<Row>({
  def,
  options,
  value,
  onChange,
}: {
  readonly def: SelectFilterDef<Row>;
  readonly options: readonly SelectOption[];
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
}): ReactElement {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
        {def.label}
      </span>
      <Select
        value={value ?? ALL_SENTINEL}
        onValueChange={(next) => onChange(next === ALL_SENTINEL ? null : next)}
      >
        <SelectTrigger className="h-9 min-w-[10rem]" aria-label={`Filter by ${def.label}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SENTINEL}>{allOptionLabel(def.label)}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

// The unset wording, in ONE place for both kinds. A filter holding nothing must read identically
// whichever kind it is, or the toolbar has two vocabularies for the same state (D-6).
function allOptionLabel(label: string): string {
  return `All ${label.toLowerCase()}`;
}

// The closed trigger, layout A (owner-approved 2026-08-14): the first chosen value by name, then how
// many more. "Cape Town +2" — it names something real, stays on one line, and truncates predictably in
// a narrow toolbar. Nothing chosen reads exactly what a single-select reads: "All depots".
function multiSelectTriggerLabel(
  label: string,
  options: readonly SelectOption[],
  values: readonly string[],
): { readonly text: string; readonly more: number } {
  if (values.length === 0) return { text: allOptionLabel(label), more: 0 };
  // "First" is first in the DISPLAYED option order, not in tick order, so the trigger reads the same
  // whichever way round the rep ticked them.
  const chosen = options.filter((opt) => values.includes(opt.value));
  const first = chosen[0]?.label ?? values[0] ?? "";
  return { text: first, more: values.length - 1 };
}

function MultiSelectFilterControl<Row>({
  def,
  options,
  values,
  onChange,
}: {
  readonly def: MultiSelectFilterDef<Row>;
  readonly options: readonly SelectOption[];
  readonly values: readonly string[];
  readonly onChange: (values: readonly string[]) => void;
}): ReactElement {
  const { text, more } = multiSelectTriggerLabel(def.label, options, values);
  const chosenNone = values.length === 0;

  // Keep the stored order in the DISPLAYED option order so a value list reads the same as the menu and
  // "first chosen" is stable. An unknown value (one the data no longer offers) is dropped by the same
  // pass, which is what a rep sees anyway.
  const toggle = (value: string, checked: boolean): void => {
    const next = checked ? [...values, value] : values.filter((v) => v !== value);
    onChange(options.filter((opt) => next.includes(opt.value)).map((opt) => opt.value));
  };

  return (
    // A <label> would bind to nothing useful here — the trigger is a menu button, not a form control —
    // so this is a <div> with the same caption span the other two controls use.
    <div className="flex flex-col gap-1">
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
        {def.label}
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`Filter by ${def.label}`}
            className={cn(
              // Sizing and chrome copied from SelectTrigger so the toolbar's rhythm is unchanged
              // whichever kind a screen declares.
              "inline-flex items-center justify-between gap-2 w-full min-w-0",
              "bg-surface text-fg border border-border rounded-md shadow-xs",
              "h-9 min-w-[10rem] px-3 text-sm",
              "[[data-surface=tablet]_&]:h-14 [[data-surface=tablet]_&]:px-4 [[data-surface=tablet]_&]:text-base [[data-surface=tablet]_&]:border-[1.5px]",
              "transition-[border-color,box-shadow] duration-fast ease-out",
              "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus",
              "data-[state=open]:border-accent",
              chosenNone && "text-fg-subtle",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {text}
              {more > 0 && <span className="ml-1 text-fg-muted tabular-nums">{`+${more}`}</span>}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className={cn(
              "z-[var(--z-dropdown)] min-w-[var(--radix-dropdown-menu-trigger-width)]",
              // Cap to the room Radix says it has, and let the list scroll inside that — the lesson
              // CR-DC-008 paid for on Select, applied here before a long depot list can repeat it.
              "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
              "rounded-md border border-border bg-surface p-1 shadow-lg animate-fade-in",
            )}
          >
            <MultiSelectItem
              checked={chosenNone}
              onToggle={() => onChange([])}
              label={allOptionLabel(def.label)}
            />
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            {options.map((opt) => (
              <MultiSelectItem
                key={opt.value}
                checked={values.includes(opt.value)}
                onToggle={(checked) => toggle(opt.value, checked)}
                label={opt.label}
              />
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Label className="flex items-center justify-between px-2 py-1 text-2xs text-fg-subtle">
              <span>{chosenNone ? "None chosen" : `${values.length} chosen`}</span>
              <span className="rounded border border-border px-1 font-mono">Esc</span>
            </DropdownMenu.Label>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function MultiSelectItem({
  checked,
  onToggle,
  label,
}: {
  readonly checked: boolean;
  readonly onToggle: (checked: boolean) => void;
  readonly label: string;
}): ReactElement {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onToggle}
      // 🔴 THE ONE RADIX GOTCHA. A DropdownMenu closes on select by default; preventing it is what keeps
      // the menu open across several ticks. Without this line the rep re-opens the menu for every value,
      // which defeats the entire change.
      onSelect={(e) => e.preventDefault()}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none",
        "[[data-surface=tablet]_&]:py-3 [[data-surface=tablet]_&]:pl-9 [[data-surface=tablet]_&]:text-base",
        "data-[highlighted]:bg-surface-muted",
        "data-[state=checked]:font-medium",
      )}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2">
        <Check className="h-4 w-4 text-accent" />
      </DropdownMenu.ItemIndicator>
      {label}
    </DropdownMenu.CheckboxItem>
  );
}

function DateRangeFilterControl({
  label,
  from,
  to,
  onChange,
}: {
  readonly label: string;
  readonly from: string | null;
  readonly to: string | null;
  readonly onChange: (from: string | null, to: string | null) => void;
}): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-subtle">{label}</span>
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={from ?? ""}
          max={to ?? undefined}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value, to)}
          aria-label={`${label} from`}
          className={cn("h-9 w-[9.5rem]")}
        />
        <span className="text-sm text-fg-subtle">–</span>
        <Input
          type="date"
          value={to ?? ""}
          min={from ?? undefined}
          onChange={(e) => onChange(from, e.target.value === "" ? null : e.target.value)}
          aria-label={`${label} to`}
          className={cn("h-9 w-[9.5rem]")}
        />
      </div>
    </div>
  );
}
