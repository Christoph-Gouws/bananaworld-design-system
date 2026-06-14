"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

/**
 * ListCard — UX-DS-005.
 * Tablet station cards minimum 80px tall, tap target spans full card.
 * Browser list rows 44px tall.
 */
const listCardStyles = cva(
  [
    "block w-full text-left",
    "bg-surface border border-border",
    "transition-[background-color,border-color,box-shadow]",
    "duration-fast ease-out",
    "focus-visible:outline-none focus-visible:shadow-focus",
  ],
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:bg-surface-muted hover:border-border-strong active:bg-surface-sunken",
        false: "",
      },
      density: {
        // Browser row pattern — 44px tall, tighter padding
        row: "min-h-[44px] px-3 py-2 rounded-md",
        // Tablet card pattern — 80px+ tall, generous padding, tappable full surface
        card: "min-h-[80px] p-4 rounded-lg [[data-surface=tablet]_&]:min-h-[96px] [[data-surface=tablet]_&]:p-5",
      },
    },
    defaultVariants: { interactive: false, density: "row" },
  },
);

export interface ListCardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof listCardStyles> {
  asButton?: boolean;
}

export const ListCard = forwardRef<HTMLDivElement, ListCardProps>(function ListCard(
  { className, interactive, density, asButton, role, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={asButton ? "button" : role}
      tabIndex={asButton || interactive ? 0 : undefined}
      className={cn(listCardStyles({ interactive: interactive ?? asButton, density }), className)}
      {...props}
    />
  );
});
