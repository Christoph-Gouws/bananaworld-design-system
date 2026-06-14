"use client";

import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";

/**
 * NumericInput — UX-DS-004. Same primitive as Input but with `inputMode="decimal"`
 * so the tablet OS surfaces the numeric keypad (per UX-DS-004 + UX-A11Y-007).
 *
 * Use this for weight, count, ZAR amounts. Do NOT bake any business validation in
 * (tolerance bands, min/max units) — those are read from masters at the calling
 * Route Handler (TECH-LOGIC-006).
 */
export const NumericInput = forwardRef<HTMLInputElement, InputProps>(function NumericInput(
  { inputMode = "decimal", pattern = "[0-9]*([.,][0-9]+)?", ...props },
  ref,
) {
  return <Input ref={ref} type="text" inputMode={inputMode} pattern={pattern} {...props} />;
});
