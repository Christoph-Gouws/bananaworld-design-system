# Developer handover — CR-DESIGN-SYSTEM-026

**Next agent / next action:** packhouse EPIC-004-M-03 pins the MERGED sha of this change and adopts `StatTile` / `StatTileRow` (README "Headline figures"). Nothing else is owed in this repo.

**Current state:** built, green, PR open. Kit 0.10.0. Archive `runs/change-24/` (`output/` artifacts, `evidence/` roll-ups, `evidence/frames/`, `evidence/browser-proof/`).

**Rules to keep:**
1. `StatTile.tsx` has no client directive and no hook (a guard spec reads the file). The icon is an element, not a component type, so a server component can pass it.
2. The value is printed as given; `null`/`""` is the dash, `"0"` is 0. The app decides "nothing recorded" — the kit never does.
3. Label + value + unit are ONE `<p>`; keep it so the tile reads as one unit.
4. Additive-only: new optional props only (a `tone` or button variant would be one). Never remove or retarget an existing one.
5. `src/components/index.ts` is at the 300-line sensor limit — fold comments rather than add lines, or split deliberately.
6. Browser proof: `node runs/change-24/evidence/browser-proof/proof.mjs` (Edge + DC's `playwright-core`/`tailwindcss`, read-only).
7. Not run: mutation battery M1–M9, DC + CRM re-check (`runs/change-24/output/known-issues.md`).
