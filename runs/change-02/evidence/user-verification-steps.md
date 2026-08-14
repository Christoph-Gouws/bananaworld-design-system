# User verification steps — CR-DESIGN-SYSTEM-002

## Read this first

**There is nothing to look at, and that is the whole point of this change.**

Nothing on any screen changes today. Your fourteen depot forms keep the same strip at the top — the
date, the depot, who raised it, the document number — looking exactly as it looks now. If anything
about them looked different, this change would have gone wrong.

What changed is **where the strip is kept**. It used to live inside the depot system only. It now
also lives in the shared kit that the depot system and the sales system both already draw their
buttons and boxes from. The sales system can now wear the **same** strip rather than somebody
building a lookalike that slowly drifts out of step.

The depot system picks up the new home later, in a separate step of its own, at a time it chooses.

## What you can check yourself

| # | Step | What you should see |
|---|---|---|
| 1 | Open any of the depot forms that carry the strip — a stock adjustment, a sales order, a dispatch | The same four boxes in the same order: **Date, DC, Raised by, Document no.** Nothing moved, nothing renamed, nothing new |
| 2 | Open a document somebody else raised | It still names **them** and **their** depot — not you. That was fixed earlier and this change did not disturb it |
| 3 | Open a document with no number yet | Still the dash and "Not numbered yet" |
| 4 | Type over a document number | Still the "Changed" tag, the sentence explaining that automatic numbering will not move, and the Undo link |
| 5 | Back-date a document by a couple of days | Still the quiet blue line naming the day, with Undo |
| 6 | Back-date one by more than two months, or type a date in the future | Still the amber box and "Is that right?" — and it still lets you save. It asks; it never blocks |

**Every one of the above should be identical to what you saw yesterday.** If any of it differs,
that is a defect in this change and it should be reported.

## The one thing to confirm

When you asked for this, you asked me to carry across the old fall-back wiring, in case you ever
wanted numbering switched back off.

**Since then you ruled numbering permanent and on, and that fall-back was deleted on 12 August** —
by your own decision, two days before this work started. So there was nothing left to carry, and the
strip moved exactly as it stands today.

This was raised with you at the plan stage and the plan was approved. It is repeated here only so
that nobody later reads "the fall-back was not carried across" as an oversight. **If you meant
something different, say so** — restoring it would be a separate piece of work in the depot system's
own lane, not here.

## What is NOT in this change

- **The sales system does not start using the strip.** That is its own job, straight after this one.
- **The depot system does not switch over yet.** It moves to the new home when it chooses.
- No new boxes, no new layout, nothing added "just in case".

## Risk

Fourteen live forms lean on this strip and none of them changes in this piece of work. The strongest
check available was run: the moved file was compared line by line against the original, and **282 of
282 lines of working code are identical** — the only two differences are the two lines that say where
the file's neighbours live, which had to change because the file moved house.

## What happens next

1. This change is reviewed and merged.
2. The **depot system** bumps its pin to the merged version and deletes its own copy — its own change.
   A handful of its internal checks are expected to go red at that moment **by design**: one of them
   exists specifically to assert that this move had not yet happened. They are listed for whoever
   does that work.
3. The **sales system** adopts the strip — its own change, after that.
