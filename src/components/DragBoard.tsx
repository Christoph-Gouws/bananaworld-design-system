"use client";

// DragBoard — pick a thing up and put it somewhere else, with a mouse OR the keyboard
// (CR-DESIGN-SYSTEM-011, raised by Bananaworld-DC EPIC-030-M-06).
//
// Five pieces, one mechanism: `DragBoard` (this provider), `DragGrip` (the six-dot handle,
// `DragGrip.tsx`), `useDropTarget` (what a place that can take something spreads on itself,
// `DropTarget.ts`), `useDragBoard` (what is being held, for the consumer's own drawing) and
// `DragKeyboardHint` (the keyboard line, `DragGrip.tsx`).
//
// ============================================================================
// 🔴 A MECHANISM, NOT A BOARD
// ============================================================================
// This knows nothing about trucks, routes, drivers or rows. It holds ONE thing being moved and the
// place it is over, asks the consumer whether a place `accepts` it, and hands the consumer the drop.
// Every word — what is held, where it would go, why a place cannot take it — is the consumer's
// (`describe`, the hint's children), and so is every outline and every "would be" figure. A board
// layout here would be the first consumer's screen promoted into a package, and the second consumer
// would fork it.
//
// ============================================================================
// 🔴 TWO INPUT PATHS INTO ONE DROP
// ============================================================================
// • MOUSE — native HTML5 drag: `dragstart` on the grip, `dragover`/`drop` on a place.
// • KEYBOARD — Space/Enter on the grip picks up, ↑/↓ moves between the places that ACCEPT the item
//   (document order, recomputed on every key so re-sorted rows are followed), Space/Enter puts it
//   down, Esc / Tab / blur puts it back. Native drag fires nothing from a keyboard, so without this
//   path a drag is unreachable without a pointer.
// Both end in the same `putDown` below, which asks `accepts` again before calling `onDrop` — a place
// that refuses can never receive a drop, whichever way it arrived.
//
// ⚠ TOUCH IS DELIBERATELY NOT A DRAG PATH. Most tablet browsers fire no HTML5 drag events for a finger,
//   and the ones that do make a long-press ambiguous with scrolling. A drag that STARTS from a touch is
//   cancelled; the consumer's dropdowns are the tablet's way to make the same move.
// ⚠ NO `dataTransfer` PAYLOAD IS TRUSTED. The item lives in this provider's state. `dataTransfer`
//   carries an opaque token only because some browsers will not start a drag without one; a drop from
//   outside the board (a file, another window) has no board item and is ignored.
//
// PURE UI (TECH-COMP-003 / ADR-001): no network, no permission logic, no business rule.

import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  DragBoardContext,
  type DragBoardState,
  type DragItem,
  type DragMode,
  type DragTarget,
} from "./drag-board-context";

export { DRAG_BOARD_MIME, type DragItem, type DragMode } from "./drag-board-context";

const DEFAULT_INSTRUCTIONS =
  "Press Space or Enter to pick it up, the up and down arrows to choose where it goes, Space or Enter to put it down, and Escape to put it back.";
const DEFAULT_NOWHERE = "There is nowhere to put it.";
const DEFAULT_PUT_BACK = "Put back where it was.";

export interface DragBoardProps {
  readonly children: ReactNode;
  /** Fired once per drop, only on a place whose `accepts` said yes at the moment of the drop. */
  readonly onDrop: (item: DragItem, targetId: string) => void;
  /**
   * The words the live region reads while something is held: `targetId` is the place it is over, or
   * null when it is over nothing yet. Called during render — keep it pure.
   */
  readonly describe: (item: DragItem, targetId: string | null) => string;
  /** Fired when a held item is put back without a drop (Esc, Tab, blur, a drag released elsewhere). */
  readonly onCancel?: (item: DragItem) => void;
  /** The grips' description (`aria-describedby`). Defaults to the keyboard model in plain words. */
  readonly instructions?: string;
  /** Said when a keyboard pick-up finds no place that accepts the item. */
  readonly nowhereText?: string;
  /** Said when a held item is put back. */
  readonly putBackText?: string;
}

// Document order: the order a keyboard user reads the page in, whatever order the places registered.
function byDocumentOrder(a: HTMLElement, b: HTMLElement): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

// After a keyboard drop the consumer usually re-renders the item somewhere else, and its old grip is
// gone — focus would fall to the page. It is handed to the item's grip in its new place instead.
// 🔴 ONLY IF FOCUS WAS ACTUALLY LOST (it is on the page itself). A person who has already moved on — Tab to
//    the next grip and picked it up — must not have focus pulled away a frame later: that blur would put
//    their NEW item back.
function refocusGrip(item: DragItem): void {
  const run = (): void => {
    const active = document.activeElement;
    if (active !== null && active !== document.body) return;
    const grips = Array.from(document.querySelectorAll<HTMLElement>("[data-drag-grip]"));
    grips.find((g) => g.dataset.dragId === item.id && g.dataset.dragKind === item.kind)?.focus();
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else setTimeout(run, 0);
}

// What is held, where, and how — state for rendering, refs for the handlers. A `dragover` arrives many
// times a second and must see the CURRENT item, not the one its closure was rendered with.
function useHeld() {
  const [holding, setHolding] = useState<DragItem | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [mode, setMode] = useState<DragMode | null>(null);
  const holdingRef = useRef<DragItem | null>(null);
  const overRef = useRef<string | null>(null);
  const modeRef = useRef<DragMode | null>(null);
  const hold = useCallback((item: DragItem | null, how: DragMode | null) => {
    holdingRef.current = item;
    modeRef.current = how;
    overRef.current = null;
    setHolding(item);
    setMode(how);
    setOver(null);
  }, []);
  const setOverTo = useCallback((id: string | null) => {
    overRef.current = id;
    setOver(id);
  }, []);
  return { holding, over, mode, holdingRef, overRef, modeRef, hold, setOverTo };
}

/** The provider. Renders no layout of its own — only a hidden live region and the grips' instructions. */
export function DragBoard({
  children,
  onDrop,
  describe,
  onCancel,
  instructions = DEFAULT_INSTRUCTIONS,
  nowhereText = DEFAULT_NOWHERE,
  putBackText = DEFAULT_PUT_BACK,
}: DragBoardProps): ReactElement {
  const held = useHeld();
  const { holdingRef, overRef, modeRef, hold, setOverTo } = held;
  const [said, setSaid] = useState("");
  const instructionsId = useId();
  const targets = useRef(new Map<string, DragTarget>());
  // The consumer's callbacks change every render; the handlers below are stable and read these.
  const callbacks = useRef({ onDrop, onCancel });
  useEffect(() => {
    callbacks.current = { onDrop, onCancel };
  }, [onDrop, onCancel]);

  // The places that would take `item`, in the order they are read on the page.
  const accepting = useCallback((item: DragItem): { id: string; element: HTMLElement }[] => {
    const found: { id: string; element: HTMLElement }[] = [];
    for (const [id, target] of targets.current) {
      const element = target.element();
      if (element !== null && element.isConnected && target.accepts(item)) {
        found.push({ id, element });
      }
    }
    return found.sort((a, b) => byDocumentOrder(a.element, b.element));
  }, []);

  const pickUp = useCallback(
    (item: DragItem, how: DragMode) => {
      if (how === "keyboard" && accepting(item).length === 0) {
        setSaid(nowhereText);
        return;
      }
      hold(item, how);
      setSaid("");
    },
    [accepting, hold, nowhereText],
  );

  const hover = useCallback(
    (id: string | null) => {
      if (overRef.current !== id) setOverTo(id);
    },
    [overRef, setOverTo],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const item = holdingRef.current;
      if (item === null) return;
      const list = accepting(item);
      const at = list.findIndex((t) => t.id === overRef.current);
      const fromNothing = direction === 1 ? 0 : list.length - 1;
      const next = at === -1 ? fromNothing : Math.min(list.length - 1, Math.max(0, at + direction));
      const chosen = list[next];
      if (chosen === undefined) return;
      setOverTo(chosen.id);
      chosen.element.scrollIntoView?.({ block: "nearest" });
    },
    [accepting, holdingRef, overRef, setOverTo],
  );

  const cancel = useCallback(() => {
    const item = holdingRef.current;
    if (item === null) return;
    hold(null, null);
    setSaid(putBackText);
    callbacks.current.onCancel?.(item);
  }, [hold, holdingRef, putBackText]);

  // 🔴 THE ONE WAY A DROP HAPPENS, for both input paths — and it asks `accepts` AGAIN. A place that
  //    refuses never receives a drop, even if a stale `over` still names it.
  const putDown = useCallback(
    (targetId?: string) => {
      const item = holdingRef.current;
      const id = targetId ?? overRef.current;
      if (item === null) return;
      const target = id === null ? undefined : targets.current.get(id);
      if (id === null || target === undefined || !target.accepts(item)) {
        cancel();
        return;
      }
      const byKeyboard = modeRef.current === "keyboard";
      hold(null, null);
      setSaid("");
      callbacks.current.onDrop(item, id);
      if (byKeyboard) refocusGrip(item);
    },
    [cancel, hold, holdingRef, modeRef, overRef],
  );

  const register = useCallback((id: string, target: DragTarget) => {
    targets.current.set(id, target);
    return () => {
      if (targets.current.get(id) === target) targets.current.delete(id);
    };
  }, []);

  const holdingNow = useCallback(() => holdingRef.current, [holdingRef]);
  const { holding, over, mode } = held;

  const value = useMemo<DragBoardState>(
    () => ({
      holding,
      over,
      mode,
      instructionsId,
      holdingNow,
      pickUp,
      hover,
      step,
      putDown,
      cancel,
      register,
    }),
    [holding, over, mode, instructionsId, holdingNow, pickUp, hover, step, putDown, cancel, register],
  );

  const live = holding === null ? said : describe(holding, over);
  return (
    <DragBoardContext.Provider value={value}>
      {children}
      <span id={instructionsId} hidden>
        {instructions}
      </span>
      <div role="status" aria-live="polite" className="sr-only" data-drag-live-region="">
        {live}
      </div>
    </DragBoardContext.Provider>
  );
}

/** What is held, where it is, and how — for the consumer's own drawing. Inert outside a `DragBoard`. */
export function useDragBoard(): {
  readonly holding: DragItem | null;
  readonly over: string | null;
  readonly mode: DragMode | null;
} {
  const board = useContext(DragBoardContext);
  return {
    holding: board?.holding ?? null,
    over: board?.over ?? null,
    mode: board?.mode ?? null,
  };
}
