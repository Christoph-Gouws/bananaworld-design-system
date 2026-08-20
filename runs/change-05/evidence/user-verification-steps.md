# User verification steps — CR-DESIGN-SYSTEM-005

> How the owner can check this change is what was asked for. Written for a reader who does not want to
> read TypeScript.

## What you asked for

The strip of four boxes across the top of every depot form has the word **"DC"** printed over the
second box, and that word was fixed inside the shared kit. The customer system has no depots, so the
word is wrong for it — which is why its own change had been stuck since 18 August.

**After this, each app prints its own word over that box.** The depot system prints "DC" exactly as
before, and not one of its forms moves or reads differently.

## The three things to check, and how

### 1. The depot system is untouched — nothing moved, nothing reads differently

**What to look for:** a test named
*"prints 'DC' when no label is given — every existing caller is byte-identical"*.

It renders the header the way every one of the depot system's twelve forms renders it — passing no
word at all — and checks that the four boxes still read **Date · DC · Raised by · Document no.**, in
that order.

**How we know that test really works:** we deliberately broke the code four different ways and re-ran
the suite each time. Every break was caught. One of those breaks was "ignore the app's word entirely",
and seven tests went red. The full list is in `runs/change-05/output/test-results.md`, section 4.

⚠ **What we could NOT do, and are not claiming:** the depot system's own tests live in a different
repository that this session cannot open or run. **They were not run and nothing here says they were.**
What we have instead is the code argument — the depot system passes no word, so it gets "DC", which is
the identical text it got before — plus this package's own copies of the depot system's checks.

### 2. The customer system can now print its own word

**What to look for:** a test named
*"prints the app's own word when one is given, and leaves the other three alone"*.

It passes the word "Branch" and checks the four boxes read **Date · Branch · Raised by · Document no.**
Nothing else moved. A second test checks the box stays **second** even when renamed — renaming a box
must never move it, which was your ruling about the date box and applies here for the same reason.

### 3. The question you were asked to settle — an app with nothing for that box

**Your answer was A, and A is what was built: the box stays, showing the faint dash it already uses for
anything not filled in.**

**What to look for:** a test named
*"renders FOUR slots always — labelled or not, filled or empty"*. It checks four different
combinations and counts the boxes every time. It would go red the day somebody let an app drop the box.

**And the reason B was not built is written down** rather than left implied: with three boxes instead
of four, the document number slides out of the top-right corner — and on a narrow screen it lands
bottom-left. That is your ruling of 8 August, and fixing it would mean restyling the header, which this
change was told not to do. Option C — letting an app add a short line such as "Not applicable" under
the dash — was not built either, on one ground: nobody has asked for it. It is cheap to add later and
nothing is closed off.

The decision is written in three places a developer will actually reach: on the setting itself in the
code, in `runs/change-05/evidence/developer-handover.md`, and as the test above.

## The risk you were told about

A safety check inside the depot system reads the **exact wording** of this file rather than what it
does. That wording was kept **character for character** — the list of four box names is unchanged, "DC"
included, and the line that draws them is unchanged. So that check is safe.

**One related check needed a line updated, and it was updated here, in this repository.** A copy of that
same safety check lives in this package too, and it was looking for a phrase that had to change. It was
made **narrower, never weaker** — it still proves the thing it exists to prove, and now also pins the
"DC" default, so it checks slightly more than it did before.

⚠ **One thing is genuinely unknown**, and it is written down rather than guessed: whether the depot
system's own copy of that check looks for the same phrase. We cannot open that repository from here. If
it does, it is a **one-line** update, in the depot system's own lane, whenever it next moves across —
and it is on a line that repository already has to visit for other reasons. **Nothing is broken today.**

## What was deliberately not done

- The customer system's own work — it moves to this version in its own change, when it chooses.
  **This change alone does not finish that job**; it is the first of two.
- No other box changed, none moved, none was added, nothing was restyled, not one colour or spacing
  value changed.
- The "Raised by" box did **not** get the same treatment. Nobody has asked, and it is one setting away
  if anyone ever does.

## The numbers

| | |
|---|---|
| Tests before the change | 235, all passing |
| Tests after | **246, all passing** |
| New tests | 11 |
| Existing tests changed | **1**, made narrower (see "the risk", above) |
| Lines of real code added | **2** — one setting, one line that uses it. The rest is explanation |
| Other systems changed | **none** |
| Database changes | **none** — this package has no database |

## Where the paper trail is

| What | Where |
|---|---|
| Plain summary of what was built | `runs/change-05/output/implementation-summary.md` |
| Every acceptance criterion, each with a verdict | `runs/change-05/output/qa-report.md` |
| Test results, including the four deliberate breakages | `runs/change-05/output/test-results.md` |
| What the next developer needs to know | `runs/change-05/evidence/developer-handover.md` |
| Decisions taken | `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` |
