"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

/**
 * StatusBadge — UX-DS-006.
 *
 * The status values below are UI DISPLAY STATES per UX-DS-006, NOT business
 * config — they are framework-defined lifecycle and pallet states that the
 * Bananaworld-DC source documents enumerate explicitly. Business-value strings
 * (banana colour stages, container types, classes) are NEVER added as variants
 * here — those render via separate components reading their values from masters.
 */
const badgeStyles = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap",
    "px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wide",
    "[[data-surface=tablet]_&]:text-xs [[data-surface=tablet]_&]:px-3 [[data-surface=tablet]_&]:py-1",
  ],
  {
    variants: {
      status: {
        active: "bg-success-subtle text-success-fg",
        on_hold: "bg-warning-subtle text-warning-fg",
        waste: "bg-danger-subtle text-danger-fg",
        out_of_band: "bg-warning-subtle text-warning-fg",
        out_of_tolerance: "bg-warning-subtle text-warning-fg",
        posted: "bg-info-subtle text-info-fg",
        draft: "bg-neutral-subtle text-neutral-fg",
        voided: "bg-neutral-subtle text-neutral-fg line-through",
        reversed: "bg-neutral-subtle text-neutral-fg italic",
        adjusted: "bg-neutral-subtle text-neutral-fg",
      },
    },
    defaultVariants: { status: "active" },
  },
);

type StatusValue = NonNullable<StatusBadgeProps["status"]>;

function statusLabel(status: StatusValue): string {
  switch (status) {
    case "active":
      return "Active";
    case "on_hold":
      return "On hold";
    case "waste":
      return "Waste";
    case "out_of_band":
      return "Out of band";
    case "out_of_tolerance":
      return "Out of tolerance";
    case "posted":
      return "Posted";
    case "draft":
      return "Draft";
    case "voided":
      return "Voided";
    case "reversed":
      return "Reversed";
    case "adjusted":
      return "Adjusted";
  }
}

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {
  /** Override the default label (e.g. for i18n in a future Milestone) */
  label?: string;
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { className, status, label, children, ...props },
  ref,
) {
  const resolvedLabel = children ?? label ?? (status ? statusLabel(status) : "");
  return (
    <span ref={ref} className={cn(badgeStyles({ status }), className)} {...props}>
      <span
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full",
          status === "active" && "bg-success",
          (status === "on_hold" || status === "out_of_band" || status === "out_of_tolerance") &&
            "bg-warning",
          status === "waste" && "bg-danger",
          status === "posted" && "bg-info",
          (status === "draft" ||
            status === "voided" ||
            status === "reversed" ||
            status === "adjusted") &&
            "bg-neutral",
        )}
      />
      {resolvedLabel}
    </span>
  );
});
