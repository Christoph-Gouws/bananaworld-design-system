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
// ============================================================================
// 🔴 AND THE VALUE ARITHMETIC LIVES HERE TOO (CR-DESIGN-SYSTEM-010)
// ============================================================================
// CR-DESIGN-SYSTEM-009 moved the PRESENTATION here and left the value arithmetic — which stored ids
// count as chosen, what labels they produce, what a tick commits — duplicated at each call site. The
// two copies promptly disagreed: the toolbar preserved a stored id its option list no longer offered
// and the grid silently dropped it, so the same filter state read "Cold room 1 +1 / 2 chosen" in one
// surface and "Cold room 1 / 1 chosen" in the other (F1). `multiSelectChosenLabels` and
// `multiSelectToggle` below are that arithmetic, in ONE place, and both surfaces call them.
//
// ⚠ THE COUNT IS ALWAYS `values.length`, NEVER `options.filter(...).length`. A stored value the
//   options no longer offer is still narrowing the query, so a control that does not count it is
//   under-reporting a filter the reader cannot see and cannot clear.
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

/**
 * The option shape both surfaces reduce to — `{ value, label }`.
 *
 * The toolbar's `SelectOption` (`lib/table-controls.ts`) is structurally this already and needs no
 * conversion; the grid's `GridFilterOption` is `{ id, label }` and maps to it at its call site. One
 * shape here is what lets one arithmetic serve both, which is the whole point of the extraction.
 */
export interface MultiSelectOption {
  readonly value: string;
  readonly label: string;
}

/**
 * The chosen values as LABELS, in displayed-option order — what `multiSelectTriggerLabel` reads.
 *
 * ⚠ A VALUE THE DATA NO LONGER OFFERS KEEPS ITS RAW ID rather than vanishing. Options are derived
 *   from the rows (`deriveSelectOptions`) or from a column's own list, so a reload can drop one out
 *   from under a stored value; dropping it here too would silently reduce the "+N" the reader is
 *   reading against ticks they can still see in the menu. One entry per stored value, always.
 *
 * MOVED VERBATIM from `DataTableToolbar`'s `chosenLabelsInOptionOrder` (CR-DESIGN-SYSTEM-010 F1) —
 * same body, same output, now with a second caller instead of a second copy.
 */
export function multiSelectChosenLabels(
  options: readonly MultiSelectOption[],
  values: readonly string[],
): readonly string[] {
  const known = options.filter((opt) => values.includes(opt.value));
  const unknown = values.filter((v) => options.some((opt) => opt.value === v) === false);
  return [...known.map((opt) => opt.label), ...unknown];
}

/**
 * What one tick commits: the known ids in DISPLAYED order, then the stored ids the options no longer
 * offer, in their stored order.
 *
 * 🔴 A VALUE THE LIST CANNOT SHOW IS NOT A VALUE THE READER DELETED. Both surfaces used to re-derive
 *    the whole list from `options.filter(...)` on every tick, so ticking any third room silently
 *    dropped a stored id the options had stopped offering — the filter narrowed differently and the
 *    result set moved with no indication (CR-DESIGN-SYSTEM-010 F1). Preserving them is the reason
 *    this is a function rather than a one-liner at each call site.
 *
 * Displayed order for the known ids is still what the wire encoding and `gridFilterSelect` state, so
 * the trigger reads the same whichever way round the reader ticked them.
 */
export function multiSelectToggle(
  options: readonly MultiSelectOption[],
  values: readonly string[],
  value: string,
  checked: boolean,
): readonly string[] {
  const next = checked ? [...values, value] : values.filter((v) => v !== value);
  const known = options.filter((opt) => next.includes(opt.value)).map((opt) => opt.value);
  const unknown = next.filter((v) => options.some((opt) => opt.value === v) === false);
  return [...known, ...unknown];
}

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
 * The tri-state master row — the owner's option C (2026-09-09), corrected to option **A**
 * (2026-09-10, CR-DESIGN-SYSTEM-010 F2).
 *
 * 🔴 THE TICK MEANS "NOTHING IS BEING HIDDEN", NOT "EVERY BOX IS TICKED". Ticked whenever the filter
 *    is not narrowing — which is what `chosen === 0` IS — a dash while only some are chosen, and
 *    ticked again when the reader has ticked every one by hand. The count at the right edge is what
 *    tells the two ticked states apart: `All 3` versus `3 of 3`.
 *
 * 🔴 AND IT CANNOT NARROW. Its one gesture is `onShowEverything` — there is no boolean to branch on
 *    and no id list reaching it, so the defect it replaces is UNREACHABLE rather than fixed. What
 *    shipped took `(all: boolean) => void`, and both call sites read `all === true` as "commit every
 *    option id", which excludes every row whose value is blank (`matchesFilter`'s multiSelect arm
 *    requires `actual !== null`) and lights "Clear" — on a gesture the reader made to see MORE. The
 *    same argument `useCellLayout` makes about conditional hooks in `Table.tsx`: make the wrong
 *    answer unwritable rather than commented against.
 *
 * ⚠ TICKING EVERY OPTION BY HAND IS STILL NOT "EVERYTHING", and that is deliberate. It is a request
 *   for N named values, so a row with no value recorded is correctly left out. `3 of 3` is what says
 *   so on screen; the engine (`table-controls.ts`) is right and is not touched.
 *
 * 🔴 RADIX'S OWN `checked="indeterminate"`, NOT A HAND-DRAWN DASH. It emits `aria-checked="mixed"`,
 *    which is the correct reading of "some but not all" and is precisely what a hand-rolled dash
 *    would not give — the same reason this whole menu is a Radix primitive.
 */
export function MultiSelectAllRow({
  chosen,
  total,
  onShowEverything,
  size = "default",
  label = "Select all",
}: {
  readonly chosen: number;
  readonly total: number;
  /**
   * Stop narrowing — clear the filter. Radix hands the next checked state and **every one of the
   * three starting points means the same thing here**, so the boolean is deliberately not passed on:
   * a boolean the call site has to interpret is exactly how F2 got in.
   */
  readonly onShowEverything: () => void;
  readonly size?: MultiSelectItemSize;
  readonly label?: string;
}): ReactElement {
  // Not narrowed (nothing chosen) reads TICKED — that is option A. A dash only while the reader is
  // part way through; ticked again once they have named every option.
  const state: boolean | "indeterminate" =
    chosen === 0 ? true : chosen >= total ? true : "indeterminate";
  // `All 3` for "nothing is hidden", `3 of 3` for "you named all three" — one glyph, two meanings,
  // and this is the only thing that separates them.
  const count = chosen === 0 ? `All ${String(total)}` : `${String(chosen)} of ${String(total)}`;
  return (
    <DropdownMenu.CheckboxItem
      checked={state}
      // The next state Radix hands over is DISCARDED on purpose — see `onShowEverything`.
      onCheckedChange={() => {
        onShowEverything();
      }}
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
      <span className="ml-2 shrink-0 font-normal tabular-nums text-fg-subtle">{count}</span>
    </DropdownMenu.CheckboxItem>
  );
}
