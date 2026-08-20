# Session handover — `bananaworld-design-system`

> Last updated: 2026-08-20, at the close of **CR-DESIGN-SYSTEM-005**.

## Most recent unit of work: CR-DESIGN-SYSTEM-005

| Field | Value |
|---|---|
| Unit | **Change Request CR-DESIGN-SYSTEM-005** (not an epic, not a milestone) |
| Title | The depot slot's label is chosen by the app wearing the header |
| Branch | `change/cr-design-system-005`, off `origin/main` @ `0633476` |
| Approved layout | **A** — the slot is always present; omission is NOT offered (owner, plan gate) |
| Ship mode | **on-green** |
| Status | **Built, tested green, closed out. PR opened; the conductor polls CI and merges.** |
| Archive | `runs/change-05/` |
| Open defects | **0** · open decisions: **none** |

### What it did

Added one optional prop to `DocumentHeaderProps`: **`dcLabel?: string`**, defaulted at the point of
use as `props.dcLabel ?? "DC"` — the `dateLabel` precedent applied unchanged. A caller that passes
nothing renders `"DC"` and is byte-identical to today; the CRM passes its own word.

- **Two files touched**, both existing: `src/components/DocumentHeader.tsx` and its spec.
  **All three barrels are byte-identical** — a new optional field on an already-exported interface
  needs no export change.
- 🔴 **`DOCUMENT_HEADER_SLOTS` was not changed by one character**, and `const slots =
  DOCUMENT_HEADER_SLOTS;` / `slots.map(` are unchanged. The array is IDENTITY and ORDER; the prop is
  PRESENTATION, sitting beside it.
- **Layout A: the header always renders four slots. Omission is not offered.** An app with nothing for
  the slot passes `dcName: null` and gets the existing dashed empty state.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **246 passed / 13 files** (baseline before any edit: **235 / 13**) |
| New specs | **11**; **1 existing assertion narrowed** (declared at the plan gate — see note 3) |
| **Additive proof** | `git diff --numstat -- src/` = **+30 / −1**, the one deletion itemised (a one-line `return` → its braced form); barrel diff **empty** |
| Mutation check | 4 deliberate breakages, **4 caught** |
| Dependency audit | 6 highs, **all six already on the standing ignore list, 0 new**. Reproduced in Node — `pnpm audit` is permission-blocked here |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

## State of the repository

- **`main` is at `0633476`** (CR-DESIGN-SYSTEM-004 merged as PR #14). CR-005 sits on its own branch
  with a PR open; the conductor merges.
- **No epic is in flight.** `runs/epic-020/` is pre-existing and closed; this change created no
  `epic-NN/` or `milestone-NN/` folder and nothing under `runs/current/epic-plan/`.
- **No migrations pending.** This package has no database by construction.
- `package.json` / `pnpm-lock.yaml` **untouched** — no new dependency.

## What the next session needs to know

1. 🔴 **CR-CRM-015 is NOT unblocked when this merges.** It is unblocked when this merges **and** the
   CRM's pin bump merges — two changes, two lanes, in that order, and the pin moves against the
   **merged** `main` sha, never a branch sha (KI-M001E19-002). CR-CRM-015 has been blocked since
   2026-08-18 and this change is the whole of the unblock **on this side of the seam only**.
2. **This package is ADDITIVE-ONLY, and that is a lane rule, not a preference.** Four repos pin it by
   git sha and each bumps when it chooses. Never remove a field, change a default, or move an export.
   ⚠ Recorded pin values disagree between documents and are not checkable from a build worktree —
   **read the app's own `package.json`**.
3. 🔴 **One assertion in this repo was narrowed, and DC may hold the same mirror.** This repo's spec
   *"reads NO session"* scanned this component's source for `label="DC" value={props.origin.dcName}`;
   the label half moved, so it now scans for `value={props.origin.dcName}` **plus**
   `label={props.dcLabel ?? "DC"}` — **narrowed, never relaxed.** ⚠ Whether DC's
   `transaction-form-standard.test.ts` pins the same full substring **could not be checked** —
   consumer repos are unreadable from here and none was opened. **DC is red nowhere today** (it pins
   an older sha). If it does pin it, that is a one-line narrowing in DC's lane, on an assertion already
   listed in `runs/change-02/evidence/developer-handover.md` §3 as reddening **by design** at DC's
   adoption — invert it, never relax it.
4. 🔴 **Do not "tidy" the slot model in `DocumentHeader.tsx`.** Folding `dcLabel` into
   `DOCUMENT_HEADER_SLOTS`, deriving labels from a lookup, or rebuilding the slot list locally would
   keep **every DOM spec green** and hand DC a broken source-text contract test weeks later. Two specs
   now redden immediately instead — the byte-exact scan (re-fenced with DC named by file) and a new
   "ORDER stays in exactly one place" guard. Both proved by mutation. Also: `dateLabel` and `dcLabel`
   must stay symmetrical — both `??`, never `||`.
5. **Omission was decided, not deferred: the header always renders four slots.** Dropping one moves the
   document number out of its corner (owner instruction 2026-08-08) and would require a restyle. If a
   consumer needs omission it is an owner decision plus a narrow-breakpoint layout answer, not a prop.
   Option C (`dcHint`, to explain a blank box) is one additive field away and was refused only because
   nobody asked: `runs/change-05/technical-debt.md` TD-2.
6. **CRM still owes seven specific things** before it declares any availability filter as
   `multiSelect` (CR-003): `runs/change-03/evidence/developer-handover.md` §3.
7. **The paging control ships with a consumer obligation the package cannot enforce** (CR-004): a
   server-paged table must **not** use `useTableControls` for search or filter, and `totalCount` must
   be scoped to what that person may see. `runs/change-04/evidence/developer-handover.md` §2.
8. **DC keeps a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing in DC imports.**
   DC's lane should delete it at its next pin bump — from here it would be a lane violation.
9. **Consumer repos cannot be read or run from a build worktree** (paths outside it are permission-
   blocked). **No consumer suite was executed and nothing claims one was.** Fifth change to record it.
10. 🔴 **Do not infer audit health from an unchanged dependency tree** — CR-002 did and CI proved it
    wrong. `pnpm audit` is permission-blocked in build sessions; reproduce it in Node, or read CI's own
    job, which is authoritative. ⚠ **Two probes in a row have lied on their first run** — CR-004's
    mis-parsed pnpm's peer-suffixed store dirs; CR-005's walked a symlink's lexical parent (16 packages
    instead of 72, no nanoid) and compared numeric ids to GHSA strings (all six ignores read as
    BLOCKING). Two sanity checks catch this: the closure should be **~70 packages**, and
    **`nanoid@3.3.18` must be present**. Read the output, never the verdict.
11. **Pre-existing repo drift, all out of lane:** there is **no prettier config**, so `pnpm
    format:check` fails repo-wide — re-verified this session on four files CR-005 never touched — and
    it is not a CI job; there is **no `lint` script and no eslint config**; there is no `audit:deps`
    script; `ci.yml`'s test job label is stale.
12. **Still open from earlier changes:** CR-001's colour-stage chips on the tablet receiving screen;
    CR-002's DC document-header adoption (five assertions redden **by design**); CR-004's DC pin bump
    and then CR-DC-052. None is affected by CR-005.
13. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — **fifth** change to raise
    it. A governance decision for the owner, not something a change may invent.

## Where the paper trail is

| What | Where |
|---|---|
| Approved plan (the contract this was built to) | `runs/current/logic-plan/CR-DESIGN-SYSTEM-005.md` |
| Approved mockup (layout A) | `runs/current/mockups/CR-DESIGN-SYSTEM-005/option-a.html` |
| Stage 04 artifacts | `runs/change-05/output/{test-results,qa-report,defect-log,deployed-verification}.md` |
| Stage 05 artifacts | `runs/change-05/output/{revision-review,simplification-opportunities,accepted-refactors,readable-code-scorecard,centrality-scorecard}.md` |
| Changed files · summary · open items | `runs/change-05/output/{changed-files,implementation-summary,known-issues}.md` |
| Evidence roll-ups | `runs/change-05/evidence/{milestone-evidence,global-milestone-scorecard,user-verification-steps,developer-handover}.md` |
| Technical debt | `runs/change-05/technical-debt.md` |
| Decisions | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` (CR-DESIGN-SYSTEM-005, D-1…D-12) |
| Active unit pointer | `runs/current/active-milestone.md` |
| Previous changes | `runs/change-04/` (CR-004, merged as `0633476`) · `runs/change-03/` (`fc2c5b8`) · `runs/change-02/` (`9aa20f7`) · `runs/change-01/` (`365be65`) |
