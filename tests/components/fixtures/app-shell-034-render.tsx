import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell, type AppMenuGroup, type AppShellProps } from "../../../src";

// CR-DESIGN-SYSTEM-034 — renders the PH-style call (menu + footItems, no topItems) in the states the
// frozen-HTML spec compares. Used both to CAPTURE the baseline at f5ec58c and to CHECK after the change.

const WORDS = {
  menu: "Main menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  collapseMenu: "Collapse menu",
  expandMenu: "Expand menu",
};

export const MENU: AppMenuGroup[] = [
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
];

export function frozenShell(over: Partial<AppShellProps> = {}): ReactElement {
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

/** React/Radix ids differ run to run; number them in order of appearance. */
export function normalise(html: string): string {
  const seen = new Map<string, string>();
  return html.replace(/_r_[0-9a-z]+_|[:«]r[0-9a-z]+[:»]/g, (m) => {
    if (!seen.has(m)) seen.set(m, `ID${String(seen.size)}`);
    return seen.get(m) as string;
  });
}

export type FrozenState = "open" | "rail" | "slideout" | "ssr";

export async function renderState(
  state: FrozenState,
  over: Partial<AppShellProps>,
): Promise<string> {
  // No menu links on the server: the shared next/link stand-in has no server snapshot.
  if (state === "ssr")
    return normalise(renderToString(frozenShell({ menu: [], footItems: [], ...over })));
  window.localStorage.clear();
  if (state === "rail") window.localStorage.setItem("bw.app-shell.menu", "rail");
  const { container, baseElement } = render(frozenShell(over));
  await act(async () => {});
  if (state === "slideout") {
    await userEvent.setup().click(screen.getByRole("button", { name: "Open menu" }));
    await act(async () => {});
    return normalise(baseElement.innerHTML);
  }
  return normalise(container.innerHTML);
}
