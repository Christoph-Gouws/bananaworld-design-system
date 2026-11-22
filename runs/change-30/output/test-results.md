# Test results — CR-DESIGN-SYSTEM-032 (kit 0.14.0)

Commands (package root):
- `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` → **44 files, 850 passed, 0 failed** (baseline at `1118553`: 803; +47 new: `AppShell.test.tsx` 26, `UserMenu.test.tsx` 10, `app-menu.test.tsx` 9 incl. layout/source guards and the export inventory lines).
- `npx tsc --noEmit` → clean. `pnpm audit --prod --audit-level=high` → exit 0. `prettier --check --print-width 100` on the new files → clean.
- `node runs/change-30/output/mutation-battery.mjs` → **11/11 mutants killed** by a named spec (accordion `multiple`, roll-up counts hidden, empty-group filter removed, current heading never marked, flyout does not open on focus, stored value read during render, junk value means rail, menu button not the Dialog.Trigger, choosing an item does not close the slide-out, `max-w` cap on `main`, language item closes the menu). The first run left "stored value read during render" alive; the server-render spec was strengthened (rail remembered, must still render open) and it died.
- `node runs/change-30/evidence/browser-proof/proof.mjs` (real Edge, Tailwind + playwright-core read-only from the DC's node_modules) → **30 PASS, 0 FAIL, ALL PASS**.

## Acceptance criteria

| # | Criterion | Verdict | Where |
|---|---|---|---|
| 1 | Grouped headings, icon on heading only, accordion one at a time, current heading marked even closed, count badges on heading and item, all-hidden heading hidden | MET | AppShell.test (open menu, accordion, badges and hidden); proof f1 + accordion checks |
| 2 | Collapse button beside the logo → 64 px rail, hover and keyboard-focus flyouts, remembered per device | MET | AppShell.test (rail, persistence); proof f2 (64 px, survives reload), f3 (Tab+ArrowDown opens flyout, Esc closes, hover opens and closes) |
| 3 | Foot slot pinned at the bottom; long menus scroll inside the menu | MET | AppShell.test "pins the foot"; proof "long menu" (1366×640) |
| 4 | Fixed header with breadcrumb, tools, UserMenu (name, roles, optional 2-step mark, My settings, language segments, Sign out) | MET | UserMenu.test; proof f4 (language choice keeps menu open; Esc returns focus) |
| 5 | Page area the only scroller, header and menu never move, full width, 24 px padding, no cap | MET | AppShell.test "layout contract" + source guard; proof "scroll" (header/menu rect unchanged, document not scrolled, `main.scrollTop>0`) and 1920 px content box |
| 6 | Under 1024 px: menu button, slide-out over scrim, Esc / tap outside closes, focus kept inside, returns to button, same menu | MET | AppShell.test "narrow slide-out"; proof f5/f6 (820 px), 390 px no sideways scroll |
| 7 | PageHeader; EmptyState reused | MET | UserMenu.test (PageHeader); proof f7 |
| 8 | Accessible names, `aria-expanded`, `aria-current`, visible focus rings | MET | tests above; axe in f1, f2, f3, f4, f6, f7: 0 violations incl. colour contrast, with the two documented rule exceptions below |
| 9 | Tests for every state + rendered screenshots | MET | `runs/change-30/evidence/frames/01…07*.png` |

Verdicts by identifier: AC-1 MET · AC-2 MET · AC-3 MET · AC-4 MET · AC-5 MET · AC-6 MET · AC-7 MET · AC-8 MET · AC-9 MET (rows 1–9 above, in order).

Manual verification (frames): 01 open menu (packhouse teal, 1440), 02 rail, 03 rail + flyout, 04 user menu, 05 narrow header (820), 06 slide-out (820), 07 DC yellow + EmptyState. Expected: as the plan's mockup frames 1–6 with the three confirmed differences. Actual: matches; menu width 240 (token) vs the mockup's 248.

axe exceptions (recorded, not hidden): `region` off throughout (page-level rule, not this component); `aria-hidden-focus` off in f3 and f4 only: Radix NavigationMenu's own off-screen focus proxy, and Radix DropdownMenu hiding the page behind its open modal. In the happy-dom unit axe run colour contrast is off (no layout there); contrast is measured in the real browser.

Overall QA verdict: PASS
