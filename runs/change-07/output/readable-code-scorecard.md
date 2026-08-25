# Readable code scorecard (Stage 05) — CR-DESIGN-SYSTEM-007

**Scope: the two files in `changed-files.md` §1.**

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | **Names say what the thing is** | **PASS** | `cellAskedForValign` states its own scope. The predecessor, `askedForValign`, was **actively misleading** — it read "asked" while meaning "anybody asked", which is how the defect survived a review. Renaming was part of the fix, not decoration |
| 2 | **No dead or unreachable code** | **PASS** | The `resolvedValign` intermediate was removed; it had exactly one remaining consumer and that consumer was the bug. Nothing else added or orphaned |
| 3 | **Comments explain WHY, not WHAT** | **PASS** | The new predicate comment does not say "check if valign is set" — it says why only the *cell's* prop earns position (B), and names the failure mode of the alternative (`Computing this from the RESOLVED value let a row-level answer silently beat a cell-level one`) with the CR id |
| 4 | **The contract is written down where it is enforced** | **PASS** | The precedence rule appears in three places a reader will actually be standing: the file header, `TableRowProps.valign`, and `TableCellProps.valign`. Previously it lived only in a decision log the next author would not open |
| 5 | **Control flow is flat and obvious** | **PASS** | One `??`, one `!==`, two boolean guards in a class list. No nesting, no early returns, no branching added |
| 6 | **Consistent with the file's existing idiom** | **PASS** | Mirrors `alignClass` / `effectiveAlign` exactly — a private classifier function, a resolved value, a single emitted class. The vertical axis reads the same way as the horizontal one |
| 7 | **A reader can find the trap before falling in it** | **PASS** | Both emission-position comments now state what each position preserves, and the (B) comment explicitly says *"A ROW's answer never reaches here — see the predicate above."* The standing "do not collapse these" warning is reinforced in `revision-review.md` §3 and the handover |
| 8 | **Tests read as specifications** | **PASS** | §8's header states the coverage gap it fills and names T-6/T-7/T-8/T-11 as the specs that did not cover it. Each spec names the rung it pins. T-17's comment carries the actual defective emission list |
| 9 | **Failure messages localise the failure** | **PASS** | T-21 labels every one of its 80 iterations `row=… cell=… className=…`; T-18 labels per-cell. T-17 exists as a one-assertion minimal reproduction precisely so its failure is unambiguous |
| 10 | **No cleverness that needs decoding** | **PASS** | The mechanism is two positions in a class list plus twMerge's documented last-wins rule. No parsing, no reflection, no dynamic keys |
| 11 | **Comment density matches the surrounding file** | **PASS** | `Table.tsx` is a heavily-commented contract file (its `alignClass` comment records a historical bug). 28 of 31 insertions being comments is this file's idiom, not an excess — and the two emission slots are the specific thing that has twice been mis-read as duplication |
| 12 | **Nothing unexplained left in the tree** | **PASS** | All five throwaway harnesses deleted before commit and each named in `changed-files.md` §4, so the numbers they produced remain traceable |

**Score: 12 / 12 PASS.**

## The one thing a future reader most needs

That the two class-emission positions are **a contract, not duplication** — and that this change
*depends* on both existing. It is stated in the code, in `revision-review.md` §3, in
`simplification-opportunities.md` S-1 and in the handover. Four places, because it has been proposed
as a "cleanup" in three consecutive changes.
