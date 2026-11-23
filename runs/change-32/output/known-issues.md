# Known issues — CR-DESIGN-SYSTEM-034

**Premise check:** the plan's cited files and lines (`app-menu.ts`, `AppShell.tsx`, `SideColumn.tsx`, `SideMenu.tsx`, `MenuRail.tsx`, `index.ts:299`) still held on `main` @ `f5ec58c`. Built to the approved plan.

**K-1 — DC + CRM render check not run.** Plan §5.5 proposed fresh clones of DC and CRM with only the kit pin moved to this head. Not run: this session cannot clone or build the other apps. The additive claim rests instead on: the unedited existing suite (870/870, of which 850 are the originals); 12 frozen-HTML specs comparing four states against HTML captured at `f5ec58c`; the `git diff` of `src/` (new branches are guarded by "the list is non-empty"); and DC `src/` having 0 references to `AppShell`, `AppMenuFootItem`, `footItems` or `topItems` (read-only grep of the frozen copy). CRM, RMS and Org Admin were not readable here. Whoever pins this sha first should run it (also CR-DESIGN-SYSTEM-032's K-1).

**K-2 — Overlapping "current" (plan R1).** A non-exact top item whose href prefixes other screens is marked together with the screen under its heading. README advises `exact: true`; PH-016 passes it.

**K-3 — Rail ArrowDown** is proven in both happy-dom and Edge (plan R2 not triggered).

**K-4 — Small deviations from the plan:** the slide-out calls `visibleTopItems` itself (plan said once in `AppShell`); `useMenuMode` extracted (50-line sensor). `proof.mjs` runs through `pnpm dlx` because no DC `node_modules` is available here.

**K-5 — Cross-system seams S1–S3 (plan §8)** carried unchanged: S1 PH-016 pins the MERGED sha and passes `topItems` with `exact: true`; S2 the app sets `hidden`; S3 consumers move their own pin. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist (owner's call).

**Standing, carried:** no cross-system register; 4 inert `ignoreGhsas`; gitleaks scan check; the `.snap` CRLF artefact (restored, not staged); `prettier --print-width 100` (add `--end-of-line auto` on a CRLF checkout); `index.ts` is at 299 lines (never run prettier on it).
