"use client";

import { useEffect, useRef, useState, type ReactElement, type RefObject } from "react";
import { Download, Printer } from "lucide-react";
import { cn } from "../lib";
import { Button } from "./Button";

/**
 * PrintPreviewPanel — CR-DESIGN-SYSTEM-030. The BODY of a print screen, for a host that is a Sheet or a
 * SlideOver (the existing PrintPreview is a Modal and stays as it is). Preview first, then Download and Print.
 *
 * No window or tab is ever opened. Print loads the caller's final file in the preview frame and calls
 * `contentWindow.print()` on its load; where the device has no PDF viewer (`navigator.pdfViewerEnabled ===
 * false`) the preview says so and Print saves the file instead, still through `print()`.
 *
 * The kit makes no network call: the caller's three functions return the files. Blobs must be typed
 * `application/pdf`. `print()` / `download()` record the action and return the file, or `null` = refused,
 * and then the panel opens and saves nothing (and says nothing — the caller explains a refusal).
 */
export interface PrintPreviewPanelWords {
  readonly print: string;
  readonly download: string;
  readonly noViewer: string;
  readonly loading: string;
  readonly failed: string;
}

export interface PrintPreviewPanelProps {
  /** The preview file. Called once on mount; not called when the device has no PDF viewer. */
  readonly load: () => Promise<Blob>;
  /** Records the print and returns the final file. `null` = refused: the panel opens nothing. */
  readonly print: () => Promise<Blob | null>;
  /** Records the print and returns the final file. `null` = refused: the panel saves nothing. */
  readonly download: () => Promise<Blob | null>;
  /** The saved file's name; also the preview frame's accessible title. */
  readonly fileName: string;
  /** Every visible word; the caller supplies them in the screen's language. No defaults. */
  readonly words: PrintPreviewPanelWords;
}

type Action = "print" | "download";

// Two equal buttons on a phone, right-aligned from `sm`; the 44 px floor on coarse pointers (as ExportButton).
const ACTION = "flex-1 sm:flex-none [@media(pointer:coarse)]:min-h-11";

/** Saves through a temporary link inside `host`, with no `target`. Returns the object URL to revoke later. */
function saveBlob(blob: Blob, fileName: string, host: HTMLElement): string {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  host.appendChild(link);
  link.click();
  link.remove();
  return url;
}

/** Prints the frame's document, then gives focus back to `returnTo`. False if the browser refused. */
function printFrame(frame: HTMLIFrameElement | null, returnTo: HTMLElement | null): boolean {
  try {
    frame?.focus();
    frame?.contentWindow?.print();
    return true;
  } catch {
    return false;
  } finally {
    // Focus left in a PDF frame would stop Escape reaching the host's focus trap.
    returnTo?.focus();
  }
}

type Latest = { readonly current: PrintPreviewPanelProps };

/** The preview: one `load()` per mount, none where the device has no PDF viewer; every file revoked. */
function usePreview(latest: Latest) {
  const alive = useRef(false);
  const printed = useRef(false); // a slow preview must never overwrite the final file
  const [viewer, setViewer] = useState<boolean | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let cancelled = false; // per effect run: a load from an earlier mount must never set state
    alive.current = true;
    const hasViewer = navigator.pdfViewerEnabled !== false; // undefined (older browsers) = has one
    setViewer(hasViewer);
    if (hasViewer) {
      Promise.resolve()
        .then(() => latest.current.load())
        .then((blob) => {
          if (!cancelled && !printed.current) setFrameUrl(URL.createObjectURL(blob));
        })
        .catch(() => !cancelled && setPreviewFailed(true));
    }
    return () => {
      cancelled = true;
      alive.current = false;
    };
  }, [latest]);

  // Revoke a frame file when it is replaced and when the panel goes.
  useEffect(() => () => void (frameUrl && URL.revokeObjectURL(frameUrl)), [frameUrl]);

  return { alive, printed, viewer, frameUrl, setFrameUrl, previewFailed };
}

/** Saves a file as `fileName` through `host`; every saved file's URL is revoked when the panel goes. */
function useSaver(host: RefObject<HTMLElement | null>, latest: Latest) {
  const urls = useRef<string[]>([]);
  useEffect(() => {
    const saved = urls.current;
    return () => saved.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  return (blob: Blob) => {
    if (host.current) urls.current.push(saveBlob(blob, latest.current.fileName, host.current));
  };
}

function usePrintPanel(props: PrintPreviewPanelProps) {
  // The callbacks are read through a ref so a parent's inline arrow functions never refetch the preview.
  const latest = useRef(props);
  latest.current = props;
  const preview = usePreview(latest);
  const { alive, printed, viewer, setFrameUrl } = preview;

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const printRef = useRef<HTMLButtonElement>(null);
  const inflight = useRef(false); // synchronous double-tap guard: each call may write a record
  const armed = useRef<string | null>(null); // the final file's URL, until its frame loads and prints
  const save = useSaver(rootRef, latest);
  const [busy, setBusy] = useState<Action | null>(null);
  const [failed, setFailed] = useState(false);

  const press = async (action: Action) => {
    if (inflight.current) return;
    inflight.current = true;
    setBusy(action);
    setFailed(false);
    try {
      const blob = await latest.current[action]();
      if (!alive.current || blob === null) return;
      if (action === "print" && viewer) {
        printed.current = true;
        const url = URL.createObjectURL(blob);
        armed.current = url;
        setFrameUrl(url);
      } else {
        save(blob);
      }
    } catch {
      if (alive.current) setFailed(true);
    } finally {
      inflight.current = false;
      if (alive.current) setBusy(null);
    }
  };

  const onFrameLoad = () => {
    // Only the frame showing the armed final file prints; the preview's own load never does.
    if (armed.current === null || frameRef.current?.getAttribute("src") !== armed.current) return;
    armed.current = null;
    if (!printFrame(frameRef.current, printRef.current)) setFailed(true);
  };

  return { ...preview, rootRef, frameRef, printRef, busy, failed, press, onFrameLoad };
}

function PreviewArea({
  viewer,
  frameUrl,
  previewFailed,
  frameRef,
  onLoad,
  title,
  words,
}: {
  viewer: boolean | null;
  frameUrl: string | null;
  previewFailed: boolean;
  frameRef: RefObject<HTMLIFrameElement | null>;
  onLoad: () => void;
  title: string;
  words: PrintPreviewPanelWords;
}): ReactElement {
  const message = "block px-6 py-6 text-center text-sm";
  if (viewer === false) return <p className={cn(message, "text-fg-muted")}>{words.noViewer}</p>;
  if (frameUrl !== null) {
    // `key` remounts the frame: changing an existing frame's src adds a history entry and Back would step through it.
    return (
      <iframe
        key={frameUrl}
        ref={frameRef}
        src={frameUrl}
        title={title}
        onLoad={onLoad}
        className="block h-full w-full"
      />
    );
  }
  if (previewFailed) return <p className={cn(message, "text-danger-fg")}>{words.failed}</p>;
  return (
    <p role="status" className={cn(message, "text-fg-muted")}>
      {words.loading}
    </p>
  );
}

/** Download (secondary) or Print (primary). The pressed one shows progress, the other is disabled. */
function ActionButton({
  action,
  panel,
  words,
}: {
  action: Action;
  panel: ReturnType<typeof usePrintPanel>;
  words: PrintPreviewPanelWords;
}): ReactElement {
  const isPrint = action === "print";
  const Glyph = isPrint ? Printer : Download;
  return (
    <Button
      ref={isPrint ? panel.printRef : undefined}
      variant={isPrint ? "primary" : "secondary"}
      className={ACTION}
      disabled={panel.viewer === null || (panel.busy !== null && panel.busy !== action)}
      inflight={panel.busy === action}
      onClick={() => void panel.press(action)}
    >
      <Glyph className="h-4 w-4" aria-hidden="true" /> {words[action]}
    </Button>
  );
}

export function PrintPreviewPanel(props: PrintPreviewPanelProps): ReactElement {
  const { fileName, words } = props;
  const panel = usePrintPanel(props);
  const { viewer, frameUrl } = panel;

  return (
    <div ref={panel.rootRef} className="flex min-w-0 flex-col gap-3">
      <div
        className={cn(
          "w-full overflow-hidden rounded-md border border-border bg-surface-sunken",
          viewer === false ? "h-auto" : "h-[60vh]",
        )}
        aria-busy={viewer !== false && frameUrl === null && !panel.previewFailed}
      >
        <PreviewArea
          viewer={viewer}
          frameUrl={frameUrl}
          previewFailed={panel.previewFailed}
          frameRef={panel.frameRef}
          onLoad={panel.onFrameLoad}
          title={fileName}
          words={words}
        />
      </div>
      {panel.failed && (
        <p role="alert" className="text-sm font-medium text-danger-fg">
          {words.failed}
        </p>
      )}
      <div className="flex gap-2 sm:justify-end">
        <ActionButton action="download" panel={panel} words={words} />
        <ActionButton action="print" panel={panel} words={words} />
      </div>
    </div>
  );
}
