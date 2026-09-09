# Session handover — `bananaworld-design-system`

> Last updated: 2026-09-09, at the close of **CR-DESIGN-SYSTEM-009**.

## Most recent unit of work: CR-DESIGN-SYSTEM-009

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-009** (not an epic, not a milestone) |
| Title | A grid filter cell holds several values, and the grid reads at a compact density |
| Branch | `change/cr-design-system-009`, off `origin/main` @ `6ed975d` (CR-008, PR #20) |
| Approved layout | **B** — three column width steps, per column |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out, pushed, PR OPEN.** 🔴 CI's `dependency-audit` job will be **red** on a pre-existing, repo-wide advisory condition — **not this change's**, and **a rebuild cannot clear it** (D-10) |
| Archive | `runs/change-08/` |
| Open defects | **0** · Open decisions: **0** (D-9 answered — owner chose **A**) · **1 action owed by someone with package-manager permission (D-10)** · Technical debt created: **1 (TD-1)** |

### What it did

Four **strictly opt-in** additions to the shared package, every one defaulting to today's behaviour:

- **A** — `GridFilterCellDef.multiple` turns a `select` filter cell into a Radix tick-list that
  **stays open** while ticking, with the owner's option **C** tri-state "Select all" carrying `3 of 12`.
- **B** — `<Table density="compact">`, asked once and reaching the head, the filter row and the body
  together (≈24px rows vs ~36–44px). **The package default does not move.**
- **C** — `wrap="wrap" | "nowrap" | "truncate"`: values stay on one line, cut with a "…", hover to read.
- **D** — `width="narrow" | "medium" | "wide" | "full"` per column (layout B) — a **ceiling, not a
  fixed width**, so a customer name gets more room than a reference code.

🔴 **The value shape decision.** The `select` arm gained **one optional field** (`values?`). A fifth
`kind` was rejected (27 DC columns would migrate); **widening `value` to a union was rejected too, and
it is the one that looks cheapest** — DC's `appendFilters` calls `value.value.trim()`, so a union
breaks DC's typecheck *the moment it bumps its pin*. The wire encoding is a **repeated parameter**
(`f_room=A&f_room=B`), stated in `lib/grid-view.ts`'s header: one value is byte-identical to today's
and reads the same under `get` and `getAll`, so saved views round-trip.

🔴 **No second multi-select was written.** `multiSelectTriggerLabel` and `MultiSelectItem` were
**moved** out of `DataTableToolbar` into `components/MultiSelectMenu.tsx` (internal, not barrelled)
and now serve both surfaces. `MultiSelectFilterDef.selectAll` defaults to the row every shipped
toolbar renders today, so nothing moves for anyone.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **363 passed / 17 files** (baseline **re-measured before any edit: 314 / 17**) |
| New specs | **+49**; **0 existing specs edited, 0 reddened** |
| 🔴 **Byte-identity, measured** | **1,972 caller shapes** rendered against `main@6ed975d` and against this build, whole `innerHTML` compared — **0 differences** |
| 🔴 **Seven shipped toolbar screens** | whole-DOM snapshot, **zero-line diff** |
| Mutation battery | **8 run, 8 caught**, every restore verified byte for byte |
| Quality sensors | **0 open findings**, 5 justified, 0 weak |
| Dependency audit | 🔴 **3 BLOCKING** — see below |
| Migration | none — this package has no database |
| Throwaway Postgres | **never started; nothing left behind** |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## 🔴 THE ONE THING THE NEXT SESSION MUST DO FIRST

**Answer or act on `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`.**

Three advisories published **2026-09-08** fail CI's `dependency-audit` job
(`pnpm audit --prod --audit-level=high`):

| Advisory | Severity | Package | Fixed in |
|---|---|---|---|
| `GHSA-2xp9-vwfh-vxw4` | **critical** | `next` — unauthenticated RCE (Image Optimization, AVIF) | **15.5.24** |
| `GHSA-p293-qw3h-jr36` | **critical** | `next` — unauthenticated RCE, windows-hosted servers | **15.5.24** |
| `GHSA-rgj7-g3m4-5g8c` | high | `sharp` — inherited libheif CVEs | **0.35.4** |

**Not caused by this change** — `package.json` and `pnpm-lock.yaml` are byte-identical to `main`,
which fails the same audit today. `autoInstallPeers: true` puts `next@15.5.19` in the lockfile's
production dependencies, which is what `--prod` walks.

**The remedy, already verified:** `next` ≥ 15.5.24 is **inside the `^15.0.0` peer range this project
already declares**, and 15.5.25 widens its optional `sharp` range so the patched `sharp` follows. At
`next@15.5.25` + `sharp@0.35.4`, **zero high/critical remain**.
✅ **The owner decided this: option A, take the repaired versions.** Re-measured independently at the
resumed session by walking the closure out of `pnpm-lock.yaml` (66 pairs deps-only / 106 with optional
edges, 16 advisories, third sanity check **0 empty or non-GHSA**): **3 blocking now, 0 after the bump.**

🔴 **Owed, not done — and no build session can do it.** `pnpm update next` + commit `pnpm-lock.yaml`,
on this branch, by an actor with package-manager permission. Every `pnpm` invocation is permission-gated
in a build worktree and an unattended session has no approver; **the gate was honoured rather than
routed around** via `node`, because it exists precisely so a version change is never made quietly
mid-build. Hand-authoring the lockfile was also refused: ~35 new records (`@next/env`, eight
`@next/swc-*`, sharp's `@img/sharp-*` matrix) each needing a registry integrity hash, where one wrong
hash breaks `pnpm install --frozen-lockfile` for every job and every consumer.
⚠ **Do NOT add these to `pnpm.auditConfig.ignoreGhsas`** — two are unauthenticated RCEs, and the owner
declined that route explicitly.
⚠ **The estate half is bigger:** every consuming app pins its own `next` and needs the same update.
Fixing it here fixes **this repo's CI** and patches no running app.

## What the next session needs to know

1. 🔴 **This change fixes NO screen yet.** The report opens smaller only after: this merges → **DC
   bumps its pin to the MERGED `main` sha** (never a branch sha, KI-M001E19-002) → DC passes
   `density="compact"`, `wrap="truncate"`, a `width` per column and `multiple`, and moves its query
   writer to `append`/`getAll`. DC's own change, DC's own gate. The report's **width**
   (`max-w-[1440px]`) is DC's too and was never in this one.
2. 🔴 **DO NOT unify `SelectCell` and `MultiSelectCell`.** The one-value path being the shipped
   function *unedited* is what makes byte-identity provable rather than argued (plan §A.4).
3. 🔴 **`HEAD_WRAP` and `CELL_WRAP` are two records on purpose.** A head **already never wraps**; a
   shared record would map `wrap → ""` and strip `whitespace-nowrap` from **every header in the
   estate**. Mutation M-1; `Table.test.tsx` T-24 pins the exact string.
4. 🔴 **A width class is emitted ONLY under `truncate`** (M-3), and **all three of a column's rows must
   take the same `width`** — head, filter cell, body cell. The widest wins, so wiring two of three
   defeats the cap **silently** and looks like a package bug (M-7, plan §C.4a).
5. 🔴 **`values` must stay ABSENT below arity 2** — a consumer stores this shape on disk (M-4). And
   **never drop `onSelect={(e) => e.preventDefault()}`** on a menu CheckboxItem (M-5).
6. **Never call a hook conditionally** — `wrap ?? useTableWrap()` short-circuits. `useCellLayout` now
   makes this structural; keep it that way. Same trap CR-007 recorded on the row context.
7. 🔴 **Do NOT restore a mutated file with `git checkout --` on Windows.** Staging first fixes the
   *index* hazard CR-007 recorded, but autocrlf then rewrites line endings, so the restored file is
   byte-different and every later **multi-line** anchor silently stops matching — two mutations never
   ran and it reported `6/8`. **Keep the original bytes and write them back**, verify with
   `Buffer.equals`, and make a skipped mutation say so loudly. `defect-log.md` **D-1**.
8. 🔴 **A pnpm store directory name is NOT parseable on Windows.** Long dirs are shortened to
   `@radix-ui+react-checkbox@1._c2b24e…` — truncated version, hashed peer suffix. **Read each
   package's own manifest.** This is the **fourth** distinct way this one probe has been wrong (CR-004
   peer suffixes, CR-005 symlink parents + numeric-vs-GHSA ids, CR-006 a `github_advisory_id` field
   that does not exist, now truncated store dirs). **Keep every S-assertion:** S1 (closure size
   plausible) caught this one, S4 (ids non-empty and `/^GHSA-/`) caught CR-006's. Reconciled figures:
   **102 with optional edges, 66 deps-only** against the standing "~70". `defect-log.md` **D-2**.
9. ⚠ **`quality-sensors.mjs` silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout** — `.` does
   not match `\r`, so `(.*)$` never anchors. The scorecard returns BLOCKED with correct justifications
   sitting in the source. Normalise changed files to LF (git stores LF anyway, so commits are
   unaffected). **Estate tooling bug, not fixed here** — `known-issues.md` §D. Also: `CE-01/05` and
   `CE-08`/`RC-09` are **not scanned at all** for this project (no globs configured).
10. ⚠ **Radix mints a fresh `id` per render**, so an `innerHTML` diff of two renders of the *same*
    component shows differences. Normalise `radix-[A-Za-z0-9_:-]+` before comparing. The byte-identity
    harness is otherwise reusable as-is — ~10 minutes for 1,972 shapes.
11. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Five repos pin it by
    git sha and each bumps when it chooses. Never remove a field, move a default, or change an export
    surface. ⚠ Recorded pin values disagree between documents — **read the app's own `package.json`**.
12. **Consumer repos cannot be read or run from a build worktree.** `bananaworld-dc` is readable but
    **READ-ONLY**; this session issued **reads only** (four files, to re-verify the plan's citations).
    **No consumer suite was executed and nothing claims one was — eighth change to record it.**
    ⚠ Three of the plan's DC citations had drifted in path/line; **every underlying fact held**,
    including the load-bearing one (DC's `filterCells` sets no `multiple` and no `width`).
13. ⚠ **OQ-8 is unverified:** whether `max-width` caps a `<td>` under `table-layout: auto`. **No
    browser binary is executable from this sandbox.** Bounded — the failure mode is "the column does
    not narrow", it cannot move any existing render, and the fallback (an inner
    `<span class="block truncate">`) is recorded and untaken. **A ready-to-run probe ships at
    `runs/change-08/output/truncate-probe.html`** — one click settles it.
14. **Pre-existing repo drift, all re-verified, all out of lane:** **no prettier config**, so
    `pnpm format:check` fails repo-wide (and it is **not** a CI job); **no `lint` script and no eslint
    config**; **no `audit:deps` script**; the `DataTableToolbar.test.tsx.snap` CRLF artifact that shows
    as modified with a **zero-line content diff** (not staged).
15. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — eighth change to raise it.**
    A governance decision for the owner. The plan's eight-seam map (§2) is the record meanwhile.
    ⚠ Separately: **there is no decision-log entry for CR-DESIGN-SYSTEM-008** — the log jumps 007 → 009.
16. **Still owed from earlier changes, none affected here:** the CRM's pin bump + `dcLabel` adoption
    (CR-005 — the other half of **CR-CRM-015**'s unblock, blocked since 2026-08-18); DC's pin bumps for
    CR-002 and CR-004, then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003); CR-001's
    colour-stage chips. **DC still keeps a dead byte-for-byte private copy of
    `src/lib/table-controls.ts`** that nothing in DC imports — DC's lane to delete.
17. **Technical debt created: TD-1.** The grid's tick-list and the toolbars' read differently in their
    **top row** until DC and the CRM each pass `selectAll: "master"` in their own change. One optional
    flag on one shared component, not two implementations — what the owner accepted when he picked C.

## State of the repository

- **`main` is at `6ed975d`** (CR-008, PR #20). CR-009 sits on its own branch, **pushed, PR open**.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created no
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` **untouched, and byte-identical to `main`** — 🔴 which is exactly
  why CI's audit is red for a reason that is not this change's. **The owner decided A** (take the
  repaired versions: `next` ≥ 15.5.24, pulling `sharp` ≥ 0.35.4 — re-measured, 3 blocking → 0).
  **Owed, not done:** `pnpm update next` + commit `pnpm-lock.yaml` on this branch, by an actor with
  package-manager permission. `pnpm` is permission-gated in a build worktree with no approver; the gate
  was honoured rather than routed around via `node`, and hand-authoring ~35 lockfile records with
  registry integrity hashes was rejected as the larger risk. Full reasoning: `known-issues.md` §A, D-10.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-009.md` |
| Approved mockups (layout B) | `runs/current/mockups/CR-DESIGN-SYSTEM-009/` |
| Stage 04 artifacts | `runs/change-08/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-08/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-08/output/{changed-files,implementation-summary,known-issues}.md` |
| Technical debt | `runs/change-08/technical-debt.md` (**TD-1**) |
| The OQ-8 probe | `runs/change-08/output/truncate-probe.html` |
| Evidence roll-ups | `runs/change-08/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CR-DESIGN-SYSTEM-009, D-1…D-8 accepted, **D-9 DECIDED (owner: A)**, **D-10 execution owed** |
| The owner's decision card, **answered `A`** | `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-07/` (CR-007, `54597ac`) · `change-06/` (`ce47010`) · `change-05/` (`fc6f6c6`) · `change-04/` (`0633476`) · `change-03/` (`fc2c5b8`) · `change-02/` (`9aa20f7`) · `change-01/` (`365be65`) |
