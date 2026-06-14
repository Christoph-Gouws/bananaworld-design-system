"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib";

/**
 * Toast — UX-DS-012. Top-right; success auto-dismiss 3s; error persistent (dismiss-required).
 * Never include sensitive data beyond the alert summary (SEC-DATA-005, PRD-ERR-005).
 *
 * Mount `<ToastProvider>` once at the app shell. Open toasts via the `useToast()` hook (TBD)
 * or render directly under `<ToastProvider>` children.
 */
export const ToastProviderRoot = RadixToast.Provider;

const toastStyles = cva(
  [
    "group pointer-events-auto relative flex items-start gap-3",
    "w-full max-w-sm p-4 rounded-lg shadow-md",
    "bg-surface border",
    "data-[state=open]:animate-slide-up",
    "data-[state=closed]:animate-fade-out",
    "[[data-surface=tablet]_&]:p-5",
  ],
  {
    variants: {
      tone: {
        info: "border-border",
        success: "border-success/30 bg-success-subtle",
        warning: "border-warning/30 bg-warning-subtle",
        error: "border-danger/30 bg-danger-subtle",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

export interface ToastRootProps
  extends ComponentPropsWithoutRef<typeof RadixToast.Root>, VariantProps<typeof toastStyles> {}

export const ToastRoot = forwardRef<ElementRef<typeof RadixToast.Root>, ToastRootProps>(
  function ToastRoot({ className, tone, ...props }, ref) {
    return (
      <RadixToast.Root ref={ref} className={cn(toastStyles({ tone }), className)} {...props} />
    );
  },
);

export const ToastTitle = forwardRef<
  ElementRef<typeof RadixToast.Title>,
  ComponentPropsWithoutRef<typeof RadixToast.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return (
    <RadixToast.Title
      ref={ref}
      className={cn("text-sm font-semibold text-fg", className)}
      {...props}
    />
  );
});

export const ToastDescription = forwardRef<
  ElementRef<typeof RadixToast.Description>,
  ComponentPropsWithoutRef<typeof RadixToast.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <RadixToast.Description
      ref={ref}
      className={cn("text-sm text-fg-muted", className)}
      {...props}
    />
  );
});

export const ToastClose = forwardRef<
  ElementRef<typeof RadixToast.Close>,
  ComponentPropsWithoutRef<typeof RadixToast.Close>
>(function ToastClose({ className, ...props }, ref) {
  return (
    <RadixToast.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 inline-flex items-center justify-center",
        "h-7 w-7 rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg",
        "transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:shadow-focus",
        className,
      )}
      aria-label="Dismiss"
      {...props}
    >
      <X className="h-3.5 w-3.5" />
    </RadixToast.Close>
  );
});

export const ToastViewport = forwardRef<
  ElementRef<typeof RadixToast.Viewport>,
  ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <RadixToast.Viewport
      ref={ref}
      className={cn(
        "fixed top-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 m-0 list-none outline-none",
        "max-w-[420px] w-full",
        className,
      )}
      {...props}
    />
  );
});
