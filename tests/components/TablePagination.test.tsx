import { useState, type ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Imported FROM THE PACKAGE ROOT (spec 17). A control a consumer cannot reach from "@bananaworld/
// design-system" has not shipped, whatever the file on disk says.
import { TablePagination, TABLE_PAGE_SIZES, type TablePageState } from "../../src";

// CR-DESIGN-SYSTEM-004 — the shared paging bar, owner-approved layout A: the count at the top left,
// the rows-per-page picker and the arrows at the top right, the arrows again at the bottom right.
//
// This is NOT a performance change. Nothing in this suite measures speed and nothing may claim it.

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

const noop = (): void => {};

function statusText(): string {
  return screen.getByRole("status").textContent ?? "";
}

function previousButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /previous/i }) as HTMLButtonElement;
}

function nextButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /next/i }) as HTMLButtonElement;
}

/** Both bars around a table, driven by one piece of state — how a consumer is told to render it. */
function ListHarness({
  initial = { page: 1, pageSize: 25 },
  total = 312,
}: {
  readonly initial?: TablePageState;
  readonly total?: number;
}): ReactElement {
  const [paging, setPaging] = useState<TablePageState>(initial);
  return (
    <div>
      <TablePagination
        placement="top"
        page={paging.page}
        pageSize={paging.pageSize}
        totalCount={total}
        onChange={setPaging}
      />
      <table>
        <tbody>
          <tr>
            <td>
              <a href="#row">a row the operator can tab to</a>
            </td>
          </tr>
        </tbody>
      </table>
      <TablePagination
        placement="bottom"
        page={paging.page}
        pageSize={paging.pageSize}
        totalCount={total}
        onChange={setPaging}
      />
    </div>
  );
}

describe("the page-size picker (specs 9, 15)", () => {
  it("is a labelled combobox reading the size in force", () => {
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={noop} />);
    const picker = screen.getByRole("combobox", { name: "Rows per page" });
    expect(picker).toBeTruthy();
    expect(picker.textContent).toContain("25");
  });

  it("offers exactly the four sizes, in order", async () => {
    const user = userEvent.setup();
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={noop} />);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(TABLE_PAGE_SIZES.map(String));
  });

  it("🔴 choosing 100 emits ONE call carrying BOTH fields, with the page reset to 1 (D-5, D-6)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Deliberately not on page 1: the reset is the assertion.
    render(<TablePagination page={7} pageSize={25} totalCount={312} onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await screen.findAllByRole("option");
    await user.click(screen.getByRole("option", { name: "100" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
  });

  it("honours a consumer's own list of sizes without inventing one", async () => {
    const user = userEvent.setup();
    render(
      <TablePagination
        page={1}
        pageSize={10}
        totalCount={312}
        pageSizes={[10, 20]}
        onChange={noop}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["10", "20"]);
  });
});

describe("the arrows (specs 10, 11)", () => {
  it("the FIRST page disables Previous and leaves Next live", () => {
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={noop} />);
    expect(previousButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(false);
  });

  it("the LAST page disables Next and leaves Previous live", () => {
    render(<TablePagination page={13} pageSize={25} totalCount={312} onChange={noop} />);
    expect(previousButton().disabled).toBe(false);
    expect(nextButton().disabled).toBe(true);
  });

  it("a total of ZERO disables both", () => {
    render(<TablePagination page={1} pageSize={25} totalCount={0} onChange={noop} />);
    expect(previousButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(true);
  });

  it("Next on page 1 emits page 2, carrying the size unchanged", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TablePagination page={1} pageSize={50} totalCount={312} onChange={onChange} />);
    await user.click(nextButton());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ page: 2, pageSize: 50 });
  });

  it("Previous on page 2 emits page 1, carrying the size unchanged", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TablePagination page={2} pageSize={50} totalCount={312} onChange={onChange} />);
    await user.click(previousButton());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
  });

  it("a DISABLED arrow emits nothing when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={onChange} />);
    await user.click(previousButton());
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("the range text at every boundary (spec 12)", () => {
  function textFor(page: number, pageSize: number, total: number): string {
    cleanup();
    render(
      <TablePagination page={page} pageSize={pageSize} totalCount={total} onChange={noop} />,
    );
    return statusText();
  }

  it("reads the first page of a long list", () => {
    expect(textFor(1, 25, 312)).toBe("Showing 1–25 of 312");
  });

  it("reads the honest remainder on the last page — never a padded page", () => {
    expect(textFor(13, 25, 312)).toBe("Showing 301–312 of 312");
  });

  it("reads an EXACT MULTIPLE without offering an empty extra page", () => {
    expect(textFor(4, 25, 100)).toBe("Showing 76–100 of 100");
  });

  it("reads a total of ZERO honestly rather than blanking or hiding", () => {
    expect(textFor(1, 25, 0)).toBe("Showing 0 of 0");
  });

  it("reads a last page holding a single row, left literal rather than collapsed (D-8)", () => {
    expect(textFor(13, 26, 313)).toBe("Showing 313–313 of 313");
  });
});

describe("the range text is text, not an aria afterthought (spec 13)", () => {
  it("lives in a live region whose announced text IS its visible text", () => {
    render(<TablePagination page={2} pageSize={25} totalCount={312} onChange={noop} />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Showing 26–50 of 312");
    // No aria-label anywhere near it: what is announced is what is on the screen, character for
    // character. An aria-label here would be free to drift from the visible string.
    expect(status.getAttribute("aria-label")).toBeNull();
  });
});

describe("keyboard reachability (spec 14)", () => {
  it("Tab reaches the picker, then Next — the disabled Previous is SKIPPED", async () => {
    const user = userEvent.setup();
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={noop} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.tab();
    expect(document.activeElement).toBe(nextButton());
  });

  it("Tab reaches the picker, then Previous, then Next in visual order when both are live", async () => {
    const user = userEvent.setup();
    render(<TablePagination page={7} pageSize={25} totalCount={312} onChange={noop} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.tab();
    expect(document.activeElement).toBe(previousButton());
    await user.tab();
    expect(document.activeElement).toBe(nextButton());
  });

  it("Enter on Next pages forward", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={onChange} />);
    nextButton().focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith({ page: 2, pageSize: 25 });
  });

  it("uses no positive tabIndex anywhere — document order IS the order", () => {
    const { container } = render(<ListHarness />);
    const positive = Array.from(container.querySelectorAll("[tabindex]")).filter(
      (el) => Number(el.getAttribute("tabindex")) > 0,
    );
    expect(positive).toHaveLength(0);
  });
});

describe("🔴 a stale page corrects the RENDER and never calls back (spec 16, D-7)", () => {
  it("page 9 of 4 renders page 4's range with Next disabled, and emits nothing on mount", () => {
    const onChange = vi.fn();
    render(<TablePagination page={9} pageSize={25} totalCount={100} onChange={onChange} />);
    expect(statusText()).toBe("Showing 76–100 of 100");
    expect(nextButton().disabled).toBe(true);
    // A callback fired during render to "fix" the parent is a re-render loop and a lie about who
    // owns the state. If someone ever adds one, this is the test that stops it.
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("the two placements (specs 18, 19, 21, 22)", () => {
  it("🔴 placement=\"bottom\" renders NO picker — asserted by absence, so none can creep back", () => {
    render(
      <TablePagination
        placement="bottom"
        page={1}
        pageSize={25}
        totalCount={312}
        onChange={noop}
      />,
    );
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("the bottom bar carries the arrows only — no range text in layout A", () => {
    render(
      <TablePagination
        placement="bottom"
        page={2}
        pageSize={25}
        totalCount={312}
        onChange={noop}
      />,
    );
    expect(previousButton()).toBeTruthy();
    expect(nextButton()).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.body.textContent).not.toContain("Showing");
  });

  it("the bottom bar's arrows work, and its disabled states match the top bar's", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TablePagination
        placement="bottom"
        page={2}
        pageSize={25}
        totalCount={312}
        onChange={onChange}
      />,
    );
    expect(previousButton().disabled).toBe(false);
    expect(nextButton().disabled).toBe(false);
    await user.click(previousButton());
    expect(onChange).toHaveBeenCalledWith({ page: 1, pageSize: 25 });

    cleanup();
    render(
      <TablePagination placement="bottom" page={1} pageSize={25} totalCount={0} onChange={noop} />,
    );
    expect(previousButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(true);
  });

  it("defaults to the COMPLETE bar, so a one-bar consumer never gets orphan arrows", () => {
    render(<TablePagination page={1} pageSize={25} totalCount={312} onChange={noop} />);
    expect(screen.getByRole("combobox", { name: "Rows per page" })).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "List paging" })).toBeTruthy();
  });

  it("the two bars are distinguishable to a screen reader (spec 22)", () => {
    render(<ListHarness />);
    expect(screen.getByRole("navigation", { name: /end of list/i })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "List paging" })).toBeTruthy();
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
  });
});

describe("🔴 exactly one live region per list (spec 20, D-19)", () => {
  it("both bars around one table announce ONCE, from the top bar", () => {
    render(<ListHarness />);
    const regions = screen.getAllByRole("status");
    expect(regions).toHaveLength(1);
    const topBar = screen.getByRole("navigation", { name: "List paging" });
    expect(topBar.contains(regions[0] as Node)).toBe(true);
  });
});

describe("the two bars driven by one state (spec 23)", () => {
  it("keyboard order runs top picker → top arrows → the list → bottom arrows", async () => {
    const user = userEvent.setup();
    render(<ListHarness initial={{ page: 7, pageSize: 25 }} />);

    const order: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      const el = document.activeElement as HTMLElement | null;
      order.push(el?.textContent?.trim() ?? "");
    }
    expect(order).toEqual([
      "25",
      "Previous",
      "Next",
      "a row the operator can tab to",
      "Previous",
      "Next",
    ]);
  });

  it("paging from the BOTTOM bar moves the top bar's count — one state, never two", async () => {
    const user = userEvent.setup();
    render(<ListHarness />);
    expect(statusText()).toBe("Showing 1–25 of 312");

    const [, bottomNext] = screen.getAllByRole("button", { name: /next/i });
    await user.click(bottomNext as HTMLElement);
    expect(statusText()).toBe("Showing 26–50 of 312");
  });

  it("changing the size from the top bar resets both bars to page 1", async () => {
    const user = userEvent.setup();
    render(<ListHarness initial={{ page: 7, pageSize: 25 }} />);
    expect(statusText()).toBe("Showing 151–175 of 312");

    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await screen.findAllByRole("option");
    await user.click(screen.getByRole("option", { name: "100" }));

    expect(statusText()).toBe("Showing 1–100 of 312");
    const [topPrevious] = screen.getAllByRole("button", { name: /previous/i });
    expect((topPrevious as HTMLButtonElement).disabled).toBe(true);
  });
});
