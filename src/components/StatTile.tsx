import {
  Children,
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib";
import { Link, type LinkProps } from "./Link";

/**
 * StatTile — CR-DESIGN-SYSTEM-026 (finding E4-F21). A read-only headline figure: a short label with
 * an optional icon, one large value, an optional unit and sub-line, an optional theme-colour top rule.
 * Data in, picture out: the value is printed exactly as given (the kit never formats a number).
 *
 *  - One reading unit. Label, value and unit share one <p>, the sub-line is the second; decorative
 *    parts (icon, rule, chevron) are aria-hidden. A read-only tile is a plain <div>, nothing focusable.
 *  - `value` null or "" draws a dash (read as `words.empty`) and hides the unit. "0" prints 0 — the
 *    app, not the kit, knows "nothing recorded" from a true zero, and says so by passing null.
 *  - `href` makes the whole tile the kit's <Link>; its name is its visible text. No `href` when the
 *    viewer may not open the target. A chevron shows it is a link, so it is not colour alone.
 *  - The tile sets no grid; <StatTileRow> does (2-up, up to 4-up from `lg`). Tokens only, no hex.
 *  - No client directive and no hook, so a server component can render it. `icon` is an element (not a
 *    component type) for the same reason.
 */
export interface StatTileWords {
  readonly empty: string;
}

type StatTileOwnProps = {
  /** Short name, first in the reading order. */
  label: string;
  /** Printed as given. null or "" draws a dash. */
  value: string | null;
  /** Small text after the value; hidden with the dash. */
  unit?: string;
  /** A decorative element, wrapped aria-hidden. */
  icon?: ReactNode;
  /** The sub-line, as given. */
  sub?: ReactNode;
  /** A thin top rule in the theme accent colour. */
  accent?: boolean;
  words?: Partial<StatTileWords>;
};

export type StatTileProps =
  | (StatTileOwnProps & Omit<HTMLAttributes<HTMLDivElement>, "children"> & { href?: undefined })
  | (StatTileOwnProps & Omit<LinkProps, "children" | "href"> & { href: string });

const DEFAULT_WORDS: StatTileWords = { empty: "Nothing recorded yet" };

const TILE =
  "relative block h-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface px-4 py-3 text-left text-fg " +
  "[[data-surface=tablet]_&]:px-5 [[data-surface=tablet]_&]:py-4";
const LINKED =
  "transition-colors duration-fast hover:bg-surface-muted hover:border-border-strong hover:text-fg " +
  "focus-visible:outline-none focus-visible:shadow-focus";
const LABEL =
  "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fg-muted [overflow-wrap:anywhere] " +
  "[[data-surface=tablet]_&]:text-sm";
const ICON =
  "inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4 [[data-surface=tablet]_&]:[&_svg]:h-5 [[data-surface=tablet]_&]:[&_svg]:w-5";
const VALUE =
  "mt-1 block text-2xl font-bold leading-tight tabular-nums whitespace-nowrap sm:text-3xl " +
  "[[data-surface=tablet]_&]:text-4xl";

// The {" "} text nodes are invisible in the block layout but keep label, value and unit apart in
// the accessible name.
function TileBody({
  label,
  value,
  unit,
  icon,
  sub,
  accent,
  linked,
  words,
}: StatTileOwnProps & { linked: boolean }) {
  const empty = value === null || value === "";
  const emptyWord = words?.empty ?? DEFAULT_WORDS.empty;
  return (
    <>
      {accent ? (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-accent" />
      ) : null}
      {linked ? (
        <ChevronRight
          aria-hidden="true"
          className="absolute right-2 top-3 h-4 w-4 text-fg-subtle [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5"
        />
      ) : null}
      <p className="m-0">
        <span className={cn(LABEL, linked && "pr-5")}>
          {icon ? (
            <span aria-hidden="true" className={ICON}>
              {icon}
            </span>
          ) : null}
          <span>{label}</span>
        </span>{" "}
        {empty ? (
          <span className={cn(VALUE, "text-fg-subtle")}>
            <span aria-hidden="true">—</span>
            <span className="sr-only">{emptyWord}</span>
          </span>
        ) : (
          <span className={VALUE}>
            {value}
            {unit ? (
              <>
                {" "}
                <span className="text-sm font-semibold text-fg-muted">{unit}</span>
              </>
            ) : null}
          </span>
        )}
      </p>
      {sub ? (
        <p className="m-0 mt-1 text-xs text-fg-muted [[data-surface=tablet]_&]:text-sm">{sub}</p>
      ) : null}
    </>
  );
}

export const StatTile = forwardRef<HTMLDivElement | HTMLAnchorElement, StatTileProps>(
  function StatTile(props, ref) {
    const { label, value, unit, icon, sub, accent, words, className, ...rest } = props;
    const body = { label, value, unit, icon, sub, accent, words };

    if ("href" in rest && typeof rest.href === "string") {
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          {...(rest as Omit<LinkProps, "children">)}
          className={cn(TILE, LINKED, className)}
        >
          <TileBody {...body} linked />
        </Link>
      );
    }
    const { href: _href, ...divProps } = rest as HTMLAttributes<HTMLDivElement> & {
      href?: undefined;
    };
    return (
      <div ref={ref as ForwardedRef<HTMLDivElement>} {...divProps} className={cn(TILE, className)}>
        <TileBody {...body} linked={false} />
      </div>
    );
  },
);

// Literal class strings so every consumer's Tailwind scan sees them. Phone and tablet are always
// 2-up; from `lg` the row takes as many columns as it has tiles, up to four.
const LG_COLS = Object.freeze({
  1: "grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const);

export type StatTileRowProps = HTMLAttributes<HTMLDivElement>;

export const StatTileRow = forwardRef<HTMLDivElement, StatTileRowProps>(function StatTileRow(
  { className, children, ...rest },
  ref,
) {
  const count = Children.toArray(children).length;
  const cols = count <= 1 ? LG_COLS[1] : `grid-cols-2 ${LG_COLS[Math.min(count, 4) as 2 | 3 | 4]}`;
  return (
    <div
      ref={ref}
      {...rest}
      className={cn("grid gap-3 [[data-surface=tablet]_&]:gap-4", cols, className)}
    >
      {children}
    </div>
  );
});
