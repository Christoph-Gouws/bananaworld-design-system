"use client";

// The summary card of `LinkedRecords` (CR-DESIGN-SYSTEM-023) — one body, drawn in the tooltip (mouse,
// keyboard) and in the touch sheet. Private to the part: not exported from the barrel except the type.

export interface LinkedRecordsSummary {
  /** "Dispatch" */
  readonly type: string;
  /** "DSP-00131" */
  readonly number: string;
  /** "Posted" — the app's own word. */
  readonly status?: string;
  /** Date · Customer · Total … */
  readonly rows: readonly { readonly label: string; readonly value: string }[];
}

export function SummaryRows({ rows }: { rows: LinkedRecordsSummary["rows"] }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-fg-muted">{row.label}</dt>
          <dd className="min-w-0 break-words text-fg">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SummaryCard({ summary }: { summary: LinkedRecordsSummary }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-2xs font-semibold uppercase tracking-wide text-fg-muted">
          {summary.type}
        </span>
        {summary.status !== undefined && (
          <span className="rounded-full border border-border px-2 text-2xs font-semibold text-fg-muted">
            {summary.status}
          </span>
        )}
      </div>
      <div className="text-sm font-semibold text-fg">{summary.number}</div>
      <SummaryRows rows={summary.rows} />
    </div>
  );
}
