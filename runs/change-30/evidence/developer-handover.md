# Developer handover — CR-DESIGN-SYSTEM-032

**Next agent:** the packhouse Run 2 session (office-shell-redesign), or any consumer adopting the frame. **Next action:** pin the MERGED sha on `main` (never the branch sha), then map the app's menu to `AppMenuGroup[]`.

**State:** built, green, pushed on `change/cr-design-system-032`; the conductor opens the PR. Kit 0.14.0. Archive `runs/change-30/`. Results and measurements: `runs/change-30/output/test-results.md`; frames and the Edge proof: `runs/change-30/evidence/`.

## Rules for the next session (the contract)
1. 🔴 **`AppShell` owns the one `<main>`** (`overflow-auto p-6`, no cap). An adopter removes its own `<main>`, width cap and outer padding.
2. 🔴 **The kit decides no permission.** `hidden` on an item or foot item is the app's word; hidden items are neither drawn nor counted, and a heading with no visible item disappears (rule lives once, in `src/components/app-menu.ts` `visibleMenuGroups`). Keep server-side route checks.
3. **Every word is a prop, no English default** (`AppShellWords`, `UserMenu` labels). The packhouse supplies EN + PT.
4. **Only three runtime exports** (`AppShell`, `UserMenu`, `PageHeader`). `SideMenu`, `SideColumn`, `MenuRail`, `AppHeader`, `app-menu.ts` stay private; exporting one later is additive, un-exporting never is. `src/components/index.ts` sits at the 300-line sensor line: fold comment lines to add exports; never run prettier on it.
5. **Accessible names:** counted items read "Loads 2" (visible words, WCAG 2.5.3); the user-menu trigger reads "<name> · <triggerLabel>".
6. **Rail keyboard:** focus opens a flyout, Tab enters it, ArrowDown/Up move between rail headings, Esc closes. Memory key default `bw.app-shell.menu`; read after mount (one open frame for rail users).
7. Dependencies: `@radix-ui/react-navigation-menu` is deliberately **1.2.14** (shares `react-dismissable-layer` with the rest); do not float it to 1.4.x without re-checking `pnpm why @radix-ui/react-dismissable-layer`.
8. Test command: `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000`; restore `tests/components/__snapshots__` after a run (CRLF artefact, do not stage).
9. Proof tooling is committed: `runs/change-30/evidence/browser-proof/proof.mjs` (Edge + the DC's `playwright-core`/`tailwindcss`, read-only) and `runs/change-30/output/mutation-battery.mjs`.

**Owed:** consumers pin the merged sha in their own change (S1–S8 in plan §8); DC + CRM re-check not run (`known-issues.md` K-1).
