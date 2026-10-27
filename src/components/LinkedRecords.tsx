"use client";

import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Info, Lock } from "lucide-react";
import { cn } from "../lib";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./Sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { SummaryCard, SummaryRows, type LinkedRecordsSummary } from "./LinkedRecordsCard";

/**
 * LinkedRecords — the "Linked · Dispatches DSP-00131 7 Oct · …" line (CR-DESIGN-SYSTEM-023, companion of
 * Bananaworld-DC CR-DC-223; layout A only).
 *
 * 🔴 PRESENTATION ONLY. No data fetching, no app types, no addresses, no permission logic. The app hands
 *    in already-formatted text, its OWN link node (`link`) and — for a document the viewer may not open —
 *    a `refusedLabel`; the part never builds, reads or rewrites an address, and never reveals what a
 *    refusal hides (a refused item draws a lock and its number, nothing else, even if handed a date or a
 *    summary).
 *
 * Mouse and keyboard: the summary card is the package `Tooltip` (provider delay, opens on focus, Escape
 * closes, not interactive). 🔴 The trigger is a WRAPPING span: the app's link node need not forward a ref or
 * spread props. Touch (`hover: none`): an info button opens the package `Sheet` with the same card and
 * the app's link node again. Needs a `TooltipProvider` mounted once by the app shell.
 */
export type { LinkedRecordsSummary };

export interface LinkedRecordsEntry {
  readonly key: string;
  /** The app's own anchor (e.g. a `DrillLink`); `null` = no address, the number is plain text. */
  readonly link: ReactNode | null;
  /** The number as plain text. */
  readonly text: string;
  /** Already formatted by the app ("7 Oct"). */
  readonly date?: string;
  readonly summary?: LinkedRecordsSummary;
  /** Present ⇒ refused: grey text and a lock named by this, no date, no card, no button. */
  readonly refusedLabel?: string;
}

export interface LinkedRecordsGroup {
  readonly key: string;
  /** "Dispatches" */
  readonly label: string;
  readonly items: readonly LinkedRecordsEntry[];
  /** The app's "+N more" (a link or plain text). */
  readonly more?: ReactNode;
}

/** The kit's own control words; every one defaults to English. */
export interface LinkedRecordsWords {
  readonly summaryOf?: string;
  readonly close?: string;
  readonly open?: string;
  readonly error?: string;
  readonly retry?: string;
}

export interface LinkedRecordsProps {
  /** "Linked" */
  readonly label: string;
  readonly groups: readonly LinkedRecordsGroup[];
  /** "Nothing linked to this document yet" */
  readonly emptyText: string;
  readonly state?: "ready" | "loading" | "error";
  readonly onRetry?: () => void;
  readonly words?: LinkedRecordsWords;
  readonly className?: string;
}

export type LinkedRecordsItemProps = Omit<LinkedRecordsEntry, "key"> & {
  readonly words?: LinkedRecordsWords;
};

const DEFAULT_WORDS = {
  summaryOf: "Summary of",
  close: "Close",
  open: "Open",
  error: "Couldn't load the links.",
  retry: "Retry",
} as const;

const CANNOT_HOVER = "(hover: none)";

function subscribeCannotHover(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(CANNOT_HOVER);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}

function readCannotHover(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(CANNOT_HOVER).matches;
}

// Decided in JavaScript, not hidden with CSS: the info button is either rendered or it is not.
// Server render and engines without matchMedia say `false` — no button; the tooltip still works.
function useCannotHover(): boolean {
  return useSyncExternalStore(subscribeCannotHover, readCannotHover, () => false);
}

function RefusedItem({ text, refusedLabel }: { text: string; refusedLabel: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-medium text-fg-subtle"
      title={refusedLabel}
    >
      <Icon as={Lock} size="sm" label={refusedLabel} />
      {text}
    </span>
  );
}

function InfoButton({
  summary,
  link,
  words,
}: {
  summary: LinkedRecordsSummary;
  link: ReactNode | null;
  words: Required<LinkedRecordsWords>;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${words.summaryOf} ${summary.number}`}
        aria-haspopup="dialog"
        className="-my-2 inline-flex h-10 w-10 items-center justify-center rounded-full touch-manipulation focus-visible:outline-none focus-visible:shadow-focus"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-fg-muted">
          <Icon as={Info} size="sm" />
        </span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          hideCloseButton
          className="top-auto max-h-[85vh]"
          // The sheet is controlled with no Dialog.Trigger, so Radix has nothing to hand focus back to.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            buttonRef.current?.focus();
          }}
        >
          <SheetHeader>
            <SheetDescription>
              {summary.status === undefined ? summary.type : `${summary.type} · ${summary.status}`}
            </SheetDescription>
            <SheetTitle>{summary.number}</SheetTitle>
          </SheetHeader>
          <SheetBody width="full">
            <SummaryRows rows={summary.rows} />
          </SheetBody>
          <SheetFooter>
            {link !== null && link !== undefined && (
              <span className="mr-auto text-sm">
                {words.open} {link}
              </span>
            )}
            <SheetClose className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted focus-visible:outline-none focus-visible:shadow-focus">
              {words.close}
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function LinkedRecordsItem({
  link,
  text,
  date,
  summary,
  refusedLabel,
  words: wordsIn,
}: LinkedRecordsItemProps) {
  const cannotHover = useCannotHover();
  if (refusedLabel !== undefined) return <RefusedItem text={text} refusedLabel={refusedLabel} />;

  const words = { ...DEFAULT_WORDS, ...wordsIn };
  const numberNode = link ?? <span className="font-medium text-fg">{text}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {summary === undefined ? (
        numberNode
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{numberNode}</span>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="w-[270px] max-w-[72vw] rounded-lg border border-border bg-surface p-3 text-fg shadow-lg"
          >
            <SummaryCard summary={summary} />
          </TooltipContent>
        </Tooltip>
      )}
      {date !== undefined && (
        <span className="whitespace-nowrap text-xs text-fg-muted">{date}</span>
      )}
      {summary !== undefined && cannotHover && (
        <InfoButton summary={summary} link={link} words={words} />
      )}
    </span>
  );
}

export function LinkedRecords({
  label,
  groups,
  emptyText,
  state = "ready",
  onRetry,
  words: wordsIn,
  className,
}: LinkedRecordsProps) {
  const labelId = useId();
  const words = { ...DEFAULT_WORDS, ...wordsIn };
  const filled = groups.filter((group) => group.items.length > 0);
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-busy={state === "loading" || undefined}
      className={cn("flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm", className)}
    >
      <span id={labelId} className="text-2xs font-semibold uppercase tracking-wide text-fg-muted">
        {label}
      </span>
      {state === "loading" && <Skeleton className="h-4 w-48" />}
      {state === "error" && (
        <span className="text-fg-muted">
          {words.error}
          {onRetry !== undefined && (
            <>
              {" "}
              <button
                type="button"
                className="font-semibold text-info underline-offset-2 hover:underline"
                onClick={onRetry}
              >
                {words.retry}
              </button>
            </>
          )}
        </span>
      )}
      {state === "ready" && filled.length === 0 && (
        <span className="text-fg-subtle">{emptyText}</span>
      )}
      {state === "ready" &&
        filled.map((group) => (
          <div
            key={group.key}
            className="inline-flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 sm:border-l sm:border-border sm:pl-4 sm:first-of-type:border-l-0 sm:first-of-type:pl-0"
          >
            <span className="font-medium text-fg-muted">{group.label}</span>
            {group.items.map(({ key, ...item }) => (
              <LinkedRecordsItem key={key} {...item} words={wordsIn} />
            ))}
            {group.more}
          </div>
        ))}
    </div>
  );
}
