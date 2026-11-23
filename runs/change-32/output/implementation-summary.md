# Implementation summary — CR-DESIGN-SYSTEM-034 (kit 0.14.0 → 0.15.0)

**Premise check:** everything in the plan still held on `main` @ `f5ec58c` (kit 0.14.0, `index.ts` 299 lines, no `topItems` anywhere). Built to the approved plan, layout A.

**Built:** `app-menu.ts` (`AppMenuTopItem`, `visibleTopItems`), `AppShell.tsx` (`topItems` prop, one filter call, `useMenuMode` hook), `SideColumn.tsx` (threads `topItems`), `SideMenu.tsx` (`TopLinks`, rendered before the accordion only when non-empty), `MenuRail.tsx` (`RailTopLink`, a `NavigationMenu.Link` inside the List: no Trigger/Content so no flyout), barrel line 299 (one type name), `package.json` 0.15.0, README changelog and "Top items" bullet.

**Additive proof:** one optional prop and one type name; every other change is in private files behind "the list is non-empty". HTML for the PH-style call with no `topItems` was captured at `f5ec58c` BEFORE any component edit (`tests/components/fixtures/app-shell-034-frozen.ts`); after the change, undefined, `[]` and only-hidden each render equal to it in the open menu, rail, slide-out and server render. Existing callers: packhouse (`OfficeFrame.tsx`, no `topItems`) reaches no new branch; DC `src/` has 0 references to the frame; CRM/RMS/Org Admin were not readable here (K-1). No consumer pin was bumped.

**Rule sites:** re-ran the plan's search terms (`hidden !== true`, `pathname === item.href`, `isMenuItemCurrent`, `footItems`, `topItems`): no site missed; the only new site is `visibleTopItems` (listed "add" in the plan). Foot sites left as planned.

**Deviations (small, recorded):** slide-out filters its own top items; `useMenuMode` extracted to keep `AppShell()` ≤ 50 lines.

**Not done (honest):** the DC + CRM render check (plan §5.5) — see `known-issues.md` K-1.
