"use client";

import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib";

/**
 * ActivityTimeline — "who did what, when", one entry under another on a rail (CR-DESIGN-SYSTEM-014,
 * raised by Bananaworld-DC CR-DC-222 for its per-document History panel).
 *
 *   <ActivityTimeline aria-label="History">
 *     <ActivityTimelineItem title="Posted" meta="Johan Botha · Receiving bay 1 · Fri 2 Oct 2026, 06:48">
 *       <ChangeTable rows={…} />
 *     </ActivityTimelineItem>
 *     <ActivityTimelineItem title="Printed" tag="Batch label · 4471" tone="part" meta="…" />
 *   </ActivityTimeline>
 *
 * An ordered list (`<ol>`), so a screen reader announces "list, N items" and reads the entries in the
 * order the consumer chose. Each item has:
 *   - `title`: the action, in words ("Created", "Posted", "Printed");
 *   - `tag` (optional): which part of the record it touched ("Batch 4471", "Count line 3");
 *   - `badge` (optional): a status chip, e.g. an outcome that was not a plain success;
 *   - `meta`: who · where · when, already formatted by the consumer;
 *   - `children`: the body (a `ChangeTable`, a sentence, nothing).
 * `tone="part"` draws the dot in the neutral border colour instead of the accent, so an entry about a
 * part of the record reads as secondary to one about the record itself.
 *
 * Pure presentation (TECH-COMP-003): no data, no ordering, no time zone — the consumer hands in the
 * entries in the order it wants and every word already written.
 */
export type ActivityTimelineProps = HTMLAttributes<HTMLOListElement>;

export const ActivityTimeline = forwardRef<HTMLOListElement, ActivityTimelineProps>(
  function ActivityTimeline({ className, ...props }, ref) {
    return (
      <ol
        ref={ref}
        className={cn(
          "relative m-0 list-none space-y-4 pl-5",
          // The rail: one thin line behind the dots.
          "before:absolute before:bottom-1.5 before:left-[5px] before:top-1.5 before:w-px before:bg-border",
          className,
        )}
        {...props}
      />
    );
  },
);

export type ActivityTimelineTone = "record" | "part";

export interface ActivityTimelineItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  readonly title: ReactNode;
  readonly tag?: ReactNode;
  readonly badge?: ReactNode;
  readonly meta?: ReactNode;
  readonly tone?: ActivityTimelineTone;
}

export const ActivityTimelineItem = forwardRef<HTMLLIElement, ActivityTimelineItemProps>(
  function ActivityTimelineItem(
    { className, title, tag, badge, meta, tone = "record", children, ...props },
    ref,
  ) {
    return (
      <li ref={ref} className={cn("relative", className)} data-tone={tone} {...props}>
        <span
          aria-hidden="true"
          className={cn(
            "absolute -left-5 top-1 h-[11px] w-[11px] rounded-full border-2 bg-surface",
            tone === "part" ? "border-border-strong" : "border-accent",
          )}
        />
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-fg">
          <span>{title}</span>
          {tag !== undefined && tag !== null && (
            <span className="rounded border border-border bg-surface-muted px-1.5 text-xs font-medium text-fg-muted">
              {tag}
            </span>
          )}
          {badge}
        </div>
        {meta !== undefined && meta !== null && (
          <div className="mt-0.5 text-xs text-fg-subtle">{meta}</div>
        )}
        {children !== undefined && children !== null && <div className="mt-2">{children}</div>}
      </li>
    );
  },
);
