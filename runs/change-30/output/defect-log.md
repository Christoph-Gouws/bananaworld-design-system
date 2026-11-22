# Defect log — CR-DESIGN-SYSTEM-032

Defects found by the real-browser proof and the mutation battery during the build, all fixed before the push.

| # | Found by | Defect | Fix | Status |
|---|---|---|---|---|
| 1 | Edge proof, axe `label-content-name-mismatch` | A counted heading/item was named "Loads — 2" by `aria-label`, which does not contain the visible words (WCAG 2.5.3) | Name comes from the visible text: the pill is part of the link; form is "Loads 2" | Fixed |
| 2 | Edge proof, axe | `UserMenu` trigger `aria-label` did not contain the visible name | Label is "<name> · <triggerLabel>"; initials moved to CSS generated content | Fixed |
| 3 | Edge proof | Flyout did not open in the proof's Tab sequence | Sequence was wrong (Tab enters a flyout; ArrowDown moves between rail headings) — proof corrected, behaviour is as planned | Fixed (proof) |
| 4 | Edge proof | Tap-outside check read the page before the slide-in finished | Proof waits for the slide-in; behaviour was correct | Fixed (proof) |
| 5 | Mutation battery | "Stored value read during render" survived | Server-render spec now remembers `rail` and must still render open | Fixed |
| 6 | `pnpm why` | Two copies of `@radix-ui/react-dismissable-layer` (navigation-menu 1.4.1 brought 1.2.1) | Pinned navigation-menu 1.2.14 and added a noted `pnpm.overrides` floor; one copy | Fixed |
| 7 | Unit suite | `package-overrides` test demanded a note for the new override | Note `//overrides-radix-dismissable-layer` added | Fixed |

Open defects: none.
