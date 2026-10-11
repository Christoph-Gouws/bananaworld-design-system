# Implementation summary — CR-DESIGN-SYSTEM-018

Plan fit: everything the plan cites is still as described on fresh `main` (`820c980`); built to the approved plan (layout A, on-green).

**Built**
- `src/components/NavigationBusy.tsx`: `NavigationBusyProvider` (a count of pending kit links; renders no DOM), `NavigationBusyBar` (zero-height sticky wrapper, 3px / 4px tablet accent strip; idle → busy → done; `role="progressbar"` + `aria-label` + `aria-busy` only while busy), `useNavigationBusy`. Nothing shows for a navigation under 150 ms.
- `Link.tsx`: new optional `pendingIndicator`. Without a provider (or with `legacyBehavior`) it returns exactly the JSX it always did. Inside a provider it adds a zero-width, `aria-hidden` spinner child fed by Next's `useLinkStatus`, and reports pending to the bar.
- Barrel: 3 runtime names + 2 types. Version 0.3.0. README section and changelog line.
- Core Tailwind utilities only (no keyframes, so no dependence on a consumer's config); `motion-reduce` variants; tablet sizes via `[data-surface=tablet]`.

**Additive proof:** 36 byte-identity cases against a frozen copy of the `820c980` `Link`; export inventory updated; all 464 existing tests still pass. Existing callers: DC re-exports the kit `Link` (`src/components/ui/index.ts:120`), has 0 `legacyBehavior` uses, and cannot be inside a provider that does not exist at its pin (`cde6f4e`), so it takes the unchanged branch. CRM, RMS and org-admin are unreadable from this session and are unaffected by the same construction.

**Not built:** programmatic navigation / back-forward, any consumer wiring, any pin bump.
