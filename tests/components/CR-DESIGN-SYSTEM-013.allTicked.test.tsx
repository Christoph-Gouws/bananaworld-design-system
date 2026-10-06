import { useState, type ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Imported FROM THE PACKAGE ROOT. A mode a consumer cannot reach from "@bananaworld/design-system"
// has not shipped, whatever the file on disk says.
import {
  DataTableToolbar,
  GridFilterRow,
  Table,
  TableBody,
  TableHeader,
  useTableControls,
  type FilterDef,
  type GridFilterValues,
} from "../../src";

// ============================================================================
// CR-DESIGN-SYSTEM-013 — "Select all" ticks every option, so the reader can untick what they do not want
// ============================================================================
// The owner (2026-10-06): "when you select all, it physically selects and makes a tick mark next to all
// the batches... because all have been selected you can actually go and deselect ones that you don't
// want to see." Driven the way a reader drives it — clicking and pressing keys — on BOTH surfaces that
// render a tick-list, and asserted on what the control EMITS and what the table then SHOWS.
//
// Approved layout B: the closed box counts ("2 of 3 batches"); the open list names what is hidden.

beforeAll(() => {
  // Radix reaches for these; happy-dom does not ship them.
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

// ⚠ An open Radix menu leaves `pointer-events: none` on the body; reset it so the next spec can click.
afterEach(() => {
  cleanup();
  document.body.style.pointerEvents = "";
});

function setup() {
  return userEvent.setup({ pointerEventsCheck: 0 });
}

const BATCHES = [
  { id: "b1", label: "SBF-001" },
  { id: "b2", label: "SBF-002" },
  { id: "b3", label: "SBF-003" },
];

const box = (name: string | RegExp): HTMLElement => screen.getByRole("menuitemcheckbox", { name });
const master = (): HTMLElement => box(/Select all/);
const ticks = (): readonly (string | null)[] =>
  BATCHES.map((b) => box(b.label).getAttribute("aria-checked"));

// ---------------------------------------------------------------------------------------------
// The grid's filter cell — what DC's report grid renders under every select column.
// ---------------------------------------------------------------------------------------------
function GridHarness({
  onChange = () => undefined,
  initial = {},
  selectAll = "allTicked",
}: {
  readonly onChange?: (v: GridFilterValues) => void;
  readonly initial?: GridFilterValues;
  readonly selectAll?: "master" | "allTicked";
}): ReactElement {
  const [values, setValues] = useState<GridFilterValues>(initial);
  return (
    <Table>
      <TableHeader>
        <GridFilterRow
          columns={[
            {
              key: "batch",
              kind: "select",
              multiple: true,
              selectAll,
              label: "Batch",
              placeholder: "All batches",
              options: BATCHES,
            },
          ]}
          values={values}
          onChange={(next) => {
            setValues(next);
            onChange(next);
          }}
        />
      </TableHeader>
      <TableBody />
    </Table>
  );
}

describe("the grid cell, selectAll 'allTicked' — the owner's three states", () => {
  it("🔴 STATE 1 — NOTHING NARROWED: every batch ticked, 'Select all' ticked, 'All 3'", async () => {
    const user = setup();
    render(<GridHarness />);
    const trigger = screen.getByLabelText("Filter by Batch");
    expect(trigger.textContent).toBe("All batches");
    expect(trigger.className).not.toContain("border-info");

    await user.click(trigger);
    expect((await screen.findByText("Nothing hidden")).textContent).toBe("Nothing hidden");
    expect(ticks()).toEqual(["true", "true", "true"]);
    expect(master().getAttribute("aria-checked")).toBe("true");
    expect(master().textContent).toBe("Select allAll 3");
  });

  it("🔴 STATE 2 — ONE UNTICKED: only that batch is hidden, stored as an EXCLUSION", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<GridHarness onChange={onChange} />);
    const trigger = screen.getByLabelText("Filter by Batch");
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "SBF-002" }));

    // 🔴 The ids HIDDEN, never the two still showing — a batch received tomorrow is not left out.
    expect(onChange).toHaveBeenLastCalledWith({
      batch: { kind: "select", value: "", excluded: ["b2"] },
    });
    expect(ticks()).toEqual(["true", "false", "true"]);
    expect(master().getAttribute("aria-checked")).toBe("mixed");
    expect(master().textContent).toBe("Select all2 of 3");
    expect(screen.getByText("Hidden: SBF-002")).toBeTruthy();
    // Layout B: the box counts.
    expect(trigger.textContent).toBe("2 of 3 batches");
    expect(trigger.className).toContain("border-info");
  });

  it("🔴 'Select all' RE-TICKS EVERYTHING — the key is dropped, nothing is narrowing", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<GridHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Batch"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "SBF-002" }));
    await user.click(master());

    expect(onChange).toHaveBeenLastCalledWith({});
    expect(ticks()).toEqual(["true", "true", "true"]);
    expect(master().textContent).toBe("Select allAll 3");
  });

  it("🔴 STATE 3 — 'SELECT ALL' UNTICKED: every tick clears, and the table still shows everything", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<GridHarness onChange={onChange} />);
    const trigger = screen.getByLabelText("Filter by Batch");
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Select all/ }));

    expect(ticks()).toEqual(["false", "false", "false"]);
    expect(master().getAttribute("aria-checked")).toBe("false");
    expect(master().textContent).toBe("Select all0 of 3");
    expect(screen.getByText("Nothing ticked — showing everything until you tick one")).toBeTruthy();
    // 🔴 Nothing is COMMITTED as "show nothing" (owner point 3): the filter is still everything.
    expect(onChange).toHaveBeenLastCalledWith({});
    expect(trigger.textContent).toBe("All batches");
    expect(trigger.className).not.toContain("border-info");
  });

  it("🔴 FROM STATE 3, TICKING A FEW NARROWS TO ONLY THOSE — today's include list, today's wording", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<GridHarness onChange={onChange} />);
    const trigger = screen.getByLabelText("Filter by Batch");
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Select all/ }));
    await user.click(box("SBF-003"));
    await user.click(box("SBF-001"));

    expect(onChange).toHaveBeenLastCalledWith({
      batch: { kind: "select", value: "b1", values: ["b1", "b3"] },
    });
    expect(ticks()).toEqual(["true", "false", "true"]);
    expect(screen.getByText("2 chosen")).toBeTruthy();
    expect(trigger.textContent).toBe("SBF-001+1");
  });

  it("the draft dies with the menu — reopening shows every box ticked, which is what the table shows", async () => {
    const user = setup();
    render(<GridHarness />);
    await user.click(screen.getByLabelText("Filter by Batch"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Select all/ }));
    expect(ticks()).toEqual(["false", "false", "false"]);

    await user.keyboard("{Escape}");
    await user.click(screen.getByLabelText("Filter by Batch"));
    await screen.findByRole("menuitemcheckbox", { name: /Select all/ });
    expect(ticks()).toEqual(["true", "true", "true"]);
  });

  it("🔴 KEYBOARD ONLY: open, arrow to a batch, Space unticks it — Radix, not a hand-rolled list", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<GridHarness onChange={onChange} />);
    screen.getByLabelText("Filter by Batch").focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menuitemcheckbox", { name: /Select all/ });
    // Select all → SBF-001 → SBF-002
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("SBF-002");
    await user.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith({
      batch: { kind: "select", value: "", excluded: ["b2"] },
    });
  });

  it("a RESTORED exclusion (a saved view, a shared link) opens exactly as it was left", async () => {
    const user = setup();
    render(
      <GridHarness initial={{ batch: { kind: "select", value: "", excluded: ["b1", "b3"] } }} />,
    );
    const trigger = screen.getByLabelText("Filter by Batch");
    expect(trigger.textContent).toBe("1 of 3 batches");
    await user.click(trigger);
    await screen.findByText("Hidden: SBF-001, SBF-003");
    expect(ticks()).toEqual(["false", "true", "false"]);
  });

  it("🔴 A CELL THAT DOES NOT ASK FOR IT IS UNCHANGED — the 'master' default still shows no ticks", async () => {
    const user = setup();
    render(<GridHarness selectAll="master" />);
    await user.click(screen.getByLabelText("Filter by Batch"));
    expect(await screen.findByText("None chosen")).toBeTruthy();
    expect(ticks()).toEqual(["false", "false", "false"]);
  });
});

// ---------------------------------------------------------------------------------------------
// The toolbar's tick-list — the same list, driven against real rows, so the TABLE is asserted.
// ---------------------------------------------------------------------------------------------
interface Lot {
  readonly id: string;
  readonly batch: string | null;
}
const LOTS: readonly Lot[] = [
  { id: "1", batch: "SBF-001" },
  { id: "2", batch: "SBF-002" },
  { id: "3", batch: "SBF-003" },
  { id: "4", batch: null },
];
const batchAllTicked: FilterDef<Lot> = {
  kind: "multiSelect",
  key: "batch",
  label: "Batches",
  accessor: (l) => l.batch,
  selectAll: "allTicked",
};

function ToolbarHarness(): ReactElement {
  const controls = useTableControls(LOTS, { filters: [batchAllTicked] });
  return (
    <div>
      <DataTableToolbar controls={controls} />
      <ul aria-label="rows">
        {controls.visible.map((l) => (
          <li key={l.id}>{l.batch ?? "—"}</li>
        ))}
      </ul>
    </div>
  );
}
const rows = (): readonly string[] =>
  Array.from(screen.getByRole("list", { name: "rows", hidden: true }).querySelectorAll("li")).map(
    (li) => li.textContent ?? "",
  );

describe("the toolbar, selectAll 'allTicked' — what the TABLE shows", () => {
  it("🔴 UNTICKING ONE BATCH HIDES ONLY THAT BATCH — and the row with no batch stays (owner point 2)", async () => {
    const user = setup();
    render(<ToolbarHarness />);
    const trigger = screen.getByLabelText("Filter by Batches");
    expect(trigger.textContent).toBe("All batches");
    await user.click(trigger);
    expect(ticks()).toEqual(["true", "true", "true"]);
    await user.click(box("SBF-002"));

    expect(rows()).toEqual(["SBF-001", "SBF-003", "—"]);
    expect(trigger.textContent).toBe("2 of 3 batches");
    expect(screen.getByText("Hidden: SBF-002")).toBeTruthy();
    // ⚠ An open menu aria-hides the page; close it before asking about "Clear".
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /Clear/ })).toBeTruthy();
  });

  it("'Select all' puts every row back", async () => {
    const user = setup();
    render(<ToolbarHarness />);
    await user.click(screen.getByLabelText("Filter by Batches"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "SBF-002" }));
    await user.click(master());
    expect(rows()).toEqual(["SBF-001", "SBF-002", "SBF-003", "—"]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: /Clear/ })).toBeNull();
  });

  it("🔴 UNTICKING 'SELECT ALL' CLEARS EVERY TICK BUT NOT THE TABLE; ticking one then shows only it", async () => {
    const user = setup();
    render(<ToolbarHarness />);
    await user.click(screen.getByLabelText("Filter by Batches"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Select all/ }));

    expect(ticks()).toEqual(["false", "false", "false"]);
    expect(rows()).toEqual(["SBF-001", "SBF-002", "SBF-003", "—"]);

    await user.click(box("SBF-003"));
    expect(rows()).toEqual(["SBF-003"]);
  });

  it("a toolbar def that does not ask for it still renders today's 'All batches' row", async () => {
    function Plain(): ReactElement {
      const controls = useTableControls(LOTS, {
        filters: [{ kind: "multiSelect", key: "batch", label: "Batches", accessor: (l: Lot) => l.batch }],
      });
      return <DataTableToolbar controls={controls} />;
    }
    const user = setup();
    render(<Plain />);
    await user.click(screen.getByLabelText("Filter by Batches"));
    const items = await screen.findAllByRole("menuitemcheckbox");
    expect(items[0]?.textContent).toBe("All batches");
    expect(ticks()).toEqual(["false", "false", "false"]);
  });
});
