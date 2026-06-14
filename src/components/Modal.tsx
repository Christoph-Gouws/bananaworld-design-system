"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib";

/**
 * Modal — UX-DS-023 (focus management) + WCAG 2.1 AA. Built on Radix Dialog
 * for correct focus trap, focus restoration on close, Escape dismissal,
 * scroll-lock, and aria-* wiring.
 *
 * Usage:
 *   <Modal open={x} onOpenChange={setX}>
 *     <ModalContent>
 *       <ModalHeader>
 *         <ModalTitle>Title</ModalTitle>
 *         <ModalDescription>Sub-line.</ModalDescription>
 *       </ModalHeader>
 *       <div>Body</div>
 *       <ModalFooter>...</ModalFooter>
 *     </ModalContent>
 *   </Modal>
 */
export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export const ModalContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content> & { hideCloseButton?: boolean }
>(function ModalContent({ className, children, hideCloseButton, ...props }, ref) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-[var(--z-overlay)] bg-fg/40 backdrop-blur-[2px]",
          "animate-fade-in",
        )}
      />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg max-h-[85vh] overflow-auto",
          "bg-surface border border-border rounded-xl shadow-lg",
          "p-6 [[data-surface=tablet]_&]:p-8",
          "animate-slide-up",
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
              "[[data-surface=tablet]_&]:h-11 [[data-surface=tablet]_&]:w-11",
              "hover:bg-surface-muted hover:text-fg",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:shadow-focus",
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4 [[data-surface=tablet]_&]:h-5 [[data-surface=tablet]_&]:w-5" />
          </Dialog.Close>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  );
});

export function ModalHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-1.5 mb-4", className)}>{children}</div>;
}

export const ModalTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(function ModalTitle({ className, ...props }, ref) {
  return (
    <Dialog.Title
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight text-fg", className)}
      {...props}
    />
  );
});

export const ModalDescription = forwardRef<
  ElementRef<typeof Dialog.Description>,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(function ModalDescription({ className, ...props }, ref) {
  return (
    <Dialog.Description ref={ref} className={cn("text-sm text-fg-muted", className)} {...props} />
  );
});

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mt-6 flex items-center justify-end gap-2", className)}>{children}</div>
  );
}
