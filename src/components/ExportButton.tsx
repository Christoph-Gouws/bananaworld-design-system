"use client";

import { forwardRef } from "react";
import { Download } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { useToast } from "./ToastProvider";

/**
 * ExportButton — UX-DS-014 shell. At M006 the onClick shows a Toast indicating
 * that the real signed-URL download wires at EPIC-008-M005 (API-EP-057/058/067).
 *
 * Once EPIC-008 lands, this component will accept a `downloadUrl` / `fetchUrl`
 * prop and trigger the real signed-URL download via the standard browser
 * download flow.
 */
export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportButtonProps extends Omit<ButtonProps, "variant" | "onClick"> {
  format: ExportFormat;
  reportType: string; // e.g. "pallet-age", "loss-and-variance"
}

function formatLabel(format: ExportFormat): string {
  switch (format) {
    case "csv":
      return "Export CSV";
    case "excel":
      return "Export Excel";
    case "pdf":
      return "Export PDF";
  }
}

export const ExportButton = forwardRef<HTMLButtonElement, ExportButtonProps>(function ExportButton(
  { format, reportType, children, ...props },
  ref,
) {
  const { toast } = useToast();
  const label = formatLabel(format);
  return (
    <Button
      ref={ref}
      variant="secondary"
      onClick={() =>
        toast({
          title: "Export coming soon",
          description: `${label} for "${reportType}" wires up at EPIC-008-M005 (BI refresh + CSV export Milestone).`,
          tone: "info",
        })
      }
      {...props}
    >
      <Download className="h-4 w-4" />
      {children ?? label}
    </Button>
  );
});
