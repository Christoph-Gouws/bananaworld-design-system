# Implementation summary — CR-DESIGN-SYSTEM-023

Plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-023.md` (owner-approved, layout A, on-green) re-checked against fresh `main` @ `bb6c22e`: everything as described. Built to it.

- `LinkedRecords` / `LinkedRecordsItem` (`src/components/LinkedRecords.tsx`) plus the shared card (`LinkedRecordsCard.tsx`). Presentation only; Tooltip on mouse/keyboard (trigger is a wrapping span), info button only under `hover: none` (decided in JS with `useSyncExternalStore`), Sheet on tap with the app's link node, refused item = lock only.
- `DocumentHeader`: optional `linked` rendered beside the `<dl>` inside the same frame (D-1); absent/null ⇒ the unchanged single `<dl>`.
- Barrel block, README (changelog 0.7.0 + "Linked records"), `package.json` 0.7.0, export inventory +2 names.
- Tests: 56 new (671/32), frozen-copy byte-identity, 10 mutants killed, Edge proof.

Existing callers checked (all unaffected): DC's 16 `<DocumentHeader` render sites pass no `linked` ⇒ unchanged `<dl>`, byte-identical (frozen-copy test); DC's `dt`-order and source-scan specs keep four `dt`s and the verbatim `DOCUMENT_HEADER_SLOTS` / `slots.map(`; `Tooltip.tsx` and `Sheet.tsx` imported, not edited; all 615 prior tests pass unedited; CRM / RMS / Org Admin are unreadable and gain nothing until they move their own pin. No consumer pin bumped. Rule-site search terms (`LinkedRecords|linked|role="group"`) re-run: no further sites.
