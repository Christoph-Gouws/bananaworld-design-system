# Milestone evidence — CR-DESIGN-SYSTEM-005

> **Template note (recorded, not silent):** `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md`
> is outside this session's workspace and the read is refused, so the template could not be copied and
> filled in as instructed. This file was authored to serve the same purpose and follows the stated
> rule: it **cites** each discrete artifact by path, status and counts rather than restating it.
> Fifth change to hit this limit (CR-001 … CR-004, and here). See `known-issues.md` B-3.

| Field | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-005** — the depot slot's label is chosen by the app wearing the header |
| Unit | Change Request (not an epic, not a milestone). Archive: `runs/change-05/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Venture / Team | bananaworld · AI Dev Team 6 |
| Branch | `change/cr-design-system-005`, off `origin/main` @ `0633476` |
| Approved layout | **A** — the slot is always present; an app with nothing for it gets the dash the strip already uses. Omission not offered (owner, plan gate, "just go for the logical fix") |
| Ship mode | **on-green** |
| Date | 2026-08-20 |
| Verdict | **PASS — ready for PR** |

## 1. Gate results

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess`, no app path alias |
| Tests | `pnpm test` | **246 passed / 13 files**, 0 failed, 0 skipped (baseline before any edit: **235 / 13**) |
| New specs | — | **+11** |
| Existing assertions edited | — | **1**, narrowed and declared at planning time (`known-issues.md` A-1) |
| Mutation check | 4 deliberate breakages | **4 / 4 caught** (`test-results.md` §4) |
| Additive — diff | `git diff --numstat -- src/` | **+30 / −1**; the single deletion itemised in `changed-files.md` §1 |
| Additive — export surface | `git diff -- src/index.ts src/components/index.ts src/lib/index.ts` | **empty** |
| Dependency audit | Node reproduction of CI's `pnpm audit --prod --audit-level=high` | **PASS** — 6 highs, all six on the standing owner-approved ignore list, **0 new**, 0 blocking. `pnpm audit` itself is permission-blocked and is **not** claimed as run (`known-issues.md` B-2) |
| Lint | `pnpm lint` | **no `lint` script and no eslint config exist in this package** — `known-issues.md` C-2, recorded not invented |
| Format | `pnpm format:check` | Pre-existing repo-wide drift: no prettier config. Four **untouched** files fail identically, verified this session. Not a CI job. `known-issues.md` C-1 |
| Migration | — | **N/A — this package has no database.** No file, nothing classified, nothing promoted. `migrationExpected: false` |
| Throwaway Postgres | — | **never started**; no running container, no stopped container, no port held |
| Consumer pins | — | **none bumped**, and none may be from here |
| CI | GitHub Actions | Not waited for, by instruction. The conductor polls and merges |

## 2. Discrete artifacts — cited, with status and counts

### Stage 04

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-05/output/test-results.md` | **PASS** | 246 passed / 13 files; +11 new; 0 failed; 0 skipped; **1 existing assertion narrowed**; 4 mutations, 4 caught; audit output quoted verbatim |
| `runs/change-05/output/qa-report.md` | **PASS** | **22 acceptance criteria, 22 traced to a verdict** — 21 PASS, 1 N/A with a stated cause; 12 adversarial checks; 8 standards held |
| `runs/change-05/output/defect-log.md` | **0 open** | 1 found, 1 closed (medium — the audit probe's false first verdict); 5 "not a defect" records; 3 items deferred to named owners |
| `runs/change-05/output/deployed-verification.md` | **N/A, recorded** | Source-only, sha-pinned library — nothing to deploy, no database. 9 substitute proofs; 4 items honestly deferred to the first adopting screen |

### Stage 05

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-05/output/revision-review.md` | **PASS** | **28 plan clauses checked, 28 built**; 3 immaterial deviations recorded; 8 review dimensions; 8 over-build temptations declined |
| `runs/change-05/output/simplification-opportunities.md` | **PASS** | 6 candidates: **1 accepted, 5 rejected** with reasons; 8 simplifications recorded as already built in |
| `runs/change-05/output/accepted-refactors.md` | **1 accepted** | T-12's barrel scan: index arithmetic → one regex. Test-only; **no source file refactored**. Typecheck clean, 246/246 green afterwards |
| `runs/change-05/output/readable-code-scorecard.md` | **12 / 12 PASS** | Two weak points stated rather than trimmed (comment density 25:2; a ten-field interface) |
| `runs/change-05/output/centrality-scorecard.md` | **12 / 12 PASS** | 6 cross-system seams mapped; **0 coordinated multi-app moves created**; 2 items of downstream work named with owners |

### Cross-cutting

| Artifact | Status | Counts |
|---|---|---|
| `runs/change-05/output/changed-files.md` | complete | **1 source file modified (+30 / −1), 3 barrels UNCHANGED, 0 source added, 0 deleted**; 1 test file modified (+256 / −1); 8 files considered and left untouched with reasons; 1 throwaway file created and deleted |
| `runs/change-05/output/implementation-summary.md` | complete | Includes the required plan-vs-code confirmation: **11 / 11 of the plan's cited facts verified exact; nothing stale** |
| `runs/change-05/output/known-issues.md` | **0 open defects, 0 open decisions** | 3 change items (A), 4 session limits (B), 5 pre-existing drift items (C), 5 watch items (D) |
| `runs/change-05/technical-debt.md` | **2 items, both owned** | TD-1 the "Raised by" label; TD-2 `dcHint`. Both with a named trigger, neither built |

## 3. The additive claim — and WHICH existing callers were checked

Four apps pin this package by git sha and each bumps when it chooses, so "every existing caller renders
byte-identically" is the lane rule, not a preference.

**The proof, checkable from the diff:**

1. **All three barrels are byte-identical.** `git diff -- src/index.ts src/components/index.ts
   src/lib/index.ts` prints **nothing**. No export added, removed, renamed or moved. `dcLabel` is a new
   optional field on an interface that was already exported, which needs no barrel edit (plan F-8).
2. **`src/` is `+30 / −1`, and the one deletion is itemised** — the one-line depot-slot `return`,
   replaced by its own braced form. No other line in `src/` was removed or modified.
3. **No field was removed, no default was changed, no export moved.** The default is `"DC"`, which is
   the string that was hard-coded there before.
4. **234 of the 235 pre-existing specs pass completely unedited**, including every `DocumentOrigin`,
   Document no., Date-slot, barrel and standalone-build spec. The 235th had one assertion narrowed and
   still passes (`known-issues.md` A-1).

**Which existing callers were checked, and why they are unaffected — stated plainly:**

- **Bananaworld-DC — thirteen render sites across twelve forms** (`SalesOrderForm`, the delivery run,
  `AdjustmentSheet`, and the rest). **None passes `dcLabel`**, so `props.dcLabel` is `undefined`,
  `?? "DC"` yields the identical string, and `HeaderSlot` receives byte-identical props. The rendered
  `<dt>` text, the `<dd>` classes and the DOM order are unchanged. **Asserted by T-1**, which is
  proved to bite by mutation M-2.
  🔴 **DC's own suites were NOT run and nothing here claims they were** — consumer repos are not
  readable from this worktree and none was opened. The argument above is a code argument.
  Additionally, DC's two **source-text** contracts on this file are held byte-for-byte and are now
  pinned in this repo by T-10.
- **Bananaworld-CRM, RMS, org-admin** — **none imports `DocumentHeader` today.** The CRM's adoption is
  CR-CRM-015, still in its own lane. Nothing to be affected.
- **This package's own 246 specs** — **38** of them are in `DocumentHeader.test.tsx` (27 pre-existing
  + 11 new), measured by running that file alone. All 38 pass, with the single narrowed assertion
  named above. The other 208 do not touch this component and are unedited.

**Nothing renders differently in any app until that app bumps its pin AND passes the new prop. No app
does either today.**

## 4. The trap — who owns which half

The request named this as the real risk: **Bananaworld-DC asserts against this file's SOURCE TEXT**,
not its behaviour, so a careless edit here is a delayed-action failure that fires weeks later at DC's
pin bump.

| Half | Owner | State |
|---|---|---|
| Keep `DOCUMENT_HEADER_SLOTS`'s declaration byte-identical | **This change** | ✅ not one character changed |
| Keep `const slots = DOCUMENT_HEADER_SLOTS;` and `slots.map(` intact | **This change** | ✅ unchanged |
| Put the override BESIDE the array as presentation, never inside it | **This change** | ✅ one optional prop, defaulted at the point of use |
| Pin the cross-repo negative **in this repo** so a future change cannot break DC silently | **This change** | ✅ T-10 re-fenced with DC named by file; **T-11 added**; both proved by mutation M-4 |
| 🔴 The third string — `label="DC" value={props.origin.dcName}` — which this repo also scanned for | **This change**, in this repo | ✅ narrowed, never relaxed, and **declared at the plan gate** rather than found in the build |
| Whether **DC's** mirror pins that same third string | **DC's lane**, at its pin bump | ⚠ **Unverified and not verifiable from here.** Nothing claims otherwise. DC is red nowhere today. If it does, it is a one-line narrowing on an assertion DC already has to visit (`runs/change-02/evidence/developer-handover.md` §3) |

## 5. Scope discipline

Not done, deliberately: **no consumer pin bumped** (none of the four touched); **no consumer file
edited**; no change to `DocumentOrigin`, its `new`/`existing` discriminant or CR-DC-039's reason; no
change to the Document no. slot's five states or the Date slot's states; **no fifth slot, no reorder,
no restyle, not one class name changed**; `dateLabel` neither removed nor folded into a shape with
`dcLabel`; omission not built; `dcHint` not built; the "Raised by" label not made overridable; no new
dependency, no new token, no new file, no barrel edit, no `package.json` or `pnpm-lock.yaml` change.

## 6. Stage 07 — source-document amendments

| Question | Answer |
|---|---|
| Did this change alter a rule, contract or workflow? | **Yes, one, and it is a design rule for this component: the depot slot's LABEL is the wearing app's, but the slot's IDENTITY and ORDER remain the package's, expressed once in `DOCUMENT_HEADER_SLOTS`.** Its corollary is also new and binding: **the slot is always present — omission is not offered**, and an app with nothing for it uses the existing empty state |
| Recorded where? | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — the CHANGE/DECISION entry for CR-DESIGN-SYSTEM-005 (D-1 … D-8) — **and in the source itself**, fenced on the `dcLabel` prop where a build session will read it, plus `evidence/developer-handover.md` §1 and specs T-6, T-10 and T-11 that fail if either half is broken |
| Any other source document amended? | **No — and here is the cause, so this is an N/A with a reason rather than a skip.** This repository has no `source-documents/` tree beyond that decision log and no `governance/` directory; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and creating it is a governance decision, not part of this change (`known-issues.md` C-5, **fifth** change to raise it). **No kernel rule, gate or scorecard was altered** — a team may never weaken a universal kernel rule, and none was touched |

## 7. Sign-off

| Item | Status |
|---|---|
| Plan's cited facts re-verified against the code before building | ✅ **11 / 11 exact**; nothing had moved on `main`; baseline 235/13 matched the plan's prediction |
| Built to the owner-approved plan | ✅ **28 / 28 clauses**; 3 immaterial deviations recorded |
| Owner's layout decision (A) implemented, and its reason written down | ✅ omission not offered; three reasons stated; pinned by T-6 |
| The omission answer is STATED, not left for the CRM to discover | ✅ in the prop's own doc comment, the handover, and a failing-if-changed spec |
| Additive-only rule held and **proved** | ✅ barrels empty; `+30 / −1` with the deletion itemised; 0 fields removed, 0 defaults changed, 0 exports moved |
| Every existing caller addressed, none sampled | ✅ §3 — by the diff and by T-1, not by sampling |
| 🔴 DC's source-text contract held byte-for-byte | ✅ T-10, proved by mutation M-4 |
| 🔴 The one narrowed assertion declared, not buried | ✅ in five artifacts, and it was declared at the plan gate |
| 🔴 The unverifiable cross-repo item named as unverifiable | ✅ nothing claims DC was checked |
| Radix, not hand-rolled | ✅ N/A by construction — no interactive element added or replaced |
| Keyboard + screen-reader behaviour unchanged | ✅ the `<dl>/<dt>/<dd>` shape is untouched; the depot slot correctly stays a `<dt>` |
| Tests green, typecheck clean | ✅ 246 / 246 |
| Specs proved to BITE, not assumed to | ✅ 4 mutations, 4 caught |
| Stage 04 + Stage 05 discrete artifacts present as their own files | ✅ 9 files, plus `changed-files.md`, `implementation-summary.md`, `known-issues.md` |
| Throwaway Postgres cleaned up | ✅ **never started** — no database in this package |
| No forbidden unit created (`epic-NN`, `milestone-NN`, `epic-plan/`) | ✅ none |
| No consumer pin bumped | ✅ |
| 🔴 Two-lane shipping stated, so nobody over-reports CR-CRM-015 | ✅ in five artifacts |
| No performance claim made anywhere | ✅ none made |
| Open defects | **0** |
| Open decisions | **0** |
| Ready for PR (ship mode: on-green) | ✅ |
