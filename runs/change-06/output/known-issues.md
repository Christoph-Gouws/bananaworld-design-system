# Known issues — CR-DESIGN-SYSTEM-006

**Open defects: 0. Open decisions: 0.**
**Close-gate pre-flight at hand-back: 0 PENDING, 19 OK, 2 VIOLATED-NOW — both outside this change's
lane and unreachable from this session (A-3).**

## A. Items belonging to this change

### A-1 — the plan's F-14 count is overstated (recorded, approach unaffected)

The plan states *"50 DC files reference `TableCell`"*. Re-measured in this session:

```
grep -rl "TableCell" src        -> 39
grep -rl "TableCell" src tests  -> 40
```

**39, not 50.** This does not touch the approved approach. What the plan actually *relies on* is
**F-13** — that none of those files passes `valign` — and that was re-run and is **zero across the
entire DC repo**. The additive argument is about the *absence* of a prop, not the number of files, so
39 or 50 the emitted class string is the same string. Per the build instruction ("something moved but
the approved approach still holds → note what moved and carry on"), it is noted here and the build
continued. Every other cited fact (F-1 … F-13, F-15) was verified exact — `implementation-summary.md`
§0.

### A-2 — ⚠ the read-only sibling repo has dirty paths, one modified DURING this session

**This matters because the conductor fingerprints `bananaworld-dc` before and after this session and
refuses the change if a byte moved.** Full disclosure, so a concurrent writer is not mistaken for a
lane violation here:

| Path | State | mtime |
|---|---|---|
| `runs/current/logic-plan/EPIC-025-M-06.md` | modified (`+473 / −431`) | **2026-08-24 18:00:42** — *inside this session's window* |
| `runs/proposed/scan-count-module-concept.md` | untracked | 2026-08-24 15:58:47 — **before** this session started (~17:47) |

**What this session did in that repo: reads only.** `Grep`, `grep`, `ls`, and
`git -C … status/diff/log`. **No `Write` or `Edit` tool call targeted a DC path at any point, no
redirect wrote there, and no formatter was run there.** Every DC citation in this pack is a path and
a line number.

**What the modified file is:** DC's logic plan for **EPIC-025-M-06 — label printers at the
distribution centre** ("On site: three printers, real work, cold rooms" → retitled "Epic closeout:
harvest the print evidence…"). It has no connection to the design system, to tables, or to anything
this change reads. The overwhelmingly likely cause is **a concurrent DC lane running in parallel**.

**Not remediated here, deliberately** — touching DC to "tidy" it would be the exact lane violation
the rule exists to prevent. Raised for the conductor/owner instead.

### A-3 — ⚠ two close-gate VIOLATED-NOW items that this session cannot reach

The close-gate pre-flight, re-run after the evidence pack was written, reports **2 VIOLATED-NOW and 0
PENDING**. Both are the same estate file, and **neither is this change's and neither is fixable from
here**:

```
- governance index matches the file tree (Scorecard 17 C3)
    → no index row: organization/scripts/lib/session-retry.mjs
- compliance rule manifest in sync (schema + source pointers + coverage)
    → unencoded, unacknowledged — organization/scripts/lib/session-retry.mjs
```

| Fact | Evidence |
|---|---|
| It is **not this project's file** | `organization/scripts/lib/session-retry.mjs` is estate-level Change Runner tooling. This change touched two files, both under this worktree |
| It **did not exist at session start** | This session's own opening pre-flight reported *"governance index matches the file tree (Scorecard 17 C3)"* as **OK**, with **0 VIOLATED-NOW**. It appeared during the session |
| It is **unreadable from here** | Outside this session's permitted directories — `Get-Item` on it is refused. It cannot be read, let alone registered in `_kernel/GOVERNANCE_INDEX.md` |
| Fixing it would be **out of lane** | Amending the estate governance index or the compliance rule manifest is a kernel/governance edit, not part of an additive component change, and would be an unreviewed change to shared governance |

**Raised for the conductor/owner, not remediated.** Same category as A-2: another lane moved
something during this session. Everything inside this change's own scope is green — **PENDING is 0**
and all 19 other checks are OK, including all eight SC-K-12 close-gate scorecards.

### A-4 — the change is inert until a consumer both bumps and opts in

Nothing renders differently in any app today. A consumer sees this option only after it bumps its pin
to the **merged `main`** sha (never this branch's — KI-M001E19-002) **and** passes the new prop. **No
pin was bumped here and none may be from here.** The CRM's sales order grid adoption is a separate
change in the CRM's own lane.

## B. Limits of this session — what could not be done, and why

### B-1 — four of five consumer repos are unreadable and none was run

**Sixth consecutive change to record this.** Only `bananaworld-dc` is exposed to this session (and
read-only). **CRM, RMS, org-admin and Manga Verde were not opened**, and **no consumer test suite was
executed in any repo, including DC**. Nothing in this pack claims otherwise. The additive claim rests
on the measured 384-shape render diff plus the pre-edit regression specs — see `qa-report.md` §3.

### B-2 — one named residual: the `valign` prop name shadows a deprecated DOM attribute

`TdHTMLAttributes` already declares `valign?: "top" | "middle" | "bottom" | "baseline"`. So
`<TableCell valign="top">` **compiled before this change**, was spread onto the `<td>`, and was
visually inert. It is now consumed and does what it says. This is the same move the file already made
for `align`.

- **DC: proven clean — zero occurrences repo-wide.**
- **The other four: unverifiable from here.** One-line grep owed at each pin bump.
- **Zero-residual fallback if a live usage is ever found:** rename to `verticalAlign`, which is
  provably unreachable today (not in `TdHTMLAttributes`, no index signature → passing it is a
  TypeScript error). **Carried, not built** — it costs the symmetry with `align` that the plan chose.

### B-3 — the kernel evidence template could not be copied

`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` is outside this session's permitted
directories and the read was refused. `evidence/milestone-evidence.md` therefore follows the
structure of `runs/change-05/evidence/milestone-evidence.md`, which was itself produced from that
template — so the boilerplate is inherited rather than re-typed, as instructed. **Sixth change to hit
this limit.**

### B-4 — `pnpm audit` is permission-blocked

Reproduced in Node instead, over the real production closure, against the same npm endpoint, with
handover note 10's sanity checks applied first. **The probe was wrong on its first run and was
corrected** — `defect-log.md` D-1. `pnpm audit` is **not** claimed as run.

## C. Pre-existing repository drift — all out of this change's lane

Re-verified this session; every item was already recorded at CR-005's close (handover note 11).

| # | Item | Evidence it is pre-existing |
|---|---|---|
| C-1 | **No `lint` script and no eslint config.** `pnpm lint` → `Command "lint" not found` | `package.json` scripts are exactly `typecheck`, `test`, `format:check`. No `.eslintrc*`, no `eslint.config.*` |
| C-2 | **`pnpm format:check` fails repo-wide.** No prettier config exists | **All 48 `src/` files fail, including files this change never opened** — confirmed on `src/components/Button.tsx`, whose formatted output differs even after normalising line endings. Not a CI job. **Not fixed here:** running `prettier --write` would rewrite 48 files and bury a two-file change |
| C-3 | **No `audit:deps` script**, though the build instruction names one | `package.json` scripts, above. The audit was reproduced in Node instead |
| C-4 | `ci.yml`'s test job label is stale | recorded at CR-005; not touched |
| C-5 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no `governance/` directory** | **Sixth** consecutive change to raise it (CR-001 D-12, CR-002 D-10, CR-003, CR-004, CR-005 D-12, here). Creating it is a **governance decision for the owner**, not something a change may invent. The seams are recorded in the plan §3 and in `centrality-scorecard.md` instead |

## D. Watch items for the next session

| # | Item |
|---|---|
| D-1 | **GHSA-fxqj-rqcc-2cmp** — *"PostCSS: incomplete fix of GHSA-6g55-p6wh-862q"*, `<=8.5.22`. **Moderate**, so it does not block at `--audit-level=high` — but it is an incomplete fix of an advisory that **is** on this repo's standing ignore list. The next/sharp ignores record their own revisit trigger as *"when the estate advisory batch bumps next"*. **An owner decision, untouched here.** Six more moderates sit below the threshold; all seven are listed in the probe output quoted in `test-results.md` §5 |
| D-2 | 🔴 **Do not flip the vertical default to `top`, and do not "tidy" the two-position emission in `TableCell`.** Collapsing it to a single position looks cleaner and silently breaks one of two contracts: the default's **position** (today's `className="align-top"` workaround, T-8) or the prop's **precedence** over `className` (T-7). Both are proved by mutation (M-2, M-5). The comments on those two lines say so at the point of edit |
| D-3 | **A future audit probe must assert every advisory id is non-empty and matches `/^GHSA-/` before comparing.** Three probes in a row have been wrong on their first run, and this one's bug was *downstream* of the two existing sanity checks. `defect-log.md` D-1 |
| D-4 | Still open from earlier changes, none affected by this one: the CRM's pin bump + `dcLabel` adoption (CR-005 → unblocks CR-CRM-015); DC's pin bumps for CR-002 and CR-004, then CR-DC-052; the CRM's seven-point saved-view obligation (CR-003); CR-001's colour-stage chips. **DC keeps a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing imports** — DC's lane to delete |
| D-5 | `TableHead` still has no `valign` (OQ-4, `technical-debt.md` TD-1). One optional field away, refused because nobody asked |
