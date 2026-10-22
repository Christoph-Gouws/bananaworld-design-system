# Known issues — CR-DESIGN-SYSTEM-021

## K-1 — `next` override floor raised (dependency audit was red on `main`)
`pnpm audit --prod --audit-level=high` failed before any change here: two new advisories on the `next` PEER (critical GHSA-2464-fhr4-w9xw RCE and high GHSA-p3m5-59mp-jv5r DoS; vulnerable ≤ 15.5.27, patched ≥ 15.5.28). Same path as the existing `next@<15.5.24` override, so the same owner-chosen remedy was applied (floor via override, never an ignore; D-12 2026-08-14, CR-DESIGN-SYSTEM-009 2026-09-09): `next@<15.5.28` → `^15.5.28`, lockfile regenerated (next 15.5.28). Only this repo's CI closure moves; `peerDependencies.next` stays `^15.0.0`, so no consumer's resolution changes. After: no unignored high/critical. Owner may revert if they prefer to handle it in its own change; without it CI's audit job fails regardless of this change.

## Residuals from the plan
- **R1** `Delete` = clear (decision, pinned by a test, logged).
- **R2** At max a further digit is a silent no-op; keys are not disabled so focus is kept.
- **R3** 12 tab stops; no roving focus. Digits typed anywhere in the pad are the fast path.
- **R4** The kit has no gallery tooling: the state gallery is `runs/change-19/evidence/browser-proof/main.tsx` plus frames.
- **R5** DC's private `KpiCard` (`ManagerHomeDashboard.tsx:212-251`) duplicates what `ListCard` composes; DC's lane.
- `words` is optional and 4 lines; first thing to cut if judged premature.

## Cross-app seams (plan §10)
- **S1** DC: CR-DC-256 bumps its pin to the MERGED sha (never a branch sha) and re-exports `Keypad`, `ActionTile` through `src/components/ui/index.ts`. Not done here.
- **S2** CRM, RMS, Org Admin, Manga Verde: nothing owed; names arrive at their next bump.
- **S3** The count: the app owns the string; the pad never judges it (CR-DC-256 server rules).
- `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist (noted again).

## Not run / not claimed
CI (conductor polls it). CRM/RMS/Org Admin/Manga Verde code (unreadable). Real iOS/Android devices: touch was emulated in Edge (`hasTouch`).
