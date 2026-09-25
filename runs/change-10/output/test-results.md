# Test results — CR-DESIGN-SYSTEM-011

> 2026-09-25. Rehearsed locally BEFORE the PR (the consuming app's lesson, EPIC-028-M-02: a PR shipped
> untested went red). This repo cannot be cloned from the session, so the branch tree was unpacked from the
> `main` tarball and the change written onto it; `main` itself was unpacked beside it untouched. Both were run
> the same way, with the consuming app's `node_modules` resolving React, vitest and the testing library.

## 1. The suite — branch vs untouched `main`, same runner

| Tree | Files | Tests |
|---|---|---|
| `main` @ `8387f66b` | 17 (16 pass, 1 fail) | **377**: 370 passed, **7 failed** |
| branch | 19 (18 pass, 1 fail) | **400**: 393 passed, **7 failed** |
| delta | **+2** | **+23** = `DragBoard.test.tsx` 19 + `DragBoard.additive.test.tsx` 4 |

🔴 **The 7 failures are the SAME 7 on untouched `main`**: `DataTableToolbar.test.tsx`'s seven screen
snapshots. They are the rehearsal runner's, not this change's — the consuming app runs vitest **2.1.9** (this
repo pins **4.1.11**; the snapshot serialiser and the Radix versions it resolves differ), and one runner cannot
host the package's two `projects` (vitest 2 has no `projects` key), so both of its projects ran in one
happy-dom project. This repo's own `main` records **377 / 17 green** on its own runner
(`runs/current/active-milestone.md`, CR-010), which the 377 above matches. **The authority is this repo's CI on
the PR.**

## 2. Typecheck — `tsc --noEmit -p tsconfig.json`

Branch and `main` report the **identical single error**, in `vitest.config.ts` (`projects` is unknown to the
rehearsal runner's vitest-2 types). `src/**` and `tests/**` — including the new files and the
`satisfies GridHeadCellProps` check — are **clean**.

## 2a. The estate quality sensors

`quality-sensors.mjs --changed` over the seven changed files: **0 open findings** (after the RC-05 split —
`implementation-summary.md` §1).

## 3. The mutation battery — `output/mutation-battery.mjs`

**11 mutations, 11 killed**, source restored byte for byte after each:

| # | Mutation | Killed by |
|---|---|---|
| M1 | the keyboard stops on a refusing place | ↓ skips the place that refuses |
| M2 | a refusing place prevents the default | a refusing place never prevents the default |
| M3 | a touch-started drag not cancelled | a drag that starts from a touch is cancelled |
| M4 | Esc does not put it back | Esc puts it back |
| M5 | the drop does not re-ask `accepts` | a refusing place takes no drop |
| M6 | still holding after a drop | ONE drop … `aria-pressed` false |
| M7 | the live region ignores `describe` | Space picks up … the live words |
| M8 | a drag from outside treated as a board drag | a drop from OUTSIDE the board is ignored |
| M9 | a drag released elsewhere not put back | a drag released anywhere else is put back |
| M10 | the keyboard line shows for a mouse drag | the mouse path (added after the FIRST run found M10 GREEN — a vacuous spec, fixed in the spec) |
| M11 | focus pulled back to the dropped item after the person moved on | focus is NEVER pulled away from wherever the person has already gone (D-4, found in the consumer's browser run) |
