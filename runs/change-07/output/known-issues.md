# Known issues — CR-DESIGN-SYSTEM-007

## A. Environment and lane observations

### A-1 — The plan's premise was re-verified and **nothing had moved**

Required disclosure either way. Every file, function and line the plan **cites** was spot-checked
against this fresh worktree before any edit: `Table.tsx:249` (the defective predicate, verbatim),
`:246-249`, `:255-265`, `HEAD` = `ce470103e657d016e0dfe40ae63d9f38fa414df7`, the test line ranges for
T-6 / T-7 / T-8 / T-11 / T-12, DC's pin at `package.json:54`, and `SalesOrderForm.tsx:1024-1026`.
**All exact.** Full table in `implementation-summary.md` §1. The build proceeded on a confirmed
premise, not a stale one.

### A-2 — F1 was re-confirmed against current code, not taken on the reviewer's word

The standing instruction is to never implement a fix for a defect that is no longer there. F1 was
**confirmed present and unchanged**, by reading the file *and* by mutation **M-1**, which restores the
shipped predicate and reddens the new specs. There was only one finding and it still held, so nothing
was dropped.

### A-3 — ⚠ `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified, with an **empty** content diff

`git status` reports this file as modified after any `vitest` run. `git diff` on it produces **no
output**, and `git diff -w` likewise: the change is purely a CRLF line-ending normalisation by the
working copy (git warns `LF will be replaced by CRLF the next time Git touches it`).

**Not staged, not committed, not this change's to fix.** Disclosed so it is not read as an
undeclared edit. It is a pre-existing repo line-ending configuration quirk (no `.gitattributes`
normalising this path), out of lane.

### A-4 — Consumer repos cannot be read or run from a build worktree

Four of five consumer repos (CRM, RMS, org-admin, Manga Verde) are outside this session's permitted
directories. **No consumer suite was executed and nothing in this pack claims one was.** DC is
readable and was **read only** — no `Write`, `Edit`, stage, commit or formatter ever targeted a DC
path. **Seventh consecutive change to record this limit.**

### A-5 — Pre-existing repo drift, all out of lane, all re-verified this session

- **No prettier config**, so `pnpm format:check` fails repo-wide across all 48 `src/` files —
  including files this change never opened. It is **not** a CI job.
- **No `lint` script and no eslint config.** `pnpm lint` does not exist.
- **No `audit:deps` script.** CI runs `pnpm audit --prod --audit-level=high` directly (`ci.yml:68`);
  that job was reproduced in Node instead, since `pnpm audit` is permission-blocked here.
- `ci.yml`'s test-job label is stale.

None is this change's to fix; each would be an unrequested edit in a minimum-surface lane.

## B. Advisories for the owner's eye — neither blocking, neither actionable by a change

Both are **moderate**, so they sit below CI's `--audit-level=high` threshold. Changing the ignore
list or bumping a pinned peer is an **owner decision**, not a change's to make.

### B-1 — GHSA-fxqj-rqcc-2cmp (the standing watch item, carried from CR-006)

*"PostCSS: incomplete fix of GHSA-6g55-p6wh-862q."* Its parent advisory **is** on this repo's
standing owner-approved ignore list, and that ignore's own revisit trigger reads *"when the estate
advisory batch bumps next"*. Carried unchanged — **second change to raise it**.

### B-2 — GHSA-qx2v-qp2m-jg93

*"PostCSS has XSS via Unescaped `</style>` in its CSS Stringify Output."* Reaches this package only
through the same auto-installed `next` peer as every other postcss advisory here. Moderate; recorded
for completeness.

**The advisory profile is otherwise identical to CR-006's** — 6 high (all six on the ignore list),
7 moderate, **0 new advisories**, **0 blocking**.

## C. Open questions carried, not answered here

| # | Question | Status |
|---|---|---|
| **OQ-2** | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no `governance/` directory | **Seventh consecutive raise.** A governance decision for the owner; a change may not invent it. Seams recorded in `centrality-scorecard.md` §4 instead |
| **OQ-3** | CR-006's technical-debt items | Unaffected; they stay in `runs/change-06/technical-debt.md`, which was **cited and never edited** (a closed unit is immutable) |
| **OQ-4** | Every consumer still owes `grep -rn "valign" src` before its pin bump (CR-006 D-8) | Unchanged by this change; **still owed** by CRM, RMS, org-admin and Manga Verde. DC is proven clean |

## D. Technical debt knowingly left: **none**

`runs/change-07/technical-debt.md` is **deliberately not created**, and this is the recorded reason
rather than an omission.

The plan anticipated one debt item — *"a documented silent override"* — but only **if option B** were
chosen. The owner chose **A**, which **removes** the silent override instead of documenting it. There
is no residual: no shim, no deprecated path, no TODO, no half-migration, and no follow-up owed inside
this repository.

🔴 Nothing was appended to `runs/change-06/technical-debt.md` — a closed unit's register is immutable.

## E. Consumer obligations — outside this repo, unchanged by this change

Not debt in this lane, but the reason this change fixes no screen today:

1. **The CRM's pin bump to the MERGED `main` sha** (never a branch sha — KI-M001E19-002), then
   `valign="top"` on its sales-order line grid. Three steps, in order, in the CRM's own change.
2. The **one grep** each consumer owes before bumping (OQ-4 above).
3. Still owed from earlier changes and untouched here: the CRM's `dcLabel` adoption (CR-005), DC's
   pin bumps for CR-002/CR-004 then CR-DC-052, the CRM's seven-point saved-view obligation (CR-003),
   CR-001's colour-stage chips.
