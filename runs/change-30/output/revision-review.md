# Revision review (Stage 05) — CR-DESIGN-SYSTEM-032

**Reviewed:** the eight new source files and the barrel block listed in `changed-files.md`. Sensors: 0 open findings on 9 files; scorecards PASS.

**Simplified:**
- `AppShell` was 71 lines: the desktop column moved to `SideColumn` (the hook flagged RC-04); `UserMenu`'s trigger became `MenuTrigger`; `MenuRail`'s head became `RailTop`.
- Rail memory, current-screen and count rules live once in `app-menu.ts` and are shared by all three menu modes; `MenuItems` is one renderer for the open menu and the flyout.
- Magic numbers in the flyout positioning named (`FLYOUT_GAP_PX`, `VIEWPORT_MARGIN_PX`).
- Barrel: the added export lines were paid for by folding comment lines only (no export moved).

**Considered and rejected:**
- Exporting `SideMenu`/`MenuRail`/`AppHeader`: would freeze their props forever for no adopter's benefit (plan D-1).
- A free `footItems` node: the rail must shrink the foot to an icon, so it needs icon and label.
- `tailwindcss-animate` for the slide-out: not guaranteed in every consumer; a mount-then-transition does the job.
- Hand-rolled accordion/flyout: Radix primitives kept for keyboard, focus and screen-reader behaviour.
- Reading storage during render: causes a server/client mismatch; read after mount instead (the one-frame flash for rail users is the plan's accepted risk).
