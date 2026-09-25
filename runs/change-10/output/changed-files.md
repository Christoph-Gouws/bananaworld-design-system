# Changed files — CR-DESIGN-SYSTEM-011

| File | Kind | Why |
|---|---|---|
| `src/components/DragBoard.tsx` | new | the provider + `useDragBoard` |
| `src/components/DragGrip.tsx` | new | the grip + the keyboard line |
| `src/components/DropTarget.ts` | new | `useDropTarget` |
| `src/components/drag-board-context.ts` | new (internal) | the shared shapes and the one context |
| `src/components/index.ts` | modified (+1 export block) | exports it |
| `tests/components/DragBoard.test.tsx` | new | both input paths |
| `tests/components/DragBoard.additive.test.tsx` | new | the additive guarantee |
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-011.md` | new | the plan |
| `runs/change-10/output/*.md`, `mutation-battery.mjs`, `runs/change-10/evidence/developer-handover.md` | new | the archive |
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | modified | the entry |
| `runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md` | modified | the handover |

`package.json`, `pnpm-lock.yaml`: **unchanged** — no dependency added.
