# Implementation summary — CR-DESIGN-SYSTEM-001

> A ChoiceGroup chip may now carry a colour swatch and its own accessible name — additively.
> Branch `change/cr-design-system-001`, off `origin/main` @ `b1373c7`.

## Plan-vs-code check (required first line)

**Everything the approved plan cites is still exactly as described — verified file by file, not
assumed.** The plan's facts were re-read against the real current source at the start of this
session:

| Plan's citation | Verified |
|---|---|
| `ChoiceOption` is exactly `{ id, name, disabled? }` — `ChoiceGroup.tsx:26-30` | ✅ exact, at those lines |
| The chip renders `{option.name}` as its only child — `:77` | ✅ exact, at that line |
| Built on Radix `RadioGroup.Root`/`.Item` — `:4,44,55` | ✅ exact, at those lines |
| `ColourSwatch` exists, handles single + blended, is `aria-hidden`, takes `className` — `ColourSwatch.tsx:19-31` | ✅ exact, at those lines |
| Both already exported from the barrel — `index.ts:32,70` | ✅ `ChoiceGroup`, `ChoiceOption`, `ChoiceGroupProps` and `ColourSwatch` all exported |
| A components test project exists (happy-dom) — `vitest.config.ts:21-28` | ✅ exact |
| CI runs `pnpm test`, covering that project — `ci.yml:41-53` | ✅ exact (label drift noted by the plan is still there) |
| HEAD is `b1373c7`, the sha DC pins | ✅ `git log` confirms |

Nothing moved. No premise is stale. Built as approved.

## What was built

Two optional fields on `ChoiceOption`, and their rendering:

```ts
readonly swatch?: { readonly hex: string; readonly accentHex?: string | null };
readonly description?: string;
```

- **`swatch`** → renders the existing `ColourSwatch` inside the chip, before the name. `ColourSwatch`
  already handles the solid and the blended two-colour case and is already `aria-hidden`; it is
  reused unchanged, with the chip-relative sizing applied from `ChoiceGroup` via `className`.
- **`description`** → becomes the chip's `title` **and** its `aria-label`, so the full stage name is
  the accessible name while the visible text stays the short code.

**Layout: owner-approved option B** — the colour runs the full height of the chip, flush against its
left edge (7px wide with a 10px gap on browser; 10px with a 14px gap on tablet), with the chip
clipping it to its own radius. This is *not* the reference proposal's 16px square: the proposal
predates the owner's choice, and picking the treatment was the one decision the plan gate asked for.
Everything else the proposal agreed — both field names, their types, their placement, the Radix
foundation — is kept exactly.

## Why it is additive, proven rather than asserted

- `git diff --stat` on the source file: **57 insertions, 0 deletions.** Not one line removed.
- No default changed; `emptyLabel` is the only default and it is untouched.
- No export surface moved; `src/components/index.ts` needed no edit at all.
- Both fields are `undefined` for every existing caller, and React omits an `undefined` attribute
  entirely — so no `title=""` and no `aria-label=""` appear where nothing appeared before.
- **Test 5 pins it**: for a chip passing neither field, `title` and `aria-label` are asserted
  *absent*, there is no `[aria-hidden]` descendant, the text is the chip's only child node, and the
  complete `class` attribute equals the exact string that shipped at `b1373c78` — written as a
  literal, not a snapshot, so it cannot be silently re-recorded.
- **Test 17 pins the type risk**: a consumer-shaped option type with unrelated extra fields still
  assigns and renders. Adding optional properties to the target of a structural assignment cannot
  break a source that lacks them; the only failure mode is a name collision, which the plan checked
  in DC directly and which is now compiled into this package's own CI.

Existing callers checked, and the limit on that check, are in `qa-report.md` §3.

## Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`) |
| `pnpm test` | **79 passed / 7 files** — up from a 61/6 baseline captured before any edit |
| New tests | 18, all in `tests/components/ChoiceGroup.test.tsx` |
| Failures / skips | 0 / 0 |
| Existing tests modified or deleted | none |
| Throwaway Postgres | never started — this package has no database. `docker ps -a --filter name=chg-cr-design-system-001-pg` returns empty |

## Three findings recorded during the build

1. **The reference proposal's size comment contradicted its own code** (claimed 28px fills a 32px
   chip while setting 16px). Not carried over; the shipped comment states the real mechanism.
2. **`aria-label` replaces the accessible name rather than extending it.** Correct for the DC use
   case, but it is a contract the primitive must state — so the doc comment now says `description`
   must be a **superset** of the visible text. Without that, the next caller silently drops the
   visible label from the announcement.
3. **`title` gives no tooltip on a touchscreen**, and the tablet is the whole reason this exists.
   Kept anyway (agreed contract, costs nothing, serves the browser surface), with the doc comment
   stating that on tablet the long name rides on the *accessible* name alone. The alternative —
   wrapping each chip in Radix `Tooltip` — would add a wrapper element and a `TooltipProvider`
   requirement to every existing caller's DOM, breaking the byte-identical rule outright.

All three were raised in the approved plan §2.3 and are honoured here.

## Explicitly not done

- **No consumer pin bumped** — not DC, CRM, RMS, org-admin or Mangaverde. Each moves its own pin in
  its own change, against the **merged** sha on `main`, never this branch sha (KI-M001E19-002).
- **No colour-stage chip component** — that belongs in DC and is the follow-up change.
- **No other component touched**, no new dependency, no config change.
- **No migration** — this package has no database.
