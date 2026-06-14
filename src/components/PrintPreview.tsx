"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalTrigger,
} from "./Modal";
import { Button } from "./Button";
import { useToast } from "./ToastProvider";
import { cn } from "../lib";

/**
 * PrintPreview — UX-DS-015 surface.
 *
 * At M006 this primitive shipped as a shell that opened a static `pdfUrl` in
 * `window.open` and showed a "wires at EPIC-001-M008" toast. At M008 the shell is wired
 * to the real print abstraction (TECH-COMP-007) and the audit-logged re-print path
 * (UX-PRINCIPLE-011). KI-M006-004 PRINT-PREVIEW-STUB closes at M008.
 *
 * Two consumer patterns are supported — the component picks based on which prop the
 * caller provides:
 *
 *   1. `pdfUrl` (back-compat) — the caller passes a pre-baked PDF URL. The modal renders
 *      it in the iframe and the Print + Re-print buttons re-open the URL. Used by the
 *      design-system gallery's simple-preview demo + any consumer that already has a
 *      signed URL.
 *
 *   2. `documentSpec` (new at M008) — the caller passes a `{format, body}` payload. On
 *      open (or on Re-print) the component POSTs to `/api/print/{format}` and renders
 *      the returned signed URL in the iframe. The `audit_event_id` returned by the
 *      endpoint is surfaced in the success toast.
 *
 * Consumer signatures preserved from M006: existing call sites that pass `pdfUrl` work
 * unchanged. The `documentSpec` prop is purely additive.
 */
export type PrintPreviewFormat = "delivery-receipt" | "pallet-label";

export interface PrintPreviewDocumentSpec {
  /** Which Route Handler to call: `/api/print/{format}`. */
  readonly format: PrintPreviewFormat;
  /** Request body forwarded to the Route Handler. At M008 callers typically send `{useSampleData: true, warehouse_id}`. */
  readonly body: Record<string, unknown>;
  /** Optional bearer token override; if absent, the browser includes the session cookie via `credentials: 'include'`. */
  readonly authToken?: string;
}

export interface PrintPreviewProps {
  /** Pre-baked PDF URL — back-compat path (M006 consumers). */
  pdfUrl?: string;
  /** Print-abstraction call descriptor — new at M008. Pass one or the other. */
  documentSpec?: PrintPreviewDocumentSpec | null;
  title: string;
  description?: string;
  trigger: React.ReactNode;
}

type PrintPreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; signedUrl: string; auditEventId: string | null }
  | { status: "error"; message: string };

export function PrintPreview({
  pdfUrl,
  documentSpec,
  title,
  description,
  trigger,
}: PrintPreviewProps) {
  const [open, setOpen] = useState(false);
  // Initial state depends on which consumer pattern is in use. The pdfUrl path is
  // immediately "ready"; the documentSpec path starts "idle" and transitions to
  // "loading" when the modal opens.
  const initialState: PrintPreviewState =
    pdfUrl !== undefined
      ? { status: "ready", signedUrl: pdfUrl, auditEventId: null }
      : { status: "idle" };
  const [state, setState] = useState<PrintPreviewState>(initialState);
  const { toast } = useToast();

  // Track which action triggered the current generation so the success toast can say
  // "Print queued" vs "Re-print queued".
  const lastActionRef = useRef<"print" | "reprint">("print");

  const generate = useCallback(
    async (action: "print" | "reprint") => {
      if (documentSpec === undefined || documentSpec === null) return;
      lastActionRef.current = action;
      setState({ status: "loading" });
      try {
        const response = await fetch(`/api/print/${documentSpec.format}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(documentSpec.authToken !== undefined
              ? { Authorization: `Bearer ${documentSpec.authToken}` }
              : {}),
          },
          body: JSON.stringify({ ...documentSpec.body, action }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: { message?: string };
          };
          const message = payload.error?.message ?? `Print request failed (${response.status}).`;
          setState({ status: "error", message });
          toast({
            title: action === "reprint" ? "Re-print failed" : "Print failed",
            description: message,
            tone: "error",
          });
          return;
        }
        const body = (await response.json()) as {
          signed_url: string;
          audit_event_id: string;
          outcome: string;
          reason?: string;
        };
        setState({
          status: "ready",
          signedUrl: body.signed_url,
          auditEventId: body.audit_event_id,
        });
        toast({
          title: action === "reprint" ? "Re-print ready" : "Print ready",
          description:
            body.outcome === "pdf-fallback"
              ? `PDF generated; network printer ${body.reason ?? "unavailable"}. Audit event ${body.audit_event_id}.`
              : `PDF generated. Audit event ${body.audit_event_id}.`,
          tone: "info",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Print request failed.";
        setState({ status: "error", message });
        toast({
          title: action === "reprint" ? "Re-print failed" : "Print failed",
          description: message,
          tone: "error",
        });
      }
    },
    [documentSpec, toast],
  );

  // documentSpec consumer pattern: kick off the first generation on open.
  useEffect(() => {
    if (open === false) return;
    if (pdfUrl !== undefined) return;
    if (documentSpec === undefined || documentSpec === null) return;
    if (state.status !== "idle") return;
    void generate("print");
  }, [open, pdfUrl, documentSpec, state.status, generate]);

  // pdfUrl consumer pattern: the M006 behaviour — re-open the URL on click. Now also
  // audit-aware via the same endpoint when documentSpec is present.
  const handleClick = (action: "print" | "reprint") => {
    if (documentSpec !== undefined && documentSpec !== null) {
      void generate(action);
      return;
    }
    // pdfUrl-only path: M006 behaviour preserved.
    if (state.status === "ready") {
      window.open(state.signedUrl, "_blank", "noopener");
      toast({
        title: action === "reprint" ? "Re-print opened" : "Print opened",
        description: "Static PDF preview re-opened. Wire `documentSpec` for audit-logged print.",
        tone: "info",
      });
    }
  };

  const iframeSrc = state.status === "ready" ? state.signedUrl : undefined;
  let iframeLoadingMessage: string | null = null;
  if (state.status === "loading") {
    iframeLoadingMessage = "Generating PDF…";
  } else if (state.status === "error") {
    iframeLoadingMessage = state.message;
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{trigger}</ModalTrigger>
      <ModalContent className="max-w-3xl">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <div
          className={cn(
            "w-full border border-border rounded-md overflow-hidden bg-surface-sunken",
            "h-[60vh]",
          )}
          aria-busy={state.status === "loading"}
        >
          {iframeSrc !== undefined ? (
            <iframe src={iframeSrc} title={title} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-foreground-muted px-6 text-center">
              {iframeLoadingMessage ?? "Open print preview to generate the PDF."}
            </div>
          )}
        </div>
        <ModalFooter>
          <Button
            variant="tertiary"
            onClick={() => handleClick("reprint")}
            disabled={state.status === "loading"}
          >
            <RotateCcw className="h-4 w-4" /> Re-print
          </Button>
          <Button
            variant="primary"
            onClick={() => handleClick("print")}
            disabled={state.status === "loading"}
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
