import type { ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTableToolbar, useTableControls } from "../../src/components/DataTableToolbar";
import type { FilterDef } from "../../src/lib/table-controls";

// CR-DESIGN-SYSTEM-003 — the additive proof, per call site, not sampled.
//
// 🔴 THE SNAPSHOTS IN THIS FILE WERE TAKEN BEFORE A LINE OF SOURCE CHANGED (plan D-11 / §8.2 spec 14).
// Eleven call sites across three apps pin this package by git sha; the seven that render this toolbar
// are reproduced below with the filter kinds and labels the plan's §1.1 inventory recorded for them,
// and every one is snapshotted. A snapshot that moves after the multi-select lands is not a snapshot
// to update — it is the additive claim failing.
//
// ⚠ PROVENANCE, STATED PLAINLY: the declarations below are transcribed from the approved plan's
// inventory (§1.1), which read the consumer sources at plan time. Bananaworld-DC, -CRM and -org-admin
// are NOT checked out in this sandboxed worktree and cannot be read or run from here — the same
// limitation CR-DESIGN-SYSTEM-001 and -002 both recorded. The FILTER KINDS AND COUNTS are the load-
// bearing part and they are exact; each `key` and the date-range `label` are representative, because
// the toolbar's rendering depends on the kind, not on the string.

beforeAll(() => {
  // Radix Select reaches for these; happy-dom does not ship them.
  globalThis.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as never;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(cleanup);

interface Row {
  readonly id: string;
  readonly a: string | null;
  readonly b: string | null;
  readonly c: string | null;
  readonly d: string | null;
  readonly e: string | null;
  readonly day: string | null;
}

const ROWS: readonly Row[] = [
  { id: "1", a: "Alpha", b: "Open", c: "Yes", d: "Small", e: "Red", day: "2026-08-01" },
  { id: "2", a: "Bravo", b: "Closed", c: "No", d: "Large", e: "Green", day: "2026-08-09" },
];

function select(key: string, label: string, accessor: (row: Row) => string | null): FilterDef<Row> {
  return { kind: "select", key, label, accessor };
}
function dateRange(key: string, label: string): FilterDef<Row> {
  return { kind: "dateRange", key, label, accessor: (row) => row.day };
}

// The seven screens that render this toolbar today (plan §1.1). None declares a multi-select, and
// none is edited by this change.
const SCREENS: ReadonlyArray<{
  readonly name: string;
  readonly filters: readonly FilterDef<Row>[];
  readonly selects: number;
  readonly ranges: number;
}> = [
  {
    name: "DC · PurchaseOrdersView — 3 select + 1 dateRange",
    filters: [
      select("farm", "Farm", (r) => r.a),
      select("status", "Status", (r) => r.b),
      select("received", "Received", (r) => r.c),
      dateRange("ordered", "Ordered"),
    ],
    selects: 3,
    ranges: 1,
  },
  {
    name: "DC · ReceiptsView — 2 select + 1 dateRange",
    filters: [
      select("farm", "Farm", (r) => r.a),
      select("status", "Status", (r) => r.b),
      dateRange("received", "Received"),
    ],
    selects: 2,
    ranges: 1,
  },
  {
    name: "DC · ReturnsView — 1 select + 1 dateRange",
    filters: [select("customer", "Customer", (r) => r.a), dateRange("returned", "Returned")],
    selects: 1,
    ranges: 1,
  },
  {
    name: "DC · SalesOrdersView — 2 select + 1 dateRange",
    filters: [
      select("customer", "Customer", (r) => r.a),
      select("status", "Status", (r) => r.b),
      dateRange("ordered", "Ordered"),
    ],
    selects: 2,
    ranges: 1,
  },
  {
    name: "DC · ConversionsView — 1 select + 1 dateRange",
    filters: [select("recipe", "Recipe", (r) => r.a), dateRange("converted", "Converted")],
    selects: 1,
    ranges: 1,
  },
  {
    name: "DC · StockAdjustmentView — 2 select + 1 dateRange",
    filters: [
      select("type", "Type", (r) => r.a),
      select("by", "By", (r) => r.b),
      dateRange("adjusted", "Adjusted"),
    ],
    selects: 2,
    ranges: 1,
  },
  {
    name: "CRM · AvailabilityView — 5 select, no dateRange",
    filters: [
      select("size", "Size", (r) => r.d),
      select("grade", "Grade", (r) => r.b),
      select("boxType", "Box type", (r) => r.c),
      select("depot", "Depot", (r) => r.a),
      select("colour", "Colour", (r) => r.e),
    ],
    selects: 5,
    ranges: 0,
  },
];

// Indexed access is checked in this repo, so reach a screen by its name rather than by a bare index.
function screenFilters(prefix: string): readonly FilterDef<Row>[] {
  const found = SCREENS.find((s) => s.name.startsWith(prefix));
  if (found === undefined) throw new Error(`No screen recorded for ${prefix}`);
  return found.filters;
}

function Harness({
  filters,
  withSearch = true,
}: {
  readonly filters: readonly FilterDef<Row>[];
  readonly withSearch?: boolean;
}) {
  const controls = useTableControls(ROWS, {
    filters,
    getSearchText: withSearch ? (row) => row.id : undefined,
  });
  return <DataTableToolbar controls={controls} />;
}

describe("the seven screens that render this toolbar today render unchanged (§8.2 spec 14)", () => {
  for (const screenDef of SCREENS) {
    it(`${screenDef.name} — DOM is byte-identical to the pre-change snapshot`, () => {
      const { container } = render(<Harness filters={screenDef.filters} />);
      expect(container.innerHTML).toMatchSnapshot();
    });

    it(`${screenDef.name} — one trigger per select, both inputs per range, no Clear`, () => {
      render(<Harness filters={screenDef.filters} />);
      expect(screen.getAllByRole("combobox")).toHaveLength(screenDef.selects);
      for (const def of screenDef.filters) {
        if (def.kind === "select") {
          expect(screen.getByLabelText(`Filter by ${def.label}`)).toBeDefined();
          // The closed trigger reads the "All …" sentinel, lower-cased, exactly as it does today.
          expect(screen.getByLabelText(`Filter by ${def.label}`).textContent).toBe(
            `All ${def.label.toLowerCase()}`,
          );
        } else {
          expect(screen.getByLabelText(`${def.label} from`)).toBeDefined();
          expect(screen.getByLabelText(`${def.label} to`)).toBeDefined();
        }
      }
      expect(screen.queryAllByRole("textbox", { name: /from|to/ })).toHaveLength(0);
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });
  }
});

describe("a screen that declares nothing new gains nothing (§8.2 spec 15)", () => {
  it("renders no menu trigger, no checkbox item and no empty-valued attribute", () => {
    const { container } = render(<Harness filters={screenFilters("DC · PurchaseOrdersView")} />);
    // Assert ABSENCE, not emptiness — the ChoiceGroup rule from CR-DESIGN-SYSTEM-001. Every marker
    // the multi-select control introduces must be missing outright, not present-but-blank.
    expect(container.querySelectorAll("[aria-haspopup]")).toHaveLength(0);
    expect(screen.queryAllByRole("menuitemcheckbox")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("multiSelect");
    expect(container.innerHTML).not.toContain("chosen");
    expect(container.querySelectorAll("[data-multi-select]")).toHaveLength(0);
  });

  it("renders the search box and only the search box when no filter is declared", () => {
    render(<Harness filters={[]} />);
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeDefined();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("omits the search box entirely when the screen supplies no getSearchText", () => {
    render(<Harness filters={screenFilters("DC · ReturnsView")} withSearch={false} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});

describe("Clear appears only once something is active, and clears it", () => {
  it("appears when the operator types, and disappears again once cleared", async () => {
    const user = userEvent.setup();
    render(<Harness filters={screenFilters("DC · ReturnsView")} />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "2");
    const clear = screen.getByRole("button", { name: "Clear" });

    await user.click(clear);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    expect((screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement).value).toBe("");
  });

  it("appears when a date bound is set", async () => {
    const user = userEvent.setup();
    render(<Harness filters={screenFilters("DC · ReturnsView")} />);
    await user.type(screen.getByLabelText("Returned from"), "2026-08-05");
    expect(screen.getByRole("button", { name: "Clear" })).toBeDefined();
  });
});

// ---------------------------------------------------------------------------------------------
// THE NEW CONTROL — a screen that DOES declare a multi-select (§8.2 specs 16–19)
// ---------------------------------------------------------------------------------------------

const DEPOTS: readonly Row[] = [
  { id: "1", a: "Cape Town", b: "", c: "", d: "", e: "", day: null },
  { id: "2", a: "Durban", b: "", c: "", d: "", e: "", day: null },
  { id: "3", a: "Johannesburg", b: "", c: "", d: "", e: "", day: null },
  { id: "4", a: null, b: "", c: "", d: "", e: "", day: null },
];

const depotMulti: FilterDef<Row> = {
  kind: "multiSelect",
  key: "depot",
  label: "Depots",
  accessor: (row) => row.a,
};

// Renders the toolbar plus the rows it leaves visible, so a spec can assert what the rep would see.
function MultiHarness(): ReactElement {
  const controls = useTableControls(DEPOTS, { filters: [depotMulti] });
  return (
    <div>
      <DataTableToolbar controls={controls} />
      <ul aria-label="rows">
        {controls.visible.map((row) => (
          <li key={row.id}>{row.a ?? "—"}</li>
        ))}
      </ul>
    </div>
  );
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: "Filter by Depots" });
}
function visibleRows(): string[] {
  return Array.from(document.querySelectorAll('[aria-label="rows"] li')).map(
    (li) => li.textContent ?? "",
  );
}

describe("the multi-select control (§8.2 spec 16)", () => {
  it("opens on Enter and lists every option as a checkbox item, plus the All row", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.tab();
    expect(document.activeElement).toBe(trigger());

    await user.keyboard("{Enter}");
    const items = await screen.findAllByRole("menuitemcheckbox");
    expect(items.map((i) => i.textContent)).toEqual([
      "All depots",
      "Cape Town",
      "Durban",
      "Johannesburg",
    ]);
  });

  it("checks the All row — and only the All row — while nothing is chosen", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.click(trigger());
    const items = await screen.findAllByRole("menuitemcheckbox");
    expect(items.map((i) => i.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
  });

  it("derives its options from the data and skips the rows that have no value", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.click(trigger());
    expect(screen.queryByRole("menuitemcheckbox", { name: "—" })).toBeNull();
  });
});

describe("keyboard-only selection and clearing (§8.2 specs 17–18)", () => {
  it("🔴 ticks with Space and THE MENU STAYS OPEN across several toggles", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findAllByRole("menuitemcheckbox");

    // Focus lands on the first item (the All row); one ↓ reaches Cape Town.
    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");

    // If the menu had closed here, this query would find nothing — which is exactly the failure D-5
    // guards against: without onSelect preventDefault the rep re-opens the menu for every value.
    const stillOpen = screen.getAllByRole("menuitemcheckbox");
    expect(stillOpen).toHaveLength(4);
    expect(visibleRows()).toEqual(["Cape Town"]);

    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(4);
    expect(visibleRows()).toEqual(["Cape Town", "Durban"]);

    // …and Space again unticks the one under the cursor.
    await user.keyboard(" ");
    expect(visibleRows()).toEqual(["Cape Town"]);
  });

  it("closes on Escape and puts focus back on the trigger", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findAllByRole("menuitemcheckbox");

    await user.keyboard("{Escape}");
    expect(screen.queryAllByRole("menuitemcheckbox")).toHaveLength(0);
    expect(document.activeElement).toBe(trigger());
  });

  it("clears everything from the keyboard, via the All row", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findAllByRole("menuitemcheckbox");
    await user.keyboard("{ArrowDown} {ArrowDown} ");
    expect(visibleRows()).toEqual(["Cape Town", "Durban"]);

    // Back up to the All row and tick it: everything empties, and the row set widens back to all four.
    await user.keyboard("{ArrowUp}{ArrowUp} ");
    expect(visibleRows()).toEqual(["Cape Town", "Durban", "Johannesburg", "—"]);
    expect(screen.getAllByRole("menuitemcheckbox")[0]?.getAttribute("aria-checked")).toBe("true");
  });

  it("the toolbar's own Clear empties a multi-select too", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.click(trigger());
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Durban" }));
    expect(visibleRows()).toEqual(["Durban"]);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(visibleRows()).toEqual(["Cape Town", "Durban", "Johannesburg", "—"]);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("🔴 Clear is NOT lit while nothing is chosen — the hasActiveControls trap, at the UI", async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await user.click(trigger());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });
});

describe("the closed trigger reads layout A: first chosen, then how many more (§8.2 spec 19)", () => {
  async function chooseThenClose(names: readonly string[]): Promise<void> {
    const user = userEvent.setup();
    render(<MultiHarness />);
    if (names.length > 0) {
      await user.click(trigger());
      for (const name of names) {
        await user.click(await screen.findByRole("menuitemcheckbox", { name }));
      }
      await user.keyboard("{Escape}");
    }
  }

  it("nothing chosen reads exactly what a single-select reads — All depots", async () => {
    await chooseThenClose([]);
    expect(trigger().textContent).toBe("All depots");
  });

  it("one chosen names it, with no count at all", async () => {
    await chooseThenClose(["Durban"]);
    expect(trigger().textContent).toBe("Durban");
  });

  it("several chosen names the first and counts the rest — Cape Town +1", async () => {
    await chooseThenClose(["Durban", "Cape Town"]);
    // "First" is first in the DISPLAYED option order, not in tick order — Cape Town was ticked second
    // and still reads first, so the trigger does not shuffle under the rep.
    expect(trigger().textContent).toBe("Cape Town+1");
  });

  it("all chosen still reads as several, never as All", async () => {
    await chooseThenClose(["Cape Town", "Durban", "Johannesburg"]);
    expect(trigger().textContent).toBe("Cape Town+2");
    expect(trigger().textContent).not.toContain("All");
  });
});

// ---------------------------------------------------------------------------------------------
// CR-DESIGN-SYSTEM-009 — the tick-list's TOP ROW became a choice, and the default did not move.
//
// 🔴 THE EXTRACTION IS ALREADY PROVEN ABOVE, not here. `multiSelectTriggerLabel` and
//    `MultiSelectItem` moved out of this file into `MultiSelectMenu.tsx` so the grid's filter cell
//    could render the same parts; the seven-screen DOM snapshot at the top of this file is what
//    says the move changed nothing — it compares whole markup, character for character, including
//    class ORDER. These specs cover only the one thing the move ADDED: an opt-in top row.
// ---------------------------------------------------------------------------------------------

// Declared as its own literal rather than spread from `depotMulti`: that constant is typed as the
// FilterDef union, and spreading it widens back to the union before `selectAll` can be attached.
const depotMultiMaster: FilterDef<Row> = {
  kind: "multiSelect",
  key: "depot",
  label: "Depots",
  accessor: (row) => row.a,
  selectAll: "master",
};

function MasterHarness(): ReactElement {
  const controls = useTableControls(DEPOTS, { filters: [depotMultiMaster] });
  return (
    <div>
      <DataTableToolbar controls={controls} />
      <ul aria-label="rows">
        {controls.visible.map((row) => (
          <li key={row.id}>{row.a ?? "—"}</li>
        ))}
      </ul>
    </div>
  );
}

describe('selectAll: "master" — the same menu, the owner\'s new top row', () => {
  it('🔴 THE DEFAULT IS UNTOUCHED: a def that says nothing still renders "All depots"', async () => {
    const user = userEvent.setup();
    render(<MultiHarness />);
    await user.click(trigger());
    const items = await screen.findAllByRole("menuitemcheckbox");
    expect(items[0]?.textContent).toBe("All depots");
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
  });

  it('"master" swaps that one row for the tri-state "Select all", and nothing else moves', async () => {
    const user = userEvent.setup();
    render(<MasterHarness />);
    await user.click(trigger());
    const items = await screen.findAllByRole("menuitemcheckbox");
    // Same options, same order, same count — only the first row's wording and behaviour differ.
    expect(items.map((i) => i.textContent)).toEqual([
      "Select all0 of 3",
      "Cape Town",
      "Durban",
      "Johannesburg",
    ]);
    expect(items[0]?.getAttribute("aria-checked")).toBe("false");
  });

  it("🔴 READS 'mixed' WHILE ONLY SOME ARE CHOSEN, and takes everything on the next tap", async () => {
    const user = userEvent.setup();
    render(<MasterHarness />);
    await user.click(trigger());
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Durban" }));

    const master = (): HTMLElement =>
      screen.getByRole("menuitemcheckbox", { name: /Select all/ });
    expect(master().getAttribute("aria-checked")).toBe("mixed");
    expect(master().textContent).toBe("Select all1 of 3");

    await user.click(master());
    expect(master().getAttribute("aria-checked")).toBe("true");
    expect(visibleRows()).toEqual(["Cape Town", "Durban", "Johannesburg"]);

    // …and once more clears it, so "Select all" and "Clear" are ONE row rather than two.
    await user.click(master());
    expect(master().getAttribute("aria-checked")).toBe("false");
    expect(visibleRows()).toEqual(["Cape Town", "Durban", "Johannesburg", "—"]);
  });

  it("the trigger's wording is UNCHANGED by the new top row — the count rides the list, not the box", async () => {
    // OQ-1: every mockup the owner approved shows the closed box reading "Cape Town +2". Changing it
    // would move shipped CRM and DC toolbars, so the master row carries the denominator instead.
    const user = userEvent.setup();
    render(<MasterHarness />);
    await user.click(trigger());
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "Durban" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Cape Town" }));
    await user.keyboard("{Escape}");
    expect(trigger().textContent).toBe("Cape Town+1");
  });
});
