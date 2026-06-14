"use client";

// RowActions — the per-row "⋯" actions menu (EPIC-009-M005, REF-017). The owner-chosen compact menu: a
// three-dot trigger at the end of a row opens a small dropdown of the row's valid actions; the table stays
// tidy and only the actions that apply to that row are rendered. Built on Radix DropdownMenu for keyboard
// + screen-reader correctness, portalled at --z-dropdown so it escapes the table's overflow container.
//
// Pure UI (TECH-COMP-003): the menu only fires callbacks; the SERVER authorises every action
// (RBAC-PRINCIPLE-001). Used first by the PO list (Receive / Close / Delete-if-not-received).

import { type ReactElement, type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { cn } from "../lib";

export interface RowActionsProps {
  readonly children: ReactNode;
  readonly label?: string;
}

// The trigger stops click propagation so opening the menu never also triggers the row's own onClick (the
// PO rows open the editor on click). `asChild` keeps it a single <button>.
export function RowActions({ children, label = "Row actions" }: RowActionsProps): ReactElement {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted",
            "hover:bg-surface-muted hover:text-fg",
            "focus-visible:outline-none focus-visible:shadow-focus",
            "data-[state=open]:bg-surface-muted data-[state=open]:text-fg",
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          // Stop propagation so a click inside the menu never bubbles to the row.
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "z-[var(--z-dropdown)] min-w-[10rem] overflow-hidden rounded-md border border-border",
            "bg-surface p-1 shadow-lg animate-fade-in",
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export interface RowActionItemProps {
  readonly onSelect: () => void;
  readonly children: ReactNode;
  readonly disabled?: boolean;
  /** Render the destructive variant (e.g. Delete). */
  readonly tone?: "default" | "danger";
}

export function RowActionItem({
  onSelect,
  children,
  disabled,
  tone = "default",
}: RowActionItemProps): ReactElement {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={() => onSelect()}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[highlighted]:bg-surface-muted",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        tone === "danger" ? "text-danger-fg data-[highlighted]:bg-danger-subtle" : "text-fg",
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function RowActionSeparator(): ReactElement {
  return <DropdownMenu.Separator className="my-1 h-px bg-border" />;
}
