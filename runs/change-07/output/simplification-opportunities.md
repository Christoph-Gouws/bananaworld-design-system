# Simplification opportunities (Stage 05) — CR-DESIGN-SYSTEM-007

**Scope: the two files in `changed-files.md` §1.** Four candidates were considered. **None accepted.**
Each rejection is on a stated ground, not on taste.

## S-1 — Collapse the two class-emission positions into one 🔴 REJECTED

**The candidate.** `TableCell` emits `vertical` in one of two slots, guarded by
`!cellAskedForValign` / `cellAskedForValign`. Emitting it once, after `className`, would delete a
conditional and read cleaner.

**Why it is tempting.** It keeps T-1 green, it removes what looks like duplication, and it is the
first thing any reviewer proposes. It has now been proposed and rejected in three consecutive
changes.

**Why it is wrong.** It breaks **D-2**, the estate-wide contract: today `className="align-top"` is
the *only* way an existing caller can top-align a cell, and it works **only** because the default is
emitted **before** `className`. Collapsing to a single trailing slot would keep "the default is
middle" true and **silently revert every caller using that workaround** across five sha-pinned apps.

**Guarded by:** T-8 (position), mutations **M-2** and **M-4** — both redden T-8.

🔴 **This change makes the warning stronger, not weaker.** The fix is precisely *which slot a
row-level answer lands in*; with one slot there is no fix to express. The standing note in
`SESSION_HANDOVER.md` §2 is carried forward verbatim.

## S-2 — Keep `resolvedValign` as a named intermediate 🔴 REJECTED

**The candidate.** Retain `const resolvedValign = valign ?? rowValign;` and write
`valignClass(resolvedValign)`, for a shorter diff and a name on the resolved value.

**Why it is wrong.** That variable **is** the defect's mechanism. It is the single value from which
someone once computed "did anybody ask?", and its whole hazard is that it *looks* like the right
thing to key a predicate on. Keeping it in scope beside `cellAskedForValign` invites the exact
regression this change exists to remove — and the regression is silent.

Inlining it costs one expression and removes the trap. **Rejected: a shorter diff is not worth
re-arming the bug.**

## S-3 — Fold T-17 into T-18, or T-20 into T-21 🔴 REJECTED

**The candidate.** T-18 (six cells) subsumes T-17 (one cell); T-21's 80 combinations subsume T-20's
single non-alignment `className` case. Dropping the smaller of each pair removes ~35 lines.

**Why it is wrong.** They fail differently, and that is the point.

- **T-17 is the minimal reproduction** — one row, one cell, one assertion. When it reddens, the cause
  is unambiguous. T-18 reddening tells you something is wrong across six cells and you still have to
  localise it.
- **T-20 names an intent** — "a row's answer still reaches a cell whose `className` is not an
  alignment" — that a reader can find by name. Inside T-21's 80-iteration loop the same case is a
  coordinate, not a statement, and its failure message is a label string.

Both survived mutation testing as distinct signals: M-5 reddens T-20 *and* T-21; M-1 reddens T-17
*and* T-18. **Rejected: deduplicating tests that localise different failures buys lines and costs
diagnosis.**

## S-4 — Extract the precedence rule into a named helper 🔴 REJECTED

**The candidate.** Something like `resolveVertical(valign, rowValign, className)` returning the
winning class, so the rule lives in one testable function instead of being spread across two emission
positions.

**Why it is wrong.** It would require **parsing `className`** to detect a vertical utility — turning a
pure, cheap class-list assembly into a string scan on **every cell render**, in a package whose lane
rule is minimum surface. It would also *duplicate* twMerge's job: the last-wins resolution is already
implemented, correctly and for free, by `cn`. And it is essentially option **C** from the plan's
§2.2, which the owner did not pick.

**Rejected on cost and on scope:** new code, new per-render work, and a mechanism the approved layout
A does not call for.

## What was deliberately not looked at

Per scope fence 1, this review covered **only** the two changed files. The rest of `Table.tsx`, the
other 12 components and the other 13 test files were **not** reviewed for simplification — reviewing
and refactoring them would be unrequested scope in a lane whose whole rule is minimum surface. The
below-the-bar findings from CR-006's review remain out of scope and untouched.

## Outcome

**0 accepted, 4 rejected.** See `accepted-refactors.md` — deliberately empty, with the reason
recorded there rather than left implicit.
