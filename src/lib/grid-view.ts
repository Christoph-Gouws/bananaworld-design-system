// The grid's pure state arithmetic (CR-DESIGN-SYSTEM-008).
//
// PURE: no JSX, no DOM, no I/O, no timers. The four grid controls render from these shapes and hand
// them back unchanged, which is what lets a consumer put the SAME value in a URL, in a request and
// (later) in a saved view without three spellings of it.
//
// ============================================================================
// 🔴 THE SHAPES ARE DECLARED HERE BECAUSE THE CONTROLS OWN THEM, NOT THE APP
// ============================================================================
// A consumer app decides WHICH columns exist and what each one means; it does not get to invent what
// "sorted by two columns" or "filtered to a minimum" LOOKS LIKE as data, because the controls that
// produce those states live here. An app that re-declared them would drift from the control the day a
// third sort key became possible — and a stale mirror of a control's state is exactly the defect class
// (CR-DC-049) the consuming estate has already paid for.
//
// ⚠ FILTER VALUE SHAPES ARE PART OF THIS CONTRACT, deliberately. `GridFilterRow` renders exactly four
//   kinds, so the four value shapes are the package's to state. What each one MEANS in a query is the
//   app's business and is nowhere in this file.

/** Which way a column is sorted. Lower-case, matching `TableHead`'s existing `SortDirection`. */
export type GridSortDir = "asc" | "desc";

/** One column of a possibly multi-column sort. Position in the array IS the sort precedence. */
export interface GridSort {
  readonly key: string;
  readonly dir: GridSortDir;
}

/**
 * The next sort state after a header click (OD-RP-9's mechanic, as arithmetic).
 *
 * A plain click REPLACES the sort with this column, cycling `asc → desc → off` on repeat clicks of
 * the same column. A shift-click ADDS the column to the end of the existing order — or, when that
 * column is already in the order, cycles just that entry in place and drops it when it cycles off.
 *
 * ⚠ THE CYCLE HAS THREE STOPS, NOT TWO. A column that can only be flipped between ascending and
 *   descending cannot be un-sorted, so the report can never be returned to its own natural order
 *   without a page reload — which is how a manager ends up believing the report has no default order.
 */
export function gridSortToggle(
  sorts: readonly GridSort[],
  key: string,
  additive: boolean,
): readonly GridSort[] {
  const existing = sorts.find((s) => s.key === key);
  if (additive === false) {
    if (existing === undefined) return [{ key, dir: "asc" }];
    return existing.dir === "asc" ? [{ key, dir: "desc" }] : [];
  }
  if (existing === undefined) return [...sorts, { key, dir: "asc" }];
  if (existing.dir === "asc") {
    return sorts.map((s) => (s.key === key ? { key, dir: "desc" as const } : s));
  }
  return sorts.filter((s) => s.key !== key);
}

/**
 * The 1-based marker a header shows, or `null` when it should show none.
 *
 * ⚠ A SINGLE SORT SHOWS NO NUMBER. "1" beside the only sorted column is noise that reads like the
 *   first of several — the marker exists to make a MULTI-column sort legible (OD-RP-9), and it earns
 *   its place only when there is a second one to be ordered against.
 */
export function gridSortPosition(sorts: readonly GridSort[], key: string): number | null {
  if (sorts.length < 2) return null;
  const index = sorts.findIndex((s) => s.key === key);
  return index === -1 ? null : index + 1;
}

/**
 * Move `key` so it sits immediately before `beforeKey` (drag a header onto another to reorder).
 *
 * Dropping a column on itself, or naming a key the order does not hold, returns the order unchanged
 * rather than throwing — a drop that lands nowhere is a no-op, not an error.
 */
export function gridColumnOrder(
  order: readonly string[],
  key: string,
  beforeKey: string,
): readonly string[] {
  if (key === beforeKey) return order;
  if (order.includes(key) === false || order.includes(beforeKey) === false) return order;
  const without = order.filter((k) => k !== key);
  const at = without.indexOf(beforeKey);
  return [...without.slice(0, at), key, ...without.slice(at)];
}

/** What one grouping LEVEL subtotals (OD-RP-8 — the choice rides the chip, per level). */
export interface GridGroupLevel {
  readonly key: string;
  /** Show "· N rows" on this level's group rows. */
  readonly count: boolean;
  /** Which measure column keys this level renders a subtotal for. A subset, never all by decree. */
  readonly measures: readonly string[];
}

/** The four filter shapes `GridFilterRow` can render. */
export type GridFilterKind = "text" | "select" | "numberMin" | "dateRange";

export type GridFilterValue =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "select"; readonly value: string }
  | { readonly kind: "numberMin"; readonly value: string }
  | { readonly kind: "dateRange"; readonly from: string | null; readonly to: string | null };

/**
 * The live filter state, keyed by column key.
 *
 * ⚠ AN ABSENT KEY IS "NOT NARROWED". A cleared filter is DROPPED rather than stored empty, so a
 *   consumer never has to tell "cleared" from "never set" — there is one empty state, and it is `{}`.
 */
export type GridFilterValues = Readonly<Record<string, GridFilterValue>>;

/** Drop a key when its value is empty; otherwise set it. The one way the row edits its own state. */
export function gridFilterSet(
  values: GridFilterValues,
  key: string,
  value: GridFilterValue | null,
): GridFilterValues {
  const next: Record<string, GridFilterValue> = { ...values };
  if (value === null || gridFilterIsEmpty(value)) delete next[key];
  else next[key] = value;
  return next;
}

/** Is this value "no narrowing"? Whitespace-only text counts as empty; "0" does not. */
export function gridFilterIsEmpty(value: GridFilterValue): boolean {
  if (value.kind === "dateRange") return value.from === null && value.to === null;
  return value.value.trim().length === 0;
}

/**
 * Everything one grid view is, as data.
 *
 * 🔴 DECLARED NOW, PERSISTED LATER. Nothing in this package stores it — a saved view is the consuming
 *    app's feature, with its own table, its own permissions and its own scope. What this shape buys is
 *    that when that arrives it is written against the state the controls ACTUALLY produce, rather than
 *    against a second guess at it.
 */
export interface GridStoredView {
  /** Visible column keys, IN ORDER. A key absent from this list is hidden, not deleted. */
  readonly columns: readonly string[];
  /** The pinned column, or null. See `GridHeadCell.pinned` for why there is at most one. */
  readonly pinned: string | null;
  readonly sorts: readonly GridSort[];
  readonly groups: readonly GridGroupLevel[];
  readonly filters: GridFilterValues;
}
