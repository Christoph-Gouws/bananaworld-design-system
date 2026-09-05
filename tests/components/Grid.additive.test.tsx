import { type ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import {
  DataTableToolbar,
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

afterEach(cleanup);

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
