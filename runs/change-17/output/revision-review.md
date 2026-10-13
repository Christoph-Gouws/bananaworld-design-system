# Stage 05 revision review — CR-DESIGN-SYSTEM-019

**Reviewed:** `src/components/Button.tsx` (one expression, one comment), `tests/components/Button.test.tsx` (new). Package/README edits are version and changelog only.

**Simplified:** nothing to simplify. The fix is the plan's exact expression `Boolean(disabled) || inflight`; no helper, prop or branch added.

**Considered and rejected:**
- Byte-identity harness against a frozen copy of the old Button (plan §4.1): the change is one boolean expression with a 9-cell truth table, which the table test covers directly. A frozen copy adds a fixture file for no further information.
- Mutation battery script: two mutants (`??` revert, `Boolean(disabled)` alone) were run by hand and killed; a committed script would be larger than the code it guards.
- Fixing `asChild` (a disabled link is still clickable) and `cursor-progress` being masked by `disabled:cursor-not-allowed`: new behaviour, would alter every busy button; recorded as R1/R2.
- Spinner or keep-colour look (mockups B, C): owner approved A.

Sensors: 0 open findings. Scorecards: 11/11 and 8/8.
