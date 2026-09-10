# User verification steps — CR-DESIGN-SYSTEM-010

> For the owner. Plain English, no technical vocabulary. **Nothing here is urgent and nothing is
> blocked on you** — this is what changed and how you could see it if you wanted to.

## The short version

An outside checker found three faults in last week's filter work. All three were still there. All
three are fixed.

1. **"Select all" now actually shows everything.** It was hiding rows that have nothing recorded in
   that column, and switching the "Clear" button on — on a tap you made to see *more*, not less.
2. **A remembered choice that is no longer offered stops going missing.** If a saved layout is
   narrowed to two rooms and one of those rooms is later closed, the box now says "2 chosen" instead
   of "1 chosen", and the closed room is kept instead of being thrown away the next time you tick
   anything.
3. **A column-width setting no longer clashes with an older one.** It now accepts both, so an app
   picking this work up will not break.

## What you will see on a screen today

**Nothing.** No app is running this code yet — every app is still on last week's version or earlier —
so no report, list or table moves when this merges. That is the point: this repairs the parts
**before** the first app picks them up.

## If you want to see the "Select all" fix for yourself

There is no screen to open — this is the shared parts box, not an app. But here is the exact thing
that changed, in words:

| | Before | After |
|---|---|---|
| Open a depot filter and tap "Select all" | rows with **no depot recorded** disappear, and "Clear" lights up | every row stays, including the blank ones, and "Clear" stays off |
| The tick at the top when nothing is picked | not ticked, reads "0 of 3" | **ticked**, reads "**All 3**" — the tick means "nothing is hidden" |
| Tick all three depots by hand | ticked, "3 of 3" | ticked, "3 of 3" — **unchanged**, and it still leaves blank rows out, because you asked for three named depots |

The last row is the one wrinkle worth knowing: **ticking every option by hand is not the same as
showing everything.** "All 3" versus "3 of 3" is what tells those two apart on screen. That was in the
page you approved.

## The three looks you were shown

You picked **A**. It is the one where the tick means "you are seeing everything", the count on the
right reads "All 3" when nothing is picked, and tapping the row always puts you back to the whole
list. The page is still at `runs/current/mockups/CR-DESIGN-SYSTEM-010/option-a.html` if you want to
re-read it.

Your pick changed **two lines** of the finished work and nothing else — the rest of the change was the
same whichever you had chosen.

## Nothing is waiting on you

| | |
|---|---|
| Decisions owed | **None.** The plan gate answered the only one |
| Defects open | **None** |
| Actions owed by this change | **None** |

## Two things still open from earlier, unchanged by this

1. **The one-click check from two weeks ago.** `runs/change-08/output/truncate-probe.html` — opening
   it in a browser settles whether a long value is really cut short at the column edge. Still not
   done, still one click, still not urgent. This change did not touch that part.
2. **Four entries on the security "known and accepted" list are now pointless** — the problems they
   describe were fixed last week. Tidying them is a small job of its own and it is your call, not
   something a defect fix should quietly do.

## What was deliberately left alone

- **A closed room still shows as a code rather than a name.** If a filter is holding a room that no
  longer exists, the box shows the room's internal code. That is now *counted correctly* and *kept*,
  which is the fix — but giving it a friendlier label ("Cold room 9 — closed") is a wording decision
  you have not been asked, so it was not invented. Written down as a follow-up.
- **The apps were not updated.** Each app picks this up in its own change, at its own gate. That is
  the standing rule and it was not bent.
