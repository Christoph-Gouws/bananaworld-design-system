"use client";

import { forwardRef, useContext, type ComponentPropsWithoutRef } from "react";
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

/** Must render inside NextLink: that is where `useLinkStatus` can see the navigation. */
function LinkPendingMark({ show }: { show: boolean }) {
  const { pending } = useLinkStatus();
  useReportNavigationPending(pending);
  const delayed = useDelayedFlag(pending && show, NAVIGATION_BUSY_DELAY_MS);
  if (!delayed) return null;
  // Zero width: the link's text and anything after it never move.
  return (
    <span
      aria-hidden="true"
      data-link-pending=""
      className="relative inline-block h-0 w-0 align-middle"
    >
      <span className="absolute left-1 top-0 -mt-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-fg-subtle motion-reduce:animate-none [[data-surface=tablet]_&]:-mt-2 [[data-surface=tablet]_&]:h-4 [[data-surface=tablet]_&]:w-4" />
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
