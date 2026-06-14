"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Provider as RadixToastProvider } from "@radix-ui/react-toast";
import { ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastViewport } from "./Toast";

export type ToastTone = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number; // null/undefined → tone-default (success 3000, others persistent)
}

interface ToastRecord extends ToastOptions {
  id: string;
}

function defaultDuration(tone: ToastTone): number {
  if (tone === "success") return 3000;
  if (tone === "info") return 5000;
  return Infinity;
}

const ToastDispatchContext = createContext<{ toast: (opts: ToastOptions) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastDispatchContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

/**
 * ToastProvider — mount once at each app shell root. Children render normally;
 * toasts dispatched via `useToast()` appear in the fixed top-right viewport.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const toast = useCallback((opts: ToastOptions) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, ...opts }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastDispatchContext.Provider value={value}>
      <RadixToastProvider swipeDirection="right">
        {children}
        {items.map((item) => {
          const tone = item.tone ?? "info";
          const duration = item.durationMs ?? defaultDuration(tone);
          return (
            <ToastRoot
              key={item.id}
              tone={tone}
              duration={duration === Infinity ? 1_000_000_000 : duration}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
            >
              <div className="flex-1 pr-6">
                <ToastTitle>{item.title}</ToastTitle>
                {item.description && <ToastDescription>{item.description}</ToastDescription>}
              </div>
              <ToastClose />
            </ToastRoot>
          );
        })}
        <ToastViewport />
      </RadixToastProvider>
    </ToastDispatchContext.Provider>
  );
}
