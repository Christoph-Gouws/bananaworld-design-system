"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../lib";

export const Checkbox = forwardRef<
  ElementRef<typeof RadixCheckbox.Root>,
  ComponentPropsWithoutRef<typeof RadixCheckbox.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <RadixCheckbox.Root
      ref={ref}
      className={cn(
        "peer shrink-0 inline-flex items-center justify-center",
        "h-4 w-4 rounded-sm border border-border-strong bg-surface",
        "[[data-surface=tablet]_&]:h-6 [[data-surface=tablet]_&]:w-6",
        "transition-[background-color,border-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:shadow-focus",
        "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-fg-on-accent">
        <Check
          className="h-3 w-3 [[data-surface=tablet]_&]:h-4 [[data-surface=tablet]_&]:w-4"
          strokeWidth={3}
        />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
});
