"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib";
import { AppHeader } from "./AppHeader";
import { MENU_BUTTON, SideColumn } from "./SideColumn";
import { SideMenu } from "./SideMenu";
import { TooltipProvider } from "./Tooltip";
import {
  DEFAULT_MENU_STORAGE_KEY,
  readMenuMode,
  visibleMenuGroups,
  writeMenuMode,
  type AppMenuFootItem,
  type AppMenuGroup,
  type AppMenuMode,
} from "./app-menu";

/**
 * AppShell — the shared office app frame (CR-DESIGN-SYSTEM-032): side menu, 64 px icon rail, fixed
 * header, and a page area that is the ONLY scroll container. Under 1024 px the menu hides behind a
 * header button and slides out over a scrim. The app passes its own menu data, words and colours
 * (tokens); the kit reads no router and decides no permission — `hidden` is the app's word.
 *
 * Render exactly ONE <main>: this component owns it. Pages must not add a second, a max-width
 * cap or their own outer padding.
 */
export interface AppShellWords {
  readonly menu: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly collapseMenu: string;
  readonly expandMenu: string;
}

export interface AppShellProps {
  readonly brand: { readonly name: string; readonly mark: ReactNode };
  readonly menu: readonly AppMenuGroup[];
  /** Pinned at the bottom of the menu (the packhouse puts Help here). */
  readonly footItems?: readonly AppMenuFootItem[];
  /** The current path. The app passes its router's pathname; the kit reads no router. */
  readonly pathname: string;
  readonly breadcrumb?: ReactNode;
  /** Shown instead of the breadcrumb under 1024 px. Default: the breadcrumb. */
  readonly compactTitle?: ReactNode;
  readonly tools?: ReactNode;
  /** Normally a <UserMenu/>. */
  readonly user?: ReactNode;
  readonly words: AppShellWords;
  /** localStorage key for open/rail. Default "bw.app-shell.menu". */
  readonly storageKey?: string;
  readonly children: ReactNode;
}

/** The slide-out: the same SideMenu in a left-anchored Radix Dialog (focus trap, Esc, scrim tap). */
function SlideOutMenu(props: {
  shell: AppShellProps;
  groups: AppMenuGroup[];
  footItems: AppMenuFootItem[];
  close: () => void;
}) {
  const { shell } = props;
  // Mounts at translate -100%, then slides in; closing unmounts (no plugin needed in the consumer).
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(true), []);
  return (
    <Dialog.Portal>
      {/* bg-fg + opacity (not bg-fg/40): the token is a CSS variable, so an alpha modifier needs a consumer config that supports it. */}
      <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-fg opacity-40" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-[var(--z-modal)] w-[var(--layout-sidebar-width)] max-w-[85vw]",
          "border-r border-border bg-surface shadow-lg focus:outline-none",
          "transition-transform duration-200 motion-reduce:transition-none",
          shown ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Dialog.Title className="sr-only">{shell.brand.name}</Dialog.Title>
        <SideMenu
          brand={shell.brand}
          groups={props.groups}
          footItems={props.footItems}
          pathname={shell.pathname}
          menuLabel={shell.words.menu}
          onNavigate={props.close}
          headerAction={
            <Dialog.Close aria-label={shell.words.closeMenu} className={MENU_BUTTON}>
              <X aria-hidden="true" className="h-4 w-4" />
            </Dialog.Close>
          }
        />
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function AppShell(props: AppShellProps) {
  const { words, pathname } = props;
  const storageKey = props.storageKey ?? DEFAULT_MENU_STORAGE_KEY;
  // Open on the server and on first paint; the remembered choice is read after mount.
  const [mode, setMode] = useState<AppMenuMode>("open");
  const [slideOut, setSlideOut] = useState(false);
  useEffect(() => setMode(readMenuMode(storageKey)), [storageKey]);
  useEffect(() => setSlideOut(false), [pathname]);

  const groups = visibleMenuGroups(props.menu);
  const footItems = (props.footItems ?? []).filter((item) => item.hidden !== true);
  function choose(next: AppMenuMode) {
    setMode(next);
    writeMenuMode(storageKey, next);
  }

  return (
    <TooltipProvider>
      <Dialog.Root open={slideOut} onOpenChange={setSlideOut}>
        <div className="flex h-dvh overflow-hidden bg-bg text-fg">
          <SideColumn
            brand={props.brand}
            groups={groups}
            footItems={footItems}
            pathname={pathname}
            mode={mode}
            words={words}
            choose={choose}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader
              openMenuLabel={words.openMenu}
              breadcrumb={props.breadcrumb}
              compactTitle={props.compactTitle}
              tools={props.tools}
              user={props.user}
            />
            <main className="min-h-0 flex-1 overflow-auto p-6">{props.children}</main>
          </div>
        </div>
        <SlideOutMenu
          shell={props}
          groups={groups}
          footItems={footItems}
          close={() => setSlideOut(false)}
        />
      </Dialog.Root>
    </TooltipProvider>
  );
}
