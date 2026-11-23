# Developer handover — CR-DESIGN-SYSTEM-034

**Next agent:** CR-BANANAWORLD-PH-016 (the packhouse landing dashboard). **Next action:** pin the MERGED sha on `main` (never the branch sha), then pass `topItems={[{ id: "dash", label, href: "/dashboard", icon, exact: true, hidden }]}` to `AppShell`.

**State:** built, green, pushed on `change/cr-design-system-034`; the conductor opens the PR. Kit 0.15.0. Archive `runs/change-32/`. Results and measurements: `runs/change-32/output/test-results.md`; frames and the Edge proof: `runs/change-32/evidence/`.

## Rules for the next session (the contract)
1. 🔴 **Absent means absent.** No `topItems`, `[]` or all hidden renders the f5ec58c HTML byte for byte (`tests/components/AppShell.topitems-absent.test.tsx` against `fixtures/app-shell-034-frozen.ts`). Never regenerate that fixture; never add an empty wrapper.
2. 🔴 **The kit decides no permission.** `hidden` on a top item is the app's word (rule lives once in `visibleTopItems`, `src/components/app-menu.ts`). Keep server-side route checks.
3. **Set `exact: true`** on a top item whose path prefixes other screens, or it is marked together with the screen under its heading. Foot items still match by exact href (unchanged).
4. **Rail:** the top item is a `NavigationMenu.Link` inside the List (no Trigger, no Content, no flyout); Tab and arrow keys treat it like a heading icon. Do not move it outside the List (a mutant proves the specs catch it).
5. `AppMenuTopItem` is type-only (barrel line 299, one name added to an existing line); `index.ts` stays at 299 lines — never run prettier on it.
6. `AppShell()` sits at the 50-line sensor limit; the open/rail memory is the private `useMenuMode` hook.
7. Test command: `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=60000`; restore `tests/components/__snapshots__` after a run (CRLF artefact, do not stage). On a CRLF checkout use `prettier --end-of-line auto --print-width 100`.
8. Proof tooling is committed: `runs/change-32/evidence/browser-proof/proof.mjs` (Edge, via `pnpm dlx` for Tailwind + playwright-core) and `runs/change-32/output/mutation-battery.mjs`.

**Owed:** PH-016 pins the merged sha and wires `topItems`; DC + CRM re-check not run (`known-issues.md` K-1).
