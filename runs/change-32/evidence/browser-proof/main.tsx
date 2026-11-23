// CR-DESIGN-SYSTEM-034 proof page: the REAL AppShell with `topItems` (Dashboard above six headings, as in
// the owner-approved mockup). Query:
//   ?theme=packhouse  teal accent (default: the DC's yellow)
//   ?path=/dashboard  the current path (default /dashboard)
//   ?top=0            no topItems (the control)
import { useEffect, useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import {
  Boxes,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import { AppShell, PageHeader, type AppMenuGroup } from "../../../../src";

const params = new URLSearchParams(location.search);
if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme")!;

const icon = (node: ReactElement) => node;
const group = (id: string, label: string, ic: ReactElement, items: AppMenuGroup["items"]): AppMenuGroup => ({
  id,
  label,
  icon: icon(ic),
  items,
});
const MENU: AppMenuGroup[] = [
  group("loads", "Loads", <Truck className="h-5 w-5" />, [
    { id: "waiting", label: "Waiting", href: "/loads/waiting", count: 2 },
    { id: "all", label: "All loads", href: "/loads", exact: true },
  ]),
  group("stock", "Stock", <Boxes className="h-5 w-5" />, [
    { id: "bins", label: "Bins", href: "/stock/bins" },
  ]),
  group("orders", "Orders", <ClipboardList className="h-5 w-5" />, [
    { id: "o", label: "Open orders", href: "/orders" },
  ]),
  group("pack", "Packing", <Package className="h-5 w-5" />, [
    { id: "p", label: "Pack lines", href: "/pack" },
  ]),
  group("people", "People", <Users className="h-5 w-5" />, [
    { id: "pp", label: "Staff", href: "/people" },
  ]),
  group("admin", "Admin", <Settings className="h-5 w-5" />, [
    { id: "users", label: "Users", href: "/admin/users" },
  ]),
];

function Mark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-fg-on-accent">
      PH
    </span>
  );
}

function App() {
  const [path, setPath] = useState(params.get("path") ?? "/dashboard");
  useEffect(() => {
    const go = (e: Event) => setPath((e as CustomEvent<string>).detail);
    window.addEventListener("proof-navigate", go);
    return () => window.removeEventListener("proof-navigate", go);
  }, []);
  const topItems =
    params.get("top") === "0"
      ? undefined
      : [
          {
            id: "dash",
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
            exact: true,
          },
        ];
  return (
    <AppShell
      brand={{ name: "Packhouse", mark: <Mark /> }}
      menu={MENU}
      topItems={topItems}
      footItems={[{ id: "help", label: "Help", href: "/help", icon: <CircleHelp className="h-5 w-5" /> }]}
      pathname={path}
      breadcrumb={<span className="text-sm text-fg-muted">Packhouse / Dashboard</span>}
      compactTitle={<span className="text-sm font-semibold">Dashboard</span>}
      words={{
        menu: "Main menu",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        collapseMenu: "Collapse menu",
        expandMenu: "Expand menu",
      }}
    >
      <PageHeader title="Dashboard" description="Today at a glance." />
      <div className="rounded-lg border border-border bg-surface p-4">Page content.</div>
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
