"use client";

// MultiSelectAllTicked — "Select all" ticks every option, so the reader can untick what they do not want
// (CR-DESIGN-SYSTEM-013, owner's layout B, 2026-10-06).
//
// ============================================================================
// 🔴 ONE STATE MACHINE, RENDERED BY BOTH SURFACES
// ============================================================================
// Excel's list: while nothing is narrowed every option shows ticked, unticking one hides JUST that one
// ("everything except"), "Select all" re-ticks everything, and unticking it clears every tick so the
// reader can tick the few they want. Every transition is `multiSelectAllTickedToggle`, in ONE place,
// and both the grid's filter cell and the toolbar render `MultiSelectAllTickedList` — so the two
// surfaces cannot tick, count or word this mode differently.
//
// THE STATE MACHINE IS `multi-select-reading.ts` (pure); this file is its React half — the open-menu
// draft and the list both surfaces render.
//
// ⚠ OPT-IN, AND ITS OWN MODULE. A surface reaches this only by asking for `selectAll: "allTicked"`.
//   The shared parts it is built from (`MultiSelectItem`, the include-list arithmetic) live in
//   `MultiSelectMenu.tsx` and are imported, not copied; `MultiSelectAllRow` there is untouched, which
//   is what keeps every shipped `"master"` caller's bytes.
//
// ⚠ INTERNAL, NOT BARRELLED — like `MultiSelectMenu`. What a consumer sees is the `selectAll` word on
//   its def and the value shapes in `lib/grid-view.ts` / `lib/table-controls.ts`.

import { useState, type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Minus } from "lucide-react";

import { cn } from "../lib";
import {
  EVERYTHING,
  NOTHING_TICKED,
  multiSelectAllTickedFooter,
  multiSelectAllTickedToggle,
  multiSelectEveryRowState,
  multiSelectTicked,
  type MultiSelectCommitted,
  type MultiSelectReading,
} from "./multi-select-reading";
import {
  ITEM_ICON,
  ITEM_SIZE,
  MultiSelectItem,
  type MultiSelectItemSize,
  type MultiSelectOption,
} from "./MultiSelectMenu";

/**
 * The open menu's state for one `allTicked` surface: the committed reading, plus the "none" draft.
 *
 * 🔴 THE DRAFT LIVES HERE AND DIES WITH THE MENU. Unticking every box commits "all" and remembers,
 *    locally, that the boxes are clear; closing the menu forgets it, so reopening shows every box
 *    ticked — which is what the table is showing. The draft is honoured only while the committed value
 *    is still "all", so a parent that resets the filter underneath it is never masked.
 */
export function useMultiSelectAllTicked(
  committed: MultiSelectCommitted,
  commit: (next: MultiSelectCommitted) => void,
): {
  readonly reading: MultiSelectReading;
  readonly apply: (next: MultiSelectReading) => void;
  readonly onOpenChange: (open: boolean) => void;
} {
  const [draftNone, setDraftNone] = useState(false);
  return {
    reading: draftNone && committed.mode === "all" ? NOTHING_TICKED : committed,
    apply: (next) => {
      setDraftNone(next.mode === "none");
      commit(next.mode === "none" ? EVERYTHING : next);
    },
    onOpenChange: (open) => {
      if (!open) setDraftNone(false);
    },
  };
}

/**
 * The master row for the `allTicked` mode (CR-DESIGN-SYSTEM-013 §4.3).
 *
 * 🔴 IT STILL CANNOT NARROW. Its two gestures are `onTickEvery` (which can only clear the filter) and
 *    `onUntickEvery` (which can only enter the uncommitted draft) — neither can commit an id list, so
 *    CR-DESIGN-SYSTEM-010 F2 stays unreachable. It branches on ITS OWN state, never on the boolean
 *    Radix hands over: ticked → untick every; a dash or clear → tick every.
 *
 * A SEPARATE PART FROM `MultiSelectAllRow`, which is not touched: that row's meaning ("the tick means
 * nothing is hidden") is what every shipped `"master"` caller renders, and an open-menu row cannot be
 * reached by the static byte-identity harness, so leaving it byte-for-byte alone is the proof.
 */
export function MultiSelectEveryRow({
  state,
  count,
  onTickEvery,
  onUntickEvery,
  size = "default",
  label = "Select all",
}: {
  readonly state: boolean | "indeterminate";
  readonly count: string;
  readonly onTickEvery: () => void;
  readonly onUntickEvery: () => void;
  readonly size?: MultiSelectItemSize;
  readonly label?: string;
}): ReactElement {
  return (
    <DropdownMenu.CheckboxItem
      checked={state}
      onCheckedChange={() => {
        if (state === true) onUntickEvery();
        else onTickEvery();
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

/**
 * The whole open list for the `allTicked` mode — master row, options, footer — which BOTH surfaces
 * render inside their own `DropdownMenu.Content`. One list, so the grid and the toolbar cannot tick,
 * count or word it differently.
 */
export function MultiSelectAllTickedList({
  options,
  reading,
  onApply,
  size = "default",
}: {
  readonly options: readonly MultiSelectOption[];
  readonly reading: MultiSelectReading;
  readonly onApply: (next: MultiSelectReading) => void;
  readonly size?: MultiSelectItemSize;
}): ReactElement {
  const { state, count } = multiSelectEveryRowState(options, reading);
  return (
    <>
      <MultiSelectEveryRow
        size={size}
        state={state}
        count={count}
        onTickEvery={() => onApply(EVERYTHING)}
        onUntickEvery={() => onApply(NOTHING_TICKED)}
      />
      <DropdownMenu.Separator className="my-1 h-px bg-border" />
      {options.map((opt) => (
        <MultiSelectItem
          key={opt.value}
          size={size}
          checked={multiSelectTicked(reading, opt.value)}
          onToggle={(checked) =>
            onApply(multiSelectAllTickedToggle(options, reading, opt.value, checked))
          }
          label={opt.label}
        />
      ))}
      <DropdownMenu.Separator className="my-1 h-px bg-border" />
      <DropdownMenu.Label className="flex items-start justify-between gap-2 px-2 py-1 text-2xs text-fg-subtle">
        <span className="min-w-0 break-words">{multiSelectAllTickedFooter(options, reading)}</span>
        <span className="shrink-0 rounded border border-border px-1 font-mono">Esc</span>
      </DropdownMenu.Label>
    </>
  );
}
