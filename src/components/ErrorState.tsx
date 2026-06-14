"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../lib";

/**
 * ErrorState — UX-DS-011 + PRD-ERR-005. ALWAYS renders a plain-language message;
 * NEVER renders the underlying error object, stack trace, secret-bearing string,
 * or internal error code. The error object must be logged server-side by the
 * caller, not rendered.
 *
 * Used by Next.js error.tsx + global-error.tsx + per-surface error.tsx files.
 */
export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string;
  message?: string;
  action?: ReactNode;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  {
    className,
    heading = "Something went wrong",
    message = "An unexpected error occurred. Try again, or contact your manager if this keeps happening.",
    action,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-12 px-6 [[data-surface=tablet]_&]:py-20",
        className,
      )}
      {...props}
    >
      <AlertTriangle
        className="h-10 w-10 text-danger [[data-surface=tablet]_&]:h-14 [[data-surface=tablet]_&]:w-14"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h2 className="mt-4 text-lg font-semibold text-fg">{heading}</h2>
      <p className="mt-2 text-sm text-fg-muted max-w-md">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
});
