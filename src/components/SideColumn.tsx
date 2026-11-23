"use client";

import type { ReactNode } from "react";
import { PanelLeftClose } from "lucide-react";
import { cn } from "../lib";
import { MenuRail } from "./MenuRail";
import { SideMenu } from "./SideMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import type { AppMenuFootItem, AppMenuGroup, AppMenuMode, AppMenuTopItem } from "./app-menu";

// CR-DESIGN-SYSTEM-032 — INTERNAL. The desktop menu column: the open menu or the 64 px rail.
// Hidden under 1024 px (the slide-out takes over there).

export const MENU_BUTTON =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus";

function CollapseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} onClick={onClick} className={MENU_BUTTON}>
          <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export interface SideColumnProps {
  readonly brand: { readonly name: string; readonly mark: ReactNode };
  readonly groups: readonly AppMenuGroup[];
  readonly footItems: readonly AppMenuFootItem[];
  /** Already filtered through `visibleTopItems`. */
  readonly topItems: readonly AppMenuTopItem[];
  readonly pathname: string;
  readonly mode: AppMenuMode;
  readonly words: {
    readonly menu: string;
    readonly collapseMenu: string;
    readonly expandMenu: string;
  };
  readonly choose: (next: AppMenuMode) => void;
}

export function SideColumn(props: SideColumnProps) {
  const { mode, words, choose } = props;
  const common = {
    groups: props.groups,
    footItems: props.footItems,
    topItems: props.topItems,
    pathname: props.pathname,
    menuLabel: words.menu,
  };
  return (
    <aside
      data-menu-mode={mode}
      className={cn(
        "hidden h-full shrink-0 border-r border-border bg-surface lg:flex lg:flex-col",
        mode === "rail" ? "w-16" : "w-[var(--layout-sidebar-width)]",
      )}
    >
      {mode === "rail" ? (
        <MenuRail
          {...common}
          brandMark={props.brand.mark}
          expandLabel={words.expandMenu}
          onExpand={() => choose("open")}
        />
      ) : (
        <SideMenu
          {...common}
          brand={props.brand}
          headerAction={
            <CollapseButton label={words.collapseMenu} onClick={() => choose("rail")} />
          }
        />
      )}
    </aside>
  );
}
