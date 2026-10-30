import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Scale } from "lucide-react";

import { StatTile, StatTileRow } from "../../src";

// CR-DESIGN-SYSTEM-026 — the read-only headline figure tile.

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

afterEach(cleanup);

async function axeViolations(container: HTMLElement): Promise<string[]> {
  const result = await axe.run(container);
  return result.violations.map((v) => v.id);
}

describe("StatTile reading", () => {
  it("reads label, value, unit, then sub; label/value/unit share one paragraph", () => {
    const { container } = render(
      <StatTile label="Pallets" value="156" unit="pal." sub="2 814,00 units" />,
    );
    const paras = container.querySelectorAll("p");
    expect(paras).toHaveLength(2);
    expect(paras[0]!.textContent?.replace(/\s+/g, " ").trim()).toBe("Pallets 156 pal.");
    expect(paras[1]!.textContent).toBe("2 814,00 units");
  });

  it("hides the icon, the accent rule and the chevron from assistive tech", () => {
    const { container } = render(
      <StatTile label="A" value="1" icon={<Scale data-testid="i" />} accent href="/x" />,
    );
    expect(screen.getByTestId("i").closest("[aria-hidden='true']")).toBeTruthy();
    expect(container.querySelectorAll("span.bg-accent[aria-hidden='true']")).toHaveLength(1);
    expect(container.querySelector("svg.lucide-chevron-right[aria-hidden='true']")).toBeTruthy();
  });

  it("draws the rule only with accent and the chevron only with href", () => {
    const { container } = render(<StatTile label="A" value="1" />);
    expect(container.querySelector(".bg-accent")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("StatTile value", () => {
  it("prints the value untouched, and 0 as 0", () => {
    const { container } = render(<StatTile label="A" value="2 814,00" />);
    expect(container.textContent).toContain("2 814,00");
    cleanup();
    const zero = render(<StatTile label="A" value="0" unit="kg" />);
    expect(zero.container.textContent).toContain("0");
    expect(zero.container.textContent).toContain("kg");
    expect(zero.container.textContent).not.toContain("—");
  });

  it.each([null, ""])("%j draws a dash read as words.empty, with no unit", (value) => {
    const { container } = render(<StatTile label="Waste" value={value} unit="kg" />);
    expect(container.querySelector("[aria-hidden='true']")?.textContent).toBe("—");
    expect(container.textContent).toContain("Nothing recorded yet");
    expect(container.textContent).not.toContain("kg");
  });

  it("still shows the sub-line with the dash", () => {
    render(<StatTile label="Waste" value={null} sub="No shift opened yet" />);
    expect(screen.getByText("No shift opened yet")).toBeTruthy();
  });

  it("words override per key; undefined falls back to the default", () => {
    const first = render(<StatTile label="A" value={null} words={{ empty: "Nada registado" }} />);
    expect(first.container.textContent).toContain("Nada registado");
    cleanup();
    const second = render(<StatTile label="A" value={null} words={{ empty: undefined }} />);
    expect(second.container.textContent).toContain("Nothing recorded yet");
  });
});

describe("StatTile control", () => {
  it("read-only is a plain div: no role, no tabindex, nothing focusable", () => {
    const { container } = render(<StatTile label="A" value="1" />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("role")).toBeNull();
    expect(root.getAttribute("tabindex")).toBeNull();
    expect(container.querySelector("a, button, [tabindex]")).toBeNull();
  });

  it("href renders one link named by its visible text; a caller aria-label wins", () => {
    render(<StatTile label="Waiting" value="7" unit="pal." sub="2 old" href="/waiting" />);
    const link = screen.getByRole("link", { name: "Waiting 7 pal. 2 old" });
    expect(link.getAttribute("href")).toBe("/waiting");
    cleanup();
    render(<StatTile label="Waiting" value="7" href="/w" aria-label="Waiting, 7 pallets" />);
    expect(screen.getByRole("link", { name: "Waiting, 7 pallets" })).toBeTruthy();
  });

  it("merges className, passes data-*, and forwards the ref", () => {
    const divRef = createRef<HTMLDivElement | HTMLAnchorElement>();
    const { container } = render(
      <StatTile ref={divRef} label="A" value="1" className="extra" data-x="y" />,
    );
    expect(container.firstElementChild!.className).toContain("extra");
    expect(container.firstElementChild!.getAttribute("data-x")).toBe("y");
    expect(divRef.current).toBe(container.firstElementChild);
    cleanup();
    const aRef = createRef<HTMLDivElement | HTMLAnchorElement>();
    render(<StatTile ref={aRef} label="A" value="1" href="/a" />);
    expect(aRef.current?.tagName).toBe("A");
  });
});

describe("StatTileRow", () => {
  it.each([
    [1, "grid-cols-1", "lg:grid-cols-1"],
    [2, "lg:grid-cols-2", "lg:grid-cols-3"],
    [3, "lg:grid-cols-3", "lg:grid-cols-4"],
    [4, "lg:grid-cols-4", "lg:grid-cols-3"],
    [5, "lg:grid-cols-4", "lg:grid-cols-5"],
  ])("%i children → %s", (n, has, lacks) => {
    const { container } = render(
      <StatTileRow>
        {Array.from({ length: n }, (_, i) => (
          <StatTile key={i} label={`L${i}`} value="1" />
        ))}
      </StatTileRow>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toContain(has);
    expect(cls).not.toContain(lacks);
    expect(cls.includes("grid-cols-2 ")).toBe(n >= 2);
  });
});

describe("StatTile server render and file rules", () => {
  // The linked path is the kit Link, a client component (its own server render is the app's);
  // here only the read-only tiles and the row are server-rendered.
  it("renders a row to a string with the figures", () => {
    const html = renderToString(
      <StatTileRow>
        <StatTile label="In" value="1 240" />
        <StatTile label="Waste" value={null} />
      </StatTileRow>,
    );
    expect(html).toContain("1 240");
    expect(html).toContain("Nothing recorded yet");
  });

  it("the file has no use-client directive and no hook call", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/StatTile.tsx"), "utf8");
    expect(src).not.toMatch(/["']use client["']/);
    expect(src).not.toMatch(/\buse[A-Z]\w*\(/);
  });
});

describe("StatTile accessibility", () => {
  it("has no axe violations: read-only, linked, empty, accented, full row", async () => {
    const { container } = render(
      <StatTileRow>
        <StatTile accent icon={<Scale />} label="Bunches in" value="1 240" sub="12 fallen" />
        <StatTile accent label="Waste" value={null} />
        <StatTile label="Waiting" value="7" href="/waiting" />
        <StatTile label="Packed" value="0" unit="pal." />
      </StatTileRow>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
