# Developer handover — CR-DESIGN-SYSTEM-011 — drag and drop

> 2026-09-25. Read §1 before touching `DragBoard.tsx`, adding a drag anywhere in this package, or changing
> `GridHeadCell`'s own drag.

## §1. The rules this change leaves behind (8)

1. 🔴 **ONE DRAG CONTROL.** A new drag in this package (or a consumer) uses `DragBoard` / `DragGrip` /
   `useDropTarget`. A second primitive is the fork TECH-CON-004 forbids. `GridHeadCell`'s column drag predates
   it and is left alone on purpose (its keyboard twin is the header menu).
2. 🔴 **A MECHANISM, NOT A BOARD.** No layout, no words, no outline beyond the grip and the keyboard line.
   Every "would be" figure and "cannot take" sentence is the consumer's (`describe`, `isOver`/`canDrop`).
3. 🔴 **ONE `putDown` FOR BOTH PATHS, AND IT RE-ASKS `accepts`.** Never add a second drop path.
4. 🔴 **A REFUSING PLACE NEVER CALLS `preventDefault`** on a hover, and the keyboard skips it. `isOver` still
   reports it so the consumer can say why.
5. 🔴 **NO `dataTransfer` PAYLOAD IS TRUSTED.** The item lives in the provider; `DRAG_BOARD_MIME` is a token.
6. ⚠ **THE POINTER PICK-UP IS DEFERRED ONE TICK** (D-1). A spec that fires `dragstart` must let a tick pass
   before `dragover` (`tick()` in the spec).
7. ⚠ **TOUCH IS NOT A DRAG PATH** (K-1).
8. 🔴 **FOCUS IS HANDED BACK ONLY WHEN IT WAS LOST** (D-4). Never focus something a frame later without checking
   where the person already is — the blur puts their next item back (M11).

## §2. Where things are
`src/components/DragBoard.tsx` (provider) · `DragGrip.tsx` · `DropTarget.ts` · `drag-board-context.ts`
(internal) · specs `tests/components/DragBoard{,.additive}.test.tsx` · the battery
`runs/change-10/output/mutation-battery.mjs`.
