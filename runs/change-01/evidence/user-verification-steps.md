# How to check this yourself — CR-DESIGN-SYSTEM-001

> Written for the owner, in plain language. No technical vocabulary needed.

## What changed, in one paragraph

The shared set of building blocks that all your systems draw from could only ever put **words** on a
tappable button. It can now optionally also show **a block of colour** on the button, and carry **a
fuller name** that is read aloud to anyone using a screen reader and shown when you hover a mouse
over it. Both extras are optional — nothing that exists today asks for them, so nothing that exists
today looks any different. This is the missing piece that lets the receiving screen's colour-stage
buttons be built next.

## The honest headline

**Nothing on any screen you use today changes.** Not one button, anywhere, in any of your systems.

That is not a hope, it is the thing the work was mostly about. Five different systems share these
building blocks, and each one picks up updates when it chooses to. So an update that forced them all
to move at once would not be a small change at all — it would be a project. This one does not, and
there is a test that checks it button by button.

## What you can check

### 1. Nothing moved (the important one) — no action needed from you

The automated checks confirm that a button which does not ask for the two new extras comes out
**exactly** as it did before — same text, same size, same colours, same everything, down to the
last detail. If anyone ever accidentally changes that, the checks fail immediately and loudly.

Where to see it: `runs/change-01/output/test-results.md`, the section headed "Group 1 — the baseline
that must not move."

### 2. The colour block looks the way you chose

You picked **option B** — the colour running the full height of the button, flush down its left-hand
edge, with the short code beside it. That is what was built.

To see it: open `runs/current/mockups/CR-DESIGN-SYSTEM-001/option-b.html` in any web browser. The
real thing is built to match that picture — a 7-pixel stripe on a computer screen and a wider
10-pixel stripe on the tablet, so it stays easy to see from a distance in a cold room.

### 3. The fuller name is genuinely reachable

The test that matters here checks a button labelled just "CS3" and confirms that a screen reader
announces the whole thing — "CS3 · More green than yellow" — while your eyes still just see "CS3".

**One honest limit, which you already know from the plan:** hover text does not exist on a
touchscreen. So on the tablet the fuller name is *read aloud* but not *shown*. That was a deliberate
choice — the alternative would have changed every existing button in all five systems, which is
exactly what this change had to avoid.

## What you will NOT see yet, and why that is correct

**The colour-stage buttons on the receiving screen do not exist yet.** This change built the
*capability*, not the screen. Building the actual buttons is the next, separate piece of work, and
it happens in the delivery system (Bananaworld-DC), not here.

Think of it as: this change added the ability to put a colour on a button. The next change actually
puts the banana colour stages on the receiving screen.

**None of your five systems has picked this up yet.** Each one moves to a new version of the shared
building blocks when it chooses to, in its own piece of work. That is deliberate and it is what
keeps them from all having to change at the same time.

## If you want the one-line summary

The building block is ready and proven not to disturb anything. The receiving screen's colour
buttons are the next piece of work, and they can now be built.

## Where everything is

| What | Where |
|---|---|
| The picture you approved | `runs/current/mockups/CR-DESIGN-SYSTEM-001/option-b.html` |
| Plain-English summary of the work | `runs/change-01/output/implementation-summary.md` |
| Every check that was run and its result | `runs/change-01/output/test-results.md` |
| Problems found and fixed along the way | `runs/change-01/output/defect-log.md` |
| Anything left open or worth watching | `runs/change-01/output/known-issues.md` |
| What the next piece of work needs to do | `runs/change-01/evidence/developer-handover.md` |
