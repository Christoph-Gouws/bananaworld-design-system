# Deployed verification — CR-DESIGN-SYSTEM-004

> Stage 04. **Verdict: N/A — recorded with cause, not skipped.**

## 1. Why there is nothing to deploy

`@bananaworld/design-system` is a **source-only, sha-pinned library**:

| Fact | Where it is visible |
|---|---|
| `"private": true` | `package.json` |
| `"files": ["src"]` — TypeScript source ships; consumers transpile it via Next.js `transpilePackages` | `package.json`, README |
| **No build step** — there is no `build` script, and `typecheck` is `tsc --noEmit` | `package.json` scripts |
| **No server, no URL, no runtime instance** | there is nothing to point a browser at |
| **No database, no migration, no query** | the package has none by construction |
| Consumers pin an **exact git commit** | DC/CRM `365be65`, org-admin/RMS `ecba2218`, Mangaverde `e3a88e35` (per CR-003 §1.4) |

**Nothing this change adds reaches a single user until a consumer moves its own pin, in its own
change, against the merged sha on `main`.** No pin was moved here and none may be moved from here.

## 2. Throwaway Postgres — never started, nothing left behind

The container `chg-cr-design-system-004-pg` was **never created**, because this package has no
database, no migration file and no query to rehearse. There is:

- **no running container**, **no stopped container**, and **no port 5433 held** by this session;
- **no migration** to classify — `classify-migration.mjs` was not run because there is no `.sql` file
  to hand it, and `runs/current/migrations-pending/` was not created;
- **no `migrationExpected`** anywhere in this change: the approved plan records `migrationExpected:
  false` (§4).

## 3. Consumer verification — deferred, and honestly so

DC, CRM, org-admin and RMS are **not checked out in this worktree and cannot be read or run from it**
(permission-blocked). **No consumer suite was executed and nothing in this pack claims one was** —
the fourth change in this project to record that limitation.

The claim that every consumer is unaffected does **not** rest on running them. It rests on the diff:

```
$ git diff --numstat -- src/
8       0       src/components/index.ts
7       0       src/index.ts
9       0       src/lib/index.ts
```

**+24 / −0.** No existing symbol is called, widened, renamed, moved or defaulted differently, and the
two new files are files nothing imports yet. Anyone can check that from the diff alone, without a
consumer repo.

## 4. Substitute proofs — what WAS verified in place of a deployment

| # | Proof | Result |
|---|---|---|
| S-1 | The package **typechecks standalone** with no app path alias, so an `@/…` import cannot resolve and would fail the gate | `pnpm typecheck` clean under `strict` + `noUncheckedIndexedAccess` |
| S-2 | The control renders in a **real DOM** (happy-dom) against **Radix's actual output** — not a mock and not a screenshot | 30 component specs, asserting roles, accessible names, focus order and disabled states |
| S-3 | The new surface is **reachable from the package root**, which is the only way a consumer reaches it | Both specs import from `../../src`; a missed barrel name fails the suite |
| S-4 | Every existing spec still passes **unmodified**, and the committed toolbar snapshot hash has not moved | 189 → 235, 0 existing specs edited, sha256 `ce7bd849…` |
| S-5 | The dependency closure carries **no new advisory** | 6 highs, all six standing owner-approved ignores, 0 new; `package.json` and `pnpm-lock.yaml` untouched |

## 5. What only a real screen can prove — deferred to the first adopter

| # | Deferred item | Who proves it |
|---|---|---|
| A-1 | The two bars sit correctly around a real table at real widths, browser **and** tablet (`data-surface`) | CR-DC-052's screen |
| A-2 | The control is usable at 200 rows against real data — it renders four numbers; the rows are the consumer's | CR-DC-052 |
| A-3 | A real screen reader (not happy-dom's role tree) announces the range once per page change | CR-DC-052's accessibility pass |
| A-4 | 🔴 That the consumer honours the contract — server paging **without** `useTableControls` for search/filter, and a `totalCount` scoped to what that person may see | **CR-DC-052.** This package cannot enforce it under option (a); that is the trade the owner approved. `developer-handover.md` §2 |

## 6. Rollback

Nothing to roll back and nothing to un-apply: no migration, no deployment, no data touched, no
consumer pin moved. If this merge were reverted, the estate returns to `fc2c5b8` behaviour exactly,
because no consumer has adopted anything yet. The revert is the whole rollback plan.
