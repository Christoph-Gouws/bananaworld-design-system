# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-14, at the close of **CR-DESIGN-SYSTEM-002**.

## Most recent unit of work: CR-DESIGN-SYSTEM-002

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-002** (not an epic, not a milestone) |
| Title | The document header moves into the shared package, so two apps wear one header instead of two copies that drift |
| Branch | `change/cr-design-system-002`, off `origin/main` @ `365be65` |
| Approved layout | **n/a — not UI-bearing** (D-9) |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out, PR #10 open — but BLOCKED at CI on an unrelated dependency advisory.** `NEEDS_OWNER: decision` raised 2026-08-14 (D-12). |
| Archive | `runs/change-02/` |
| Open defects | **0** · one open **decision**: D-12 |

### What it did

Promoted Bananaworld-DC's four-slot document header (Date · DC · Raised by · Document no.) into this
package, so the CRM can wear the **same** header rather than hand-building a second one that drifts.

- `src/components/DocumentHeader.tsx` — new, ported from DC
- `src/lib/document-date.ts` — new, the **pure day-line describer only** (54 of DC's 420 lines).
  DC's SQL fragments, column map, row readers and validator stayed in DC (TECH-COMP-003)
- `src/components/index.ts`, `src/index.ts`, `src/lib/index.ts` — appended, +34 / −0

**Precondition verified first, as instructed:** CR-DC-039 landed — no `useAuth` import or call
remains in DC's component. Had it still been there, this change would have stopped.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **115 passed / 9 files** (baseline before any edit: 79 / 7) |
| New tests | 36, in `tests/components/{DocumentHeader,document-date}.test.tsx` |
| Source diff | **34 insertions, 0 deletions** — purely additive |
| **Byte identity vs DC's `main`** | **282 / 282 code lines identical; 2 differing lines, both import specifiers** |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

### 🔴 Open decision D-12 — CI's `dependency-audit` refuses PR #10

**Nothing to do with this change.** `package.json` and `pnpm-lock.yaml` are untouched on this branch,
so the same job fails on any PR opened against this repo today. Two new **high** advisories —
`GHSA-28wg-ghj8-5hjv` and `GHSA-2v37-7h3g-55p8`, both `nanoid` — arrive via
`. > next > postcss@8.4.31 > nanoid@3.3.12`, the same auto-installed `next` peer route as the six
GHSAs the owner already approved ignoring on 2026-07-22 and 2026-07-26.

Not self-decided: extending `ignoreGhsas` is a written security trade-off reserved to the owner under
Hard Rule 2, and the alternative (a `pnpm.overrides` bump to nanoid `^3.3.18`) needs `pnpm-lock.yaml`
regenerated, which this session cannot do — `pnpm` is permission-blocked.

Owner card: `runs/current/decisions-pending/CR-DESIGN-SYSTEM-002.md`. Detail: `known-issues.md` §0.

## State of the repository

- **`main` is at `365be65`** (CR-DESIGN-SYSTEM-001 merged). CR-DESIGN-SYSTEM-002 sits on its own
  branch with a PR open; the conductor merges on green.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created nothing
  under it and created no `epic-NN/` or `milestone-NN/` folder of its own.
- **No migrations pending.** This package has no database by construction.

## What the next session needs to know

1. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Five repos pin it by
   git sha — DC (`b1373c78`), CRM (`4bc1f220`), RMS (`ecba2218`), org-admin (`ecba2218`) and
   Mangaverde (`e3a88e35`). Each bumps when it chooses. Never remove a field, change a default, or
   move an export.
2. **Never bump a consumer pin from here**, and when a consumer bumps it must be against the
   **merged** sha on `main`, never a branch sha. KI-M001E19-002 is that mistake on record.
3. 🔴 **The follow-up is Bananaworld-DC's adoption change, and it has a known red.** Five assertions
   in DC's `tests/contract/transaction-form-standard.test.ts` go red at adoption **by design** —
   line 889 exists specifically to assert this promotion had *not* happened. The fix is to re-point
   `SHARED_HEADER` and **invert** that spec, never to relax it. Line numbers and the full list:
   `runs/change-02/evidence/developer-handover.md` §3. **DC's suites could not be run from this
   sandboxed worktree and nothing in the evidence claims they were.**
4. **The exported names are FROZEN** so DC's follow-up compiles unedited — the eight component
   exports plus `describeDocumentDate` / `DOCUMENT_DATE_WARN_DAYS` / `DocumentDateMood` /
   `DocumentDateDescription`. Do not rename or tighten them.
5. **The eight transitional pieces were NOT carried across, and that was approved.** The request
   asked for them; the owner had already deleted them at CR-DC-046 under DECISION-358 (2026-08-12).
   Do not "restore" them here — that would be a DC-lane change if the owner ever wants it.
6. **CR-DESIGN-SYSTEM-001's follow-up is still open** and unchanged: bump DC's pin, then build the
   colour-stage chips on the tablet receiving screen (`runs/change-01/evidence/developer-handover.md`).
   The `swatch` / `description` field names remain frozen.
7. **Pre-existing repo drift, all out of lane:** `pnpm format:check` fails on 44 files (all three
   barrels this change edited already failed at `HEAD`, verified by stash); there is **no `lint`
   script and no eslint config**; `ci.yml`'s test job label is stale. Recorded in
   `runs/change-02/output/known-issues.md`.
8. 🔴 **`pnpm` cannot be run inside the build session** (permission-blocked), so `pnpm audit` was
   reproduced in Node against npm's bulk advisory endpoint. **Do not infer audit health from an
   unchanged dependency tree** — this change did exactly that and CI proved it wrong: the tree was
   identical to `main`, but two new advisories had been published against it. Reproduce it, don't
   assume it. See D-12 above.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-002.md` |
| Approved mockup | none — not UI-bearing (D-9) |
| Stage 04 artifacts | `runs/change-02/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-02/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-02/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-02/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous change | `runs/change-01/` (CR-DESIGN-SYSTEM-001, merged as `365be65`) |
