"use client";

// DataTableToolbar + useTableControls — the shared filter/sort glue for the busy admin tables
// (EPIC-009-M005, REF-018). The toolbar picked by the owner sits ABOVE the table: a search box, then a
// row of column-filter controls (a select per categorical column + an inline date-range), and a "Clear"
// affordance once anything is active. One toolbar, every busy table (QUALITY-CENTRAL) — the pure
// search/filter/sort logic lives in `src/lib/table-controls.ts`; this is the React + presentation skin.
//
// Pure UI (TECH-COMP-003): the rows arrive already DC-scoped; no network, no warehouse_id, no business
// rules. The Select-filter "All" choice uses a sentinel value because Radix Select cannot hold "".

import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Search, X } from "lucide-react";

import { cn } from "../lib";
import {
  applyTableControls,
  deriveSelectOptions,
  emptyFilterValues,
  hasActiveControls,
  type FilterDef,
  type FilterValue,
  type FilterValues,
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
      if (def.kind === "select") out.set(def.key, deriveSelectOptions(rows, def));
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

      {controls.filters.map((def) =>
        def.kind === "select" ? (
          <SelectFilterControl
            key={def.key}
            def={def}
            options={controls.optionsFor(def.key)}
            value={selectValueOf(controls.filterValues[def.key])}
            onChange={(value) => controls.setFilter(def.key, { kind: "select", value })}
          />
        ) : (
          <DateRangeFilterControl
            key={def.key}
            label={def.label}
            from={dateRangeFrom(controls.filterValues[def.key])}
            to={dateRangeTo(controls.filterValues[def.key])}
            onChange={(from, to) => controls.setFilter(def.key, { kind: "dateRange", from, to })}
          />
        ),
      )}

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
          <SelectItem value={ALL_SENTINEL}>All {def.label.toLowerCase()}</SelectItem>
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
