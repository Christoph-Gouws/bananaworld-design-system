import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { ReactNode } from "react";

import {
  LinkedRecords,
  LinkedRecordsItem,
  TooltipProvider,
  type LinkedRecordsGroup,
} from "../../src";

// CR-DESIGN-SYSTEM-023 — the linked-records line.

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/** The DC `DrillLink` shape: a plain function component — NO forwardRef, props NOT spread. */
function AppLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href}>{children}</a>;
}

function stubHover(cannotHover: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: cannotHover && query === "(hover: none)",
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

const DSP = {
  type: "Dispatch",
  number: "DSP-00131",
  status: "Posted",
  rows: [
    { label: "Date", value: "7 Oct 2026" },
    { label: "Customer", value: "Acme Fresh" },
  ],
};

const GROUPS: LinkedRecordsGroup[] = [
  {
    key: "dsp",
    label: "Dispatches",
    items: [
      {
        key: "a",
        link: <AppLink href="/d/131">DSP-00131</AppLink>,
        text: "DSP-00131",
        date: "7 Oct",
        summary: DSP,
      },
      {
        key: "b",
        link: <AppLink href="/d/134">DSP-00134</AppLink>,
        text: "DSP-00134",
        date: "9 Oct",
      },
    ],
    more: <span>+2 more</span>,
  },
  { key: "empty", label: "Nothing here", items: [] },
  {
    key: "run",
    label: "Delivery run",
    items: [{ key: "r", link: null, text: "RUN-2610-014", date: "7 Oct" }],
  },
];

function ui(props: Partial<React.ComponentProps<typeof LinkedRecords>> = {}) {
  return (
    <TooltipProvider delayDuration={0}>
      <LinkedRecords label="Linked" emptyText="Nothing linked yet" groups={GROUPS} {...props} />
    </TooltipProvider>
  );
}

async function violations(node: Element): Promise<string[]> {
  const result = await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => v.id);
}

describe("render per state", () => {
  beforeEach(() => stubHover(false));

  it("ready: label, groups in the order given, text and date; an empty group is not drawn", () => {
    render(ui());
    const group = screen.getByRole("group", { name: "Linked" });
    expect(group.textContent).toBe(
      "LinkedDispatchesDSP-001317 OctDSP-001349 Oct+2 moreDelivery runRUN-2610-0147 Oct",
    );
    expect(screen.queryByText("Nothing here")).toBeNull();
    expect(group.getAttribute("aria-busy")).toBeNull();
  });

  it("loading: a skeleton, aria-busy, no items", () => {
    render(ui({ state: "loading" }));
    const group = screen.getByRole("group", { name: "Linked" });
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByText("DSP-00131")).toBeNull();
  });

  it("error: the words, and Retry calls onRetry; without onRetry there is no Retry", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(ui({ state: "error", onRetry }));
    expect(screen.getByText(/Couldn't load the links\./)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(ui({ state: "error" }));
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("empty means no group has an item (not groups.length)", () => {
    render(ui({ groups: [{ key: "x", label: "Dispatches", items: [] }] }));
    expect(screen.getByText("Nothing linked yet")).toBeTruthy();
    expect(screen.queryByText("Dispatches")).toBeNull();
  });

  it("words override all five words", async () => {
    stubHover(true);
    const words = {
      summaryOf: "Resumen de",
      close: "Cerrar",
      open: "Abrir",
      error: "Falló",
      retry: "Reintentar",
    };
    const { rerender } = render(ui({ words, state: "error", onRetry: () => undefined }));
    expect(screen.getByText(/Falló/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeTruthy();
    rerender(ui({ words }));
    await userEvent.click(screen.getByRole("button", { name: "Resumen de DSP-00131" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Cerrar" })).toBeTruthy();
    expect(dialog.textContent).toContain("Abrir");
  });
});

describe("mouse and keyboard: the summary card is the package Tooltip", () => {
  beforeEach(() => stubHover(false));

  it("hover opens the card — with a link that neither forwards a ref nor spreads props", async () => {
    render(ui());
    await userEvent.hover(screen.getByRole("link", { name: "DSP-00131" }));
    const tip = await screen.findByRole("tooltip");
    expect(tip.textContent).toContain("Dispatch");
    expect(tip.textContent).toContain("DSP-00131");
    expect(tip.textContent).toContain("Posted");
    expect(tip.textContent).toContain("Acme Fresh");
    expect(tip.textContent).toContain("7 Oct 2026");
  });

  it("keyboard focus opens the card and Escape closes it; the card holds nothing focusable", async () => {
    render(ui());
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "DSP-00131" }));
    const tip = await screen.findByRole("tooltip");
    expect(tip.querySelector("a, button, input, select, textarea, [tabindex]")).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("an item with no summary has no card", async () => {
    render(ui());
    await userEvent.hover(screen.getByRole("link", { name: "DSP-00134" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("the info button exists only under hover: none", () => {
  it("hover capable: no button", () => {
    stubHover(false);
    render(ui());
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("no matchMedia at all: no button", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(ui());
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("cannot hover: one per item with a summary, a real 40 px button", () => {
    stubHover(true);
    render(ui());
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]!.getAttribute("aria-label")).toBe("Summary of DSP-00131");
    expect(buttons[0]!.getAttribute("type")).toBe("button");
    expect(buttons[0]!.className).toContain("h-10 w-10");
  });

  it("tap opens the sheet with the rows and the app's link; Close returns focus to the button", async () => {
    stubHover(true);
    render(ui());
    const button = screen.getByRole("button", { name: "Summary of DSP-00131" });
    await userEvent.click(button);
    const dialog = screen.getByRole("dialog", { name: "DSP-00131" });
    expect(dialog.textContent).toContain("Dispatch · Posted");
    expect(dialog.textContent).toContain("Acme Fresh");
    expect(within(dialog).getByRole("link", { name: "DSP-00131" }).getAttribute("href")).toBe(
      "/d/131",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(button));
  });

  it("with link: null the sheet has no Open control", async () => {
    stubHover(true);
    render(
      <TooltipProvider>
        <LinkedRecordsItem link={null} text="DLV-1" summary={{ ...DSP, number: "DLV-1" }} />
      </TooltipProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Summary of DLV-1" }));
    expect(within(screen.getByRole("dialog")).queryByText(/Open/)).toBeNull();
  });
});

describe("a refused item reveals nothing", () => {
  const refused: LinkedRecordsGroup[] = [
    {
      key: "c",
      label: "Corrections",
      items: [
        {
          key: "x",
          link: <AppLink href="/secret">CC-1</AppLink>,
          text: "CC-1",
          date: "SECRET-DATE",
          summary: { ...DSP, number: "CC-1", rows: [{ label: "Total", value: "SECRET-TOTAL" }] },
          refusedLabel: "You can't open crate corrections",
        },
      ],
    },
  ];

  it.each([false, true])(
    "lock, no link, no button, no card, no date (hover none: %s)",
    async (cannot) => {
      stubHover(cannot);
      const { container } = render(ui({ groups: refused }));
      expect(screen.getByRole("img", { name: "You can't open crate corrections" })).toBeTruthy();
      expect(screen.getByText("CC-1")).toBeTruthy();
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
      expect(container.textContent).not.toContain("SECRET");
      await userEvent.hover(screen.getByText("CC-1"));
      await userEvent.tab();
      expect(screen.queryByRole("tooltip")).toBeNull();
    },
  );
});

describe("axe", () => {
  it.each([
    ["ready", () => ui(), false],
    ["empty", () => ui({ groups: [] }), false],
    ["loading", () => ui({ state: "loading" }), false],
    ["error", () => ui({ state: "error", onRetry: () => undefined }), false],
    ["info buttons shown", () => ui(), true],
  ])("%s: 0 violations", async (_name, make, cannot) => {
    stubHover(cannot);
    const { container } = render(make());
    expect(await violations(container)).toEqual([]);
  });

  it("sheet open: 0 violations", async () => {
    stubHover(true);
    render(ui());
    await userEvent.click(screen.getByRole("button", { name: "Summary of DSP-00131" }));
    expect(await violations(screen.getByRole("dialog"))).toEqual([]);
  });
});
