# Known issues — CR-DESIGN-SYSTEM-018

**Plan premise check:** everything the plan cites is as described on the fresh `main` (`820c980`). No stop.

1. **Programmatic navigation and back/forward do not show the bar.** Named in the owner brief. A later additive change can add a transition helper if a consumer needs it.
2. **Only kit `Link`s feed the signal.** Plain `next/link` links do not. Whether Org Admin's navigation uses the kit `Link` is unverifiable from here (S1).
3. **`next` older than 15.3:** a consumer that mounts the provider gets a bar that never shows, not a crash (tested).
4. **Bar placement:** it is `sticky top-0` inside its parent, so it sits at the top of the parent's content box. Put it outside any padding (README).
5. **The fixture ran inside the worktree, not in `%TEMP%`.** The session may only touch the worktree and the read-only DC repo, so the fixture is run in place (`runs/change-16/evidence/nav-busy-fixture/`), resolving `next`/`react` from the kit's own `node_modules` (one React copy) and the kit by tsconfig path. Its `node_modules`, `.next` and generated files were deleted afterwards.
6. **Local `pnpm audit` could not run** (sandbox). No dependency changed; CI runs it.

## Cross-app seams (the plan's S1–S4; no cross-system register exists)
| # | Seam | Follow-up |
|---|---|---|
| S1 | Kit → Org Admin (CR-ORGADMIN-015) | Org Admin mounts the provider in `app/(console)/layout.tsx`, places the bar outside its padding, sets `aria-busy` on `<main>`, pins the **merged** sha (never the branch sha), confirms it uses the kit `Link` and that its Tailwind `content` scans the kit's `src/` |
| S2 | Kit → DC (pin `cde6f4e`) | None. Only if DC's draft-PR proof (#478/#479) shows the same stall does DC mount the provider, in its own change |
| S3 | Kit → CRM, RMS | None, by construction (no provider ⇒ today's `Link`) |
| S4 | Next's `useLinkStatus` → kit `Link` | Read-only dependency on a framework hook (15.3+), guarded fallback |

Standing, carried: no `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` (thirteenth change to raise it); the `.snap` CRLF artefact (reverted, never staged).
