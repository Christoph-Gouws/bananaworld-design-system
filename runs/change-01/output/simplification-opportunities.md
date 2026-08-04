# Stage 05 simplification opportunities — CR-DESIGN-SYSTEM-001

> Reviewed: `src/components/ChoiceGroup.tsx`, `tests/components/ChoiceGroup.test.tsx`.
> The gate asks whether the change is the SIMPLEST thing that meets the approved plan.

## Found: 4 candidates · Accepted: 1 · Rejected: 3

---

### S-1 — `cn()` wrapping two string literals — **ACCEPTED, applied**

```tsx
// before
className={cn(
  "mr-2.5 h-auto w-[7px] self-stretch rounded-none border-0",
  "[[data-surface=tablet]_&]:mr-3.5 [[data-surface=tablet]_&]:w-2.5",
)}
// after
className="mr-2.5 h-auto w-[7px] self-stretch rounded-none border-0 [[data-surface=tablet]_&]:mr-3.5 [[data-surface=tablet]_&]:w-2.5"
```

`cn()` here joined two adjacent literals and did nothing else — `ColourSwatch` already runs `cn()`
on whatever `className` it receives, which is what actually performs the `h-7`→`h-auto` merge. The
wrapper was ceremony that made the call site look like it was doing merge work it was not doing.
Removed; matches how the empty-state `<span>` in this same file passes a plain string. Tests and
typecheck re-run green after the change (79 passed). See `accepted-refactors.md`.

---

### S-2 — Hoist the chip and swatch class lists to module constants — **REJECTED**

Both class lists are long, and pulling them out would shorten the JSX. Rejected because it makes
the component *harder* to read, not easier: the class list is the component's visual definition and
belongs where the element is, which is the convention in every other primitive in this package. It
would also break the grouping comments (`// browser sizing`, `// tablet sizing`, `// unselected`)
that make the existing list scannable. Shorter is not simpler here.

---

### S-3 — Collapse the three `accentHex` fallback tests into one — **REJECTED**

Tests 8, 9 and 10 (`null`, `""`, `undefined`) share a body and are already expressed as a single
`it.each`. Collapsing them further to one case would lose real coverage: `ColourSwatch` guards with
`accentHex != null && accentHex !== ""`, so `null` and `""` reach the fallback by two *different*
conditions and `undefined` by a third. They are the exact shapes DC's nullable master data produces.
Three cases, one body — already the simplest form that keeps the coverage.

---

### S-4 — Drop `overflow-hidden` and let the stripe overhang the chip's rounded corner — **REJECTED**

It would remove one class. But the chip has `rounded-md`, and without clipping, a square stripe
flush to the left edge renders *over* the rounded corner — the chip visibly stops being rounded on
its left side. The owner-approved mockup (`option-b.html`) clips it. Removing the class would ship a
different design from the one that was approved. Rejected on correctness, not on taste.

---

## Simplifications already built in, not added later

Worth recording, because the simplest version of this change is mostly about what it does *not* do:

- **`ColourSwatch` reused, not re-implemented.** The blend logic already existed; the change adds
  zero colour maths. Test 7 asserts the gradient string comes from that shared path.
- **Radix `RadioGroup` untouched.** A hand-rolled chip row would have been more code *and* a
  regression in keyboard, focus and screen-reader behaviour.
- **Nothing added to the barrel.** The change adds fields to an already-exported interface, so
  `src/components/index.ts` needed no edit at all.
- **No new dependency, no config change, no new test-environment polyfill.**
- **No wrapper element around the chip text.** The `title`/`aria-label` route carries the long name
  with zero DOM added — which is also what keeps existing callers byte-identical. The richer
  alternative (Radix `Tooltip` per chip) was rejected in the plan for exactly that reason.

## Over-build check

Two files, 57 added source lines, no new abstraction, no new indirection, no configuration surface,
no options beyond the two fields the plan specified. Nothing here is built for a future caller that
does not exist yet. **Not over-built.**
