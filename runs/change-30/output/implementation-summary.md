# Implementation summary — CR-DESIGN-SYSTEM-032 (kit 0.13.0 → 0.14.0)

**Premise check:** the plan's cited facts still held on `main` @ `1118553` (kit 0.13.0, `index.ts` at 300 lines, `AppShell`/`PageHeader`/`UserMenu` absent from `src/`, DC `BrowserAdminShell.tsx` unchanged). Built to the approved plan.

**Built (new files only, plus one barrel block):** `app-menu.ts` (pure rules), `AppShell.tsx`, `SideColumn.tsx` (extra file, split from AppShell for the 50-line sensor), `SideMenu.tsx` (Radix Accordion, `MenuItems`, foot), `MenuRail.tsx` (Radix NavigationMenu rail with fixed-position flyouts), `AppHeader.tsx`, `UserMenu.tsx` (Radix DropdownMenu), `PageHeader.tsx`. Exports: `AppShell`, `UserMenu`, `PageHeader` + 8 types. README "App frame" + changelog; `package.json` 0.14.0.

**Deviations from the plan (all small, recorded in the decision log):**
- Accessible name of a counted heading/item is "Loads 2", not "Loads — 2" (axe WCAG 2.5.3 in a real browser). `UserMenu` trigger name is "<name> · <triggerLabel>".
- Scrim is `bg-fg opacity-40` (not `bg-fg/40`).
- `@radix-ui/react-navigation-menu` pinned at 1.2.14 (not 1.4.1) plus a noted `pnpm.overrides` floor so this repo's lock has one `react-dismissable-layer`.
- `SideColumn.tsx` added (8 source files, plan said 7).

**Additive proof:** `git diff 1118553 -- src/` changes only `src/components/index.ts` (added exports, folded comment lines). Every other source file is untouched; every existing test passes unedited except three inventory lines in `DragBoard.additive.test.tsx`. Existing callers: DC (own `BrowserAdminShell`/`UserMenu`, no `export *` of the kit), CRM, RMS, Org Admin (no `export *`), packhouse (uses `SlideOver` only, untouched) — none imports a new name, so none runs new code. No consumer pin was bumped.

**Not done (honest):** the DC + CRM render check (plan §5.5, fresh clones, before/after suites and screenshots) was NOT run — see `known-issues.md`.
