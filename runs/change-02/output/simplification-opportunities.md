# Simplification opportunities (Stage 05) — CR-DESIGN-SYSTEM-002

**Verdict: PASS — not over-built.** 5 candidates examined: **0 accepted, 5 rejected with reasons.**

## The governing constraint, stated first

This change is a **byte-identical port**. Its correctness criterion is that 282 of 282 code lines
match DC's shipped source. **Every simplification available to it is therefore also a way to break
it** — a tidier port is a port that renders differently on thirteen live sites. That is not an
argument against simplifying in general; it is the reason the bar here is unusually high, and it is
why the count below is 0 accepted rather than the usual 1–2.

## Candidates

### S-1 — Collapse `HeaderSlot`, `DocumentDateSlot` and `DocumentNumberSlot` into one slot renderer
**REJECTED.** They share a wrapper `<div className="min-w-0 space-y-1.5">` and nothing else: one
renders `<dt>/<dd>`, one renders `<label>` + `Input` + a mood-dependent day line, one renders a label
row with a pill + `Input` + three different footers. A unified renderer would need a discriminant and
three branches — the same code, one indirection further from the reader. And it would change the
rendered DOM, which is the one thing forbidden.

### S-2 — Merge `slotMood` / `moodBorder` / `dateBorder` into a lookup table
**REJECTED**, and DC's own comment already argued this at the time: a `LOOKUP[mood]` is a computed
index the security rules flag, and a nested ternary is what `sonarjs/no-nested-conditional` exists to
stop. Three named functions of two lines each read better than either. Carried unchanged.

### S-3 — Reuse `formatDateZA` from `src/lib/formatters.ts` instead of shipping new `Intl` formatters
**REJECTED.** Different job. `formatDateZA` prints a date; `describeDocumentDate` compares a chosen
day to a given today and returns a mood plus two sentences, using three formatters whose exact output
("Friday 7 August", no comma) is contract from the approved mockup. Merging them would change what an
existing caller of `formatDateZA` renders — precisely what additive-only forbids. Explicitly recorded
in the `src/lib/index.ts` comment so the next reader does not try it.

### S-4 — Drop the `DocumentOrigin` discriminant, since both arms carry the same two fields
**REJECTED**, and this is the one the source fences hardest against. The discriminant is not for the
render — the render is identical, deliberately. It exists so the **call site** states which moment it
is in, which is the only thing a check can read. Without it, a form that wrongly wires the session in
would be byte-indistinguishable from one that is correct. Removing it would also be a breaking type
change for DC's twelve forms.

### S-5 — Widen the `engines` vitest glob instead of naming the date test `.tsx`
**REJECTED**, narrowly, and the trade is worth recording because it is genuinely two-sided.
Widening the glob would keep the pure describer's test in a plain-node environment, which is what
`vitest.config.ts`'s own comment says the split is for ("stops a DOM global from ever masking a leak
into supposedly-pure logic"). Against that: it edits the config file, which is the one file five
pinned consumers would have to reason about, and the plan states the preference explicitly (§7.3,
"Prefer no edit").

**Followed the plan.** The purity risk it guards against is covered here by a stronger instrument
anyway — test 23 scans the source directly rather than relying on an environment to expose a leak.
Recorded as a watch item in `known-issues.md` D-1, not as debt.

## Simplifications already built in

| | |
|---|---|
| Only the **pure half** of DC's 420-line date file crossed | 54 lines instead of 420. The SQL, column map, row readers and validator stayed with the business rules they encode |
| **No configurability added** | No `warnDays` prop, no flag prop, no CRM variant. Three declined temptations, listed in `revision-review.md` §3 |
| **No new dependency, no config edit** | `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `tsconfig.json`, `.github/` all untouched |
| The barrel edits **append** | No existing export line reordered or rewritten, so the diff is readable and the additive claim is trivially checkable |
| `Input` **reused**, not re-implemented | The ported component uses the package's own primitive exactly as DC's did |

## Over-build check

**Not over-built.** Two new files, three appended barrels, 36 tests. Nothing was added that the plan
did not require, and the one addition beyond the plan's file table (`src/index.ts`) exists because
without it the feature does not reach a consumer at all — that is a defect fix, not scope growth.
