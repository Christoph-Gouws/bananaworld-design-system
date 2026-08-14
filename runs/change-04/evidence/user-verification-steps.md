# User verification steps — CR-DESIGN-SYSTEM-004

> For the owner. Plain language, no technical vocabulary.

## The short version

**There is nothing for you to click today, and that is correct.**

This change adds a set of list controls — choose how many rows to see, step back and forward, and a
line reading "Showing 1–25 of 312" — to the **shared kit** that all four apps are built from. It does
**not** put those controls on any screen. No screen in any app looks or behaves one bit differently
today, and none will until each app separately chooses to pick up the new version of the kit and a
particular list is wired up.

So the honest verification is: **open any list in DC, the CRM or org-admin and confirm nothing has
changed.** That is the whole test, and it is the important one — four apps share this kit, so the
first rule is that adding something new must disturb nothing that already works.

## What was actually built

- A **rows-per-page chooser** offering 25, 50, 100 or 200, sitting at the **top right** of a list.
- **Previous and Next arrows** at the **top right and the bottom right** — so at the end of a long
  list you can move on without scrolling back up. That is the arrangement you asked for at the plan
  gate, and all of it is drawn in `runs/current/mockups/CR-DESIGN-SYSTEM-004/option-a.html`.
- The line **"Showing 1–25 of 312"** at the **top left** — option A, the one you chose.
- It always tells the truth at the edges: the last page shows however many rows are actually left
  (twelve, not a padded twenty-five), a list of exactly 100 rows is four pages and not five with an
  empty one, and an empty list says "Showing 0 of 0" rather than going blank.
- Someone using a keyboard can reach all of it, and someone using a screen reader hears the count
  read out **once** when they turn a page — not twice, even though the arrows appear twice.

## 🔴 The one thing worth knowing before anyone reports progress

**This does not unblock the transaction-lists job (CR-DC-052) on its own.**

Each app is locked to one exact version of the shared kit. Adding the control to the kit changes
nothing for DC until **DC separately moves to the new version** — a second, separate piece of work in
DC's own lane. So it is two steps, not one:

1. this change lands in the shared kit (what you are approving now);
2. DC moves to the new version of the kit;

and only then can the transaction-lists job start. Please treat anyone reporting CR-DC-052 as
"unblocked" the moment this merges as mistaken.

## What was deliberately not built

- **Nothing got faster, and nothing was supposed to.** You said plainly that nothing is slow today.
  This is preparation so the control exists once, in the shared kit, rather than being rebuilt inside
  each app. There is no speed claim anywhere in this work, because there would be no honest way to
  verify one.
- **Remembering a person's chosen page size between visits is not included.** You put it out of
  scope; it was raised as a question rather than quietly slipped in. If you ever want it, the CRM
  already does something similar for saved views and that is where the pattern would come from.
- **No list anywhere was wired up.** That is a separate job per screen.

## The one judgement call you may want to revisit later

When a list eventually fetches **one page at a time from the server**, the search box has to search
**everything**, not just the rows currently on screen — otherwise it quietly hides matching records,
which to someone using it looks exactly like data going missing.

You approved the smaller option: **write that rule down** for each list's team to follow, rather than
rebuilding the shared search bar now (which sits on many live screens). That rule is now written in
three places, including inside the code file itself where the next developer will read it.

**What it costs, stated plainly:** the shared kit cannot *stop* a team getting this wrong — it can
only tell them. If that ever feels too thin, the bigger option is still available later and adding it
then would not break anything built now.

## How to check it yourself, if you want to

| What | Where |
|---|---|
| The drawing of what was built | `runs/current/mockups/CR-DESIGN-SYSTEM-004/option-a.html` — open in a browser |
| The plan this was built to | `runs/current/logic-plan/CR-DESIGN-SYSTEM-004.md` |
| Proof nothing existing moved | `runs/change-04/output/changed-files.md` — the change adds two new files and twenty-four lines to three lists of exports, and **deletes nothing** |
| All the checks that were run | `runs/change-04/output/test-results.md` — 235 checks pass, up from 189, with none of the existing 189 altered |

## Status

| Item | State |
|---|---|
| Built to the approved plan, layout A | ✅ |
| Every check green | ✅ 235 of 235, plus a clean build |
| Anything broken on a live screen | **No — nothing existing was edited at all** |
| Anything for you to test in an app today | **No** — nothing is on a screen yet |
| Open questions for you | **None.** Both plan-gate questions were answered and neither is re-asked |
