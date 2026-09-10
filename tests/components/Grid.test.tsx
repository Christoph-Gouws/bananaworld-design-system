import { useState, type ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Imported FROM THE PACKAGE ROOT. A control a consumer cannot reach from "@bananaworld/
// design-system" has not shipped, whatever the file on disk says.
import {
  GridFilterRow,
  GridGroupStrip,
  GridHeadCell,
  GRID_COLUMN_MIME,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  gridDraggedColumn,
  gridGroupHint,
  gridSigmaSummary,
  type GridFilterValues,
  type GridGroupChipView,
  type GridSort,
} from "../../src";

// CR-DESIGN-SYSTEM-008 — the four grid controls, driven the way a reader drives them.
//
// 🔴 A SOURCE SCAN CANNOT SEE A CONTROL THAT DOES NOT WORK. Every mechanic here is exercised by
//    clicking, typing or dragging, and asserted on what the control EMITS.

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

// ⚠ THE BODY RESET IS NOT TIDINESS. A spec that ends with a Radix menu still open leaves
//   `pointer-events: none` on the body, and every click in the NEXT spec is silently swallowed.
afterEach(() => {
  cleanup();
  document.body.style.pointerEvents = "";
  vi.useRealTimers();
});

/** ⚠ Radix sets `pointer-events: none` on the body while a menu is open; user-event then refuses. */
function setup() {
  return userEvent.setup({ pointerEventsCheck: 0 });
}

const COLUMNS = [
  { key: "batch", label: "Batch" },
  { key: "item", label: "Item" },
  { key: "units", label: "Units", tag: "sums" },
  { key: "farm", label: "Farm" },
] as const;

// ---------------------------------------------------------------------------
// GridHeadCell
// ---------------------------------------------------------------------------

function HeadHarness({
  onSort,
  onColumnDropped,
  sorts = [],
  grouped = false,
}: {
  readonly onSort?: (additive: boolean) => void;
  readonly onColumnDropped?: (key: string) => void;
  readonly sorts?: readonly GridSort[];
  readonly grouped?: boolean;
}): ReactElement {
  const [visible, setVisible] = useState<readonly string[]>(["batch", "item", "units"]);
  const [pinned, setPinned] = useState(false);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <GridHeadCell
            columnKey="item"
            label="Item"
            sortDir={sorts.find((s) => s.key === "item")?.dir ?? null}
            sortPosition={sorts.length > 1 ? 2 : null}
            grouped={grouped}
            pinned={pinned}
            onSort={onSort}
            onColumnDropped={onColumnDropped}
            menu={{
              canGroup: true,
              canHide: visible.length > 1,
              columns: COLUMNS.map((c) => ({
                key: c.key,
                label: c.label,
                visible: visible.includes(c.key),
                tag: "tag" in c ? c.tag : undefined,
              })),
              onSortDir: () => undefined,
              onGroupBy: () => undefined,
              onTogglePin: () => setPinned((p) => !p),
              onHide: () => setVisible((v) => v.filter((k) => k !== "item")),
              onToggleColumn: (key) =>
                setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key])),
              onResetColumns: () => setVisible(["batch", "item", "units"]),
            }}
          />
        </TableRow>
      </TableHeader>
      <TableBody />
    </Table>
  );
}

describe("GridHeadCell — the header IS the sort control", () => {
  it("reports a plain click and a shift-click differently", async () => {
    const user = setup();
    const onSort = vi.fn();
    render(<HeadHarness onSort={onSort} />);

    await user.click(screen.getByRole("button", { name: "Item" }));
    expect(onSort).toHaveBeenLastCalledWith(false);

    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("button", { name: "Item" }));
    await user.keyboard("{/Shift}");
    expect(onSort).toHaveBeenLastCalledWith(true);
  });

  it("states its direction in `aria-sort`, so the arrow is not the only signal", () => {
    render(<HeadHarness sorts={[{ key: "item", dir: "desc" }]} />);
    expect(screen.getByRole("columnheader").getAttribute("aria-sort")).toBe("descending");
  });

  it("🔴 SHOWS THE ORDER MARKER ONLY WHEN THERE IS AN ORDER TO READ (OD-RP-9)", () => {
    const single = render(<HeadHarness sorts={[{ key: "item", dir: "asc" }]} />);
    expect(single.queryByText("2")).toBeNull();
    single.unmount();

    render(
      <HeadHarness
        sorts={[
          { key: "batch", dir: "asc" },
          { key: "item", dir: "asc" },
        ]}
      />,
    );
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("says so, and stops being draggable, when its column is one of the grouping levels", () => {
    render(<HeadHarness grouped />);
    expect(screen.getByRole("columnheader").getAttribute("draggable")).toBe("false");
    expect(screen.getByTitle("Grouped by Item")).toBeTruthy();
  });

  it("carries the column key on a drag, and reports a column dropped onto it", () => {
    const onColumnDropped = vi.fn();
    render(<HeadHarness onColumnDropped={onColumnDropped} />);
    const th = screen.getByRole("columnheader");
    const store = new Map<string, string>();
    const dataTransfer = {
      setData: (f: string, v: string) => store.set(f, v),
      getData: (f: string) => store.get(f) ?? "",
    };

    fireEvent.dragStart(th, { dataTransfer });
    expect(store.get(GRID_COLUMN_MIME)).toBe("item");

    // A DIFFERENT column dropped onto this one reorders; this one dropped onto itself does nothing.
    store.set(GRID_COLUMN_MIME, "batch");
    fireEvent.dragOver(th, { dataTransfer });
    fireEvent.drop(th, { dataTransfer });
    expect(onColumnDropped).toHaveBeenCalledWith("batch");

    onColumnDropped.mockClear();
    store.set(GRID_COLUMN_MIME, "item");
    fireEvent.drop(th, { dataTransfer });
    expect(onColumnDropped).not.toHaveBeenCalled();
  });
});

describe("GridHeaderMenu — one menu, two ways in", () => {
  it("opens from the ⋯ and offers sort, group, pin, hide and the whole checklist", async () => {
    const user = setup();
    render(<HeadHarness />);
    await user.click(screen.getByRole("button", { name: "Item column menu" }));

    expect(await screen.findByRole("menuitem", { name: /Sort A → Z/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Sort Z → A/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Group by this column/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Pin to the left/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Hide this column/ })).toBeTruthy();
    expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(4);
    expect(screen.getByText("3 of 4 showing")).toBeTruthy();
  });

  it("🔴 RIGHT-CLICKING THE HEADER OPENS THE SAME MENU", async () => {
    render(<HeadHarness />);
    fireEvent.contextMenu(screen.getByRole("columnheader"));
    expect(await screen.findByText("Columns on this report")).toBeTruthy();
  });

  it("STAYS OPEN while columns are ticked — four columns is four clicks, not four re-openings", async () => {
    const user = setup();
    render(<HeadHarness />);
    await user.click(screen.getByRole("button", { name: "Item column menu" }));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /^Farm$/ }));
    await waitFor(() => expect(screen.getByText("4 of 4 showing")).toBeTruthy());
    // Still open, so the next tick needs no re-opening.
    await user.click(screen.getByRole("menuitemcheckbox", { name: /^Batch$/ }));
    await waitFor(() => expect(screen.getByText("3 of 4 showing")).toBeTruthy());
  });

  it("the checklist SEARCHES, and says so when nothing matches", async () => {
    const user = setup();
    render(<HeadHarness />);
    await user.click(screen.getByRole("button", { name: "Item column menu" }));
    await user.type(await screen.findByLabelText("Search columns"), "ba");
    await waitFor(() => expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(1));
    await user.clear(screen.getByLabelText("Search columns"));
    await user.type(screen.getByLabelText("Search columns"), "zzz");
    expect(await screen.findByText("No column matches that.")).toBeTruthy();
  });

  it("⚠ the search is scoped to ONE opening — a reopened menu never shows a filtered list as the whole list", async () => {
    const user = setup();
    render(<HeadHarness />);
    const trigger = screen.getByRole("button", { name: "Item column menu" });
    await user.click(trigger);
    await user.type(await screen.findByLabelText("Search columns"), "ba");
    await waitFor(() => expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(1));

    await user.keyboard("{Escape}");
    await user.click(trigger);
    await waitFor(() => expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(4));
  });
});

// ---------------------------------------------------------------------------
// GridFilterRow
// ---------------------------------------------------------------------------

function FilterHarness({
  onChange,
  debounceMs = 20,
}: {
  readonly onChange: (v: GridFilterValues) => void;
  readonly debounceMs?: number;
}): ReactElement {
  const [values, setValues] = useState<GridFilterValues>({});
  return (
    <Table>
      <TableHeader>
        <GridFilterRow
          debounceMs={debounceMs}
          columns={[
            { key: "batch", kind: "text", label: "Batch", placeholder: "Contains…" },
            {
              key: "item",
              kind: "select",
              label: "Item",
              placeholder: "All items",
              options: [
                { id: "big", label: "Cavendish 18.5 kg" },
                { id: "small", label: "Cavendish 13.0 kg" },
              ],
            },
            {
              key: "units",
              kind: "numberMin",
              label: "Units",
              align: "right",
              placeholder: "≥ min",
            },
            { key: "packDate", kind: "dateRange", label: "Farm packed", placeholder: "Any date" },
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

describe("GridFilterRow — one cell per column, under the headers", () => {
  it("renders the control each column's kind declares", () => {
    render(<FilterHarness onChange={() => undefined} />);
    expect(screen.getByLabelText("Filter by Batch").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Filter by Units").getAttribute("type")).toBe("number");
    expect(screen.getByLabelText("Filter by Item").tagName).toBe("BUTTON");
    expect(screen.getByLabelText("Filter by Farm packed").tagName).toBe("BUTTON");
  });

  it("🔴 DEBOUNCES A TYPED VALUE — one emission for many keystrokes", async () => {
    const onChange = vi.fn();
    render(<FilterHarness onChange={onChange} />);
    const box = screen.getByLabelText("Filter by Batch");
    for (const value of ["M", "MB", "MB-", "MB-2"]) {
      fireEvent.change(box, { target: { value } });
    }
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ batch: { kind: "text", value: "MB-2" } });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("🔴 EMITS THE WHOLE STATE, NEVER A PATCH", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<FilterHarness onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Filter by Batch"), { target: { value: "MB" } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    await user.click(screen.getByLabelText("Filter by Item"));
    await user.click(await screen.findByRole("menuitem", { name: "Cavendish 13.0 kg" }));
    expect(onChange).toHaveBeenLastCalledWith({
      batch: { kind: "text", value: "MB" },
      item: { kind: "select", value: "small" },
    });
  });

  it("🔴 A CLEARED FILTER IS A DROPPED KEY, not a key holding an empty string", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<FilterHarness onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Filter by Batch"), { target: { value: "MB" } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "Clear the Batch filter" }));
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("a date cell carries its own two bounds, which is NOT the report's own range", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<FilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Farm packed"));
    fireEvent.change(await screen.findByLabelText("Farm packed from"), {
      target: { value: "2026-08-01" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      packDate: { kind: "dateRange", from: "2026-08-01", to: null },
    });
  });

  it("a select with no options renders disabled rather than empty", () => {
    render(
      <Table>
        <TableHeader>
          <GridFilterRow
            columns={[{ key: "room", kind: "select", label: "Room", placeholder: "All rooms" }]}
            values={{}}
            onChange={() => undefined}
          />
        </TableHeader>
        <TableBody />
      </Table>,
    );
    expect((screen.getByLabelText("Filter by Room") as HTMLButtonElement).disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GridFilterRow — a select cell holding SEVERAL values (CR-DESIGN-SYSTEM-009 §A)
//
// 🔴 DRIVEN BY TICKING, NOT BY INSPECTING PROPS. The owner's complaint was "I can only select one
//    item at a time" — so every spec here ticks, and asserts what the cell EMITS and what the reader
//    can still see afterwards.
// ---------------------------------------------------------------------------

const ROOMS = [
  { id: "cold-1", label: "Cold room 1" },
  { id: "cold-2", label: "Cold room 2" },
  { id: "ripening-3", label: "Ripening room 3" },
];

function MultiFilterHarness({
  onChange,
  options = ROOMS,
  initial = {},
}: {
  readonly onChange: (v: GridFilterValues) => void;
  readonly options?: readonly { readonly id: string; readonly label: string }[];
  /** The state a saved view or a URL restores INTO the row — which is the only way an id the options
   *  no longer offer can get here (CR-DESIGN-SYSTEM-010 F1). */
  readonly initial?: GridFilterValues;
}): ReactElement {
  const [values, setValues] = useState<GridFilterValues>(initial);
  return (
    <Table>
      <TableHeader>
        <GridFilterRow
          columns={[
            { key: "room", kind: "select", multiple: true, label: "Room", placeholder: "All rooms", options },
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

describe("a multi-value select cell — the owner can tick several rooms at once", () => {
  it("🔴 STAYS OPEN ACROSS SEVERAL TICKS — three rooms is three clicks, not three re-openings", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);

    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    // The menu is STILL OPEN — this is the one Radix gotcha the whole change turns on.
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Ripening room 3/ }));

    expect(onChange).toHaveBeenLastCalledWith({
      room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-2", "ripening-3"] },
    });
  });

  it("🔴 ONE TICK EMITS THE ONE-VALUE SHAPE, byte for byte what a single-select cell emits", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    expect(onChange).toHaveBeenLastCalledWith({ room: { kind: "select", value: "cold-2" } });
  });

  it("keeps the ids in DISPLAYED order however they were ticked", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Ripening room 3/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    expect(onChange).toHaveBeenLastCalledWith({
      room: { kind: "select", value: "cold-1", values: ["cold-1", "ripening-3"] },
    });
  });

  it("un-ticking narrows back down, and the LAST un-tick drops the key entirely", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    expect(onChange).toHaveBeenLastCalledWith({ room: { kind: "select", value: "cold-2" } });
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    // 🔴 A CLEARED FILTER IS A DROPPED KEY — the same one empty state the row has always had.
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});

// ---------------------------------------------------------------------------
// 🔴 THIS BLOCK WAS REWRITTEN BY CR-DESIGN-SYSTEM-010 (F2), AND THAT IS THE POINT OF THE CHANGE.
//    The three specs it replaces asserted that the master row COMMITS EVERY OPTION ID — which is the
//    defect: `matchesFilter`'s multiSelect arm requires `actual !== null`, so committing the option
//    list drops every row whose value is blank and lights "Clear", on a gesture the reader made to
//    see MORE. They were not edited to make a build pass; the assertions themselves were wrong.
//    Owner's layout A, approved 2026-09-10: the tick means "nothing is being hidden".
// ---------------------------------------------------------------------------
describe("the 'Select all' master row — the owner's option A", () => {
  it("🔴 IS TICKED AND READS 'All 3' WHEN NOTHING IS CHOSEN — the tick means 'nothing is hidden'", async () => {
    const user = setup();
    render(<MultiFilterHarness onChange={() => undefined} />);
    await user.click(screen.getByLabelText("Filter by Room"));

    const master = await screen.findByRole("menuitemcheckbox", { name: /Select all/ });
    expect(master.getAttribute("aria-checked")).toBe("true");
    expect(master.textContent).toContain("All 3");

    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    // ⚠ "mixed" IS THE POINT, and it is why this is a Radix CheckboxItem rather than a drawn dash:
    //   a screen reader says "partially checked" without anything being invented here.
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Select all/ }).getAttribute("aria-checked"),
    ).toBe("mixed");
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Select all/ }).textContent,
    ).toContain("1 of 3");
  });

  it("🔴 CLEARS THE FILTER RATHER THAN COMMITTING EVERY ID — 'Select all' drops the key", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Select all/ }));

    // 🔴 `{}` — NOT three repeated ids. An absent key is the one "not narrowed" state this row has
    //    always had, so the consumer writes no `f_room` parameter into the URL or the saved view.
    expect(onChange).toHaveBeenLastCalledWith({});
    const master = screen.getByRole("menuitemcheckbox", { name: /Select all/ });
    expect(master.getAttribute("aria-checked")).toBe("true");
    expect(master.textContent).toContain("All 3");
  });

  it("a SECOND tap is a no-op — there is no state it can toggle back to", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Select all/ }));
    expect(onChange).toHaveBeenLastCalledWith({});

    onChange.mockClear();
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Select all/ }));
    // It emits the same empty state rather than re-narrowing to everything — the row cannot narrow.
    for (const call of onChange.mock.calls) expect(call[0]).toEqual({});
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Select all/ }).textContent,
    ).toContain("All 3");
  });

  it("🔴 TICKING ALL THREE BY HAND IS A DIFFERENT STATE — ticked, but '3 of 3', not 'All 3'", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Ripening room 3/ }));

    // Three NAMED rooms is a real narrowing — a row with no room recorded is correctly left out —
    // so the value is committed and the count is what separates it from "All 3" on screen.
    expect(onChange).toHaveBeenLastCalledWith({
      room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-2", "ripening-3"] },
    });
    const master = screen.getByRole("menuitemcheckbox", { name: /Select all/ });
    expect(master.getAttribute("aria-checked")).toBe("true");
    expect(master.textContent).toContain("3 of 3");
  });
});

// ---------------------------------------------------------------------------
// CR-DESIGN-SYSTEM-010 F1 — a stored id the column no longer offers.
//
// 🔴 THE GRID MUST COUNT AND KEEP IT, EXACTLY AS THE TOOLBAR ALREADY DOES. A saved view restores
//    `f_room=cold-1&f_room=cold-9` after `cold-9` is retired; the shipped cell derived everything
//    from `options.filter(...)`, so it read "Cold room 1" / "1 chosen" on a query narrowed by two,
//    and threw `cold-9` away on the next tick. The toolbar in the identical state read
//    "Cold room 1 +1" / "2 chosen". The mirror-image specs live in `DataTableToolbar.test.tsx`.
// ---------------------------------------------------------------------------
describe("a value the column no longer offers — counted, shown, and kept", () => {
  const RESTORED: GridFilterValues = {
    room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-9"] },
  };

  it("🔴 COUNTS IT ON THE TRIGGER AND IN THE FOOTER — 'Cold room 1 +1', '2 chosen'", async () => {
    const user = setup();
    render(<MultiFilterHarness onChange={() => undefined} initial={RESTORED} />);
    const trigger = screen.getByLabelText("Filter by Room");
    expect(trigger.textContent).toContain("Cold room 1");
    expect(trigger.textContent).toContain("+1");

    await user.click(trigger);
    expect((await screen.findByText("2 chosen")).textContent).toBe("2 chosen");
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Select all/ }).textContent,
    ).toContain("2 of 3");
  });

  it("🔴 READS AS SET even when EVERY stored id has been retired", async () => {
    render(
      <MultiFilterHarness
        onChange={() => undefined}
        initial={{ room: { kind: "select", value: "cold-9" } }}
      />,
    );
    const trigger = screen.getByLabelText("Filter by Room");
    // The shipped cell rendered this completely unset — grey chrome reading "All rooms" — while the
    // query was still narrowed to `cold-9`. `CELL_SET`'s `border-info` is the signal that it is not.
    expect(trigger.className).toContain("border-info");
    expect(trigger.textContent).toContain("cold-9");
    expect(trigger.textContent).not.toContain("All rooms");
  });

  it("🔴 KEEPS IT THROUGH THE NEXT TICK — ticking a third room does not delete the retired one", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} initial={RESTORED} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 2/ }));

    // Known ids in DISPLAYED order first, then the stored id the options no longer offer.
    expect(onChange).toHaveBeenLastCalledWith({
      room: { kind: "select", value: "cold-1", values: ["cold-1", "cold-2", "cold-9"] },
    });
  });

  it("un-ticking a KNOWN id still leaves the retired one narrowing the query", async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<MultiFilterHarness onChange={onChange} initial={RESTORED} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    expect(onChange).toHaveBeenLastCalledWith({ room: { kind: "select", value: "cold-9" } });
  });
});

describe("the multi cell's trigger — the same arithmetic the toolbar's tick-list uses", () => {
  it("rests on the column's own placeholder, names ONE chosen room, then counts the rest", async () => {
    const user = setup();
    render(<MultiFilterHarness onChange={() => undefined} />);
    const trigger = screen.getByLabelText("Filter by Room");
    expect(trigger.textContent).toContain("All rooms");

    await user.click(trigger);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    expect(trigger.textContent).toContain("Cold room 1");
    expect(trigger.textContent).not.toContain("+");

    await user.click(screen.getByRole("menuitemcheckbox", { name: /Ripening room 3/ }));
    // "Cold room 1 +1" — the FIRST in displayed order, then how many more. Identical wording and
    // identical arithmetic to `DataTableToolbar`'s trigger, because it is literally the same function.
    expect(trigger.textContent).toContain("Cold room 1");
    expect(trigger.textContent).toContain("+1");
  });

  it("the footer counts what is chosen, in the shipped menu's own wording", async () => {
    const user = setup();
    render(<MultiFilterHarness onChange={() => undefined} />);
    await user.click(screen.getByLabelText("Filter by Room"));
    expect(await screen.findByText("None chosen")).toBeTruthy();
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 1/ }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Cold room 2/ }));
    expect(screen.getByText("2 chosen")).toBeTruthy();
  });

  it("a multi cell whose column offers no options is disabled, exactly as the one-value cell is", () => {
    render(<MultiFilterHarness onChange={() => undefined} options={[]} />);
    expect((screen.getByLabelText("Filter by Room") as HTMLButtonElement).disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GridGroupStrip
// ---------------------------------------------------------------------------

const SIGMA_OPTIONS = [
  { key: "units", label: "Units", additive: true },
  { key: "netKg", label: "Net kg", additive: true },
  { key: "packDate", label: "Farm packed", additive: false },
];

function StripHarness({
  levels,
  maxLevels = 3,
  onDropColumn = () => undefined,
  onRemove = () => undefined,
  onSigmaChange = () => undefined,
}: {
  readonly levels: readonly GridGroupChipView[];
  readonly maxLevels?: number;
  readonly onDropColumn?: (key: string) => void;
  readonly onRemove?: (key: string) => void;
  readonly onSigmaChange?: (
    key: string,
    next: { readonly count: boolean; readonly measures: readonly string[] },
  ) => void;
}): ReactElement {
  return (
    <GridGroupStrip
      levels={levels}
      maxLevels={maxLevels}
      sigmaOptions={SIGMA_OPTIONS}
      onDropColumn={onDropColumn}
      onRemove={onRemove}
      onSigmaChange={onSigmaChange}
    />
  );
}

function dropOn(el: HTMLElement, key: string): void {
  const dataTransfer = { getData: (f: string) => (f === GRID_COLUMN_MIME ? key : "") };
  fireEvent.dragOver(el, { dataTransfer });
  fireEvent.drop(el, { dataTransfer });
}

describe("GridGroupStrip — drag a header here", () => {
  it("prompts when empty, and names the NEXT level once one is placed", () => {
    const empty = render(<StripHarness levels={[]} />);
    expect(
      screen.getByText("Drag a column header here to group by that column"),
    ).toBeTruthy();
    empty.unmount();

    render(<StripHarness levels={[{ key: "item", label: "Item", count: true, measures: [] }]} />);
    expect(screen.getByText("Drag another header here for a second level")).toBeTruthy();
  });

  it("🔴 AT THE LIMIT IT SAYS NOTHING AND REFUSES THE DROP", () => {
    const onDropColumn = vi.fn();
    render(
      <StripHarness
        maxLevels={2}
        levels={[
          { key: "item", label: "Item", count: true, measures: [] },
          { key: "room", label: "Room", count: true, measures: [] },
        ]}
        onDropColumn={onDropColumn}
      />,
    );
    expect(screen.queryByText(/Drag another header/)).toBeNull();
    dropOn(screen.getByRole("group", { name: "Grouping levels" }), "class");
    expect(onDropColumn).not.toHaveBeenCalled();
  });

  it("reports a dropped column, and a chip that ungroups it", async () => {
    const user = setup();
    const onDropColumn = vi.fn();
    const onRemove = vi.fn();
    render(
      <StripHarness
        levels={[{ key: "item", label: "Item", count: true, measures: [] }]}
        onDropColumn={onDropColumn}
        onRemove={onRemove}
      />,
    );
    dropOn(screen.getByRole("group", { name: "Grouping levels" }), "room");
    expect(onDropColumn).toHaveBeenCalledWith("room");

    await user.click(screen.getByRole("button", { name: "Stop grouping by Item" }));
    expect(onRemove).toHaveBeenCalledWith("item");
  });

  it("🔴 EACH LEVEL CARRIES ITS OWN Σ, AND A NON-MEASURE IS OFFERED DISABLED (OD-RP-8, G4)", async () => {
    const user = setup();
    const onSigmaChange = vi.fn();
    render(
      <StripHarness
        levels={[
          { key: "item", label: "Item", count: true, measures: ["units", "netKg"] },
          { key: "room", label: "Room", count: false, measures: ["units"] },
        ]}
        onSigmaChange={onSigmaChange}
      />,
    );
    // The two levels really do subtotal differently — the whole point of the ruling.
    expect(screen.getByRole("button", { name: "Subtotals for the Item level" }).textContent).toContain(
      "Count · Units · Net kg",
    );
    expect(screen.getByRole("button", { name: "Subtotals for the Room level" }).textContent).toContain(
      "Units",
    );

    await user.click(screen.getByRole("button", { name: "Subtotals for the Room level" }));
    const notANumber = await screen.findByRole("menuitemcheckbox", { name: /Farm packed/ });
    expect(notANumber.getAttribute("data-disabled")).not.toBeNull();
    expect(within(notANumber).getByText("not a number")).toBeTruthy();

    await user.click(screen.getByRole("menuitemcheckbox", { name: /Net kg/ }));
    expect(onSigmaChange).toHaveBeenCalledWith("room", { count: false, measures: ["units", "netKg"] });
    expect(screen.getByText("Applies to this level only.")).toBeTruthy();
  });
});

describe("the strip's pure helpers", () => {
  it("gridGroupHint names the next ordinal and falls silent at the limit", () => {
    expect(gridGroupHint(0, 3)).toBe("Drag a column header here to group by that column");
    expect(gridGroupHint(1, 3)).toBe("Drag another header here for a second level");
    expect(gridGroupHint(2, 3)).toBe("Drag another header here for a third level");
    expect(gridGroupHint(3, 3)).toBeNull();
  });

  it("🔴 gridSigmaSummary SAYS 'Nothing' RATHER THAN NOTHING — a blank chip reads as 'not loaded'", () => {
    expect(gridSigmaSummary(false, [])).toBe("Nothing");
    expect(gridSigmaSummary(true, [])).toBe("Count");
    expect(gridSigmaSummary(true, ["Units", "Net kg"])).toBe("Count · Units · Net kg");
  });

  it("gridDraggedColumn reads a column key, and answers null for anything else", () => {
    expect(gridDraggedColumn({ getData: () => "batch" })).toBe("batch");
    expect(gridDraggedColumn({ getData: () => "" })).toBeNull();
    expect(gridDraggedColumn(null)).toBeNull();
  });
});
