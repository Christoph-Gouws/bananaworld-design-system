// CR-DESIGN-SYSTEM-032 proof page: the REAL AppShell, the packhouse's menu from the mockup. Query:
//   ?theme=packhouse  teal accent (default: the DC's yellow)
//   ?long=1           extra headings so the menu has to scroll
import { useEffect, useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import {
  Boxes,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Truck,
} from "lucide-react";
import { AppShell, EmptyState, PageHeader, UserMenu, type AppMenuGroup } from "../../../../src";

const params = new URLSearchParams(location.search);
if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme")!;

const icon = (node: ReactElement) => node;
const BASE: AppMenuGroup[] = [
  {
    id: "today",
    label: "Today",
    icon: icon(<LayoutDashboard className="h-5 w-5" />),
    items: [
      { id: "dash", label: "Dashboard", href: "/today", exact: true },
      { id: "shift", label: "End of shift", href: "/today/shift" },
    ],
  },
  {
    id: "loads",
    label: "Loads",
    icon: icon(<Truck className="h-5 w-5" />),
    items: [
      { id: "waiting", label: "Waiting", href: "/loads/waiting", count: 2 },
      { id: "all", label: "All loads", href: "/loads", exact: true },
      { id: "plan", label: "Load plan", href: "/loads/plan" },
    ],
  },
  {
    id: "stock",
    label: "Stock",
    icon: icon(<Boxes className="h-5 w-5" />),
    items: [
      { id: "bins", label: "Bins", href: "/stock/bins" },
      { id: "pallets", label: "Pallets", href: "/stock/pallets" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: icon(<ClipboardList className="h-5 w-5" />),
    items: [{ id: "o", label: "Open orders", href: "/orders" }],
  },
  {
    id: "admin",
    label: "Admin",
    icon: icon(<Settings className="h-5 w-5" />),
    items: [{ id: "users", label: "Users", href: "/admin/users", hidden: true }],
  },
];
const LONG: AppMenuGroup[] = Array.from({ length: 8 }, (_, i) => ({
  id: `extra${String(i)}`,
  label: `Extra heading ${String(i + 1)}`,
  icon: icon(<Boxes className="h-5 w-5" />),
  items: [{ id: `e${String(i)}`, label: `Extra screen ${String(i + 1)}`, href: `/extra/${String(i)}` }],
}));

function Mark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-fg-on-accent">
      PH
    </span>
  );
}

function App() {
  const [path, setPath] = useState(params.get("path") ?? "/loads/waiting");
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const go = (e: Event) => setPath((e as CustomEvent<string>).detail);
    window.addEventListener("proof-navigate", go);
    return () => window.removeEventListener("proof-navigate", go);
  }, []);
  const empty = params.get("empty") === "1";
  return (
    <AppShell
      brand={{ name: "Packhouse", mark: <Mark /> }}
      menu={params.get("long") ? [...BASE, ...LONG] : BASE}
      footItems={[{ id: "help", label: "Help", href: "/help", icon: <CircleHelp className="h-5 w-5" /> }]}
      pathname={path}
      breadcrumb={<span className="text-sm text-fg-muted">Loads / Waiting</span>}
      compactTitle={<span className="text-sm font-semibold">Waiting loads</span>}
      tools={<button className="h-9 rounded-md border border-border px-3 text-sm">Ask</button>}
      user={
        <UserMenu
          name="Ana Silva"
          initials="AS"
          triggerLabel="Account menu"
          rolesLine="Order centre · Senior manager"
          secondStep="2-step sign-in on"
          settings={{ href: "/settings", label: "My settings", hint: "Profile" }}
          language={{
            label: "Language",
            value: lang,
            options: [
              { id: "en", name: "EN" },
              { id: "pt", name: "PT" },
            ],
            onChange: setLang,
          }}
          signOut={{ label: "Sign out", onSelect: () => undefined }}
        />
      }
      words={{
        menu: "Main menu",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        collapseMenu: "Collapse menu",
        expandMenu: "Expand menu",
      }}
    >
      <PageHeader
        title="Waiting loads"
        description="Loads that are ready and waiting for a truck."
        actions={<button className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-fg-on-accent">New load</button>}
      />
      {empty ? (
        <EmptyState heading="No loads are waiting" message="When a load is ready it shows up here." />
      ) : (
        <div id="page-content" className="rounded-lg border border-border bg-surface p-4">
          <div style={{ height: 3000 }}>Tall page content (the page area is the only scroller).</div>
        </div>
      )}
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
