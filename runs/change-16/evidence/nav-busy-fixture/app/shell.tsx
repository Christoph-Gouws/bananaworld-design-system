"use client";

import { useState, type ReactNode } from "react";
import {
  Link,
  NavigationBusyBar,
  NavigationBusyProvider,
  SurfaceProvider,
  useNavigationBusy,
} from "@bananaworld/design-system";

function Content({ children }: { children: ReactNode }) {
  const busy = useNavigationBusy();
  return (
    <main aria-busy={busy} className="relative h-screen flex-1 overflow-auto">
      <NavigationBusyBar />
      <div className="p-6">{children}</div>
    </main>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  // Read once, so the choice survives client navigations that drop the query string.
  const [tablet] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("tablet"),
  );
  return (
    <SurfaceProvider surface={tablet ? "tablet" : "browser"}>
      <NavigationBusyProvider>
        <div className="flex">
          <nav className="flex h-screen w-56 flex-col gap-3 border-r border-border bg-surface p-4">
            <Link href="/">Home</Link>
            <Link href="/slow">Slow page (1.5 s)</Link>
            <Link href="/fast">Fast page</Link>
            <Link href="/action">Action page</Link>
            <Link href="/slow?x=1" pendingIndicator={false}>
              Slow, no spinner
            </Link>
          </nav>
          <Content>{children}</Content>
        </div>
      </NavigationBusyProvider>
    </SurfaceProvider>
  );
}
