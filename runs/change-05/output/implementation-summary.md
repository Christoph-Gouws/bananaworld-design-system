# Implementation summary — CR-DESIGN-SYSTEM-005

> The depot slot's label is chosen by the app wearing the header.
> Branch `change/cr-design-system-005`, off `origin/main` @ `0633476`. Built 2026-08-20.

## 0. 🔴 Plan-vs-code confirmation — done BEFORE any edit

**Everything the plan cites is still exactly as described. Nothing moved on `main`; nothing is stale.**

The plan was written against `0633476` and this worktree is a fresh copy of that same commit, so this
was targeted verification of the eleven facts the plan names, not a re-survey:

| Plan fact | Cited at | Found |
|---|---|---|
| F-1 `DOCUMENT_HEADER_SLOTS` declaration | `DocumentHeader.tsx:74` | ✅ line 74, character for character |
| F-2 `const slots = DOCUMENT_HEADER_SLOTS;` + `slots.map(` | `:259`, `:263` | ✅ lines 259 and 263 |
| F-3 the depot slot's one-line render | `:291` | ✅ line 291, exactly as quoted |
| F-4 `dateLabel?: string`, defaulted at the point of use twice | `:186`, `:272`, `:281` | ✅ all three |
| F-5 `DocumentOrigin.dcName: string \| null` on both arms | `:162–182` | ✅ lines 166–182 |
| F-6 `HeaderSlot`'s empty state (`—`, `border-dashed …`) | `:344–353` | ✅ lines 344–353 |
| F-7 the grid is `sm:grid-cols-2 lg:grid-cols-4` | `:262` | ✅ line 262 |
| F-8 barrel exports `DocumentHeaderProps` as a type | `src/components/index.ts:157–166` | ✅ lines 157–166 |
| F-9 🔴 this repo scans for `label="DC" value={props.origin.dcName}` | `tests/components/DocumentHeader.test.tsx:465` | ✅ line 465 |
| F-10 this repo pins the byte-exact declaration + `const slots = …` | same file `:469–481` | ✅ lines 469–481 |
| F-11 no `governance/` directory, no cross-system register | — | ✅ still absent |

The baseline test run before any edit was **235 passed / 13 files**, which is the number the plan
predicted from CR-004's close. Nothing to note in `known-issues.md` under "something moved".

## 1. What was built

One optional prop and one defaulted render expression. That is the entire source change.

**`src/components/DocumentHeader.tsx`** — the only source file touched.

```ts
  readonly dcLabel?: string;          // added to DocumentHeaderProps, immediately above `origin`
```
```tsx
        if (slot === "DC") {
          return <HeaderSlot key={slot} label={props.dcLabel ?? "DC"} value={props.origin.dcName} />;
        }
```

`??`, not `||` — identical to `dateLabel` two slots above it, so the two label props cannot drift
apart on an empty string. Pinned by a spec.

### Why this shape and not another

The request named the precedent and told the build to follow it unless it could say why it must
differ. It could not, so it did not: **one optional prop, a default that preserves every existing
caller, no discriminant, no ceremony** — the same shape `dateLabel` has carried since the header was
promoted. No new type was introduced, no existing type was widened, nothing was folded together.

## 2. The omission decision — stated, per the request, not left for the CRM to find out

**Layout A, as approved: the slot is ALWAYS present. Omission is NOT offered.**

An app with nothing at all for that slot passes `dcName: null` and gets the empty state the slot
already has — an em dash in a dashed, dimmed box that reads as "not filled in" rather than as a value
of "—". That behaviour already existed, is already spec'd, and needed no new prop.

**Why omission is not offered** (the reason, stated so it is a decision and not a discovery):

1. 🔴 Dropping the slot leaves three children in a `lg:grid-cols-4` strip. Document no. lands in
   column 3 of 4 on a wide screen and — because `sm:grid-cols-2` wraps — bottom-**left** on a narrow
   one. "The document number top right" is the owner instruction of 2026-08-08. Making omission honest
   therefore means changing the header's layout classes, which this change was explicitly forbidden to
   do. That is the request's own fence, not a detail to work around.
2. "Homogeneous" is defined in this file as *these four slots, in this order, on every desk form*. A
   per-app slot count makes the standard a suggestion.
3. No caller has asked. CR-CRM-015 needs a word, not a hole.

It is written in three places a CRM developer will actually reach: the `dcLabel` doc comment in the
source, `evidence/developer-handover.md` §1, and the spec **"renders FOUR slots always"**, which fails
the day somebody adds a hole. Option C (a `dcHint` mirroring `dateHint`) was **not** built — see
`simplification-opportunities.md` S-2 and `technical-debt.md` TD-2.

## 3. The cross-repo trap — held, and one thing declared

**Both strings the request named survive untouched.** `DOCUMENT_HEADER_SLOTS` is not changed by one
character — still four entries, still `"DC"` second — and `const slots = DOCUMENT_HEADER_SLOTS;` is
not replaced. The override sits beside the array as presentation: the array says WHICH slot, the prop
says what THIS APP calls it. DC's `slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS])` also survives,
because DC passes no `dcLabel` and still renders those four words in that order.

🔴 **One assertion in THIS repo was narrowed, and it is declared rather than buried.** The plan found
it at planning time (F-9) and the change request did not know about it:
`tests/components/DocumentHeader.test.tsx` scanned this file's source for the concatenated
`label="DC" value={props.origin.dcName}`. The label half of that substring necessarily moved. The
spec's subject is *"reads NO session"*, so it now scans for `value={props.origin.dcName}` — the half
that carries the session claim — **plus** `label={props.dcLabel ?? "DC"}`, which pins the new default.
**Narrowed, never relaxed:** the property is strictly better covered afterwards. It is the **only**
existing assertion this change edited. Full reasoning: `known-issues.md` A-1, `defect-log.md` NAD-1.

⚠ **Bananaworld-DC may hold the same mirror and it was NOT read.** Consumer repos are not readable
from a build worktree and none was opened. Nothing here claims DC was checked. DC is red **nowhere
today** — it pins an older sha — and if its mirror does pin the full concatenated string, DC makes the
identical one-line narrowing at its own pin bump, on a line it already has to visit. Carried into
`evidence/developer-handover.md` §2 and `runs/current/SESSION_HANDOVER.md`.

**And the guard this change owes in return was added.** `T-10` re-fences the existing byte-exact source
scan with a comment naming DC's contract test as the reason it exists, and `T-11` is new: exactly one
array literal of slot names in the file, four entries, `"DC"` second, the render still walking the
constant. "The label became overridable" can no longer quietly become "the array became editable".

## 4. Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | **clean** |
| `pnpm test` | **246 passed / 13 files** (baseline before any edit: **235 / 13**) |
| New specs | **+11** |
| Existing assertions edited | **1**, narrowed, itemised in `changed-files.md` and above |
| Additive — `git diff --numstat -- src/` | **+30 / −1**; the single deleted line itemised |
| Additive — barrels | `git diff -- src/index.ts src/components/index.ts src/lib/index.ts` → **empty** |
| Mutation check | **4 deliberate breakages, all caught** — see `test-results.md` §4 |
| Dependency audit | 6 highs, **all six on the standing owner-approved ignore list, 0 new** |
| Migration | **N/A** — this package has no database |
| Throwaway Postgres | **never started**; nothing left behind, no port held |
| Consumer pins | **none bumped**, and none may be from here |

## 5. Scope — what was deliberately not done

No change to Bananaworld-DC and none to Bananaworld-CRM. `DocumentOrigin`, its `new`/`existing`
discriminant and the reason it exists (CR-DC-039) untouched. The Document no. slot's five states and
the Date slot's states untouched. No fifth slot, no reorder, no restyle, not one class name changed.
`dateLabel` neither removed nor folded into a shape with `dcLabel` — two independent optional props.
No new dependency, no new token, no barrel edit, no `package.json` or `pnpm-lock.yaml` change, no new
file. The "Raised by" slot's label was **not** made overridable (`technical-debt.md` TD-1).

## 6. What this does and does not unblock

**It does not unblock CR-CRM-015 on its own.** CR-CRM-015 is unblocked when this merges **and** the
CRM bumps its pin in its own lane, against the **merged** `main` sha — never this branch's sha
(KI-M001E19-002). Two changes, two lanes, in that order. This change is the whole of that unblock on
**this side of the seam** and nothing more.
