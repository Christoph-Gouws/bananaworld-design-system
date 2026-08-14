# Known issues — CR-DESIGN-SYSTEM-002

## A. Attributable to this change

### A-1 — The plan's file table was one file short of its own §7.1 intent (resolved, recorded)

Plan §7 lists four source files. The change needed **five**: `src/index.ts` also had to be edited,
because it enumerates its `./lib` re-exports by name rather than starring them, so the describer
would otherwise have been unreachable from the package root.

**The approved approach is unchanged** — this is the plan's stated §7.1 intent, carried out. Logged
as defect D-1 because, unfixed, it would have surfaced in DC's lane weeks later as this change's
problem. +7 / −0, purely additive.

**Nothing else in the plan was stale.** Every fact the plan CITES was spot-checked against DC's real
source on `main` and all of it held — the twelve checks are tabled in `implementation-summary.md` §1.

### A-2 — Four ported comments were adapted rather than carried verbatim (resolved, recorded)

Decision D-6 says every fence travels verbatim with its DC anchors. Four could not: their subject was
*where the file lives*, so carried unchanged they would have been false statements in the new home —
including one instructing the reader not to perform the move that this very file **is**. Each is
listed individually with before/after and reason in `changed-files.md` §3; each keeps its DC anchor
and its reasoning. All other fences crossed verbatim (282 of 282 code lines identical).

**No other issue is attributable to this change. 0 open defects.**

## B. Limits of this session — stated, not worked around

### B-1 — DC's test suites cannot be run from here

This is a sandboxed design-system worktree: no DC checkout, no DC dependencies, no DC test runner.
DC's own `DocumentHeader.test.tsx`, its contract test and its twelve form suites are the real
regression gate for the thirteen live render sites and **they were not run**. Nothing in this pack
claims otherwise. Handed to DC's adoption change in `evidence/developer-handover.md` §3.

Same limitation CR-DESIGN-SYSTEM-001 recorded for DC's `ChoiceGroup` suite. It is structural, not
a one-off.

### B-2 — DC's source was read over the GitHub API, not from a local checkout

The filesystem outside this worktree is not readable in this session, so the DC source needed for a
faithful port — `DocumentHeader.tsx`, `document-date.ts`, and the two test files used to verify the
plan's citations — was fetched read-only from `Christoph-Gouws/bananaworld-dc` at `main` via `gh api`.

**This is a read, not a write:** no DC file was created, modified or pushed, and no PR was opened
against that repo. The fetched copies were held in an untracked scratch directory and **deleted
before staging** — `git status` confirms nothing of them is in the commit. Recorded because the port
would otherwise rest on the plan's prose summary rather than on the actual file, and a reconstructed
lookalike is exactly the drift this change exists to prevent.

### B-3 — The kernel evidence template could not be read

`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` is outside this workspace and the read
was refused, so it could not be copied and filled in as instructed. `evidence/milestone-evidence.md`
was authored to serve the same purpose and follows the stated rule — it **cites** each discrete
artifact by path, status and counts rather than restating it. Identical to the limit
CR-DESIGN-SYSTEM-001 recorded as its own B-3.

### B-4 — `pnpm audit` could not be run in this session

The command is blocked by this session's permissions. It is **not** claimed as passed.

The audit surface is nonetheless demonstrably unchanged: `package.json` and `pnpm-lock.yaml` are
untouched (`git status`), so the dependency tree is byte-identical to `main`, which is green under
the six owner-approved GHSA ignores. CI's `dependency-audit` job runs
`pnpm audit --prod --audit-level=high` on the PR and is the real gate.

## C. Pre-existing repo drift — out of lane, not introduced here

### C-1 — `pnpm format:check` fails repo-wide
44 files at last count. **All three barrels this change edits already failed at `HEAD`** — verified
by stashing the working tree and re-running prettier on the untouched files. Not worsened by this
change, and deliberately not "fixed": running `prettier --write` would reformat pre-existing lines,
inflating the diff and destroying the readability of the 0-deletions proof. CI has no format job.

### C-2 — There is no `lint` script and no eslint config
The close instruction asks for `pnpm lint` clean. **The script does not exist** (`package.json`
scripts are `typecheck`, `test`, `format:check`). Recorded rather than invented — adding a linter to
a package five repos pin is its own change with its own blast radius. Carried forward from
CR-DESIGN-SYSTEM-001 C-3.

### C-3 — `ci.yml`'s test job is still labelled "pricing & sales-order engines"
Inaccurate since CR-DESIGN-SYSTEM-001 added component tests, and more so now. It is a **label**, not
behaviour — `pnpm test` runs both projects regardless. Out of lane.

### C-4 — `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist
Nor does a `governance/` directory. Creating one is a governance decision, not part of this change
(D-10). **Second consecutive change to raise it** — CR-DESIGN-SYSTEM-001 recorded it as D-12/C-4.
The five seams in `centrality-scorecard.md` are the record in the meantime.

## D. To watch

### D-1 — The pure describer's test runs in a DOM environment
`vitest.config.ts` splits `engines` (node) from `components` (happy-dom) specifically so "a DOM
global cannot mask a leak into supposedly-pure logic". `tests/components/document-date.test.tsx`
tests pure logic under happy-dom, which slightly weakens that guarantee for this one file.

Accepted deliberately: the plan prefers no config edit (§7.3), and the risk it guards against is
covered here by a stronger instrument — test 23 scans the source directly rather than relying on an
environment to expose a leak. If a `tests/lib/` project is ever added, this file should move to it.
Reasoned through as S-5 in `simplification-opportunities.md`.

### D-2 — DC now holds two copies of the header until it bumps its pin
Expected and correct (seam S-1), but it is the window in which someone could edit DC's copy and
believe they had changed the shared one. It closes when DC's adoption change lands and deletes its
local file. **This is the strongest reason for DC's adoption change to run soon rather than sit.**
