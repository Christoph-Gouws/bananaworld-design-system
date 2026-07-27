"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
} from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
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

// Radix renders these only when there is actually more content in that direction, so they double as
// the "there is more" signal — a better one than a scrollbar on a touch screen. Not exported: it is
// an implementation detail of SelectContent, and keeping it internal means zero API change.
function ScrollButton({ direction }: { readonly direction: "up" | "down" }): ReactElement {
  const Chevron = direction === "up" ? ChevronUp : ChevronDown;
  const Button = direction === "up" ? RadixSelect.ScrollUpButton : RadixSelect.ScrollDownButton;
  return (
    <Button className="flex h-6 shrink-0 cursor-default items-center justify-center bg-surface text-fg-muted [[data-surface=tablet]_&]:h-9">
      <Chevron className="h-4 w-4 [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5" />
    </Button>
  );
}

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
          // THIS LINE is what makes a long list scrollable at all. Radix's popper publishes the
          // room available as a CSS variable and deliberately does not apply it, leaving that to
          // the consumer — and nothing here was reading it, so the content rendered at its full
          // natural height. With no height cap the viewport's scrollHeight equals its clientHeight,
          // and a box with no overflow has nothing to scroll; `overflow-hidden` above then quietly
          // clipped the remainder, so a long list simply looked like it ended (CR-DC-008 AC-5).
          // The Viewport's own `flex: 1` + `overflow: hidden auto` were already correct and already
          // live — Radix sets `display:flex; flex-direction:column` on this element inline itself.
          "max-h-[var(--radix-select-content-available-height)]",
          "bg-surface border border-border rounded-md shadow-lg",
          "min-w-[var(--radix-select-trigger-width)]",
          "animate-fade-in",
          className,
        )}
        {...props}
      >
        {/* Radix hides the viewport's native scrollbar outright and expects these buttons to be the
            affordance instead. Rendering neither is why a too-long list simply looked like it ended.
            Kept INTERNAL to SelectContent: no export-surface change, so all 40 DC call sites and the
            CRM/RMS consumers inherit this without being edited (CR-DC-008 AC-4). */}
        <ScrollButton direction="up" />
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
        <ScrollButton direction="down" />
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
