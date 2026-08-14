# Centrality scorecard (Stage 05) — CR-DESIGN-SYSTEM-003

**12 / 12 PASS.** Does this change keep one thing in one place, or does it create a second copy?

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **One filtering layer, not a bespoke filter per table** (QUALITY-CENTRAL) | PASS | The new kind lives in the shared engine every busy table already uses. No screen gains filtering logic of its own |
| 2 | **The new kind reuses the existing option machinery** | PASS | `deriveSelectOptions` was **widened by parameter**, not duplicated. There is no `deriveMultiSelectOptions` to drift |
| 3 | **The unset wording exists once** | PASS | `allOptionLabel` — three call sites, one definition (R-1). Previously the literal was about to exist three times |
| 4 | **No new dropdown idiom** | PASS | Radix `DropdownMenu`, the same primitive, portal and `--z-dropdown` `RowActions` already ships. The package gains no second way of doing menus and no new dependency |
| 5 | **No hand-rolled replacement for a Radix control** | PASS | Zero hand-written roles or key handlers. Keyboard, focus and screen-reader behaviour come from the primitive, which is the reason the primitive exists |
| 6 | **The stored-shape contract lives in one place** | PASS | Two pure functions in the engine, exported through both barrels. Without them each consumer would write its own two-shape reader — three copies across three repos, guaranteed to disagree |
| 7 | **The types are nameable by consumers** | PASS | D-9. CRM's source already records the cost of their absence (`AvailabilityView.tsx:118` pins the shape with `as const` because `FilterDef` was unreachable). A consumer that cannot name a type re-declares it locally, and that is the copy this criterion is about |
| 8 | **No pure logic leaked into the component** | PASS | The component computes only presentation (the trigger's wording and the tick order). Matching, emptiness, activeness and the stored shape are all in the pure engine and unit-tested without a DOM |
| 9 | **No app knowledge leaked into the package** | PASS | The accessor returns a caller-supplied string; the package never learns what a depot, room or grade *is*. No `warehouse_id`, no tenancy identifier, no business rule (TECH-COMP-003) |
| 10 | **Cross-system seams mapped, not discovered** | PASS | Six seams (S-1…S-6) carried from the plan into `developer-handover.md` §4, including the one that can hurt a real person (CRM's saved views) |
| 11 | **No coordinated multi-app move created** | PASS | **0.** Nothing renders differently until a screen declares the new kind; no consumer must change anything at its next pin bump. Adoption is each app's own choice, in its own change |
| 12 | **Existing duplication named rather than silently inherited** | PASS | DC keeps a byte-for-byte private copy of `table-controls.ts` that nothing in DC imports. It will not gain this kind and will drift further. **Named as seam S-4 / `known-issues.md` D-1 — deleting a file in another repo is a lane violation, not a tidy** |

## The centrality question this change actually turned on

A multi-select could have been built three ways:

| Way | Copies created |
|---|---|
| A second, parallel filter engine for "advanced" filters | An entire duplicate of matching, deriving and clearing |
| A per-app control that each screen wires to `filterValues` itself | One per adopting screen, across three repos |
| **A third kind in the one engine, with the one toolbar rendering it** ✅ | **None** |

The third was chosen, and the cost of choosing it is visible in the diff: five files, no new
dependency, no new concept for a rep to learn, and one word in a filter definition to adopt it.
