import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib";
import { Link, type LinkProps } from "./Link";

/**
 * AttentionList / AttentionItem — CR-DESIGN-SYSTEM-035. A "needs attention" list: each row is ONE
 * kit <Link> with a tone-coloured icon chip, a bold title, a muted second line and an action label
 * with an arrow on the right. Rows are divided by a hairline (the list's own `divide-y`).
 *
 *  - One link per row, one Tab stop. Its accessible name is its visible text in reading order — the
 *    title first, then the detail and the action — so the name always contains the words on screen
 *    (WCAG 2.5.3 label in name; axe `label-content-name-mismatch` fails a name that is only the
 *    title, as it did for the menu counts in CR-DESIGN-SYSTEM-032 D-5). The chip is aria-hidden.
 *    A caller's own `aria-label` wins. See known-issues K-2.
 *  - The action words and their arrow are hidden under 480 px; the row stays a full-width link.
 *  - Words in the arrow are NOT accent text (unreadable in some themes): text stays `text-fg`, only
 *    the arrow takes the accent. Tone is never colour alone — the title says what is wrong.
 *  - The kit draws no words of its own: every string comes from the app. Use AttentionItem only
 *    inside an AttentionList (an orphan <li> is unsupported). No hook, so a server component can
 *    render it.
 */
export type AttentionItemTone = "default" | "warning" | "danger";

export type AttentionListProps = HTMLAttributes<HTMLUListElement>;

export const AttentionList = forwardRef<HTMLUListElement, AttentionListProps>(
  function AttentionList({ className, ...rest }, ref) {
    return (
      <ul
        ref={ref}
        {...rest}
        className={cn("m-0 list-none divide-y divide-border p-0", className)}
      />
    );
  },
);

export type AttentionItemProps = Omit<LinkProps, "children"> & {
  /** The bold first line; the start of the link's accessible name. */
  title: string;
  /** The muted second line. */
  detail?: ReactNode;
  /** Words on the right with an arrow, e.g. "Cold rooms". Hidden under 480 px. */
  actionLabel?: string;
  /** Default grey, warning amber, danger red. Colours the chip. */
  tone?: AttentionItemTone;
  /** Drawn in the chip (aria-hidden). None: warning/danger draw a small tone square. */
  icon?: ReactNode;
};

const ROW =
  "flex items-center gap-3 rounded-md px-1.5 py-2.5 text-fg no-underline hover:bg-surface-muted " +
  "focus-visible:outline-none focus-visible:shadow-focus [[data-surface=tablet]_&]:py-3";
const CHIP =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md [&_svg]:h-4 [&_svg]:w-4";
// Literal strings so every consumer's Tailwind scan sees them.
const CHIP_TONE = Object.freeze({
  default: "bg-surface-muted text-fg-muted",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
} as const);

export const AttentionItem = forwardRef<HTMLAnchorElement, AttentionItemProps>(
  function AttentionItem(
    { title, detail, actionLabel, tone = "default", icon, className, ...linkProps },
    ref,
  ) {
    const hasDetail = detail !== undefined && detail !== null && detail !== false;
    return (
      <li className="m-0 list-none p-0">
        <Link ref={ref} {...linkProps} className={cn(ROW, className)}>
          <span aria-hidden="true" className={cn(CHIP, CHIP_TONE[tone] ?? CHIP_TONE.default)}>
            {icon ??
              (tone === "warning" || tone === "danger" ? (
                <span className="block h-3 w-3 rounded-sm bg-current" />
              ) : null)}
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-sm font-semibold [overflow-wrap:anywhere] [[data-surface=tablet]_&]:text-base">
              {title}
            </span>{" "}
            {hasDetail ? (
              <span className="block text-xs text-fg-muted [[data-surface=tablet]_&]:text-sm">
                {detail}
              </span>
            ) : null}
          </span>{" "}
          {actionLabel ? (
            <span className="hidden items-center gap-1 whitespace-nowrap text-xs font-semibold text-fg min-[480px]:inline-flex [[data-surface=tablet]_&]:text-sm">
              {actionLabel}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent" />
            </span>
          ) : null}
        </Link>
      </li>
    );
  },
);
