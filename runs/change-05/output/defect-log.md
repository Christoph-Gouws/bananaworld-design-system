# Defect log — CR-DESIGN-SYSTEM-005

> Stage 04. **1 defect found, 1 closed. 0 open.** Plus 5 "checked and not a defect" records and
> 3 items deferred to their named owners.

## 1. Defects

### DEF-1 — the audit probe reported a false verdict on its first run — **CLOSED**

| Field | Value |
|---|---|
| Severity | **Medium** (tooling; would have produced a false evidence claim, in either direction) |
| Found | While reproducing CI's dependency-audit job in Node — `pnpm audit` is permission-blocked here |
| Symptom | First run printed `PROD CLOSURE: 16 package versions`, `nanoid versions present: []`, and **3 BLOCKING** advisories |
| Cause | **Two independent bugs in the probe, both in the direction of a wrong answer.** (1) The module walk used a lexical `join(dir, "..")`, so from `node_modules/next` — a **symlink** into pnpm's `.pnpm` store — it walked the link's apparent parent instead of the real store directory, and never saw any transitive dependency of `next`. That is why nanoid was missing and the closure was a quarter of its true size. (2) The ignore check compared npm's **numeric** advisory `id` (`1124185`) against the repo's list of **GHSA** strings, which can never match, so all six standing owner-approved ignores read as BLOCKING |
| Fix | `realpathSync` on every resolution step, and `dirname` instead of a lexical join; GHSA extracted from the advisory `url` when `github_advisory_id` is absent |
| Verified | Re-ran: **72 package versions**, `nanoid@3.3.18` present (confirming the override works), **6 highs, all six on the standing ignore list, 0 blocking** — which is exactly the shape CR-004 recorded |
| Impact on the change | **None.** No source or test file is involved; the probe is a throwaway that was deleted. The only impact would have been a false line in the evidence |
| Status | **CLOSED** |

🔴 **This is the second consecutive change whose audit probe lied on its first run** (CR-004's DEF-2
mis-parsed pnpm's peer-suffixed store directory names). Different mechanism, identical lesson, and the
lesson is the standing instruction that caught it: **read the output, do not take the verdict.** A
16-package closure for a repo with 13 direct dependencies plus `next` is not plausible, and that
implausibility — not the exit code — is what exposed it. Carried into `known-issues.md` D-1 and the
session handover so the next probe starts from a correct one rather than a third rediscovery.

## 2. Checked, and NOT a defect

| # | Thing | Finding |
|---|---|---|
| NAD-1 | One existing assertion was edited — is that a regression? | **No — narrowed, never relaxed, and declared at planning time (plan F-9 / §5.2).** The spec `"reads NO session"` scanned for `label="DC" value={props.origin.dcName}`; the label half necessarily moved. It now scans for `value={props.origin.dcName}` — the half that carries the session claim — **plus** `label={props.dcLabel ?? "DC"}`. The file asserts strictly **more** after the change. Mutations M-1 and M-2 both redden it, so it is not a weakened check |
| NAD-2 | `src/` is `+30 / −1`, not the plan's `+15 / −1` — is that scope creep? | **No.** The extra 15 lines are entirely the two fence comments written out in full. Zero extra behaviour, zero extra API. Recorded in `revision-review.md` DEV-1 rather than left to be noticed |
| NAD-3 | `pnpm format:check` fails on both changed files | **Pre-existing repo-wide drift, not caused here.** Verified this session against **four files this change never touched** (`Input.tsx`, `TablePagination.tsx`, `src/index.ts`, `src/components/index.ts`) — all four fail identically. There is no prettier config, so prettier's default 80-column width disagrees with the repo's house style. **Not a CI job** (`ci.yml` runs typecheck, test, dependency-audit, SAST, secret-scan). 🔴 `prettier --write` was deliberately **not** run: with no config it would reformat existing source at default settings, which is a mass non-additive diff in an additive-only package. `known-issues.md` C-1, fifth change to record it |
| NAD-4 | `pnpm lint` does not run | **There is no `lint` script and no eslint config in this package.** Recorded rather than invented; not a CI job either. `known-issues.md` C-2 |
| NAD-5 | The braced-block rewrite deleted a line — does that break the additive rule? | **No.** The additive rule is about the **API surface and rendered output**, and both are unchanged: same component, same props in, same DOM out for every existing caller (T-1). The deleted line is the one-line form of the very statement that replaced it, itemised in `changed-files.md` §1 |

## 3. Deferred to their owners — not defects here, and not silently dropped

| # | Item | Owner | Why it is not fixed here |
|---|---|---|---|
| DEF-A | 🔴 DC's `tests/contract/transaction-form-standard.test.ts` **may** pin the full `label="DC" value={props.origin.dcName}` substring. **Not verifiable from here** — consumer repos are unreadable from a build worktree and none was opened | **Bananaworld-DC's lane**, at its pin bump | Editing a consumer repo from this lane is forbidden. **DC is red nowhere today** — it pins an older sha. If its mirror does pin the full string, it is a one-line narrowing identical to the one made here, on a line DC already has to visit (`runs/change-02/evidence/developer-handover.md` §3 lists it among the assertions that redden **by design** at adoption and must be inverted, never relaxed). Carried into `developer-handover.md` §2 and `SESSION_HANDOVER.md` |
| DEF-B | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist, and neither does `governance/` | **The owner** — a governance decision | **Fifth consecutive change to raise it.** A change may not invent a governance artifact. Seams recorded in `centrality-scorecard.md` instead |
| DEF-C | The "Raised by" slot's label is still hard-coded | **A future change, if a second app asks** | Explicitly out of scope (plan OQ-4). No caller has asked; building it now is the configurability-in-anticipation that D-3 and D-13 already refused in this component. `technical-debt.md` TD-1 |

## 4. Summary

| | Count |
|---|---|
| Defects found | **1** |
| Defects closed | **1** |
| **Defects open** | **0** |
| Checked and not a defect | 5 |
| Deferred to a named owner | 3 |
| Regressions introduced | **0** — 235 pre-existing specs still pass, 234 of them completely unedited |
