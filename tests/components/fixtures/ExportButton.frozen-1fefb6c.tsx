"use client";

// Frozen copy of src/components/ExportButton.tsx at 1fefb6c (CR-DC-247), renamed. CR-DESIGN-SYSTEM-020
// compares the live component against it to prove every no-`href` caller renders byte-identically.
import { forwardRef } from "react";
import { Download } from "lucide-react";
import { Button, type ButtonProps } from "../../../src/components/Button";
import { useToast } from "../../../src/components/ToastProvider";

export type FrozenExportFormat = "csv" | "excel" | "pdf";

export interface FrozenExportButtonProps extends Omit<ButtonProps, "variant" | "onClick"> {
  format: FrozenExportFormat;
  reportType: string;
}

function formatLabel(format: FrozenExportFormat): string {
  switch (format) {
    case "csv":
      return "Export CSV";
    case "excel":
      return "Export Excel";
    case "pdf":
      return "Export PDF";
  }
}

export const FrozenExportButton = forwardRef<HTMLButtonElement, FrozenExportButtonProps>(
  function FrozenExportButton({ format, reportType, children, ...props }, ref) {
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
  },
);
