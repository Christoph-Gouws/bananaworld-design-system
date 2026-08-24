import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

// Imported FROM THE PACKAGE ROOT (spec 17). A primitive a consumer cannot reach from
// "@bananaworld/design-system" has not shipped, whatever the file on disk says.
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  type SortDirection,
  type TableCellProps,
  type TableHeadProps,
  type TableRowProps,
} from "../../src";

// CR-DESIGN-SYSTEM-006 — a row of fields can line up along the top.
//
// 🔴 WHAT THIS FILE IS, AND WHY THE FIRST FOUR BLOCKS EXIST BEFORE THE FEATURE DOES.
//    This package had NO Table specs at all until this change. The change adds an opt-in vertical
//    alignment option, and the whole promise attached to it is that EVERY EXISTING CALLER RENDERS
//    BYTE-IDENTICALLY — five apps (DC, CRM, RMS, org-admin, Manga Verde) pin this package by git sha,
//    so a moved default would silently shift the contents of every table in the estate at their next
//    bump.
//
//    That promise cannot be honestly *asserted* from here: four of the five consumer repos are not
//    readable from a build worktree and none of their suites can be run. So it is written as a
//    REGRESSION TEST INSTEAD OF A SENTENCE — the "unchanged" blocks below (§1 cells, §2 rows,
//    §3 export surface) were written and run GREEN against the UNMODIFIED component, and committed
//    in that state, before one character of `Table.tsx` moved. They pin the exact class string, not
//    the shape of it.
//
// ⚠ THE ASSERTIONS ARE ON THE EXACT `class` ATTRIBUTE, deliberately. `toContain` would pass while a
//   second, conflicting alignment class sat next to the first — which is precisely the bug this
//   change was told not to reintroduce (Table.tsx's own `alignClass` comment: a stray default
//   `text-left` once overrode `numeric`'s `text-right` and mis-aligned numeric columns).

afterEach(cleanup);

/** Render `body` as the tbody of a full, valid table and hand back the container. */
function renderTable(body: ReactElement): HTMLElement {
  const { container } = render(
    <TableContainer>
      <Table>
        <TableBody>{body}</TableBody>
      </Table>
    </TableContainer>,
  );
  return container;
}

/** The exact `class` attribute of the nth `<td>`. */
function tdClass(container: HTMLElement, index = 0): string {
  const cells = container.querySelectorAll("td");
  const cell = cells[index];
  if (cell === undefined) throw new Error(`no <td> at index ${index}`);
  return cell.getAttribute("class") ?? "";
}

/** The exact `class` attribute of the nth `<tr>`. */
function trClass(container: HTMLElement, index = 0): string {
  const rows = container.querySelectorAll("tr");
  const row = rows[index];
  if (row === undefined) throw new Error(`no <tr> at index ${index}`);
  return row.getAttribute("class") ?? "";
}

// ---------------------------------------------------------------------------------------------
// §1 — THE CELL DEFAULT, CHARACTER FOR CHARACTER (T-1, T-2). Written green pre-edit.
// ---------------------------------------------------------------------------------------------

describe("TableCell — the class string every existing caller already gets", () => {
  it("T-1: a cell with no props renders exactly `px-3 py-2 align-middle text-left`", () => {
    const container = renderTable(
      <TableRow>
        <TableCell>ITM-001</TableCell>
      </TableRow>,
    );
    // 🔴 THE ESTATE-WIDE DEFAULT. `align-middle`, in this position, with nothing else vertical
    //    beside it. Every table in every app rests on this one string.
    expect(tdClass(container)).toBe("px-3 py-2 align-middle text-left");
  });

  it("T-2: every existing shape of caller is unchanged, character for character", () => {
    // One row per shape a caller can already write today. Each is the WHOLE class attribute.
    const shapes: Array<{ name: string; props: TableCellProps; expected: string }> = [
      {
        name: "numeric",
        props: { numeric: true },
        expected: "px-3 py-2 align-middle tabular-nums text-right",
      },
      {
        name: "muted",
        props: { muted: true },
        expected: "px-3 py-2 align-middle text-fg-subtle text-left",
      },
      {
        name: 'align="center"',
        props: { align: "center" },
        expected: "px-3 py-2 align-middle text-center",
      },
      {
        name: 'align="right"',
        props: { align: "right" },
        expected: "px-3 py-2 align-middle text-right",
      },
      {
        name: 'align="left" on a numeric cell (an explicit align beats numeric\'s default)',
        props: { numeric: true, align: "left" },
        expected: "px-3 py-2 align-middle tabular-nums text-left",
      },
      {
        name: 'className="w-40"',
        props: { className: "w-40" },
        expected: "px-3 py-2 align-middle text-left w-40",
      },
      {
        name: "numeric + muted + className, the widest existing combination",
        props: { numeric: true, muted: true, className: "w-40" },
        expected: "px-3 py-2 align-middle tabular-nums text-fg-subtle text-right w-40",
      },
    ];

    for (const shape of shapes) {
      const container = renderTable(
        <TableRow>
          <TableCell {...shape.props}>x</TableCell>
        </TableRow>,
      );
      expect(tdClass(container), shape.name).toBe(shape.expected);
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------------------------
// §2 — THE ROW, CHARACTER FOR CHARACTER (T-15). Written green pre-edit.
// ---------------------------------------------------------------------------------------------

describe("TableRow — the class string every existing caller already gets", () => {
  it("T-15: a plain row and an interactive row are unchanged, character for character", () => {
    const shapes: Array<{ name: string; props: TableRowProps; expected: string }> = [
      {
        name: "no props",
        props: {},
        expected: "border-b border-border last:border-0",
      },
      {
        name: "interactive",
        props: { interactive: true },
        expected:
          "border-b border-border last:border-0 cursor-pointer transition-colors duration-fast hover:bg-surface-muted focus-within:bg-surface-muted",
      },
      {
        name: 'className="bg-danger-subtle"',
        props: { className: "bg-danger-subtle" },
        expected: "border-b border-border last:border-0 bg-danger-subtle",
      },
    ];

    for (const shape of shapes) {
      const container = renderTable(
        <TableRow {...shape.props}>
          <TableCell>x</TableCell>
        </TableRow>,
      );
      expect(trClass(container), shape.name).toBe(shape.expected);
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------------------------
// §3 — THE EXPORT SURFACE DID NOT MOVE (T-16). Written green pre-edit.
// ---------------------------------------------------------------------------------------------

describe("the Table export surface", () => {
  it("T-16: the package root still exports the same seven Table values, under the same names", () => {
    // A consumer pins this package by sha; a renamed or dropped export is a break, not a change.
    const surface = {
      TableContainer,
      Table,
      TableHeader,
      TableBody,
      TableRow,
      TableHead,
      TableCell,
    };
    expect(Object.keys(surface).sort()).toEqual(
      ["Table", "TableBody", "TableCell", "TableContainer", "TableHead", "TableHeader", "TableRow"].sort(),
    );
    for (const [name, value] of Object.entries(surface)) {
      expect(typeof value, name).toBe("object"); // forwardRef components are objects, not functions
    }
  });

  it("T-16: the three Table types are still reachable from the package root", () => {
    // Type-only, so `pnpm typecheck` is the real gate — but naming them here means a removed or
    // renamed type reddens the SUITE too, not just the compiler.
    const row: TableRowProps = { interactive: true };
    const head: TableHeadProps = { sortable: true, sortDir: "asc" satisfies SortDirection };
    const cell: TableCellProps = { numeric: true };
    expect([row.interactive, head.sortable, cell.numeric]).toEqual([true, true, true]);
  });
});
