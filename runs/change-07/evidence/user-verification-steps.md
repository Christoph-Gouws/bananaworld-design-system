# User verification steps — CR-DESIGN-SYSTEM-007

> Written for a non-technical reader. What you can check, and — just as importantly — what you should
> **not** expect to see.

## 1. The short version

**Nothing on any screen, in any app, changes today. That is the correct and intended outcome.**

This piece of work is a **shared parts box** that four apps borrow from. Each app chooses when to
pick up a newer version of the box. Right now **not one app has picked up a version new enough to
contain the setting this fix applies to** — so there is nothing on screen for this to change yet.

What was fixed is the *rule* the parts box follows, before anyone starts relying on it.

## 2. What was wrong, in plain terms

Last week's change let a whole line of fields be told **"line up along the top"**, with the option for
one box in that line to say **"not me"**.

A reviewer found the second half only half worked. If a box had been told where to sit **the older
way** — the only way that existed before last week — the line's instruction quietly won and the box's
own instruction was thrown away. Nobody was warned. The box just sat where its author did not ask.

**Now the more specific instruction wins**, which is what was agreed when the option was approved and
what anyone building a screen expects.

## 3. What you can check yourself

| # | Check | Where | Expected |
|---|---|---|---|
| 1 | **Nothing moved** in the Bananaworld DC app — any list or table you like | DC, any screen | **Everything looks exactly as it did.** DC is three versions behind and cannot even see this setting |
| 2 | The pull request touches **two files only** | the PR's "Files changed" tab | `src/components/Table.tsx` and `tests/components/Table.test.tsx`. Nothing else |
| 3 | The automated checks are green | the PR's checks | tests, typecheck, security scans |
| 4 | No app was made to upgrade | the PR | **No app's version pin was moved.** Each app upgrades in its own piece of work, when it chooses |

**You do not need to test anything in a running app**, because no running app is affected. If you
want a single sentence to hold onto: *this fixes the rule before anyone depends on it, which is the
cheapest possible moment to fix it.*

## 4. The rule, now that it is settled

When several instructions about **up-and-down position** disagree, the most specific one wins:

1. **The box's own setting** — strongest
2. **The box's own styling** — the older way of saying the same thing *(this is the rung that was
   broken, and is now fixed)*
3. **The line's setting** — a default for boxes that say nothing themselves
4. **"Middle"** — what everything does if nobody says anything

Rung 3 used to beat rung 2. It no longer does.

## 5. What happens next, and who does it

This change **fixes no screen**. The sagging row in the CRM's sales-order screen is fixed only after
three steps, **in this order**:

1. **This merges** into the shared parts box. *(the conductor does this, on green checks)*
2. **The CRM picks up the merged version** — in its own separate piece of work.
3. **The CRM tells its sales-order line to line up along the top.** *(also its own piece of work)*

🔴 Step 2 must point at the **merged** version, not this in-progress branch. Pointing at a branch is a
mistake this estate has made before and has on record.

## 6. What was deliberately not done

| Not done | Why |
|---|---|
| No app was upgraded to the new version | Each app owns that decision and does it in its own piece of work |
| No screen in any app was changed | This change makes the *rule* right; adopting it is a separate job |
| Nothing was removed or renamed | Four apps depend on this box; taking something away would break them |
| No new setting was added | This is a correction to how existing settings interact — not a new feature |
| The other, smaller review comments were left alone | They were judged below the bar for follow-up and are recorded against last week's change |

## 7. Honest limits — what could not be checked from here

- **Four of the five apps could not be opened at all** from this working area (CRM, RMS, org-admin,
  Manga Verde). Their safety rests on the fact that **all four are behind** the version that
  introduced this setting, so none of them can be affected. That is stated as a limit, **not** as a
  clean bill of health.
- **No app's own tests were run**, and nothing in this pack claims they were.
- The Bananaworld DC app **was** readable and was checked — read-only, never modified — and is
  provably unaffected.
