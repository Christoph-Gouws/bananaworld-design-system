"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

/**
 * Input — UX-DS-004. Browser 36px / Tablet 56px with chunky borders + on-focus
 * halo per the modern-SaaS aesthetic. Numeric inputs use NumericInput which
 * surfaces the OS numeric keypad on tablet.
 */
const inputStyles = cva(
  [
    "block w-full bg-surface text-fg placeholder:text-fg-subtle",
    "border border-border rounded-md",
    "shadow-xs transition-[border-color,box-shadow]",
    "duration-fast ease-out",
    "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
    // browser sizing
    "h-9 px-3 text-sm",
    // tablet sizing
    "[[data-surface=tablet]_&]:h-14 [[data-surface=tablet]_&]:px-4 [[data-surface=tablet]_&]:text-base [[data-surface=tablet]_&]:border-[1.5px]",
  ],
  {
    variants: {
      invalid: {
        true: "border-danger focus-visible:border-danger",
        false: "",
      },
    },
    defaultVariants: { invalid: false },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputStyles> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(inputStyles({ invalid }), "tabular-nums", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});
