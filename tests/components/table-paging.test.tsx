import { describe, expect, it } from "vitest";

// Imported FROM THE PACKAGE ROOT, not from the deep file. If the barrels do not carry these names a
// consumer cannot reach them at all, and that is the failure this import is here to catch (spec 17).
// The pure lib specs live under tests/components/ because that is where this repo already puts them
// — `table-controls.ts` is a src/lib module and its suite is tests/components/table-controls.test.tsx.
// vitest.config.ts globs only tests/pricing, tests/sales-order and tests/components/**/*.test.tsx, so
// a tests/lib/ file would silently never run.
import { TABLE_PAGE_SIZES, tablePageRange, type TablePageRange } from "../../src";

// CR-DESIGN-SYSTEM-004 — the paging arithmetic. Every case here is a case an operator can actually
// reach, and the two that get got wrong most often (the exact multiple and the remainder) are pinned
// first. This is NOT a performance change: nothing is slow today and nothing here measures speed.

function range(page: number, pageSize: number, total: number): TablePageRange {
  return tablePageRange({ page, pageSize }, total);
}

describe("TABLE_PAGE_SIZES", () => {
  it("offers exactly 25 / 50 / 100 / 200, in that order", () => {
    expect(TABLE_PAGE_SIZES).toEqual([25, 50, 100, 200]);
  });

  it("reports the first page correctly at each of the four sizes (spec 1)", () => {
    const total = 1000;
    for (const size of TABLE_PAGE_SIZES) {
      const r = range(1, size, total);
      expect({ from: r.from, to: r.to, offset: r.offset, pageCount: r.pageCount }).toEqual({
        from: 1,
        to: size,
        offset: 0,
        pageCount: 1000 / size,
      });
    }
  });

  it("reports the LAST page correctly at each of the four sizes (spec 1)", () => {
    const total = 1000;
    for (const size of TABLE_PAGE_SIZES) {
      const last = 1000 / size;
      const r = range(last, size, total);
      expect({ from: r.from, to: r.to, isLast: r.isLast }).toEqual({
        from: total - size + 1,
        to: 1000,
        isLast: true,
      });
    }
  });
});

describe("tablePageRange — the boundaries that get got wrong", () => {
  it("an EXACT MULTIPLE has no empty last page: 100 rows at 25 is four pages, not five (spec 2)", () => {
    expect(range(1, 25, 100).pageCount).toBe(4);
    const last = range(4, 25, 100);
    expect(last.from).toBe(76);
    expect(last.to).toBe(100);
    expect(last.isLast).toBe(true);
    // Asking for the fifth page that a naive ceil()+1 would offer clamps back onto the fourth.
    expect(range(5, 25, 100).page).toBe(4);
  });

  it("the last page shows the REMAINDER honestly and is never padded (spec 3)", () => {
    expect(range(1, 25, 312).pageCount).toBe(13);
    const last = range(13, 25, 312);
    expect(last.from).toBe(301);
    expect(last.to).toBe(312); // twelve rows — not padded out to 325
    expect(last.to - last.from + 1).toBe(12);
    expect(last.isLast).toBe(true);
  });

  it("a total of ZERO reads 0 of 0, on one page, with both ends reached (spec 4)", () => {
    const r = range(1, 25, 0);
    expect(r).toEqual({
      page: 1,
      pageSize: 25,
      total: 0,
      pageCount: 1,
      offset: 0,
      from: 0,
      to: 0,
      isFirst: true,
      isLast: true,
    });
  });

  it("a total of ONE, and a total below the page size, are a single page (spec 5)", () => {
    const one = range(1, 25, 1);
    expect([one.from, one.to, one.pageCount]).toEqual([1, 1, 1]);
    expect(one.isFirst && one.isLast).toBe(true);

    const few = range(1, 25, 7);
    expect([few.from, few.to, few.pageCount]).toEqual([1, 7, 1]);
    expect(few.isFirst && few.isLast).toBe(true);
  });

  it("the last page holding a SINGLE row still reports that row at both ends", () => {
    const r = range(13, 26, 313); // 312 = 12 x 26, so page 13 holds row 313 alone
    expect([r.from, r.to]).toEqual([313, 313]);
    expect(r.isLast).toBe(true);
  });

  it("distinguishes first, middle and last (spec 6)", () => {
    expect(range(1, 25, 312)).toMatchObject({ isFirst: true, isLast: false });
    expect(range(7, 25, 312)).toMatchObject({ isFirst: false, isLast: false });
    expect(range(13, 25, 312)).toMatchObject({ isFirst: false, isLast: true });
  });
});

describe("tablePageRange — the offset invariant (D-12, spec 7)", () => {
  const cases: ReadonlyArray<readonly [number, number, number]> = [
    [1, 25, 312],
    [7, 25, 312],
    [13, 25, 312],
    [4, 25, 100],
    [1, 200, 199],
    [2, 50, 51],
    [1, 25, 1],
  ];

  it("offset is always (page - 1) * pageSize on the page actually in force", () => {
    for (const [page, size, total] of cases) {
      const r = range(page, size, total);
      expect(r.offset).toBe((r.page - 1) * r.pageSize);
    }
  });

  it("offset + 1 equals `from` whenever there is anything to show — the strip and the query agree", () => {
    for (const [page, size, total] of cases) {
      const r = range(page, size, total);
      expect(r.offset + 1).toBe(r.from);
    }
  });
});

describe("tablePageRange — junk in, sane out (spec 8)", () => {
  it("clamps a page below 1 up to 1", () => {
    expect(range(0, 25, 312).page).toBe(1);
    expect(range(-5, 25, 312).page).toBe(1);
  });

  it("clamps a stale page ABOVE the count down to the last page", () => {
    const r = range(9, 25, 100); // page 9 of 4
    expect(r.page).toBe(4);
    expect(r.from).toBe(76);
    expect(r.isLast).toBe(true);
  });

  it("survives NaN, Infinity and a non-integer without throwing — all take page 1", () => {
    expect(range(Number.NaN, 25, 312).page).toBe(1);
    expect(range(Number.POSITIVE_INFINITY, 25, 312).page).toBe(1);
    expect(range(2.7, 25, 312).page).toBe(1);
    expect(range(1, Number.NaN, 312).pageSize).toBe(1);
    expect(range(1, Number.POSITIVE_INFINITY, 312).pageSize).toBe(1);
  });

  it("clamps a page size of 0 or below to 1 rather than dividing by zero", () => {
    const zero = range(1, 0, 10);
    expect(zero.pageSize).toBe(1);
    expect(zero.pageCount).toBe(10);
    expect(range(1, -25, 10).pageSize).toBe(1);
  });

  it("treats a negative or non-finite total as nothing to show", () => {
    expect(range(1, 25, -40)).toMatchObject({ total: 0, from: 0, to: 0, pageCount: 1 });
    expect(range(1, 25, Number.NaN)).toMatchObject({ total: 0, from: 0, to: 0 });
  });
});
