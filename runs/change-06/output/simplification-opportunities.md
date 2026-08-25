# Simplification opportunities — CR-DESIGN-SYSTEM-006

> Stage 05 simplification gate. Reviews only `src/components/Table.tsx` and
> `tests/components/Table.test.tsx`.

**7 candidates considered · 1 accepted · 6 rejected with reasons.**

## 1. Candidates

### S-1 — collapse the two emission positions into one — ❌ REJECTED

```tsx
// tempting:
alignClass(effectiveAlign), className, vertical,      // always after className
```

Half the length and it passes T-1 only by accident. It **breaks T-8**: today's only way to top-align
a cell is `className="align-top"`, and moving the default after `className` makes the default win
instead. That is a silent visual regression in **five sha-pinned apps** on a workaround somebody has
certainly written — DC wrote its own variant of it (`SalesOrderForm.tsx:1026`).

**Proved, not assumed:** mutation **M-2** is exactly this simplification, and four specs redden.
**This is the single most dangerous "cleanup" in the file** and it is fenced by a comment on both
lines and by `known-issues.md` D-2.

### S-2 — drop `askedForValign` and test `resolvedValign !== undefined` inline — ❌ REJECTED

Used twice, in two places whose *positions* are the whole mechanism. A named boolean is what makes
the pair legible as a pair. Saves one line, costs the reader the invariant.

### S-3 — `valignClass` as a lookup object instead of three `if`s — ❌ REJECTED

```tsx
const VALIGN = { top: "align-top", middle: "align-middle", bottom: "align-bottom" } as const;
```

Marginally shorter, but it **abandons the `alignClass` precedent the request explicitly named**, and
needs its own `?? "align-middle"` for `undefined` anyway. The twin functions should read as twins;
that is the point of the precedent.

### S-4 — one generic helper for both axes — ❌ REJECTED

Would touch `alignClass`, which this change is fenced away from, and turn two three-line functions
into one indirection. The horizontal path carries a specific historical bug in its comment that a
generic helper would strand.

### S-5 — provide `RowValignContext` only when `valign` is set — ❌ REJECTED

Genuinely simpler and keeps the React tree literally unchanged for every existing table. **Rejected
on correctness:** a `<Table>` nested inside a top-aligned row's cell would inherit that row's
alignment. The failure mode is *silent visual misalignment* — the exact bug this change exists to
fix. Cost of always providing: one context read per row, value `undefined`, no consumer, **and zero
DOM difference**, which the 384-shape `innerHTML` diff proves. Pinned by **T-12**.

### S-6 — collapse T-1 into T-2's table — ❌ REJECTED

T-1 is the estate-wide default: one spec, one string, named so that a failure says *"the default
moved"* rather than *"row 4 of 7 differs"*. It is the assertion five apps rest on.

### S-7 — replace the 80-combination loop in T-6 with a handful of cases — ❌ REJECTED

The loop **is** the guarantee. The request asked for exactly one vertical class, and the historic bug
in this file was a conflicting class surviving in a combination nobody enumerated. Sampling
reintroduces the sampling that caused it. It runs in ~50 ms.

## 2. Accepted

### S-8 — `verticalClasses()` helper in the spec file — ✅ ACCEPTED (and built)

Eight specs need "which vertical-alignment classes are in this string". Written inline that is a
repeated regex with a repeated `?? []` fallback:

```tsx
expect(cls.match(/\balign-(?:top|middle|bottom)\b/g) ?? []).toEqual(["align-top"]);
```

Extracted to one named helper beside `tdClass` / `trClass`, matching the file's existing shape:

```tsx
function verticalClasses(classAttr: string): string[] {
  return classAttr.match(/\balign-(?:top|middle|bottom)\b/g) ?? [];
}
```

**Test-only. No source file was refactored.** Typecheck clean and 263/263 green afterwards. Recorded
in `accepted-refactors.md`.

## 3. Simplifications already built in

| # | What |
|---|---|
| 1 | **Two optional fields — no new component, no wrapper, no variant.** The primitive is not forked |
| 2 | **Zero barrel movement.** A new optional field on an already-exported interface needs no export |
| 3 | `VAlign` is module-private, so it adds nothing to the public contract of five pinned apps |
| 4 | No new dependency; no new file under `src/`; `package.json` and `pnpm-lock.yaml` untouched |
| 5 | The `<tr>` itself is unchanged — only wrapped. `git diff -w` shows **3** real deletions in `src/` |
| 6 | `TableHead` deliberately gains nothing — one surface answers one request |
| 7 | The union is three values, not the four `TdHTMLAttributes` allows. `"baseline"` stays additive-later |
| 8 | The context carries `VAlign \| undefined` directly — no object, no provider component, no hook exported |
