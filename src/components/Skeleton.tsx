"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib";

/**
 * Skeleton — UX-DS-010. Per-page-type loading silhouettes that match the final
 * layout to prevent CLS per UX-DS-019. Composed of:
 *   - <Skeleton>            atomic shimmer block
 *   - <StationHomeSkeleton>  tablet station home — card rail
 *   - <BrowserListSkeleton>  browser list — row stripes
 *   - <TableSkeleton>        dense data-table — header band + column-shaped rows + status pill
 *   - <DashboardSkeleton>    manager dashboard — tile grid
 *   - <FormSkeleton>         any form — label+field stripes
 *   - <ReportSkeleton>       report page — filter panel + table stripes
 *   - <LineageGraphSkeleton> recall lineage graph — node placeholders
 *   - <AuditLogSkeleton>     audit log table — filter panel + dense rows
 *
 * A single generic skeleton applied across page types is prohibited per UX-DS-010.
 */
export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("rounded-md bg-surface-sunken animate-pulse-soft", className)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

export function StationHomeSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-1 gap-3 mt-6 [[data-surface=browser]_&]:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

export function BrowserListSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}

// A dense data-table loading silhouette (REV-10). Echoes Table.tsx: a rounded bordered frame, a quiet
// `bg-surface-muted` header band, 44px rows, a wide first column (reference/name), narrow middle
// columns (dates/counts), and a pill on the right for the StatusBadge — so the placeholder matches the
// real columns instead of plain full-width stripes (prevents CLS, UX-DS-010/019). Unlike
// BrowserListSkeleton it renders NO title/button bar, because list pages draw their own header above
// the table; reusing BrowserListSkeleton there double-drew the header (the bug REV-10 fixes).
export function TableSkeleton({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) {
  const midWidths = ["w-28", "w-24", "w-16", "w-16", "w-20"];
  const cell = (c: number, header: boolean) => {
    if (c === 0) {
      return (
        <Skeleton key={c} className={cn(header ? "h-3" : "h-3.5", "w-32 flex-1 max-w-[12rem]")} />
      );
    }
    if (c === columns - 1) {
      return (
        <Skeleton
          key={c}
          className={cn("ml-auto", header ? "h-3 w-14" : "h-5 w-16 rounded-full")}
        />
      );
    }
    return (
      <Skeleton
        key={c}
        className={cn(header ? "h-3" : "h-3.5", midWidths[(c - 1) % midWidths.length])}
      />
    );
  };
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-4 border-b border-border bg-surface-muted px-3 py-2.5">
        {Array.from({ length: columns }).map((_, c) => cell(c, true))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-border px-3 py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((_, c) => cell(c, false))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-56" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-4 surface-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5 max-w-xl">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex gap-2 mt-6">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  // The report page already draws its own header + horizontal filter row above the loading body, and
  // every report renders a single full-width table. So the loading silhouette is just that table — not
  // a left filter-panel + table (which drew a phantom second section / sidebar that no report has).
  // Reuses the dense TableSkeleton so the placeholder echoes the real columns (CLS, UX-DS-010/019);
  // mirrors the REV-10 fix above.
  return <TableSkeleton columns={7} rows={10} />;
}

export function LineageGraphSkeleton() {
  return (
    <div className="relative h-96 surface-card p-6">
      <div className="grid grid-cols-3 gap-12 h-full place-items-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function AuditLogSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-px surface-card overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
