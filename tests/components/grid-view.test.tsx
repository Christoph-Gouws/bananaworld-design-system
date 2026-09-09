import { describe, expect, it } from "vitest";

// Imported FROM THE PACKAGE ROOT. A helper a consumer cannot reach from "@bananaworld/design-system"
// has not shipped, whatever the file on disk says.
import {
  gridColumnOrder,
  gridFilterIsEmpty,
  gridFilterSelect,
  gridFilterSelected,
  gridFilterSet,
  gridSortPosition,
  gridSortToggle,
  type GridFilterValue,
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

// =============================================================================================
// §2 — CR-DESIGN-SYSTEM-009: A `select` FILTER MAY HOLD SEVERAL IDS (§A.1 / §A.2 / §A.3).
//
// 🔴 THE ONE THING THESE SPECS EXIST TO PROTECT is that A ONE-VALUE STATE BEHAVES EXACTLY AS IT
//    DID. The consuming app persists this shape to disk as a query string — rows already exist
//    holding `f_room=cold-1` — so the single value has to keep its bytes, keep narrowing, and keep
//    round-tripping. Everything else here is the new arity riding beside it.
// =============================================================================================

describe("gridFilterSelect — the ONLY constructor of a select value", () => {
  it("🔴 ONE ID WRITES EXACTLY WHAT IT ALWAYS WROTE — no `values`, byte for byte the old shape", () => {
    const one = gridFilterSelect(["cold-1"]);
    expect(one).toEqual({ kind: "select", value: "cold-1" });
    // Not merely equal-looking: the optional field is ABSENT, not present-and-empty. A consumer that
    // serialises this object sees the same keys it has always seen.
    expect(Object.keys(one ?? {})).toEqual(["kind", "value"]);
  });

  it("two or more write the whole list, in the order handed in, with values[0] === value", () => {
    const many = gridFilterSelect(["cold-1", "cold-2", "ripening-3"]);
    expect(many).toEqual({
      kind: "select",
      value: "cold-1",
      values: ["cold-1", "cold-2", "ripening-3"],
    });
  });

  it("🔴 NONE RETURNS null, which `gridFilterSet` DROPS — the empty state stays `{}`", () => {
    expect(gridFilterSelect([])).toBeNull();
    expect(gridFilterSelect(["", "   "])).toBeNull();
    expect(gridFilterSet({ room: { kind: "select", value: "cold-1" } }, "room", gridFilterSelect([])))
      .toEqual({});
  });

  it("drops blanks and repeats, so the two fields cannot disagree however it is called", () => {
    expect(gridFilterSelect(["cold-1", "cold-1"])).toEqual({ kind: "select", value: "cold-1" });
    expect(gridFilterSelect(["cold-1", "", "cold-2"])).toEqual({
      kind: "select",
      value: "cold-1",
      values: ["cold-1", "cold-2"],
    });
  });
});

describe("gridFilterSelected — the ONLY reader", () => {
  it("🔴 READS A VALUE WRITTEN BEFORE THIS CHANGE AS THE ONE ID IT IS", () => {
    // Exactly the object a saved view restores today. It must not read as "nothing chosen".
    expect(gridFilterSelected({ kind: "select", value: "cold-1" })).toEqual(["cold-1"]);
  });

  it("reads every id of a several-value state", () => {
    expect(
      gridFilterSelected({ kind: "select", value: "a", values: ["a", "b", "c"] }),
    ).toEqual(["a", "b", "c"]);
  });

  it("answers [] for absent, empty, or another kind — never undefined and never a throw", () => {
    expect(gridFilterSelected(undefined)).toEqual([]);
    expect(gridFilterSelected({ kind: "select", value: "" })).toEqual([]);
    expect(gridFilterSelected({ kind: "select", value: "  " })).toEqual([]);
    expect(gridFilterSelected({ kind: "text", value: "MB-2" })).toEqual([]);
    expect(gridFilterSelected({ kind: "dateRange", from: "2026-08-01", to: null })).toEqual([]);
  });
});

describe("the arity round-trips, at every count", () => {
  it("🔴 read → write → read IS IDENTITY for one, two and three ids", () => {
    for (const ids of [["cold-1"], ["cold-1", "cold-2"], ["a", "b", "c"]]) {
      const value = gridFilterSelect(ids);
      expect(value).not.toBeNull();
      expect(gridFilterSelected(value ?? undefined)).toEqual(ids);
    }
  });

  it("🔴 SURVIVES THE WIRE ENCODING THE PACKAGE STATES — a repeated parameter, both arities", () => {
    // The encoding `grid-view.ts`'s header declares, exercised end to end with the real URL API the
    // consumer uses. A single value must read identically under BOTH readers, because views already
    // saved to disk are parsed by `get` until the consumer moves to `getAll`.
    const write = (ids: readonly string[]): string => {
      const sp = new URLSearchParams();
      for (const id of gridFilterSelected(gridFilterSelect(ids) ?? undefined)) sp.append("f_room", id);
      return sp.toString();
    };

    expect(write(["cold-1"])).toBe("f_room=cold-1");
    expect(write(["cold-1", "cold-2"])).toBe("f_room=cold-1&f_room=cold-2");
    expect(write([])).toBe("");

    // 🔴 THE OLD PARSER, UNCHANGED, STILL READS A ONE-VALUE VIEW CORRECTLY.
    expect(new URLSearchParams(write(["cold-1"])).get("f_room")).toBe("cold-1");
    // …and the new one reads the same bytes as the same single id.
    expect(new URLSearchParams(write(["cold-1"])).getAll("f_room")).toEqual(["cold-1"]);
    expect(new URLSearchParams(write(["cold-1", "cold-2"])).getAll("f_room")).toEqual([
      "cold-1",
      "cold-2",
    ]);

    // ⚠ AND NO SEPARATOR TO COLLIDE WITH: an id holding a comma stays ONE id, which is the whole
    //   reason a repeated parameter was chosen over `f_room=a,b`.
    const odd = new URLSearchParams(write(["cold,1", "cold-2"]));
    expect(odd.getAll("f_room")).toEqual(["cold,1", "cold-2"]);
  });
});

describe("gridFilterIsEmpty on a select, at both arities", () => {
  it("🔴 ANSWERS BIT FOR BIT WHAT IT ANSWERED BEFORE for every value expressible then", () => {
    expect(gridFilterIsEmpty({ kind: "select", value: "cold-1" })).toBe(false);
    expect(gridFilterIsEmpty({ kind: "select", value: "" })).toBe(true);
    expect(gridFilterIsEmpty({ kind: "select", value: "   " })).toBe(true);
  });

  it("a several-value select is not empty, and `gridFilterSet` keeps it", () => {
    const many: GridFilterValue = { kind: "select", value: "a", values: ["a", "b"] };
    expect(gridFilterIsEmpty(many)).toBe(false);
    expect(gridFilterSet({}, "room", many)).toEqual({ room: many });
  });
});
