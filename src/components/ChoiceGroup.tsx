"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { cn } from "../lib";

/**
 * ChoiceGroup — pick exactly one option from a short, known set, shown as selectable chips.
 *
 * Use it when the options are few enough to be worth seeing at once, and the choice is a
 * judgement rather than a lookup. When the list is long enough that scanning it is slow, reach
 * for Combobox; when it is long but scanned rarely, reach for Select.
 *
 * Built on Radix RadioGroup, so it behaves like one control: a single tab stop, arrow keys move
 * between options, and a screen reader announces it as a radio group. A hand-rolled group of
 * <button aria-pressed> looks the same and does none of that.
 *
 * Surfaces: browser (32px chips) | tablet (48px minimum, UX-PRINCIPLE-006 gloved hand). As
 * everywhere in this package, the surface comes from the data-surface attribute on a parent
 * layout root — never a prop.
 *
 * Always pair with a Label: pass `aria-labelledby` pointing at it, or `aria-label` when the
 * group has no visible label.
 */

export interface ChoiceOption {
  readonly id: string;
  readonly name: string;
  readonly disabled?: boolean;
}

export interface ChoiceGroupProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>,
  "children"
> {
  readonly options: readonly ChoiceOption[];
  /** Shown in place of the chips when there is nothing to choose from. */
  readonly emptyLabel?: string;
}

export const ChoiceGroup = forwardRef<ElementRef<typeof RadixRadioGroup.Root>, ChoiceGroupProps>(
  function ChoiceGroup({ className, options, emptyLabel = "None configured.", ...props }, ref) {
    return (
      <RadixRadioGroup.Root
        ref={ref}
        className={cn("flex flex-wrap items-center gap-2", className)}
        {...props}
      >
        {options.length === 0 ? (
          <span className="text-sm text-fg-subtle [[data-surface=tablet]_&]:text-base">
            {emptyLabel}
          </span>
        ) : (
          options.map((option) => (
            <RadixRadioGroup.Item
              key={option.id}
              value={option.id}
              disabled={option.disabled}
              className={cn(
                "inline-flex select-none items-center justify-center whitespace-nowrap",
                "rounded-md border font-medium",
                "transition-[background-color,border-color,color] duration-fast ease-out",
                "focus-visible:outline-none focus-visible:shadow-focus",
                // browser sizing
                "h-8 px-3 text-sm",
                // tablet sizing — min-h so a long option name may wrap without clipping
                "[[data-surface=tablet]_&]:min-h-12 [[data-surface=tablet]_&]:px-4 [[data-surface=tablet]_&]:text-base",
                // unselected
                "border-border-strong bg-surface text-fg-muted",
                "hover:bg-surface-muted",
                // selected — the chip's own fill is the indicator; there is no separate dot
                "data-[state=checked]:border-accent data-[state=checked]:bg-accent-subtle",
                "data-[state=checked]:font-semibold data-[state=checked]:text-fg",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface",
              )}
            >
              {option.name}
            </RadixRadioGroup.Item>
          ))
        )}
      </RadixRadioGroup.Root>
    );
  },
);
