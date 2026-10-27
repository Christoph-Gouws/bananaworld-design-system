import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GridFilterRow, Table, TableBody, TableHeader } from "../../src";

// CR-DESIGN-SYSTEM-022 (review follow-up to CR-DESIGN-SYSTEM-013 F1): the grid filter's three open
// lists (single, multi, allTicked) share ONE chrome constant. Opened in turn, their menus must carry
// the same class attribute, and it must be the one that shipped.
const SHIPPED =
  "z-[var(--z-dropdown)] max-h-[15rem] w-[13rem] overflow-y-auto rounded-md border border-border-strong bg-surface p-1 shadow-lg animate-fade-in";

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

afterEach(() => {
  cleanup();
  document.body.style.pointerEvents = "";
});

const OPTIONS = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];

describe("the grid filter's open lists", () => {
  it("share one chrome", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Table>
        <TableHeader>
          <GridFilterRow
            columns={[
              { key: "one", kind: "select", label: "One", placeholder: "Any", options: OPTIONS },
              {
                key: "many",
                kind: "select",
                multiple: true,
                label: "Many",
                placeholder: "Any",
                options: OPTIONS,
              },
              {
                key: "ticked",
                kind: "select",
                multiple: true,
                selectAll: "allTicked",
                label: "Ticked",
                placeholder: "Any",
                options: OPTIONS,
              },
            ]}
            values={{}}
            onChange={() => undefined}
          />
        </TableHeader>
        <TableBody />
      </Table>,
    );
    const classes: string[] = [];
    for (const label of ["One", "Many", "Ticked"]) {
      await user.click(screen.getByRole("button", { name: `Filter by ${label}` }));
      classes.push(screen.getByRole("menu").className);
      await user.keyboard("{Escape}");
    }
    expect(classes).toEqual([SHIPPED, SHIPPED, SHIPPED]);
  });
});
