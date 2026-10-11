# Changed files — CR-DESIGN-SYSTEM-018

Code (shipped or tested):
- `src/components/NavigationBusy.tsx` (new: provider, bar, hook, internal delay and report hooks)
- `src/components/Link.tsx` (`pendingIndicator` prop, provider branch, `LinkPendingMark`, guarded `useLinkStatus`)
- `src/components/index.ts` (export block after `Link`)
- `package.json` (version 0.2.0 → 0.3.0; no dependency, export-map or peer change)
- `README.md` ("Navigation busy signal" section, 0.3.0 changelog line)
- `tests/components/NavigationBusy.test.tsx` (new)
- `tests/components/Link.additive.test.tsx` (new: byte-identity against a frozen copy)
- `tests/components/fixtures/Link.frozen-820c980.tsx` (new: frozen `Link` from `820c980`)
- `tests/components/fixtures/next-link-mock.tsx` (new: controllable `next/link` stand-in)
- `tests/components/DragBoard.additive.test.tsx` (3 names added to `ADDED_SINCE_011`)

Fixture app (real-browser proof, not shipped; `files: ["src"]` excludes it):
- `runs/change-16/evidence/nav-busy-fixture/**` (Next app, no `loading.tsx`; `proof.mjs` driver)

Paper trail:
- `runs/change-16/output/*` (incl. `mutation-battery.mjs`)
- `runs/change-16/evidence/*` (incl. `frames/01`–`08`)
- `runs/current/logic-plan/CR-DESIGN-SYSTEM-018.md` and `.estimate.json`, `runs/current/mockups/CR-DESIGN-SYSTEM-018/`
- `runs/current/SESSION_HANDOVER.md`, `runs/current/active-milestone.md`
- `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`

Not touched: `src/lib/tokens.css`, `pnpm-lock.yaml`, every other component, `tests/components/__snapshots__/*` (the CRLF artefact was reverted, not staged). Deleted: none.
