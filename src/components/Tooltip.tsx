"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../lib";

export const TooltipProvider = RadixTooltip.Provider;
export const Tooltip = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

export const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-[var(--z-tooltip)] px-2 py-1 rounded-md text-xs",
          "bg-fg text-bg shadow-md",
          "animate-fade-in",
          className,
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  );
});
