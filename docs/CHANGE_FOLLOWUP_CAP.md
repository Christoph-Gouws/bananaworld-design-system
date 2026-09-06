# Review follow-up depth cap

🔴 **DESIGNATED HOME → this file.** This is the only place in this repository where the cap is stated.
`README.md`, the decision log and the guard test carry pointers here and restate no part of the rule.

---

## The rule

**A change request may be a review follow-up of another change. That follow-up may not itself have a
follow-up.** Two generations, and no more, on any lineage: a root change, and at most one change built
to fix findings raised against it.

Mechanically: for every change, `parent.parent` must be `null`.

Enforced by `tests/governance/change-followup-depth.test.ts` against the lineage recorded in
`docs/change-lineage.json`. It is a CI-blocking test, not a convention. It takes effect for every
change numbered after **CR-DESIGN-SYSTEM-008**.

## What replaces a third-generation change

An independent review of a second-generation follow-up may still raise findings. Those findings are
**recorded, not built**: written into the follow-up's own `known-issues.md`, and routed to the Human
Project Owner. If the owner scopes the work, it enters as a **root change with its own plan**, scoped
as a change in its own right rather than as a correction to a correction.

🔴 **A finding is not a mandate to build.**

## Recording lineage

Every change writes its entry in `docs/change-lineage.json` as part of its archive:

```json
"CR-DESIGN-SYSTEM-009": { "parent": null, "archive": "runs/change-09" }
```

`parent` names a change id when this change exists to fix a finding raised against that change, and is
`null` for a change the owner scoped in its own right. The guard cross-checks that against the
archive's own header prose: an archive saying "review follow-up on CR-DESIGN-SYSTEM-0NN" whose entry
claims to be a root is a RED. Declaring a follow-up to be a root is the one way around this cap.

## Exceptions

There is no exception list, deliberately. An exception requires editing the guard test itself, which is
an owner-approved code change visible in a diff.

## Why this exists here, where nothing is broken

This repository's deepest lineage is two generations — CR-DESIGN-SYSTEM-006 → 007 — and it is within
the cap today. The rule is here because Bananaworld-CRM's change lane ran one lineage to **thirteen**
generations before anything refused it, with every generation after the fourth correcting the prose the
previous correction wrote. The controls that failed there were conventions written into archives. This
one can go red.

## Estate scope

The same cap belongs in every repository that runs a change lane. Its estate-wide home is the change
runner's own governance file (`_config/governance/AI_TEAM_MASTER_GOVERNANCE.md`), which is outside this
repository. The clause to carry there is the two sentences under **The rule**, plus the routing under
**What replaces a third-generation change**.
