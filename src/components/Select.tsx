"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib";

/**
 * Select — UX-DS-004. Built on Radix Select for keyboard + screen-reader correctness.
 *
 * Usage:
 *   <Select value={x} onValueChange={setX}>
 *     <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Active</SelectItem>
 *       <SelectItem value="b">Inactive</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Master pickers compose this with masters.filterActiveForPicker() from M005.
 */
export const Select = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof RadixSelect.Trigger>,
  ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <RadixSelect.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-between gap-2 w-full min-w-0",
        // The selected value never wraps to a second line — it truncates with an ellipsis instead
        // (the value is Radix's span child; the chevron is a sibling svg). Keeps dense line-table
        // cells neat (EPIC-009-M002).
        "[&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left",
        "bg-surface text-fg border border-border rounded-md shadow-xs",
        "h-9 px-3 text-sm",
        "[[data-surface=tablet]_&]:h-14 [[data-surface=tablet]_&]:px-4 [[data-surface=tablet]_&]:text-base [[data-surface=tablet]_&]:border-[1.5px]",
        "transition-[border-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus",
        "data-[placeholder]:text-fg-subtle",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown className="h-4 w-4 text-fg-muted [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
});

export const SelectContent = forwardRef<
  ElementRef<typeof RadixSelect.Content>,
  ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(function SelectContent({ className, children, position = "popper", ...props }, ref) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        ref={ref}
        position={position}
        className={cn(
          "z-[var(--z-dropdown)] overflow-hidden",
          "bg-surface border border-border rounded-md shadow-lg",
          "min-w-[var(--radix-select-trigger-width)]",
          "animate-fade-in",
          className,
        )}
        {...props}
      >
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
});

export const SelectItem = forwardRef<
  ElementRef<typeof RadixSelect.Item>,
  ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        "relative flex items-center gap-2 select-none cursor-pointer",
        "px-2 py-1.5 text-sm rounded-sm",
        "[[data-surface=tablet]_&]:px-3 [[data-surface=tablet]_&]:py-3 [[data-surface=tablet]_&]:text-base",
        "data-[highlighted]:bg-surface-muted data-[highlighted]:outline-none",
        "data-[state=checked]:font-medium",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <RadixSelect.ItemIndicator className="absolute right-2">
        <Check className="h-4 w-4 text-accent" />
      </RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});

export const SelectSeparator = forwardRef<
  ElementRef<typeof RadixSelect.Separator>,
  ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <RadixSelect.Separator ref={ref} className={cn("h-px my-1 bg-border", className)} {...props} />
  );
});
