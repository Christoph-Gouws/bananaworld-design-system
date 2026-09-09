# A decision for you — CR-DESIGN-SYSTEM-009

**Date:** 2026-09-09 · **Takes about two minutes** · **Nothing is broken and nothing is at risk right
now**

---

## The short version

**Your change is finished and working.** Multiple-choice filters, smaller rows, sensible column
widths — all built, all tested.

**But it can't be handed over yet, and it's nothing to do with your change.**

Yesterday, the people who look after two of the building blocks we use published warnings about
serious security holes in them. Our automatic safety check has spotted them and it now refuses to let
*anything* through until they're dealt with — your change, or anybody else's.

**The important part: this problem is already in the live code today.** Your change didn't cause it
and didn't make it worse. It just happened to be the thing standing at the door when the alarm went
off.

---

## What the problem actually is

Two of the warnings are the serious kind: they would let an outsider run their own instructions on one
of our servers **without needing a password**. The third is less severe.

The building blocks affected are ones almost every modern web system uses. It isn't something we wrote
or got wrong — the people who make them found the holes and have already published the repaired
versions.

---

## Your options

### Option A — take the repaired versions *(recommended)*

Move to the newer, fixed versions of both building blocks.

- ✅ **The holes are closed.** All three warnings go away — this was checked, not assumed.
- ✅ **It's a small, ordinary step.** The newer versions are already within the range this project
  said it would accept, so nothing about how the system is put together changes.
- ✅ Your change goes through straight afterwards.
- ⚠️ Like any update, it should be re-tested afterwards. The full test suite runs automatically and
  takes minutes.

### Option B — record them as "known and accepted" and carry on

We keep a short list of warnings we've looked at and decided to live with. We could add these three.

- ✅ Fastest. Your change goes through immediately.
- ❌ **I'd advise against it.** Two of these three are the "stranger runs their own instructions on our
  server, no password needed" kind. That's not the sort of thing the accepted list is meant for, and a
  repair already exists. I'm not willing to add them without you saying so explicitly.

### Option C — leave it, and let the safety check keep refusing

- ❌ Your change stays parked, and so does every other change to this part of the system.
- ❌ The security holes stay open regardless.

---

## What I'd do

**Option A.** The repair exists, it's a small step, it's inside what this project already allows, and
it closes two "no password needed" holes. I couldn't do it myself only because this build session
isn't permitted to change which versions we use — that's deliberate, so that a version change is never
made quietly in the middle of other work.

---

## One more thing worth knowing

This cupboard of shared parts is used by **all** the apps — the depot system, the CRM, and the others.
Fixing it here fixes **this cupboard's** safety check. It does **not** patch the apps themselves;
each one carries its own copy of the same building blocks and will need the same update.

That's a bigger piece of work than this change, and it's your call how to handle it. I've flagged it
here rather than quietly fixing one corner and leaving you thinking the whole thing was done.

---

## What happens next

Just reply with **A**, **B**, or **C**.

- **A** → the versions are updated, everything is re-tested, and your change is handed over the same
  session.
- **B** → recorded as your explicit decision, and your change is handed over immediately.
- **C** → nothing further happens until you say otherwise.

Your change is saved and safe either way — none of the work is lost, whichever you pick.

---

### Also worth a minute, but not blocking

There's one small thing I couldn't check because this session had no web browser it was allowed to
open: whether the "cut a long value off with a …" actually looks right on screen.

**If you want to settle it yourself,** open this file in any browser:
`runs/change-08/output/truncate-probe.html`

It prints a line beginning **`OQ-8 VERDICT:`**. If it says **HOLDS**, all is well and there's nothing
to do. If it says **DOES NOT HOLD**, tell me — the fix is already written down, it's small, and it
can't affect anything that works today.
