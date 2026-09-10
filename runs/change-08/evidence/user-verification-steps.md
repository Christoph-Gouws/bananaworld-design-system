# User verification steps — CR-DESIGN-SYSTEM-009

> For a **non-technical reader**. Written to be followed, not admired.

## 🔴 Read this first: there is nothing to click yet, and that is by design

This change is to the **shared parts cupboard** every Bananaworld app builds its screens from — not to
a screen. It makes two new things *possible*; it switches neither of them on.

So if you open a report today, or after this merges, **it will look exactly as it does now.** That is
the safety rule working, not a disappointment: four apps (DC, the CRM, RMS, org-admin) take parts from
this cupboard, and each one decides for itself when to pick up new ones. If a change here altered what
they already show, it would change four apps without anyone reviewing it.

The report gets smaller, and the tick-lists get ticks, when **the reporting app makes its own change**
to ask for them. That is the next step, and it is a separate piece of work.

---

## What you WILL be able to see, once the reporting app asks for it

| What you asked for | What you will see |
|---|---|
| *"I can only select one item at a time… make it so you can filter by multiple items"* | Click a filter under a column heading and you get a **tick-list**. Tick as many rooms as you like — **the list stays open** while you tick. One tap on **"Select all"** takes everything; tap it again and it clears. It shows **"3 of 12"** so you always know how much you have narrowed to |
| *"the font smaller, a lot smaller… rows much more compact"* | Rows about **two-thirds their current height** — roughly 24 pixels instead of 36–44 — with smaller writing, so far more of the report fits on one screen |
| *"I wouldn't want all the columns equally narrow — some deserve to be wider, like a customer name"* | Three column sizes: **roomy** for names, addresses and descriptions; **ordinary** for most things; **tight** for dates, references and numbers. A size is a **ceiling, not a fixed width** — "Cold room 1" still sits in a narrow column, so the report does not become a grid of equal boxes |
| A value too long for its column | Cut with a **"…"**, and **hover it to read the whole thing** |

---

## Step 1 — check the picture, five minutes, no technical knowledge

Open `runs/current/mockups/CR-DESIGN-SYSTEM-009/comparison.html` in any browser.

| Look at | Expected | Pass? |
|---|---|---|
| The three columns marked **A**, **B**, **C** near the top | **B** is the one marked *recommended* — three column sizes. It is what was built | ☐ |
| Column **B**'s table | Every **customer name is whole**; only the **notes** are cut; the date and the case count take only the room they need | ☐ |
| The **"Today" vs "Yours"** pair further down | "Yours" fits noticeably more rows in the same space, and is still comfortable to read | ☐ |
| The tick-list picture | A **"Select all"** row at the top with a count beside it, and individual ticks below | ☐ |

**If any of those is not what you wanted, say so now** — while it is still a picture. Changing a
column from "ordinary" to "roomy" later is a one-word edit, not a rebuild.

---

## Step 2 — the one technical check that could not be done here, and takes one click

Open `runs/change-08/output/truncate-probe.html` in any browser.

It prints a short list ending in a line beginning **`OQ-8 VERDICT:`**.

| Expected | Meaning |
|---|---|
| `OQ-8 VERDICT: MAX-WIDTH HOLDS ON A <td> UNDER AUTO LAYOUT` | ✅ the column cutting works as designed. Nothing to do |
| `DOES NOT HOLD — take the inner-span fallback` | ⚠ hand this line back. The fix is already written down and is small; it touches only the new cutting behaviour and cannot affect any existing screen |

**Why you are being asked:** this session had no browser it was allowed to run, so this is the one
claim that could not be tested here. It was not guessed at and it was not skipped — it was packaged so
anyone with a browser can settle it in a click.

---

## Step 3 — the decision waiting for you 🔴

**This change has NOT been submitted for merging, and the reason has nothing to do with the work.**

The day before this was built, three serious security problems were published about **Next.js** and
**sharp** — building blocks this cupboard shares with all the apps. Two of them let an attacker run
their own code on a server without logging in.

- They are **not caused by this change.** The current live code has exactly the same problem today.
- The automated safety check refuses to let *anything* merge in this repository until they are dealt
  with.
- **The fix is small and already identified** — take the newer version, which is inside the range this
  project already allows. It was verified that doing so clears all three.
- This session was **not permitted to change dependency versions**, and the only other option — adding
  the two "run code on your server" problems to an approved-ignore list — is not a decision a build
  session may make on your behalf.

**Read the one-page card at `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` and pick an
option.** The change is finished, tested and saved on its branch; it continues the moment you answer.

---

## What was checked for you, so you do not have to

| Question | Answer |
|---|---|
| Could this break a screen that works today? | **No — and it was measured, not assumed.** 1,972 different ways the existing screens use these parts were rendered against the current live version and against this one, and compared letter for letter: **not one difference** |
| The seven document-list screens that use the tick-list? | **Byte-for-byte identical**, checked by a full snapshot of their markup |
| Do the new tests actually catch mistakes? | **Yes** — eight realistic mistakes were deliberately reintroduced, and the tests caught **all eight** |
| Does anything need updating in the database? | **No.** This part of the system has no database at all |
| Was anything left running afterwards? | **No.** No database container was ever started |
| Can someone read a cut-off value with a screen reader? | **Yes.** Cutting is visual only — the full text is still there for assistive technology |
| Did anything in the reporting app get touched? | **No.** It was opened to read, four files, and never written to |
