# Defect log — CR-DESIGN-SYSTEM-006

**Open defects: 0.** Found: 1. Closed: 1.

## 1. Defects found and closed in this session

### D-1 — the dependency-audit probe reported all six standing ignores as BLOCKING (medium, CLOSED)

| Field | Value |
|---|---|
| Where | the throwaway Node reproduction of `pnpm audit --prod --audit-level=high` (`pnpm audit` itself is permission-blocked in build sessions) |
| Symptom | first run printed **`VERDICT: 6 blocking, 0 on the standing ignore list`**, with an **empty** GHSA column on every row |
| Cause | the probe read `a.github_advisory_id`, **a field that does not exist** in the npm bulk-advisory response. Every id came back `""`, so nothing matched `package.json`'s `pnpm.auditConfig.ignoreGhsas`. The id actually lives in `a.url` (`https://github.com/advisories/GHSA-…`) |
| How it was caught | **by reading the output, not the verdict** — handover note 10's standing instruction. The empty id column was visible on all six rows |
| Fix | extract the GHSA with `/GHSA-[0-9a-z-]+/` from `a.url`, and **hard-fail the probe** (`exit 5`) if any id parses empty, so this failure can never again be silent |
| Re-run | **`VERDICT: 0 blocking, 6 on the standing ignore list`** — matching CR-005's close |
| Severity | **medium** — it never touched shipped code; it would have caused a false CHANGE_BLOCKED or a bogus escalation to the owner |
| Status | **CLOSED** |

🔴 **Third audit probe in a row to be wrong on its first run** (CR-004's mis-parsed pnpm's
peer-suffixed store dirs; CR-005's walked a symlink's lexical parent and compared numeric ids to GHSA
strings; this one read a non-existent field). The two sanity checks from handover note 10 — closure
≈70 packages, `nanoid@3.3.18` present — **both passed on the first run and did not catch this**,
because the bug was downstream of them, in the *matching* step rather than the *walking* step.

**Carried forward as a third sanity check** (`developer-handover.md` §4): a probe must assert that
**every advisory id it parses is non-empty and matches `/^GHSA-/`** before it compares anything. A
probe that cannot name an advisory cannot classify one.

## 2. Findings that are NOT defects — recorded so they are not re-found

### N-1 — mutation M-3 was not caught by any spec

Not a defect in the specs: **M-3 is not a behaviour change.** twMerge collapses a duplicated
`align-middle` before the class string is emitted, so the DOM is identical. Measured, not argued —
the full **320-row authoring matrix diffed byte-identical** between the shipped component and the
M-3 mutant (`test-results.md` §4.1). Reported as **not caught** rather than rounded up to 4/4, and
**M-5 was added** to cover the genuinely-visible positional bug in the same family (T-8 catches it).

### N-2 — `valign="middle"` produces a different class *order* from the default

`px-3 py-2 text-left align-middle` versus `px-3 py-2 align-middle text-left`. **Not a defect and not
a regression**: no caller can pass the design-system `valign` prop today, so no existing string
changes. The order differs because asking emits the class *after* `className` (so the prop wins,
T-7) while the default emits it *in place* (so today's `className` workaround still wins, T-8).
Tailwind utilities are order-independent unless they conflict, and there is exactly one vertical
class either way. **T-5 asserts the class *sets* are equal**, deliberately, rather than the strings.

### N-3 — a snapshot file appeared modified during testing

`tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` showed as `M` in `git status` after a
vitest run. **Content diff empty** — vitest rewrote it with LF endings against a CRLF checkout. It
was **restored with `git checkout`** and is not part of this change. Recorded so the next session
does not mistake it for a real snapshot change.

### N-4 — `pnpm audit`, `pnpm lint`, `pnpm audit:deps`, `pnpm format:check`

Not defects in this change: two do not exist in this repo, one is permission-blocked, one fails
repo-wide on files this change never opened. All four are recorded with their causes in
`known-issues.md` §C. Nothing was invented to make them pass and no script was added.

## 3. Deferred to a named owner — nothing dropped

| # | Item | Owner | Trigger |
|---|---|---|---|
| 1 | Grep for `valign` before bumping this package's pin | **each of CRM, RMS, org-admin, Manga Verde**, in its own lane | that repo's pin bump. §2.5 residual; DC already proven clean |
| 2 | Opt the CRM sales order grid into `valign="top"` | **the CRM's own change** | after this merges **and** the CRM bumps its pin to the **merged `main`** sha (never a branch sha — KI-M001E19-002) |
| 3 | Whether DC folds its hand-rolled sales-order `<td>`s back onto `TableCell` | **DC's lane** | DC's discretion (OQ-5). Take it or refuse it |
| 4 | `TableHead` gaining `valign` | **a future change, if a caller ever asks** | `technical-debt.md` TD-1 (OQ-4) |
| 5 | **GHSA-fxqj-rqcc-2cmp** — an incomplete fix of the already-ignored GHSA-6g55-p6wh-862q | **owner** | moderate, below the blocking threshold. The sharp/next ignores' own revisit trigger is "when the estate advisory batch bumps next". `known-issues.md` D-1 |
| 6 | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` | **owner** | **sixth** consecutive change to raise it. A governance decision, not a change's to invent |
| 7 | ⚠ Two dirty paths in the read-only `bananaworld-dc` worktree, one modified **during** this session by another process | **conductor / owner** | this session issued reads only. Full disclosure in `known-issues.md` **A-2** |
