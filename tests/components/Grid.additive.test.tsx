import { type ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DataTableToolbar,
  GridFilterRow,
  GridHeadCell,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  useTableControls,
} from "../../src";

// ============================================================================
// 🔴 CR-DESIGN-SYSTEM-008 IS ADDITIVE, AND THAT IS AN ACCEPTANCE CRITERION
// ============================================================================
// Five apps pin this package by git sha. A consumer that moves its pin to pick up the grid controls
// and adopts NOTHING must see no behaviour change at all — and no session can read a sibling consumer
// to find out what it broke, so the change has to be INCAPABLE of breaking one.
//
// That is asserted here rather than hoped for: the table primitives and the toolbar this change sits
// beside are rendered with the props they have always taken, and their output is checked. If a later
// edit "improves" `TableHead` to serve the grid, this file reddens before a consumer does.
//
// ⚠ IT IS NOT A SNAPSHOT. A snapshot of a class string records what the markup IS; these assertions
//   record what a CONSUMER RELIES ON — that the element is a `th` with `scope="col"`, that a numeric
//   cell is right-aligned and tabular, that the sortable header still renders its own button. A
//   snapshot would go red on a padding change and teach nobody anything.

beforeAll(() => {
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
});

describe("the table primitives keep their signatures byte for byte", () => {
  it("`TableHead` still renders a plain column header when it is not sortable", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pallet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    const th = screen.getByRole("columnheader", { name: "Pallet" });
    expect(th.tagName).toBe("TH");
    expect(th.getAttribute("scope")).toBe("col");
    // 🔴 NO BUTTON. A header that is not `sortable` has never been clickable, and the grid's own
    //    header cell is a SEPARATE export precisely so this stays true.
    expect(th.querySelector("button")).toBeNull();
  });

  it("`TableHead sortable` still renders its OWN button and its own indicator", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDir="asc" onSort={() => undefined}>
              Units
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );
    const th = screen.getByRole("columnheader");
    expect(th.getAttribute("aria-sort")).toBe("ascending");
    expect(th.querySelector("button")).not.toBeNull();
  });

  it("`TableCell` still right-aligns and tabularises a numeric cell", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell numeric>1 728</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const td = screen.getByRole("cell");
    expect(td.className).toContain("text-right");
    expect(td.className).toContain("tabular-nums");
    // ⚠ AND THE VERTICAL DEFAULT HAS NOT MOVED — flipping it would shift every table in the estate.
    expect(td.className).toContain("align-middle");
  });

  it("`TableRow interactive` still carries its pointer affordance", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row").className).toContain("cursor-pointer");
  });

  it("`TableContainer` still frames the table", () => {
    render(
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>,
    );
    expect(screen.getByRole("table")).toBeTruthy();
  });
});

describe("the toolbar the document lists run on is untouched", () => {
  // 🔴 DRIVEN THROUGH THE REAL ENTRY POINT, NOT A HAND-BUILT PROP BAG. `DataTableToolbar` takes ONE
  //    `controls` object, and every document list builds it with `useTableControls`. A spec that
  //    assembled that object by hand would keep passing while the hook's contract drifted underneath
  //    it — and the hook's contract is the thing a consumer actually depends on.
  function ReceiptsToolbarHarness(): ReactElement {
    const controls = useTableControls([{ state: "Draft" }, { state: "Posted" }], {
      getSearchText: (row) => row.state,
      filters: [{ kind: "select", key: "state", label: "State", accessor: (row) => row.state }],
    });
    return <DataTableToolbar controls={controls} searchPlaceholder="Search receipts…" />;
  }

  it("`DataTableToolbar` still renders its search box and its filters", () => {
    render(<ReceiptsToolbarHarness />);
    expect(screen.getByPlaceholderText("Search receipts…")).toBeTruthy();
    // 🔴 THE GRID DID NOT REPLACE THIS. The seventeen document lists still run on it, and they adopt
    //    the grid at M-09 of the consuming app's own epic — not here, and not by side effect.
    // ⚠ THE FILTER IS A `combobox`, NOT A `button`. Its trigger is a Radix `SelectTrigger`, which sets
    //   role="combobox" over the underlying element — so a `getAllByRole("button")` count would find
    //   nothing here and would be asserting the wrong thing about the shipped control. Naming the
    //   filter is also a stronger claim than counting anonymous buttons: it says THIS filter rendered.
    expect(screen.getByLabelText("Filter by State")).toBeTruthy();
  });

  it("`TablePagination` still prints its count and its arrows", () => {
    render(
      <TablePagination
        placement="top"
        page={2}
        pageSize={25}
        totalCount={312}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole("status").textContent).toContain("312");
    expect(screen.getByRole("button", { name: /previous/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /next/i })).toBeTruthy();
  });
});

// ============================================================================
// 🔴 CR-DESIGN-SYSTEM-009 IS ADDITIVE TOO, AND ON THE SAME TERMS
// ============================================================================
// This change adds FOUR opt-in options — `multiple` on a filter cell, and `density` / `wrap` /
// `columnWidth` on `Table` (with `width` per column) — plus `selectAll` on a toolbar filter def. A
// consumer that moves its pin and declares NONE of them must see nothing at all.
//
// ⚠ THE ASSERTIONS BELOW ARE ON THE EXACT `class` ATTRIBUTE where a class is the subject, because
//   `toContain` would pass while a second class sat silently beside the first — which is the whole
//   failure mode `Table.tsx`'s one-class-per-axis rule exists to prevent.

const UNDECLARED_COLUMNS = [
  { key: "batch", kind: "text" as const, label: "Batch", placeholder: "Contains…" },
  {
    key: "room",
    kind: "select" as const,
    label: "Room",
    placeholder: "All rooms",
    options: [{ id: "cold-1", label: "Cold room 1" }],
  },
];

function renderUndeclaredGrid(): HTMLElement {
  const { container } = render(
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <GridHeadCell columnKey="room" label="Room" />
          </TableRow>
          <GridFilterRow columns={UNDECLARED_COLUMNS} values={{}} onChange={() => undefined} />
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Freshmark Distribution Centre — Gauteng North</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>,
  );
  return container;
}

describe("a consumer that adopts NOTHING sees nothing", () => {
  it("a `<Table>` with no `density`, `wrap` or `columnWidth` renders its original class string", () => {
    expect(renderUndeclaredGrid().querySelector("table")?.getAttribute("class")).toBe(
      "w-full border-collapse text-sm text-fg",
    );
  });

  it("🔴 NOT ONE CELL IN THE WHOLE GRID GAINS A `truncate` OR A `max-w-` CLASS", () => {
    // The two options that could visibly cut a value are the ones a consumer would notice last and
    // resent most, so they are asserted across EVERY cell the grid renders, not a sampled one.
    const container = renderUndeclaredGrid();
    const cells = container.querySelectorAll("th, td");
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      const cls = cell.getAttribute("class") ?? "";
      expect(cls, cls).not.toMatch(/\btruncate\b|\bmax-w-\[/);
    }
  });

  it("the filter row's `<th>` and the head cell keep the padding they shipped with", () => {
    const container = renderUndeclaredGrid();
    const filterTh = container.querySelector("[data-grid-filter-row] th");
    expect(filterTh?.getAttribute("class")).toBe(
      "border-b border-border bg-surface px-2 py-1.5 align-middle font-normal",
    );
    expect(container.querySelector("[data-grid-column=room]")?.getAttribute("class")).toContain(
      "px-2.5",
    );
  });

  it("🔴 A `select` FILTER CELL WITHOUT `multiple` IS THE ONE-VALUE MENU, byte for byte", async () => {
    // It renders plain `menuitem`s and commits one id — the ORIGINAL code path, not a branch inside
    // a unified component. A `menuitemcheckbox` appearing here would mean a consumer that adopted
    // nothing had silently been given a menu that can emit two values into a query writing one.
    const onChange = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Table>
        <TableHeader>
          <GridFilterRow columns={UNDECLARED_COLUMNS} values={{}} onChange={onChange} />
        </TableHeader>
        <TableBody />
      </Table>,
    );
    await user.click(screen.getByLabelText("Filter by Room"));
    expect(await screen.findByRole("menuitem", { name: "Cold room 1" })).toBeTruthy();
    expect(screen.queryByRole("menuitemcheckbox")).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Cold room 1" }));
    // The one-value shape, with no `values` key at all.
    expect(onChange).toHaveBeenLastCalledWith({ room: { kind: "select", value: "cold-1" } });
  });

  it("🔴 A `MultiSelectFilterDef` WITHOUT `selectAll` STILL SHOWS 'All …', not 'Select all'", async () => {
    // Every shipped toolbar in the estate is this shape. The grid got the owner's new top row; the
    // toolbars keep theirs until each consumer flips one word in its own change, at its own gate.
    function DepotToolbarHarness(): ReactElement {
      const controls = useTableControls([{ depot: "Cape Town" }, { depot: "Durban" }], {
        filters: [
          { kind: "multiSelect", key: "depot", label: "Depots", accessor: (row) => row.depot },
        ],
      });
      return <DataTableToolbar controls={controls} />;
    }
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<DepotToolbarHarness />);
    await user.click(screen.getByLabelText("Filter by Depots"));
    expect(await screen.findByRole("menuitemcheckbox", { name: "All depots" })).toBeTruthy();
    expect(screen.queryByRole("menuitemcheckbox", { name: /Select all/ })).toBeNull();
  });
});

describe("the grid's three rows move together, or not at all (§B, §C.4a)", () => {
  it("🔴 ONE `density` REACHES THE HEAD CELL, THE FILTER ROW AND THE BODY — the whole grid", () => {
    // A table that went compact while its filter row did not is a row of tall boxes over short rows,
    // which is worse than either density on its own. One switch, asked once, reaching all of them.
    const { container } = render(
      <TableContainer>
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <GridHeadCell columnKey="room" label="Room" />
            </TableRow>
            <GridFilterRow columns={UNDECLARED_COLUMNS} values={{}} onChange={() => undefined} />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>,
    );
    expect(container.querySelector("[data-grid-column=room]")?.getAttribute("class")).toContain(
      "px-1.5",
    );
    expect(container.querySelector("[data-grid-filter-row] th")?.getAttribute("class")).toContain(
      "px-1 py-1",
    );
    expect(container.querySelector("td")?.getAttribute("class")).toContain("px-1.5 py-1");
    // The filter box itself tightens with them — 28px to 24px — and keeps its `text-xs`.
    const box = screen.getByLabelText("Filter by Room").getAttribute("class") ?? "";
    expect(box).toContain("h-6");
    expect(box).toContain("text-xs");
  });

  it("🔴 ONE `width` STEP PRODUCES THE SAME CEILING ON ALL THREE OF A COLUMN'S ROWS", () => {
    // The desync guard. If the head, the filter cell and the body cell could resolve one step
    // differently, the widest would win and the column would simply refuse to narrow — which reads
    // as a rendering bug in this package when it is a wiring gap in the consumer.
    const { container } = render(
      <TableContainer>
        <Table wrap="truncate">
          <TableHeader>
            <TableRow>
              <GridHeadCell columnKey="room" label="Room" width="wide" />
            </TableRow>
            <GridFilterRow
              columns={[{ ...UNDECLARED_COLUMNS[1]!, width: "wide" }]}
              values={{}}
              onChange={() => undefined}
            />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell width="wide">x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>,
    );
    const head = container.querySelector("[data-grid-column=room]")?.getAttribute("class") ?? "";
    const filter =
      container.querySelector("[data-grid-filter-row] th")?.getAttribute("class") ?? "";
    const body = container.querySelector("td")?.getAttribute("class") ?? "";
    for (const [name, cls] of [["head", head], ["filter", filter], ["body", body]] as const) {
      expect(cls.match(/\bmax-w-\[[^\]]+\]/g) ?? [], name).toEqual(["max-w-[20rem]"]);
    }
  });
});

// ============================================================================
// 🔴 CR-DESIGN-SYSTEM-010 F3 — `TableCell.width` CARRIES BOTH MEANINGS
// ============================================================================
// React's `TdHTMLAttributes` declares `width?: number | string`, so `<TableCell width={120}>` was
// legal before CR-DESIGN-SYSTEM-009 and rendered `<td width="120">`. Declaring the design-system step
// under the SAME NAME narrowed the inherited prop and destructured it away — so a consumer that had
// used the legacy attribute would fail `tsc` on a file it never touched at its next pin bump, or
// (cast, or untyped) lose the column's sizing with no error at all. That is the exact opposite of
// "a consumer that moves its pin and declares nothing new renders byte-identically".
//
// ⚠ `ThHTMLAttributes` DECLARES NO `width`, so `TableHead` never had the attribute to lose and is
//   deliberately NOT widened. The asymmetry is React's; asserting it here is what stops a later edit
//   "tidying" the two interfaces into agreement and quietly adding a second meaning to a `<th>`.
describe("`TableCell.width` — the design-system step AND the legacy HTML attribute", () => {
  function bodyCell(width: number | string): HTMLElement | null {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell width={width}>Qty</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    return container.querySelector("td");
  }

  it("🔴 A NUMERIC `width` STILL REACHES THE DOM — `<td width=\"120\">`, as it always did", () => {
    const td = bodyCell(120);
    expect(td?.getAttribute("width")).toBe("120");
    // …and it takes no design-system class, because it is not one of the four steps.
    expect(td?.getAttribute("class") ?? "").not.toContain("max-w-");
  });

  it("a STRING width that is not a step is forwarded untouched too", () => {
    expect(bodyCell("120")?.getAttribute("width")).toBe("120");
    expect(bodyCell("50%")?.getAttribute("width")).toBe("50%");
  });

  it("🔴 THE FOUR STEP NAMES ARE CONSUMED, NEVER FORWARDED — no `width` attribute on the `<td>`", () => {
    const { container } = render(
      <Table wrap="truncate">
        <TableBody>
          <TableRow>
            <TableCell width="wide">Qty</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const td = container.querySelector("td");
    expect(td?.getAttribute("class") ?? "").toContain("max-w-[20rem]");
    expect(td?.hasAttribute("width")).toBe(false);
  });

  it("a cell that passes NO width emits neither the attribute nor a cap", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Qty</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const td = container.querySelector("td");
    expect(td?.hasAttribute("width")).toBe(false);
    expect(td?.getAttribute("class") ?? "").not.toContain("max-w-");
  });
});
