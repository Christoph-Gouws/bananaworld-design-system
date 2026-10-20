import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import type { ReactElement } from "react";

import { ExportButton, ToastProvider } from "../../src";
import { FrozenExportButton } from "./fixtures/ExportButton.frozen-1fefb6c";

// CR-DESIGN-SYSTEM-020 — ExportButton gets a real download link (optional href + fileName).

afterEach(cleanup);

const withToast = (ui: ReactElement) => <ToastProvider>{ui}</ToastProvider>;

describe("ExportButton with href (CR-DESIGN-SYSTEM-020)", () => {
  it("renders a download link with href and download=fileName, no button", () => {
    render(<ExportButton format="excel" reportType="r" href="/x.xlsx" fileName="r.xlsx" />);
    const link = screen.getByRole("link", { name: "Export Excel" });
    expect(link.getAttribute("href")).toBe("/x.xlsx");
    expect(link.getAttribute("download")).toBe("r.xlsx");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps download present and empty without fileName", () => {
    render(<ExportButton format="pdf" reportType="r" href="/x.pdf" />);
    expect(screen.getByRole("link").getAttribute("download")).toBe("");
  });

  it("children replace the default label", () => {
    render(<ExportButton format="pdf" reportType="r" href="/x.pdf" children="Exportar PDF" />);
    expect(screen.getByRole("link", { name: "Exportar PDF" })).toBeTruthy();
  });

  it("renders without a ToastProvider and shows no toast / makes no network call on click", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ExportButton format="csv" reportType="r" href="#x" fileName="r.csv" />);
    await userEvent.click(screen.getByRole("link"));
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("carries the secondary look and the 44px touch target", () => {
    render(<ExportButton format="csv" reportType="r" href="/x" />);
    const cls = screen.getByRole("link").className;
    expect(cls).toContain("[@media(pointer:coarse)]:min-h-11");
    expect(cls).toContain("bg-surface");
  });

  it("is reachable and focusable by keyboard", async () => {
    render(<ExportButton format="csv" reportType="r" href="/x" />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link"));
  });

  it.each([{ disabled: true }, { inflight: true }, { inflight: true, disabled: false }])(
    "unavailable (%o) -> disabled button, no anchor, no toast",
    async (extra) => {
      const { container } = render(
        withToast(
          <ExportButton format="excel" reportType="r" href="/x" children="Exportar" {...extra} />,
        ),
      );
      const btn = screen.getByRole("button", { name: "Exportar" }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(container.querySelector("a")).toBeNull();
      await userEvent.click(btn);
      expect(screen.queryByText("Export coming soon")).toBeNull();
    },
  );

  it('treats href="" as no link (today\'s toast path)', () => {
    const { container } = render(withToast(<ExportButton format="csv" reportType="r" href="" />));
    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByRole("button")).toBeTruthy();
  });
});

describe("ExportButton without href is byte-identical to 1fefb6c (pins DC)", () => {
  const shapes: Array<Record<string, unknown>> = [
    {},
    { disabled: true },
    { inflight: true },
    { size: "lg", block: true },
    { className: "x", "aria-label": "lbl", type: "submit" },
  ];
  const formats = ["csv", "excel", "pdf"] as const;
  const kids = [undefined, "Exportar", <b key="b">B</b>];

  it("matches the frozen copy across the caller matrix", () => {
    for (const format of formats)
      for (const children of kids)
        for (const s of shapes) {
          const a = render(
            withToast(<ExportButton format={format} reportType="r" children={children} {...s} />),
          );
          const live = a.container.innerHTML;
          a.unmount();
          const b = render(
            withToast(
              <FrozenExportButton format={format} reportType="r" children={children} {...s} />,
            ),
          );
          expect(live).toBe(b.container.innerHTML);
          b.unmount();
        }
  });

  it("fileName without href does not leak onto the button", () => {
    const { container } = render(
      withToast(<ExportButton format="csv" reportType="r" fileName="a.csv" />),
    );
    expect(container.innerHTML).not.toContain("a.csv");
  });

  it("shows today's toast text on click", async () => {
    render(withToast(<ExportButton format="csv" reportType="crate-balance" />));
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Export coming soon")).toBeTruthy();
    expect(
      screen.getByText(
        'Export CSV for "crate-balance" wires up at EPIC-008-M005 (BI refresh + CSV export Milestone).',
      ),
    ).toBeTruthy();
  });

  it("still needs a ToastProvider (unchanged behaviour)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ExportButton format="csv" reportType="r" />)).toThrow();
    spy.mockRestore();
  });
});

describe("ExportButton accessibility (axe)", () => {
  it.each([
    ["link", <ExportButton key="a" format="excel" reportType="r" href="/x" fileName="x.xlsx" />],
    ["disabled", <ExportButton key="b" format="pdf" reportType="r" href="/x" disabled />],
    ["toast", withToast(<ExportButton key="c" format="csv" reportType="r" />)],
  ])("%s has no violations", async (_n, ui) => {
    const { container } = render(ui);
    const res = await axe.run(container);
    expect(res.violations).toEqual([]);
  });
});
