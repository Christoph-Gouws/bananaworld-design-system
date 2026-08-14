import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  applyTableControls,
  deriveSelectOptions,
  emptyFilterValue,
  emptyFilterValues,
  filterValueFromStored,
  hasActiveControls,
  storedFromFilterValue,
  type DateRangeFilterDef,
  type FilterDef,
  type FilterValues,
  type MultiSelectFilterDef,
  type SelectFilterDef,
} from "../../src/lib/table-controls";

// CR-DESIGN-SYSTEM-003 — the filter engine gains a THIRD kind, `multiSelect`, beside `select` and
// `dateRange`. The lane rule is additive-only: eleven call sites across three apps pin this package by
// git sha, and every one of them must behave byte-identically afterwards.
//
// 🔴 THE FIRST HALF OF THIS FILE IS A CHARACTERISATION SUITE AND IT WAS WRITTEN BEFORE A LINE OF SOURCE
// CHANGED (plan D-11). There was NO test for this engine at all — so "the package suite is green" proved
// nothing about the existing kinds, and citing it as the additive proof would have been hollow. These
// specs pin what `select` and `dateRange` did at `9aa20f7`; they are not to be edited to accommodate a
// later change. If one of them ever goes red, the change that turned it red is not additive.

interface Row {
  readonly id: string;
  readonly depot: string | null;
  readonly status: string;
  readonly captured: string | null;
  readonly weightKg: number | null;
}

const ROWS: readonly Row[] = [
  { id: "r1", depot: "Cape Town", status: "Open", captured: "2026-08-01", weightKg: 40 },
  { id: "r2", depot: "Durban", status: "Closed", captured: "2026-08-05", weightKg: 10 },
  { id: "r3", depot: "Johannesburg", status: "Open", captured: "2026-08-10T14:22:00Z", weightKg: null },
  { id: "r4", depot: "Cape Town", status: "Open", captured: "2026-08-15", weightKg: 25 },
  { id: "r5", depot: null, status: "Closed", captured: null, weightKg: 5 },
  { id: "r6", depot: "", status: "Open", captured: "2026-08-20", weightKg: 5 },
];

const depotSelect: SelectFilterDef<Row> = {
  kind: "select",
  key: "depot",
  label: "Depot",
  accessor: (row) => row.depot,
};

const depotMulti: MultiSelectFilterDef<Row> = {
  kind: "multiSelect",
  key: "depot",
  label: "Depot",
  accessor: (row) => row.depot,
};

const capturedRange: DateRangeFilterDef<Row> = {
  kind: "dateRange",
  key: "captured",
  label: "Captured",
  accessor: (row) => row.captured,
};

function idsOf(rows: readonly Row[]): string[] {
  return rows.map((row) => row.id);
}

// ---------------------------------------------------------------------------------------------
// CHARACTERISATION — what `select` and `dateRange` did BEFORE this change (specs 1–5)
// ---------------------------------------------------------------------------------------------

describe("characterisation: emptyFilterValue / emptyFilterValues (unchanged shapes)", () => {
  it("gives a select its null value", () => {
    expect(emptyFilterValue(depotSelect)).toEqual({ kind: "select", value: null });
  });

  it("gives a date range two open bounds", () => {
    expect(emptyFilterValue(capturedRange)).toEqual({ kind: "dateRange", from: null, to: null });
  });

  it("maps every definition by key, in one cleared map", () => {
    expect(emptyFilterValues([depotSelect, capturedRange])).toEqual({
      depot: { kind: "select", value: null },
      captured: { kind: "dateRange", from: null, to: null },
    });
  });
});

describe("characterisation: hasActiveControls", () => {
  const cleared = emptyFilterValues([depotSelect, capturedRange]);

  it("is false when nothing is searched and nothing is filtered", () => {
    expect(hasActiveControls("", cleared)).toBe(false);
    expect(hasActiveControls("   ", cleared)).toBe(false);
  });

  it("is true for search text alone", () => {
    expect(hasActiveControls("dur", cleared)).toBe(true);
  });

  it("is true for a set select", () => {
    expect(hasActiveControls("", { ...cleared, depot: { kind: "select", value: "Durban" } })).toBe(
      true,
    );
  });

  it("is true for either date bound on its own", () => {
    const from: FilterValues = {
      ...cleared,
      captured: { kind: "dateRange", from: "2026-08-02", to: null },
    };
    const to: FilterValues = {
      ...cleared,
      captured: { kind: "dateRange", from: null, to: "2026-08-02" },
    };
    expect(hasActiveControls("", from)).toBe(true);
    expect(hasActiveControls("", to)).toBe(true);
  });
});

describe("characterisation: applyTableControls filtering", () => {
  it("shows every row when the select holds null — the All state", () => {
    const visible = applyTableControls(ROWS, {
      filters: [depotSelect],
      filterValues: { depot: { kind: "select", value: null } },
    });
    expect(idsOf(visible)).toEqual(["r1", "r2", "r3", "r4", "r5", "r6"]);
  });

  it("matches a chosen select value exactly, and excludes a null accessor once set", () => {
    const visible = applyTableControls(ROWS, {
      filters: [depotSelect],
      filterValues: { depot: { kind: "select", value: "Cape Town" } },
    });
    expect(idsOf(visible)).toEqual(["r1", "r4"]);
  });

  it("compares date bounds inclusively, on the day, ignoring any time part", () => {
    const visible = applyTableControls(ROWS, {
      filters: [capturedRange],
      filterValues: { captured: { kind: "dateRange", from: "2026-08-05", to: "2026-08-10" } },
    });
    // r3 is a full ISO timestamp on the closing day and must still be inside the range.
    expect(idsOf(visible)).toEqual(["r2", "r3"]);
  });

  it("drops a row with no date once either bound is set", () => {
    const visible = applyTableControls(ROWS, {
      filters: [capturedRange],
      filterValues: { captured: { kind: "dateRange", from: null, to: "2026-08-05" } },
    });
    expect(idsOf(visible)).toEqual(["r1", "r2"]);
  });

  it("ignores a filter whose value is absent from the map", () => {
    const visible = applyTableControls(ROWS, { filters: [depotSelect], filterValues: {} });
    expect(visible).toHaveLength(ROWS.length);
  });
});

describe("characterisation: deriveSelectOptions", () => {
  it("returns the fixed options untouched when the definition supplies them", () => {
    const fixed: SelectFilterDef<Row> = {
      ...depotSelect,
      options: [
        { value: "b", label: "Bravo" },
        { value: "a", label: "Alpha" },
      ],
    };
    expect(deriveSelectOptions(ROWS, fixed)).toEqual([
      { value: "b", label: "Bravo" },
      { value: "a", label: "Alpha" },
    ]);
  });

  it("derives distinct present values, sorted, with null and empty skipped", () => {
    expect(deriveSelectOptions(ROWS, depotSelect)).toEqual([
      { value: "Cape Town", label: "Cape Town" },
      { value: "Durban", label: "Durban" },
      { value: "Johannesburg", label: "Johannesburg" },
    ]);
  });
});

describe("characterisation: search and sort are untouched by any filter work", () => {
  const searchable = { getSearchText: (row: Row) => `${row.id} ${row.depot ?? ""} ${row.status}` };

  it("requires every whitespace-separated part of the query to appear, case-insensitively", () => {
    const visible = applyTableControls(ROWS, { ...searchable, query: "cape r4" });
    expect(idsOf(visible)).toEqual(["r4"]);
  });

  it("sorts by the accessor and sinks nulls last regardless of direction", () => {
    const accessors = { weightKg: (row: Row) => row.weightKg };
    const asc = applyTableControls(ROWS, { sort: { key: "weightKg", dir: "asc" }, sortAccessors: accessors });
    const desc = applyTableControls(ROWS, { sort: { key: "weightKg", dir: "desc" }, sortAccessors: accessors });
    expect(idsOf(asc)).toEqual(["r5", "r6", "r2", "r4", "r1", "r3"]);
    expect(idsOf(desc)).toEqual(["r1", "r4", "r2", "r5", "r6", "r3"]);
  });

  it("combines search and filter as an AND, and never mutates the input array", () => {
    const before = [...ROWS];
    const visible = applyTableControls(ROWS, {
      ...searchable,
      query: "open",
      filters: [depotSelect satisfies FilterDef<Row>],
      filterValues: { depot: { kind: "select", value: "Cape Town" } },
    });
    expect(idsOf(visible)).toEqual(["r1", "r4"]);
    expect(ROWS).toEqual(before);
  });
});

// ---------------------------------------------------------------------------------------------
// THE NEW KIND — multiSelect (specs 6–13)
// ---------------------------------------------------------------------------------------------

function visibleWithDepots(values: readonly string[]): string[] {
  return idsOf(
    applyTableControls(ROWS, {
      filters: [depotMulti],
      filterValues: { depot: { kind: "multiSelect", values } },
    }),
  );
}

describe("multiSelect: none / one / several / all — the four cardinalities the request names", () => {
  const everyDepot = ["Cape Town", "Durban", "Johannesburg"];

  it("none chosen shows every row — [] is the All state, mirroring select's null", () => {
    expect(visibleWithDepots([])).toEqual(["r1", "r2", "r3", "r4", "r5", "r6"]);
  });

  it("one chosen behaves exactly like a single-select holding that value", () => {
    expect(visibleWithDepots(["Cape Town"])).toEqual(["r1", "r4"]);
  });

  it("several chosen is a UNION, never an intersection", () => {
    // A row holds ONE depot, so an intersection would always be empty — there is no case where "and"
    // is meaningful here, which is why no option to choose between them exists.
    expect(visibleWithDepots(["Cape Town", "Durban"])).toEqual(["r1", "r2", "r4"]);
  });

  it("every option chosen shows the same rows as none chosen, except the rows with no depot at all", () => {
    // Not identical to []: a row whose accessor is null or "" is excluded the moment anything is
    // chosen, exactly as a single-select excludes it. The CONTROL still reads "several chosen".
    expect(visibleWithDepots(everyDepot)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(visibleWithDepots([])).toContain("r5");
    expect(visibleWithDepots(everyDepot)).not.toContain("r5");
  });

  it("one chosen returns the identical row set to the select of the same value — the kinds agree", () => {
    const asMulti = visibleWithDepots(["Durban"]);
    const asSelect = idsOf(
      applyTableControls(ROWS, {
        filters: [depotSelect],
        filterValues: { depot: { kind: "select", value: "Durban" } },
      }),
    );
    expect(asMulti).toEqual(asSelect);
  });

  it("a value nothing matches shows nothing, rather than everything", () => {
    expect(visibleWithDepots(["Nelspruit"])).toEqual([]);
  });
});

describe("multiSelect: the pieces a build session skips", () => {
  it("emptyFilterValue gives it an empty list, and emptyFilterValues maps it by key", () => {
    expect(emptyFilterValue(depotMulti)).toEqual({ kind: "multiSelect", values: [] });
    expect(emptyFilterValues([depotMulti, capturedRange])).toEqual({
      depot: { kind: "multiSelect", values: [] },
      captured: { kind: "dateRange", from: null, to: null },
    });
  });

  it("🔴 hasActiveControls is true ONLY when something is chosen (the `:88` else-branch trap)", () => {
    // Without a multiSelect arm this value falls into the dateRange branch and reads `.from` on an
    // object that has none: `undefined !== null` is TRUE, so "Clear" would sit permanently lit.
    expect(hasActiveControls("", { depot: { kind: "multiSelect", values: [] } })).toBe(false);
    expect(hasActiveControls("", { depot: { kind: "multiSelect", values: ["Durban"] } })).toBe(true);
  });

  it("derives its options exactly as a select does — the parameter widening is invisible", () => {
    expect(deriveSelectOptions(ROWS, depotMulti)).toEqual(deriveSelectOptions(ROWS, depotSelect));
  });

  it("takes fixed options when the definition supplies them", () => {
    const fixed: MultiSelectFilterDef<Row> = {
      ...depotMulti,
      options: [{ value: "Nelspruit", label: "Nelspruit" }],
    };
    expect(deriveSelectOptions(ROWS, fixed)).toEqual([{ value: "Nelspruit", label: "Nelspruit" }]);
  });

  it("🔴 a kind mismatch still returns every row and never throws — the saved-view safety net", () => {
    // A consumer restoring a view written before it adopted multi-select can hand a `select` VALUE to a
    // `multiSelect` DEFINITION. That must not crash a filter screen. Pinned deliberately so nobody
    // "tidies" the fall-through into a throw — but note it WIDENS, which is what filterValueFromStored
    // exists to prevent.
    const visible = applyTableControls(ROWS, {
      filters: [depotMulti],
      filterValues: { depot: { kind: "select", value: "Cape Town" } },
    });
    expect(idsOf(visible)).toEqual(["r1", "r2", "r3", "r4", "r5", "r6"]);
  });
});

// ---------------------------------------------------------------------------------------------
// THE STORED-SHAPE CONTRACT (§5.3) — the only half of the saved-views trap this package can fix
// ---------------------------------------------------------------------------------------------

describe("filterValueFromStored: reads both shapes, widens rather than narrows, never throws", () => {
  it("multiSelect + a bare string — the request's case, and it just works", () => {
    expect(filterValueFromStored(depotMulti, "Cape Town")).toEqual({
      value: { kind: "multiSelect", values: ["Cape Town"] },
      widened: false,
    });
  });

  it("multiSelect + an array keeps every usable value and drops the junk", () => {
    expect(filterValueFromStored(depotMulti, ["a", "b"]).value).toEqual({
      kind: "multiSelect",
      values: ["a", "b"],
    });
    expect(filterValueFromStored(depotMulti, ["a", "", 7, null, "b"]).value).toEqual({
      kind: "multiSelect",
      values: ["a", "b"],
    });
  });

  it("multiSelect + nothing readable is the All state", () => {
    for (const stored of [null, undefined, "", [], {}, 42, [""], [1, 2]]) {
      expect(filterValueFromStored(depotMulti, stored).value).toEqual({
        kind: "multiSelect",
        values: [],
      });
    }
  });

  it("select + a string is byte-identical to what it reads today", () => {
    expect(filterValueFromStored(depotSelect, "Cape Town")).toEqual({
      value: { kind: "select", value: "Cape Town" },
      widened: false,
    });
  });

  it("🔴 select + an array opens as All and REPORTS the widen — the cross-version case", () => {
    // An old build (or a screen that never adopted the new kind) reading a row that holds several
    // values. It cannot hold them, so it opens wider than the rep saved — and says so, which is the
    // hook a consumer needs to push a sentence into its own "dropped" notice.
    expect(filterValueFromStored(depotSelect, ["Cape Town", "Durban"])).toEqual({
      value: { kind: "select", value: null },
      widened: true,
    });
  });

  it("select + nothing readable is All, and no widen is claimed — nothing was stored to lose", () => {
    expect(filterValueFromStored(depotSelect, null)).toEqual({
      value: { kind: "select", value: null },
      widened: false,
    });
    expect(filterValueFromStored(depotSelect, "")).toEqual({
      value: { kind: "select", value: null },
      widened: false,
    });
  });

  it("dateRange always reads back cleared, and reports the widen when something was stored", () => {
    // `string | string[]` cannot express two bounds. A consumer that persists date ranges needs its own
    // shape for them; this contract carries the categorical kinds.
    expect(filterValueFromStored(capturedRange, "2026-08-01")).toEqual({
      value: { kind: "dateRange", from: null, to: null },
      widened: true,
    });
    expect(filterValueFromStored(capturedRange, null).widened).toBe(false);
    expect(filterValueFromStored(capturedRange, []).widened).toBe(false);
  });
});

describe("storedFromFilterValue: one value is a bare string, two or more is an array", () => {
  it("writes ONE chosen value as a bare string, so a build on an older pin reads it correctly", () => {
    expect(storedFromFilterValue({ kind: "multiSelect", values: ["Cape Town"] })).toBe("Cape Town");
  });

  it("writes two or more as an array — the only case that needs new reader code", () => {
    expect(storedFromFilterValue({ kind: "multiSelect", values: ["Cape Town", "Durban"] })).toEqual([
      "Cape Town",
      "Durban",
    ]);
  });

  it("writes null for All, which a consumer simply does not store", () => {
    expect(storedFromFilterValue({ kind: "multiSelect", values: [] })).toBeNull();
    expect(storedFromFilterValue({ kind: "select", value: null })).toBeNull();
    expect(storedFromFilterValue({ kind: "dateRange", from: "2026-08-01", to: null })).toBeNull();
  });

  it("writes a single-select exactly as it is written today", () => {
    expect(storedFromFilterValue({ kind: "select", value: "Cape Town" })).toBe("Cape Town");
  });

  it("round-trips every categorical case through both directions", () => {
    for (const values of [[], ["Cape Town"], ["Cape Town", "Durban"]]) {
      const stored = storedFromFilterValue({ kind: "multiSelect", values });
      expect(filterValueFromStored(depotMulti, stored).value).toEqual({
        kind: "multiSelect",
        values,
      });
    }
    const one = storedFromFilterValue({ kind: "select", value: "Durban" });
    expect(filterValueFromStored(depotSelect, one).value).toEqual({
      kind: "select",
      value: "Durban",
    });
  });

  it("🔴 a pre-change row opens showing THAT depot only — not everything", () => {
    // The exact regression the request forbids: `{"depot": "Cape Town"}` saved before the change, read
    // by a screen that has since declared the filter as multiSelect.
    const reading = filterValueFromStored(depotMulti, "Cape Town");
    const visible = applyTableControls(ROWS, {
      filters: [depotMulti],
      filterValues: { depot: reading.value },
    });
    expect(idsOf(visible)).toEqual(["r1", "r4"]);
    expect(reading.widened).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------
// THE PACKAGE BOUNDARY — reachable from the barrel, and reaching nothing of any app's
// ---------------------------------------------------------------------------------------------

describe("the new names are reachable from the package root, not only the deep file", () => {
  it("exports both helpers and every filter type from `src/index.ts`", async () => {
    const pkg = await import("../../src");
    expect(typeof pkg.filterValueFromStored).toBe("function");
    expect(typeof pkg.storedFromFilterValue).toBe("function");

    // The types are erased at runtime, so name them in a position that only compiles if they are
    // genuinely exported from the root barrel.
    const def: import("../../src").MultiSelectFilterDef<Row> = depotMulti;
    const value: import("../../src").MultiSelectFilterValue = { kind: "multiSelect", values: [] };
    const reading: import("../../src").StoredFilterReading = pkg.filterValueFromStored(def, "x");
    const anyDef: import("../../src").FilterDef<Row> = depotSelect;
    const anyValue: import("../../src").FilterValue = value;
    const option: import("../../src").SelectOption = { value: "a", label: "A" };
    expect([def.kind, value.kind, reading.widened, anyDef.kind, anyValue.kind, option.value]).toEqual(
      ["multiSelect", "multiSelect", false, "select", "multiSelect", "a"],
    );
  });
});

describe("the package still builds standalone — nothing here reaches into an app", () => {
  it("neither edited source imports an app path", () => {
    // ⚠ Resolved from the vitest root rather than from `import.meta.url` — under the `components`
    //   project's happy-dom transform that is not a `file:` URL (the wart CR-DESIGN-SYSTEM-002 hit too).
    for (const path of ["src/lib/table-controls.ts", "src/components/DataTableToolbar.tsx"]) {
      const source = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(source).not.toMatch(/from\s+["']@\//);
      expect(source).not.toMatch(/bananaworld-/);
    }
  });
});
