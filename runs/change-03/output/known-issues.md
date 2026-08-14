# Known issues — CR-DESIGN-SYSTEM-003

**Open defects: 0 · open decisions: 0.** Nothing here blocks the PR. Sections B–D are limits, drift and
watch-items, recorded so the next session does not rediscover them.

## A. Attributable to this change

**None open.** Four defects were found and closed during the build; see `defect-log.md` (D-1 … D-4).

## B. Limits of this session — what could not be checked from here

| # | Limit | Consequence |
|---|---|---|
| B-1 | **DC, CRM, org-admin, RMS and Mangaverde are not checked out in this worktree, and paths outside it are permission-blocked** | The eleven call sites could not be re-read or executed here. Their declarations are transcribed from the approved plan's inventory (§1.1/§1.2) and labelled as such in `test-results.md` §2 and `qa-report.md` §4. **No consumer suite was run and nothing claims one was.** Same limitation CR-DESIGN-SYSTEM-001 and -002 recorded |
| B-2 | **`pnpm audit` is permission-blocked in build sessions** | Reproduced in Node against npm's bulk advisory endpoint over all 142 installed packages: 6 highs, all 6 already on the standing ignore list, 0 new. CI's own Dependency Audit job stays authoritative (`test-results.md` §5) |
| B-3 | **`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` is outside this workspace and the read is refused** | The template could not be copied and filled in as instructed. `evidence/milestone-evidence.md` was authored to serve the same purpose and follows the stated rule — it **cites** each discrete artifact by path, status and counts rather than restating it. Recorded, not silent. Third change to hit this |
| B-4 | **No browser, no deployed instance, and no screen that declares the new kind** | The control is proved through Radix's real DOM output in happy-dom, including a keyboard-only path. Real-hardware tablet verification belongs to the first adopting screen (`deployed-verification.md` §4) |

## C. Pre-existing repo drift — not caused here, not fixed here

| # | Item | Evidence it pre-dates this change |
|---|---|---|
| C-1 | `pnpm format:check` fails on the five files this change edits | **Verified by stash:** all five already failed at `HEAD` with the working tree removed. Repo-wide drift (44 files at CR-002). `format:check` is **not** a CI job, so this blocks nothing. Reformatting them would bury a 5-file additive diff inside a whole-file reflow |
| C-2 | **There is no `lint` script and no eslint config in this package** | `package.json` has `typecheck`, `test`, `format:check` and nothing else. The runner's standard instruction to run `pnpm lint` therefore cannot be honoured — recorded rather than invented. Both other gates ran clean |
| C-3 | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist, and there is no `governance/` directory | Verified by glob. CR-DESIGN-SYSTEM-001 recorded it as D-12, -002 as D-10, and this is the **third** change to raise it. Creating one is a governance decision, not part of a package change. The six seams are recorded in `developer-handover.md` §4 instead |
| C-4 | **The recorded consumer pins disagree with each other** | `SESSION_HANDOVER.md` §1 says DC `b1373c78` / CRM `4bc1f220`; the approved plan §1.4 says both are `365be65`, read from each app's `package.json` at plan time. Neither is checkable from here. **It changes nothing in this change — no pin is bumped** — but whoever bumps first should read the app's own `package.json` rather than either document |
| C-5 | `ci.yml`'s test job is still labelled *"Test — pricing & sales-order engines"* although it runs the whole suite, components included | Cosmetic, pre-existing, and outside this lane. Carried from CR-002's known-issues |

## D. To watch — named, deliberately not fixed

| # | Item | Why not fixed here |
|---|---|---|
| D-1 | **DC keeps a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing in DC imports.** It will not gain the new kind and drifts further with this change | Another repo, another lane (plan D-15, seam S-4). Deleting a file in DC from here would be a lane violation. DC's adoption change should delete it |
| D-2 | **`values` in a multi-select is normalised to the displayed option order on every toggle, which silently drops a chosen value the data no longer offers** | Correct for the toolbar — the rep only sees what the menu shows. But a consumer calling `setFilter` directly (org-admin constructs `FilterValue` literals) keeps whatever it sets until the next toggle. Stated so nobody reads the normalisation as a validation guarantee |
| D-3 | **The stored-shape contract does not carry date ranges.** `string \| string[]` cannot express two bounds, so a `dateRange` always reads back cleared with `widened: true` | Deliberate and documented in the source. CRM's availability screen has no date filter, so nothing needs it today; a consumer that persists date ranges needs its own shape and will see `widened: true` rather than silence |
| D-4 | **The multi-select trigger's accessible name is `Filter by {label}`, matching the Select's**, so a screen-reader user tabbing past a *set* filter hears the label but not the chosen values | Not introduced here — today's single-select has exactly the same gap, and matching it was the deliberate choice (D-6's one-vocabulary rule). Each menu item announces its own checked state, which is what the approved mockup promises. Worth a package-wide look if the owner ever wants it, for **both** kinds at once |
| D-5 | **`DataTableToolbar.tsx` now holds three controls in one file (~450 lines)** | Splitting would make an additive change read as a restructure. The note in `readable-code-scorecard.md` says to split if a fourth kind arrives |
