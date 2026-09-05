"use client";

// DateRangeChrome — a date range that lives in a screen's HEADER, not in its filters
// (CR-DESIGN-SYSTEM-008).
//
// Anchors: the consuming estate's OD-RP-7, given as a general rule — *"a date picker should be a
//          standard thing. It shouldn't be something that you need to add as a filter. A date picker
//          should always be on a report."* (owner, 2026-09-04) — and the owner revision of 2026-09-05,
//          *"any field menus show up as drop down menus not popups"*.
//
// ============================================================================
// 🔴 THE MENU DROPS OUT OF THE BUTTON. IT IS NOT A FLOATING CARD.
// ============================================================================
// `sideOffset={-1}` puts the menu's top border ON the trigger's bottom border, and the open trigger
// squares off its own bottom corners, so the two read as one control. That is why this is a
// `DropdownMenu` and not a `Popover`, and it is the thing the owner asked to be changed. Do not
// "improve" it back into a panel beside the field.
//
// ============================================================================
// 🔴 IT HOLDS NO CALENDAR ARITHMETIC, NO CLOCK, AND NO IDEA WHAT A "QUICK RANGE" MEANS
// ============================================================================
// Every string it prints is handed to it: the basis label, the summary, the quick choices, the
// sentence under the boxes. That is not squeamishness about scope — it is the only way the control
// and its consumer cannot disagree about what a range MEANS. The consuming app resolves "last 30
// days" against the DEPOT's today (a clock read in the wrong zone has cost that estate five defects),
// applies its own report's default when both boxes are emptied, and hands the answer down. A control
// that resolved either of those itself would be a second definition of both.
//
// PURE UI (TECH-COMP-003 / ADR-001).

import { type ReactElement, type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Calendar, Check, ChevronDown } from "lucide-react";

import { cn } from "../lib";
import { Button } from "./Button";
import { Input } from "./Input";

/** One quick choice, e.g. `{ id: "last30", label: "Last 30 days" }`. Ordered by the consumer. */
export interface DateRangeQuickChoice {
  readonly id: string;
  readonly label: string;
}

/** The two boxes' current contents. `null` is an empty box, never the string "". */
export interface DateRangeDraft {
  readonly from: string | null;
  readonly to: string | null;
}

export interface DateRangeChromeProps {
  /** The uppercase word over the value — what the dates are ABOUT ("Received", "Posted"). */
  readonly basisLabel: string;
  /** The value the button shows: "Everything on hand", "Last 30 days", "01 Aug → 31 Aug". */
  readonly summary: string;
  readonly quickChoices: readonly DateRangeQuickChoice[];
  /** Which quick choice the current value matches, or null when it matches none. */
  readonly activeQuickId: string | null;
  readonly draft: DateRangeDraft;
  /**
   * What emptying BOTH boxes will do, in the consumer's own words — e.g. "Leave both empty for
   * everything on hand." ⚠ It differs per screen and must, because the default does.
   */
  readonly emptyMeans: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onQuickChoice: (id: string) => void;
  readonly onDraftChange: (draft: DateRangeDraft) => void;
  readonly onApply: () => void;
  /** True while the consumer cannot yet resolve a range (it has not read its own today). */
  readonly disabled?: boolean;
  /** Anything the consumer wants beside the Apply button — a note, a future affordance. */
  readonly footerNote?: ReactNode;
}

export function DateRangeChrome({
  basisLabel,
  summary,
  quickChoices,
  activeQuickId,
  draft,
  emptyMeans,
  open,
  onOpenChange,
  onQuickChoice,
  onDraftChange,
  onApply,
  disabled = false,
  footerNote,
}: DateRangeChromeProps): ReactElement {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`${basisLabel} date range`}
          className={cn(
            "group inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3",
            "text-sm text-fg shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:shadow-focus",
            "data-[state=open]:rounded-b-none data-[state=open]:border-b-border data-[state=open]:shadow-none",
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
            {basisLabel}
          </span>
          <span className="font-semibold">{summary}</span>
          <ChevronDown
            className="h-3.5 w-3.5 shrink-0 text-fg-subtle transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          // 🔴 −1, NOT A GAP. See the header.
          sideOffset={-1}
          className="z-[var(--z-dropdown)] w-[19rem] overflow-hidden rounded-b-md border border-border-strong border-t-border bg-surface shadow-lg animate-fade-in"
        >
          {quickChoices.map((choice) => (
            <DropdownMenu.Item
              key={choice.id}
              onSelect={() => onQuickChoice(choice.id)}
              disabled={disabled}
              className={cn(
                "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm text-fg-muted outline-none",
                "data-[highlighted]:bg-surface-muted data-[highlighted]:text-fg",
                activeQuickId === choice.id && "bg-surface-muted font-semibold text-fg",
              )}
            >
              <Check
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-success",
                  activeQuickId !== choice.id && "invisible",
                )}
                aria-hidden="true"
              />
              {choice.label}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <p className="px-3 pb-1 pt-1 text-[10.5px] font-semibold uppercase tracking-wide text-fg-subtle">
            Or set your own
          </p>
          {/* 🔴 NOT `DropdownMenu.Item`s. A Radix item closes the menu and steals arrow keys from the
              boxes; these are plain form controls inside the menu. */}
          <div className="space-y-2 px-3 pb-3" onKeyDown={(e) => e.stopPropagation()}>
            <label className="block">
              <span className="text-xs text-fg-muted">{basisLabel} from</span>
              <Input
                type="date"
                aria-label={`${basisLabel} from`}
                value={draft.from ?? ""}
                onChange={(e) =>
                  onDraftChange({
                    from: e.target.value.length > 0 ? e.target.value : null,
                    to: draft.to,
                  })
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-fg-muted">{basisLabel} to</span>
              <Input
                type="date"
                aria-label={`${basisLabel} to`}
                value={draft.to ?? ""}
                onChange={(e) =>
                  onDraftChange({
                    from: draft.from,
                    to: e.target.value.length > 0 ? e.target.value : null,
                  })
                }
              />
            </label>
            {/* ⚠ SAYS WHAT EMPTYING THEM DOES, rather than leaving a reader to discover that the range
                snapped back to something they were never told about. */}
            <p className="pt-0.5 text-[11px] leading-snug text-fg-subtle">{emptyMeans}</p>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted px-3 py-2">
            {footerNote ?? <span />}
            <Button size="sm" onClick={onApply} disabled={disabled}>
              Apply
            </Button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
