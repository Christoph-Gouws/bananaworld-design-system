import { describe, expect, it } from "vitest";
import { truckDiagramRows, type TruckSlot } from "../../src";

// CR-DESIGN-SYSTEM-028 — the pure layout. Every drop fixture puts the LAST drop at the cab.

const filled = (position: number, drop?: number): TruckSlot => ({
  position,
  state: "filled",
  label: `P${position}`,
  drop,
});
const range = (from: number, to: number, make: (p: number) => TruckSlot): TruckSlot[] =>
  Array.from({ length: to - from + 1 }, (_, i) => make(from + i));
const positionsOf = (rows: ReturnType<typeof truckDiagramRows>) =>
  rows.flatMap((r) => r.cells.map((c) => c?.position ?? null));

describe("geometry", () => {
  it("two wide from the cab: 22 positions give 11 rows", () => {
    const rows = truckDiagramRows(22, []);
    expect(rows).toHaveLength(11);
    expect(positionsOf(rows).slice(0, 2)).toEqual([1, 2]);
    expect(positionsOf(rows).slice(-2)).toEqual([21, 22]);
  });

  it("an odd count leaves the last right cell empty", () => {
    const rows = truckDiagramRows(23, []);
    expect(rows.at(-1)!.cells[0].position).toBe(23);
    expect(rows.at(-1)!.cells[1]).toBeNull();
  });

  it.each([
    [0, 0],
    [-4, 0],
    [Number.NaN, 0],
    [2.7, 2],
  ])("positions %s draws %s spaces", (input, spaces) => {
    expect(positionsOf(truckDiagramRows(input, [])).filter((p) => p !== null)).toHaveLength(spaces);
  });

  it("never hides a pallet: a slot at 35 with positions 30 draws 36 spaces", () => {
    const rows = truckDiagramRows(30, [filled(35)]);
    expect(rows.at(-1)!.cells.map((c) => c!.position)).toEqual([35, 36]);
    expect(rows.at(-1)!.cells[0].state).toBe("filled");
  });

  it("ignores invalid positions; the first slot wins a duplicate", () => {
    const rows = truckDiagramRows(4, [
      filled(0),
      filled(-1),
      filled(1.5),
      { position: 2, state: "filled", label: "FIRST" },
      { position: 2, state: "filled", label: "SECOND" },
    ]);
    expect(rows[0]!.cells[1]!.label).toBe("FIRST");
    expect(rows.flatMap((r) => r.cells).filter((c) => c?.state !== "empty")).toHaveLength(1);
  });

  it("a taken slot loses its label but keeps note and drop", () => {
    const [row] = truckDiagramRows(2, [
      { position: 1, state: "taken", label: "OTHER-1", note: "n", drop: 2 },
    ]);
    expect(row!.cells[0]).toMatchObject({ state: "taken", label: undefined, note: "n", drop: 2 });
  });

  it("past standardPositions is over standard; with none, nothing is", () => {
    const flags = (std?: number) =>
      truckDiagramRows(34, [], std)
        .flatMap((r) => r.cells)
        .filter((c) => c?.overStandard)
        .map((c) => c!.position);
    expect(flags(30)).toEqual([31, 32, 33, 34]);
    expect(flags()).toEqual([]);
  });

  it("does not mutate its input", () => {
    const slots = Object.freeze([Object.freeze(filled(1, 2))]);
    expect(() => truckDiagramRows(4, slots)).not.toThrow();
  });
});

describe("drop blocks", () => {
  const shared = [
    ...range(1, 6, (p) => ({ position: p, state: "taken" as const, drop: 2 })),
    ...range(7, 20, (p) => filled(p, 1)),
  ];

  it("drop 2 at the cab, drop 1 by the doors; undropped rows stay in the block above", () => {
    const rows = truckDiagramRows(30, shared);
    expect(rows.slice(0, 3).map((r) => [r.drop, r.dropEnd])).toEqual([
      [2, "cab"],
      [2, "cab"],
      [2, "cab"],
    ]);
    expect(rows.map((r) => r.startsBlock).flatMap((s, i) => (s ? [i + 1] : []))).toEqual([1, 4]);
    expect(rows.slice(3).every((r) => r.drop === 1 && r.dropEnd === "doors")).toBe(true);
    expect(rows.flatMap((r) => r.cells).some((c) => c?.showDrop)).toBe(false);
  });

  it("one drop, or none, draws no blocks", () => {
    for (const slots of [range(1, 8, (p) => filled(p, 1)), range(1, 8, (p) => filled(p))]) {
      const rows = truckDiagramRows(10, slots);
      expect(rows.every((r) => r.drop === null && r.dropEnd === null && !r.startsBlock)).toBe(true);
    }
  });

  it("three drops with shared rows: the middle block has no end; the odd cells carry a tag", () => {
    const slots = [
      ...range(1, 3, (p) => filled(p, 3)),
      ...range(4, 7, (p) => filled(p, 2)),
      ...range(8, 10, (p) => filled(p, 1)),
    ];
    const rows = truckDiagramRows(10, slots);
    expect(rows.map((r) => r.dropEnd)).toEqual(["cab", "cab", null, null, "doors"]);
    expect(rows.map((r) => r.drop)).toEqual([3, 3, 2, 2, 1]);
    const tagged = rows.flatMap((r) => r.cells).filter((c) => c?.showDrop);
    expect(tagged.map((c) => c!.position)).toEqual([4, 8]);
  });

  it("a drop that only appears as the odd cell of a shared row: one block, still tagged", () => {
    const rows = truckDiagramRows(6, [
      filled(1, 2),
      filled(2, 1),
      filled(3, 2),
      filled(4, 2),
      filled(5, 2),
    ]);
    expect(rows.every((r) => r.drop === null)).toBe(true);
    expect(rows[0]!.cells[1]!.showDrop).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN])("drop %s is ignored", (drop) => {
    const rows = truckDiagramRows(4, [filled(1, drop), filled(3, 2)]);
    expect(rows.flatMap((r) => r.cells).every((c) => c?.drop !== drop)).toBe(true);
  });

  it("never reorders: drop 1 at the cab is drawn at the cab", () => {
    const rows = truckDiagramRows(8, [
      ...range(1, 4, (p) => filled(p, 1)),
      ...range(5, 8, (p) => filled(p, 2)),
    ]);
    expect(rows[0]).toMatchObject({ drop: 1, dropEnd: "cab" });
    expect(rows[3]).toMatchObject({ drop: 2, dropEnd: "doors" });
  });
});
