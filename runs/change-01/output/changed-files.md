# Changed files — CR-DESIGN-SYSTEM-001

> Change: a ChoiceGroup chip may carry a colour swatch and its own accessible name, additively.
> Branch: `change/cr-design-system-001` · off `origin/main` @ `b1373c7`
> This is the complete list. Stage 05 reviews only what is listed here.

| # | File | Status | Lines | What changed |
|---|---|---|---|---|
| 1 | `src/components/ChoiceGroup.tsx` | modified | +57 / −0 | Two optional `ChoiceOption` fields (`swatch`, `description`) plus their rendering, and the doc comment covering the two contracts they carry. Nothing removed, no default changed, no export moved. |
| 2 | `tests/components/ChoiceGroup.test.tsx` | added | +356 / −0 | New suite, 18 tests. Four of them are the additive proof (see `test-results.md`). |

## Deliberately NOT changed

Each of these was considered and left alone; an unrecorded omission is a skip.

| File | Why untouched |
|---|---|
| `src/components/ColourSwatch.tsx` | Reused as-is. It already handles the solid and blended-two-colour cases and is already `aria-hidden`. The stripe sizing lives in `ChoiceGroup`, because only `ChoiceGroup` knows the 32px/48px chip it must fit — putting it in `ColourSwatch` would silently resize every other caller of `ColourSwatch` in every consumer. Pinned by a test. |
| `src/components/index.ts` | Already exports `ChoiceGroup`, `ChoiceOption`, `ChoiceGroupProps` and `ColourSwatch`. Nothing new to export — the change adds fields to an existing exported interface, not a new symbol. |
| `vitest.config.ts` | `tests/components/**/*.test.tsx` is already globbed by the `components` project; the new suite is picked up with no config change. |
| `.github/workflows/ci.yml` | `pnpm test` already runs the components project. (Its job label still reads "pricing & sales-order engines" — pre-existing drift, out of lane, see `known-issues.md`.) |
| `package.json` | No new dependency. `@radix-ui/react-radio-group` and the `ColourSwatch` import are both already present. |
| Every other component | Out of lane. |
| Every consumer repo (DC, CRM, RMS, org-admin, Mangaverde) | Explicitly out of scope. No consumer pin is bumped by this change; each consumer moves its own pin, in its own change, against the MERGED sha on `main`. |

## Not applicable to this change

- **Migrations:** none. This package has no database, no persistence and no network by construction.
- **Permissions / scoping / i18n:** none. TECH-COMP-003 — no permission or tenancy logic may live in this package.
