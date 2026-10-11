# Developer handover — CR-DESIGN-SYSTEM-018

**Next agent:** the conductor (poll CI, merge on green). Then Org Admin's CR-ORGADMIN-015 session in its own lane.
**Next action:** Org Admin pins the **merged** sha on `main` (never the branch sha, KI-M001E19-002), mounts `NavigationBusyProvider` in its console layout, places `<NavigationBusyBar />` as the first child of its scrolling content area (outside padding), and sets `aria-busy={useNavigationBusy()}` on `<main>`. It must confirm its navigation uses the kit `Link`, and that its Tailwind `content` scans the kit's `src/`. README "Navigation busy signal" has the snippet.
**State:** built, green (517/25), closed out, PR open. Artifacts: `../output/*`, `frames/`, `nav-busy-fixture/`.

## Rules
1. 🔴 **No provider ⇒ `Link` renders exactly what it did at `820c980`.** `Link.additive.test.tsx` renders a frozen copy beside the live one; keep it green. This is the whole additive claim.
2. 🔴 **No Suspense, no `loading.tsx`, no `useSearchParams`** in `NavigationBusy.tsx` or `Link.tsx` (guard test). That is the fault the change exists to avoid.
3. 🔴 **`LinkPendingMark` must stay a descendant of `NextLink`**: `useLinkStatus` only sees the navigation there.
4. The bar uses core Tailwind utilities only (no keyframes); keep it that way so it does not depend on a consumer's config.
5. Run prettier with `--print-width 100` (the repo's width); the default reflows untouched lines.
6. Consumers pin by sha and move on their own; this change moved none.
