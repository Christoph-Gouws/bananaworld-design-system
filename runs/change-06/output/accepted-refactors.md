# Accepted refactors — CR-DESIGN-SYSTEM-006

**1 accepted. Test-only. No source file was refactored.**

## R-1 — extract `verticalClasses()` in the spec file — ACCEPTED, BUILT, GREEN

| Field | Value |
|---|---|
| File | `tests/components/Table.test.tsx` |
| Source files touched | **none** |
| Origin | `simplification-opportunities.md` S-8 |

**Before** — the same regex, with the same `?? []` fallback, repeated across eight specs:

```tsx
expect(cls.match(/\balign-(?:top|middle|bottom)\b/g) ?? []).toEqual(["align-top"]);
```

**After** — one named helper, beside the file's existing `tdClass` / `trClass` helpers:

```tsx
/** Every vertical-alignment utility present in a class string, in order. */
function verticalClasses(classAttr: string): string[] {
  return classAttr.match(/\balign-(?:top|middle|bottom)\b/g) ?? [];
}
```

**Why it is worth doing:** eight call sites, and the assertion reads as the thing being asserted —
`verticalClasses(...)` → `["align-top"]` — instead of as a regex. T-6's guarantee ("exactly one") is
then `toHaveLength(1)` on a named value, which is the sentence the request actually asked to be
guaranteed.

**Why it is safe:** it changes no assertion, only how each one is spelled. The regex is character-for-
character the one it replaces, including the `\b` anchors and the non-capturing group.

**Verification after the refactor:** `pnpm typecheck` clean · `npx vitest run
tests/components/Table.test.tsx` **17 / 17 green** · `pnpm test` **263 / 263 green**.

## Refactors considered and NOT accepted

All six rejected candidates, with their reasons, are in `simplification-opportunities.md` §1. The one
worth repeating here, because it is the one a future session will be tempted by:

🔴 **Do not collapse `TableCell`'s two class-emission positions into one.** It is shorter, it keeps
T-1 green, and it silently breaks either the default's position (T-8 — today's
`className="align-top"` workaround, live in five sha-pinned apps) or the prop's precedence over
`className` (T-7). Both halves are proved by mutation (M-2, M-5) and fenced by comments on the lines
themselves.

**No source refactor was accepted in this change.** The two source files' shapes are the plan's, and
the plan is what the owner approved.
