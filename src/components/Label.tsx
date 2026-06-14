"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixLabel from "@radix-ui/react-label";
import { cn } from "../lib";

/**
 * Label — programmatic label per UX-A11Y-003. Always associate with `htmlFor`.
 *
 * Wraps Radix Label for keyboard activation parity. Use alongside every Input,
 * Textarea, Select, Checkbox, Radio — never ship a form field without one.
 */
export const Label = forwardRef<
  ElementRef<typeof RadixLabel.Root>,
  ComponentPropsWithoutRef<typeof RadixLabel.Root>
>(function Label({ className, ...props }, ref) {
  return (
    <RadixLabel.Root
      ref={ref}
      className={cn(
        "block text-[13px] font-medium text-fg-muted",
        "[[data-surface=tablet]_&]:text-base",
        className,
      )}
      {...props}
    />
  );
});
