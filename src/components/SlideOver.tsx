"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib";

/**
 * SlideOver — the canonical right-anchored side panel (EPIC-002-M003).
 *
 * Built on the same Radix Dialog as Modal, so it inherits the correct focus trap, focus
 * restoration on close, Escape dismissal, scroll-lock, and aria wiring for free. Used for
 * create/edit forms where keeping the list visible behind the panel matters (the canonical
 * master-edit pattern). For centred confirmation dialogs use Modal instead.
 *
 * Composition mirrors Modal:
 *   <SlideOver open={x} onOpenChange={setX}>
 *     <SlideOverContent>
 *       <SlideOverHeader>
 *         <SlideOverTitle>New Item</SlideOverTitle>
 *         <SlideOverDescription>…</SlideOverDescription>
 *       </SlideOverHeader>
 *       <SlideOverBody>…fields…</SlideOverBody>
 *       <SlideOverFooter>…actions…</SlideOverFooter>
 *     </SlideOverContent>
 *   </SlideOver>
 */
export const SlideOver = Dialog.Root;
export const SlideOverTrigger = Dialog.Trigger;
export const SlideOverClose = Dialog.Close;

export const SlideOverContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content> & { hideCloseButton?: boolean }
>(function SlideOverContent({ className, children, hideCloseButton, ...props }, ref) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-[var(--z-overlay)] bg-fg/40 backdrop-blur-[2px]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 right-0 z-[var(--z-modal)]",
          "flex h-full w-full max-w-md flex-col",
          "bg-surface border-l border-border shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-200",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-150",
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <Dialog.Close
            className={cn(
              "absolute right-4 top-4 inline-flex items-center justify-center",
              "h-8 w-8 rounded-md text-fg-muted",
              "hover:bg-surface-muted hover:text-fg",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:shadow-focus",
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  );
});

export function SlideOverHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("shrink-0 border-b border-border px-6 py-4 pr-12", className)}>
      {children}
    </div>
  );
}

export const SlideOverTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(function SlideOverTitle({ className, ...props }, ref) {
  return (
    <Dialog.Title
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight text-fg", className)}
      {...props}
    />
  );
});

export const SlideOverDescription = forwardRef<
  ElementRef<typeof Dialog.Description>,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(function SlideOverDescription({ className, ...props }, ref) {
  return (
    <Dialog.Description
      ref={ref}
      className={cn("mt-1 text-sm text-fg-muted", className)}
      {...props}
    />
  );
});

// Scrollable body region — fills the space between header and footer.
export function SlideOverBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)}>{children}</div>;
}

export function SlideOverFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border px-6 py-4",
        "flex items-center justify-end gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
