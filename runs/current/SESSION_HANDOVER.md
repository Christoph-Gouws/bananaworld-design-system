# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-14, at the close of **CR-DESIGN-SYSTEM-003**.

## Most recent unit of work: CR-DESIGN-SYSTEM-003

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-003** (not an epic, not a milestone) |
| Title | A toolbar filter can hold one value. Let it hold several, without disturbing the screens that hold one |
| Branch | `change/cr-design-system-003`, off `origin/main` @ `9aa20f7` |
| Approved layout | **A** — the closed trigger reads `Cape Town +2` (owner, plan gate) |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out. PR opened; the conductor polls CI and merges.** |
| Archive | `runs/change-03/` |
| Open defects | **0** · open decisions: **none** |

### What it did

Added a **third filter kind, `multiSelect`**, beside `select` and `dateRange` in the shared
table-controls engine, and a Radix `DropdownMenu`-of-checkboxes control to render it. A screen that
declares `select` declares exactly what it declared before and renders byte-identically.

- `src/lib/table-controls.ts` — `MultiSelectFilterDef` / `MultiSelectFilterValue`; four functions gain
  an arm; the **stored-shape contract** (`filterValueFromStored`, `storedFromFilterValue`,
  `StoredFilterReading`)
- `src/components/DataTableToolbar.tsx` — `MultiSelectFilterControl` + `MultiSelectItem`, both private
- `src/components/index.ts`, `src/lib/index.ts`, `src/index.ts` — appended: ten filter types + two
  helpers. **Nothing renamed, moved or removed**
- `tests/components/{table-controls,DataTableToolbar}.test.tsx` + a committed snapshot file — new

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **189 passed / 11 files** (baseline before any edit: 115 / 9) |
| New tests | **74**, of which **36 are characterisation specs written before a line of source changed** |
| **Additive proof** | The seven toolbar screens' DOM snapshot **hash is identical before and after** the source edit (`ce7bd849…`) |
| Source diff | **+347 / −26**; every deletion itemised in `changed-files.md` §1.1 |
| Dependency audit | 6 highs, **all six already on the standing ignore list, 0 new**. Reproduced in Node — `pnpm audit` is permission-blocked here |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## State of the repository

- **`main` is at `9aa20f7`** (CR-DESIGN-SYSTEM-002 merged as PR #10/#11). CR-DESIGN-SYSTEM-003 sits on
  its own branch with a PR open; the conductor merges.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created nothing
  under it and created no `epic-NN/` or `milestone-NN/` folder of its own.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` are **untouched by this change** — no new dependency.

## What the next session needs to know

1. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Four repos pin it by
   git sha and each bumps when it chooses. Never remove a field, change a default, or move an export.
   ⚠ The recorded pin values disagree between documents (`SESSION_HANDOVER` history says DC
   `b1373c78` / CRM `4bc1f220`; the CR-003 plan §1.4 read `365be65` for both from their
   `package.json`s). Neither is checkable from a build worktree — **read the app's own `package.json`**.
2. **Never bump a consumer pin from here**, and when a consumer bumps it must be against the **merged**
   sha on `main`, never a branch sha. KI-M001E19-002 is that mistake on record.
3. 🔴 **CRM owes seven specific things before it declares any availability filter as `multiSelect`.**
   Saved availability views (CR-CRM-011) persist filter values per rep, and both cross-version
   directions currently fail by *silently widening*. The package fixed the half it can (one value is
   stored as a bare string, so an old build reads it correctly) and reports the other half
   (`widened`). Full list: `runs/change-03/evidence/developer-handover.md` §3.
4. **Two lines must not be undone**, both fenced in the source: `onSelect={(e) => e.preventDefault()}`
   on each `CheckboxItem` (without it the menu closes after every tick), and the `multiSelect` arm of
   `hasActiveControls` (without it "Clear" sits permanently lit on any adopting screen). Also do not
   tidy `matchesFilter`'s trailing `return true` into a throw — it is what stops an old saved view
   crashing a screen.
5. **The blast radius is eleven call sites across three apps, not nine across two.** Six DC toolbar
   screens, one CRM, plus **four org-admin screens that drive the engine without the toolbar**. All
   eleven are proved unaffected; org-admin's are answered at the type level (`qa-report.md` §4).
6. **DC keeps a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing in DC imports.**
   It will not gain the new kind and drifts further. DC's lane should delete it — from here it would
   be a lane violation (seam S-4).
7. **Consumer repos cannot be read or run from a build worktree** (paths outside it are permission-
   blocked). Their filter declarations were transcribed from the approved plan's inventory and labelled
   as such; **no consumer suite was executed and nothing claims one was.** Third change to record this.
8. **Pre-existing repo drift, all out of lane:** `pnpm format:check` fails repo-wide (all five files
   this change edited already failed at `HEAD`, verified by stash, and it is not a CI job); there is
   **no `lint` script and no eslint config**; `ci.yml`'s test job label is stale.
9. 🔴 **Do not infer audit health from an unchanged dependency tree** — CR-002 did and CI proved it
   wrong. `pnpm audit` is permission-blocked in build sessions; reproduce it in Node against npm's
   bulk advisory endpoint (CR-003 did), or read CI's own job, which is authoritative. When an advisory
   arrives through the `next` peer, prefer an **override** to a seventh ignore (owner ruling D-12).
10. **Still open from earlier changes:** CR-DESIGN-SYSTEM-001's colour-stage chips on the tablet
    receiving screen, and CR-DESIGN-SYSTEM-002's DC document-header adoption — where **five assertions
    in DC's `tests/contract/transaction-form-standard.test.ts` go red by design** and must be inverted,
    never relaxed (`runs/change-02/evidence/developer-handover.md` §3). Neither is affected by CR-003.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-003.md` |
| Approved mockup (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-003/option-a.html` |
| Stage 04 artifacts | `runs/change-03/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-03/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-03/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-03/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-DESIGN-SYSTEM-003, D-1…D-20) |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-02/` (CR-002, merged as `9aa20f7`) · `runs/change-01/` (CR-001, merged as `365be65`) |
