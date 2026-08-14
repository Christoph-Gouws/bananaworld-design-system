# Deployed verification — CR-DESIGN-SYSTEM-002

**Status: N/A, recorded with cause — not skipped.**

## Why there is nothing to deploy

`@bananaworld/design-system` is a **source-only, sha-pinned library**:

- `"private": true` — never published to a registry
- `"files": ["src"]` — it ships TypeScript source; there is no build step and no artifact
- no server, no URL, no container, no database, no migration
- consumers transpile it themselves via Next.js `transpilePackages`

"Deployed" for this package means **merged to `main`**, and it reaches a user only when a consuming
app moves its git-sha pin — in that app's own change, against the **merged** sha (never a branch sha
— KI-M001E19-002 is that mistake on record). This change bumps no pin, so **nothing reaches a user
as a result of merging it.**

## Substitute proofs — what stands in for a deployment check

| # | Proof | Result |
|---|---|---|
| 1 | **The package builds standalone**, with no app import reachable from the new component | `pnpm typecheck` clean. No `@/` alias is configured, so an app import could not resolve even if written. Test 23 additionally scans the source for `@/`, `bananaworld-dc` and `./index` |
| 2 | **The consumer-facing entry point actually works** — not just the file | Test 26 imports `DocumentHeader`, `DOCUMENT_HEADER_SLOTS` and `DOCUMENT_NUMBER_WHERE_TO_SET` from the **package root** (`../../src`, i.e. the `"."` export) and renders the component. Test 27 does the same for the describer |
| 3 | **The component renders in a DOM** under the same React 19 the consumers run | 22 DOM specs under happy-dom via `@testing-library/react`, covering slot order, all five number states, all four date moods, the empty state and the PDF slot |
| 4 | **Existing consumers cannot be affected** | 34 insertions / **0 deletions** across `src/`; no export renamed, moved or removed; no default changed; the pre-existing 79 tests still pass unchanged |
| 5 | **The dependency surface is unchanged** | `package.json` and `pnpm-lock.yaml` untouched (verified by `git status`). No new advisory can be introduced by a change that adds no dependency |

## Honestly deferred to consumer bump time

These cannot be checked from here and are **not** claimed as done:

1. **DC's own suites** — `tests/unit/components/DocumentHeader.test.tsx`,
   `tests/contract/transaction-form-standard.test.ts`, and the twelve forms' suites. This is a
   sandboxed design-system worktree with no DC checkout, dependencies or runner.
2. **A visual check of the thirteen render sites across twelve files** (`HEADER_RENDER_SITES`,
   DC contract test line 245 — twelve files, thirteen headers, since `RipeningRunsView` renders two).
3. **DC's `pnpm typecheck`** with `use-document-date.ts:28`'s deep import re-pointed at the barrel.

All three are itemised for their owner in `evidence/developer-handover.md` §3.

## Migration

**None.** This package has no database by construction, so no migration was written, rehearsed or
classified, and `runs/current/migrations-pending/` was correctly not created.

## Throwaway Postgres

**Never started.** There was nothing to run against it. `chg-cr-design-system-002-pg` was never
created, so there is no running container, no stopped container and no port held.
