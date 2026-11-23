# Revision review (Stage 05) — CR-DESIGN-SYSTEM-034

**Reviewed:** the six changed source files in `changed-files.md`. Sensors: 0 open findings on 6 files; both scorecards PASS (generated, judgment rows answered).

**Simplified:**
- `AppShell()` hit 52 lines (RC-04): the open/rail memory became a private `useMenuMode` hook, and the slide-out calls `visibleTopItems` itself instead of taking one more prop. Behaviour and effect order unchanged (the frozen-HTML specs prove it).
- The hidden filter for top items is spelled once (`visibleTopItems`); the current rule is the existing `isMenuItemCurrent`, not a copy.
- `AppMenuTopItem` extends `AppMenuFootItem`, so no field is repeated.

**Considered and rejected:**
- Adding `exact` to `AppMenuFootItem`: foot items match by exact href today; a field they ignore would mislead and one they honoured would change existing callers.
- Refactoring the foot's own inline filter onto `visibleTopItems`: leaves the foot code path byte-stable (plan D-2).
- A hand-rolled rail link: it is a `NavigationMenu.Link` inside the List so Tab and arrow keys join the heading icons (Radix behaviour kept).
- A `count` on top items, a divider (option B), a "NEW" tag: not asked for, not drawn in the approved mockup.
