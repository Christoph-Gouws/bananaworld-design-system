# Developer handover — CR-DESIGN-SYSTEM-023

**Next agent:** the conductor (poll CI, merge on green), then the CR-DC-223 build session.
**Next action:** report the MERGED sha on `main`; CR-DC-223 pins it (never the branch sha), re-exports `LinkedRecords` / `LinkedRecordsItem` through DC's `ui/index.ts`, and passes `linked` on its `DocumentHeader` forms.
**Current state:** built, green (671/32, mutants 10/10, Edge 33/33), PR open on `change/cr-design-system-023`, kit 0.7.0.

## Rules to know
1. The linked line sits BESIDE the header's `<dl>` inside the same frame (axe rejects `div role=group` inside a `dl`; a fifth `dt` breaks DC's specs). Absent `linked` ⇒ the unchanged single `<dl>`, pinned by the frozen copy `tests/components/fixtures/DocumentHeader.frozen-bb6c22e.tsx`.
2. The info button is decided in JS (`matchMedia("(hover: none)")`), not CSS. The Tooltip trigger is a wrapping span because the app's link need not forward refs.
3. A refused item (`refusedLabel`) draws a lock and its number only; never a date, card or button.
4. The kit needs the app's `TooltipProvider`. The sheet restores focus itself (`onCloseAutoFocus`) because it has no `Dialog.Trigger`.
5. Proof tooling: `runs/change-21/evidence/browser-proof/proof.mjs` and `runs/change-21/output/mutation-battery.mjs`. Prettier `--print-width 100`; do not stage the `.snap` CRLF artifact.

Artifacts: `runs/change-21/output/`, `runs/change-21/evidence/milestone-evidence.md`, frames in `runs/change-21/evidence/frames/`.
