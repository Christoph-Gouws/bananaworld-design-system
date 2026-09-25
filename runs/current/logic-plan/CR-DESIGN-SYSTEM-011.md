# Logic Plan — CR-DESIGN-SYSTEM-011 — drag and drop, with a mouse or the keyboard

> **Raised by:** Bananaworld-DC, EPIC-030-M-06 (`DEP-030-03`, guardrail G8: *"the design system has NO drag
> primitive. A shared board/drag control goes into @bananaworld/design-system FIRST, then DC bumps its
> pin"*). The consuming app's owner picked the drawing (`runs/current/mockups/EPIC-030-M-06/option-a.html`
> in DC, **option A**, 2026-09-25) and approved the milestone's logic plan the same day, including its
> recommendation that the session merges this package change once its own checks pass (DC plan §2.5, owner
> question 1). This change is the package half of that milestone.
>
> **Gates:** no migration (this package has no database). **No mockup gate of its own** — the drawing was
> approved in the consuming app, exactly as CR-DESIGN-SYSTEM-008's was.
>
> **The number:** `-011`, the next free after `-010` on `main` @ `8387f66b` (re-verified against the remote at
> build, the standing rule).

## 1. What this is, in one paragraph

A general drag control: a provider that holds the one thing being moved, a six-dot grip that picks it up,
a hook a place spreads on itself to say whether it takes the thing, a hook to read what is held, and a
keyboard line. **Two input paths into one drop** — native HTML5 drag for a mouse, and Space / ↑ ↓ / Space /
Esc for a keyboard. **Touch is deliberately not a drag path.** It is a MECHANISM, not a board: every word,
outline and "would be" figure is the consumer's.

## 2. Why it belongs here

The package has only grid-specific drag (`GridHeadCell` / `GridGroupStrip`, `gridDraggedColumn`,
CR-DESIGN-SYSTEM-008): mouse-only, no keyboard pick-up, and bound to columns. A consumer that needs rows or
cards dragged would otherwise hand-roll a second primitive — DC already has one (`StopList.tsx`), and its
own plan records moving it onto this control as a follow-on. One drag control, TECH-CON-004 (adopt, never
fork).

## 3. What is added — all ADDITIVE, no existing export changes

| Export | What it is |
|---|---|
| `DragBoard` | The provider: `onDrop(item, targetId)`, `describe(item, targetId \| null)` (the consumer's live-region words), `onCancel?`, `instructions?`, `nowhereText?`, `putBackText?`. Renders no layout — only a hidden live region and the grips' instructions. |
| `DragGrip` | A real `<button>` (`aria-roledescription="drag handle"`, `aria-describedby` = the instructions, `aria-pressed` while holding). Mouse: `draggable`, `dragstart` → the board (the pick-up deferred one tick: a layout change inside `dragstart` can abandon the drag). Keyboard: Space/Enter picks up. Touch: a drag started by a touch pointer is cancelled. No click action. |
| `useDropTarget(id, { accepts })` | `{ targetProps, isOver, canDrop, holding }`. A place whose `accepts` says no never calls `preventDefault` (the browser shows *no drop*), is SKIPPED by the keyboard, and never receives a drop; `isOver` still lets the consumer say why. |
| `useDragBoard()` | `{ holding, over, mode }` for the consumer's own drawing. Inert outside a board. |
| `DragKeyboardHint` | The keyboard line (consumer words + *↑ ↓ choose · Space put it down · Esc put it back*), shown ONLY while holding by keyboard. |
| `DRAG_BOARD_MIME` | The opaque token a native drag carries. **No `dataTransfer` payload is trusted** — the item lives in the provider; a drop from outside the board is ignored. |

**The keyboard model:** Tab reaches a grip → Space/Enter picks up (with no accepting place: *"There is
nowhere to put it."*, nothing held) → ↑/↓ move between the ACCEPTING places in document order, recomputed on
every key → Space/Enter puts it down (`onDrop`), or puts it back if no place is chosen → Esc / Tab / blur puts
it back, focus stays on the grip. After a keyboard drop, focus is handed to the item's grip in its new place — only if focus was lost, never
pulled from wherever the person has already gone.

**Both paths end in one `putDown`, which asks `accepts` AGAIN** — a stale `over` can never deliver a drop to a
place that refuses.

## 4. The additive guarantee (R-028-01's precedent)

`tests/components/DragBoard.additive.test.tsx`: every runtime export at `8387f66b` (123, listed) still
exists; the change adds exactly its six names, counted and named; the new token is not the grid's;
`GridHeadCellProps` still takes what it took (`satisfies`, compile-time); and the grid's own column drag still
reports the dragged column through its own mime, outside any board. **A consumer that moves its pin and adopts
nothing sees nothing** — and no session can read a sibling consumer, so the change must be incapable of
breaking one.

## 5. Tests and the mutation battery

`tests/components/DragBoard.test.tsx` (19): the keyboard path end to end (↓ skips a refusing place; one drop,
right place), ↑ from nothing starts last, no wrap; Esc (no drop, cancel reported, focus kept, live words);
Tab and blur; put down with no place = put back; nowhere to put it; the keyboard line only by keyboard; the
mouse path by fired `dragstart`/`dragover`/`drop` (a refusing place never prevents the default and takes no
drop); a drag released elsewhere; a touch-started drag cancelled; a mouse after a touch; a drop from outside
ignored; the preview as the drag image; inert outside a board and when disabled; the instructions named; focus after a keyboard drop, both ways.

`runs/change-10/output/mutation-battery.mjs` — **11 mutations, 11 killed** (the first run found one vacuous:
the keyboard line during a MOUSE drag was unasserted; the spec was fixed, never the mutation).

## 6. Seams

| Thing | Writes | Reads |
|---|---|---|
| `@bananaworld/design-system` | this package | Bananaworld-DC (EPIC-030-M-06 bumps its pin to this merge) and Bananaworld-CRM (its own pin; **unaffected until it moves it**) |

No network, no permission logic, no business rule (TECH-COMP-003 / ADR-001). Styling is package tokens only.

## 7. Out of scope

Touch drag · a board layout · migrating DC's `StopList.tsx` (DC's follow-on `TD-030-M06-01`) · any change to
`GridHeadCell`'s drag.
