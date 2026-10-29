import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib";

/**
 * BarChart — CR-DESIGN-SYSTEM-025 (E4-F21). Horizontal bars of labelled values, each line
 * "name | bar | amount · share" (look A). Plain HTML + CSS, no chart library, no hook and no
 * "use client", so it renders inside a server component. Horizontal shares only: any other chart
 * type re-opens the dependency question.
 *
 * ONE structure is both the picture and the table. The root is role="table"; each line is a
 * role="row" whose direct children are a rowheader (name), a cell (amount) and a cell (share). The
 * track and the " · " separator are aria-hidden, so a screen reader reads the figures, never the bar,
 * and colour is never the only carrier of meaning (every figure is printed; a "warning" line is
 * named by its own label).
 *
 * The caller hands in the figures to print (`valueText`, `percentText`) whenever a table on the
 * same screen shows the same numbers: the kit never re-rounds them and never reads a locale. The
 * defaults (String(value), one-decimal share) exist only for a quick English chart. `value` sets the
 * bar length and nothing else.
 *
 * Lengths: base = `total.value`, else the sum of the drawable values (finite, >= 0). Fill =
 * clamp(value / base, 0, 1). Zero draws no fill element; a value above zero keeps a 2px minimum.
 * A negative / NaN / Infinity value draws no fill and prints a dash.
 *
 * The ONE place the kit overrides caller text: when the base is 0 or not finite (nothing yet) every
 * line keeps its name and an empty track and prints "—" for both figures, even if texts were passed
 * ("0.00 · —" reads as broken). Colour: the theme's `bg-accent` fill on `bg-surface-sunken`, plus a
 * single `tone: "warning"`. Tokens only, so any app that redefines them for dark gets dark.
 */
export type BarChartTone = "default" | "warning";

export interface BarChartItem {
  readonly label: string;
  readonly value: number;
  readonly valueText?: string;
  readonly percentText?: string;
  readonly tone?: BarChartTone;
}

export interface BarChartTotal {
  readonly label: string;
  readonly value?: number;
  readonly valueText?: string;
}

export interface BarChartWords {
  readonly item: string;
  readonly amount: string;
  readonly share: string;
  readonly empty: string;
}

export interface BarChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "role" | "aria-label"
> {
  readonly label: string;
  readonly items: readonly BarChartItem[];
  readonly total?: BarChartTotal;
  readonly words?: Partial<BarChartWords>;
}

const DASH = "—";

const isDrawable = (value: number): boolean => Number.isFinite(value) && value >= 0;

function chartBase(items: readonly BarChartItem[], total?: BarChartTotal): number {
  if (total?.value !== undefined) return total.value;
  return items.reduce((sum, item) => (isDrawable(item.value) ? sum + item.value : sum), 0);
}

function fillWidth(value: number, base: number): number {
  return Math.min(Math.max(value / base, 0), 1) * 100;
}

const defaultPercent = (value: number, base: number): string =>
  `${((value / base) * 100).toFixed(1)}%`;

const ROW = "col-span-5 grid grid-cols-subgrid items-center gap-x-2";
const NAME =
  "min-w-0 [overflow-wrap:anywhere] text-left font-normal [[data-surface=tablet]_&]:text-base";
const FIGURE = "whitespace-nowrap tabular-nums";

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  { label, items, total, words, className, ...rest },
  ref,
) {
  const text = {
    item: words?.item ?? "Item",
    amount: words?.amount ?? "Amount",
    share: words?.share ?? "Share",
    empty: words?.empty ?? "No figures yet",
  };
  const base = chartBase(items, total);
  const usable = items.length > 0 && Number.isFinite(base) && base > 0;

  const dash = (
    <>
      <span aria-hidden="true">{DASH}</span>
      <span className="sr-only">{text.empty}</span>
    </>
  );

  return (
    <div
      ref={ref}
      {...rest}
      role="table"
      aria-label={label}
      className={cn(
        "grid grid-cols-[minmax(0,9.5em)_minmax(3rem,1fr)_auto_auto_auto] gap-y-2 text-sm text-fg",
        "[[data-surface=tablet]_&]:text-base [[data-surface=tablet]_&]:gap-y-3",
        className,
      )}
    >
      <div role="row" className="sr-only">
        <span role="columnheader">{text.item}</span>
        <span role="columnheader">{text.amount}</span>
        <span role="columnheader">{text.share}</span>
      </div>

      {items.length === 0 ? (
        <div role="row" className={ROW}>
          <span role="rowheader" className={cn(NAME, "col-span-5 text-fg-muted")}>
            {dash}
          </span>
        </div>
      ) : (
        items.map((item, index) => {
          const drawable = usable && isDrawable(item.value);
          const warning = item.tone === "warning";
          const width = drawable ? fillWidth(item.value, base) : 0;
          return (
            <div role="row" className={ROW} key={`${index}-${item.label}`}>
              <span role="rowheader" className={cn(NAME, warning && "text-warning-fg")}>
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="h-4 min-w-0 overflow-hidden rounded-full bg-surface-sunken [[data-surface=tablet]_&]:h-5"
              >
                {width > 0 ? (
                  <span
                    className={cn(
                      "block h-full min-w-[2px] rounded-full",
                      warning ? "bg-warning" : "bg-accent",
                    )}
                    style={{ width: `${Number(width.toFixed(4))}%` }}
                  />
                ) : null}
              </span>
              <span role="cell" className={cn(FIGURE, "text-right font-medium")}>
                {usable && isDrawable(item.value) ? (item.valueText ?? String(item.value)) : dash}
              </span>
              <span aria-hidden="true" className="text-fg-muted">
                ·
              </span>
              <span role="cell" className={cn(FIGURE, "text-right text-fg-muted")}>
                {drawable ? (item.percentText ?? defaultPercent(item.value, base)) : dash}
              </span>
            </div>
          );
        })
      )}

      {total && items.length > 0 ? (
        <div role="row" className={cn(ROW, "border-t border-border pt-2 font-semibold")}>
          <span role="rowheader" className={cn(NAME, "col-span-2 font-semibold")}>
            {total.label}
          </span>
          <span role="cell" className={cn(FIGURE, "col-span-3 text-right")}>
            {usable ? (total.valueText ?? String(base)) : dash}
          </span>
        </div>
      ) : null}
    </div>
  );
});
