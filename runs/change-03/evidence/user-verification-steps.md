# User verification steps — CR-DESIGN-SYSTEM-003

> For the owner. **There is nothing to click today, and that is the change working as intended** — this
> is a shared parts library, and no screen has asked for the new filter yet. Below is what you can
> check now, and what you will be able to check when the first screen adopts it.

## 1. What you can see right now — the drawing you approved

Open `runs/current/mockups/CR-DESIGN-SYSTEM-003/option-a.html` (or the shared link in
`ARTIFACT_URL.txt`). That is **layout A**, the one you chose, and it is what was built:

| State | What it reads |
|---|---|
| Nothing chosen | `All depots` — word for word what a one-value filter says today |
| One chosen | `Cape Town` — indistinguishable from today's control |
| Three chosen | `Cape Town +2` — one line, always |
| Open | "All depots" pinned at the top (ticking it clears everything), then a tick box per choice, and a small `3 chosen · Esc` line at the bottom |

## 2. The promise that mattered most, and how it was kept

> *"Nothing on any screen changes the day this lands."*

Every list that uses these filters today was drawn out in a test **before** any code was written, and
the exact result was recorded. After the change, the same tests were run again and compared
character-by-character against that recording. **They matched exactly** — so no list moved, not by a
pixel, and this is a measurement rather than an opinion.

There are **eleven** such lists, not the nine the request assumed — six in the depot system, one in
the sales system, and four in the admin console the request did not know about. All eleven were
checked. None changes.

## 3. What you will be able to check when a list adopts it

Ask whichever team adopts it first to show you:

1. **Pick two, then three.** The list narrows to those and the filter reads `Cape Town +2`.
2. **The list of choices stays open** while you tick several — you should never have to re-open it.
3. **"All depots" at the top clears everything** in one click.
4. **Keyboard only, no mouse:** Tab to the filter, Enter to open, arrows to move, Space to tick (the
   list stays open), Esc to close — and the cursor comes back to the filter itself.
5. **The one-value filters next to it look and behave exactly as they always have.**

## 4. 🔴 The one thing to hold the sales team to

The sales system's saved availability arrangements remember filter choices, per rep, in its own
database. This library **cannot see that table and did not touch it.** What it did do is make the
saved shape readable both ways — an arrangement holding one choice is stored exactly as it is stored
today, so an older copy of the app still opens it correctly — and it now reports when an arrangement
had to open **wider** than it was saved, so the app can say so out loud instead of quietly showing
everything.

**The sales team owes seven specific pieces of work before it turns this on for availability filters**
(`runs/change-03/evidence/developer-handover.md` §3). The one to hold them to is the last:

> An arrangement saved **before** this change must open showing **that depot only** — not every depot.

Until all seven are done, that screen must not use the new filter style. That is written down for them
rather than left to be discovered.

## 5. What has *not* happened, so nobody waits for it

- **Neither app has moved yet.** The depot system and the sales system each name this library by an
  exact version, and each moves when it chooses, in its own piece of work. Nothing here reaches a rep
  until they do.
- **No list has adopted the new filter style.** Adding it to a real screen is that screen's own work.
- Nothing was changed about the search box, the date filter, or any list's layout.
