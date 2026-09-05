"use client";

// GridGroupStrip — the strip above the grid you drag a column header into (CR-DESIGN-SYSTEM-008).
//
// Anchors: the consuming estate's OD-RP-6 (*"GROUP = DRAG THE COLUMN HEADER ITSELF up into a strip
//          above the grid… ✕ on the chip ungroups. ❌ NEVER a 'Group by' dropdown"*) and OD-RP-8
//          (*"THE SUBTOTAL CHOICE RIDES THE GROUP CHIP, NOT THE COLUMN MENU. Each grouping LEVEL
//          carries its own Σ control"*), both settled by the consuming app's owner on 2026-09-04.
//
// ============================================================================
// 🔴 THE Σ BELONGS TO THE LEVEL, AND THAT IS THE POINT OF IT
// ============================================================================
// Two levels can subtotal differently — a customer level counting rows and summing units, a pack level
// summing units only. A single "which measures do subtotals show" setting for the whole grid cannot
// express that, which is exactly why the ruling put the control on the chip.
//
// ⚠ A NON-ADDITIVE COLUMN IS OFFERED, DISABLED, AND SAID OUT LOUD ("not a number"). Hiding it would
//   leave a reader wondering where their percentage column went; offering it enabled would let them
//   add up a ratio. The consumer decides WHICH columns are additive; this only renders the answer.
//
// PURE UI (TECH-COMP-003 / ADR-001).

import { useState, type DragEvent, type ReactElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, GripVertical, Rows3, Sigma, X } from "lucide-react";

import { cn } from "../lib";
import type { GridGroupLevel } from "../lib/grid-view";
import { gridDraggedColumn } from "./GridHeaderMenu";

/** One measure the Σ menu can offer at a level. `additive === false` renders disabled. */
export interface GridSigmaOption {
  readonly key: string;
  readonly label: string;
  readonly additive: boolean;
}

/** A placed level: the stored choice plus the label to print on the chip. */
export interface GridGroupChipView extends GridGroupLevel {
  readonly label: string;
}

export interface GridGroupStripProps {
  readonly levels: readonly GridGroupChipView[];
  /** The hard limit. The strip refuses a drop past it and stops prompting for another. */
  readonly maxLevels: number;
  readonly sigmaOptions: readonly GridSigmaOption[];
  readonly onDropColumn: (columnKey: string) => void;
  readonly onRemove: (columnKey: string) => void;
  readonly onSigmaChange: (
    columnKey: string,
    next: { readonly count: boolean; readonly measures: readonly string[] },
  ) => void;
}

const ORDINALS = ["first", "second", "third", "fourth", "fifth"] as const;

/**
 * What the strip invites next.
 *
 * ⚠ AT THE LIMIT IT SAYS NOTHING. A prompt that goes on asking for a level the grid will refuse is a
 *   control lying about what it accepts — and the refusal would then read as a bug.
 */
export function gridGroupHint(placed: number, maxLevels: number): string | null {
  if (placed >= maxLevels) return null;
  if (placed === 0) return "Drag a column header here to group by that column";
  return `Drag another header here for a ${ORDINALS[placed] ?? "further"} level`;
}

/**
 * What the chip prints beside its Σ.
 *
 * ⚠ A LEVEL THAT SUBTOTALS NOTHING SAYS SO. Blank would read as "not yet loaded"; "Nothing" is a
 *   legitimate choice a reader can make and must be able to see they have made.
 */
export function gridSigmaSummary(count: boolean, measureLabels: readonly string[]): string {
  const parts = [...(count ? ["Count"] : []), ...measureLabels];
  return parts.length === 0 ? "Nothing" : parts.join(" · ");
}

function GroupChip({
  level,
  position,
  sigmaOptions,
  onRemove,
  onSigmaChange,
}: {
  readonly level: GridGroupChipView;
  readonly position: number;
  readonly sigmaOptions: readonly GridSigmaOption[];
  readonly onRemove: () => void;
  readonly onSigmaChange: (next: {
    readonly count: boolean;
    readonly measures: readonly string[];
  }) => void;
}): ReactElement {
  // The chip prints the measure LABELS, not their keys — the keys are the consumer's identifiers and
  // mean nothing to a reader.
  const labelFor = (key: string): string => sigmaOptions.find((o) => o.key === key)?.label ?? key;
  const summary = gridSigmaSummary(level.count, level.measures.map(labelFor));

  function toggleMeasure(key: string): void {
    const next = level.measures.includes(key)
      ? level.measures.filter((k) => k !== key)
      : [...level.measures, key];
    onSigmaChange({ count: level.count, measures: next });
  }

  return (
    <span className="inline-flex items-center rounded-md border border-border-strong bg-surface text-xs shadow-sm">
      <span className="inline-flex h-7 items-center rounded-l-[7px] bg-fg px-2 text-[10.5px] font-bold text-surface">
        {position}
      </span>
      <span className="inline-flex h-7 items-center gap-1.5 px-2.5 font-semibold text-fg">
        <GripVertical className="h-3 w-3 text-fg-subtle" aria-hidden="true" />
        {level.label}
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`Subtotals for the ${level.label} level`}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 border-l border-border px-2 text-fg-muted",
              "hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
              "data-[state=open]:bg-surface-muted data-[state=open]:text-fg",
            )}
          >
            <Sigma className="h-3 w-3" aria-hidden="true" />
            <span className="font-semibold text-fg">{summary}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-[var(--z-dropdown)] w-[15rem] overflow-hidden rounded-md border border-border-strong bg-surface p-1 shadow-lg animate-fade-in"
          >
            <p className="px-2.5 pb-1 pt-1 text-2xs font-semibold uppercase tracking-wide text-fg-subtle">
              Subtotal this level by
            </p>
            <SigmaItem
              label="Row count"
              checked={level.count}
              onToggle={() => onSigmaChange({ count: level.count === false, measures: level.measures })}
            />
            {sigmaOptions.map((option) => (
              <SigmaItem
                key={option.key}
                label={option.label}
                checked={option.additive && level.measures.includes(option.key)}
                disabled={option.additive === false}
                note={option.additive === false ? "not a number" : undefined}
                onToggle={() => toggleMeasure(option.key)}
              />
            ))}
            <p className="-mx-1 -mb-1 mt-1 border-t border-border bg-surface-muted px-2.5 py-1.5 text-xs text-fg-muted">
              Applies to this level only.
            </p>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <button
        type="button"
        aria-label={`Stop grouping by ${level.label}`}
        onClick={onRemove}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-r-[7px] border-l border-border text-fg-subtle",
          "hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SigmaItem({
  label,
  checked,
  disabled,
  note,
  onToggle,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly note?: string;
  readonly onToggle: () => void;
}): ReactElement {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      disabled={disabled}
      // Stays open: choosing what a level totals is usually two or three ticks, not two or three
      // re-openings.
      onSelect={(e) => e.preventDefault()}
      onCheckedChange={() => onToggle()}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-xs outline-none",
        "text-fg data-[highlighted]:bg-surface-muted",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-subtle data-[disabled]:opacity-70",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-border-strong",
          checked && "border-fg bg-fg text-surface",
        )}
      >
        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      {label}
      {note !== undefined && <span className="ml-auto text-[10px] text-fg-subtle">{note}</span>}
    </DropdownMenu.CheckboxItem>
  );
}

export function GridGroupStrip({
  levels,
  maxLevels,
  sigmaOptions,
  onDropColumn,
  onRemove,
  onSigmaChange,
}: GridGroupStripProps): ReactElement {
  const [over, setOver] = useState(false);
  const full = levels.length >= maxLevels;
  const hint = gridGroupHint(levels.length, maxLevels);

  function onDragOver(e: DragEvent<HTMLDivElement>): void {
    // 🔴 The default for a dragover is "not a drop target" — without this, `drop` never fires.
    if (full) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOver(true);
  }

  return (
    <div
      // ⚠ `group` is the region's role name, not a Tailwind variant — it is what a screen reader calls
      //   a landmark holding controls, and it is why the ✕ buttons inside it are announced in context.
      role="group"
      aria-label="Grouping levels"
      data-grid-group-strip="true"
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (full) return;
        const dragged = gridDraggedColumn(e.dataTransfer);
        if (dragged !== null) onDropColumn(dragged);
      }}
      className={cn(
        "flex min-h-[46px] flex-wrap items-center gap-2 rounded-t-lg border-b border-border px-3 py-2",
        "bg-surface-sunken",
        levels.length === 0 && "bg-surface-muted",
        over && "bg-info-subtle ring-1 ring-inset ring-info",
      )}
    >
      {levels.map((level, index) => (
        <span key={level.key} className="inline-flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 text-fg-subtle" aria-hidden="true" />
          )}
          <GroupChip
            level={level}
            position={index + 1}
            sigmaOptions={sigmaOptions}
            onRemove={() => onRemove(level.key)}
            onSigmaChange={(next) => onSigmaChange(level.key, next)}
          />
        </span>
      ))}
      {hint !== null && (
        <span className="inline-flex items-center gap-1.5 text-xs text-fg-subtle">
          <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
          {hint}
        </span>
      )}
    </div>
  );
}
