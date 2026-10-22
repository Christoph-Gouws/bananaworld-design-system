/**
 * Keypad digit rules — CR-DESIGN-SYSTEM-021. Pure: the count is the string, never parsed, rounded or
 * judged. Whether a count is ALLOWED is the app's rule, not the pad's.
 */
export type KeypadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "clear"
  | "backspace";

export const KEYPAD_DEFAULT_MAX_DIGITS = 4;

/** A value that is not a whole number of at least 1 falls back to the default. */
export function resolveMaxDigits(maxDigits?: number): number {
  return typeof maxDigits === "number" && Number.isInteger(maxDigits) && maxDigits >= 1
    ? maxDigits
    : KEYPAD_DEFAULT_MAX_DIGITS;
}

export function pressKeypadKey(value: string, key: KeypadKey, maxDigits: number): string {
  if (key === "clear") return "";
  if (key === "backspace") return value.slice(0, -1);
  if (value === "0") return key; // a leading zero is dropped: 0 then 5 reads 5
  if (value.length >= maxDigits) return value;
  return value + key;
}

export function isKeypadDigit(key: string): key is KeypadKey {
  return key.length === 1 && key >= "0" && key <= "9";
}
