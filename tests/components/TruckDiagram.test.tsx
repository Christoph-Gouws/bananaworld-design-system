import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { TruckDiagram, type TruckSlot } from "../../src";

// CR-DESIGN-SYSTEM-028 — the truck loading picture. Drop 2 (the last drop) is at the cab.

afterEach(cleanup);

const filled = (position: number, drop?: number): TruckSlot => ({
  position,
  state: "filled",
  label: `P${position}`,
  drop,
});
const range = (from: number, to: number, make: (p: number) => TruckSlot): TruckSlot[] =>
  Array.from({ length: to - from + 1 }, (_, i) => make(from + i));

const SHARED: TruckSlot[] = [
  ...range(1, 6, (p) => ({ position: p, state: "taken" as const, drop: 2 })),
  ...range(7, 11, (p) => filled(p, 1)),
  { position: 12, state: "selected", label: "P12", drop: 1 },
];
const props = { frontLabel: "Cab", backLabel: "Doors" } as const;

async function violations(container: HTMLElement): Promise<string[]> {
  return (await axe.run(container)).violations.map((v) => v.id);
}
const text = (el: Element) => el.textContent!.replace(/\s+/g, " ").trim();

describe("TruckDiagram reading order", () => {
  it("reads the cab, positions in order, then the doors; one list on a plain truck", () => {
    const { container } = render(<TruckDiagram {...props} positions={6} slots={[filled(1)]} />);
    expect(container.querySelectorAll("ol")).toHaveLength(1);
    const t = text(container);
    expect(t.startsWith("Cab")).toBe(true);
    expect(t.endsWith("Doors")).toBe(true);
    const nums = [...container.querySelectorAll("li")].map((li) => li.textContent);
    expect(nums).toHaveLength(6);
  });

  it("past the standard: list, warning paragraph, then a list starting at 31", () => {
    const { container } = render(
      <TruckDiagram {...props} positions={34} slots={[]} standardPositions={30} />,
    );
    const kids = [...container.querySelectorAll("ol, p")].map((n) => n.tagName);
    expect(kids).toEqual(["P", "OL", "P", "OL", "P"]);
    expect(container.querySelectorAll("ol")[1]!.getAttribute("start")).toBe("31");
    expect(container.textContent).toContain("More than a standard truck");
  });

  it("no standardPositions means no warning at all", () => {
    const { container } = render(<TruckDiagram {...props} positions={34} slots={[]} />);
    expect(container.textContent).not.toContain("standard truck");
  });
});

describe("TruckDiagram drop blocks", () => {
  it("draws drop 2 at the cab and drop 1 by the doors, each block a named group", () => {
    const { container } = render(<TruckDiagram {...props} positions={30} slots={SHARED} />);
    const t = text(container);
    expect(t.indexOf("Cab")).toBeLessThan(t.indexOf("Drop 2 · unloaded last"));
    expect(t.indexOf("Drop 2 · unloaded last")).toBeLessThan(t.indexOf("Drop 1 · unloaded first"));
    expect(t.indexOf("Drop 1 · unloaded first")).toBeLessThan(t.lastIndexOf("Doors"));
    const groups = container.querySelectorAll("[role='group'][aria-label^='Drop']");
    expect([...groups].map((g) => g.getAttribute("aria-label"))).toEqual([
      "Drop 2 · unloaded last",
      "Drop 1 · unloaded first",
    ]);
    expect(container.querySelectorAll("ol")[1]!.getAttribute("start")).toBe("7");
  });

  it("a dropLabel override replaces the dividers", () => {
    const { container } = render(
      <TruckDiagram
        {...props}
        positions={12}
        slots={SHARED}
        dropLabel={(d, end) => `Entrega ${d}${end === "cab" ? " · por último" : ""}`}
      />,
    );
    expect(container.textContent).toContain("Entrega 2 · por último");
    expect(container.textContent).toContain("Entrega 1");
    expect(container.textContent).not.toContain("unloaded");
  });

  it("the odd space of a shared row carries a drop tag in its name", () => {
    render(
      <TruckDiagram
        {...props}
        positions={6}
        onSlotTap={() => undefined}
        slots={[filled(1, 2), filled(2, 2), filled(3, 2), filled(4, 1), filled(5, 1), filled(6, 1)]}
      />,
    );
    // rows: [1,2]=2, [3,4]: left 3 is drop 2 so block 2, cell 4 tagged "Drop 1"
    expect(screen.getByRole("button", { name: /Position 4.*Drop 1/ })).toBeTruthy();
  });

  it("one drop and no drop draw no group and no divider", () => {
    for (const slots of [range(1, 4, (p) => filled(p, 1)), range(1, 4, (p) => filled(p))]) {
      const { container } = render(<TruckDiagram {...props} positions={6} slots={slots} />);
      expect(container.querySelector("[role='group'][aria-label^='Drop']")).toBeNull();
      expect(container.textContent).not.toContain("Drop");
      cleanup();
    }
  });
});

describe("TruckDiagram interaction", () => {
  it("tapping an empty, filled or selected space reports its position; Enter and Space work", async () => {
    const onSlotTap = vi.fn();
    const user = userEvent.setup();
    render(<TruckDiagram {...props} positions={12} slots={SHARED} onSlotTap={onSlotTap} />);
    await user.click(screen.getByRole("button", { name: /^Position 7 / }));
    await user.click(screen.getByRole("button", { name: /^Position 12 / }));
    expect(onSlotTap.mock.calls).toEqual([[7], [12]]);
    const seven = screen.getByRole("button", { name: /^Position 7 / });
    seven.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSlotTap).toHaveBeenCalledTimes(4);
  });

  it("an empty space is a button too", async () => {
    const onSlotTap = vi.fn();
    render(<TruckDiagram {...props} positions={4} slots={[]} onSlotTap={onSlotTap} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Position 3 Empty" }));
    expect(onSlotTap).toHaveBeenCalledWith(3);
  });

  it("a taken space is never a button, even with onSlotTap", () => {
    const onSlotTap = vi.fn();
    render(<TruckDiagram {...props} positions={6} slots={SHARED} onSlotTap={onSlotTap} />);
    expect(screen.queryByRole("button", { name: /Position 3/ })).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(6 - 0);
  });

  it("without onSlotTap there is no button and nothing focusable", () => {
    const { container } = render(<TruckDiagram {...props} positions={12} slots={SHARED} />);
    expect(container.querySelectorAll("button, a, [tabindex]")).toHaveLength(0);
  });
});

describe("TruckDiagram names and states", () => {
  it("names a space by position and label, or position and state word", () => {
    render(<TruckDiagram {...props} positions={12} slots={SHARED} onSlotTap={() => undefined} />);
    expect(screen.getByRole("button", { name: "Position 7 P7" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Position 12 P12 Selected" })).toBeTruthy();
  });

  it("a taken slot given a label never shows it; it shows the word and the note", () => {
    const { container } = render(
      <TruckDiagram
        {...props}
        positions={2}
        slots={[{ position: 1, state: "taken", label: "SECRET-9", note: "Drop 2" }]}
      />,
    );
    expect(container.textContent).not.toContain("SECRET-9");
    expect(container.textContent).toContain("Taken");
    expect(container.textContent).toContain("Drop 2");
  });

  it("selected is not colour alone: a check icon (aria-hidden) and a word", () => {
    const { container } = render(<TruckDiagram {...props} positions={12} slots={SHARED} />);
    expect(container.querySelector("svg.lucide-check[aria-hidden='true']")).toBeTruthy();
    expect(container.textContent).toContain("Selected");
  });

  it("words override per key; undefined falls back", () => {
    const { container } = render(
      <TruckDiagram
        {...props}
        positions={2}
        slots={[{ position: 1, state: "taken" }]}
        words={{ taken: "Ocupado", empty: undefined }}
      />,
    );
    expect(container.textContent).toContain("Ocupado");
    expect(container.textContent).toContain("Empty");
  });

  it("every space has the 48 px and the tablet 56 px floors", () => {
    const { container } = render(<TruckDiagram {...props} positions={12} slots={SHARED} />);
    const cells = container.querySelectorAll("li > *");
    expect(cells).toHaveLength(12);
    for (const c of cells) {
      expect(c.className).toContain("min-h-12");
      expect(c.className).toContain("min-h-14");
    }
  });
});

describe("TruckDiagram plumbing", () => {
  it("renders on the server without onSlotTap, drops included", () => {
    const html = renderToString(<TruckDiagram {...props} positions={30} slots={SHARED} />);
    expect(html).toContain("Drop 2 · unloaded last");
  });

  it("is server-safe and token-only by source", () => {
    for (const f of ["TruckDiagram.tsx", "truck-diagram-layout.ts"]) {
      const src = readFileSync(resolve(__dirname, "../../src/components", f), "utf8");
      expect(src).not.toMatch(/["']use client["']/);
      expect(src).not.toMatch(/\buse[A-Z]\w*\(/);
      expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(src).not.toContain("rgb(");
    }
  });

  it("merges className, passes data-* and forwards the ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <TruckDiagram {...props} ref={ref} positions={2} slots={[]} className="extra" data-x="1" />,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current!.className).toContain("extra");
    expect(ref.current!.getAttribute("data-x")).toBe("1");
  });
});

describe("TruckDiagram axe", () => {
  it.each([
    ["read-only", { slots: SHARED, positions: 30 }],
    ["interactive", { slots: SHARED, positions: 30, onSlotTap: () => undefined }],
    ["three drops", { slots: [filled(1, 3), filled(4, 2), filled(8, 1)], positions: 10 }],
    ["over standard", { slots: SHARED, positions: 34, standardPositions: 30 }],
    ["zero", { slots: [], positions: 0 }],
  ])("%s has no violations", async (_name, extra) => {
    const { container } = render(<TruckDiagram {...props} {...extra} />);
    expect(await violations(container)).toEqual([]);
  });
});

// CR-DESIGN-SYSTEM-029 — compact density (phones). happy-dom applies no CSS, so these pin the
// class strings and the unchanged DOM; the real-browser proof is in the change evidence.
describe("TruckDiagram compact", () => {
  const cellsOf = (c: HTMLElement) => [...c.querySelectorAll("li > *")];
  const shared = { ...props, positions: 30, slots: SHARED, onSlotTap: () => undefined };

  it("compact spaces are 40 px below 640 px and keep the tablet 56 px only from sm up", () => {
    const { container } = render(<TruckDiagram {...shared} density="compact" />);
    for (const c of cellsOf(container)) {
      expect(c.className).toContain("max-sm:min-h-10");
      expect(c.className).toContain("sm:[[data-surface=tablet]_&]:min-h-14");
      expect(c.className.split(/\s+/)).not.toContain("[[data-surface=tablet]_&]:min-h-14");
      expect(c.className).toContain("max-sm:flex-row");
    }
  });

  it("default and density=default keep the shipped strings and the same markup", () => {
    const none = renderToString(<TruckDiagram {...shared} />);
    expect(renderToString(<TruckDiagram {...shared} density="default" />)).toBe(none);
    const unknown = "x" as "default";
    expect(renderToString(<TruckDiagram {...shared} density={unknown} />)).toBe(none);
    expect(none).not.toContain("max-sm:");
  });

  it("has the same accessible names, buttons, list starts and groups as default", () => {
    const read = (d?: "compact") => {
      const { container } = render(<TruckDiagram {...shared} density={d} />);
      const out = {
        names: cellsOf(container).map((e) => text(e)),
        buttons: container.querySelectorAll("button").length,
        starts: [...container.querySelectorAll("ol")].map((o) => o.getAttribute("start")),
        groups: [...container.querySelectorAll("[role=group]")].map((g) =>
          g.getAttribute("aria-label"),
        ),
      };
      cleanup();
      return out;
    };
    expect(read("compact")).toEqual(read());
  });

  it("taken shows no pallet number; warning, drop dividers, Cab and Doors stay", () => {
    const slots: TruckSlot[] = [
      { position: 1, state: "taken", label: "SECRET", drop: 2 },
      ...range(2, 12, (p) => filled(p, 1)),
    ];
    const { container } = render(
      <TruckDiagram
        {...props}
        density="compact"
        positions={34}
        standardPositions={30}
        slots={slots}
      />,
    );
    const t = text(container);
    expect(t).not.toContain("SECRET");
    for (const word of ["More than a standard truck", "Drop 2", "Drop 1", "Cab", "Doors"]) {
      expect(t).toContain(word);
    }
  });

  it("density is never a DOM attribute", () => {
    const { container } = render(
      <TruckDiagram {...props} density="compact" positions={2} slots={[]} />,
    );
    expect(container.firstElementChild!.hasAttribute("density")).toBe(false);
  });

  it.each([
    ["read-only", { slots: SHARED, positions: 30 }],
    ["interactive", { slots: SHARED, positions: 30, onSlotTap: () => undefined }],
    ["three drops", { slots: [filled(1, 3), filled(4, 2), filled(8, 1)], positions: 10 }],
    ["over standard", { slots: SHARED, positions: 34, standardPositions: 30 }],
  ])("compact %s has no axe violations", async (_name, extra) => {
    const { container } = render(<TruckDiagram {...props} {...extra} density="compact" />);
    expect(await violations(container)).toEqual([]);
  });
});
