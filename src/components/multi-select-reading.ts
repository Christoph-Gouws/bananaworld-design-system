// The `allTicked` tick-list's state machine, as pure functions (CR-DESIGN-SYSTEM-013, owner's layout B).
//
// PURE: no JSX, no DOM, no hooks — the same split this package already makes between
// `lib/grid-view.ts` and `GridFilterRow.tsx`. `MultiSelectAllTicked.tsx` is the React half: the open-menu
// draft and the one list both surfaces render. Every transition, every count and every word of this
// mode is decided HERE, once, so the grid's cell and the toolbar cannot drift.
//
// ⚠ INTERNAL, NOT BARRELLED. It is built on `MultiSelectMenu`'s include-list arithmetic, imported
//   rather than copied, so a stored id the options no longer offer is kept here exactly as it is there.

import {
  multiSelectChosenLabels,
  multiSelectToggle,
  multiSelectTriggerLabel,
  type MultiSelectOption,
} from "./MultiSelectMenu";

/**
 * What an `allTicked` tick-list is showing.
 *
 * - "all"    — not narrowed. Every box ticked. Stored as no value at all, exactly as today.
 * - "only"   — the reader started from nothing and ticked these. Stored as today's include list.
 * - "except" — the reader started from everything and unticked these. Stored as `excluded`.
 * - "none"   — every box unticked. 🔴 A DRAFT HELD INSIDE THE OPEN MENU, NEVER COMMITTED: the filter
 *              meanwhile reads "all", because no consumer's query can express "show nothing" and an
 *              empty report the reader did not ask for is the silent failure (plan §1, owner point 3).
 */
export type MultiSelectReading =
  | { readonly mode: "all" }
  | { readonly mode: "only"; readonly values: readonly string[] }
  | { readonly mode: "except"; readonly excluded: readonly string[] }
  | { readonly mode: "none" };

/** The readings a surface may COMMIT — every one but the draft. */
export type MultiSelectCommitted = Exclude<MultiSelectReading, { readonly mode: "none" }>;

/** Not narrowed — what "Select all" commits. */
export const EVERYTHING: MultiSelectCommitted = { mode: "all" };
/** Every box clear — the draft "Select all" enters when unticked. */
export const NOTHING_TICKED: MultiSelectReading = { mode: "none" };

/**
 * A stored value as a reading. An exclusion wins over an include list because the two never describe
 * one filter together (`grid-view.ts`); a value holding neither is "all".
 */
export function multiSelectReadingOf(
  values: readonly string[],
  excluded: readonly string[],
): MultiSelectCommitted {
  if (excluded.length > 0) return { mode: "except", excluded };
  if (values.length > 0) return { mode: "only", values };
  return EVERYTHING;
}

/** Does this option's box show ticked? */
export function multiSelectTicked(reading: MultiSelectReading, value: string): boolean {
  if (reading.mode === "all") return true;
  if (reading.mode === "none") return false;
  if (reading.mode === "only") return reading.values.includes(value);
  return !reading.excluded.includes(value);
}

/** Does `ids` name every option the list offers? An empty list offers nothing to cover. */
function coversEveryOption(options: readonly MultiSelectOption[], ids: readonly string[]): boolean {
  return options.length > 0 && options.every((opt) => ids.includes(opt.value));
}

/**
 * The reading after one option's box is ticked or unticked — EVERY transition of plan §1, in one place.
 *
 * 🔴 THE FORM FOLLOWS HOW THE READER GOT THERE. Starting from everything and unticking gives "except";
 *    starting from nothing and ticking gives "only". Both lists go through `multiSelectToggle`, so a
 *    stored id the options no longer offer is preserved in either (CR-DESIGN-SYSTEM-010 F1).
 *
 * ⚠ TWO COLLAPSES, BOTH TOWARDS WHAT THE BOXES SHOW. Unticking the last ticked box is the "none"
 *   draft (every box clear); ticking every box is "all" (nothing hidden — so a row with no value shows
 *   again, which is what an all-ticked list means in this mode).
 */
export function multiSelectAllTickedToggle(
  options: readonly MultiSelectOption[],
  reading: MultiSelectReading,
  value: string,
  checked: boolean,
): MultiSelectReading {
  if (reading.mode === "all" || reading.mode === "except") {
    const hidden = multiSelectToggle(
      options,
      reading.mode === "all" ? [] : reading.excluded,
      value,
      !checked,
    );
    if (hidden.length === 0) return EVERYTHING;
    return coversEveryOption(options, hidden) ? NOTHING_TICKED : { mode: "except", excluded: hidden };
  }
  const chosen = multiSelectToggle(
    options,
    reading.mode === "none" ? [] : reading.values,
    value,
    checked,
  );
  if (chosen.length === 0) return NOTHING_TICKED;
  return coversEveryOption(options, chosen) ? EVERYTHING : { mode: "only", values: chosen };
}

/**
 * How many options are SHOWING. "only" counts its stored arity (CR-DESIGN-SYSTEM-010: a retired id is
 * still narrowing); "except" counts the offered options it does not hide.
 */
function shownCount(options: readonly MultiSelectOption[], reading: MultiSelectReading): number {
  if (reading.mode === "all") return options.length;
  if (reading.mode === "none") return 0;
  if (reading.mode === "only") return reading.values.length;
  return options.filter((opt) => !reading.excluded.includes(opt.value)).length;
}

/**
 * The closed trigger's wording, the owner's layout B (2026-10-06): the box COUNTS, the open list names
 * what is hidden. "5 of 6 batches" — short enough for a narrow column.
 *
 * - "all" and the "none" draft rest on the surface's empty text ("All batches") — the filter is not
 *   narrowing in either.
 * - "only" keeps today's wording, "SBF-001 +2", through the same `multiSelectTriggerLabel`.
 * - "except" reads "5 of 6 batches", the noun taken from an "All …" empty text. An empty text that is
 *   not "All …" gives "5 of 6 shown" rather than a guessed noun.
 */
export function multiSelectAllTickedLabel(
  emptyText: string,
  options: readonly MultiSelectOption[],
  reading: MultiSelectReading,
): { readonly text: string; readonly more: number } {
  if (reading.mode === "only") {
    return multiSelectTriggerLabel(emptyText, multiSelectChosenLabels(options, reading.values));
  }
  if (reading.mode !== "except") return { text: emptyText, more: 0 };
  const noun = /^all\s+(.+)$/i.exec(emptyText.trim())?.[1] ?? "shown";
  const shown = String(shownCount(options, reading));
  return { text: `${shown} of ${String(options.length)} ${noun}`, more: 0 };
}

/**
 * The footer, layout B: it NAMES what is hidden, which is the half of the story the trigger leaves
 * out. A hidden id the options no longer offer keeps its raw id, as `multiSelectChosenLabels` does.
 */
export function multiSelectAllTickedFooter(
  options: readonly MultiSelectOption[],
  reading: MultiSelectReading,
): string {
  if (reading.mode === "all") return "Nothing hidden";
  if (reading.mode === "none") return "Nothing ticked — showing everything until you tick one";
  if (reading.mode === "only") return `${String(reading.values.length)} chosen`;
  return `Hidden: ${multiSelectChosenLabels(options, reading.excluded).join(", ")}`;
}

/**
 * The master row's tick and count. Ticked for "all" (`All 6`), clear for the draft (`0 of 6`), a dash
 * while some are hidden (`5 of 6`). An "only" list that names every option — reachable only from a
 * restored value, since ticking the last box collapses to "all" — reads ticked, `6 of 6`.
 */
export function multiSelectEveryRowState(
  options: readonly MultiSelectOption[],
  reading: MultiSelectReading,
): { readonly state: boolean | "indeterminate"; readonly count: string } {
  const total = String(options.length);
  if (reading.mode === "all") return { state: true, count: `All ${total}` };
  const count = `${String(shownCount(options, reading))} of ${total}`;
  if (reading.mode === "none") return { state: false, count };
  if (reading.mode === "only" && coversEveryOption(options, reading.values)) {
    return { state: true, count };
  }
  return { state: "indeterminate", count };
}
