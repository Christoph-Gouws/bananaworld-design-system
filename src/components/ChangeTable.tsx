"use client";

import { forwardRef, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "../lib";
import { Button } from "./Button";

/**
 * ChangeTable — "what changed", field by field (CR-DESIGN-SYSTEM-014, raised by Bananaworld-DC
 * CR-DC-222).
 *
 * Two modes:
 *   - `"changes"` (default): Field · Before · After. A row marked `changed` shows its before value on
 *     the danger tint and its after value on the success tint; an unchanged row shows both plainly.
 *   - `"values"`: Field · Recorded as — for a record that kept only its NEW values, so the table does
 *     not invent a "before" it never had.
 *
 * An optional `more` block holds rows the reader may not need (the fields that did not change, the
 * rest of a recorded set). It sits behind one tertiary button whose words the consumer supplies, and
 * the button is a real `<button>`, so it is reached and pressed from the keyboard.
 *
 * Pure presentation (TECH-COMP-003): every label, value and heading is handed in already in words.
 * The package never reads a record, a permission or a clock. The classes are the ones Bananaworld-DC's
 * Audit Log side panel shipped with (CR-DC-221), promoted here so there is one copy of this table.
 */
export interface ChangeTableRow {
  /** Stable React key — the field's own key. */
  readonly key: string;
  readonly label: ReactNode;
  /** Ignored in `"values"` mode. */
  readonly before?: ReactNode;
  readonly after: ReactNode;
  /** `"changes"` mode only: tint the before/after values. */
  readonly changed?: boolean;
}

export type ChangeTableMode = "changes" | "values";

export interface ChangeTableHeadings {
  readonly field?: string;
  readonly before?: string;
  readonly after?: string;
  /** The one value column's heading in `"values"` mode. */
  readonly value?: string;
}

export interface ChangeTableMore {
  readonly rows: readonly ChangeTableRow[];
  /** e.g. "Show the 9 fields that did not change". */
  readonly showLabel: string;
  /** e.g. "Hide the fields that did not change". */
  readonly hideLabel: string;
}

export interface ChangeTableProps extends HTMLAttributes<HTMLDivElement> {
  readonly rows: readonly ChangeTableRow[];
  readonly mode?: ChangeTableMode;
  readonly headings?: ChangeTableHeadings;
  /** Rows kept behind a "Show …" button; absent or empty ⇒ no button. */
  readonly more?: ChangeTableMore;
}

const DEFAULT_HEADINGS: Required<ChangeTableHeadings> = {
  field: "Field",
  before: "Before",
  after: "After",
  value: "Recorded as",
};

function Cell({ tint, children }: { tint: "before" | "after" | null; children: ReactNode }) {
  if (tint === null) return <>{children}</>;
  return (
    <span
      className={cn(
        "rounded px-1",
        tint === "before" ? "bg-danger-subtle text-danger-fg" : "bg-success-subtle text-success-fg",
      )}
    >
      {children}
    </span>
  );
}

function Grid({
  rows,
  mode,
  headings,
}: {
  rows: readonly ChangeTableRow[];
  mode: ChangeTableMode;
  headings: Required<ChangeTableHeadings>;
}): ReactElement {
  const values = mode === "values";
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-left text-xs font-semibold text-fg-muted">
          <tr>
            <th className="px-3 py-2">{headings.field}</th>
            {values ? (
              <th className="px-3 py-2">{headings.value}</th>
            ) : (
              <>
                <th className="px-3 py-2">{headings.before}</th>
                <th className="px-3 py-2">{headings.after}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tinted = !values && row.changed === true;
            return (
              <tr key={row.key} className="border-t border-border align-top">
                <td className="w-1/3 px-3 py-2 text-fg-muted">{row.label}</td>
                {!values && (
                  <td className="px-3 py-2">
                    <Cell tint={tinted ? "before" : null}>{row.before}</Cell>
                  </td>
                )}
                <td className="px-3 py-2">
                  <Cell tint={tinted ? "after" : null}>{row.after}</Cell>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const ChangeTable = forwardRef<HTMLDivElement, ChangeTableProps>(function ChangeTable(
  { className, rows, mode = "changes", headings, more, ...props },
  ref,
) {
  const [open, setOpen] = useState(false);
  const words = { ...DEFAULT_HEADINGS, ...headings };
  const hasMore = more !== undefined && more.rows.length > 0;
  return (
    <div ref={ref} className={cn("space-y-2", className)} data-change-table={mode} {...props}>
      {rows.length > 0 && <Grid rows={rows} mode={mode} headings={words} />}
      {hasMore && (
        <>
          <Button
            variant="tertiary"
            size="sm"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? more.hideLabel : more.showLabel}
          </Button>
          {open && <Grid rows={more.rows} mode={mode} headings={words} />}
        </>
      )}
    </div>
  );
});
