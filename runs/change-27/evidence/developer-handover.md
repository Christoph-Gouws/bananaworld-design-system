# Developer handover — CR-DESIGN-SYSTEM-029

**Next agent / next action:** packhouse EPIC-006-M-01 pins the MERGED sha of this change (never the branch sha), passes `density="compact"` to its loading-screen `TruckDiagram`, and tightens the rest of the phone screen (the "not on the truck yet" list, header and column are most of the length gap). Nothing else is owed in this repo.

**Current state:** built, green, PR open. Kit 0.12.0. Archive `runs/change-27/` (`output/`, `evidence/`, `evidence/frames/`, `evidence/browser-proof/`).

**Rules to keep:**
1. Compact applies below 640 px only and beats the tablet surface there: the tablet `min-h-14` lives behind `sm:` in `SPACE_COMPACT`. Do not put the bare tablet class back.
2. The default strings (`SPACE`, `LIST`, `DIVIDER`, `WARNING`, `END_BLOCK`) are the shipped strings; compact only appends `max-sm:` overrides.
3. 40 px is an owner-approved exception to the 48 px picture floor for `density="compact"` below 640 px only. Gloved use: raise to `max-sm:min-h-11` (44 px).
4. Same DOM and accessible names in both densities; `taken` never shows a number.
5. Browser proof: `node runs/change-27/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only).
6. Run tests with `--pool=threads --maxWorkers=2 --testTimeout=60000`.
