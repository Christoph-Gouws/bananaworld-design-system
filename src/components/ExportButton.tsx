"use client";

import { forwardRef } from "react";
import { Download } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { useToast } from "./ToastProvider";

/**
 * ExportButton — UX-DS-014.
 *
 * Without `href` it is the original shell: the click shows a Toast saying the real download
 * wires at EPIC-008-M005. With `href` it is a plain browser download (`<a href download>`);
 * the package makes no network call, the browser fetches the file (TECH-COMP-003).
 * With `href` and `disabled`/`inflight` it is a disabled button (an anchor cannot be disabled).
 * `children` replace the default English label so apps can translate it.
 *
 * The forwarded ref is attached to the `<button>` variants only; the link renders an `<a>`.
 */
export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportButtonProps extends Omit<ButtonProps, "variant" | "onClick"> {
  format: ExportFormat;
  reportType: string; // e.g. "pallet-age", "loss-and-variance"
  /** Where the file is. A non-empty string switches to the download link; empty or absent keeps the toast. */
  href?: string;
  /** Suggested file name for the download. Ignored without `href`. */
  fileName?: string;
}

type LinklessProps = Omit<ExportButtonProps, "href" | "fileName">;

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

// 44px minimum on touch screens; the browser size (36px) is unchanged for mouse users.
const TOUCH_TARGET = "[@media(pointer:coarse)]:min-h-11";

const touchClass = (className?: string) => [TOUCH_TARGET, className].filter(Boolean).join(" ");

const ExportToastButton = forwardRef<HTMLButtonElement, LinklessProps>(function ExportToastButton(
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

const ExportUnavailableButton = forwardRef<HTMLButtonElement, LinklessProps>(
  function ExportUnavailableButton(
    { format, reportType: _reportType, children, className, ...props },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        variant="secondary"
        type="button"
        {...props}
        disabled
        className={touchClass(className)}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {children ?? formatLabel(format)}
      </Button>
    );
  },
);

function ExportDownloadLink({
  format,
  reportType: _reportType,
  children,
  className,
  href,
  fileName,
  ...props
}: LinklessProps & { href: string; fileName?: string }) {
  return (
    <Button variant="secondary" {...props} className={touchClass(className)} asChild>
      {/* download="" keeps it a save (the server's name stands) when no fileName is given */}
      <a href={href} download={fileName ?? ""}>
        <Download className="h-4 w-4" aria-hidden="true" />
        {children ?? formatLabel(format)}
      </a>
    </Button>
  );
}

export const ExportButton = forwardRef<HTMLButtonElement, ExportButtonProps>(function ExportButton(
  { href, fileName, ...props },
  ref,
) {
  if (!href) return <ExportToastButton ref={ref} {...props} />;
  if (props.disabled || props.inflight) return <ExportUnavailableButton ref={ref} {...props} />;
  return <ExportDownloadLink href={href} fileName={fileName} {...props} />;
});
