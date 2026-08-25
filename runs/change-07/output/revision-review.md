# Revision review (Stage 05) — CR-DESIGN-SYSTEM-007

**Scope: exactly the two files in `changed-files.md` §1.** Nothing else was reviewed, because
nothing else was changed.

| # | File | Reviewed |
|---|---|---|
| 1 | `src/components/Table.tsx` | +31 / −13 |
| 2 | `tests/components/Table.test.tsx` | +155 / −0 |

## 1. Does the code do what the approved plan said?

Line by line against the plan's §2, which specified the fix in full including its comment text.

| Plan said | Code does | Match |
|---|---|---|
| `const vertical = valignClass(valign ?? rowValign);` | identical | ✅ |
| `const cellAskedForValign = valign !== undefined;` | identical | ✅ |
| Position (A) keyed `!cellAskedForValign && vertical` | identical | ✅ |
| Position (B) keyed `cellAskedForValign && vertical` | identical | ✅ |
| Both emission slots keep their positions | unmoved | ✅ |
| `resolvedValign` intermediate removed | removed — it existed only to feed the wrong predicate | ✅ |
| Precedence written into the doc-comments and file header | all three updated | ✅ |
| Six new specs T-17 … T-22 in a new §8, no existing spec edited | six specs, §8, `−0` deletions | ✅ |

**No deviation from the approved plan.** Nothing was added that the plan did not sanction, and
nothing the plan required was skipped.

## 2. Is the change as small as it can be?

**Yes — three lines of behaviour**, and the diff cannot be honestly shrunk further:

- The predicate is **one expression**. There is no smaller correct form: the whole defect was that it
  read the resolved value instead of the cell's own.
- Removing the `resolvedValign` intermediate is **not** an unrequested tidy — it was the variable
  that carried the bug, and leaving it would invite the next reader to recompute the predicate from
  it. Its removal is the fix.
- 28 of the 31 insertions are comments. That ratio is deliberate for this file: the two emission
  positions look like duplication and have twice been flagged as an obvious cleanup that is actually
  a contract (`SESSION_HANDOVER.md` note 2). The comments are what stop the next session collapsing
  them.

## 3. 🔴 The refactor that must NOT happen, re-checked

The standing warning in `SESSION_HANDOVER.md` §2 is: **do not collapse `TableCell`'s two
class-emission positions into one.** It survives this change and is now *more* load-bearing, not
less — this change **depends** on both slots existing, since the whole fix is about *which* slot a
row-level answer lands in.

Verified still true after the edit:

| Contract | Guarded by | Status |
|---|---|---|
| Position (A) preserves today's `className="align-top"` workaround | T-8, mutations M-2 / M-4 | intact |
| Position (B) stops a stray utility defeating the cell's prop | T-7, T-19, mutation M-3 | intact |
| Exactly one vertical class enters the list | T-6, T-21, the 576-shape sweep | intact |

The file's comments were rewritten to say this in the new terms — position (A) is now explicitly
described as "the default **or its row's answer**", which is the conceptual change this fix makes.

## 4. Naming

| Before | After | Judgement |
|---|---|---|
| `askedForValign` | `cellAskedForValign` | **Right, and worth the churn.** The old name was not merely vague — it was *false*: it read "asked" while meaning "anybody asked", which is precisely how the defect survived review. The new name cannot be misread the same way |
| `resolvedValign` | (removed) | Right — it now exists only inline, where it cannot be reused for the wrong purpose |
| `vertical` | unchanged | fine; still the single emitted class |

## 5. Test quality

| Check | Result |
|---|---|
| Do the new specs fail against the bug? | **Yes** — mutation M-1 restores the shipped predicate and reddens T-17, T-18, T-21. A regression test that never reddens proves nothing |
| Do they assert the right thing, not just a shape? | **Yes.** T-21 computes the expected winner from the precedence rule rather than asserting `toHaveLength(1)` — which is exactly what T-6 asserted, and exactly why T-6 passed on the defect |
| Are they readable in five years? | Each spec's comment states the rung it pins and why. §8's header states the gap it fills and names T-6/T-7/T-8/T-11 as the specs that did not cover it |
| Any existing spec weakened? | **None edited at all** (`−0`) |
| Redundancy | T-17 and T-18 overlap deliberately: T-17 is the minimal reproduction, T-18 is the reviewer's real-world shape. Keeping both is worth it — the minimal one localises a future failure, the realistic one proves it at scale |

## 6. Altitude

The change sits at exactly the right level: **one predicate inside one function body**. It adds no
abstraction, no helper, no option and no configurability. It does not generalise "precedence" into a
mechanism — there are four rungs and they are expressed by two emission positions plus twMerge's
last-wins rule, which is the smallest thing that works.

## 7. Verdict

**ACCEPT as built.** No revision required. The two simplification candidates considered are recorded
in `simplification-opportunities.md`; both were **rejected**, with reasons.
