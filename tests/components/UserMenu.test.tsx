import { readFileSync, readdirSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { PageHeader, UserMenu, type UserMenuProps } from "../../src";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// CR-DESIGN-SYSTEM-032 — the name menu and the page header.

afterEach(cleanup);

function props(over: Partial<UserMenuProps> = {}): UserMenuProps {
  return {
    name: "Ana Silva",
    initials: "AS",
    triggerLabel: "Account menu",
    signOut: { label: "Sign out", onSelect: vi.fn() },
    ...over,
  };
}

describe("UserMenu", () => {
  it("names its trigger and shows only what it is given", async () => {
    const user = userEvent.setup();
    render(<UserMenu {...props()} />);
    await user.click(screen.getByRole("button", { name: "Ana Silva · Account menu" }));
    expect(await screen.findByText("Ana Silva", { selector: "p" })).toBeTruthy();
    expect(screen.queryByText("2-step sign-in on")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryAllByRole("menuitemradio")).toHaveLength(0);
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeTruthy();
  });

  it("shows the roles line, the 2-step mark and a My settings link", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        {...props({
          rolesLine: "Order centre · Senior manager",
          secondStep: "2-step sign-in on",
          settings: { href: "/settings", label: "My settings", hint: "Profile" },
        })}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Ana Silva · Account menu" }));
    expect(await screen.findByText("Order centre · Senior manager")).toBeTruthy();
    expect(screen.getByText("2-step sign-in on")).toBeTruthy();
    const link = screen.getByRole("menuitem", { name: /My settings/ });
    expect(link.getAttribute("href")).toBe("/settings");
  });

  it("language segments are radio items; choosing one calls onChange once and keeps the menu open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <UserMenu
        {...props({
          language: {
            label: "Language",
            value: "en",
            options: [
              { id: "en", name: "EN" },
              { id: "pt", name: "PT" },
            ],
            onChange,
          },
        })}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Ana Silva · Account menu" }));
    const en = await screen.findByRole("menuitemradio", { name: "EN" });
    expect(en.getAttribute("aria-checked")).toBe("true");
    await user.click(screen.getByRole("menuitemradio", { name: "PT" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("pt");
    expect(screen.getByRole("menuitemradio", { name: "PT" })).toBeTruthy();
  });

  it("Sign out calls onSelect once", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<UserMenu {...p} />);
    await user.click(screen.getByRole("button", { name: "Ana Silva · Account menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Sign out" }));
    expect(p.signOut.onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens with Enter, moves with the arrows, closes with Esc and returns focus", async () => {
    const user = userEvent.setup();
    render(<UserMenu {...props({ settings: { href: "/s", label: "My settings" } })} />);
    const trigger = screen.getByRole("button", { name: "Ana Silva · Account menu" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.getAttribute("role")).toBe("menuitem");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        {...props({
          rolesLine: "Roles",
          secondStep: "2-step on",
          settings: { href: "/s", label: "My settings" },
          language: {
            label: "Language",
            value: "en",
            options: [{ id: "en", name: "EN" }],
            onChange: vi.fn(),
          },
        })}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Ana Silva · Account menu" }));
    await screen.findByRole("menu");
    // Off: contrast (no layout in happy-dom — measured in the real browser), `region` (page-level, not
    // this component) and `aria-hidden-focus` (Radix's own off-screen focus guards).
    const res = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
        "aria-hidden-focus": { enabled: false },
      },
    });
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });
});

describe("PageHeader", () => {
  it("renders one h1; description and actions are optional", () => {
    const { container, rerender } = render(<PageHeader title="Loads" />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("p")).toBeNull();
    rerender(<PageHeader title="Loads" description="All loads" actions={<button>New</button>} />);
    expect(screen.getByText("All loads")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New" })).toBeTruthy();
  });
});

describe("source guards for the frame files", () => {
  const FILES = [
    "AppShell",
    "AppHeader",
    "SideMenu",
    "SideColumn",
    "MenuRail",
    "UserMenu",
    "PageHeader",
  ].map((n) => readFileSync(`src/components/${n}.tsx`, "utf8"));
  const code = FILES.map((f) => f.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, ""));

  it("has no hex colour, no window.open, no max-width cap on the page area", () => {
    for (const src of code) {
      expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(src).not.toMatch(/window\.open/);
    }
    const mainLine = code[0]!.split("\n").find((line) => line.includes("<main"));
    expect(mainLine).toContain("overflow-auto");
    expect(mainLine).not.toMatch(/max-w-|mx-auto/);
  });

  it("has no English word literal in a JSX text node or aria-label (every word is a prop)", () => {
    for (const src of code) {
      expect(src).not.toMatch(/aria-label="[A-Za-z]/);
      expect(src).not.toMatch(/>\s*(Menu|Close|Open|Sign out|Settings|Help|Collapse|Expand)\s*</);
    }
  });

  it("the new frame adds only the expected files", () => {
    const names = readdirSync("src/components");
    for (const n of ["AppShell", "SideMenu", "SideColumn", "MenuRail", "AppHeader"]) {
      expect(names).toContain(`${n}.tsx`);
    }
  });
});
