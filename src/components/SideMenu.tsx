"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib";
import { Link } from "./Link";
import {
  currentGroupId,
  headingCount,
  isMenuItemCurrent,
  positiveCount,
  type AppMenuFootItem,
  type AppMenuGroup,
  type AppMenuItem,
  type AppMenuTopItem,
} from "./app-menu";

// CR-DESIGN-SYSTEM-032 — INTERNAL (not exported from the barrel; plan D-1). The open side menu:
// grouped headings with an icon each, the screens under a heading as plain text, one heading open
// at a time. `MenuItems` is also the body of the rail's flyout: one renderer, two places.

/**
 * The waiting-count pill. It is part of the link's own text, so the accessible name is "label n" and
 * always contains the words a sighted person reads (WCAG 2.5.3 label in name; axe checks it).
 */
export function CountPill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto rounded-full bg-warning-subtle px-1.5 text-[11px] font-semibold leading-5 text-warning-fg">
      {" "}
      {count}
    </span>
  );
}

export function MenuItems(props: {
  items: readonly AppMenuItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {props.items.map((item) => {
        const count = positiveCount(item.count);
        const current = isMenuItemCurrent(item, props.pathname);
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              onClick={props.onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md py-1.5 pl-10 pr-3 text-sm no-underline",
                "text-fg-muted hover:bg-surface-muted hover:text-fg",
                current &&
                  "bg-accent-subtle font-semibold text-fg shadow-[inset_3px_0_0_var(--color-accent)]",
              )}
            >
              <span className="truncate">{item.label}</span>
              <CountPill count={count} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Heading({ group, current }: { group: AppMenuGroup; current: boolean }) {
  const count = headingCount(group);
  return (
    <Accordion.Header asChild>
      <div>
        <Accordion.Trigger
          data-current={current ? "" : undefined}
          className={cn(
            "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
            "text-fg-muted hover:bg-surface-muted hover:text-fg",
            "focus-visible:outline-none focus-visible:shadow-focus",
            current && "font-semibold text-fg",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center",
              current && "text-accent",
            )}
          >
            {group.icon}
          </span>
          <span className="truncate">{group.label}</span>
          <CountPill count={count} />
          <ChevronDown
            aria-hidden="true"
            className="ml-auto h-4 w-4 shrink-0 text-fg-subtle transition-transform group-data-[state=open]:rotate-180"
          />
        </Accordion.Trigger>
      </div>
    </Accordion.Header>
  );
}

/** CR-DESIGN-SYSTEM-034 — items above the first heading: a heading's row with no chevron or count. */
function TopLinks(props: {
  items: readonly AppMenuTopItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="mb-0.5 flex flex-col gap-0.5">
      {props.items.map((item) => {
        const current = isMenuItemCurrent(item, props.pathname);
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              onClick={props.onNavigate}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm no-underline",
                "text-fg-muted hover:bg-surface-muted hover:text-fg",
                "focus-visible:outline-none focus-visible:shadow-focus",
                current &&
                  "bg-accent-subtle font-semibold text-fg shadow-[inset_3px_0_0_var(--color-accent)]",
              )}
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center"
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function FootLinks(props: {
  items: readonly AppMenuFootItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {props.items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            aria-current={props.pathname === item.href ? "page" : undefined}
            onClick={props.onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-fg-muted no-underline hover:bg-surface-muted hover:text-fg"
          >
            <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
              {item.icon}
            </span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export interface SideMenuProps {
  readonly brand: { readonly name: string; readonly mark: ReactNode };
  /** Already filtered through `visibleMenuGroups`. */
  readonly groups: readonly AppMenuGroup[];
  readonly footItems: readonly AppMenuFootItem[];
  /** Already filtered through `visibleTopItems`. */
  readonly topItems: readonly AppMenuTopItem[];
  readonly pathname: string;
  readonly menuLabel: string;
  /** The collapse button (open menu) or the close button (slide-out). */
  readonly headerAction: ReactNode;
  readonly onNavigate?: () => void;
}

export function SideMenu(props: SideMenuProps) {
  const { groups, footItems, pathname } = props;
  const current = currentGroupId(groups, pathname);
  // The current screen's heading opens on mount and whenever navigation moves to another group;
  // a heading opened by hand stays open until then.
  const [open, setOpen] = useState<string>(current ?? "");
  useEffect(() => {
    if (current !== null) setOpen(current);
  }, [current]);

  return (
    <nav aria-label={props.menuLabel} className="flex h-full min-h-0 flex-col">
      <div className="flex h-[var(--layout-header-height)] shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="flex shrink-0 items-center">{props.brand.mark}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
          {props.brand.name}
        </span>
        {props.headerAction}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {props.topItems.length > 0 && (
          <TopLinks items={props.topItems} pathname={pathname} onNavigate={props.onNavigate} />
        )}
        <Accordion.Root type="single" collapsible value={open} onValueChange={setOpen}>
          {groups.map((group) => (
            <Accordion.Item key={group.id} value={group.id}>
              <Heading group={group} current={group.id === current} />
              <Accordion.Content>
                <MenuItems items={group.items} pathname={pathname} onNavigate={props.onNavigate} />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
      {footItems.length > 0 && (
        <div className="shrink-0 border-t border-border p-2">
          <FootLinks items={footItems} pathname={pathname} onNavigate={props.onNavigate} />
        </div>
      )}
    </nav>
  );
}
