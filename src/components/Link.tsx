"use client";

import {
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import NextLink, * as nextLinkModule from "next/link";
import { useSurface } from "../lib";
import { cn } from "../lib";
import {
  NAVIGATION_BUSY_DELAY_MS,
  NavigationBusyContext,
  useDelayedFlag,
  useReportNavigationPending,
} from "./NavigationBusy";

/**
 * Link — UX-DS-022. Wraps Next.js Link with surface-aware prefetch:
 *   - browser admin: prefetch on hover/focus (default Next.js behaviour)
 *   - tablet PWA: prefetch=false to preserve offline-queue bandwidth + battery
 *
 * Use this for every internal navigation. External links can use plain <a>.
 */
type NextLinkProps = ComponentPropsWithoutRef<typeof NextLink>;

export interface LinkProps extends Omit<NextLinkProps, "prefetch"> {
  /** Override the per-surface default. */
  prefetch?: boolean;
  /**
   * Show a spinner while this link's navigation is pending. Only applies inside a
   * `NavigationBusyProvider` (default true there); `false` hides the spinner but the link still
   * feeds the top bar. CR-DESIGN-SYSTEM-018.
   */
  pendingIndicator?: boolean;
}

// `useLinkStatus` exists from next 15.3. Resolved off the namespace so an older `next` gets a bar
// that never shows rather than a crash.
const useLinkStatus: () => { pending: boolean } =
  "useLinkStatus" in nextLinkModule ? nextLinkModule.useLinkStatus : () => ({ pending: false });

const RING =
  "absolute left-1 top-0 -mt-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-fg-subtle motion-reduce:animate-none [[data-surface=tablet]_&]:-mt-2 [[data-surface=tablet]_&]:h-4 [[data-surface=tablet]_&]:w-4";

/** The box of the link's first visible text (its last line), or null. Skips the mark and sr-only text. */
function firstTextRect(anchor: HTMLElement, mark: HTMLElement): DOMRect | null {
  const walker = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (mark.contains(node) || !node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 1);
    if (rects.length) return rects[rects.length - 1]!;
  }
  return null;
}

/**
 * Put an out-of-flow mark just after the link's words (or past its end edge when it has no visible
 * text), vertically centred. A transform from the mark's own static position: nothing else moves.
 */
function placeAfterText(mark: HTMLElement, anchor: HTMLElement) {
  mark.style.transform = "none";
  const origin = mark.getBoundingClientRect();
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const box = firstTextRect(anchor, mark) ?? anchor.getBoundingClientRect();
  const ring = (mark.firstElementChild as HTMLElement | null)?.offsetWidth ?? 12;
  // The ring sits 4px in from the mark (`left-1`) and 4px clear of the text.
  const x = rtl ? box.left - ring - 8 : box.right;
  const y = box.top + box.height / 2;
  mark.style.transform = `translate(${String(x - origin.left)}px, ${String(y - origin.top)}px)`;
}

/** Must render inside NextLink: that is where `useLinkStatus` can see the navigation. */
function LinkPendingMark({ show }: { show: boolean }) {
  const { pending } = useLinkStatus();
  useReportNavigationPending(pending);
  const delayed = useDelayedFlag(pending && show, NAVIGATION_BUSY_DELAY_MS);
  const markRef = useRef<HTMLSpanElement>(null);
  const [outOfFlow, setOutOfFlow] = useState(false);
  // Before paint: a mark that is a flex/grid item or ends a block would move its siblings, so
  // anywhere but a plain inline link it leaves the flow (CR-DESIGN-SYSTEM-022).
  useLayoutEffect(() => {
    const mark = markRef.current;
    const anchor = mark?.parentElement;
    if (!mark || !anchor) return;
    const leaves = getComputedStyle(anchor).display !== "inline";
    if (leaves !== outOfFlow) {
      setOutOfFlow(leaves);
      return;
    }
    if (leaves) placeAfterText(mark, anchor);
    else mark.style.transform = "";
  }, [delayed, outOfFlow]);
  if (!delayed) return null;
  if (outOfFlow) {
    return (
      <span
        ref={markRef}
        aria-hidden="true"
        data-link-pending=""
        data-link-pending-placement="out-of-flow"
        className="pointer-events-none absolute h-0 w-0"
      >
        <span className={RING} />
      </span>
    );
  }
  // Inline link: zero width, in flow, so the text and anything after it never move.
  return (
    <span
      ref={markRef}
      aria-hidden="true"
      data-link-pending=""
      className="relative inline-block h-0 w-0 align-middle"
    >
      <span className={RING} />
    </span>
  );
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, prefetch, pendingIndicator, ...props },
  ref,
) {
  const surface = useSurface();
  const busyContext = useContext(NavigationBusyContext);
  const resolvedPrefetch = prefetch ?? (surface === "tablet" ? false : undefined);
  const classes = cn(
    "text-fg underline-offset-2 hover:text-accent transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:shadow-focus rounded-sm",
    className,
  );
  // No provider (or legacyBehavior, which needs exactly one child): exactly the tree this link has
  // always rendered, so an app that has not mounted a NavigationBusyProvider sees no change.
  if (!busyContext || props.legacyBehavior) {
    return <NextLink ref={ref} prefetch={resolvedPrefetch} className={classes} {...props} />;
  }
  return (
    <NextLink ref={ref} prefetch={resolvedPrefetch} className={classes} {...props}>
      {props.children}
      <LinkPendingMark show={pendingIndicator !== false} />
    </NextLink>
  );
});
