# Stage 05 revision review — CR-DESIGN-SYSTEM-001

> Scope: only the files in `changed-files.md` — `src/components/ChoiceGroup.tsx` and
> `tests/components/ChoiceGroup.test.tsx`.

## Verdict: PASS, with one simplification applied (see `accepted-refactors.md`)

## 1. Does the code do what the approved plan says?

| Plan clause | Built? | Note |
|---|---|---|
| §2.1 two optional fields, names frozen as `swatch` / `description` | yes | Names kept exactly so DC's prepared follow-up compiles unedited |
| §2.1 `accentHex: string \| null \| undefined`, matching `ColourSwatchProps` and DC's `accent_hex` | yes | A narrower `string \| undefined` would force every caller to strip nulls — that is how an "additive" change turns into a migration |
| §2.2 render `ColourSwatch` before `option.name`, nothing else moves | yes | |
| §2.2 `title` + `aria-label` from `description`, both `undefined` otherwise | yes | Pinned by test 5 |
| §2.2 sizing lives in `ChoiceGroup`, `ColourSwatch` untouched | yes | Pinned by test 12 |
| §2.3(1) rewrite the proposal's wrong size comment | yes | See `defect-log.md` D-3 |
| §2.3(2) document the `description`-must-be-a-superset contract | yes | In the `ChoiceOption` doc comment |
| §2.3(3) document the touch-tooltip limit and why Radix `Tooltip` was rejected | yes | Same doc comment |
| §5 test plan, 10 numbered items | yes — all 10, delivered as 18 tests | Items 5–7 expanded to five tests (the three `accentHex` shapes are separate cases); two tests added beyond the plan (the `px-3` survival assertion inside item 11, and the consumer-type assignability test) |
| §6 exactly two files change | yes | `git diff --stat`: 1 source file modified, 1 test file added |
| Owner's layout choice: **B** (full-height stripe) | yes | Not the reference proposal's square — the proposal predates the owner's decision |

**Deviation from the reference proposal, deliberate and approved:** the proposal rendered a 16px
square (`mr-2 h-4 w-4`). The owner picked **layout B** at the plan gate, so the shipped code renders
a full-height 7px stripe flush to the left edge. The two field names, their types, their placement
and the Radix foundation are all exactly as the proposal agreed — only the visual treatment differs,
which is precisely the decision the owner was asked to make.

## 2. Readability

- The component reads top-to-bottom as it did before: doc comment → `ChoiceOption` →
  `ChoiceGroupProps` → the component. No structural reshuffling.
- Both new fields carry doc comments that explain **why the field exists and what contract it
  carries**, not what it is. The `description` comment is the longest thing added and earns it: both
  contracts it records (aria-label replaces rather than extends; `title` is hover-only) are
  non-obvious and would otherwise be rediscovered by the next caller the hard way.
- Comment density matches the surrounding file, which is already heavily commented in this style.
- No abbreviations, no cleverness, no new indirection.

## 3. Altitude

Right level throughout:

- `ChoiceGroup` owns the **chip-relative** sizing (7px/10px stripe, the gap, dropping the left
  padding) because only it knows the 32px/48px chip. Correct altitude — pushing this into
  `ColourSwatch` would resize every unrelated `ColourSwatch` caller in every consumer.
- `ColourSwatch` keeps owning **how a colour is painted** (solid vs blend, `aria-hidden`). Correct —
  and reused, not re-implemented, which test 7 pins by asserting the gradient string comes out.
- No business meaning entered the package: no colour stage, code or hex, including in the tests
  where the hexes are invented literals (TECH-COMP-003).

## 4. Correctness re-check on the merged class list

The one genuinely subtle line is `option.swatch !== undefined && "overflow-hidden pl-0 …"`. Two
properties had to hold and both were verified against the installed `tailwind-merge@3.6.0` rather
than assumed:

- `px-3` **survives** alongside `pl-0`, so the chip keeps its right padding; Tailwind emits `.pl-*`
  after `.px-*`, so `pl-0` wins on the left only. Now asserted by test 11 (`defect-log.md` D-4).
- `h-7 w-7 rounded-sm border` on `ColourSwatch` are each **displaced** by `h-auto w-[7px]
  rounded-none border-0`. Test 11 asserts the old ones are gone, not merely that the new ones exist.

## 5. Test quality

- Assertions are **absence-based** where absence is the requirement (`hasAttribute(...) === false`),
  not `toBe("")` — an empty attribute is a real DOM change that a looser assertion would wave through.
- The class-list check is a **literal**, not a snapshot, so it cannot be silently re-recorded when it
  drifts. That is the whole point of it.
- No vacuous assertions: every `not.toContain` is paired with a positive `toContain` on the same
  string, so an empty value cannot pass by accident.
- The `{ArrowRight>}` held-key form carries its reasoning in a comment, credited to DC's suite where
  it was first worked out — the next person will not "fix" it back to a normal keypress.
- Test 17 turns a prose risk assessment into a compiled constraint. That is the single most valuable
  test in the file, because it is the one that keeps holding after everyone has forgotten why.

## 6. Anything that should have been done differently?

One, and it was applied: `cn()` wrapped around two adjacent string literals in the `ColourSwatch`
`className` was pure ceremony — `ColourSwatch` already runs `cn()` on whatever it is handed. Removed.
See `accepted-refactors.md`. Nothing else in the diff is doing work that something else already does.
