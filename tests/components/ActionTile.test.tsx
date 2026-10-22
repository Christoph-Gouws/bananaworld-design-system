import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Package } from "lucide-react";

import { ActionTile } from "../../src";

// CR-DESIGN-SYSTEM-021 — the large icon-and-label tile.

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

afterEach(cleanup);

describe("ActionTile", () => {
  it("renders a button named by its label; onClick fires", async () => {
    const onClick = vi.fn();
    render(<ActionTile icon={Package} label="Crates in" onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Crates in" });
    expect(btn.getAttribute("type")).toBe("button");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("the name is the visible text: label, count, hint (Label in Name)", () => {
    render(<ActionTile icon={Package} label="Crates in" count={3} hint="Back from clients" />);
    expect(screen.getByRole("button", { name: "Crates in 3 Back from clients" })).toBeTruthy();
  });

  it("count 0 still renders the badge", () => {
    render(<ActionTile icon={Package} label="Crates in" count={0} />);
    expect(screen.getByRole("button", { name: "Crates in 0" })).toBeTruthy();
  });

  it("a caller aria-label wins", () => {
    render(
      <ActionTile icon={Package} label="Crates in" count={3} aria-label="Crates in, 3 waiting" />,
    );
    expect(screen.getByRole("button", { name: "Crates in, 3 waiting" })).toBeTruthy();
  });

  it("href renders a link through the kit Link, with the per-surface prefetch", () => {
    render(
      <div data-surface="tablet">
        <ActionTile icon={Package} label="New client" href="/clients/new" />
      </div>,
    );
    const link = screen.getByRole("link", { name: "New client" });
    expect(link.getAttribute("href")).toBe("/clients/new");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("href + disabled is a disabled button with no anchor", () => {
    render(<ActionTile icon={Package} label="New client" href="/x" disabled />);
    expect((screen.getByRole("button", { name: "New client" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(document.querySelector("a")).toBeNull();
    expect(screen.getByRole("button").getAttribute("href")).toBeNull();
  });

  it("primary is the dark tile and, as a link, never turns accent on hover", () => {
    render(<ActionTile icon={Package} label="Go" href="/x" variant="primary" />);
    const cls = screen.getByRole("link").className;
    expect(cls).toContain("bg-fg");
    expect(cls).toContain("text-surface");
    expect(cls).toContain("hover:text-surface");
    expect(cls).not.toContain("hover:text-accent");
  });

  it("default as a link keeps its own hover text colour", () => {
    render(<ActionTile icon={Package} label="Go" href="/x" />);
    expect(screen.getByRole("link").className).not.toContain("hover:text-accent");
  });

  it("fills its cell and wraps instead of truncating", () => {
    render(<ActionTile icon={Package} label="A rather long label" />);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("h-full");
    expect(cls).toContain("w-full");
    expect(cls).toContain("min-h-[86px]");
    expect(cls).toContain("whitespace-normal");
    expect(cls).not.toContain("truncate");
    expect(screen.getByText("A rather long label").className).not.toContain("truncate");
  });

  it("is disabled natively and sets no grid of its own", () => {
    render(<ActionTile icon={Package} label="Off" disabled />);
    const btn = screen.getByRole("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.className).not.toContain("grid");
  });

  it("attaches the ref on both paths", () => {
    const b = createRef<HTMLButtonElement | HTMLAnchorElement>();
    const a = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(
      <>
        <ActionTile ref={b} icon={Package} label="B" />
        <ActionTile ref={a} icon={Package} label="A" href="/x" />
      </>,
    );
    expect(b.current?.tagName).toBe("BUTTON");
    expect(a.current?.tagName).toBe("A");
  });

  it("a caller className is merged last", () => {
    render(<ActionTile icon={Package} label="X" className="min-h-[120px]" />);
    expect(screen.getByRole("button").className).toContain("min-h-[120px]");
    expect(screen.getByRole("button").className).not.toContain("min-h-[86px]");
  });
});

describe("ActionTile accessibility (axe)", () => {
  it.each([
    ["default", <ActionTile key="d" icon={Package} label="Crates out" />],
    [
      "primary",
      <ActionTile key="p" icon={Package} label="Crates in" variant="primary" hint="Back" />,
    ],
    ["disabled", <ActionTile key="x" icon={Package} label="Off" disabled />],
    ["badge", <ActionTile key="b" icon={Package} label="Crates in" count={3} />],
    ["link", <ActionTile key="l" icon={Package} label="New client" href="/x" />],
  ])("%s: no violations", async (_n, ui) => {
    const { container } = render(ui);
    const res = await axe.run(container);
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });
});
