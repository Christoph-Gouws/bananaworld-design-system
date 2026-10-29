import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import axe from "axe-core";

import { BarChart, type BarChartItem } from "../../src";

// CR-DESIGN-SYSTEM-025 — the horizontal bar chart.

afterEach(cleanup);

const ITEMS: BarChartItem[] = [
  { label: "Classe 1", value: 60, valueText: "60,00 kg", percentText: "60,0%" },
  { label: "Classe 2", value: 30, valueText: "30,00 kg", percentText: "30,0%" },
  { label: "Ainda sem mapa", value: 10, tone: "warning" },
];

const fills = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>("[style*='width']"),
];

async function axeViolations(container: HTMLElement): Promise<string[]> {
  const result = await axe.run(container);
  return result.violations.map((v) => v.id);
}

describe("BarChart structure", () => {
  it("is one table named by label, with hidden headers and a row per item", () => {
    render(<BarChart label="Packout" items={ITEMS} />);
    const table = screen.getByRole("table", { name: "Packout" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((c) => c.textContent),
    ).toEqual(["Item", "Amount", "Share"]);
    expect(within(table).getAllByRole("row")).toHaveLength(1 + ITEMS.length);
    const row = within(table).getAllByRole("row")[1]!;
    expect(
      [...row.children]
        .filter((c) => c.getAttribute("aria-hidden") !== "true")
        .map((c) => c.getAttribute("role")),
    ).toEqual(["rowheader", "cell", "cell"]);
    expect(table.querySelector("button, a, input, [tabindex]")).toBeNull();
  });

  it("hides the track and separator from assistive technology", () => {
    const { container } = render(<BarChart label="P" items={ITEMS} />);
    const row = container.querySelectorAll("[role=row]")[1]!;
    const hidden = [...row.children].filter((c) => c.getAttribute("aria-hidden") === "true");
    expect(hidden).toHaveLength(2);
  });
});

describe("BarChart figures", () => {
  it("prints caller text exactly", () => {
    render(<BarChart label="P" items={ITEMS} />);
    expect(screen.getByText("60,00 kg")).toBeTruthy();
    expect(screen.getByText("30,0%")).toBeTruthy();
  });

  it("keeps a Portuguese share untouched and defaults to String(value) and one decimal", () => {
    render(<BarChart label="P" items={[{ ...ITEMS[0]!, percentText: "62,3%" }, ITEMS[2]!]} />);
    expect(screen.getByText("62,3%")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("14.3%")).toBeTruthy();
  });
});

describe("BarChart lengths", () => {
  it("fill width is value / sum", () => {
    const { container } = render(<BarChart label="P" items={ITEMS} />);
    expect(fills(container).map((f) => f.style.width)).toEqual(["60%", "30%", "10%"]);
  });

  it("uses total.value as the base when given", () => {
    const { container } = render(
      <BarChart label="P" items={ITEMS} total={{ label: "T", value: 200 }} />,
    );
    expect(fills(container).map((f) => f.style.width)).toEqual(["30%", "15%", "5%"]);
  });

  it("clamps a value above the base to 100% and keeps the printed text", () => {
    const { container } = render(
      <BarChart
        label="P"
        items={[{ label: "A", value: 500, valueText: "500" }]}
        total={{ label: "T", value: 100 }}
      />,
    );
    expect(fills(container)[0]!.style.width).toBe("100%");
    expect(screen.getByText("500")).toBeTruthy();
  });

  it("draws no fill and a dash for negative, NaN and Infinity", () => {
    const { container } = render(
      <BarChart
        label="P"
        items={[
          { label: "A", value: 10 },
          { label: "B", value: -5 },
          { label: "C", value: Number.NaN },
          { label: "D", value: Number.POSITIVE_INFINITY },
        ]}
      />,
    );
    expect(fills(container)).toHaveLength(1);
    expect(container.textContent).toContain("—");
  });

  it("a zero value prints its figures with no fill element", () => {
    const { container } = render(
      <BarChart
        label="P"
        items={[
          { label: "A", value: 10 },
          { label: "Z", value: 0 },
        ]}
      />,
    );
    expect(fills(container)).toHaveLength(1);
    expect(screen.getByText("0.0%")).toBeTruthy();
  });

  it("a tiny positive value keeps a minimum width class", () => {
    const { container } = render(
      <BarChart
        label="P"
        items={[
          { label: "A", value: 100000 },
          { label: "T", value: 0.001 },
        ]}
      />,
    );
    expect(fills(container)[1]!.className).toContain("min-w-[2px]");
  });
});

describe("BarChart empty states", () => {
  it("no items: one dash row, with words.empty readable", () => {
    const { container } = render(<BarChart label="P" items={[]} />);
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
    expect(container.querySelector("[aria-hidden=true]")!.textContent).toBe("—");
    expect(screen.getByText("No figures yet")).toBeTruthy();
    expect(fills(container)).toHaveLength(0);
  });

  it("base 0: names kept, every figure a dash even with caller text, no fill", () => {
    const { container } = render(
      <BarChart
        label="P"
        items={[
          { label: "Classe 1", value: 0, valueText: "0,00 kg", percentText: "0,0%" },
          { label: "Classe 2", value: 0, valueText: "0,00 kg", percentText: "0,0%" },
        ]}
        total={{ label: "Total", valueText: "0,00 kg" }}
      />,
    );
    expect(screen.getByText("Classe 1")).toBeTruthy();
    expect(container.textContent).not.toContain("0,00");
    expect(container.textContent).not.toContain("0,0%");
    expect(container.textContent?.match(/—/g)).toHaveLength(5);
    expect(fills(container)).toHaveLength(0);
  });
});

describe("BarChart tone, words, total", () => {
  it("warning uses bg-warning and text-warning-fg; default uses bg-accent", () => {
    const { container } = render(<BarChart label="P" items={ITEMS} />);
    const bars = fills(container);
    expect(bars[0]!.className).toContain("bg-accent");
    expect(bars[2]!.className).toContain("bg-warning");
    expect(screen.getByText("Ainda sem mapa").className).toContain("text-warning-fg");
  });

  it("words override per key and undefined falls back", () => {
    render(<BarChart label="P" items={ITEMS} words={{ item: "Classe", amount: undefined }} />);
    expect(screen.getByText("Classe", { selector: "[role=columnheader]" })).toBeTruthy();
    expect(screen.getByText("Amount")).toBeTruthy();
  });

  it("prints the total row with default sum or given text", () => {
    render(<BarChart label="P" items={ITEMS} total={{ label: "Total", valueText: "100,00 kg" }} />);
    expect(screen.getByRole("rowheader", { name: "Total" })).toBeTruthy();
    expect(screen.getByText("100,00 kg")).toBeTruthy();
  });
});

describe("BarChart plumbing", () => {
  it("renders on the server with the same figures and no client hook", () => {
    const html = renderToString(<BarChart label="P" items={ITEMS} />);
    expect(html).toContain("60,00 kg");
    expect(html).toContain('role="table"');
  });

  it("merges className, passes data-* and forwards the ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BarChart ref={ref} label="P" items={ITEMS} className="extra" data-testid="bc" />);
    expect(ref.current).toBe(screen.getByTestId("bc"));
    expect(ref.current!.className).toContain("extra");
    expect(ref.current!.className).toContain("grid");
  });

  it("has no axe violations in each state", async () => {
    const states = [
      <BarChart key="n" label="P" items={ITEMS} />,
      <BarChart key="t" label="P" items={ITEMS} total={{ label: "Total" }} />,
      <BarChart key="z" label="P" items={[{ label: "A", value: 0 }]} total={{ label: "T" }} />,
      <BarChart key="e" label="P" items={[]} />,
    ];
    for (const ui of states) {
      const { container, unmount } = render(ui);
      expect(await axeViolations(container)).toEqual([]);
      unmount();
    }
  });
});
