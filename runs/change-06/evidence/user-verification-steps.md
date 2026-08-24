# User verification steps — CR-DESIGN-SYSTEM-006

> How to satisfy yourself this change did what it says. Written for a reader who is not going to open
> a code editor.

## The short version

**Nothing you can see has changed yet — and that is the whole point of this change.**

This change adds a *setting* to the shared kit that all our systems build their lists from. The
setting is switched **off** everywhere. The order screen you were complaining about will only line up
once the customer system takes this update and switches the setting on, which is its own separate
piece of work.

So there is no screen to go and look at today. What you can check is that **nothing moved that you
did not ask to move**.

## 1. What was asked for, and whether it exists

| You asked | Answer |
|---|---|
| A way to line a row of fields up along the top | ✅ Built. A row can be asked once, and one box in that row can still opt out |
| The setting must be **off by default** everywhere else | ✅ Unchanged. Every list in every system behaves exactly as it does today |
| Prove nothing else moved — don't just claim it | ✅ See §2. It was measured, not asserted |
| Don't change the customer system's order screen yet | ✅ Not touched. No file in any other system was opened for writing |

## 2. 🔴 The proof that nothing else moved

This is the part worth two minutes of your time, because it is the risk you named.

**What was done:** every way a list box can be written today — **384 different combinations** of the
existing settings — was rendered twice. Once using the *old* shared kit exactly as it is on the main
line of work, and once using the *new* one. The full output of both was compared character by
character.

**The result: identical. Not one character different.**

That is stronger than an opinion and stronger than a test that only checks the new feature. It is a
direct before-and-after comparison of every existing way the kit is used.

**On top of that**, four checks that describe today's appearance exactly were written **before** the
change was made, run to confirm they passed against the untouched kit, and saved into the record in
that state (commit `f59f2c7`). They still pass now. So the promise "today's screens are untouched"
was written down before there was anything to hide.

**And**, the change was deliberately broken five times in five different ways to confirm the checks
would actually notice. Four of the five were caught immediately. The fifth turned out not to change
anything a person could see — that was proven by comparing 320 more combinations, and it is
**reported as a miss rather than counted as a catch**.

## 3. What you can check yourself, if you want to

| # | Check | Where |
|---|---|---|
| 1 | The default really is still "middle" | `runs/change-06/output/test-results.md` §2, spec **T-1** — it pins the exact appearance of a plain box |
| 2 | The 384-combination before-and-after comparison | `runs/change-06/output/test-results.md` §3 |
| 3 | Which existing screens were checked, and which honestly could not be | `runs/change-06/output/qa-report.md` §3 |
| 4 | Everything that changed, file by file | `runs/change-06/output/changed-files.md` — **two files** |
| 5 | Anything left unfinished on purpose | `runs/change-06/technical-debt.md` — 5 items, each with an owner |

## 4. What has NOT been checked, stated plainly

We should be straight about the limits, because they are real:

- **No other system was run.** The customer system, the depot system, the admin system and Manga Verde
  cannot be started from where this work happens. Their safety rests on the before-and-after
  comparison above, which is strong, plus reading the depot system's code directly.
- **The depot system was read but not run.** We could read its files (never change them), and it does
  not use the setting anywhere — zero mentions across the whole system.
- **Nobody has looked at this in a browser**, because this shared kit has no screens of its own. The
  first real look happens when the customer system switches its order screen over.
- **One honest wrinkle**, written down rather than buried: the word chosen for the new setting is one
  that web browsers happened to recognise years ago and now ignore. If any of the four systems we
  cannot read happens to still be passing that old word somewhere, that spot would start lining up to
  the top when it takes this update. The depot system was checked and is clean. Each of the others
  does a **one-line search** before taking the update — that is written into the handover. If one is
  ever found, there is a ready alternative name that carries no risk at all.

## 5. What happens next

1. This change merges into the main line of the shared kit.
2. **Then**, as a separate piece of work, the customer system takes the update and switches its order
   screen to line up along the top. **Only at that point does the sagging row you reported get
   fixed on screen.**
3. The other systems take the update whenever they choose. Nothing forces them, and nothing about
   their lists changes when they do.

**Two steps, in that order.** This change is step one, and step one alone.
