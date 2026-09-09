# Known issues — CR-DESIGN-SYSTEM-009

> What is left open, what moved under this change, and what a reader should not re-investigate.
> Open **defects in the change: 0.** Open **gates: 0** — §A's decision gate was answered by the owner.
> Open **actions owed by someone else: 1**, and it is §A.

---

## §A · 🔴 READ THIS FIRST · CI's `dependency-audit` WILL BE RED, and RELAUNCHING THE BUILD SESSION WILL NOT FIX IT

**Status: DECIDED by the owner (option A). Execution OWED by an actor who may run a package manager.**
**Not a defect in this change, and not something a rebuild can clear.**

Three advisories were published **2026-09-08 — the day before this change was built** — against
packages already in this repo's production closure:

| Advisory | Severity | Package | Fixed in |
|---|---|---|---|
| `GHSA-2xp9-vwfh-vxw4` | **critical** | `next` — unauthenticated RCE in the Image Optimization API (AVIF) | **15.5.24** |
| `GHSA-p293-qw3h-jr36` | **critical** | `next` — unauthenticated RCE on windows-hosted servers | **15.5.24** |
| `GHSA-rgj7-g3m4-5g8c` | high | `sharp` — inherited libheif CVEs | **0.35.4** |

**Why it blocks.** `autoInstallPeers: true`, so `next@15.5.19` sits in the lockfile's **production
`dependencies`** (`pnpm-lock.yaml:50`) — exactly what `pnpm audit --prod` walks. CI's
`dependency-audit` job (`ci.yml:68`) exits non-zero on three un-ignored high/critical advisories, and
branch protection requires that workflow green.

**Why it is not this change's doing.** `package.json` and `pnpm-lock.yaml` are **byte-identical to
`main`**. `main` fails this audit right now, and so would any other PR to this repo. CR-007
(2026-08-25) reported 6 highs, all ignored, **0 blocking** — the difference is thirteen days of
advisory publication, not thirteen days of code.

### What the owner decided

**Option A — take the repaired versions.** Refresh `next` to **≥ 15.5.24**, inside the `^15.0.0` peer
range this package already declares; `next@15.5.25` widens its optional `sharp` range to
`^0.34.3 || ^0.35.4`, so the patched `sharp` follows from the one bump. **Nothing is added to
`pnpm.auditConfig.ignoreGhsas`** — the owner declined that route explicitly.

### The one command that is owed

On this branch, by an actor with package-manager permission, before CI can go green:

```
pnpm update next          # 15.5.19 -> 15.5.25 (head of 15.5.x); pulls sharp >= 0.35.4
pnpm install --frozen-lockfile && pnpm typecheck && pnpm test && pnpm audit --prod --audit-level=high
git commit -m "CR-DESIGN-SYSTEM-009 - take the repaired next/sharp versions (owner decision A)" pnpm-lock.yaml
```

`package.json` needs **no edit** — 15.5.25 already satisfies the declared `^15.0.0`. Only
`pnpm-lock.yaml` moves.

### Why this session did not do it — both routes, and why each was refused

1. **Running `pnpm` is permission-gated in a build worktree and an unattended session has no
   approver.** `pnpm --version`, `pnpm audit` and `pnpm update` were each refused. **The gate was
   honoured, not evaded.** It exists so that a version change is never made quietly in the middle of
   other work — which is precisely what this would have been. Invoking pnpm's JS entry point through
   `node` would have satisfied the letter of the block and defeated its point, so it was not done.
2. **Hand-authoring `pnpm-lock.yaml` was rejected**, and it is the more tempting of the two.
   `next@15.5.19 → 15.5.25` plus `sharp@0.34.5 → 0.35.4` is ~35 new package records — `@next/env`,
   eight `@next/swc-*` platform builds, and sharp's `@img/sharp-*` matrix — each needing a registry
   integrity hash and a correct snapshot dependency graph. **One wrong hash fails
   `pnpm install --frozen-lockfile` in every CI job and for every consumer; one missing transitive
   edge installs a broken tree silently.** A lockfile is a generated artefact, and generating one by
   hand into a package four apps pin by sha is not a defensible trade.

**B was not quietly substituted for A because A was unreachable.** The owner's card said plainly that
an unauthenticated RCE is not what the accepted list is for; choosing B on his behalf would have been
this change deciding a security posture he had just declined.

### Re-measured this session, independently — the numbers are not carried forward

The closure was walked from `pnpm-lock.yaml` and queried against the same npm bulk endpoint
`pnpm audit` uses (`pnpm` itself being unavailable):

| | |
|---|---|
| Prod closure | **66** name@version pairs deps-only · **106** with optional edges |
| Advisories in that closure | **16** |
| On the standing `ignoreGhsas` list | 6 (5 high + the sharp `<0.35.0` one) |
| 🔴 **Blocking** (high/critical, not ignored) | **3** — the table above |
| Verdict | `pnpm audit --prod --audit-level=high` **would exit 1** |
| Third sanity check (handover's standing demand) | **16 ids parsed, 0 empty or non-GHSA** ✅ |
| Same closure at `next@15.5.25` + `sharp@0.35.4` | **0 blocking** — verdict exit 0 |

Two incidental confirmations from the same walk: the `nanoid@<3.3.17` override **is working**
(resolved `3.3.18`, and the `<3.3.18` high does not appear), and the two high PostCSS advisories that
*do* appear are both already on the ignore list.

⚠ **The estate-wide half is bigger than this repo and belongs to the owner, not to this change.** DC,
the CRM, RMS, org-admin and Manga Verde each pin their own `next` and are presumably on the same
vulnerable range. This package's peer refresh fixes **this repo's CI**; it does not patch a single
running app. That is five separate lanes and a compliance-register question. Flagged on the owner's
card and repeated here rather than left looking handled.

---

## §B · The approved plan's citations drifted — the facts held, the coordinates moved

Spot-checked as instructed, read-only, before anything was built. **Nothing the plan RELIES ON has
changed shape**, so the approved approach stands and the build proceeded.

| Plan says | Actually | Effect |
|---|---|---|
| `grid-state.ts` under `src/components/reports/grid/` | `src/lib/reports/grid/grid-state.ts` | path only |
| `appendFilters` at `grid-state.ts:88` | `:81` | line only — the function is unchanged and still writes one parameter per key |
| `grid-request.ts:225` parses with `params.get(...)` | present, in `filterValueFor` | ✅ exact fact confirmed |
| `grid-props.ts:66-77` `filterCells` builds the defs | present; **confirmed it sets no `multiple` and no `width`** | ✅ the load-bearing fact |
| `ReportGrid.tsx:239-244` renders a raw Actions `<th>` | present at ~239–245 | line only |
| `Table.tsx` / `GridFilterRow.tsx` / `DataTableToolbar.tsx` / `GridHeadCell.tsx` / `grid-view.ts` line references | **every one exact** | none |

**One plan error, not a drift:** §3 lists eight source files and puts `selectAll` on
`MultiSelectFilterDef` — but that interface lives in `src/lib/table-controls.ts`, not in
`DataTableToolbar.tsx`. Nine files were touched. Same field, same default, same behaviour.

---

## §C · OQ-8 — the truncation cap is NOT verified in a real browser

**Status: OPEN, bounded, and shipped with the means to close it.**

happy-dom does no layout, so the specs can assert that a cell carries `truncate` and one `max-w-`
ceiling but **not** that an ellipsis appeared. The plan (§C.4, OQ-8) required a real-browser check.
**It could not be run: no browser binary can be executed from this sandbox.**

- **Risk:** `max-width` on a `<td>` under `table-layout: auto` is the standard truncate-in-a-table
  pattern and is honoured for shrinking by current browsers, but it is weaker than a block box's
  `max-width` and unbreakable content can push past it.
- **Failure mode if it does not hold:** *the column does not narrow.* Visible on the first compact
  report, no data harm, nothing corrupted.
- **It cannot move an existing render either way** — nothing truncates today.
- **The fix, if needed, is named and untaken:** wrap the truncating cell's children in an inner
  `<span class="block truncate">` carrying the width class. Touches only the `wrap === "truncate"`
  path. Not taken pre-emptively, because the plan makes it conditional on an observed failure.
- **To close it:** open `runs/change-08/output/truncate-probe.html` in any browser. It measures and
  prints seven PASS/FAIL lines and a verdict.

---

## §D · An estate tooling bug found here — `quality-sensors.mjs` ignores every justification on Windows

**Not this project's file, and not fixed here.** `scanJustifications`
(`organization/scripts/quality-sensors.mjs:285`) splits comment text on `\n` and matches `…(.*)$`. In
JavaScript `.` does not match `\r`, so on a **CRLF working tree — every Windows checkout — `$` can
never match and EVERY `QUALITY-JUSTIFY` record is silently ignored.**

This scorecard first returned `BLOCKED (5 open, 0 justified)` with five correctly-formed, correctly-
positioned justifications sitting in the source. Isolated against the sensor's own exported function:

```
LF   -> [{"rule":"RC-05", … ,"words":9}]
CRLF -> []
```

Worked around here by normalising the changed files to LF — which is what git already stores in the
index, so the commit is byte-identical either way and nothing was gamed. **Suggested fix for the
estate:** split on `/\r?\n/`, or match `(.*?)\s*$`. Left for the owner because it is shared tooling
outside this project's lane. The next Windows session will hit it on its first justification and will
have no reason to suspect the tool.

⚠ Also worth the owner's eye, from the same run: `CE-01`/`CE-05` and `CE-08`/`RC-09` are **not
scanned** at all (no `componentGlobs` / `wiringGlobs` in this project's sensor config), so their PASS
rows are a silence rather than a measurement. Answered by hand in `centrality-scorecard.md`.

---

## §E · Standing repo drift — re-verified, all pre-existing, all out of lane

Fourth change running to record these. None is caused by, or fixable within, this change.

| | |
|---|---|
| **No prettier config**, so `pnpm format:check` fails repo-wide across all `src/` files including ones never opened here. **Not a CI job** | out of lane |
| **No `lint` script and no eslint config** — `pnpm lint` cannot be run and is not claimed as run | out of lane |
| **No `audit:deps` script** — CI's own job was reproduced in Node instead | out of lane |
| `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows modified after any `vitest` run, with a **zero-line content diff** — a CRLF artifact. **Not staged** | not a defect |
| **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — **eighth** change to raise it. The eight-seam map in the approved plan §2 is this change's record in its place. A governance decision for the owner, not something a change may invent | owner |

---

## §F · Advisory watch items below the blocking threshold

Seven moderate advisories sit under `--audit-level=high` and do not block. Two are the handover's
standing watch items and are still present — **third change to raise them**, both owner decisions:

- **`GHSA-fxqj-rqcc-2cmp`** — PostCSS, *incomplete fix of* `GHSA-6g55-p6wh-862q`, whose parent **is**
  on the ignore list. That list's own revisit trigger reads *"when the estate advisory batch bumps
  next"* — and §A is that batch bumping.
- **`GHSA-qx2v-qp2m-jg93`** — PostCSS XSS via unescaped `</style>`.

---

## §G · What the next session must not re-investigate

1. **The one-value `SelectCell` was not refactored, deliberately** (plan §A.4). Its being the shipped
   function unedited is what makes byte-identity provable. Do not "unify" it with `MultiSelectCell`.
2. **`HEAD_WRAP` and `CELL_WRAP` are two records on purpose.** A head already never wraps; a shared
   record would map `wrap → ""` and strip `whitespace-nowrap` from every header in the estate.
   Mutation M-1 exists for this.
3. **A width class is emitted only under `truncate`.** Capping without clipping spills the value out of
   the cell. Mutation M-3.
4. **All three of a column's rows must take the same `width`.** Mutation M-7; §C.4a.
5. **Do not restore a mutated file with `git checkout --` on Windows** — `defect-log.md` D-1.
6. **A pnpm store directory name is not parseable on Windows. Read the manifest** — `defect-log.md` D-2.
7. **Consumer repos cannot be read or run from a build worktree.** No consumer suite was executed and
   nothing in this pack claims one was. **Eighth** change to record it.
