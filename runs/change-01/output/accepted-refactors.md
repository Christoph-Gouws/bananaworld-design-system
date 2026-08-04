# Accepted refactors — CR-DESIGN-SYSTEM-001

> Refactors identified at Stage 05 and actually applied. One accepted, three rejected
> (rejections and their reasons are in `simplification-opportunities.md`).

## R-1 — Drop the redundant `cn()` around the swatch's class string

**File:** `src/components/ChoiceGroup.tsx`
**Source:** `simplification-opportunities.md` S-1
**Applied:** yes

### Before

```tsx
<ColourSwatch
  hex={option.swatch.hex}
  accentHex={option.swatch.accentHex}
  className={cn(
    "mr-2.5 h-auto w-[7px] self-stretch rounded-none border-0",
    "[[data-surface=tablet]_&]:mr-3.5 [[data-surface=tablet]_&]:w-2.5",
  )}
/>
```

### After

```tsx
<ColourSwatch
  hex={option.swatch.hex}
  accentHex={option.swatch.accentHex}
  className="mr-2.5 h-auto w-[7px] self-stretch rounded-none border-0 [[data-surface=tablet]_&]:mr-3.5 [[data-surface=tablet]_&]:w-2.5"
/>
```

### Why

`cn()` at this call site concatenated two adjacent string literals and did nothing else. The merge
that actually matters — `h-auto` displacing `ColourSwatch`'s own `h-7`, `w-[7px]` displacing `w-7`,
`rounded-none` displacing `rounded-sm`, `border-0` displacing `border` — happens inside
`ColourSwatch`, which already calls `cn("inline-block h-7 w-7 shrink-0 rounded-sm border
border-border", className)` on whatever it is handed.

So the wrapper made the call site *look* like it was doing merge work it was not doing. That is a
readability cost with no benefit: the next reader has to check whether the outer `cn()` is
load-bearing before they can change the class list. A plain string is what the empty-state `<span>`
in this same file already uses.

### Risk and verification

Behaviourally identical — the same string arrives at `ColourSwatch` either way. Verified rather
than assumed:

- `pnpm typecheck` — clean
- `pnpm test` — 79 passed / 7 files, unchanged from before the refactor
- Test 11 asserts the merged result directly (`self-stretch`, `h-auto`, `rounded-none`, `border-0`
  present; `h-7`, `w-7`, `rounded-sm` absent), so the refactor is covered by an assertion on the
  actual rendered class attribute, not just by the suite passing.

## Refactors NOT taken

| # | Candidate | Why rejected |
|---|---|---|
| S-2 | Hoist class lists to module constants | Harder to read, breaks the grouping comments, breaks the convention in every other primitive here |
| S-3 | Collapse the three `accentHex` fallback cases to one | Loses real coverage — `null`, `""` and `undefined` reach the fallback by three different conditions |
| S-4 | Drop `overflow-hidden` | Would ship a different design from the one the owner approved — the stripe would render over the chip's rounded corner |

Full reasoning in `simplification-opportunities.md`.
