# Known issues — CR-DESIGN-SYSTEM-013

## A. Plan fit (premise check, done before any edit)
Every file, function and line range the plan cites was re-opened on the fresh `main@26fa005`: all exact
(`table-controls.ts:178-211, 215-224, 231-238, 293-298`; `grid-view.ts:163-172, 180-184, 193-199`;
`MultiSelectMenu.tsx:92-102, 196-247`; `GridFilterRow.tsx:87-92, 283-374, 507-522`;
`DataTableToolbar.tsx:228-238, 320-430`). **Nothing moved.** The plan's search terms were re-run on the final tree;
no site outside the plan's list handles a tick-list value.

## B. Estate tooling (outside this lane)
- **B-1 archive numbering collision.** Sessions pick `runs/change-NN/` by their own rule (CR-011: "CR № − 1"); the
  change runner assigns its own. Here both chose `change-10`. Handled by moving CR-011's files (D-5); the fix is for
  the runner to take the next free slot.
- **B-2 `quality-sensors.mjs` did not register a `QUALITY-JUSTIFY RC-05` in a NEW file** (the same justification text
  copied into an untracked file was also ignored). Not relied on — the split removed the finding. Plus the standing
  CRLF bug (normalise to LF before running).

## C. Consumers — the follow-up changes (plan §7, the intersection map)
- **S1 — CR-DC (new).** Bump the pin to the **merged** `main` sha; `grid-props.ts:95` → `selectAll: "allTicked"`;
  `grid-state.ts` appends `f_<key>_not`; `grid-request.ts:315-339` reads it under the same `MAX_FILTER_VALUES` clamp,
  and `:413-435` dropped-filter detection learns `_not`; `select-values.ts` twins extend to
  `gridFilterExclude/Excluded`; `sql.ts:135-143` emits `AND (expr IS NULL OR expr NOT IN (…))`; echo/PDF/summary say
  "All except …". Existing include-list definitions must round-trip byte-identically. **All in one change** — a
  cell flipped before its parser learns `_not` would show "5 of 6" while the query shows everything.
- **S2 — CR-CRM (new).** Pin bump on the merged sha; flip `selectAll` per def; store
  `storedExclusionFromFilterValue` beside the existing value **in the same change**; check any exhaustive `switch`
  over `selectAll` (the literal union widened). **Unverified here — CRM is unreadable from this worktree.**
- RMS, org-admin: nothing required; they render nothing new unless they opt in.

## D. Standing, carried
- `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — tenth change to raise it (owner decision).
  S1/S2 above and plan §7 are the record in its place.
- No `lint` script / ESLint config; no prettier config; the `.snap` CRLF artifact. Out of lane.
- No consumer suite was run (consumer repos cannot be run from a build worktree).
- 4 inert `ignoreGhsas` entries still await a housekeeping change (owner's call). This change added an override,
  not an ignore.
- The real-browser proof (`runs/change-10/evidence/browser-proof/proof.mjs`) is not in CI: this repo has no
  browser-test tool. `technical-debt.md` TD-2.
