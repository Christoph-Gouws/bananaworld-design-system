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
  type TableColumnWidth,
  type TableHeadProps,
  type TableProps,
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

/** Every vertical-alignment utility present in a class string, in order. */
function verticalClasses(classAttr: string): string[] {
  return classAttr.match(/\balign-(?:top|middle|bottom)\b/g) ?? [];
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

// ---------------------------------------------------------------------------------------------
// §4 — THE NEW OPTION, ON THE CELL (T-3, T-4, T-5).
// ---------------------------------------------------------------------------------------------

describe("TableCell valign — the option itself", () => {
  it("T-3: valign=\"top\" renders align-top, and no other vertical class", () => {
    const container = renderTable(
      <TableRow>
        <TableCell valign="top">ITM-001</TableCell>
      </TableRow>,
    );
    expect(tdClass(container)).toBe("px-3 py-2 text-left align-top");
    expect(verticalClasses(tdClass(container))).toEqual(["align-top"]);
  });

  it("T-4: valign=\"bottom\" renders align-bottom, and no other vertical class", () => {
    const container = renderTable(
      <TableRow>
        <TableCell valign="bottom">ITM-001</TableCell>
      </TableRow>,
    );
    expect(tdClass(container)).toBe("px-3 py-2 text-left align-bottom");
    expect(verticalClasses(tdClass(container))).toEqual(["align-bottom"]);
  });

  it("T-5: valign=\"middle\" is not a special case — same classes as the default, one vertical", () => {
    const asked = renderTable(
      <TableRow>
        <TableCell valign="middle">ITM-001</TableCell>
      </TableRow>,
    );
    const askedClass = tdClass(asked);
    cleanup();
    const untouched = renderTable(
      <TableRow>
        <TableCell>ITM-001</TableCell>
      </TableRow>,
    );
    const untouchedClass = tdClass(untouched);

    // 🔴 THE SAME SET OF CLASSES, not the same string. Asking explicitly emits the class after
    //    `className` (so a caller's className cannot defeat the prop — T-7), while the default
    //    emits it in place (so an existing className override still wins — T-8). Different
    //    ORDER, identical rendering: Tailwind utilities are order-independent unless they
    //    conflict, and there is exactly one vertical class either way.
    expect(askedClass.split(" ").sort()).toEqual(untouchedClass.split(" ").sort());
    expect(verticalClasses(askedClass)).toEqual(["align-middle"]);
  });
});

// ---------------------------------------------------------------------------------------------
// §5 — 🔴 EXACTLY ONE VERTICAL CLASS, ALWAYS (T-6, T-7, T-8, T-9).
//      This is the bug the request named: the file's `alignClass` comment records that a stray
//      default `text-left` once overrode `numeric`'s `text-right`. The same class of bug on the
//      vertical axis is what these four block.
// ---------------------------------------------------------------------------------------------

describe("exactly one vertical-alignment class, on every path", () => {
  it("T-6: every combination of valign x numeric x muted x className emits exactly one", () => {
    const valigns = [undefined, "top", "middle", "bottom"] as const;
    const classNames = [undefined, "w-40", "align-top", "align-bottom", "align-middle"];
    let combinations = 0;

    for (const valign of valigns) {
      for (const numeric of [false, true]) {
        for (const muted of [false, true]) {
          for (const className of classNames) {
            const container = renderTable(
              <TableRow>
                <TableCell valign={valign} numeric={numeric} muted={muted} className={className}>
                  x
                </TableCell>
              </TableRow>,
            );
            const actual = verticalClasses(tdClass(container));
            expect(
              actual,
              `valign=${String(valign)} numeric=${numeric} muted=${muted} className=${String(className)}`,
            ).toHaveLength(1);
            combinations += 1;
            cleanup();
          }
        }
      }
    }
    expect(combinations).toBe(80);
  });

  it("T-7: a caller's className cannot silently defeat the valign prop", () => {
    // The explicit requirement in the request. `className` is emitted BEFORE the asked-for class,
    // so twMerge — which keeps the last of a conflicting pair — resolves to what was asked.
    const container = renderTable(
      <TableRow>
        <TableCell valign="top" className="align-middle">
          x
        </TableCell>
      </TableRow>,
    );
    expect(verticalClasses(tdClass(container))).toEqual(["align-top"]);
  });

  it("T-8: className=\"align-top\" with NO valign still wins — today's workaround is untouched", () => {
    // 🔴 THIS IS WHAT PINS THE DEFAULT'S POSITION, not just its value. Before this change the base
    //    `align-middle` sat first and a caller's className beat it; that is the only way a cell
    //    could be top-aligned at all, and somewhere in five sha-pinned apps somebody has written it.
    //    Moving the default to the end of the list would silently break every one of them.
    const container = renderTable(
      <TableRow>
        <TableCell className="align-top">x</TableCell>
      </TableRow>,
    );
    expect(tdClass(container)).toBe("px-3 py-2 text-left align-top");
    expect(verticalClasses(tdClass(container))).toEqual(["align-top"]);
  });

  it("T-9: horizontal alignment is untouched, with and without valign", () => {
    // The original twMerge bug, re-guarded on the axis it actually happened on.
    const cases: Array<{ props: TableCellProps; horizontal: string }> = [
      { props: { numeric: true }, horizontal: "text-right" },
      { props: { numeric: true, valign: "top" }, horizontal: "text-right" },
      { props: { align: "right", valign: "top" }, horizontal: "text-right" },
      { props: { align: "left", numeric: true, valign: "bottom" }, horizontal: "text-left" },
      { props: { align: "center", valign: "middle" }, horizontal: "text-center" },
    ];
    for (const { props, horizontal } of cases) {
      const container = renderTable(
        <TableRow>
          <TableCell {...props}>x</TableCell>
        </TableRow>,
      );
      const actual = tdClass(container);
      const label = JSON.stringify(props);
      expect(actual.match(/\btext-(?:left|right|center)\b/g), label).toEqual([horizontal]);
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------------------------
// §6 — THE ROW-LEVEL ANSWER, AND ITS OPT-OUT (T-10, T-11, T-12) — owner-approved layout A.
// ---------------------------------------------------------------------------------------------

describe("TableRow valign — asked once for the whole row", () => {
  it("T-10: every cell in the row is top-aligned without repeating the prop", () => {
    // The layout-A shape: the CRM's sales order line has six cells, and per-cell-only (layout B)
    // makes correctness depend on a caller never missing one of them — silently.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell>item</TableCell>
        <TableCell>container</TableCell>
        <TableCell numeric>12</TableCell>
        <TableCell>unit</TableCell>
        <TableCell numeric>4.50</TableCell>
        <TableCell numeric>54.00</TableCell>
      </TableRow>,
    );
    const cells = container.querySelectorAll("td");
    expect(cells).toHaveLength(6);
    for (const cell of cells) {
      expect(verticalClasses(cell.getAttribute("class") ?? "")).toEqual(["align-top"]);
    }
  });

  it("T-11: a cell's own valign wins over its row's — layout A's opt-out", () => {
    // The buttons column of a top-aligned grid usually reads better centred.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell>item</TableCell>
        <TableCell valign="middle">actions</TableCell>
      </TableRow>,
    );
    expect(verticalClasses(tdClass(container, 0))).toEqual(["align-top"]);
    expect(verticalClasses(tdClass(container, 1))).toEqual(["align-middle"]);
  });

  it("T-12: no leak — a sibling row, and a nested table, keep the default", () => {
    const container = renderTable(
      <>
        <TableRow valign="top">
          <TableCell>
            {/* A table nested inside a top-aligned cell must NOT inherit that row's alignment —
                which is why TableRow provides its context ALWAYS, undefined included. */}
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>nested</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>sibling</TableCell>
        </TableRow>
      </>,
    );
    const cells = Array.from(container.querySelectorAll("td")).map(
      (cell) => cell.getAttribute("class") ?? "",
    );
    // Document order: the outer top-aligned cell, the nested cell inside it, then the sibling row.
    expect(verticalClasses(cells[0] ?? "")).toEqual(["align-top"]);
    expect(cells[1]).toBe("px-3 py-2 align-middle text-left"); // byte-identical to the default
    expect(cells[2]).toBe("px-3 py-2 align-middle text-left"); // byte-identical to the default
  });
});

// ---------------------------------------------------------------------------------------------
// §7 — THE PROP IS CONSUMED, AND THE SCOPE FENCE HOLDS (T-13, T-14).
// ---------------------------------------------------------------------------------------------

describe("valign is consumed, never forwarded; TableHead is out of scope", () => {
  it("T-13: neither the <td> nor the <tr> carries a valign attribute", () => {
    // `TdHTMLAttributes` declares the deprecated presentational `valign`, so before this change
    // `<TableCell valign="top">` compiled, was spread onto the <td>, and did nothing. It is now
    // destructured out — the same move the file already made for `align`. Nobody re-adds it by
    // accident.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell valign="bottom">x</TableCell>
      </TableRow>,
    );
    const cell = container.querySelector("td");
    const row = container.querySelector("tr");
    expect(cell?.hasAttribute("valign")).toBe(false);
    expect(row?.hasAttribute("valign")).toBe(false);
  });

  it("T-14: a TableHead inside a top-aligned row is byte-identical to today", () => {
    // TableHead deliberately gains nothing: header cells are single-line by construction
    // (whitespace-nowrap) and no caller has asked. The fence is asserted, not assumed.
    const { container } = render(
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow valign="top">
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </TableContainer>,
    );
    const head = container.querySelector("th")?.getAttribute("class") ?? "";
    expect(head).toBe(
      "px-3 py-2.5 text-2xs font-semibold uppercase tracking-wide text-fg-muted border-b border-border whitespace-nowrap select-none text-left",
    );
    expect(verticalClasses(head)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// §8 — CR-DESIGN-SYSTEM-007: A ROW'S ANSWER IS A DEFAULT, NOT AN OVERRIDE (T-17 … T-22).
//
// 🔴 THE GAP THESE FILL. §5 above covers cell-prop vs `className` (T-7, T-8). §6 covers cell-prop
//    vs row-prop (T-11). NOTHING covered ROW-prop vs a cell's `className` — T-6's 80-combination
//    matrix renders every one of its cells inside a PLAIN <TableRow>. CR-006 shipped with
//    `askedForValign` computed from the RESOLVED value, so a row-sourced answer took the
//    after-`className` slot and silently beat a cell's own vertical utility.
//
//    The precedence these pin, most specific first:
//      cell `valign` prop  >  cell `className`  >  row `valign` prop  >  the "middle" default
//    A `className` utility is a CELL-level answer — before CR-006 it was the ONLY way to write one,
//    which is why T-8 pins the default's position — so a ROW-level answer must not defeat it.
// ---------------------------------------------------------------------------------------------

describe("TableRow valign is a default for its cells, not an override of them", () => {
  it("T-17: a cell's own className beats its row's valign — the reported defect, verbatim", () => {
    // 🔴 REDDENS against the code as CR-006 shipped it: emission was
    //    cn("px-3 py-2", false, ..., "text-left", "align-middle", "align-top") and twMerge keeps
    //    the last, so the cell rendered align-top — not the align-middle its author wrote.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell className="align-middle">actions</TableCell>
      </TableRow>,
    );
    expect(verticalClasses(tdClass(container))).toEqual(["align-middle"]);
  });

  it("T-18: the CRM sales-order shape — five top-aligned cells, one that opted out via className", () => {
    // The reviewer's scenario in full: a six-cell line grid told to line up along the top, whose
    // actions cell already carried `className="align-middle"` — the only way to express a per-cell
    // vertical answer before the row option existed.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell>item</TableCell>
        <TableCell>container</TableCell>
        <TableCell numeric>12</TableCell>
        <TableCell numeric>4.50</TableCell>
        <TableCell numeric>54.00</TableCell>
        <TableCell className="align-middle">actions</TableCell>
      </TableRow>,
    );
    const cells = Array.from(container.querySelectorAll("td")).map(
      (cell) => cell.getAttribute("class") ?? "",
    );
    expect(cells).toHaveLength(6);
    for (const [index, cell] of cells.entries()) {
      // Exactly one vertical class in every cell — the invariant, still holding on this path.
      expect(verticalClasses(cell), `cell ${index}`).toHaveLength(1);
    }
    for (const cell of cells.slice(0, 5)) {
      expect(verticalClasses(cell)).toEqual(["align-top"]);
    }
    expect(verticalClasses(cells[5] ?? "")).toEqual(["align-middle"]);
  });

  it("T-19: the cell's own prop still beats its className INSIDE a top-aligned row", () => {
    // Position (B) is intact: narrowing the predicate to the cell's own prop must not cost the
    // prop its power over `className` (T-7's guarantee), including inside a row that has asked.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell valign="middle" className="align-bottom">
          actions
        </TableCell>
      </TableRow>,
    );
    expect(verticalClasses(tdClass(container))).toEqual(["align-middle"]);
  });

  it("T-20: a row's answer still reaches a cell whose className is not an alignment", () => {
    // Guards the opposite error — over-narrowing until the row option stops working at all.
    const container = renderTable(
      <TableRow valign="top">
        <TableCell className="w-40">item</TableCell>
      </TableRow>,
    );
    expect(verticalClasses(tdClass(container))).toEqual(["align-top"]);
  });

  it("T-21: exactly one vertical class across row-valign x cell-valign x className (80)", () => {
    // The matrix T-6 never ran: T-6 fixes the row to a plain one. This varies the ROW as well, so
    // both emission positions are exercised on every combination.
    const valigns = [undefined, "top", "middle", "bottom"] as const;
    const classNames = [undefined, "w-40", "align-top", "align-middle", "align-bottom"];
    let combinations = 0;

    for (const rowValign of valigns) {
      for (const cellValign of valigns) {
        for (const className of classNames) {
          const container = renderTable(
            <TableRow valign={rowValign}>
              <TableCell valign={cellValign} className={className}>
                x
              </TableCell>
            </TableRow>,
          );
          const label = `row=${String(rowValign)} cell=${String(cellValign)} className=${String(className)}`;
          const actual = verticalClasses(tdClass(container));
          expect(actual, label).toHaveLength(1);

          // And it is the RIGHT one, on every single combination — precedence stated as code:
          // cell prop > cell className > row prop > "middle".
          const classNameVertical =
            className !== undefined && /^align-(?:top|middle|bottom)$/.test(className)
              ? className
              : undefined;
          const winner =
            cellValign !== undefined
              ? `align-${cellValign}`
              : (classNameVertical ?? `align-${rowValign ?? "middle"}`);
          expect(actual, label).toEqual([winner]);

          combinations += 1;
          cleanup();
        }
      }
    }
    expect(combinations).toBe(80);
  });

  it("T-22: the T-1/T-2 shapes are byte-identical inside a row that sets no valign", () => {
    // The additive claim, re-guarded at the point this change touched: every caller that sets no
    // `valign` anywhere — i.e. every caller in every consumer today — is untouched, character for
    // character, including the class ORDER.
    const shapes: Array<{ name: string; props: TableCellProps; expected: string }> = [
      { name: "no props", props: {}, expected: "px-3 py-2 align-middle text-left" },
      {
        name: "numeric",
        props: { numeric: true },
        expected: "px-3 py-2 align-middle tabular-nums text-right",
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
// §9 — CR-DESIGN-SYSTEM-009: A COMPACT DENSITY, A WRAP TREATMENT, AND A PER-COLUMN WIDTH
//      (T-23 … T-38).
//
// 🔴 THREE OPTIONS, ONE PROMISE. Each is asked once on `<Table>` and read by everything under it,
//    and each defaults to what shipped. The specs below come in two halves and the FIRST half is the
//    load-bearing one: a table that declares none of them emits the exact class strings §1–§3 pinned
//    before this change existed. The second half proves the options do what they say.
//
// ⚠ happy-dom DOES NO LAYOUT. These specs assert that a cell carries `truncate` and a `max-w-`
//   ceiling; they CANNOT assert that an ellipsis appeared on screen. That is verified separately and
//   recorded in this change's `qa-report.md` — a spec claiming otherwise would be asserting its own
//   harness rather than the browser.
// ---------------------------------------------------------------------------------------------

/** The exact `class` attribute of the nth `<th>`. */
function thClass(container: HTMLElement, index = 0): string {
  const heads = container.querySelectorAll("th");
  const head = heads[index];
  if (head === undefined) throw new Error(`no <th> at index ${index}`);
  return head.getAttribute("class") ?? "";
}

/** Render one head and one body cell under a `<Table>` carrying `tableProps`. */
function renderDensity(
  tableProps: Partial<TableProps>,
  headProps: Partial<TableHeadProps> = {},
  cellProps: Partial<TableCellProps> = {},
  children: ReactElement | string = "x",
): HTMLElement {
  const { container } = render(
    <TableContainer>
      <Table {...tableProps}>
        <TableHeader>
          <TableRow>
            <TableHead {...headProps}>Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell {...cellProps}>{children}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>,
  );
  return container;
}

/** Every whitespace/overflow utility present in a class string, in order. */
function wrapClasses(classAttr: string): string[] {
  return classAttr.match(/\b(?:truncate|whitespace-nowrap|whitespace-normal|text-ellipsis)\b/g) ?? [];
}

/** Every max-width utility present in a class string, in order. */
function widthClasses(classAttr: string): string[] {
  return classAttr.match(/\bmax-w-\[[^\]]+\]/g) ?? [];
}

describe("T-23 … T-26: a table that declares NOTHING renders byte-identically", () => {
  it("T-23: the `<table>` itself keeps its exact class string", () => {
    const container = renderDensity({});
    expect(container.querySelector("table")?.getAttribute("class")).toBe(
      "w-full border-collapse text-sm text-fg",
    );
  });

  it("T-24: the head keeps the exact string §7 pinned — including `whitespace-nowrap`", () => {
    // 🔴 THE SPEC THE `HEAD_WRAP` RECORD EXISTS FOR. A record shared with the body cell would map
    //    "wrap" to "" and silently DROP `whitespace-nowrap` from every header in the estate.
    expect(thClass(renderDensity({}))).toBe(
      "px-3 py-2.5 text-2xs font-semibold uppercase tracking-wide text-fg-muted border-b border-border whitespace-nowrap select-none text-left",
    );
  });

  it("T-25: the body cell keeps the exact string §1 pinned, and gains NO wrap or width class", () => {
    const cls = tdClass(renderDensity({}));
    expect(cls).toBe("px-3 py-2 align-middle text-left");
    expect(wrapClasses(cls)).toEqual([]);
    expect(widthClasses(cls)).toEqual([]);
  });

  it("T-26: a plain-string cell gets NO `title` — the tooltip belongs to truncation, not to cells", () => {
    expect(renderDensity({}).querySelector("td")?.hasAttribute("title")).toBe(false);
  });
});

describe("T-27 … T-29: the compact density", () => {
  it('T-27: density="compact" tightens the type on the table and the padding on both cells', () => {
    const container = renderDensity({ density: "compact" });
    expect(container.querySelector("table")?.getAttribute("class")).toBe(
      "w-full border-collapse text-xs text-fg",
    );
    expect(thClass(container)).toContain("px-1.5 py-1");
    expect(tdClass(container)).toContain("px-1.5 py-1");
  });

  it("T-28: 🔴 EXACTLY ONE PADDING CLASS PER AXIS, at BOTH densities", () => {
    // twMerge keeps the LAST of two conflicting classes, so a second one anywhere is a silent,
    // invisible override. Density is a COMPLETE string picked from a record, never an append.
    for (const density of ["default", "compact"] as const) {
      const container = renderDensity({ density });
      for (const cls of [thClass(container), tdClass(container)]) {
        expect(cls.match(/\bpx-[\w.]+/g) ?? [], density).toHaveLength(1);
        expect(cls.match(/\bpy-[\w.]+/g) ?? [], density).toHaveLength(1);
      }
      cleanup();
    }
  });

  it("T-29: ⚠ THE HEAD KEEPS `text-2xs` AND THE ROW KEEPS ITS OWN STRING — both deliberate", () => {
    const container = renderDensity({ density: "compact" });
    // A one-pixel type reduction on the heading is not what the owner judged, and `text-2xs` is not
    // defined in this package's own tokens — compact does not reach for a third type step.
    expect(thClass(container)).toContain("text-2xs");
    // A row's HEIGHT is its cells' padding. A row-level height class would fight the cell's own.
    expect(trClass(container, 1)).toBe("border-b border-border last:border-0");
  });
});

describe("T-30 … T-33: the wrap axis", () => {
  it("T-30: 🔴 EXACTLY ONE WHITESPACE/OVERFLOW CLASS ON EVERY PATH, head and cell alike", () => {
    for (const wrap of ["wrap", "nowrap", "truncate"] as const) {
      const container = renderDensity({ wrap });
      // The head has never wrapped and still never does — always exactly one class.
      expect(wrapClasses(thClass(container)), `head ${wrap}`).toHaveLength(1);
      // The body cell emits nothing at all under "wrap", and exactly one otherwise.
      expect(wrapClasses(tdClass(container)), `cell ${wrap}`).toHaveLength(wrap === "wrap" ? 0 : 1);
      cleanup();
    }
  });

  it("T-31: 🔴 A HEAD NEVER WRAPS, WHATEVER THE TABLE ASKS — only whether it also truncates", () => {
    expect(wrapClasses(thClass(renderDensity({ wrap: "wrap" })))).toEqual(["whitespace-nowrap"]);
    cleanup();
    expect(wrapClasses(thClass(renderDensity({ wrap: "nowrap" })))).toEqual(["whitespace-nowrap"]);
    cleanup();
    expect(wrapClasses(thClass(renderDensity({ wrap: "truncate" })))).toEqual(["truncate"]);
  });

  it("T-32: a body cell takes the table's answer, and its own `wrap` prop beats it", () => {
    expect(wrapClasses(tdClass(renderDensity({ wrap: "truncate" })))).toEqual(["truncate"]);
    cleanup();
    // ⚠ THE CHIP COLUMN'S ESCAPE HATCH: one line, nothing clipped, inside a truncating table — and
    //   no ceiling either, since a cap without clipping just spills the value out of the cell.
    const container = renderDensity({ wrap: "truncate" }, {}, { wrap: "nowrap" });
    expect(wrapClasses(tdClass(container))).toEqual(["whitespace-nowrap"]);
    expect(widthClasses(tdClass(container))).toEqual([]);
  });

  it("T-33: a truncating cell whose children are a STRING gets a `title`; an element's does not", () => {
    const withText = renderDensity({ wrap: "truncate" }, {}, {}, "Freshmark Distribution Centre");
    expect(withText.querySelector("td")?.getAttribute("title")).toBe(
      "Freshmark Distribution Centre",
    );
    cleanup();
    // 🔴 NO TOOLTIP IS INVENTED FOR ELEMENT CHILDREN. "[object Object]" is worse than nothing.
    const withChip = renderDensity({ wrap: "truncate" }, {}, {}, <span>chip</span>);
    expect(withChip.querySelector("td")?.hasAttribute("title")).toBe(false);
  });
});

describe("T-34 … T-38: the per-column width scale", () => {
  it("T-34: 🔴 A WIDTH IS EMITTED ONLY WHERE THE ELEMENT IS TRUNCATING", () => {
    // Capping a column that is not clipping its overflow makes the value spill visibly out of its
    // cell — and emitting nothing under the other two is what keeps every existing render identical.
    for (const wrap of ["wrap", "nowrap"] as const) {
      const container = renderDensity(
        { wrap, columnWidth: "narrow" },
        { width: "wide" },
        { width: "wide" },
      );
      expect(widthClasses(thClass(container)), `head ${wrap}`).toEqual([]);
      expect(widthClasses(tdClass(container)), `cell ${wrap}`).toEqual([]);
      cleanup();
    }
  });

  it("T-35: 🔴 A TABLE THAT ASKS TO CUT, CUTS — `truncate` defaults its columns to `medium`", () => {
    // `text-overflow: ellipsis` fires only against a definite width. A truncating table with no cap
    // anywhere would silently cut nothing, which is a setting named "cut it" that does not.
    const container = renderDensity({ wrap: "truncate" });
    expect(widthClasses(thClass(container))).toEqual(["max-w-[11rem]"]);
    expect(widthClasses(tdClass(container))).toEqual(["max-w-[11rem]"]);
  });

  it("T-36: all four steps, and `full` means NEVER CUT THIS COLUMN", () => {
    const expected: Record<string, readonly string[]> = {
      narrow: ["max-w-[6rem]"],
      medium: ["max-w-[11rem]"],
      wide: ["max-w-[20rem]"],
      full: [],
    };
    for (const [step, classes] of Object.entries(expected)) {
      const container = renderDensity(
        { wrap: "truncate" },
        { width: step as TableColumnWidth },
        { width: step as TableColumnWidth },
      );
      expect(widthClasses(thClass(container)), step).toEqual(classes);
      expect(widthClasses(tdClass(container)), step).toEqual(classes);
      cleanup();
    }
  });

  it("T-37: 🔴 THE SAME STEP PRODUCES THE SAME CLASS ON THE HEAD AND THE CELL (the desync guard)", () => {
    // A column is three elements in three rows and the WIDEST wins. If the head and the cell could
    // resolve one step differently, the column would refuse to narrow and it would read as a bug in
    // this package. (`GridHeadCell` and the grid's filter cell are covered in `Grid.test.tsx`.)
    for (const step of ["narrow", "medium", "wide", "full"] as const) {
      const container = renderDensity({ wrap: "truncate" }, { width: step }, { width: step });
      expect(widthClasses(thClass(container)), step).toEqual(widthClasses(tdClass(container)));
      cleanup();
    }
  });

  it("T-38: at most ONE max-width class, and a caller's own `className` still beats the step", () => {
    const container = renderDensity(
      { wrap: "truncate", columnWidth: "narrow" },
      { className: "max-w-[22rem]" },
      { className: "max-w-[22rem]" },
    );
    // Emitted BEFORE `className`, so twMerge keeps the caller's — one class, and it is theirs.
    expect(widthClasses(thClass(container))).toEqual(["max-w-[22rem]"]);
    expect(widthClasses(tdClass(container))).toEqual(["max-w-[22rem]"]);
  });
});
