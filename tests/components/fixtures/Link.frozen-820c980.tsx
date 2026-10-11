"use client";

// FROZEN COPY of src/components/Link.tsx at 820c980 (before CR-DESIGN-SYSTEM-018), renamed FrozenLink.
// Used only by Link.additive.test.tsx to prove the new Link renders the same markup outside a provider.
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import NextLink from "next/link";
import { useSurface } from "../../../src/lib";
import { cn } from "../../../src/lib";

type NextLinkProps = ComponentPropsWithoutRef<typeof NextLink>;

export interface FrozenLinkProps extends Omit<NextLinkProps, "prefetch"> {
  prefetch?: boolean;
}

export const FrozenLink = forwardRef<HTMLAnchorElement, FrozenLinkProps>(function FrozenLink(
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
