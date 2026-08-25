# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-25, at the close of **CR-DESIGN-SYSTEM-007**.

## Most recent unit of work: CR-DESIGN-SYSTEM-007

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-007** (not an epic, not a milestone) |
| Title | When a row instruction and a single box disagree, the box wins |
| Type | **Review follow-up on CR-DESIGN-SYSTEM-006** — 1 finding (F1, medium/medium) |
| Branch | `change/cr-design-system-007`, off `origin/main` @ `ce47010` |
| Approved layout | **A** — the cell's own answer wins (owner, plan gate) |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out. PR opened; the conductor polls CI and merges.** |
| Archive | `runs/change-07/` |
| Open defects | **0** · open decisions: **none** · technical debt created: **none** |

### What it did

CR-006 shipped with `askedForValign` computed from the **row-resolved** value, so a row-level
`valign` took the after-`className` emission slot and **silently beat a cell's own vertical utility
written in `className`**. That inverts D-6 (cell > row > default) for that pair.

🔴 **The finding was re-confirmed against the code as it is now before any fix was planned** — read
verbatim at `Table.tsx:249`, and confirmed a second way by mutation M-1. Nothing was fixed that was
not there.

**The fix is one predicate:** `cellAskedForValign = valign !== undefined` — *"the cell itself asked"*,
not *"anybody asked"*. Both emission positions keep their places, re-keyed on it.

**Final precedence, now written into the file header and BOTH `valign` doc-comments:**

```
cell `valign` prop  >  cell `className`  >  row `valign` prop  >  the "middle" default
```

- **Two files:** `src/components/Table.tsx` (**+31 / −13**, of which **3 lines are behaviour**) and
  `tests/components/Table.test.tsx` (**+155 / −0**, a new §8 with T-17 … T-22).
- 🔴 **0 existing specs edited, 0 reddened.** All three barrels byte-identical.
- 🔴 **No field added or removed, no default moved, no export changed.** D-2 intact.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **269 passed / 14 files** (baseline re-measured before any edit: **263 / 14**) |
| New specs | **6**; **0 existing specs edited** |
| 🔴 **Byte-identity, measured** | **1,536 caller shapes** rendered against `main@ce47010` and against this component, whole `innerHTML` compared — **byte-identical** |
| ⚠ **Declared behaviour change, measured** | 576 row-`valign` shapes: 456 identical, 72 class-**order**-only (identical rendering), **48 rendering changes — every one exactly the defect's shape** |
| Mutation check | **5 run, 5 caught.** M-1 restores the shipped defect and reddens T-17/T-18 |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new, 0 blocking**. Reproduced in Node. **The demanded third sanity check was implemented and PASSED** |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| In-session defect | **1 found, 1 fixed** (`defect-log.md` D-1) |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## State of the repository

- **`main` is at `ce47010`** (CR-006 merged as PR #17). CR-007 sits on its own branch with a PR open;
  the conductor merges.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created no
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` **untouched** — no new dependency.

## What the next session needs to know

1. 🔴 **This change fixes NO screen**, and neither did CR-006. The CRM's sagging sales-order row is
   fixed only after three steps **in order**: this merges → **the CRM bumps its pin to the MERGED
   `main` sha** (never a branch sha, KI-M001E19-002) → the CRM passes `valign="top"` in its own
   change. Fixing precedence now means the CRM **never meets the bug**; that window closes at step 2.
2. 🔴 **DO NOT collapse `TableCell`'s two class-emission positions into one.** Standing since CR-006
   and **now more load-bearing, not less** — this change *is* about which slot a row-level answer
   lands in; with one slot there is no fix to express. Position (A) holds the default *or the row's
   answer* (so a cell's `className` still beats it — T-8); position (B) holds only the cell's own prop
   (so `className` cannot defeat it — T-7, T-19). Mutations M-2/M-4 redden T-8; M-3 reddens T-7/T-19.
   **Also:** never flip or re-position the `"middle"` default (M-2), never re-introduce a
   `resolvedValign` intermediate (it *was* the defect's mechanism), and never read the row context
   conditionally — `valign ?? useContext(...)` short-circuits and calls a hook conditionally.
3. 🔴 **Every consumer owes ONE grep before it bumps its pin: `grep -rn "valign" src`.** The prop name
   knowingly shadows React's deprecated `TdHTMLAttributes.valign`. **DC is proven clean — 0
   occurrences repo-wide, re-verified this session.** **CRM, RMS, org-admin and Manga Verde were NOT
   opened and are unverifiable from here.** Fallback name if a live usage is found: `verticalAlign`.
   **New:** a consumer adopting `<TableRow valign>` should also `grep -rn "align-\(top\|middle\|bottom\)" src`
   — cells carrying a vertical utility in `className` now keep their own answer, which is intended but
   *is* a rendering difference from what CR-006 would have produced.
4. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Five repos pin it by
   git sha and each bumps when it chooses. Never remove a field, change a default, or move an export.
   ⚠ Recorded pin values disagree between documents — **read the app's own `package.json`.**
5. **The additive claim is reproducible, not rhetorical.** Render every caller shape against
   `git show <main-sha>:src/components/Table.tsx` and diff whole `innerHTML`. **Reuse this** — ~10
   minutes, 1,536 shapes this round. Then **classify every difference** (same class set ⇒ order-only
   ⇒ identical rendering; different set ⇒ a real change needing an explanation). That turned "48
   things changed" into "48 changes, all exactly the defect's shape, nothing else".
6. 🔴 **`git checkout --` restores from the INDEX, not from your working copy.** This session's
   mutation harness used it while the fix was still **unstaged**, and the first restore silently
   reverted the change under test — every later mutation would have been scored against `main`'s
   component while the report claimed otherwise. **`git add` before starting a mutation battery**, and
   verify after each restore. `defect-log.md` **D-1**.
7. 🔴 **Do not infer audit health from an unchanged dependency tree** — CR-002 did and CI proved it
   wrong. `pnpm audit` is permission-blocked; reproduce in Node, or read CI's own job.
   ⚠ **Three probes in a row lied on their first run** (CR-004 mis-parsed peer-suffixed store dirs;
   CR-005 walked a symlink's lexical parent and compared numeric ids to GHSA strings; CR-006 read a
   `github_advisory_id` field that **does not exist** — the id lives in `url` — so all six approved
   ignores read as BLOCKING). **This round's probe did not lie**, because the demanded third check was
   implemented: *assert every parsed advisory id is non-empty and matches `/^GHSA-/` before comparing
   anything.* **Keep it.** One refinement: the standing "~70 packages" figure matches the
   **deps-only** closure (measured **66**); following `optionalDependencies` gives **106**, and that
   is the number you want — **`sharp` reaches this tree only via an optional edge** and carries one of
   the six approved ignores. **Report both.**
8. **DC solved this problem first by abandoning the primitive.** `SalesOrderForm.tsx:1026` hand-rolls
   `<td>` with `align-top` and does not import `TableCell` at all. DC **may** fold back onto
   `TableCell` — **its lane, its call** (CR-006 OQ-5). Nothing in DC is broken; no action required.
9. **Still owed from earlier changes, none affected by CR-007:** the CRM's pin bump + `dcLabel`
   adoption (CR-005 — the other half of **CR-CRM-015**'s unblock, blocked since 2026-08-18); DC's pin
   bumps for CR-002 and CR-004, then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003);
   CR-001's colour-stage chips. **DC still keeps a byte-for-byte private copy of
   `src/lib/table-controls.ts` that nothing in DC imports** — DC's lane to delete.
10. **Consumer repos cannot be read or run from a build worktree.** **No consumer suite was executed
    and nothing claims one was. Seventh change to record it.** `bananaworld-dc` is readable but
    **READ-ONLY** — this session issued reads only.
11. **Watch items for the owner, neither blocking:** **GHSA-fxqj-rqcc-2cmp** (*"PostCSS: incomplete
    fix of GHSA-6g55-p6wh-862q"* — its parent **is** on the standing ignore list, whose revisit
    trigger reads "when the estate advisory batch bumps next"; **second change to raise it**) and
    **GHSA-qx2v-qp2m-jg93** (PostCSS XSS via unescaped `</style>`). Both moderate. Owner decisions.
12. **Pre-existing repo drift, all out of lane, all re-verified:** **no prettier config**, so
    `pnpm format:check` fails repo-wide across all 48 `src/` files — and it is **not** a CI job; **no
    `lint` script and no eslint config**; **no `audit:deps` script**; stale `ci.yml` test-job label.
    ⚠ `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified after any
    `vitest` run with an **empty content diff** — a CRLF artifact, not an edit. Not staged.
13. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — **seventh** change to
    raise it. A governance decision for the owner, not something a change may invent.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-007.md` |
| Approved mockups (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-007/` |
| Stage 04 artifacts | `runs/change-07/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-07/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-07/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-07/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Technical debt | **none created** — reason recorded in `runs/change-07/output/known-issues.md` §D |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-DESIGN-SYSTEM-007, D-1…D-8) |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-06/` (CR-006, merged as `ce47010`) · `runs/change-05/` (`fc6f6c6`) · `runs/change-04/` (`0633476`) · `runs/change-03/` (`fc2c5b8`) · `runs/change-02/` (`9aa20f7`) · `runs/change-01/` (`365be65`) |
