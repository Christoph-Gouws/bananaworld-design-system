# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-24, at the close of **CR-DESIGN-SYSTEM-006**.

## Most recent unit of work: CR-DESIGN-SYSTEM-006

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-006** (not an epic, not a milestone) |
| Title | A row of fields can line up along the top |
| Branch | `change/cr-design-system-006`, off `origin/main` @ `fc6f6c6` |
| Approved layout | **A** — a row-level default **with** a per-cell override (owner, plan gate) |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out. PR opened; the conductor polls CI and merges.** |
| Archive | `runs/change-06/` |
| Open defects | **0** · open decisions: **none** |

### What it did

`TableCell` hardcoded `align-middle` and its `align` prop is horizontal only, so a row holding cells
of unequal height sags. Added **two** optional fields, both defaulting to `"middle"`:
`valign?: VAlign` on **`TableCellProps`** and on **`TableRowProps`** (`VAlign = "top" | "middle" |
"bottom"`, **module-private**, like `Align`). A row asks once for all its cells via a module-private
context; **a cell's own `valign` wins over its row's**.

- **Two files:** `src/components/Table.tsx` and a **new** `tests/components/Table.test.tsx` — this
  package's **first** Table specs (there were none at all). **All three barrels byte-identical.**
- 🔴 **The default did not move.** `align-middle` still answers every cell that does not ask.
- 🔴 **`TableHead` gained nothing** (D-9) and **no consumer file or pin was touched.**

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **263 passed / 14 files** (baseline before any edit: **246 / 13**) |
| New specs | **17**; **0 existing specs edited** |
| **Additive proof** | `src/` **+77 / −13**, which `git diff -w` reduces to **+67 / −3** — only **3 real deletions**, each itemised; the other 10 are the `<tr>` re-indented into the provider. Barrel diff **empty** |
| 🔴 **Byte-identity, measured** | **384 existing-caller shapes** rendered against `main@fc6f6c6`'s component and against this one, comparing whole `innerHTML` — **byte-identical**. Plus T-1/T-2/T-15/T-16 committed GREEN against the unmodified component (`f59f2c7`), unedited and still green |
| Mutation check | 5 run, **4 caught, 1 (M-3) proven inert** over a 320-row byte-identical diff and reported as NOT caught rather than rounded up |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new**. Reproduced in Node — `pnpm audit` is permission-blocked here. **The probe lied on its first run** (see note 11) |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## State of the repository

- **`main` is at `fc6f6c6`** (CR-DESIGN-SYSTEM-005 merged as PR #15). CR-006 sits on its own branch
  with a PR open; the conductor merges.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created no
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` **untouched** — no new dependency.

## What the next session needs to know

1. 🔴 **This change fixes NO screen.** It makes the option exist. The CRM's sagging sales order row is
   fixed only after three steps in order: this merges → **the CRM bumps its pin to the MERGED `main`
   sha** (never a branch sha, KI-M001E19-002) → the CRM passes `valign="top"` in its own change. Do
   not over-report it.
2. 🔴 **DO NOT collapse `TableCell`'s two class-emission positions into one.** It is the obvious
   cleanup, it keeps T-1 green, and it breaks one of two contracts. The untouched default is emitted
   **in place** so today's `className="align-top"` workaround still wins (T-8, mutation M-2); an
   explicit `valign` is emitted **after `className`** so a stray utility cannot defeat the prop (T-7,
   mutation M-5). Also: never flip the default to `top` (M-1), and never read the row context
   conditionally — `valign ?? useContext(...)` short-circuits and calls a hook conditionally.
3. 🔴 **Every consumer owes ONE grep before it bumps its pin: `grep -rn "valign" src`.** The prop name
   knowingly shadows React's deprecated `TdHTMLAttributes.valign`, which used to compile and be inert
   (the same move the file already made for `align`). **DC is proven clean — 0 occurrences repo-wide.**
   **CRM, RMS, org-admin and Manga Verde were NOT opened and are unverifiable from here.** If a live
   usage is ever found, the zero-residual fallback name is `verticalAlign`. `runs/change-06/evidence/
   developer-handover.md` §2.
4. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Five repos pin it by
   git sha and each bumps when it chooses. Never remove a field, change a default, or move an export.
   ⚠ Recorded pin values disagree between documents and are not checkable from a build worktree —
   **read the app's own `package.json`**.
5. **The additive claim is now reproducible, not rhetorical.** Render every existing caller shape
   against `git show <main-sha>:src/components/Table.tsx` and diff the whole `innerHTML`.
   **Reuse this** — it is the strongest proof available from a worktree that cannot run any consumer,
   and it costs about ten minutes. Method in `runs/change-06/output/test-results.md` §3.
6. **DC solved this problem first by abandoning the primitive.** `SalesOrderForm.tsx:1026` hand-rolls
   `<td>` with `align-top` because this option did not exist. DC **may** now fold back onto
   `TableCell` — **its lane, its call** (OQ-5). Nothing in DC is broken and no action is required.
7. ⚠ **The read-only `bananaworld-dc` worktree had a file modified at 18:00 — DURING this session —
   by another process** (`runs/current/logic-plan/EPIC-025-M-06.md`, a DC epic plan about label
   printers, unrelated to this change). **This session issued reads only against DC**; no `Write`/
   `Edit` targeted a DC path and no formatter ran there. Disclosed in `known-issues.md` **A-2** so the
   conductor's fingerprint check is not misread as a lane violation here.
8. ⚠ **The close gate reports 2 VIOLATED-NOW that this lane cannot reach**, both for
   `organization/scripts/lib/session-retry.mjs` (missing governance-index row; unencoded in the
   compliance rule manifest). It is **estate Change Runner tooling, not this project's file**, it is
   **outside this session's permitted directories** (unreadable, let alone editable), and this
   session's own opening pre-flight reported the governance index as **OK with 0 VIOLATED-NOW** — so
   it appeared mid-session from another lane. **PENDING is 0** and everything in this change's scope
   is green. `known-issues.md` **A-3**.
9. **Still owed from earlier changes, none affected by CR-006:** the CRM's pin bump + `dcLabel`
   adoption (CR-005 — the other half of **CR-CRM-015**'s unblock, blocked since 2026-08-18); DC's pin
   bumps for CR-002 and CR-004, then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003);
   CR-001's colour-stage chips. **DC still keeps a byte-for-byte private copy of
   `src/lib/table-controls.ts` that nothing in DC imports** — DC's lane to delete.
10. **Consumer repos cannot be read or run from a build worktree** (paths outside it are permission-
   blocked). **No consumer suite was executed and nothing claims one was.** Sixth change to record it.
11. 🔴 **Do not infer audit health from an unchanged dependency tree** — CR-002 did and CI proved it
    wrong. `pnpm audit` is permission-blocked; reproduce it in Node, or read CI's own job.
    ⚠ **THREE probes in a row have now lied on their first run.** CR-004's mis-parsed pnpm's
    peer-suffixed store dirs; CR-005's walked a symlink's lexical parent and compared numeric ids to
    GHSA strings; **CR-006's read a `github_advisory_id` field that does not exist** (the id lives in
    `url`), so every id was `""`, nothing matched the ignore list, and **all six owner-approved
    ignores read as BLOCKING**. The two existing sanity checks — closure ≈**70 packages**,
    **`nanoid@3.3.18` present** — both PASSED while the verdict was wrong, because the bug was
    downstream of them. **Add a third: assert every parsed advisory id is non-empty and matches
    `/^GHSA-/` before comparing anything.** Read the output, never the verdict.
12. **Pre-existing repo drift, all out of lane, all re-verified this session:** there is **no prettier
    config**, so `pnpm format:check` fails repo-wide — **all 48 `src/` files, including ones this
    change never opened** — and it is not a CI job; there is **no `lint` script and no eslint config**;
    there is **no `audit:deps` script**; `ci.yml`'s test job label is stale.
13. **Watch item for the owner:** **GHSA-fxqj-rqcc-2cmp** — *"PostCSS: incomplete fix of
    GHSA-6g55-p6wh-862q"*. Moderate, so it does not block, but it is an incomplete fix of an advisory
    that **is** on this repo's standing ignore list, whose own revisit trigger reads "when the estate
    advisory batch bumps next". An owner decision; untouched here.
14. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — **sixth** change to raise
    it. A governance decision for the owner, not something a change may invent.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-006.md` |
| Approved mockup (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-006/option-a.html` |
| Stage 04 artifacts | `runs/change-06/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-06/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-06/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-06/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Technical debt | `runs/change-06/technical-debt.md` (5 items, each with an owner and trigger) |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-DESIGN-SYSTEM-006, D-1…D-12) |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-05/` (CR-005, merged as `fc6f6c6`) · `runs/change-04/` (`0633476`) · `runs/change-03/` (`fc2c5b8`) · `runs/change-02/` (`9aa20f7`) · `runs/change-01/` (`365be65`) |
