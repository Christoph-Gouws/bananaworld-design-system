# Deployed verification — CR-DESIGN-SYSTEM-001

## There is no deployment for this change, and that is a property of the artifact

`@bananaworld/design-system` is a **library**, not a running system:

- `"private": true`, `"files": ["src"]` — it ships TypeScript source only. There is no build step,
  no bundle, no server, no URL and no environment to deploy to.
- It has no database, no migrations, no network access and no persistence by construction.
- Consumers (`Bananaworld-DC`, `-CRM`, `-RMS`, `org-admin`, `Mangaverde`) pin it **by git sha** and
  transpile it themselves via Next.js `transpilePackages`.

So there is no dev, staging or production instance of this package on which anything could be
observed. "Deployed" for this package means **merged to `main`** — at which point a sha exists that
a consumer may choose to pin.

**Verdict: N/A by construction — recorded, not skipped.**

## What stands in for it

| Normally proven on a deployed instance | Proven here by |
|---|---|
| The change renders correctly | 18 tests in the package's own suite under happy-dom (`test-results.md`), incl. the a11y-tree assertion for `description` and the gradient assertion for the blended swatch |
| Existing screens did not regress | The byte-identical assertions in test 5 — attribute absence, child-node count, and the complete `class` string as a literal |
| It compiles for consumers | `pnpm typecheck` clean under `strict` + `noUncheckedIndexedAccess`, plus test 17 which compiles a consumer-shaped option type through the component |
| Visual treatment approved | Owner reviewed three rendered mockups at the plan gate and picked **option B** (`runs/current/mockups/CR-DESIGN-SYSTEM-001/option-b.html`). The implemented classes match that mockup's geometry: 7px stripe / 10px gap on browser, 10px stripe / 14px gap on tablet, full height, flush left, chip clips it to its own radius |

## What genuinely cannot be verified until a consumer bumps

Stated plainly rather than glossed:

1. **Rendered pixels in a real browser.** happy-dom computes no layout — every measurement is zero.
   The stripe's full-height behaviour rests on `align-self: stretch` + `height: auto`, which is
   asserted at the class level (test 11), not measured. First real render happens in DC's follow-up.
2. **`twMerge` output as CSS.** Verified as a *string* against the installed `tailwind-merge@3.6.0`,
   and the Tailwind emission order that makes `pl-0` win on the left is standard and stable across
   v3 and v4 — but no Tailwind build runs in this repo, because consumers own the Tailwind build.
3. **DC's own ChoiceGroup suite**, which is a genuine regression gate on this change (see
   `qa-report.md` §3). It lives in DC's repository; this session is sandboxed to this worktree and
   cannot run it. It runs in DC's pin-bump change.

None of the three blocks this change. All three are discharged by the consumer's own `tsc`, test
suite and visual review at bump time — which is exactly how a sha-pinned shared package is meant to
work, and why the pin bump is a separate change owned by the consumer.

## Throwaway Postgres

**Never started.** This package has no database, so the container was not needed.
`docker ps -a --filter name=chg-cr-design-system-001-pg` returns empty — no running container, no
stopped container, no port held.
