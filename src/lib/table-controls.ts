// Shared table-controls engine — search + column filters + date-range + sort (EPIC-009-M005, REF-018).
//
// The ONE place the busy admin tables (PO / Receiving / Stock Adjustment / Conversions / Sales Orders /
// Returns) compute their visible rows from the operator's search + filter + sort choices (QUALITY-CENTRAL
// — one filtering layer, not a bespoke filter per table). Pure functions only: no React, no network, no
// warehouse_id (the rows arrive already DC-scoped from the repository). The React glue + the toolbar UI
// live in `src/components/ui/DataTableToolbar.tsx`; this file is unit-tested in isolation.

export type SortDir = "asc" | "desc";

// A fixed select option (value stored, label shown). When a select filter omits its options, they are
// derived from the data via `deriveSelectOptions` (value === label).
export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

// A column filter binds a stable `key` to how it reads the row. `accessor` returns the row's value for the
// filter — the option value for a select, or an ISO date (yyyy-mm-dd, or a longer ISO timestamp) for a
// date range. `null` means the row has no value for this filter and is excluded once the filter is set.
export interface SelectFilterDef<Row> {
  readonly kind: "select";
  readonly key: string;
  readonly label: string;
  readonly accessor: (row: Row) => string | null;
  // Fixed options (e.g. Type → Waste/Correction). Omit to derive the present values from the data.
  readonly options?: readonly SelectOption[];
}

export interface DateRangeFilterDef<Row> {
  readonly kind: "dateRange";
  readonly key: string;
  readonly label: string;
  readonly accessor: (row: Row) => string | null;
}

export type FilterDef<Row> = SelectFilterDef<Row> | DateRangeFilterDef<Row>;

// The live value of one filter. A select holds its chosen value (null = "All"); a date range holds its
// inclusive bounds (each null = open-ended).
export interface SelectFilterValue {
  readonly kind: "select";
  readonly value: string | null;
}
export interface DateRangeFilterValue {
  readonly kind: "dateRange";
  readonly from: string | null; // ISO yyyy-mm-dd
  readonly to: string | null; // ISO yyyy-mm-dd
}
export type FilterValue = SelectFilterValue | DateRangeFilterValue;

export type FilterValues = Readonly<Record<string, FilterValue>>;

export interface SortState {
  readonly key: string;
  readonly dir: SortDir;
}

// A row's sortable value for a key. Numbers sort numerically; strings sort case-insensitively; null sorts
// last regardless of direction (an empty cell never jumps to the top).
export type SortAccessor<Row> = (row: Row) => string | number | null;

export interface TableControlsConfig<Row> {
  readonly query?: string;
  readonly getSearchText?: (row: Row) => string;
  readonly filters?: readonly FilterDef<Row>[];
  readonly filterValues?: FilterValues;
  readonly sort?: SortState | null;
  readonly sortAccessors?: Readonly<Record<string, SortAccessor<Row>>>;
}

// The initial (cleared) value for a filter definition.
export function emptyFilterValue<Row>(def: FilterDef<Row>): FilterValue {
  return def.kind === "select"
    ? { kind: "select", value: null }
    : { kind: "dateRange", from: null, to: null };
}

// The cleared value-map for a set of filter definitions — the starting/reset state.
export function emptyFilterValues<Row>(filters: readonly FilterDef<Row>[]): FilterValues {
  const out: Record<string, FilterValue> = {};
  for (const def of filters) out[def.key] = emptyFilterValue(def);
  return out;
}

// True when the operator has narrowed the table at all (any search text or any active filter). Drives the
// "Clear" affordance.
export function hasActiveControls(query: string, filterValues: FilterValues): boolean {
  if (query.trim() !== "") return true;
  return Object.values(filterValues).some((v) =>
    v.kind === "select" ? v.value !== null : v.from !== null || v.to !== null,
  );
}

// The distinct present values for a select filter, sorted for display. Fixed `options` win; otherwise the
// data's own values become the options (value === label).
export function deriveSelectOptions<Row>(
  rows: readonly Row[],
  def: SelectFilterDef<Row>,
): readonly SelectOption[] {
  if (def.options !== undefined) return def.options;
  const seen = new Set<string>();
  for (const row of rows) {
    const value = def.accessor(row);
    if (value !== null && value !== "") seen.add(value);
  }
  return Array.from(seen)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

// Every whitespace-separated part of the query must appear in the row's searchable text (case-insensitive)
// — "sun 102" matches "Sunny Farm · PO-102". Mirrors the Combobox match rule for a consistent feel.
function matchesSearch(haystack: string, query: string): boolean {
  const parts = query
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p !== "");
  if (parts.length === 0) return true;
  const lower = haystack.toLowerCase();
  return parts.every((part) => lower.includes(part));
}

// The yyyy-mm-dd prefix of an ISO date or timestamp — date-range bounds compare on the day, not the time.
function dayOf(iso: string | null): string | null {
  if (iso === null || iso === "") return null;
  return iso.slice(0, 10);
}

function matchesDateRange(day: string | null, from: string | null, to: string | null): boolean {
  if (from === null && to === null) return true;
  if (day === null) return false;
  if (from !== null && day < from) return false;
  if (to !== null && day > to) return false;
  return true;
}

function matchesFilter<Row>(row: Row, def: FilterDef<Row>, value: FilterValue): boolean {
  if (def.kind === "select" && value.kind === "select") {
    return value.value === null || def.accessor(row) === value.value;
  }
  if (def.kind === "dateRange" && value.kind === "dateRange") {
    return matchesDateRange(dayOf(def.accessor(row)), value.from, value.to);
  }
  return true;
}

function compareValues(a: string | number | null, b: string | number | null, dir: SortDir): number {
  // Nulls always sink to the bottom, regardless of direction.
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  let cmp: number;
  if (typeof a === "number" && typeof b === "number") cmp = a - b;
  else cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
  return dir === "asc" ? cmp : -cmp;
}

// Apply the operator's search + filters + sort to the (already DC-scoped) rows and return the visible set.
// Filtering preserves input order; an active sort then reorders. Pure — no mutation of the input array.
export function applyTableControls<Row>(
  rows: readonly Row[],
  config: TableControlsConfig<Row>,
): Row[] {
  const query = config.query ?? "";
  const getSearchText = config.getSearchText;
  const filters = config.filters ?? [];
  const filterValues = config.filterValues ?? {};

  let out = rows.filter((row) => {
    if (getSearchText !== undefined && !matchesSearch(getSearchText(row), query)) return false;
    for (const def of filters) {
      const value = filterValues[def.key];
      if (value !== undefined && !matchesFilter(row, def, value)) return false;
    }
    return true;
  });

  const sort = config.sort ?? null;
  const accessor = sort !== null ? config.sortAccessors?.[sort.key] : undefined;
  if (sort !== null && accessor !== undefined) {
    out = [...out].sort((a, b) => compareValues(accessor(a), accessor(b), sort.dir));
  }
  return out;
}
