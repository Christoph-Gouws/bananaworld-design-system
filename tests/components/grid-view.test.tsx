import { describe, expect, it } from "vitest";

// Imported FROM THE PACKAGE ROOT. A helper a consumer cannot reach from "@bananaworld/design-system"
// has not shipped, whatever the file on disk says.
import {
  gridColumnOrder,
  gridFilterIsEmpty,
  gridFilterSet,
  gridSortPosition,
  gridSortToggle,
  type GridSort,
} from "../../src";

// CR-DESIGN-SYSTEM-008 — the grid's pure state arithmetic. No DOM, no timers, no I/O.

describe("gridSortToggle — a plain click", () => {
  it("sorts ascending on the first click", () => {
    expect(gridSortToggle([], "batch", false)).toEqual([{ key: "batch", dir: "asc" }]);
  });

  it("reverses on the second", () => {
    expect(gridSortToggle([{ key: "batch", dir: "asc" }], "batch", false)).toEqual([
      { key: "batch", dir: "desc" },
    ]);
  });

  it("🔴 CLEARS ON THE THIRD — a two-stop cycle can never return a table to its own order", () => {
    expect(gridSortToggle([{ key: "batch", dir: "desc" }], "batch", false)).toEqual([]);
  });

  it("REPLACES an existing sort rather than adding to it", () => {
    const sorts: GridSort[] = [
      { key: "batch", dir: "asc" },
      { key: "room", dir: "desc" },
    ];
    expect(gridSortToggle(sorts, "item", false)).toEqual([{ key: "item", dir: "asc" }]);
  });
});

describe("gridSortToggle — a shift-click", () => {
  it("appends a second key, keeping the first and its precedence", () => {
    expect(gridSortToggle([{ key: "batch", dir: "asc" }], "room", true)).toEqual([
      { key: "batch", dir: "asc" },
      { key: "room", dir: "asc" },
    ]);
  });

  it("cycles an existing key IN PLACE, without disturbing the order", () => {
    const sorts: GridSort[] = [
      { key: "batch", dir: "asc" },
      { key: "room", dir: "asc" },
    ];
    expect(gridSortToggle(sorts, "batch", true)).toEqual([
      { key: "batch", dir: "desc" },
      { key: "room", dir: "asc" },
    ]);
  });

  it("drops that key when it cycles off, leaving the rest in order", () => {
    const sorts: GridSort[] = [
      { key: "batch", dir: "desc" },
      { key: "room", dir: "asc" },
    ];
    expect(gridSortToggle(sorts, "batch", true)).toEqual([{ key: "room", dir: "asc" }]);
  });
});

describe("gridSortPosition", () => {
  it("🔴 SHOWS NO NUMBER FOR A SINGLE SORT — the marker orders a MULTI-column sort", () => {
    expect(gridSortPosition([{ key: "batch", dir: "asc" }], "batch")).toBeNull();
  });

  it("numbers from 1 once there are two", () => {
    const sorts: GridSort[] = [
      { key: "batch", dir: "asc" },
      { key: "room", dir: "desc" },
    ];
    expect(gridSortPosition(sorts, "batch")).toBe(1);
    expect(gridSortPosition(sorts, "room")).toBe(2);
    expect(gridSortPosition(sorts, "item")).toBeNull();
  });
});

describe("gridColumnOrder", () => {
  const order = ["a", "b", "c", "d"];

  it("moves a column to sit immediately before another", () => {
    expect(gridColumnOrder(order, "d", "b")).toEqual(["a", "d", "b", "c"]);
  });

  it("moves one leftwards as readily as rightwards", () => {
    expect(gridColumnOrder(order, "a", "d")).toEqual(["b", "c", "a", "d"]);
  });

  it("a drop that lands nowhere is a NO-OP, never an error", () => {
    expect(gridColumnOrder(order, "a", "a")).toEqual(order);
    expect(gridColumnOrder(order, "zzz", "b")).toEqual(order);
    expect(gridColumnOrder(order, "a", "zzz")).toEqual(order);
  });
});

describe("gridFilterSet / gridFilterIsEmpty", () => {
  it("🔴 A CLEARED FILTER IS A DROPPED KEY, so there is exactly one empty state", () => {
    const values = gridFilterSet({}, "pallet", { kind: "text", value: "PAL" });
    expect(values).toEqual({ pallet: { kind: "text", value: "PAL" } });
    expect(gridFilterSet(values, "pallet", null)).toEqual({});
    expect(gridFilterSet(values, "pallet", { kind: "text", value: "   " })).toEqual({});
  });

  it("leaves the other keys alone", () => {
    const values = gridFilterSet(
      gridFilterSet({}, "pallet", { kind: "text", value: "PAL" }),
      "item",
      { kind: "select", value: "Cavendish" },
    );
    expect(Object.keys(values).sort()).toEqual(["item", "pallet"]);
    expect(Object.keys(gridFilterSet(values, "pallet", null))).toEqual(["item"]);
  });

  it("treats a date range with neither bound as empty, and '0' as a real value", () => {
    expect(gridFilterIsEmpty({ kind: "dateRange", from: null, to: null })).toBe(true);
    expect(gridFilterIsEmpty({ kind: "dateRange", from: "2026-08-01", to: null })).toBe(false);
    expect(gridFilterIsEmpty({ kind: "numberMin", value: "0" })).toBe(false);
    expect(gridFilterIsEmpty({ kind: "text", value: " " })).toBe(true);
  });
});
