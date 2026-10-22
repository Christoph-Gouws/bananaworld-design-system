# Developer handover — CR-DESIGN-SYSTEM-021

**Next agent:** the conductor (poll CI, merge on green), then the CR-DC-256 build session.
**Next action:** report the MERGED sha on `main`; CR-DC-256 bumps DC's pin to it (never the branch sha) and re-exports `Keypad` and `ActionTile` through DC's `src/components/ui/index.ts`.
**Current state:** built, green (615/30, mutants 11/11, Edge 34/34), PR open on `change/cr-design-system-021`, kit 0.6.0.

## Rules to know
1. `Keypad` is controlled; the string is the count. Rules live in the pure `src/components/keypad-entry.ts`. Delete = clear, Backspace = last digit (pinned by a test).
2. `ActionTile`'s accessible name is its visible text (label, count, hint) on purpose: a `aria-labelledby` version failed axe label-in-name in a real browser. Do not reintroduce it without re-running `browser-proof/proof.mjs`.
3. A figure card is `ListCard` with the app's own text; there is no `FigureTile`.
4. Additive-only stays the lane rule: the export inventory (`tests/components/DragBoard.additive.test.tsx`) lists the two new names.
5. The `next` override floor is now `<15.5.28` (known-issues K-1).
6. Proof tooling: `runs/change-19/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only) and `runs/change-19/output/mutation-battery.mjs`. Run prettier with `--print-width 100`; do not stage the `.snap` CRLF artifact.

Artifacts: `runs/change-19/output/` (test-results, known-issues, implementation-summary), `runs/change-19/evidence/milestone-evidence.md`, frames in `runs/change-19/evidence/frames/`.
