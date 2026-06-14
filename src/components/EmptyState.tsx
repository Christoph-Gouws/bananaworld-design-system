"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib";

/**
 * EmptyState — UX-DS-011 + UX-PRINCIPLE-010. Plain-language message + optional
 * recovery action. Never expose stack trace, secret, token, or internal code
 * (PRD-ERR-005).
 */
export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  heading: string;
  message?: string;
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, icon, heading, message, action, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-12 px-6 [[data-surface=tablet]_&]:py-20",
        className,
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-fg-subtle">{icon}</div>}
      <h2 className="text-lg font-semibold text-fg">{heading}</h2>
      {message && <p className="mt-2 text-sm text-fg-muted max-w-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
});
