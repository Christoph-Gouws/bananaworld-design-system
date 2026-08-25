# Defect log — CR-DESIGN-SYSTEM-007

**Open defects at close: 0.** One defect was found and fixed inside this session.

## D-1 — the mutation harness reverted the fix it was supposed to be testing

| Field | Value |
|---|---|
| Found | during the mutation battery, immediately after M-1 |
| Severity | **process, high** — it does not ship, but it silently invalidates evidence |
| Status | **FIXED in session** |

**What happened.** The harness pattern was: apply a mutation to `src/components/Table.tsx`, run the
suite, then `git checkout -- src/components/Table.tsx` to restore. `git checkout --` restores a file
from the **index**, and at that point the fix was still **unstaged** — so the "restore" put back
`HEAD`'s file, i.e. the *unfixed* component, wiping the change under test.

**How it was caught.** The editor reported the file as reverted immediately after the first restore.
It was not caught by a test — every remaining mutation would have run against unfixed code and
several would still have "reddened something", which is exactly why this is logged rather than
quietly corrected.

**Why it matters.** M-2 through M-5 would each have been applied to `main`'s component and scored as
though they were applied to the fix. The battery would have reported "5 caught" against code that no
longer contained the change. The evidence would have been false while every number in it was real —
the failure mode the honesty rules exist for.

**The fix.** The fix was re-applied, then `git add`-ed *before* the battery resumed, so
`git checkout --` restores the **staged, fixed** file. Verified after every subsequent mutation by
re-checking `git diff --cached --stat src/components/Table.tsx` (31 insertions / 13 deletions) and
`grep -c cellAskedForValign` (3) before moving on.

**Re-validation of M-1.** M-1's result is retained and is sound: `node mut.mjs M-1` ran *before* the
faulty restore, so the mutation was applied to the **fixed** component, and it reddened T-17, T-18
and T-21 as designed. M-2 … M-5 were all run after the fix was staged. The final state was
re-verified from scratch: `pnpm test` → **269 passed**, `pnpm typecheck` → clean.

**Carried forward.** Recorded in `developer-handover.md` for the next session: *a mutation harness
must stage the change before it starts, or `git checkout --` restores the wrong file.*

---

## Findings from the CR-DESIGN-SYSTEM-006 review

| Finding | Verdict against the code as it is now | Outcome |
|---|---|---|
| **F1** · `src/components/Table.tsx:249` · medium/medium — `askedForValign` is true for a row-sourced valign as well as a cell-sourced one, so a row's `valign` is emitted after `className` and silently overrides a cell's own explicit vertical-align utility | 🔴 **CONFIRMED, present and unchanged** since the reviewer saw it. Verified by reading the file at `ce47010`, and by mutation **M-1** which restores the shipped predicate and reddens T-17/T-18 | **FIXED** — see `implementation-summary.md` §3 |

**No finding was dropped**, because there was only one and it still held. Had it not, the plan's
standing instruction was to say so plainly and drop it rather than implement a fix for a defect that
is not there.

**The below-the-bar findings from CR-006's review were deliberately not touched** — they are recorded
in that change's review record, and scope fence 1 of this plan puts them out of scope.

## No defects shipped

| Check | Result |
|---|---|
| Specs reddened by this change | **0** |
| Existing specs edited to make them pass | **0** — the plan's standing instruction was: *if any existing spec reddens, the fix is wrong; stop and re-plan, never edit the spec.* None reddened |
| Known-wrong behaviour left in | **none** |
| Technical debt knowingly created | **none** — see `known-issues.md` §3 |
