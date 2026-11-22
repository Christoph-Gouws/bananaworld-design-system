"use client";

import type { ReactNode } from "react";
import { cn } from "../lib";

/**
 * PageHeader — the title row every page in the app frame starts with (CR-DESIGN-SYSTEM-032):
 * the page's <h1>, one line of description, and the page's actions on the right. An empty page
 * pairs it with the existing EmptyState.
 */
export interface PageHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-[length:var(--font-size-h2)] font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {description != null && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions != null && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
