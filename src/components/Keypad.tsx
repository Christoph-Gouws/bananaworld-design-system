"use client";

import { useId, type HTMLAttributes, type KeyboardEvent } from "react";
import { Delete } from "lucide-react";
import { cn } from "../lib";
import { Icon } from "./Icon";
import { isKeypadDigit, pressKeypadKey, resolveMaxDigits, type KeypadKey } from "./keypad-entry";

/**
 * Keypad — CR-DESIGN-SYSTEM-021. An on-screen number pad for entering a whole-number count with
 * gloves on: 1-9, then Clear, 0, Delete-last-digit. Controlled (value + onChange); no decimals, no
 * rounding, no network. Every key is a native button. 64px tall on touch and on the tablet surface.
 *
 * Physical keyboard, while focus is on a key: 0-9 types, Backspace deletes the last digit, Delete
 * clears (the calculator convention). Ctrl/Meta/Alt combinations are left to the browser.
 */
export interface KeypadProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Digits only, e.g. "", "0", "35". */
  value: string;
  /** Called only when the value actually changes. */
  onChange: (next: string) => void;
  /** Default 4; anything that is not a whole number >= 1 falls back to 4. */
  maxDigits?: number;
  /** Names the pad and heads the number box. */
  label?: string;
  /** Shown beside the entry for comparison (e.g. 40). */
  target?: number | string;
  /** Default "Expected". */
  targetLabel?: string;
  disabled?: boolean;
  /** The pad's own words; English defaults. */
  words?: { clear?: string; deleteLastDigit?: string; empty?: string };
}

const KEY_BASE =
  "h-12 [@media(pointer:coarse)]:h-16 [[data-surface=tablet]_&]:h-16 rounded-lg border border-border " +
  "touch-manipulation select-none transition-colors duration-fast " +
  "hover:bg-surface-muted active:bg-surface-sunken " +
  "focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50";
const DIGIT_KEY = cn(KEY_BASE, "bg-surface text-fg text-2xl tabular-nums");
const SECONDARY_KEY = cn(KEY_BASE, "bg-surface-muted text-fg-muted text-base");

const DIGITS_1_TO_9: KeypadKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function Keypad({
  value,
  onChange,
  maxDigits,
  label,
  target,
  targetLabel = "Expected",
  disabled,
  words,
  className,
  onKeyDown,
  ...props
}: KeypadProps) {
  const id = useId();
  const max = resolveMaxDigits(maxDigits);
  const emptyWord = words?.empty ?? "empty";
  const hasTarget = target !== undefined && target !== "";

  function press(key: KeypadKey) {
    const next = pressKeypadKey(value, key, max);
    if (next !== value) onChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    let key: KeypadKey | null = null;
    if (isKeypadDigit(event.key)) key = event.key;
    else if (event.key === "Backspace") key = "backspace";
    else if (event.key === "Delete") key = "clear";
    if (!key) return;
    event.preventDefault();
    press(key);
  }

  return (
    <div
      role="group"
      aria-labelledby={label ? `${id}-label` : undefined}
      aria-describedby={hasTarget ? `${id}-target` : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn("w-full", className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div
        className={cn(
          "mb-2 flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3",
          // Muted, not faded: a faded label would fail text contrast (the box is not a disabled control).
          disabled ? "bg-surface-muted" : "bg-surface",
        )}
      >
        <div className="min-w-0">
          {label ? (
            <div id={`${id}-label`} className="text-sm font-medium text-fg-muted">
              {label}
            </div>
          ) : null}
          <output
            aria-live="polite"
            aria-atomic="true"
            className="block text-4xl font-semibold leading-tight tabular-nums text-fg"
          >
            {value ? (
              value
            ) : (
              <>
                <span className="sr-only">{emptyWord}</span>
                <span aria-hidden="true" className="text-fg-subtle">
                  —
                </span>
              </>
            )}
          </output>
        </div>
        {hasTarget ? (
          <div id={`${id}-target`} className="shrink-0 text-sm tabular-nums text-fg-subtle">
            {targetLabel} {target}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DIGITS_1_TO_9.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            className={DIGIT_KEY}
            onClick={() => press(k)}
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          className={SECONDARY_KEY}
          onClick={() => press("clear")}
        >
          {words?.clear ?? "Clear"}
        </button>
        <button type="button" disabled={disabled} className={DIGIT_KEY} onClick={() => press("0")}>
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-label={words?.deleteLastDigit ?? "Delete last digit"}
          className={cn(SECONDARY_KEY, "flex items-center justify-center")}
          onClick={() => press("backspace")}
        >
          <Icon as={Delete} size="lg" />
        </button>
      </div>
    </div>
  );
}
