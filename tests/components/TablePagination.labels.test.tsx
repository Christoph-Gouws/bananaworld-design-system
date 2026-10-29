import { useState, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

// Imported FROM THE PACKAGE ROOT: a name a consumer cannot reach from "@bananaworld/design-system"
// has not shipped.
import {
  DEFAULT_TABLE_PAGINATION_LABELS,
  TablePagination,
  type TablePageState,
  type TablePaginationLabels,
} from "../../src";
import { TablePaginationAt6a25c8d } from "../fixtures/TablePagination.at-6a25c8d";

// CR-DESIGN-SYSTEM-024 — `labels` lets an app translate the paging bar. Two promises are pinned here:
// without `labels` the markup is byte-identical to 6a25c8d, and with Portuguese labels the structure
// (roles, order, disabled state, live region, picker) does not move.

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

const noop = (): void => {};

const PT: Partial<TablePaginationLabels> = {
  previous: "Anterior",
  next: "Seguinte",
  rowsPerPage: "Linhas por página",
  listPaging: "Paginação da lista",
  listPagingEnd: "Paginação da lista, fim da lista",
  range: ({ position, total }) => (
    <>
      {"A mostrar "}
      <span className="font-medium text-fg">{position}</span>
      {" de "}
      <span className="font-medium text-fg">{total}</span>
    </>
  ),
};

// useId-derived ids differ between two renders of the same tree; the shape around them must not.
const normaliseIds = (html: string): string =>
  html.replace(/(id|aria-controls|aria-labelledby)="[^"]*"/g, '$1="X"');

const CELLS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 25, 312],
  [7, 25, 312],
  [13, 25, 312],
  [4, 25, 100],
  [1, 25, 0],
  [13, 26, 313],
  [9, 25, 100],
];
const PLACEMENTS = ["top", "bottom", undefined] as const;
const LABEL_SHAPES: ReadonlyArray<Partial<TablePaginationLabels> | undefined | "omit"> = [
  "omit",
  undefined,
  {},
  { previous: undefined },
  DEFAULT_TABLE_PAGINATION_LABELS,
];

describe("byte-identical when `labels` is absent (request item 2)", () => {
  it("server markup AND client DOM equal the frozen 6a25c8d component across the matrix", () => {
    let compared = 0;
    for (const [page, pageSize, totalCount] of CELLS) {
      for (const placement of PLACEMENTS) {
        for (const pageSizes of [undefined, [10, 20]]) {
          for (const className of [undefined, "extra"]) {
            for (const shape of LABEL_SHAPES) {
              const base = {
                page,
                pageSize,
                totalCount,
                onChange: noop,
                placement,
                pageSizes,
                className,
              };
              const next = shape === "omit" ? base : { ...base, labels: shape };
              const before = <TablePaginationAt6a25c8d {...base} />;
              const after = <TablePagination {...next} />;

              expect(renderToString(after)).toBe(renderToString(before));

              const a = render(before);
              const htmlBefore = normaliseIds(a.container.innerHTML);
              a.unmount();
              const b = render(after);
              expect(normaliseIds(b.container.innerHTML)).toBe(htmlBefore);
              b.unmount();
              compared += 1;
            }
          }
        }
      }
    }
    expect(compared).toBe(CELLS.length * 3 * 2 * 2 * LABEL_SHAPES.length);
    // ~8s on a CI runner (hundreds of full renders); the default 5s is too tight.
  }, 60_000);

  it("the opened picker's listbox is identical too", async () => {
    const user = userEvent.setup();
    const props = { page: 2, pageSize: 25, totalCount: 312, onChange: noop };
    const a = render(<TablePaginationAt6a25c8d {...props} />);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    const before = normaliseIds(screen.getByRole("listbox").outerHTML);
    a.unmount();
    cleanup();
    render(<TablePagination {...props} />);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    expect(normaliseIds(screen.getByRole("listbox").outerHTML)).toBe(before);
  });
});

function Harness({
  labels,
  initial = { page: 1, pageSize: 25 },
  total = 312,
}: {
  readonly labels?: Partial<TablePaginationLabels>;
  readonly initial?: TablePageState;
  readonly total?: number;
}): ReactElement {
  const [paging, setPaging] = useState<TablePageState>(initial);
  const bar = (placement: "top" | "bottom"): ReactElement => (
    <TablePagination
      placement={placement}
      page={paging.page}
      pageSize={paging.pageSize}
      totalCount={total}
      onChange={setPaging}
      labels={labels}
    />
  );
  return (
    <div>
      {bar("top")}
      <table>
        <tbody>
          <tr>
            <td>
              <a href="#row">a row</a>
            </td>
          </tr>
        </tbody>
      </table>
      {bar("bottom")}
    </div>
  );
}

type Outline = ReadonlyArray<readonly [string, string, boolean]>;

function outline(container: HTMLElement): Outline {
  const nodes = container.querySelectorAll<HTMLElement>(
    "nav, p[role=status], [role=combobox], button",
  );
  return Array.from(nodes).map((el) => {
    const role = el.tagName === "NAV" ? "navigation" : (el.getAttribute("role") ?? "button");
    const name =
      el.getAttribute("aria-label") ?? (role === "status" ? "" : (el.textContent ?? "").trim());
    return [role, name, (el as HTMLButtonElement).disabled === true] as const;
  });
}

function bars(): [HTMLElement, HTMLElement] {
  const [top, bottom] = screen.getAllByRole("navigation");
  return [top!, bottom!];
}

const ENGLISH_WORDS = /Showing|Rows per page|Previous|Next|List paging/;

describe("Portuguese labels (request item 5)", () => {
  it("renders the words in both placements, with no English left", () => {
    const { container } = render(<Harness labels={PT} />);
    const [top, bottom] = bars();

    expect(within(top).getByRole("status").textContent).toBe("A mostrar 1–25 de 312");
    expect(within(top).getByText("Linhas por página")).toBeTruthy();
    expect(within(top).getByRole("combobox", { name: "Linhas por página" })).toBeTruthy();
    expect(within(top).getByRole("button", { name: "Anterior" })).toBeTruthy();
    expect(within(top).getByRole("button", { name: "Seguinte" })).toBeTruthy();
    expect(within(bottom).getByRole("button", { name: "Anterior" })).toBeTruthy();
    expect(within(bottom).getByRole("button", { name: "Seguinte" })).toBeTruthy();
    expect(top.getAttribute("aria-label")).toBe("Paginação da lista");
    expect(bottom.getAttribute("aria-label")).toBe("Paginação da lista, fim da lista");

    expect(container.textContent).not.toMatch(ENGLISH_WORDS);
    for (const el of container.querySelectorAll("[aria-label]")) {
      expect(el.getAttribute("aria-label")).not.toMatch(ENGLISH_WORDS);
    }
  });

  it("has the same accessibility outline as English: same roles, order, disabled state, names map one-to-one", () => {
    const en = render(<Harness />);
    const english = outline(en.container);
    en.unmount();
    const pt = render(<Harness labels={PT} />);
    const portuguese = outline(pt.container);

    expect(portuguese.map(([role, , disabled]) => [role, disabled])).toEqual(
      english.map(([role, , disabled]) => [role, disabled]),
    );
    const map: Record<string, string> = {
      "List paging": "Paginação da lista",
      "List paging, end of list": "Paginação da lista, fim da lista",
      "Rows per page": "Linhas por página",
      Previous: "Anterior",
      Next: "Seguinte",
    };
    english.forEach(([role, name], i) => {
      if (role === "status") return;
      expect(portuguese[i]![1].replace(/\s+/g, " ")).toBe(map[name.replace(/\s+/g, " ")] ?? name);
    });
  });

  it("keeps the structure rules: one status in the top bar, the picker only there, tabular numbers", () => {
    render(<Harness labels={PT} />);
    const [top, bottom] = bars();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(top.contains(screen.getByRole("status"))).toBe(true);
    expect(screen.getByRole("status").hasAttribute("aria-label")).toBe(false);
    expect(screen.getByRole("status").className).toContain("tabular-nums");
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(bottom.querySelector("[role=combobox]")).toBeNull();
  });

  it("pages from the bottom bar and the top status follows, in Portuguese", async () => {
    const user = userEvent.setup();
    render(<Harness labels={PT} />);
    const [, bottom] = bars();
    await user.click(within(bottom).getByRole("button", { name: "Seguinte" }));
    expect(screen.getByRole("status").textContent).toBe("A mostrar 26–50 de 312");
  });

  it("keeps D-8 through a translation via `position`", () => {
    const a = render(<Harness labels={PT} initial={{ page: 13, pageSize: 26 }} total={313} />);
    expect(screen.getByRole("status").textContent).toBe("A mostrar 313–313 de 313");
    a.unmount();
    render(<Harness labels={PT} total={0} />);
    expect(screen.getByRole("status").textContent).toBe("A mostrar 0 de 0");
  });

  it("a partial `labels` translates only what it names", () => {
    render(<Harness labels={{ next: "Seguinte" }} />);
    expect(screen.getAllByRole("button", { name: "Seguinte" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Previous" })).toHaveLength(2);
    expect(screen.getByRole("status").textContent).toBe("Showing 1–25 of 312");
  });

  it("the shared default cannot be mutated", () => {
    expect(() => {
      (DEFAULT_TABLE_PAGINATION_LABELS as { next: string }).next = "x";
    }).toThrow();
    expect(DEFAULT_TABLE_PAGINATION_LABELS.next).toBe("Next");
  });

  it("has no axe violations in Portuguese", async () => {
    const { container } = render(<Harness labels={PT} />);
    const res = await axe.run(container);
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });
});
