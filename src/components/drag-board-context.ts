"use client";

// The drag control's shared shapes and its one context (CR-DESIGN-SYSTEM-011). Internal: consumers reach
// the types through `DragBoard.tsx`'s exports, never the context itself — the provider is the only writer.

import { createContext } from "react";

/** The one thing being moved. `kind` lets a consumer tell two sorts of thing apart on one board. */
export interface DragItem {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
}

export type DragMode = "pointer" | "keyboard";

/** The opaque token a native drag carries. Never read back as the item (see `DragBoard.tsx`). */
export const DRAG_BOARD_MIME = "application/x-bananaworld-drag";

/** A place, as the provider keeps it: whether it takes an item, and where it is on the page. */
export interface DragTarget {
  readonly accepts: (item: DragItem) => boolean;
  readonly element: () => HTMLElement | null;
}

export interface DragBoardState {
  readonly holding: DragItem | null;
  readonly over: string | null;
  readonly mode: DragMode | null;
  readonly instructionsId: string;
  // The CURRENT item, for event handlers that fire many times a second between renders.
  readonly holdingNow: () => DragItem | null;
  readonly pickUp: (item: DragItem, mode: DragMode) => void;
  readonly hover: (targetId: string | null) => void;
  readonly step: (direction: 1 | -1) => void;
  readonly putDown: (targetId?: string) => void;
  readonly cancel: () => void;
  readonly register: (id: string, target: DragTarget) => () => void;
}

export const DragBoardContext = createContext<DragBoardState | null>(null);

export function sameItem(a: DragItem | null, b: DragItem): boolean {
  return a !== null && a.id === b.id && a.kind === b.kind;
}
