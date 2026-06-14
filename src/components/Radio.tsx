"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { cn } from "../lib";

export const RadioGroup = forwardRef<
  ElementRef<typeof RadixRadioGroup.Root>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return <RadixRadioGroup.Root ref={ref} className={cn("grid gap-2", className)} {...props} />;
});

export const Radio = forwardRef<
  ElementRef<typeof RadixRadioGroup.Item>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(function Radio({ className, ...props }, ref) {
  return (
    <RadixRadioGroup.Item
      ref={ref}
      className={cn(
        "aspect-square inline-flex items-center justify-center",
        "h-4 w-4 rounded-full border border-border-strong bg-surface",
        "[[data-surface=tablet]_&]:h-6 [[data-surface=tablet]_&]:w-6",
        "transition-[border-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:shadow-focus",
        "data-[state=checked]:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixRadioGroup.Indicator className="block h-2 w-2 rounded-full bg-accent [[data-surface=tablet]_&]:h-3 [[data-surface=tablet]_&]:w-3" />
    </RadixRadioGroup.Item>
  );
});
