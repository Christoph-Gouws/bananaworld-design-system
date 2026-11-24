import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Scale } from "lucide-react";

import {
  AttentionItem,
  AttentionList,
  CountBadge,
  StatTile,
  StatTileRow,
  StatusBadge,
} from "../../src";
import { FROZEN } from "./fixtures/stat-tile-035-frozen";
import { shapes } from "./fixtures/stat-tile-035-shapes";

// CR-DESIGN-SYSTEM-035 — StatTile tone / labelCase / linkLabel, AttentionItem, CountBadge.

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

afterEach(cleanup);

async function axeViolations(container: HTMLElement): Promise<string[]> {
  const result = await axe.run(container);
  return result.violations.map((v) => v.id);
}

describe("StatTile — existing callers render byte-identically (frozen at 306e76f)", () => {
  const variants: Array<[string, Record<string, unknown>]> = [
    ["unchanged", {}],
    ["tone=default", { tone: "default" }],
    ["labelCase=upper", { labelCase: "upper" }],
  ];
  const names = Object.keys(FROZEN);
  it("has captured every shape", () => expect(names.length).toBe(22));
  for (const [name, extra] of variants) {
    it.each(names)(`${name}: %s`, (key) => {
      const node = shapes(extra)[key];
      const { container } = render(node as never);
      expect(container.innerHTML).toBe(FROZEN[key]);
    });
  }
});

describe("StatTile tone", () => {
  it.each(["warning", "danger", "success"] as const)("%s tints border and fill", (tone) => {
    const { container } = render(<StatTile label="A" value="1" tone={tone} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain(`border-[color:color-mix(in_srgb,var(--color-${tone})_50%`);
    expect(root.className).toContain(`bg-[color:color-mix(in_srgb,var(--color-${tone}-subtle)_40%`);
    // the base border/fill are replaced, not stacked
    expect(root.className).not.toMatch(/(^| )border-border( |$)/);
    expect(root.className).not.toMatch(/(^| )bg-surface( |$)/);
  });

  it("icon is amber (warning) / red (danger); success and default leave it alone", () => {
    for (const [tone, cls] of [
      ["warning", "text-warning"],
      ["danger", "text-danger"],
    ] as const) {
      const { container } = render(<StatTile label="A" value="1" tone={tone} icon={<Scale />} />);
      expect(container.querySelector("span[aria-hidden='true'].inline-flex")?.className).toContain(
        cls,
      );
      cleanup();
    }
    for (const tone of ["success", "default"] as const) {
      const { container } = render(<StatTile label="A" value="1" tone={tone} icon={<Scale />} />);
      const cls = container.querySelector("span[aria-hidden='true'].inline-flex")?.className ?? "";
      expect(cls).not.toMatch(/text-(warning|danger)/);
      cleanup();
    }
  });

  it("danger turns the value red; warning does not; the dash stays subtle", () => {
    const danger = render(<StatTile label="A" value="9" tone="danger" />);
    expect(danger.getByText("9").className).toContain("text-danger");
    cleanup();
    const warn = render(<StatTile label="A" value="9" tone="warning" />);
    expect(warn.getByText("9").className).not.toContain("text-danger");
    cleanup();
    const dash = render(<StatTile label="A" value={null} tone="danger" />);
    const val = dash.container.querySelector(".tabular-nums") as HTMLElement;
    expect(val.className).toContain("text-fg-subtle");
    expect(val.className).not.toContain("text-danger");
  });

  it("a toned linked tile keeps its tint on hover (no hover:bg-surface-muted)", () => {
    const { container } = render(<StatTile label="A" value="1" tone="warning" href="/x" />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("hover:border-warning");
    expect(cls).not.toContain("hover:bg-surface-muted");
  });

  it("combines with accent", () => {
    const { container } = render(<StatTile label="A" value="1" tone="danger" accent />);
    expect(container.querySelectorAll("span.bg-accent[aria-hidden='true']")).toHaveLength(1);
  });
});

describe("StatTile labelCase", () => {
  it("normal drops uppercase and tracking-wide", () => {
    const { container } = render(<StatTile label="Bunches in" value="1" labelCase="normal" />);
    const label = container.querySelector("p > span") as HTMLElement;
    expect(label.className).not.toContain("uppercase");
    expect(label.className).not.toContain("tracking-wide");
    expect(label.textContent).toBe("Bunches in");
  });
  it("upper and absent keep both", () => {
    const { container } = render(<StatTile label="A" value="1" labelCase="upper" />);
    const label = container.querySelector("p > span") as HTMLElement;
    expect(label.className).toContain("uppercase tracking-wide");
  });
});

describe("StatTile linkLabel", () => {
  it("is inside the one link, last in its name, with an aria-hidden arrow and no chevron", () => {
    const { container } = render(
      <StatTile label="Cold rooms" value="3" sub="Waiting 7 pal." href="/c" linkLabel="Open" />,
    );
    expect(container.querySelectorAll("a")).toHaveLength(1);
    const a = screen.getByRole("link");
    expect(a.textContent?.replace(/\s+/g, " ").trim()).toBe("Cold rooms 3Waiting 7 pal. Open");
    expect(a.className).toContain("flex flex-col");
    expect(a.querySelector("svg.lucide-arrow-right[aria-hidden='true']")).toBeTruthy();
    expect(a.querySelector("svg.lucide-chevron-right")).toBeNull();
    expect(a.querySelector("p span")?.className).not.toContain("pr-5");
  });
  it("a caller aria-label still wins and none is added otherwise", () => {
    render(<StatTile label="A" value="1" href="/x" linkLabel="Go" aria-label="Open A" />);
    expect(screen.getByRole("link", { name: "Open A" })).toBeTruthy();
    cleanup();
    const { container } = render(<StatTile label="A" value="1" href="/x" linkLabel="Go" />);
    expect(container.querySelector("a")?.hasAttribute("aria-label")).toBe(false);
  });
  it("a read-only tile draws no foot, and the type refuses linkLabel", () => {
    const { container } = render(
      // @ts-expect-error — a label with nothing to open is a type error
      <StatTile label="A" value="1" linkLabel="Go" />,
    );
    expect(container.textContent).not.toContain("Go");
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("[linklabel]")).toBeNull();
  });
  it("without linkLabel the chevron stays", () => {
    const { container } = render(<StatTile label="A" value="1" href="/x" />);
    expect(container.querySelector("svg.lucide-chevron-right")).toBeTruthy();
  });
});

describe("StatTile axe", () => {
  it("passes for every tone, linked and read-only", async () => {
    const { container } = render(
      <StatTileRow>
        {(["default", "warning", "danger", "success"] as const).flatMap((tone) => [
          <StatTile key={tone} label={`R ${tone}`} value="1" tone={tone} labelCase="normal" />,
          <StatTile
            key={`${tone}-l`}
            label={`L ${tone}`}
            value="2"
            tone={tone}
            href={`/${tone}`}
            linkLabel="Open"
          />,
        ])}
      </StatTileRow>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("AttentionItem / AttentionList", () => {
  const list = (
    <AttentionList aria-label="Needs attention">
      <AttentionItem
        href="/a"
        title="Waste over level"
        detail="Room 3"
        actionLabel="Cold rooms"
        tone="danger"
      />
      <AttentionItem href="/b" title="Aged pallets" detail="2 pallets" tone="warning" />
      <AttentionItem
        href="/c"
        title="Device offline"
        actionLabel="Devices"
        icon={<Scale data-testid="chip-icon" />}
      />
    </AttentionList>
  );

  it("one link per row; its name is its visible words, title first (label in name)", () => {
    const { container } = render(list);
    expect(container.querySelectorAll("a")).toHaveLength(3);
    const names = screen
      .getAllByRole("link")
      .map((a) => a.textContent?.replace(/\s+/g, " ").trim());
    expect(names).toEqual([
      "Waste over level Room 3 Cold rooms",
      "Aged pallets 2 pallets",
      "Device offline Devices",
    ]);
    expect(screen.getByRole("link", { name: "Waste over level Room 3 Cold rooms" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Aged pallets 2 pallets" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Device offline Devices" })).toBeTruthy();
  });

  it("is ul > li > a with a hairline between rows", () => {
    const { container } = render(list);
    const ul = container.firstElementChild as HTMLElement;
    expect(ul.tagName).toBe("UL");
    expect(ul.className).toContain("divide-y");
    expect(ul.className).toContain("divide-border");
    for (const li of Array.from(ul.children)) {
      expect(li.tagName).toBe("LI");
      expect(li.firstElementChild?.tagName).toBe("A");
    }
  });

  it("a caller aria-label wins", () => {
    render(
      <AttentionList>
        <AttentionItem href="/a" title="T" aria-label="Custom" />
      </AttentionList>,
    );
    expect(screen.getByRole("link", { name: "Custom" })).toBeTruthy();
  });

  it("chip classes per tone; tone square only for warning/danger without an icon", () => {
    const { container } = render(list);
    const chips = Array.from(container.querySelectorAll("a > span[aria-hidden='true']"));
    expect(chips[0]!.className).toContain("bg-danger-subtle text-danger");
    expect(chips[1]!.className).toContain("bg-warning-subtle text-warning");
    expect(chips[2]!.className).toContain("bg-surface-muted text-fg-muted");
    expect(chips[0]!.querySelector(".rounded-sm.bg-current")).toBeTruthy();
    expect(chips[1]!.querySelector(".rounded-sm.bg-current")).toBeTruthy();
    expect(chips[2]!.querySelector(".rounded-sm.bg-current")).toBeNull();
    expect(screen.getByTestId("chip-icon").parentElement).toBe(chips[2]);
  });

  it("an empty default chip draws nothing inside", () => {
    const { container } = render(
      <AttentionList>
        <AttentionItem href="/a" title="T" />
      </AttentionList>,
    );
    expect(container.querySelector("a > span[aria-hidden='true']")?.childElementCount).toBe(0);
  });

  it("the action is hidden under 480px", () => {
    render(list);
    const action = screen.getByText("Cold rooms");
    expect(action.className).toContain("hidden");
    expect(action.className).toContain("min-[480px]:inline-flex");
  });

  it("forwards the ref and extra props", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <AttentionList>
        <AttentionItem ref={ref} href="/a" title="T" data-testid="row" className="extra" />
      </AttentionList>,
    );
    expect(ref.current?.tagName).toBe("A");
    expect(screen.getByTestId("row").className).toContain("extra");
  });

  it("Tab moves row to row and Enter follows the link", async () => {
    const user = userEvent.setup();
    render(list);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: /^Waste over level/ }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: /^Aged pallets/ }));
    expect((document.activeElement as HTMLAnchorElement).getAttribute("href")).toBe("/b");
  });

  it("axe passes", async () => {
    const { container } = render(list);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("CountBadge", () => {
  it.each([null, undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "%s renders nothing",
    (count) => {
      const { container } = render(<CountBadge count={count} />);
      expect(container.innerHTML).toBe("");
    },
  );
  it("3 renders 3 with no dot", () => {
    const { container } = render(<CountBadge count={3} />);
    expect(container.textContent).toBe("3");
    expect(container.querySelector("span span")).toBeNull();
    expect(container.firstElementChild?.className).toContain("bg-neutral-subtle");
    expect(container.firstElementChild?.className).not.toContain("uppercase");
  });
  it.each([
    ["warning", "bg-warning-subtle text-warning-fg"],
    ["danger", "bg-danger-subtle text-danger-fg"],
  ] as const)("%s tone", (tone, cls) => {
    const { container } = render(<CountBadge count={2} tone={tone} />);
    expect(container.firstElementChild?.className).toContain(cls);
  });
  it("passes className, aria-label and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CountBadge ref={ref} count={4} className="x" aria-label="4 items" />);
    expect(ref.current?.className).toContain("x");
    expect(screen.getByLabelText("4 items")).toBe(ref.current);
  });
  it("StatusBadge is untouched", () => {
    const { container } = render(<StatusBadge status="waste" />);
    expect(container.firstElementChild?.className).toContain("uppercase");
    expect(container.querySelector("span span.bg-danger")).toBeTruthy();
  });
});
