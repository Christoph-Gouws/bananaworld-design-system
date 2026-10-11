"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../lib";

/**
 * Navigation busy signal — CR-DESIGN-SYSTEM-018.
 *
 * Fed by the kit `Link` (which reads Next.js's own `useLinkStatus`), so it needs no Suspense boundary,
 * no `loading.tsx`, no history patching and no network. An app turns it on by mounting
 * `<NavigationBusyProvider>`; outside one the kit `Link` renders exactly what it always did.
 */

/** A navigation that lands sooner than this shows nothing, so quick page changes never flicker. */
export const NAVIGATION_BUSY_DELAY_MS = 150;
/** How long the bar stays "finished" (full width, fading) before it snaps back to idle. */
const DONE_MS = 250;

interface NavigationBusyContextValue {
  /** `+1` when a link's navigation starts pending, `-1` when it settles or the link unmounts. */
  report: (delta: 1 | -1) => void;
  /** True once any navigation has been pending for `NAVIGATION_BUSY_DELAY_MS`. */
  busy: boolean;
}

export const NavigationBusyContext = createContext<NavigationBusyContextValue | null>(null);

/** `value`, but only once it has been true for `ms`. Goes false immediately. */
export function useDelayedFlag(value: boolean, ms: number): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!value) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return value && shown;
}

/** Counts this link as pending for as long as `pending` is true (balanced on unmount). */
export function useReportNavigationPending(pending: boolean): void {
  const report = useContext(NavigationBusyContext)?.report;
  useEffect(() => {
    if (!report || !pending) return;
    report(1);
    return () => report(-1);
  }, [report, pending]);
}

export interface NavigationBusyProviderProps {
  children: ReactNode;
}

/** Context only: renders no DOM, so mounting it shifts nothing. */
export function NavigationBusyProvider({ children }: NavigationBusyProviderProps) {
  const [count, setCount] = useState(0);
  const report = useCallback((delta: 1 | -1) => setCount((c) => Math.max(0, c + delta)), []);
  const busy = useDelayedFlag(count > 0, NAVIGATION_BUSY_DELAY_MS);
  const value = useMemo(() => ({ report, busy }), [report, busy]);
  return <NavigationBusyContext.Provider value={value}>{children}</NavigationBusyContext.Provider>;
}

/** True while a navigation has been pending past the delay. For the consumer's `aria-busy`. */
export function useNavigationBusy(): boolean {
  return useContext(NavigationBusyContext)?.busy ?? false;
}

export interface NavigationBusyBarProps {
  /** Accessible name while busy. */
  label?: string;
  className?: string;
}

type BarPhase = "idle" | "busy" | "done";

const BAR_PHASE_CLASS: Record<BarPhase, string> = {
  idle: "scale-x-0 opacity-0",
  busy: "scale-x-[0.85] opacity-100 transition-transform duration-[8000ms] ease-out motion-reduce:scale-x-100 motion-reduce:transition-none",
  done: "scale-x-100 opacity-0 transition-[transform,opacity] duration-200 motion-reduce:transition-none",
};

/**
 * The thin accent bar. Place it as the first child of the content area. Its wrapper has zero height,
 * so it takes no space and never shifts layout; it sticks to the top of a scrolling content area.
 */
export function NavigationBusyBar({ label = "Loading page", className }: NavigationBusyBarProps) {
  const busy = useNavigationBusy();
  const [phase, setPhase] = useState<BarPhase>("idle");

  useEffect(() => {
    if (busy) {
      setPhase("busy");
      return;
    }
    setPhase((p) => (p === "busy" ? "done" : p));
  }, [busy]);

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => setPhase("idle"), DONE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const active = phase === "busy";
  return (
    <div
      data-navigation-busy-bar=""
      data-navigation-busy={active ? "true" : undefined}
      className={cn("pointer-events-none sticky top-0 z-[var(--z-sticky)] h-0", className)}
    >
      <div
        {...(active
          ? { role: "progressbar", "aria-label": label, "aria-busy": true }
          : { "aria-hidden": true })}
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] origin-left bg-accent [[data-surface=tablet]_&]:h-1",
          BAR_PHASE_CLASS[phase],
        )}
      />
    </div>
  );
}
