# Developer handover — CR-DESIGN-SYSTEM-009

> For the next developer session on this repository. Read this before touching `Table.tsx`,
> `GridFilterRow.tsx`, `DataTableToolbar.tsx` or `lib/grid-view.ts`.

## Where this change stands

| | |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-009** — not an epic, not a milestone |
| Branch | `change/cr-design-system-009`, off `main` @ `6ed975d` (CR-008, PR #20) |
| Layout · ship mode | **B** · **on-green** |
| Code | **Built, tested green, closed out. Committed and pushed.** |
| PR | 🔴 **NOT opened** — CI's `dependency-audit` job would fail on three advisories that are **already failing on `main`** |
| Status | **BLOCKED on an owner decision**, not on engineering |
| Archive | `runs/change-08/` |
| Open defects in the change | **0** · Technical debt created: **1** (`runs/change-08/technical-debt.md`) |

## 🔴 The one thing to do first

**Answer, or act on, the decision card at `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`.**

Three advisories published **2026-09-08** fail `pnpm audit --prod --audit-level=high`:

| Advisory | Severity | Package | Fixed in |
|---|---|---|---|
| `GHSA-2xp9-vwfh-vxw4` | **critical** | `next` — unauthenticated RCE (Image Optimization, AVIF) | **15.5.24** |
| `GHSA-p293-qw3h-jr36` | **critical** | `next` — unauthenticated RCE, windows-hosted servers | **15.5.24** |
| `GHSA-rgj7-g3m4-5g8c` | high | `sharp` — inherited libheif CVEs | **0.35.4** |

**The recommended remedy, already verified:** refresh `next` to **≥ 15.5.24** — this is **inside the
`^15.0.0` peer range the project already declares**, so `package.json` does not change. `next@15.5.25`
widens its optional `sharp` range to `^0.34.3 || ^0.35.4`, so the patched `sharp` comes with it.
Queried against the same endpoint: **at `next@15.5.25` + `sharp@0.35.4`, zero high/critical remain.**

⚠ **This session could not do it**: `pnpm update` and every other lockfile-writing command are
permission-blocked in the build worktree. If your session *can* run them, that is the whole fix —
then re-run the audit, open the PR, and let the conductor merge on green.

⚠ **Do NOT add these to `pnpm.auditConfig.ignoreGhsas`.** That list is owner-approved, and two of the
three are unauthenticated RCEs. Not a change's call.

⚠ **The estate half is bigger and is not yours.** DC, the CRM, RMS, org-admin and Manga Verde each pin
their own `next`. Fixing this repo's lockfile fixes **this repo's CI**; it patches no running app.
Five lanes, and a compliance-register question for the owner.

## What this change actually did

Four strictly opt-in additions. **Every one defaults to today's behaviour**, and that is proven, not
claimed: **1,972 caller shapes rendered against `main@6ed975d` and against this build, whole
`innerHTML` compared — 0 differences**; plus the seven shipped toolbar screens' DOM snapshot with a
**zero-line diff**.

| | |
|---|---|
| **A** | `GridFilterCellDef.multiple` — the filter cell becomes a tick-list that stays open, with a tri-state "Select all" master row carrying `3 of 12`. The `select` value gained **one optional field** (`values?`); the wire encoding (**a repeated parameter**) is stated in `lib/grid-view.ts`'s header |
| **B** | `<Table density="compact">` — read by `TableHead`, `TableCell`, `GridHeadCell` and the filter row through one context. ≈24px rows |
| **C** | `wrap="wrap" \| "nowrap" \| "truncate"` — one line, cut, hover to read whole |
| **D** | `width="narrow" \| "medium" \| "wide" \| "full"` per column — the owner's layout B |

Also: `multiSelectTriggerLabel` and `MultiSelectItem` were **moved** out of `DataTableToolbar` into
`components/MultiSelectMenu.tsx` (internal, not barrelled) and now serve both surfaces.
`MultiSelectFilterDef.selectAll` defaults to today's `All depots` row, so no shipped toolbar moves.

## 🔴 Traps — every one is guarded by a spec, and a mutation proves the spec is real

1. **Do NOT unify `SelectCell` and `MultiSelectCell`.** The one-value path being the shipped function
   *unedited* is what makes byte-identity provable rather than argued. Plan §A.4 required it.
2. **`HEAD_WRAP` and `CELL_WRAP` are two records on purpose.** A head **already never wraps**; a
   shared record would map `wrap → ""` and strip `whitespace-nowrap` from **every header in the
   estate**. Mutation **M-1**; `Table.test.tsx` T-24 pins the exact string.
3. **A width class is emitted ONLY under `truncate`.** Capping without clipping spills the value out
   of the cell *and* moves every existing render. Mutation **M-3**.
4. **All three of a column's rows must take the same `width`** — `GridHeadCell`, the filter cell, the
   body cell. The widest wins, so wiring two of three defeats the cap **silently** and looks like a
   package bug. Mutation **M-7**; plan §C.4a.
5. **`values` must stay ABSENT below arity 2.** A consumer stores this shape on disk. Mutation **M-4**;
   the spec asserts the key list is exactly `["kind","value"]`, not just the value.
6. **Never drop `onSelect={(e) => e.preventDefault()}`** on a menu CheckboxItem — the menu closes on
   the first tick and the whole feature is defeated. Mutation **M-5**.
7. **Never call a hook conditionally.** `wrap ?? useTableWrap()` short-circuits. `useCellLayout` now
   makes this structural; keep it that way. (CR-007 recorded the same trap on the row context.)
8. **Emit exactly ONE class per axis**, from a record — never an appended class. twMerge keeps the last
   of a conflicting pair, so a second one is a silent invisible override. T-28 / T-30 / T-38.

## Tooling lessons this session paid for

| | |
|---|---|
| 🔴 **Do not restore a mutated file with `git checkout --` on Windows.** Staging first fixes the *index* hazard CR-007 recorded, but autocrlf then rewrites line endings, so the restored file is byte-different and every later **multi-line** anchor silently stops matching. Two mutations never ran and it reported `6/8`. **Keep the original bytes in memory and write them back**, verify with `Buffer.equals`, and make a skipped mutation say so loudly | `defect-log.md` **D-1** |
| 🔴 **A pnpm store directory name is NOT parseable on Windows.** Long dirs are shortened to `@radix-ui+react-checkbox@1._c2b24e…` — truncated version, hashed peer suffix. **Read each package's own manifest.** This is the *fourth* distinct way this one probe has been wrong; its S1 assertion is the only reason a false all-clear was not filed | `defect-log.md` **D-2** |
| ⚠ **`quality-sensors.mjs` ignores every `QUALITY-JUSTIFY` on a CRLF checkout** — `.` does not match `\r`, so `(.*)$` never anchors. The scorecard returns BLOCKED with correct justifications sitting in the source. Normalise changed files to LF (git stores LF anyway). **Estate tooling bug, not fixed here** | `known-issues.md` **§D** |
| ⚠ Radix mints a **fresh `id` per render**, so an `innerHTML` diff of two renders of the *same* component shows differences. Normalise `radix-[A-Za-z0-9_:-]+` before comparing | `test-results.md` §4 |
| **Keep the audit probe's S1–S4 assertions.** S4 (every parsed id non-empty and `/^GHSA-/`) saved CR-007; **S1** (closure size plausible) saved this one | `test-results.md` §7 |

## Still owed, and by whom

| Owed | By | Blocked on |
|---|---|---|
| The **DC half** — bump the pin to the **merged** `main` sha (never a branch sha, KI-M001E19-002), then pass `density="compact"`, `wrap="truncate"`, a `width` per column, `multiple` on the filter cells, and move the query writer to `append`/`getAll` | bananaworld-dc | this merging |
| ⚠ **Opt DC's CHIP columns to `wrap="nowrap"`** (`ColourStageCell`, `DrillCell`) or `overflow:hidden` clips them — it will look like a bug in this package and will not be | bananaworld-dc | the same |
| The report's **width** (`max-w-[1440px]`) — the other half of the owner's ask | bananaworld-dc | its own CR |
| `selectAll: "master"` to converge the tick-lists | DC and the CRM | `technical-debt.md` TD-1 |
| **OQ-8** — open `runs/change-08/output/truncate-probe.html` in a browser; one click | anyone with a browser | nothing |
| Carried from earlier changes, none affected here: the CRM's pin bump + `dcLabel` (CR-005, unblocking CR-CRM-015, blocked since 2026-08-18); DC's pin bumps for CR-002/CR-004 then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003); CR-001's colour-stage chips; **DC's dead byte-for-byte private copy of `src/lib/table-controls.ts`** that nothing in DC imports | the consumers | — |

## Standing facts about this repository

- **Additive-only is a lane rule, not a preference.** Five repos pin by git sha and bump when they
  choose. Never remove a field, move a default, or change an export surface.
  ⚠ Recorded pin values disagree between documents — **read the app's own `package.json`**.
- **Consumer repos cannot be read or run from a build worktree.** `bananaworld-dc` is readable but
  **READ-ONLY**; this session issued **reads only** (four files). **No consumer suite was executed and
  nothing in this pack claims one was — eighth change to record it.**
- **Pre-existing drift, all out of lane, all re-verified:** no prettier config (so `format:check` fails
  repo-wide, and it is **not** a CI job); no `lint` script and no eslint config; no `audit:deps`
  script; the `DataTableToolbar.test.tsx.snap` CRLF artifact with a **zero-line content diff**.
- **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — eighth change to raise it.**
  A governance decision for the owner; the approved plan's eight-seam map (§2) is the record meanwhile.
- **This package has no database, by construction.** No migration is ever written here, and no
  throwaway Postgres was started this session.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-009.md` |
| Approved mockups (layout B) | `runs/current/mockups/CR-DESIGN-SYSTEM-009/` |
| Stage 04 artifacts | `runs/change-08/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-08/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-08/output/{changed-files,implementation-summary,known-issues}.md` |
| Technical debt | `runs/change-08/technical-debt.md` — **TD-1**, the one plan §9 predicted |
| Evidence roll-ups | `runs/change-08/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| The OQ-8 probe | `runs/change-08/output/truncate-probe.html` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CR-DESIGN-SYSTEM-009, D-1…D-8 applied, **D-9 DECIDED (owner: option A)**, **D-10 records that D-9's execution is owed** — `pnpm update next` on this branch by an actor with package-manager permission, or CI's `dependency-audit` stays red |
| The owner's open decision | `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` |
| Previous changes | `runs/change-07/` (CR-007) · `change-06/` (`ce47010`) · `change-05/` (`fc6f6c6`) · `change-04/` (`0633476`) · `change-03/` · `change-02/` · `change-01/` |
