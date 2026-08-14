// The paging arithmetic for a long list (CR-DESIGN-SYSTEM-004) — pure, no React, no IO.
//
// The package's own split: the logic lives here in src/lib, the React skin lives in
// src/components/TablePagination.tsx — exactly as `table-controls.ts` sits under
// `DataTableToolbar.tsx`. Nothing here knows what a row is, counts anything, or asks anyone for a
// count. It is given a page, a page size and a total, and it says which rows that window covers.
//
// 🔴 `offset` is deliberately part of the answer. It is the SAME arithmetic as `from`, so a consumer
//    that renders "showing 26–50" and queries `OFFSET 25 LIMIT 25` cannot disagree with itself. Every
//    list hand-rolling `(page - 1) * size` is another chance to be off by one, in the one place where
//    an off-by-one looks to an operator exactly like a missing record.

/** The page sizes offered by default: 25, 50, 100, 200. */
export const TABLE_PAGE_SIZES = [25, 50, 100, 200] as const;

/** Where a list currently is. `page` is 1-based — page 1 is the first page, never page 0. */
export interface TablePageState {
  readonly page: number;
  readonly pageSize: number;
}

/** The window `TablePageState` describes over `total` rows, with every number already clamped sane. */
export interface TablePageRange {
  /** The page actually in force, clamped into `1..pageCount`. */
  readonly page: number;
  /** The page size actually in force, clamped to at least 1. */
  readonly pageSize: number;
  /** The total the caller supplied, clamped to a whole number of at least 0. */
  readonly total: number;
  /** `max(1, ceil(total / pageSize))` — never 0, so "page 1 of 1" is what an empty list reads. */
  readonly pageCount: number;
  /** `(page - 1) * pageSize` — what the consumer's query needs. Always `from - 1` when `total > 0`. */
  readonly offset: number;
  /** 1-based first row on this page; **0** when there is nothing to show. */
  readonly from: number;
  /** 1-based last row on this page — the honest remainder, never padded to a full page. */
  readonly to: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

// Junk in, sane out. A consumer restoring a page number out of a URL or a saved view can hand us a
// string-shaped NaN, a float, or a page that existed before someone deleted forty rows; none of that
// may throw and none of it may render a nonsense window.
// `Number.isInteger` is false for NaN, for ±Infinity and for any fraction, so this one line is the
// whole of the plan's junk-input row: a non-finite or non-integer input takes the floor, and so does
// anything below it.
function wholeNumberAtLeast(value: number, floor: number): number {
  if (!Number.isInteger(value)) return floor;
  return value < floor ? floor : value;
}

/**
 * Resolve `state` against `total` into a window that is always renderable.
 *
 * 🔴 Clamping happens for RENDERING ONLY. If a caller asks for page 9 of 4 this returns page 4 — it
 *    does not, and must not, call anything back to "correct" the caller. A pure presentation helper
 *    that fires a callback to fix its parent's state is a re-render loop and a lie about who owns
 *    the state (D-7).
 */
export function tablePageRange(state: TablePageState, total: number): TablePageRange {
  const pageSize = wholeNumberAtLeast(state.pageSize, 1);
  const safeTotal = wholeNumberAtLeast(total, 0);
  const pageCount = Math.max(1, Math.ceil(safeTotal / pageSize));

  const requested = wholeNumberAtLeast(state.page, 1);
  const page = requested > pageCount ? pageCount : requested;

  const offset = (page - 1) * pageSize;
  const empty = safeTotal === 0;

  return {
    page,
    pageSize,
    total: safeTotal,
    pageCount,
    offset,
    from: empty ? 0 : offset + 1,
    to: empty ? 0 : Math.min(offset + pageSize, safeTotal),
    isFirst: page === 1,
    isLast: page === pageCount,
  };
}
