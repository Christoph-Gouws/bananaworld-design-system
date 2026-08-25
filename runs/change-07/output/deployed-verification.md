# Deployed verification — CR-DESIGN-SYSTEM-007

## 1. What "deployed" means for this unit

`@bananaworld/design-system` is **a library, not a running system**. It ships TypeScript source only
(`files: ["src"]`), has no app shell, no server, no database and no environment. There is nothing to
deploy to and no URL to visit.

**Its deployment event is a consumer bumping its git-sha pin** — and that is explicitly **not this
change's to do** (scope fence 2; D-10 of CR-006; KI-M001E19-002). So:

| Stage | Who | Status |
|---|---|---|
| Merge to `main` | the conductor, on green CI | **pending** — not this session's to do |
| Consumer pin bump to the **merged** sha | each consumer, in **its own** change | **not started, and not startable from here** |
| The option visible on a screen | the CRM, after its bump, by passing `valign` | **out of scope** |

🔴 **No environment was deployed to, and nothing here claims otherwise.**

## 2. What WAS verified, and how

Since there is no deployed instance, verification is by execution against the real package root and
by differential rendering — not by assertion.

| # | Verification | Method | Result |
|---|---|---|---|
| V-1 | The package builds and typechecks | `pnpm typecheck` (`tsc --noEmit`) | **clean** |
| V-2 | The whole suite passes | `pnpm test` | **269 passed / 14 files** |
| V-3 | The fix is reachable **from the package root**, not just from the file on disk | `tests/components/Table.test.tsx` imports from `../../src` — the barrel — exactly as a consumer does (spec 17). All six new specs exercise it through that import | **reachable** |
| V-4 | The export surface a consumer would resolve is unmoved | all three barrels byte-identical; **T-16** green | **unmoved** |
| V-5 | Every existing caller renders byte-identically | 1,536 shapes, whole `innerHTML`, diffed against `main@ce47010` | **no output** |
| V-6 | The behaviour change is bounded to the defect's shape | 576-shape group-3 sweep, every difference classified | **48 changes, all the defect's shape** |
| V-7 | The dependency closure a consumer would install is unchanged and clean | `package.json` / `pnpm-lock.yaml` untouched; audit reproduced anyway | **0 blocking** |

**V-3 is the one that stands in for a smoke test.** A primitive a consumer cannot reach from
`@bananaworld/design-system` has not shipped, whatever the file on disk says.

## 3. Throwaway Postgres — never started

This package has **no database by construction**, so no test needed one.

| Check | Result |
|---|---|
| `chg-cr-design-system-007-pg` started | **no** — never created |
| Container left running | **none** |
| Stopped container left behind | **none** |
| Port 5433 held | **no** |

Nothing was started, so nothing needed tearing down. Stated explicitly because past changes in this
estate left containers running.

## 4. Migrations — none

No migration file was written, so there is nothing for the conductor to promote to staging or for the
owner to apply to production. `runs/current/migrations-pending/CR-DESIGN-SYSTEM-007.md` is **not
created**, correctly — there is no migration to describe.

## 5. What a human can check after this merges

Full steps in `evidence/user-verification-steps.md`. In short: nothing on any screen in any app
changes today, and that is the intended outcome — **no consumer is on a pin that can even see
`TableRow.valign`.** The first observable effect arrives when the CRM bumps its pin to the merged sha
and passes `valign="top"` on its sales-order line grid, in its own change.
