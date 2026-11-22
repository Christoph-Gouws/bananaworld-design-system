"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu } from "lucide-react";

// CR-DESIGN-SYSTEM-032 — INTERNAL. The fixed header: [menu button, narrow only] [breadcrumb or
// compact title] … [tools] [user]. The menu button is the Dialog.Trigger of the slide-out, so Radix
// returns focus to it when the slide-out closes. Must render inside the shell's Dialog.Root.

export interface AppHeaderProps {
  readonly openMenuLabel: string;
  readonly breadcrumb?: ReactNode;
  readonly compactTitle?: ReactNode;
  readonly tools?: ReactNode;
  readonly user?: ReactNode;
}

export function AppHeader(props: AppHeaderProps) {
  const { breadcrumb, compactTitle } = props;
  return (
    <header className="flex h-[var(--layout-header-height)] shrink-0 items-center gap-3 border-b border-border bg-surface px-5">
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={props.openMenuLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <div className="min-w-0 flex-1">
        {compactTitle != null ? (
          <>
            <div className="hidden lg:block">{breadcrumb}</div>
            <div className="lg:hidden">{compactTitle}</div>
          </>
        ) : (
          breadcrumb
        )}
      </div>
      {props.tools != null && <div className="flex shrink-0 items-center gap-2">{props.tools}</div>}
      {props.user != null && <div className="shrink-0">{props.user}</div>}
    </header>
  );
}
