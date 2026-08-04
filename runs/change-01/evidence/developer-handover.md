# Developer handover — CR-DESIGN-SYSTEM-001

> For whoever picks up the follow-up work. Read `known-issues.md` §D alongside this.

## State at handover

| Item | Value |
|---|---|
| Change | **CR-DESIGN-SYSTEM-001** — colour swatch + accessible name on a ChoiceGroup chip, additively |
| Branch | `change/cr-design-system-001`, off `origin/main` @ `b1373c7` |
| Status | Built, tested green, closed out, PR opened. **Merge is the conductor's job, not this session's.** |
| Tests | 79 passed / 7 files (baseline 61 / 6) · typecheck clean |
| Open defects | 0 |
| Files changed | 2 — `src/components/ChoiceGroup.tsx` (+57/−0), `tests/components/ChoiceGroup.test.tsx` (+356, new) |
| Context-usage row | Logged ✅ — appended to `organization/CONTEXT_USAGE_LOG.md` with `--project bananaworld-design-system` |

## The API this change froze — read before writing the follow-up

Two optional fields on `ChoiceOption`. **The names and types are deliberately frozen** so the
prepared DC follow-up compiles against the merged package without edit:

```ts
readonly swatch?: { readonly hex: string; readonly accentHex?: string | null };
readonly description?: string;
```

- `accentHex` is `string | null | undefined` **on purpose** — it matches `ColourSwatchProps` exactly
  and matches DC's `ColourStageOption.accent_hex?: string | null`. A narrower `string | undefined`
  would force every caller to strip nulls, which is how an "additive" change quietly becomes a
  migration. Do not tighten it.
- `null` and `""` both mean "no accent" and fall back to the solid fill. All three shapes are tested.

### Two contracts on `description` that will bite if ignored

1. **`aria-label` REPLACES the accessible name, it does not extend it.** A chip reading "CS3" with
   `description: "Green with trace of yellow"` is announced as *only* the long name — the code the
   operator can see is never spoken. So **`description` must be a superset of the visible text.**
   DC's `formatColourStageLabel` already produces `"CS3 · Green with trace of yellow"`, which
   satisfies it. This is stated in the component's own doc comment; keep it that way.
2. **`title` gives no tooltip on a touchscreen** — it only fires on hover. On tablet the long name
   rides on the accessible name alone. Do **not** "fix" this by wrapping chips in the package's
   Radix `Tooltip`: that adds a wrapper element and a `TooltipProvider` requirement to *every
   existing caller's* DOM, which breaks the byte-identical rule outright. It was rejected for that
   reason, not on taste.

## The next change — DC's colour-stage chips

The follow-up is **in Bananaworld-DC, not here.** It has two parts and they are separate:

### 1. Bump DC's pin

**Against the MERGED sha on `main`, never this branch sha.** KI-M001E19-002 is exactly that mistake
on record. Wait for the conductor to merge, take the sha from `main`, then bump.

Two things run at that moment and both are real gates on this change:

- **DC's `tsc`.** DC passes `readonly PickerOption[]` where `readonly ChoiceOption[]` is expected.
  Adding optional properties to the target of a structural assignment is safe *unless* the source
  already has a colliding name. The plan grepped DC's `PickerOption`
  (`src/lib/receipt/types.ts:369-410`) and found neither `swatch` nor `description`. This session
  was sandboxed and could not repeat that grep — so DC's own `tsc` is where it is finally settled.
  Risk assessed **LOW**. See `qa-report.md` §3.
- **DC's `tests/unit/components/ChoiceGroup.test.tsx`.** It queries chips by accessible name
  (`getByRole("radio", { name: "Large" })`) and asserts the empty state, disabled behaviour, single
  tab stop and arrow-key movement. Those queries only keep passing if no `aria-label` appears where
  none appeared before — so it is a genuine regression gate on this change. It could not be run from
  here. **Run it at bump time and treat a failure as this change's problem, not DC's.**

### 2. Build the chips

`ColourStageChips.proposed.tsx.txt` was prepared during CR-DC-022 and maps
`swatch: { hex: stage.colour_hex, accentHex: stage.accent_hex }` and
`description: formatColourStageLabel(stage)`. Those are the field names frozen above, so it should
compile unedited — but verify it against the merged source rather than pasting it unread, which is
exactly the instruction this change was given about its own reference proposal, and which turned up
three real findings (`defect-log.md` D-3, and `implementation-summary.md`).

The five existing DC call sites are untouched and need no edit:
`ReceivingFlow.tsx:2043` (Size), `:2054` (Class), `:2071` (Container via `packingOptions`), and the
`ChipField` wrappers at `:2364` and `:2441`.

## Design decisions worth not re-litigating

| Decision | Why |
|---|---|
| Stripe sizing lives in `ChoiceGroup`, not `ColourSwatch` | Only `ChoiceGroup` knows the 32px browser / 48px tablet chip it must fit. Moving it into `ColourSwatch` silently resizes every other `ColourSwatch` caller in every consumer. Pinned by test 12. |
| `ColourSwatch` reused, not re-implemented | It already handles solid + blended and is already `aria-hidden`. Test 7 asserts the gradient comes from that shared path. |
| `overflow-hidden` on swatch chips only | The chip is `rounded-md`; without clipping a square stripe renders over the rounded corner. Applied conditionally so no-swatch chips keep a byte-identical class list. |
| `pl-0` alongside `px-3` | `twMerge` keeps both, and Tailwind emits `.pl-*` after `.px-*`, so `pl-0` wins on the left only and the right padding survives. Verified against `tailwind-merge@3.6.0` and pinned by test 11 — if this ever collapses, swatch chips silently lose their right padding. |
| Layout B, not the reference proposal's square | The owner chose it at the plan gate. The proposal predates that decision. |

## Cross-system seams

| # | Seam | Status after this change |
|---|---|---|
| 1 | design-system → **Bananaworld-DC** | DC is on the identical sha today, so on merge it is one pin-bump behind. DC bumps in its own change. |
| 2 | design-system → CRM (`4bc1f220`) / RMS (`ecba2218`) / org-admin (`ecba2218`) / **Mangaverde** (`e3a88e35`) | All on older shas, all unaffected, each bumps when it chooses. Mangaverde is a **fifth** pinning consumer — the change request named four. Recorded so the count is honest. |
| 3 | design-system → DC's colour-stage-chip follow-up | The forward seam this change *creates*. Field names and nullability frozen for it. |
| 4 | Colour data ownership | Unchanged. `colour_hex`/`accent_hex` stay DC master data (`banana_colour_stage`); this package owns no colour constant (TECH-COMP-003). |
| 5 | Shared-record write seam | **None.** No database, no migration, no permission surface. |

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist in this repo (no `governance/` directory),
so these seams are recorded here, in `centrality-scorecard.md` and in the plan — nowhere else.
Creating that register is a governance decision, flagged not invented (`known-issues.md` C-4).

## Repo-level things you will trip over (all pre-existing, none caused here)

- **`pnpm format:check` fails on 44 files repo-wide.** `ChoiceGroup.tsx` already failed at `HEAD`
  before this change — verified by stashing and re-running. CI runs no format job, and `ci.yml`
  itself carries a comment acknowledging the drift. Adopting prettier repo-wide is its own change.
- **There is no `lint` script and no eslint config** in this package. `typecheck` + `test` are the
  gates it actually has, and both are what CI runs.
- **`ci.yml`'s test job is still labelled "pricing & sales-order engines"** though it runs the
  component tests too. Cosmetic, another lane's file.

## What this session did NOT do

No consumer pin bumped · no colour-stage chip component · no other component touched · no new
dependency · no config change · no migration (no database exists here) · no merge, no CI wait —
both belong to the conductor.
