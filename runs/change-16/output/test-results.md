# Test results — CR-DESIGN-SYSTEM-018

Run 2026-10-11 on the branch tree (base `main` @ `820c980`, CR-DESIGN-SYSTEM-015).

| Check | Command | Result |
|---|---|---|
| Baseline | `pnpm test` before any edit | 464 passed / 23 files (matches the handover) |
| Typecheck | `pnpm typecheck` | clean |
| Suite | `pnpm test` | **517 passed / 25 files** (+53 tests, +2 files; no existing test altered beyond 3 names added to an export inventory) |
| Mutation battery | `node runs/change-16/output/mutation-battery.mjs` | **7/7 killed** (first run: 2 survived, the delay and the no-provider mark; two assertions added, re-run clean) |
| Format | `prettier --print-width 100` on touched files | clean (the repo's width is 100; default 80 would reflow untouched lines) |
| Quality sensors | `quality-sensors.mjs --changed` the 3 `src` files | **0 open** on all 10 sensed dimensions |
| Real browser | `runs/change-16/evidence/nav-busy-fixture/proof.mjs` (Edge) | **26 checks, ALL PASSED**; frames `01`–`08` in `runs/change-16/evidence/frames/` |
| Dependency audit | `pnpm audit --prod --audit-level=high` | **not run locally** (the session's sandbox refused the command). No dependency changed; `pnpm-lock.yaml` untouched; package CI's *Dependency Audit* is the check |
| Lint / design ratchet | — | the package has no lint script and no `scripts/quality/design-ratchet.mjs` |

## Acceptance criteria

| AC | Criterion | Verdict |
|---|---|---|
| AC-01 | A thin yellow bar across the top of the content area while a client navigation is in flight; old page stays; no layout shift | **MET** (browser: `rgb(250, 200, 10)`, heading rect identical idle vs pending, wrapper height 0, old title still shown; frames 02, 06) |
| AC-02 | Reduced motion: still line, still ring | **MET** (browser: transform none, `transition-property: none`, `animation-name: none`; frame 08) |
| AC-03 | `role="progressbar"` and `aria-busy` while busy; `aria-hidden` idle | **MET** (unit + browser, `main` `aria-busy` true then false) |
| AC-04 | Spinner on the clicked link via `useLinkStatus` inside the kit `Link`, opt-out prop | **MET** (unit + browser: exactly one spinner, inside `a[href='/slow']`; `pendingIndicator={false}` keeps the bar, drops the spinner; frame 04) |
| AC-05 | No Suspense boundary, no `loading.tsx` | **MET** (guard test greps both source files; fixture has no `loading.tsx`) |
| AC-06 | Tablet: same behaviour, no extra network | **MET** (browser at 820×1180: 0 `_rsc` requests before the click; 4px bar, 16px ring; frames 05–07) |
| AC-07 | Additive: no provider ⇒ every existing `Link` renders identically | **MET** (36 byte-identity cases against the frozen `820c980` copy, browser and tablet, with and without a provider at rest; ref still forwarded; pending without a provider draws nothing) |
| AC-08 | Unit tests, fixture page, CHANGELOG | **MET** (`NavigationBusy.test.tsx` 14, `Link.additive.test.tsx` 39; fixture app; README 0.3.0 entry — there is no `CHANGELOG.md`, the README holds the changelog) |
| AC-09 | Does not reintroduce the stalled server-action result | **MET** (64/64 revalidating-form submissions returned from "Working..." with the bar mounted; not a claim about Org Admin, whose own E2E is the authority) |

Overall QA verdict: **PASS**
