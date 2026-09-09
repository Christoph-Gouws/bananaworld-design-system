"use client";

// MultiSelectMenu — the parts a tick-list is made of, in ONE place (CR-DESIGN-SYSTEM-009 §A.5).
//
// ============================================================================
// 🔴 THERE IS ONE MULTI-SELECT IN THIS PRODUCT, NOT TWO THAT LOOK ALIKE
// ============================================================================
// `DataTableToolbar` has shipped a tick-list since CR-DESIGN-SYSTEM-003; the grid's filter row needs
// the same thing under a column header. Two menus that look or count differently is the defect, not
// the feature — so the item, the trigger arithmetic and the master row were MOVED here rather than
// copied, and both surfaces render these. A wording change lands in both by construction.
//
// ⚠ INTERNAL, NOT BARRELLED. Like `cn`, these are how the shipped controls are built, not a control a
//   consumer composes for itself. Nothing here is added to `components/index.ts`, so no export moves.
//
// PURE UI (TECH-COMP-003): Radix `DropdownMenu` primitives and class strings, nothing else. Hand-
// rolling any of it would throw away the keyboard, the focus return, the typeahead and the
// `menuitemcheckbox` roles that are the entire reason the primitive exists.

import { type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Minus } from "lucide-react";

import { cn } from "../lib";

/**
 * How big a tick reads. "default" is the toolbar's own size and emits its exact class string,
 * including the `data-surface=tablet` variants; "compact" is the grid filter cell's denser browser
 * menu, which has always been `text-xs`.
 */
export type MultiSelectItemSize = "default" | "compact";

// ONE COMPLETE STRING PER SIZE, never a base plus an override — twMerge keeps the last of two
// conflicting classes, so a second padding or type class emitted anywhere is a silent override. The
// "default" entry is verbatim what `DataTableToolbar` shipped, in its original order, which is what
// makes its DOM snapshot's byte-identity provable rather than argued.
const ITEM_SIZE: Record<MultiSelectItemSize, string> = {
  default:
    "py-1.5 pl-7 pr-2 text-sm outline-none [[data-surface=tablet]_&]:py-3 [[data-surface=tablet]_&]:pl-9 [[data-surface=tablet]_&]:text-base",
  compact: "py-1 pl-7 pr-2 text-xs outline-none",
};

const ITEM_ICON: Record<MultiSelectItemSize, string> = {
  default: "h-4 w-4",
  compact: "h-3 w-3",
};

/**
 * The closed trigger's wording, layout A (owner-approved 2026-08-14): the first chosen value by name,
 * then how many more. "Cape Town +2" — it names something real, stays on one line, and truncates
 * predictably in a narrow toolbar or a narrow column. Nothing chosen reads whatever the surface calls
 * its empty state ("All depots", "All rooms").
 *
 * ⚠ THE LABELS ARRIVE IN DISPLAYED-OPTION ORDER, not in tick order, so the trigger reads the same
 *   whichever way round the reader ticked them.
 */
export function multiSelectTriggerLabel(
  emptyText: string,
  chosenLabels: readonly string[],
): { readonly text: string; readonly more: number } {
  const first = chosenLabels[0];
  if (first === undefined) return { text: emptyText, more: 0 };
  return { text: first, more: chosenLabels.length - 1 };
}

export function MultiSelectItem({
  checked,
  onToggle,
  label,
  size = "default",
}: {
  readonly checked: boolean;
  readonly onToggle: (checked: boolean) => void;
  readonly label: string;
  readonly size?: MultiSelectItemSize;
}): ReactElement {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onToggle}
      // 🔴 THE ONE RADIX GOTCHA. A DropdownMenu closes on select by default; preventing it is what keeps
      // the menu open across several ticks. Without this line the rep re-opens the menu for every value,
      // which defeats the entire change.
      onSelect={(e) => e.preventDefault()}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm",
        ITEM_SIZE[size],
        "data-[highlighted]:bg-surface-muted",
        "data-[state=checked]:font-medium",
      )}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2">
        <Check className={cn(ITEM_ICON[size], "text-accent")} />
      </DropdownMenu.ItemIndicator>
      {label}
    </DropdownMenu.CheckboxItem>
  );
}

/**
 * The tri-state master row — the owner's option C, picked 2026-09-09 over the plain "All …" item.
 *
 * Unticked ⇒ nothing chosen; ticked ⇒ everything; **a dash while only some are** — and it carries
 * "3 of 12" at its right edge, so the count the reader wants sits in the list rather than only in the
 * closed box. Tapping it once takes everything, again clears.
 *
 * 🔴 RADIX'S OWN `checked="indeterminate"`, NOT A HAND-DRAWN DASH. It emits `aria-checked="mixed"`,
 *    which is the correct reading of "some but not all" and is precisely what a hand-rolled dash
 *    would not give — the same reason this whole menu is a Radix primitive.
 */
export function MultiSelectAllRow({
  chosen,
  total,
  onToggle,
  size = "default",
  label = "Select all",
}: {
  readonly chosen: number;
  readonly total: number;
  /** `true` = take everything, `false` = clear. Radix hands the next state, and it is the right one
   * from all three starting points: unticked and mixed both go to "everything", ticked clears. */
  readonly onToggle: (all: boolean) => void;
  readonly size?: MultiSelectItemSize;
  readonly label?: string;
}): ReactElement {
  const state: boolean | "indeterminate" =
    chosen === 0 ? false : chosen >= total ? true : "indeterminate";
  return (
    <DropdownMenu.CheckboxItem
      checked={state}
      onCheckedChange={onToggle}
      onSelect={(e) => e.preventDefault()}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm",
        ITEM_SIZE[size],
        "data-[highlighted]:bg-surface-muted",
        "font-medium",
      )}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2">
        {state === "indeterminate" ? (
          <Minus className={cn(ITEM_ICON[size], "text-accent")} />
        ) : (
          <Check className={cn(ITEM_ICON[size], "text-accent")} />
        )}
      </DropdownMenu.ItemIndicator>
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span className="ml-2 shrink-0 font-normal tabular-nums text-fg-subtle">
        {`${String(chosen)} of ${String(total)}`}
      </span>
    </DropdownMenu.CheckboxItem>
  );
}
