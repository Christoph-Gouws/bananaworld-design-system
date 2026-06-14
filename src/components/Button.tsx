"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

/**
 * Button — UX-DS-003.
 *
 * Variants: primary | secondary | tertiary | destructive (per UX-DS-003).
 * Surfaces: browser (36px tap target) | tablet (56px tap target). Surface comes
 * from data-surface attribute on a parent layout root; no prop drilling needed.
 *
 * Disabled state always carries a tooltip per UX-DS-003 — consumer responsibility.
 *
 * The `asChild` prop (Radix Slot pattern) lets consumers render the button as
 * a Link or any other element while keeping all the styling.
 */
const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "rounded-md select-none",
    "transition-[background-color,color,box-shadow,border-color,opacity]",
    "duration-fast ease-out",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // browser sizing
    "h-9 px-3 text-sm",
    // tablet sizing — overrides via data-surface attribute selector
    "[[data-surface=tablet]_&]:h-14 [[data-surface=tablet]_&]:px-5 [[data-surface=tablet]_&]:text-base",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-fg-on-accent shadow-xs",
          "hover:bg-accent-hover",
          "active:bg-accent-hover",
        ],
        secondary: [
          "bg-surface text-fg border border-border shadow-xs",
          "hover:bg-surface-muted hover:border-border-strong",
          "active:bg-surface-sunken",
        ],
        tertiary: ["bg-transparent text-fg", "hover:bg-surface-muted", "active:bg-surface-sunken"],
        destructive: [
          "bg-surface text-danger border border-danger/30 shadow-xs",
          "hover:bg-danger-subtle hover:border-danger/60",
          "active:bg-danger-subtle",
        ],
      },
      size: {
        sm: "h-8 px-2.5 text-xs [[data-surface=tablet]_&]:h-11 [[data-surface=tablet]_&]:px-4",
        md: "",
        lg: "h-10 px-4 text-base [[data-surface=tablet]_&]:h-16 [[data-surface=tablet]_&]:px-6",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  asChild?: boolean;
  inflight?: boolean; // UX-DS-021 — disable + show progress feedback
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    block,
    asChild = false,
    inflight = false,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        buttonStyles({ variant, size, block }),
        inflight && "cursor-progress",
        className,
      )}
      disabled={disabled ?? inflight}
      data-inflight={inflight || undefined}
      aria-busy={inflight || undefined}
      {...props}
    >
      {children}
    </Comp>
  );
});
