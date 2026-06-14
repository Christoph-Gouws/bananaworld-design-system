"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

const textareaStyles = cva(
  [
    "block w-full bg-surface text-fg placeholder:text-fg-subtle",
    "border border-border rounded-md",
    "shadow-xs transition-[border-color,box-shadow]",
    "duration-fast ease-out resize-y",
    "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
    "min-h-[88px] px-3 py-2 text-sm",
    "[[data-surface=tablet]_&]:min-h-[120px] [[data-surface=tablet]_&]:px-4 [[data-surface=tablet]_&]:py-3 [[data-surface=tablet]_&]:text-base [[data-surface=tablet]_&]:border-[1.5px]",
  ],
  {
    variants: {
      invalid: { true: "border-danger focus-visible:border-danger", false: "" },
    },
    defaultVariants: { invalid: false },
  },
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaStyles> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(textareaStyles({ invalid }), className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});
