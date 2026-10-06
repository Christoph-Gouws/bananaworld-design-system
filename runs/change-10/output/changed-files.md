# Changed files — CR-DESIGN-SYSTEM-013

Code: **16 files, +1,363 / −51** (`git diff --stat` vs `26fa005`, new files counted). Stage 05 reviewed exactly these.

| File | Action | What |
|---|---|---|
| `src/components/multi-select-reading.ts` | **new** | the `allTicked` state machine, pure: `MultiSelectReading`, `MultiSelectCommitted`, `EVERYTHING`, `NOTHING_TICKED`, `multiSelectReadingOf`, `multiSelectTicked`, `multiSelectAllTickedToggle`, `multiSelectAllTickedLabel`, `multiSelectAllTickedFooter`, `multiSelectEveryRowState` (internal, not barrelled) |
| `src/components/MultiSelectAllTicked.tsx` | **new** | its React half: `useMultiSelectAllTicked` (the open-menu draft), `MultiSelectEveryRow`, `MultiSelectAllTickedList` (internal) |
| `src/components/MultiSelectMenu.tsx` | modified | `ITEM_SIZE` / `ITEM_ICON` exported (module-internal); header pointer. Nothing else |
| `src/components/GridFilterRow.tsx` | modified | `GridFilterCellDef.selectAll`, `AllTickedCell`, `gridFilterOfReading`, the dispatch branch. `SelectCell` / `MultiSelectCell` untouched |
| `src/components/DataTableToolbar.tsx` | modified | `AllTickedFilterControl`, `filterValueOfReading`, `multiSelectValueOf`, the dispatch branch, hoisted `MULTI_TRIGGER_CHROME` / `MULTI_MENU_CONTENT` |
| `src/lib/grid-view.ts` | modified | `excluded` field, `gridFilterExclude`, `gridFilterExcluded`, `gridFilterIsEmpty` arm, wire-encoding header |
| `src/lib/table-controls.ts` | modified | `excluded` field, `"allTicked"`, `matchesFilter` + `hasActiveControls` arms, `storedExclusionFromFilterValue`, `filterValueFromStored` optional param + guard, `storedStrings` |
| `src/index.ts`, `src/lib/index.ts` | modified | the three new exports |
| `tests/components/CR-DESIGN-SYSTEM-013.allTicked.test.tsx` | **new** | both surfaces driven by click and keyboard |
| `tests/components/multi-select-reading.test.tsx` | **new** | every transition and every word |
| `tests/components/grid-view.test.tsx`, `table-controls.test.tsx` | modified | new describe blocks appended; no existing spec edited |
| `tests/components/DragBoard.additive.test.tsx` | modified | export inventory lists the three new names (D-3) |
| `package.json`, `pnpm-lock.yaml` | modified | `source-map-js` override (D-4) |

Paper trail (not shipped): `runs/change-10/README.md`, `runs/change-10/output/*`, `runs/change-10/evidence/*`
(incl. `browser-proof/` and `frames/`), `runs/change-10/technical-debt.md`, CR-011's archive **moved unchanged** to
`runs/change-10/CR-DESIGN-SYSTEM-011/`, `runs/current/logic-plan/CR-DESIGN-SYSTEM-013.{md,estimate.json}`,
`runs/current/mockups/CR-DESIGN-SYSTEM-013/`, `runs/current/{SESSION_HANDOVER,active-milestone}.md`,
`source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`.

**Not changed:** `src/components/index.ts`, every other component, the `.snap` file (CRLF-only working-copy noise,
not staged). **Nothing written in `bananaworld-dc`** (read and module-loaded only).
