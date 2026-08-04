"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { cn } from "../lib";
import { ColourSwatch } from "./ColourSwatch";

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
 *
 * An option may optionally carry a `swatch` (a colour block) and a `description` (a fuller name).
 * Both are opt-in per option: omit them and the chip is exactly what it always was — no extra
 * element, no extra attribute. See `ChoiceOption` for the two contracts they come with.
 */

export interface ChoiceOption {
  readonly id: string;
  readonly name: string;
  readonly disabled?: boolean;
  /**
   * Optional colour block rendered inside the chip, before the name — for a set whose members ARE
   * a colour (a banana colour stage, a status hue). Rendered as a stripe running the full height of
   * the chip, flush against its left edge, so a row of chips reads as colour-coded from across a
   * room (owner-approved treatment, CR-DESIGN-SYSTEM-001 option B).
   *
   * The colour is caller data, never a constant here (TECH-COMP-003): this package owns no colour
   * stage, code or hex. When `accentHex` is also given the block blends the two, exactly as
   * `ColourSwatch` does everywhere else; `null` and `""` both mean "no accent", which is the shape
   * nullable master data produces.
   */
  readonly swatch?: { readonly hex: string; readonly accentHex?: string | null };
  /**
   * The fuller name, used as the chip's tooltip AND its accessible name — for a set whose chips are
   * abbreviated to fit ("CS3" for "CS3 · Green with trace of yellow"). Omit it and the chip is named
   * by its own text, exactly as before.
   *
   * TWO CONTRACTS, both easy to get wrong:
   *
   * 1. `aria-label` REPLACES the accessible name, it does not extend it. So `description` must be a
   *    SUPERSET of the visible text, never a replacement for it — otherwise the code the operator
   *    can see ("CS3") is never spoken, and sighted-plus-screen-reader users lose the label they are
   *    looking straight at. Include the short text in the string.
   * 2. Native `title` gives no tooltip on a touchscreen — it only fires on hover. On the tablet
   *    surface the long name is carried by the ACCESSIBLE name alone. (Wrapping each chip in the
   *    package's Radix `Tooltip` would fix that, but it adds a wrapper element and a
   *    `TooltipProvider` requirement to every existing caller's DOM — rejected for that reason.)
   */
  readonly description?: string;
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
              // Both are `undefined` unless the caller supplied a description, and React omits an
              // attribute whose value is `undefined` — so no `title=""` and no `aria-label=""`
              // appear where nothing appeared before. That is the byte-identical guarantee, and the
              // suite asserts the attributes are ABSENT rather than empty.
              title={option.description}
              aria-label={option.description}
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
                // Swatch chips only: the stripe sits flush against the left edge, so the chip drops
                // its left padding and clips the stripe's corners to its own radius. Appended only
                // when there IS a swatch, so a chip without one keeps a byte-identical class list.
                option.swatch !== undefined &&
                  "overflow-hidden pl-0 [[data-surface=tablet]_&]:pl-0",
              )}
            >
              {option.swatch !== undefined && (
                // Sized HERE, not in ColourSwatch: only this component knows the 32px browser chip
                // and 48px tablet chip the stripe has to sit inside. `h-auto self-stretch` is what
                // makes it full-height; `w-[7px]` / `w-2.5` (10px) are the reviewed stripe widths.
                // ColourSwatch is already `aria-hidden`, so the chip's accessible name stays the
                // text (or `description`) and never becomes "image".
                <ColourSwatch
                  hex={option.swatch.hex}
                  accentHex={option.swatch.accentHex}
                  className="mr-2.5 h-auto w-[7px] self-stretch rounded-none border-0 [[data-surface=tablet]_&]:mr-3.5 [[data-surface=tablet]_&]:w-2.5"
                />
              )}
              {option.name}
            </RadixRadioGroup.Item>
          ))
        )}
      </RadixRadioGroup.Root>
    );
  },
);
