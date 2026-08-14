# Known issues — CR-DESIGN-SYSTEM-004

> **Open defects: 0. Open decisions: 0.**
> Nothing below blocks the PR. Everything below is recorded so the next session does not rediscover it.

## A. Deviations from the approved plan

### A-1 — the arithmetic spec lives at `tests/components/table-paging.test.tsx`, not `tests/lib/`

The plan (§8.1) names `tests/lib/table-paging.test.ts`. **`vitest.config.ts` globs only
`tests/pricing/**`, `tests/sales-order/**` and `tests/components/**/*.test.tsx`** — a file at the
plan's path would never have been collected, and the suite would have gone green with sixteen specs
silently absent. The plan also lists `vitest.config.ts` among the files not to touch (§6.2).

This repo already resolves the tension: `table-controls.ts` is a `src/lib` module whose suite lives
at `tests/components/table-controls.test.tsx`. I followed that precedent. Same specs, same coverage,
no config edited, and the approved approach is untouched — it is a path, not a premise.

**No other deviation.** The plan's cited facts were all verified exact before building
(`implementation-summary.md` §0); nothing had moved on `main`.

## B. Limits of this session — stated, not worked around

| # | Limit | Consequence |
|---|---|---|
| B-1 | **Consumer repos cannot be read or run from this worktree** (paths outside it are permission-blocked). Fourth change to record it | DC / CRM / org-admin / RMS suites were **not** executed and nothing claims they were. The additive claim rests on the diff — `+24 / −0`, zero deletions — which anyone can check without them |
| B-2 | **`pnpm audit` is permission-blocked** in a build session | CI's job was reproduced in Node against npm's bulk advisory endpoint (CR-003's method): 6 highs, all six on the standing owner-approved ignore list, 0 new. `pnpm audit` itself is **not** claimed as run. CI's own job is authoritative |
| B-3 | **`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` is outside this workspace and the read was refused** | The template could not be copied and filled in as instructed. `evidence/milestone-evidence.md` was authored to serve the same purpose and follows the stated rule — it **cites** each discrete artifact by path, status and counts rather than restating it. Fourth change to hit this |
| B-4 | **No browser and no deployed instance in this lane** | The control is proved in happy-dom against Radix's real DOM output — roles, accessible names, focus order, disabled states. A real screen reader and real widths are deferred to the first adopting screen (`deployed-verification.md` §5) |

## C. Pre-existing repo drift — out of lane, not caused here

| # | Item | State |
|---|---|---|
| C-1 | **`pnpm format:check` fails repo-wide.** There is **no prettier config**, so the default 80-column width disagrees with the repo's ~100-column house style | Verified this session: `Button.tsx`, `Select.tsx`, `Table.tsx` and `table-controls.ts` — **all untouched by this change** — fail identically at `HEAD`, exactly as the new files do. The new files match the repo's real style; reformatting only them to 80 columns would make them the odd ones out. Not a CI job. Fixing it properly means adding a config and reformatting the repo — a change of its own |
| C-2 | **There is no `lint` script and no eslint config** in this package. `pnpm lint` exits with `Command "lint" not found` | Recorded, not invented. The PR checklist's "`pnpm lint` clean" cannot be satisfied because the script does not exist |
| C-3 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no `governance/` directory** | **Fourth change running to raise it** (CR-001 D-12, CR-002 D-10, CR-003 §7). Creating one is a governance decision for the owner. The five seams in `centrality-scorecard.md` §2 are the record meanwhile |
| C-4 | **`ci.yml`'s test job label is stale** (SESSION_HANDOVER §8) | Untouched. Cosmetic, out of lane |
| C-5 | **`git status` shows the toolbar snapshot as `M` on this Windows worktree** | Not a change: `git diff` reports no content difference and the sha256 is still `ce7bd849…`. A CRLF/stat artefact. The file is deliberately **not staged** |

## D. Watch items for the next session

| # | Item |
|---|---|
| D-1 | 🔴 **CR-DC-052 is not unblocked when this merges.** It is unblocked when this merges **and** DC's pin bump merges — two changes, two lanes, in that order, and the pin must move against the **merged** `main` sha, never a branch sha (KI-M001E19-002) |
| D-2 | 🔴 **The trap is written down, not enforced.** A consumer that pages on the server and still uses `useTableControls` for search/filter gets a search box that hides matching records. Option (a)'s stated cost. `technical-debt.md` TD-1 |
| D-3 | ⚠ **Do not inherit "the CRM uses neither yet" as fact.** The request says so; CR-003 read CRM's `AvailabilityView.tsx` rendering `DataTableToolbar` with five select filters. Nothing here depends on which is right — but check before relying on it |
| D-4 | ⚠ **The recorded consumer pin values disagree between documents** and are not checkable from a build worktree. Read the app's own `package.json` (SESSION_HANDOVER §1) |
| D-5 | **Three lines in `TablePagination.tsx` must not be "tidied":** only the top bar carries `role="status"` (two live regions announce every page change twice); the picker renders in the top bar only (two pickers are two sources of truth); and clamping must never fire a callback (a re-render loop). All three are fenced in the source **and** pinned by specs that fail loudly |
| D-6 | **Per-user / per-list page-size memory was raised and deliberately not built** (D-14, plan Q3). If the answer ever becomes yes, CRM already persists per-rep view state (CR-CRM-011) and that is where the pattern would come from — a separate change |
| D-7 | **Option (b) remains available and is itself additive.** If a controlled/server toolbar mode is ever wanted, adding it later costs nothing that was foreclosed here — and by then CR-DC-052 will have supplied the real caller to design against |
