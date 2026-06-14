"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import NextLink from "next/link";
import { useSurface } from "../lib";
import { cn } from "../lib";

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
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, prefetch, ...props },
  ref,
) {
  const surface = useSurface();
  const resolvedPrefetch = prefetch ?? (surface === "tablet" ? false : undefined);
  return (
    <NextLink
      ref={ref}
      prefetch={resolvedPrefetch}
      className={cn(
        "text-fg underline-offset-2 hover:text-accent transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:shadow-focus rounded-sm",
        className,
      )}
      {...props}
    />
  );
});
