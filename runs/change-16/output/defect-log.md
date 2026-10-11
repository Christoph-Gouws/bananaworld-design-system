# Defect log — CR-DESIGN-SYSTEM-018

0 open defects.

Found and fixed during the build (not shipped):
1. Mutation battery, first run: two mutants survived (no 150 ms delay; mark rendered without a provider). Cause: the tests asserted only the end state. Fix: assert mid-delay and add a "pending without a provider draws nothing" test. Re-run 7/7 killed.
2. Browser proof, first run: the reduced-motion check read `transition-duration`, but Tailwind's `transition-none` sets `transition-property: none` and leaves the duration. The check was wrong, not the component. Fixed to read `transition-property`.
3. Fixture frame showed the bar inset by the `main` padding. Placement guidance, not a defect in the kit: README now says to put the bar outside the content's padding.
