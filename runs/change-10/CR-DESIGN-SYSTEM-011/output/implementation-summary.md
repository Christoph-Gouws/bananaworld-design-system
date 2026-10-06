# Implementation summary — CR-DESIGN-SYSTEM-011

> *Drag and drop, with a mouse or the keyboard — a mechanism, not a board.*
> Raised by Bananaworld-DC EPIC-030-M-06 (`DEP-030-03`). Branch `change/cr-design-system-011`, off `main` @
> `8387f66b`. Built 2026-09-25. Archive: `runs/change-10/` (archive № = CR № − 1 here, as `-010` → `change-09`).

## 0. Plan-premise check — done first

- `main` on the remote is `8387f66b` — the SHA the plan names. `-011` is free (`-010` is the newest entry in the
  decision log and the newest logic plan).
- The package has **no** general drag export: `GridHeadCell` / `GridHeaderMenu` (`GRID_COLUMN_MIME`,
  `gridDraggedColumn`) / `GridGroupStrip` only. No export name begins `Drag` or `useDrop` — the six new names
  collide with nothing.
- `lucide-react` (the grip icon, `GripVertical` — already used by `GridHeadCell`) and `cn` are already
  dependencies. **No dependency is added.**

## 1. What was built

| File | Change |
|---|---|
| `src/components/DragBoard.tsx` | **new** — the provider `DragBoard` + `useDragBoard` (the mechanism's header lives here) |
| `src/components/DragGrip.tsx` | **new** — `DragGrip` + `DragKeyboardHint` |
| `src/components/DropTarget.ts` | **new** — `useDropTarget` |
| `src/components/drag-board-context.ts` | **new, internal** — the shared shapes (`DragItem`, `DragMode`, `DRAG_BOARD_MIME`) and the one context |
| `src/components/index.ts` | one export block, with its additive note (the root `src/index.ts` already stars `./components`) |

⚠ **Four files, not one, and that was the sensors' call.** Written first as one 539-line `DragBoard.tsx`, the
estate sensor raised RC-05 (file size). The design was split along its own seams — provider, place, grip,
shared shapes — rather than the number argued with; the sensors then read **0 open findings** over all seven
changed files, and the battery was re-anchored per file and re-run (10/10).
| `tests/components/DragBoard.test.tsx` | **new** — 17 specs, both input paths |
| `tests/components/DragBoard.additive.test.tsx` | **new** — 4 specs, the additive guarantee |
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-011.md`, `runs/change-10/**`, the decision log, the handover | the lane's records |

**0 existing source lines changed** outside the one export block; **0 existing tests edited**.

## 2. Decisions taken in the build (all inside the approved plan)

- **D-1 — the pointer pick-up is deferred one tick** (`setTimeout(…, 0)` in `dragstart`). A layout change of
  the drag source INSIDE `dragstart` can make a browser abandon the drag or snapshot the wrong box; the board
  re-renders on pick-up (the consumer fades the source, lights the places). The first `dragover` arrives well
  after the tick.
- **D-2 — `putDown` re-asks `accepts`** at the moment of the drop, for both paths. A refusing place can never
  receive a drop through a stale `over`.
- **D-3 — no wrap on ↑/↓.** At either end the keyboard stays put; ↓ from nothing starts at the first place, ↑
  at the last.
- **D-4 — focus follows the item after a keyboard drop** (`data-drag-id` / `data-drag-kind` on the grip): the
  consumer usually re-renders the item elsewhere and its old grip is gone. 🔴 **Only when focus was actually
  lost** (on the page itself): the consumer's real-browser run (DC EPIC-030-M-06, five keyboard moves in a row)
  caught the first cut pulling focus back a frame later from the NEXT grip the person had already picked up —
  which blurred it and put that item back. Fixed, spec'd both ways, and a mutation (M11) added.
- **D-5 — outside a `DragBoard` everything is inert** (the grip is a disabled button, the hooks answer
  nothing held), so a component that renders a grip is safe to render anywhere.

## 3. Proof

`test-results.md`: the package suites and typecheck rehearsed locally on the branch tree AND on untouched
`main`, the counts compared; the mutation battery 11/11.
