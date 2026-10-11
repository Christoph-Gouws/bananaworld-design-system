# Revision review (Stage 05) — CR-DESIGN-SYSTEM-018

**Reviewed:** `NavigationBusy.tsx` (new, ~130 lines), `Link.tsx`, the barrel block, and the two test files, against the approved plan.

**Simplified:**
- The bar needs no separate "done" timer in the provider: the bar owns its three-phase state; the provider only counts and delays.
- One `useDelayedFlag` serves both the provider (bar) and the link mark (spinner), instead of two timers.
- `useLinkStatus` is resolved once at module load with an `in` check rather than inside the component.
- The no-provider branch is today's JSX unchanged; the provider branch only adds a child. `pendingIndicator` is destructured out so it never reaches the DOM.

**Considered and rejected:**
- A global click listener or `history.pushState` patch (the nextjs-toploader approach): sticks on same-URL and modifier clicks. `useLinkStatus` is the framework's own signal.
- A custom keyframe for a sliding stripe (option B): depends on the consumer's Tailwind config. Option A uses core utilities only.
- A `router.push` / back-forward helper: not asked for, and the plan names it as not covered. Not built speculatively.
- Putting the delay in CSS: the consumer's config would have to supply it, and fake timers cannot test it.
- Running prettier at its default width: it reflowed untouched barrel lines. Reverted; the repo's width is 100.

**Plan fit:** the plan's cited files and lines (`Link.tsx`, the barrel, `package.json` peer range, DC `package.json`) matched the fresh `main`. One deviation: `useLinkStatus` is read with `"useLinkStatus" in module` rather than a `??` on the property, because vitest's strict module mock throws on a missing key; behaviour on an older Next is the same (a bar that never shows).
