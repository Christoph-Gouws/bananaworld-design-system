"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib";

/**
 * Sheet — the canonical bottom-anchored slide-up panel (EPIC-003-M001).
 *
 * A sibling of SlideOver (which anchors right): same Radix Dialog foundation, so it inherits the
 * focus trap, focus restoration, Escape dismissal, scroll-lock, and aria wiring for free. The sheet
 * rises from the bottom and covers the viewport BELOW the app header (top = --layout-header-height),
 * full width — so a large document form (e.g. the Purchase Order editor) opens without it feeling
 * like a separate page: the app header stays visible and undimmed above the sheet (owner decision
 * 2026-05-31). For right-anchored master-edit forms use SlideOver; for centred confirmations, Modal.
 *
 * Composition mirrors SlideOver:
 *   <Sheet open={x} onOpenChange={setX}>
 *     <SheetContent>
 *       <SheetHeader>
 *         <SheetTitle>New Purchase Order</SheetTitle>
 *         <SheetDescription>…</SheetDescription>
 *       </SheetHeader>
 *       <SheetBody>…fields…</SheetBody>
 *       <SheetFooter>…actions…</SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */
export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export const SheetContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content> & { hideCloseButton?: boolean }
>(function SheetContent({ className, children, hideCloseButton, ...props }, ref) {
  return (
    <Dialog.Portal>
      {/* Overlay starts below the app header so the header stays crisp + visible (owner decision). */}
      <Dialog.Overlay
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--layout-header-height)] z-[var(--z-overlay)]",
          "bg-fg/40 backdrop-blur-[2px]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--layout-header-height)] z-[var(--z-modal)]",
          "flex flex-col",
          "bg-surface border-t border-border rounded-t-xl shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-200",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-150",
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

export function SheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0 border-b border-border px-6 py-4 pr-12", className)}>
      {children}
    </div>
  );
}

export const SheetTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <Dialog.Title
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight text-fg", className)}
      {...props}
    />
  );
});

export const SheetDescription = forwardRef<
  ElementRef<typeof Dialog.Description>,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <Dialog.Description
      ref={ref}
      className={cn("mt-1 text-sm text-fg-muted", className)}
      {...props}
    />
  );
});

// Scrollable body region — fills the space between header and footer.
//   • "document" (default) — centred at a comfortable max-w-7xl so dense line tables lay out without
//     wrapping (PO / sales order; EPIC-009-M002 REF-016).
//   • "full" — no width cap; the form manages its own section widths (e.g. the receipt keeps its top
//     details narrow but lets the wide pallet-entry table use the whole sheet; REF-010).
export function SheetBody({
  children,
  className,
  width = "document",
}: {
  children: ReactNode;
  className?: string;
  width?: "document" | "full";
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-6", className)}>
      <div className={cn("w-full", width === "document" && "mx-auto max-w-7xl")}>{children}</div>
    </div>
  );
}

export function SheetFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border bg-surface px-6 py-4",
        "flex items-center justify-end gap-2",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-2">{children}</div>
    </div>
  );
}
