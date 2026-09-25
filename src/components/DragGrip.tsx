"use client";

// DragGrip + DragKeyboardHint — the handle a person picks a thing up by, and the keyboard line shown
// while they hold it (CR-DESIGN-SYSTEM-011). Both read the `DragBoard` they sit inside; outside one the
// grip is an inert, disabled button and the line renders nothing.

import {
  useContext,
  useRef,
  type DragEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { GripVertical } from "lucide-react";

import { cn } from "../lib";
import { DRAG_BOARD_MIME, DragBoardContext, sameItem, type DragItem } from "./drag-board-context";

export interface DragGripProps {
  readonly item: DragItem;
  /** The grip's accessible name: "Move R07 · Lydenburg". */
  readonly label: string;
  /** Drawn under the pointer while dragging (`setDragImage`) — the consumer's "in hand" chip. */
  readonly preview?: RefObject<HTMLElement | null>;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * The six-dot handle. A real `<button>`, so Tab reaches it and a screen reader names it. It does
 * nothing on click: picking up is Space/Enter, or pressing and dragging with a mouse.
 */
export function DragGrip({
  item,
  label,
  preview,
  disabled = false,
  className,
}: DragGripProps): ReactElement {
  const board = useContext(DragBoardContext);
  // Set by the pointer that STARTED the gesture: a touch-started drag is cancelled (`DragBoard.tsx`).
  const byTouch = useRef(false);
  const inert = board === null || disabled;
  const holdingThis = board !== null && sameItem(board.holding, item);
  const holdingByKeyboard = holdingThis && board?.mode === "keyboard";

  const onDragStart = (event: DragEvent<HTMLButtonElement>): void => {
    if (board === null || inert || byTouch.current) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(DRAG_BOARD_MIME, `${item.kind}:${item.id}`);
    event.dataTransfer.effectAllowed = "move";
    const image = preview?.current ?? null;
    if (image !== null) event.dataTransfer.setDragImage(image, 12, 12);
    // ⚠ DEFERRED ONE TICK ON PURPOSE. The pick-up re-renders the board (the source fades, the places
    //   light up); a browser that sees the drag source's layout change INSIDE `dragstart` may abandon
    //   the drag or snapshot the wrong box. The first `dragover` arrives well after this tick.
    setTimeout(() => board.pickUp(item, "pointer"), 0);
  };

  // At rest, Space/Enter picks up; while held by keyboard, the arrows choose and Space/Enter/Esc/Tab end it.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (board === null || inert) return;
    const key = event.key;
    const endsIt = key === " " || key === "Enter";
    if (!holdingByKeyboard) {
      if (endsIt) {
        event.preventDefault();
        board.pickUp(item, "keyboard");
      }
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      board.step(key === "ArrowDown" ? 1 : -1);
    } else if (endsIt) {
      event.preventDefault();
      board.putDown();
    } else if (key === "Escape") {
      event.preventDefault();
      board.cancel();
    } else if (key === "Tab") {
      // Tab still moves focus on — it just puts the item back first.
      board.cancel();
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-roledescription="drag handle"
      aria-describedby={board?.instructionsId}
      aria-pressed={holdingThis}
      disabled={inert}
      draggable={!inert}
      data-drag-grip=""
      data-drag-id={item.id}
      data-drag-kind={item.kind}
      data-holding={holdingThis ? "true" : undefined}
      onPointerDown={(event) => {
        byTouch.current = event.pointerType === "touch";
      }}
      onDragStart={onDragStart}
      onDragEnd={() => {
        // A drop has already cleared the board; a drag released anywhere else is put back here.
        if (board !== null && sameItem(board.holdingNow(), item)) board.cancel();
      }}
      onKeyDown={onKeyDown}
      onBlur={() => {
        // Focus leaving a grip that holds something by keyboard puts it back (a drop has already
        // cleared the board, so this is a no-op after one).
        if (holdingByKeyboard) board?.cancel();
      }}
      className={cn(
        "inline-flex shrink-0 cursor-grab items-center justify-center rounded-sm text-border-strong",
        "hover:text-fg-muted focus-visible:outline-none focus-visible:shadow-focus",
        "disabled:cursor-default disabled:opacity-50",
        holdingThis && "text-info",
        className,
      )}
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

/**
 * The keyboard line, shown ONLY while something is held by keyboard: the consumer's "Moving Hansie —
 * now over Toyota Dyna 4T", then the keys. A mouse user never sees it.
 */
export function DragKeyboardHint({
  children,
  className,
}: {
  readonly children: (item: DragItem, over: string | null) => ReactNode;
  readonly className?: string;
}): ReactElement | null {
  const board = useContext(DragBoardContext);
  if (board === null || board.holding === null || board.mode !== "keyboard") return null;
  const key = "rounded border border-border bg-surface px-1 font-mono text-[11px] text-fg";
  return (
    <div
      role="note"
      data-drag-keyboard-hint=""
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-info bg-info-subtle px-3 py-2 text-sm text-info-fg",
        className,
      )}
    >
      <span>{children(board.holding, board.over)}</span>
      <span className="text-xs">
        <kbd className={key}>↑</kbd> <kbd className={key}>↓</kbd> choose ·{" "}
        <kbd className={key}>Space</kbd> put it down · <kbd className={key}>Esc</kbd> put it back
      </span>
    </div>
  );
}
