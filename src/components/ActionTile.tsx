"use client";

import { forwardRef, type ButtonHTMLAttributes, type ForwardedRef } from "react";
import { cn } from "../lib";
import { Icon, type IconProps } from "./Icon";
import { Link, type LinkProps } from "./Link";

/**
 * ActionTile — CR-DESIGN-SYSTEM-021. A large tappable tile: icon above a short label, optional hint
 * and count badge. A real <button>, or the kit's <Link> when `href` is given (`href` + `disabled`
 * is a disabled button: an anchor cannot be disabled). It fills its grid cell and sets no grid of
 * its own; the label wraps rather than truncating.
 *
 * The accessible name is the tile's own visible text (label, count, hint), so what is read out is
 * what is drawn (WCAG 2.5.3 Label in Name). An app may still pass its own `aria-label`.
 */
type ActionTileOwnProps = {
  icon: IconProps["as"];
  label: string;
  hint?: string;
  /** Rendered whenever a number is given (0 included). */
  count?: number;
  variant?: "default" | "primary";
  disabled?: boolean;
};

export type ActionTileProps =
  | (ActionTileOwnProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> & { href?: undefined })
  | (ActionTileOwnProps & Omit<LinkProps, "children" | "href"> & { href: string });

const TILE_BASE =
  "relative flex h-full w-full min-h-[86px] flex-col items-center justify-center gap-1.5 rounded-lg border p-3 " +
  "text-center text-base font-semibold leading-tight whitespace-normal [overflow-wrap:anywhere] " +
  "touch-manipulation select-none transition-colors duration-fast " +
  "focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50";
// Each variant states its own hover text colour so the Link path's `hover:text-accent` never wins.
const VARIANTS = {
  default:
    "bg-surface text-fg border-border hover:text-fg hover:bg-surface-muted hover:border-border-strong active:bg-surface-sunken",
  primary: "bg-fg text-surface border-fg hover:text-surface hover:bg-fg/90",
} as const;

type TileBodyProps = Pick<ActionTileOwnProps, "icon" | "label" | "hint" | "count">;

// The {" "} text nodes are invisible in the flex column but keep the label, count and hint apart
// when the browser joins them into the accessible name.
function TileBody({ icon, label, hint, count }: TileBodyProps) {
  return (
    <>
      <Icon as={icon} size="lg" />
      <span>{label}</span>{" "}
      {typeof count === "number" ? (
        <span className="absolute right-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold tabular-nums text-fg-on-accent">
          {count}
        </span>
      ) : null}{" "}
      {hint ? <span className="text-sm font-normal opacity-80">{hint}</span> : null}
    </>
  );
}

export const ActionTile = forwardRef<HTMLButtonElement | HTMLAnchorElement, ActionTileProps>(
  function ActionTile(props, ref) {
    const { icon, label, hint, count, variant = "default", disabled, className, ...rest } = props;
    const classes = cn(TILE_BASE, VARIANTS[variant], className);
    const body = <TileBody icon={icon} label={label} hint={hint} count={count} />;

    if ("href" in rest && typeof rest.href === "string" && !disabled) {
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          {...(rest as Omit<LinkProps, "children">)}
          className={classes}
        >
          {body}
        </Link>
      );
    }
    // `href` + `disabled` lands here too: href is stripped so the button never carries it.
    const { href: _href, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
      href?: string;
    };
    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        {...buttonProps}
        disabled={disabled}
        className={classes}
      >
        {body}
      </button>
    );
  },
);
