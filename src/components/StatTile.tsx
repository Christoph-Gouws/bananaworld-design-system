import {
  Children,
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
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
 *  - CR-DESIGN-SYSTEM-035 (ADDITIVE, all optional): `tone` tints the tile, `labelCase="normal"` draws
 *    the label as given, `linkLabel` puts words with an arrow at the foot of a LINKED tile (the tile
 *    stays one link; the words are part of its visible name). A caller's own colour classes on a
 *    toned tile are unsupported.
 */
export interface StatTileWords {
  readonly empty: string;
}

export type StatTileTone = "default" | "warning" | "danger" | "success";
export type StatTileLabelCase = "upper" | "normal";

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
  /**
   * Tints the tile. warning: amber border + soft fill, icon amber. danger: red border + soft fill,
   * icon and value red. success: soft green. Absent or "default" = as before.
   */
  tone?: StatTileTone;
  /** "normal" draws the label as given (no capitals, no letter spacing). Absent or "upper" = as before. */
  labelCase?: StatTileLabelCase;
  words?: Partial<StatTileWords>;
};

/** Words at the foot of a LINKED tile, with a small arrow. Part of the one link's text. */
type StatTileFoot = { linkLabel?: string };

export type StatTileProps =
  | (StatTileOwnProps &
      Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
        href?: undefined;
        linkLabel?: undefined;
      })
  | (StatTileOwnProps & StatTileFoot & Omit<LinkProps, "children" | "href"> & { href: string });

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

// CR-DESIGN-SYSTEM-035 — new literals only, used when the new prop is not its default. TILE, LINKED,
// LABEL, ICON and VALUE above are untouched, so a caller passing none of the new props renders as
// before. Literal strings (not built up) so every consumer's Tailwind scan sees them.
const LABEL_NORMAL =
  "flex items-center gap-1.5 text-xs font-semibold text-fg-muted [overflow-wrap:anywhere] " +
  "[[data-surface=tablet]_&]:text-sm";
const TONE = Object.freeze({
  warning:
    "border-[color:color-mix(in_srgb,var(--color-warning)_50%,var(--color-surface))] bg-[color:color-mix(in_srgb,var(--color-warning-subtle)_40%,var(--color-surface))]",
  danger:
    "border-[color:color-mix(in_srgb,var(--color-danger)_50%,var(--color-surface))] bg-[color:color-mix(in_srgb,var(--color-danger-subtle)_40%,var(--color-surface))]",
  success:
    "border-[color:color-mix(in_srgb,var(--color-success)_50%,var(--color-surface))] bg-[color:color-mix(in_srgb,var(--color-success-subtle)_40%,var(--color-surface))]",
} as const);
// A toned linked tile keeps its tint on hover (hover:bg-surface-muted would wipe the meaning).
const LINKED_TONE = Object.freeze({
  warning:
    "transition-colors duration-fast hover:border-warning hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
  danger:
    "transition-colors duration-fast hover:border-danger hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
  success:
    "transition-colors duration-fast hover:border-success hover:text-fg focus-visible:outline-none focus-visible:shadow-focus",
} as const);
const TONE_ICON = Object.freeze({ warning: "text-warning", danger: "text-danger" } as const);
const FOOT =
  "mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-fg [[data-surface=tablet]_&]:text-sm";

type ToneKey = "warning" | "danger" | "success";
function toneKeyOf(tone: StatTileTone | undefined): ToneKey | null {
  return tone === "warning" || tone === "danger" || tone === "success" ? tone : null;
}

function TileFoot({ linkLabel }: { linkLabel: string }) {
  return (
    <>
      {" "}
      <span className={FOOT}>
        {linkLabel}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent" />
      </span>
    </>
  );
}

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
  tone,
  labelCase,
  linkLabel,
}: StatTileOwnProps & StatTileFoot & { linked: boolean }) {
  const empty = value === null || value === "";
  const emptyWord = words?.empty ?? DEFAULT_WORDS.empty;
  const toneKey = toneKeyOf(tone);
  const iconTone = toneKey === "warning" || toneKey === "danger" ? TONE_ICON[toneKey] : null;
  const footed = linked && Boolean(linkLabel);
  return (
    <>
      {accent ? (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-accent" />
      ) : null}
      {linked && !footed ? (
        <ChevronRight
          aria-hidden="true"
          className="absolute right-2 top-3 h-4 w-4 text-fg-subtle [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5"
        />
      ) : null}
      <p className="m-0">
        <span
          className={cn(labelCase === "normal" ? LABEL_NORMAL : LABEL, linked && !footed && "pr-5")}
        >
          {icon ? (
            <span aria-hidden="true" className={cn(ICON, iconTone)}>
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
          <span className={cn(VALUE, toneKey === "danger" && "text-danger")}>
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
      {footed ? <TileFoot linkLabel={linkLabel!} /> : null}
    </>
  );
}

export const StatTile = forwardRef<HTMLDivElement | HTMLAnchorElement, StatTileProps>(
  function StatTile(props, ref) {
    const { label, value, unit, icon, sub, accent, words, tone, labelCase, className, ...rest } =
      props;
    const toneKey = toneKeyOf(tone);
    const body = { label, value, unit, icon, sub, accent, words, tone, labelCase };

    if ("href" in rest && typeof rest.href === "string") {
      const { linkLabel, ...linkProps } = rest as Omit<LinkProps, "children"> & StatTileFoot;
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          {...linkProps}
          className={cn(
            TILE,
            toneKey ? LINKED_TONE[toneKey] : LINKED,
            toneKey && TONE[toneKey],
            linkLabel && "flex flex-col",
            className,
          )}
        >
          <TileBody {...body} linkLabel={linkLabel} linked />
        </Link>
      );
    }
    const {
      href: _href,
      linkLabel: _linkLabel,
      ...divProps
    } = rest as HTMLAttributes<HTMLDivElement> & { href?: undefined; linkLabel?: undefined };
    return (
      <div
        ref={ref as ForwardedRef<HTMLDivElement>}
        {...divProps}
        className={cn(TILE, toneKey && TONE[toneKey], className)}
      >
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
