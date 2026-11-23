import { useState, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell, type AppMenuGroup, type AppShellProps } from "../../src";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// This package carries no jest-dom; the three matchers this file uses are defined here.
interface DomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveAttribute(name: string, value?: string): R;
  toHaveFocus(): R;
}
declare module "vitest" {
  interface Assertion<T> extends DomMatchers<T> {}
  interface AsymmetricMatchersContaining extends DomMatchers {}
}
expect.extend({
  toBeInTheDocument(received: Element) {
    return { pass: received.isConnected, message: () => "expected element in the document" };
  },
  toHaveAttribute(received: Element, name: string, value?: string) {
    const actual = received.getAttribute(name);
    const pass = value === undefined ? actual !== null : actual === value;
    return { pass, message: () => `attribute ${name}: got ${String(actual)}` };
  },
  toHaveFocus(received: Element) {
    return { pass: document.activeElement === received, message: () => "focus is elsewhere" };
  },
});

// CR-DESIGN-SYSTEM-032 — the app frame: open menu, accordion, badges, hidden headings, rail with
// flyouts, persistence, narrow slide-out. (Hover timing is proven in the real browser.)

const WORDS = {
  menu: "Main menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  collapseMenu: "Collapse menu",
  expandMenu: "Expand menu",
};

const MENU: AppMenuGroup[] = [
  {
    id: "loads",
    label: "Loads",
    icon: <svg data-icon="loads" />,
    items: [
      { id: "waiting", label: "Waiting", href: "/loads/waiting", count: 2 },
      { id: "all", label: "All loads", href: "/loads", exact: true },
      { id: "hid", label: "Hidden one", href: "/loads/hid", count: 50, hidden: true },
    ],
  },
  {
    id: "stock",
    label: "Stock",
    icon: <svg data-icon="stock" />,
    items: [{ id: "bins", label: "Bins", href: "/stock/bins" }],
  },
  {
    id: "admin",
    label: "Admin",
    icon: <svg data-icon="admin" />,
    items: [{ id: "u", label: "Users", href: "/admin/users", hidden: true }],
  },
];

function shell(over: Partial<AppShellProps> = {}): ReactElement {
  return (
    <AppShell
      brand={{ name: "Packhouse", mark: <span>PH</span> }}
      menu={MENU}
      footItems={[{ id: "help", label: "Help", href: "/help", icon: <svg data-icon="help" /> }]}
      pathname="/loads/waiting"
      words={WORDS}
      user={<button>me</button>}
      breadcrumb={<span>Crumb</span>}
      {...over}
    >
      <p>page</p>
    </AppShell>
  );
}

/** The desktop column (the <aside>); the slide-out lives in a portal. */
function column() {
  return document.querySelector("aside") as HTMLElement;
}

beforeEach(() => {
  window.localStorage.clear();
  // Radix NavigationMenu measures with ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("open menu", () => {
  it("shows an icon on each heading and none on items; marks the current screen", () => {
    render(shell());
    const nav = within(column()).getByRole("navigation", { name: "Main menu" });
    expect(nav.querySelectorAll("[data-icon=loads],[data-icon=stock]")).toHaveLength(2);
    const loads = within(nav).getByRole("link", { name: "Waiting 2" });
    expect(loads).toHaveAttribute("aria-current", "page");
    expect(loads.querySelector("svg")).toBeNull();
    expect(within(nav).getByRole("link", { name: "All loads" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the current heading while open and while closed", async () => {
    const user = userEvent.setup();
    render(shell());
    const heading = within(column()).getByRole("button", { name: /^Loads/ });
    expect(heading).toHaveAttribute("data-current");
    await user.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(heading).toHaveAttribute("data-current");
    expect(within(column()).getByRole("button", { name: "Stock" })).not.toHaveAttribute(
      "data-current",
    );
  });

  it("pins the foot item outside the scroll area", () => {
    render(shell());
    const help = within(column()).getByRole("link", { name: "Help" });
    expect(help.closest(".overflow-y-auto")).toBeNull();
  });
});

describe("accordion", () => {
  it("opens the current group, one at a time, and a click on the open one closes it", async () => {
    const user = userEvent.setup();
    render(shell());
    const loads = within(column()).getByRole("button", { name: /^Loads/ });
    const stock = within(column()).getByRole("button", { name: "Stock" });
    expect(loads).toHaveAttribute("aria-expanded", "true");
    expect(stock).toHaveAttribute("aria-expanded", "false");
    await user.click(stock);
    expect(stock).toHaveAttribute("aria-expanded", "true");
    expect(loads).toHaveAttribute("aria-expanded", "false");
    await user.click(stock);
    expect(stock).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the group a navigation moves into", () => {
    const { rerender } = render(shell());
    rerender(shell({ pathname: "/stock/bins" }));
    expect(within(column()).getByRole("button", { name: "Stock" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(within(column()).getByRole("button", { name: /^Loads/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("moves between headings with the arrow keys", async () => {
    const user = userEvent.setup();
    render(shell());
    within(column())
      .getByRole("button", { name: /^Loads/ })
      .focus();
    await user.keyboard("{ArrowDown}");
    expect(within(column()).getByRole("button", { name: "Stock" })).toHaveFocus();
  });
});

describe("badges and hidden things", () => {
  it("rolls visible items up into the heading and shows it closed", async () => {
    const user = userEvent.setup();
    render(shell());
    expect(within(column()).getByRole("button", { name: "Loads 2" })).toBeInTheDocument();
    await user.click(within(column()).getByRole("button", { name: "Stock" }));
    expect(within(column()).getByRole("button", { name: "Loads 2" })).toBeInTheDocument();
  });

  it("group.count overrides the roll-up; 0 and null show nothing", () => {
    const menu = [
      { ...MENU[0]!, count: 5 },
      { ...MENU[1]!, count: 0 },
    ];
    render(shell({ menu }));
    expect(within(column()).getByRole("button", { name: "Loads 5" })).toBeInTheDocument();
    expect(within(column()).getByRole("button", { name: "Stock" })).toBeInTheDocument();
  });

  it("never renders a hidden item, its count, or a heading with every item hidden", () => {
    render(shell());
    expect(screen.queryByText("Hidden one")).toBeNull();
    expect(screen.queryByText("Admin")).toBeNull();
    expect(document.body.textContent).not.toContain("52");
  });

  it("drops a hidden foot item", () => {
    render(
      shell({ footItems: [{ id: "h", label: "Help", href: "/help", icon: null, hidden: true }] }),
    );
    expect(screen.queryByRole("link", { name: "Help" })).toBeNull();
  });
});

describe("rail", () => {
  it("collapse writes rail, expand writes open", async () => {
    const user = userEvent.setup();
    render(shell());
    await user.click(screen.getByRole("button", { name: "Collapse menu" }));
    expect(column()).toHaveAttribute("data-menu-mode", "rail");
    expect(window.localStorage.getItem("bw.app-shell.menu")).toBe("rail");
    await user.click(screen.getByRole("button", { name: "Expand menu" }));
    expect(column()).toHaveAttribute("data-menu-mode", "open");
    expect(window.localStorage.getItem("bw.app-shell.menu")).toBe("open");
  });

  it("shows a dot for waiting counts, with the number in the trigger name", async () => {
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell());
    const trigger = await within(column()).findByRole("button", { name: "Loads 2" });
    expect(trigger.querySelector("[data-rail-dot]")).not.toBeNull();
    expect(
      within(column()).getByRole("button", { name: "Stock" }).querySelector("[data-rail-dot]"),
    ).toBeNull();
  });

  it("opens a flyout on keyboard focus, reaches its links, and Esc returns focus", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell());
    const trigger = await within(column()).findByRole("button", { name: "Loads 2" });
    await user.tab(); // expand button
    await user.tab(); // Loads trigger
    expect(trigger).toHaveFocus();
    const flyout = await screen.findByRole("link", { name: "Waiting 2" });
    expect(flyout).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "All loads" })).toBeInTheDocument();
    expect(screen.queryByText("Hidden one")).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("link", { name: "All loads" })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("opens a flyout on click and lists exactly the visible items", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell());
    await user.click(await within(column()).findByRole("button", { name: "Stock" }));
    expect(await screen.findByRole("link", { name: "Bins" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "All loads" })).toBeNull();
  });
});

describe("persistence", () => {
  it("mounts as the rail when rail is remembered", async () => {
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell());
    expect(column()).toHaveAttribute("data-menu-mode", "rail");
  });
  it("is open for nothing, or junk", () => {
    window.localStorage.setItem("bw.app-shell.menu", "sideways");
    render(shell());
    expect(column()).toHaveAttribute("data-menu-mode", "open");
  });
  it("honours a custom storageKey", async () => {
    const user = userEvent.setup();
    render(shell({ storageKey: "app.x" }));
    await user.click(screen.getByRole("button", { name: "Collapse menu" }));
    expect(window.localStorage.getItem("app.x")).toBe("rail");
    expect(window.localStorage.getItem("bw.app-shell.menu")).toBeNull();
  });
  it("is not fatal when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    render(shell());
    await user.click(screen.getByRole("button", { name: "Collapse menu" }));
    expect(column()).toHaveAttribute("data-menu-mode", "rail");
  });
  it("renders open on the server even when rail is remembered (storage is read after mount)", () => {
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    const get = vi.spyOn(Storage.prototype, "getItem");
    // No menu links here: the shared next/link stand-in has no server snapshot.
    const html = renderToString(shell({ menu: [], footItems: [] }));
    expect(html).toContain('data-menu-mode="open"');
    expect(get).not.toHaveBeenCalled();
  });
});

describe("narrow slide-out", () => {
  it("opens from the header button with focus inside, holds the same accordion, never the rail", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell());
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(within(dialog).getByRole("button", { name: /^Loads/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(within(dialog).getByRole("link", { name: "Help" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Expand menu" })).toBeNull();
  });

  it("closes on Esc and returns focus to the button", async () => {
    const user = userEvent.setup();
    render(shell());
    const button = screen.getByRole("button", { name: "Open menu" });
    await user.click(button);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(button).toHaveFocus();
  });

  it("closes on the close button, and on choosing a screen", async () => {
    const user = userEvent.setup();
    render(shell());
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Close menu" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const link = within(await screen.findByRole("dialog")).getByRole("link", { name: "All loads" });
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes when the path changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(shell());
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await screen.findByRole("dialog");
    rerender(shell({ pathname: "/stock/bins" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the compact title in place of the breadcrumb when given", () => {
    render(shell({ compactTitle: <span>Compact</span> }));
    expect(screen.getByText("Compact")).toBeInTheDocument();
    expect(screen.getByText("Crumb")).toBeInTheDocument();
  });
});

describe("layout contract", () => {
  it("the page area is the only scroller: overflow-auto, p-6, no cap, one main", () => {
    render(shell());
    const mains = document.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    const cls = mains[0]!.className;
    expect(cls).toContain("overflow-auto");
    expect(cls).toContain("p-6");
    expect(cls).not.toMatch(/max-w-|mx-auto/);
    expect(mains[0]!.parentElement!.parentElement!.className).toContain("h-dvh");
    expect(mains[0]!.parentElement!.parentElement!.className).toContain("overflow-hidden");
  });
  it("the current screen changes only when the app says so", () => {
    function Host() {
      const [p, setP] = useState("/loads/waiting");
      return (
        <>
          <button onClick={() => setP("/stock/bins")}>go</button>
          {shell({ pathname: p })}
        </>
      );
    }
    render(<Host />);
    act(() => screen.getByText("go").click());
    expect(within(column()).getByRole("link", { name: "Bins" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

// CR-DESIGN-SYSTEM-034 — topItems: a slot above the first heading in all three modes.
describe("top items", () => {
  const TOP = [
    {
      id: "dash",
      label: "Dashboard",
      href: "/dashboard",
      icon: <svg data-icon="dash" />,
      exact: true,
    },
  ];
  const ON = "bg-accent-subtle";
  const BAR = "shadow-[inset_3px_0_0_var(--color-accent)]";

  it("open: before the first heading; icon, no chevron, no aria-expanded, not current elsewhere", () => {
    render(shell({ topItems: TOP, pathname: "/loads/waiting" }));
    const nav = within(column()).getByRole("navigation", { name: "Main menu" });
    const link = within(nav).getByRole("link", { name: "Dashboard" });
    const heading = within(nav).getByRole("button", { name: /^Loads/ });
    expect(link.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(link.querySelector("[data-icon=dash]")).not.toBeNull();
    expect(link.querySelector("svg.lucide-chevron-down")).toBeNull();
    expect(link).not.toHaveAttribute("aria-expanded");
    expect(link).not.toHaveAttribute("aria-current");
    expect(link.className).not.toContain(ON);
    expect(heading).toHaveAttribute("data-current"); // the heading mark is unaffected
  });

  it("open: current gets aria-current and the item on style; exact ignores sub-paths", () => {
    const { unmount } = render(shell({ topItems: TOP, pathname: "/dashboard" }));
    const link = within(column()).getByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.className).toContain(ON);
    expect(link.className).toContain(BAR);
    unmount();
    render(shell({ topItems: TOP, pathname: "/dashboard/x" }));
    expect(within(column()).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("open and rail: without exact, a path under the item's path marks it current too", async () => {
    const loose = [{ ...(TOP[0] as (typeof TOP)[number]), exact: undefined }];
    const { unmount } = render(shell({ topItems: loose, pathname: "/dashboard/x" }));
    expect(within(column()).getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    unmount();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell({ topItems: loose, pathname: "/dashboard/x" }));
    expect(await within(column()).findByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("rail: first focusable item, named by its label, no flyout; ArrowDown reaches the first heading", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell({ topItems: TOP, pathname: "/dashboard" }));
    const link = await within(column()).findByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.className).toContain(ON);
    expect(link.className).toContain(BAR);
    const nav = within(column()).getByRole("navigation", { name: "Main menu" });
    expect(nav.querySelector("a,button")).toBe(link);
    await user.tab(); // expand button
    await user.tab();
    expect(link).toHaveFocus();
    expect(screen.queryByRole("link", { name: "Waiting 2" })).toBeNull(); // no flyout opened
    await user.keyboard("{ArrowDown}");
    expect(within(column()).getByRole("button", { name: "Loads 2" })).toHaveFocus();
  });

  it("slide-out: first link in the dialog, current, and choosing it closes the dialog", async () => {
    const user = userEvent.setup();
    render(shell({ topItems: TOP, pathname: "/dashboard" }));
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    const link = within(dialog).getAllByRole("link")[0] as HTMLElement;
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.textContent).toBe("Dashboard");
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hidden: absent in all three modes, and no list is left behind", async () => {
    const user = userEvent.setup();
    const hidden = [{ ...(TOP[0] as (typeof TOP)[number]), hidden: true }];
    const { unmount } = render(shell({ topItems: hidden }));
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(column().querySelectorAll("ul")).toHaveLength(2); // foot list + the Loads accordion list
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("link", { name: "Dashboard" })).toBeNull();
    unmount();
    window.localStorage.setItem("bw.app-shell.menu", "rail");
    render(shell({ topItems: hidden }));
    await within(column()).findByRole("button", { name: "Loads 2" });
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
  });
});
