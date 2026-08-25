# Developer handover — CR-DESIGN-SYSTEM-007

> For the next session in this repository, and for every consumer team that pins this package.

## 1. 🔴 The rule this change settled, and where it now lives

**Vertical-alignment precedence for a table cell, most specific first:**

```
cell `valign` prop  >  cell `className`  >  row `valign` prop  >  the "middle" default
```

The **middle rung is the correction**. CR-006 shipped with `askedForValign` computed from the
*row-resolved* value, so a row-level answer took the after-`className` emission slot and silently beat
a cell's own vertical utility. A `className` utility is a **cell-level** answer — before CR-006 it was
the *only* way to write one — so a **row-level** answer must not override it. That is D-6 ("the more
specific answer wins") read literally.

**It is now written in three places a reader will actually be standing** — the `Table.tsx` file
header, `TableRowProps.valign` and `TableCellProps.valign` — not only in a decision log the next
author would never open. **That was the actual root cause of the defect surviving review**, and it is
the part of this change most worth keeping.

## 2. 🔴 What the next session must NOT do

| Do not | Why |
|---|---|
| **Collapse `TableCell`'s two class-emission positions into one** | Standing warning since CR-006, and **now more load-bearing, not less** — this change *is* about which slot a row-level answer lands in; with one slot there is no fix to express. Collapsing breaks **D-2**: today's `className="align-top"` workaround wins only because the default is emitted **before** `className`, and four sha-pinned apps may be using it. Guarded by T-8, mutations M-2 / M-4. **Rejected in four consecutive changes now** (`simplification-opportunities.md` S-1) |
| **Re-introduce a `resolvedValign` intermediate** | That variable *was* the defect's mechanism. It looks like the right thing to key a predicate on, and it is not. Inlined deliberately (`simplification-opportunities.md` S-2) |
| **Compute `cellAskedForValign` from anything but the cell's own `valign`** | That is the bug, verbatim. Mutation **M-1** restores it and reddens T-17/T-18 |
| **Flip or re-position the `"middle"` default** | Estate-wide contract (D-2). T-1 pins the value, T-8 pins the position |
| **Read the row context conditionally** (`valign ?? useContext(...)`) | Short-circuits and calls a hook conditionally. Carried from CR-006 |
| **Edit an existing spec to make a change pass** | The plan's standing instruction: *if any existing spec reddens, the fix is wrong — stop and re-plan.* This change edited **0** |
| **Append to `runs/change-06/technical-debt.md`** | A closed unit is immutable. CR-006's archive was **cited, never edited** |

## 3. 🔴 Every consumer still owes ONE grep before it bumps its pin

```
grep -rn "valign" src
```

Carried unchanged from CR-006 D-8. The prop name knowingly shadows React's deprecated
`TdHTMLAttributes.valign`, which used to compile and be inert.

- **DC is proven clean — 0 occurrences repo-wide**, re-verified this session.
- **CRM, RMS, org-admin and Manga Verde were NOT opened** and are unverifiable from a build worktree.
- If a live usage is ever found, the zero-residual fallback name is `verticalAlign`.

**New in this change — a second thing to grep for at bump time.** Any consumer intending to write
`<TableRow valign=…>` should also check whether the cells inside that row carry a vertical utility in
`className`:

```
grep -rn "align-\(top\|middle\|bottom\)" src
```

Before this change those cells were silently overridden; after it they keep their own answer. **That
is the intended behaviour**, but it is a *rendering difference* from what CR-006 would have produced,
so a consumer adopting the row option should expect it rather than meet it.

## 4. The order that matters — this change fixes NO screen

The CRM's sagging sales-order row is fixed only after three steps, **in order**:

1. **This merges** to `main` (the conductor, on green CI).
2. **The CRM bumps its pin to the MERGED `main` sha** — 🔴 **never a branch sha**; KI-M001E19-002 is
   that exact mistake on record.
3. **The CRM passes `valign="top"`** on its sales-order line row, in its own change.

Fixing the precedence **now** means the CRM never meets the bug. That is the entire value of doing
this before the first adopter, and the window closes at step 2.

## 5. State of the repository

- **`main` is at `ce47010`** (CR-DESIGN-SYSTEM-006, merged as PR #17). This change sits on
  `change/cr-design-system-007` with a PR open; **the conductor polls CI and merges.**
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed. This change created **no**
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` **untouched** — no new dependency.
- **Consumer pins, all still behind:** DC at `0633476` (CR-004's sha); CRM, RMS, org-admin and Manga
  Verde unreadable from here and behind CR-006 by construction.

## 6. Method worth reusing

| Method | Cost | Where |
|---|---|---|
| **Differential whole-`innerHTML` render** — render every caller shape against `git show <main-sha>:src/components/Table.tsx` and against the edited file, diff the dumps | ~10 min | `test-results.md` §3. **1,536 shapes this round.** The strongest additive proof available from a worktree that cannot run any consumer |
| **Classify every difference rather than counting them** — same-class-set ⇒ order-only ⇒ identical rendering; different set ⇒ a real change that must be explained | ~5 min | `test-results.md` §4. It turned "48 things changed" into "48 changes, all exactly the defect's shape, nothing else" |
| **Mutation battery with an apply-assertion** — the harness exits non-zero if a mutation did not actually apply | ~10 min | A no-op edit cannot then be silently scored as "caught" |
| **Audit probe that asserts its own inputs before reaching a verdict** | ~10 min | `test-results.md` §7 |

## 7. 🔴 Two traps this session hit, so the next one does not

### 7.1 `git checkout --` restores from the INDEX, not from your working copy

The mutation harness restored `Table.tsx` with `git checkout --` while the fix was still
**unstaged** — so the first restore silently reverted the change under test. Every later mutation
would have been scored against `main`'s component while the report claimed otherwise: **false
evidence made entirely of real numbers.**

**Rule: `git add` the change before starting a mutation battery**, then verify after each restore
(`git diff --cached --stat` + a `grep -c` for the new identifier). Logged as `defect-log.md` **D-1**.

### 7.2 Do not infer audit health from an unchanged dependency tree

Carried from CR-006 and still true — CR-002 made that inference and CI proved it wrong. `pnpm audit`
is permission-blocked here; reproduce it in Node, or read CI's own job.

⚠ **Three probes in a row lied on their first run** (CR-004: mis-parsed pnpm's peer-suffixed store
dirs; CR-005: walked a symlink's lexical parent and compared numeric ids to GHSA strings; CR-006:
read a `github_advisory_id` field that **does not exist** — the id lives in `url` — so every id was
`""` and all six approved ignores read as BLOCKING).

**This round's probe did not lie**, because the handover's demanded third check was implemented:
*assert every parsed advisory id is non-empty and matches `/^GHSA-/` before comparing anything.*
It passed — 13 ids parsed, 0 bad. **Keep that check.**

**One refinement for the next session:** the standing "~70 packages" sanity figure matches the
**dependencies-only** closure (measured: **66**). Following `optionalDependencies` as well gives
**106** — and that is the number you want, because **`sharp` reaches this tree only through an
optional edge** and carries one of the six approved ignores. A probe that drops optional edges will
silently miss it while its sanity check reads green. **Report both numbers.**

## 8. Advisories for the owner — carried, not actionable by a change

| # | Advisory | Note |
|---|---|---|
| 1 | **GHSA-fxqj-rqcc-2cmp** — *"PostCSS: incomplete fix of GHSA-6g55-p6wh-862q"* | Moderate, does not block. Its **parent is on the standing ignore list**, whose own revisit trigger reads *"when the estate advisory batch bumps next"*. **Second change to raise it** |
| 2 | **GHSA-qx2v-qp2m-jg93** — PostCSS XSS via unescaped `</style>` | Moderate, does not block |

Profile otherwise identical to CR-006: 6 high (all six ignored), 7 moderate, **0 new, 0 blocking**.

## 9. Still owed from earlier changes, none affected by this one

1. **The CRM's pin bump + `dcLabel` adoption** (CR-005) — the other half of **CR-CRM-015**'s unblock,
   blocked since 2026-08-18.
2. **DC's pin bumps for CR-002 and CR-004**, then **CR-DC-052** (paginate DC's transaction lists).
3. **The CRM's seven-point saved-view obligation** (CR-003).
4. **CR-001's colour-stage chips** on the tablet receiving screen.
5. **DC still keeps a byte-for-byte private copy of `src/lib/table-controls.ts`** that nothing in DC
   imports — DC's lane to delete.
6. **DC may optionally fold its hand-rolled sales-order `<td>`s back onto `TableCell`** (CR-006
   OQ-5) — **its lane, its call.** Nothing in DC is broken and no action is required.

## 10. Standing limits of a build worktree

- **Consumer repos cannot be read or run** — paths outside the worktree are permission-blocked.
  **Seventh change to record this.** No consumer suite was executed and nothing claims one was.
- **`bananaworld-dc` is readable but READ-ONLY.** This session issued reads only; no `Write`/`Edit`
  targeted a DC path and no formatter ran there.
- **Pre-existing repo drift, all out of lane, all re-verified:** no prettier config (so
  `pnpm format:check` fails repo-wide across all 48 `src/` files, and it is **not** a CI job); no
  `lint` script and no eslint config; no `audit:deps` script; stale `ci.yml` test-job label.
- ⚠ `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified after any
  `vitest` run with an **empty content diff** — a CRLF normalisation artifact, not an edit. Not
  staged. `known-issues.md` A-3.

## 11. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` — seventh consecutive raise

Still does not exist; there is no `governance/` directory. A **governance decision for the owner**,
not something a change may invent. Seams are recorded in `centrality-scorecard.md` §4 instead.
