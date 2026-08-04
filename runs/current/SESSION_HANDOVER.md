# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-04, at the close of **CR-DESIGN-SYSTEM-001**.

## Most recent unit of work: CR-DESIGN-SYSTEM-001

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-001** (not an epic, not a milestone) |
| Title | A ChoiceGroup chip may carry a colour swatch and its own accessible name, additively |
| Branch | `change/cr-design-system-001`, off `origin/main` @ `b1373c7` |
| Approved layout | **B** — full-height colour stripe flush to the chip's left edge |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out, PR opened.** Merge is the conductor's job. |
| Archive | `runs/change-01/` |
| Open defects | **0** |

### What it did

Added two **optional** fields to `ChoiceOption` in `src/components/ChoiceGroup.tsx`:

```ts
readonly swatch?: { readonly hex: string; readonly accentHex?: string | null };
readonly description?: string;
```

`swatch` renders the existing `ColourSwatch` inside the chip as a full-height stripe flush to its
left edge. `description` becomes the chip's `title` **and** its `aria-label`, so a chip can show
"CS3" while announcing "CS3 · More green than yellow". Radix `RadioGroup` is untouched underneath.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **79 passed / 7 files** (baseline before any edit: 61 / 6) |
| New tests | 18, in `tests/components/ChoiceGroup.test.tsx` |
| Source diff | **57 insertions, 0 deletions** — purely additive |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

### Files changed (2)

- `src/components/ChoiceGroup.tsx` — modified, +57 / −0
- `tests/components/ChoiceGroup.test.tsx` — added, +356

Nothing else. `ColourSwatch.tsx`, `index.ts`, `vitest.config.ts`, `ci.yml` and `package.json` were
each considered and deliberately left untouched — reasons in `runs/change-01/output/changed-files.md`.

## State of the repository

- **`main` is at `b1373c7`** at the time of this handover. CR-DESIGN-SYSTEM-001 sits on its own
  branch with a PR open; the conductor merges on green.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created nothing
  under it, and created no `epic-NN/` or `milestone-NN/` folder of its own.
- **No migrations pending.** This package has no database by construction.

## What the next session needs to know

1. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Five repos pin it by
   git sha — Bananaworld-DC (`b1373c78`), CRM (`4bc1f220`), RMS (`ecba2218`), org-admin (`ecba2218`)
   and **Mangaverde** (`e3a88e35`, a fifth consumer the change request did not name). Each bumps when
   it chooses. Add optional fields; never remove one, never change a default, never move an export.
2. **Never bump a consumer pin from here**, and when a consumer does bump, it must be against the
   **merged** sha on `main`, never a branch sha. KI-M001E19-002 is that mistake on record.
3. **The follow-up work is in Bananaworld-DC, not here:** bump DC's pin against the merged sha, then
   build the colour-stage chips on the tablet receiving screen. DC's own
   `tests/unit/components/ChoiceGroup.test.tsx` is a genuine regression gate on
   CR-DESIGN-SYSTEM-001 and could not be run from this sandboxed worktree — run it at bump time and
   treat a failure as this change's problem. Detail in `runs/change-01/evidence/developer-handover.md`.
4. **The field names `swatch` / `description` and `accentHex: string | null` are frozen** so DC's
   prepared follow-up compiles unedited. Do not rename or tighten them.
5. **Pre-existing repo drift, all out of lane:** `pnpm format:check` fails on 44 files (the changed
   file already failed at `HEAD`); there is no `lint` script or eslint config; `ci.yml`'s test job
   label still says "pricing & sales-order engines". Recorded in `runs/change-01/output/known-issues.md`.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-001.md` |
| Approved mockup (layout B) | `runs/current/mockups/CR-DESIGN-SYSTEM-001/option-b.html` |
| Stage 04 artifacts | `runs/change-01/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-01/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-01/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-01/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` |
| Active unit pointer | `runs/current/active-milestone.md` |
