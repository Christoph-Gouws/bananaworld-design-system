# Test results — CR-DESIGN-SYSTEM-034 (kit 0.15.0)

Commands (package root):
- `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000` → **45 files, 870 passed, 0 failed** (baseline at `f5ec58c`: 850; +20 new: `app-menu.test.tsx` +2, `AppShell.test.tsx` +6, `AppShell.topitems-absent.test.tsx` 12 frozen-HTML specs). Existing specs are unedited.
- `pnpm typecheck` → clean. `pnpm audit --prod --audit-level=high` → same result as main (no dependency changed; 2 high already ignored). `prettier --check --print-width 100 --end-of-line auto` on the touched files (not `index.ts`) → clean. `quality-sensors.mjs` on the six changed source files → 0 open findings; `index.ts` still 299 lines.
- `node runs/change-32/output/mutation-battery.mjs` → **13/13 mutants killed** by a named spec (top items after the accordion; current by href equality in the open menu and in the rail; hidden not filtered in the helper and in AppShell; an empty `<ul>` when no items; rail link without `aria-label`; rail link not a `NavigationMenu.Link`; slide-out link without `onNavigate`; slide-out without top items; the inset bar dropped in the open menu and in the rail; a chevron drawn on the top item).
- `pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-32/evidence/browser-proof/proof.mjs` (real Edge) → **42 PASS, 0 FAIL, ALL PASS**.

## Acceptance criteria

| # | Criterion | Verdict | Where |
|---|---|---|---|
| 1 | `topItems?: readonly AppMenuTopItem[]` (the foot-item shape plus `exact`) added to `AppShellProps` | MET | typecheck; `app-menu.ts`, `AppShell.tsx`; barrel line 299 |
| 2 | Open menu: item row with its icon above the first heading, no chevron, no `aria-expanded` | MET | AppShell.test "top items: open"; proof "open: above the first heading / no chevron" (teal + yellow) |
| 3 | Rail: icon with the label as tooltip and accessible name, no flyout | MET | AppShell.test "top items: rail"; proof "rail: name, tooltip shows the label, no flyout" |
| 4 | Slide-out: first in the menu; choosing it closes the menu | MET | AppShell.test "top items: slide-out"; proof "slide-out: first link, current, closes" at 390 px |
| 5 | Current by `isMenuItemCurrent`, `exact` honoured, kit "on" style (teal fill and inset bar); `aria-current` on the current one | MET | app-menu.test "top items"; AppShell.test (open, rail, no-exact); proof "the on style is drawn" |
| 6 | Keyboard reachable in all three modes | MET | AppShell.test rail (Tab, ArrowDown to the first heading) and slide-out; proof "Tab Tab lands on Dashboard", "rail keyboard reaches Dashboard", "ArrowDown moves to the first heading" |
| 7 | `hidden` items never drawn, in all three modes | MET | AppShell.test "hidden"; app-menu.test `visibleTopItems`; frozen "only hidden" specs |
| 8 | Additive: no `topItems` renders exactly as today | MET | `AppShell.topitems-absent.test.tsx`: undefined, `[]`, only hidden × open, rail, slide-out, server render, all equal to the HTML frozen at `f5ec58c` |
| 9 | Unit tests for open, rail, slide-out, current, hidden, absent | MET | the files above |
| 10 | Rendered screenshots of the three modes | MET | `runs/change-32/evidence/frames/01…05*.png` |
| 11 | Minor version bump | MET | `package.json` 0.14.0 → 0.15.0 |

Verdicts by identifier: AC-1 MET · AC-2 MET · AC-3 MET · AC-4 MET · AC-5 MET · AC-6 MET · AC-7 MET · AC-8 MET · AC-9 MET · AC-10 MET · AC-11 MET.

Manual verification (frames): `01-open-dashboard-current-teal/yellow` (Dashboard current: teal fill + inset bar, above six headings, no heading marked); `02-open-other-current-*` (Loads current, Dashboard plain); `03-rail-tooltip-*` (icon first in the 64 px rail, focused, tooltip "Dashboard"); `04-slide-out-*` (390 px, Dashboard first); `05-absent-control` (no `topItems`: menu starts at the first heading). Expected: as the owner-approved mockup (option A, no divider). Actual: matches (frames 01 and 03 viewed).

axe (incl. colour contrast): 0 violations in the open menu, rail and slide-out, in teal and yellow. Only `region` is off (page-level), and `aria-hidden-focus` in the rail (Radix NavigationMenu's own focus proxy, as in CR-DESIGN-SYSTEM-032 K-3).

Overall QA verdict: PASS
