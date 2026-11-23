"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "../lib";
import { Link } from "./Link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import {
  currentGroupId,
  headingCount,
  nameWithCount,
  type AppMenuFootItem,
  type AppMenuGroup,
  type AppMenuTopItem,
  isMenuItemCurrent,
} from "./app-menu";
import { MenuItems } from "./SideMenu";

// CR-DESIGN-SYSTEM-032 — INTERNAL. The 64 px icon rail. Each heading is an icon button whose flyout
// lists that heading's screens; it opens on hover AND on keyboard focus. Radix NavigationMenu gives
// the hover intent delay, Esc with focus returned, and arrow keys between triggers.

const FLYOUT_GAP_PX = 4;
/** The flyout never starts above, or runs past the bottom of, the viewport by less than this. */
const VIEWPORT_MARGIN_PX = 8;

function RailGroup(props: {
  group: AppMenuGroup;
  current: boolean;
  open: boolean;
  pathname: string;
  /** Set by a pointer press, so the focus that follows a mouse click does not double-open. */
  pointerRef: { current: boolean };
  onFocusOpen: () => void;
}) {
  const { group, current, open, pointerRef } = props;
  const count = headingCount(group);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [top, setTop] = useState(0);
  // The flyout is position:fixed so the scrolling rail cannot clip it; its top follows the trigger.
  useLayoutEffect(() => {
    if (open && triggerRef.current)
      setTop(Math.max(VIEWPORT_MARGIN_PX, triggerRef.current.getBoundingClientRect().top));
  }, [open]);

  return (
    <NavigationMenu.Item value={group.id} className="relative">
      <NavigationMenu.Trigger
        ref={triggerRef}
        aria-label={nameWithCount(group.label, count)}
        data-current={current ? "" : undefined}
        onPointerDown={() => {
          pointerRef.current = true;
        }}
        onFocus={() => {
          if (pointerRef.current) pointerRef.current = false;
          else props.onFocusOpen();
        }}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-md text-fg-muted",
          "hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
          current && "bg-accent-subtle text-accent",
        )}
      >
        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
          {group.icon}
        </span>
        {count > 0 && (
          <span
            aria-hidden="true"
            data-rail-dot=""
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning"
          />
        )}
      </NavigationMenu.Trigger>
      <NavigationMenu.Content
        style={{
          left: `calc(4rem + ${String(FLYOUT_GAP_PX)}px)`,
          top,
          maxHeight: `calc(100dvh - ${String(top + VIEWPORT_MARGIN_PX)}px)`,
        }}
        className="fixed z-[var(--z-sticky)] w-56 overflow-y-auto rounded-md border border-border bg-surface p-2 shadow-lg"
      >
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
          {group.label}
        </p>
        <MenuItems items={group.items} pathname={props.pathname} />
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

/**
 * CR-DESIGN-SYSTEM-034 — a top item in the rail: an icon link INSIDE the NavigationMenu list (so
 * Tab and the arrow keys treat it like a heading icon), with no Trigger and no Content, so no flyout.
 */
function RailTopLink({ item, pathname }: { item: AppMenuTopItem; pathname: string }) {
  const current = isMenuItemCurrent(item, pathname);
  return (
    <NavigationMenu.Item>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavigationMenu.Link asChild active={current}>
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-md text-fg-muted no-underline",
                "hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
                current &&
                  "bg-accent-subtle text-accent shadow-[inset_3px_0_0_var(--color-accent)]",
              )}
            >
              <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
                {item.icon}
              </span>
            </Link>
          </NavigationMenu.Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    </NavigationMenu.Item>
  );
}

function RailFoot({ items, pathname }: { items: readonly AppMenuFootItem[]; pathname: string }) {
  return (
    <ul className="flex shrink-0 flex-col items-center gap-1 border-t border-border p-2">
      {items.map((item) => (
        <li key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex h-10 w-10 items-center justify-center rounded-md text-fg-muted no-underline hover:bg-surface-muted hover:text-fg"
              >
                <span aria-hidden="true">{item.icon}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}

function RailTop(props: { mark: ReactNode; label: string; onExpand: () => void }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2 border-b border-border py-3">
      <span className="flex h-8 items-center">{props.mark}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={props.label}
            onClick={props.onExpand}
            className="flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus"
          >
            <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{props.label}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export interface MenuRailProps {
  readonly brandMark: ReactNode;
  readonly groups: readonly AppMenuGroup[];
  readonly footItems: readonly AppMenuFootItem[];
  /** Already filtered through `visibleTopItems`. */
  readonly topItems: readonly AppMenuTopItem[];
  readonly pathname: string;
  readonly menuLabel: string;
  readonly expandLabel: string;
  readonly onExpand: () => void;
}

export function MenuRail(props: MenuRailProps) {
  const { groups, pathname } = props;
  const [value, setValue] = useState("");
  const pointerRef = useRef(false);
  const current = currentGroupId(groups, pathname);
  // A navigation (including one from inside a flyout) closes whatever flyout is open.
  useEffect(() => setValue(""), [pathname]);

  return (
    <div className="flex h-full min-h-0 w-16 flex-col">
      <RailTop mark={props.brandMark} label={props.expandLabel} onExpand={props.onExpand} />
      <NavigationMenu.Root
        orientation="vertical"
        aria-label={props.menuLabel}
        value={value}
        onValueChange={setValue}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <NavigationMenu.List className="flex flex-col items-center gap-1 p-2">
          {props.topItems.map((item) => (
            <RailTopLink key={item.id} item={item} pathname={pathname} />
          ))}
          {groups.map((group) => (
            <RailGroup
              key={group.id}
              group={group}
              current={group.id === current}
              open={value === group.id}
              pathname={pathname}
              pointerRef={pointerRef}
              onFocusOpen={() => setValue(group.id)}
            />
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <RailFoot items={props.footItems} pathname={pathname} />
    </div>
  );
}
