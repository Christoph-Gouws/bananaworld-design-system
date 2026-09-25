"use client";

// useDropTarget — a place that can take what is held on a `DragBoard` (CR-DESIGN-SYSTEM-011).
//
// The consumer spreads `targetProps` on the element that IS the place (a row, a tray) and draws its own
// outline from `isOver` / `canDrop`. The words and the outline are the consumer's; this only wires the
// browser's drag events and registers the place for the keyboard path.

import { useContext, useEffect, useRef, type DragEvent } from "react";

import { DragBoardContext, type DragItem } from "./drag-board-context";

export interface DropTargetProps {
  readonly ref: (element: HTMLElement | null) => void;
  readonly "data-drop-target": string;
  readonly onDragEnter: (event: DragEvent<HTMLElement>) => void;
  readonly onDragOver: (event: DragEvent<HTMLElement>) => void;
  readonly onDragLeave: (event: DragEvent<HTMLElement>) => void;
  readonly onDrop: (event: DragEvent<HTMLElement>) => void;
}

export interface DropTarget {
  /** Spread on the element that IS the place — a row, a tray. */
  readonly targetProps: DropTargetProps;
  /** Something is held and this place is the one it is over (accepting or not). */
  readonly isOver: boolean;
  /** Something is held and this place would take it. False while nothing is held. */
  readonly canDrop: boolean;
  readonly holding: DragItem | null;
}

/**
 * A place that can take something. `accepts` is asked on every hover, every keyboard step and again at
 * the drop. 🔴 A place whose `accepts` says no never calls `preventDefault` on a hover, so the browser
 * itself shows "no drop" — and it is SKIPPED by the keyboard, though `isOver` still lets the consumer
 * say why it cannot take it while a mouse is over it.
 */
export function useDropTarget(
  id: string,
  options: { readonly accepts: (item: DragItem) => boolean },
): DropTarget {
  const board = useContext(DragBoardContext);
  const elementRef = useRef<HTMLElement | null>(null);
  const acceptsRef = useRef(options.accepts);
  useEffect(() => {
    acceptsRef.current = options.accepts;
  }, [options.accepts]);
  const register = board?.register;
  useEffect(() => {
    if (register === undefined) return undefined;
    return register(id, {
      accepts: (item) => acceptsRef.current(item),
      element: () => elementRef.current,
    });
  }, [register, id]);

  const holding = board?.holding ?? null;
  const onHover = (event: DragEvent<HTMLElement>): void => {
    const item = board?.holdingNow() ?? null;
    // Not a board drag (a file, text, another window): leave the browser's default alone.
    if (board === null || item === null) return;
    board.hover(id);
    if (options.accepts(item)) {
      // 🔴 WITHOUT `preventDefault` ON DRAGOVER, `drop` NEVER FIRES — the browser's default for a
      //    dragover is "not a drop target". That is exactly what a refusing place relies on.
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  };
  const targetProps: DropTargetProps = {
    ref: (element) => {
      elementRef.current = element;
    },
    "data-drop-target": id,
    onDragEnter: onHover,
    onDragOver: onHover,
    onDragLeave: (event) => {
      // Moving between two children of the place fires a leave on the place itself; that is not leaving.
      const to = event.relatedTarget;
      if (to instanceof Node && event.currentTarget.contains(to)) return;
      if (board !== null && board.over === id) board.hover(null);
    },
    onDrop: (event) => {
      if (board === null || board.holdingNow() === null) return;
      event.preventDefault();
      board.putDown(id);
    },
  };
  return {
    targetProps,
    isOver: board !== null && holding !== null && board.over === id,
    canDrop: holding !== null && options.accepts(holding),
    holding,
  };
}
