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

// A multi-select filter holds SEVERAL of the same values a select holds one of (CR-DESIGN-SYSTEM-003).
// Deliberately a copy of SelectFilterDef with a different `kind`: a screen converts a filter from one
// value to several by changing one word, and option derivation, labelling and clearing stay identical.
export interface MultiSelectFilterDef<Row> {
  readonly kind: "multiSelect";
  readonly key: string;
  readonly label: string;
  readonly accessor: (row: Row) => string | null;
  // Fixed options. Omit to derive the present values from the data, exactly as "select" does.
  readonly options?: readonly SelectOption[];
}

export interface DateRangeFilterDef<Row> {
  readonly kind: "dateRange";
  readonly key: string;
  readonly label: string;
  readonly accessor: (row: Row) => string | null;
}

export type FilterDef<Row> =
  | SelectFilterDef<Row>
  | MultiSelectFilterDef<Row>
  | DateRangeFilterDef<Row>;

// The live value of one filter. A select holds its chosen value (null = "All"); a date range holds its
// inclusive bounds (each null = open-ended).
export interface SelectFilterValue {
  readonly kind: "select";
  readonly value: string | null;
}
// The chosen values of a multi-select. `[]` means "All", mirroring a select's `value: null` — one
// mental model for both kinds, so `clear()` and `emptyFilterValue` need no special case.
export interface MultiSelectFilterValue {
  readonly kind: "multiSelect";
  readonly values: readonly string[];
}
export interface DateRangeFilterValue {
  readonly kind: "dateRange";
  readonly from: string | null; // ISO yyyy-mm-dd
  readonly to: string | null; // ISO yyyy-mm-dd
}
export type FilterValue = SelectFilterValue | MultiSelectFilterValue | DateRangeFilterValue;

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
  if (def.kind === "select") return { kind: "select", value: null };
  if (def.kind === "multiSelect") return { kind: "multiSelect", values: [] };
  return { kind: "dateRange", from: null, to: null };
}

// The cleared value-map for a set of filter definitions — the starting/reset state.
export function emptyFilterValues<Row>(filters: readonly FilterDef<Row>[]): FilterValues {
  const out: Record<string, FilterValue> = {};
  for (const def of filters) out[def.key] = emptyFilterValue(def);
  return out;
}

// ── The stored-shape contract (CR-DESIGN-SYSTEM-003 §5.3) ────────────────────────────────────────
//
// 🔴 SAVED VIEWS ALREADY HOLD THESE VALUES. Bananaworld-CRM persists every toolbar filter value per rep
// (CR-CRM-011, 2026-08-10) as a flat map of strings, and this package cannot see that table. What it CAN
// do is fix the shape in one place so both directions stay readable, and report honestly when a stored
// value could not be represented.
//
// THE CONTRACT: a filter value is stored as a bare `string` when it holds ONE value, and as a `string[]`
// only when it holds two or more. So a multi-select holding a single choice writes exactly what a
// single-select writes today, and a build still on an older pin reads it correctly for free — only the
// genuinely multi-value case needs new reader code.
//
// ⚠ DATE RANGES ARE NOT CARRIED BY THIS CONTRACT. `string | string[]` cannot express two bounds, so a
// dateRange always reads back cleared and reports `widened`. A consumer that persists date ranges needs
// its own shape for them; this pair is for the categorical kinds.

export interface StoredFilterReading {
  readonly value: FilterValue;
  /** True when the stored shape could not be represented and the filter opened WIDER than saved. */
  readonly widened: boolean;
}

// Turn an untrusted stored value (string | string[] | anything at all) into this definition's
// FilterValue. Never throws, never guesses, and always errs wider rather than narrower — a filter that
// silently shows too few rows is the worse failure, because nothing on screen says so.
export function filterValueFromStored<Row>(
  def: FilterDef<Row>,
  stored: unknown,
): StoredFilterReading {
  if (def.kind === "multiSelect") {
    // A bare string is the pre-change shape and the single-value shape at once: it just works.
    if (typeof stored === "string") {
      return {
        value: { kind: "multiSelect", values: stored === "" ? [] : [stored] },
        widened: false,
      };
    }
    if (Array.isArray(stored)) {
      const values = stored.filter((v): v is string => typeof v === "string" && v !== "");
      return { value: { kind: "multiSelect", values }, widened: false };
    }
    return { value: { kind: "multiSelect", values: [] }, widened: false };
  }

  if (def.kind === "select") {
    if (typeof stored === "string" && stored !== "") {
      return { value: { kind: "select", value: stored }, widened: false };
    }
    // 🔴 The cross-version case: several values were saved and a single-select cannot hold them. It
    // opens as "All", which is WIDER than what the rep saved — so say so. This flag is the whole hook a
    // consumer needs to tell them, instead of widening in silence.
    if (Array.isArray(stored)) return { value: { kind: "select", value: null }, widened: true };
    return { value: { kind: "select", value: null }, widened: false };
  }

  const somethingWasStored =
    stored !== null && stored !== undefined && stored !== "" && !(Array.isArray(stored) && stored.length === 0);
  return { value: emptyFilterValue(def), widened: somethingWasStored };
}

// The narrowest storable shape for a live value: a bare string for one chosen value, an array only for
// two or more, and `null` for "All" — which a consumer simply does not store.
export function storedFromFilterValue(value: FilterValue): string | readonly string[] | null {
  if (value.kind === "select") return value.value;
  if (value.kind === "multiSelect") {
    if (value.values.length === 0) return null;
    // ONE value writes a bare string, so an older build reads it exactly as it always did.
    if (value.values.length === 1) return value.values[0] ?? null;
    return [...value.values];
  }
  return null; // date ranges are not carried by this contract — see the note above.
}

// True when the operator has narrowed the table at all (any search text or any active filter). Drives the
// "Clear" affordance.
// 🔴 The multiSelect arm is NOT optional. Without it a multiSelect value falls into the dateRange
// branch and reads `.from` on an object that has none — `undefined !== null` is TRUE, so "Clear" would
// sit permanently lit on any screen that adopts the new kind, even with nothing chosen.
export function hasActiveControls(query: string, filterValues: FilterValues): boolean {
  if (query.trim() !== "") return true;
  return Object.values(filterValues).some((v) => {
    if (v.kind === "select") return v.value !== null;
    if (v.kind === "multiSelect") return v.values.length > 0;
    return v.from !== null || v.to !== null;
  });
}

// The distinct present values for a select or multi-select filter, sorted for display. Fixed `options`
// win; otherwise the data's own values become the options (value === label). Widening the PARAMETER is
// invisible to every existing caller — they still pass a SelectFilterDef.
export function deriveSelectOptions<Row>(
  rows: readonly Row[],
  def: SelectFilterDef<Row> | MultiSelectFilterDef<Row>,
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

// A kind mismatch between def and value falls through to `return true` — the filter simply does not
// narrow. That is deliberate and is NOT to be "tidied" into a throw: a consumer restoring a saved view
// written by an older build can hand us a `select` value for a `multiSelect` definition, and a filter
// screen must never crash on it. It DOES mean the filter opens wider than it was saved, which is why
// `filterValueFromStored` below exists and reports `widened`.
function matchesFilter<Row>(row: Row, def: FilterDef<Row>, value: FilterValue): boolean {
  if (def.kind === "select" && value.kind === "select") {
    return value.value === null || def.accessor(row) === value.value;
  }
  if (def.kind === "multiSelect" && value.kind === "multiSelect") {
    // Union, never intersection: a row holds one value per filter, so "and" would always be empty.
    if (value.values.length === 0) return true;
    const actual = def.accessor(row);
    return actual !== null && value.values.includes(actual);
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
