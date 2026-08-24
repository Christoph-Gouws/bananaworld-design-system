# Deployed verification — CR-DESIGN-SYSTEM-006

**Verdict: N/A — and here is the cause, so this is a recorded N/A rather than a skipped step.**

## 1. Why there is nothing to deploy

`@bananaworld/design-system` is a **source-only, private, sha-pinned library**:

| Fact | Consequence |
|---|---|
| `"private": true`, `"files": ["src"]`, no build step | nothing is published to a registry |
| Consumers transpile the raw TypeScript via Next.js `transpilePackages` | there is no artifact to deploy |
| Five apps pin it **by git commit sha** and each bumps when it chooses | this change reaches no running app until a consumer moves its own pin, in its own change |
| No database, no migration, no server, no environment variable, no feature flag | there is no environment to verify against |

There is no URL, no staging deployment and no screen belonging to this package. **This change is
inert in production by construction** — see `known-issues.md` A-3.

## 2. What was verified instead

| # | Substitute proof | Result |
|---|---|---|
| 1 | The package's own suite, in a DOM environment (happy-dom) | **263 passed / 14 files**, baseline 246 / 13 |
| 2 | Typecheck under `strict` + `noUncheckedIndexedAccess` | **clean** |
| 3 | 🔴 Every **existing** caller shape rendered and diffed against `main@fc6f6c6`'s component | **384 shapes, whole `innerHTML`, byte-identical** (`test-results.md` §3) |
| 4 | The exact class attribute of every new authoring shape | T-3, T-4, T-5, T-10, T-11 |
| 5 | Exactly one vertical class over 80 combinations | T-6 |
| 6 | The rendered DOM carries no stray `valign` attribute | T-13, on `<td>` and `<tr>` |
| 7 | The export surface a consumer resolves against | T-16 + three empty barrel diffs |
| 8 | Specs proved to bite, not assumed to | 5 mutations; 4 caught, 1 proven inert |
| 9 | Production dependency closure | 69 packages walked; 6 highs, all on the standing ignore list, **0 new** |

## 3. Migration

**None. This package has no database by construction.** No migration file was written, none was
classified with `classify-migration.mjs`, nothing was rehearsed and nothing was promoted. No entry in
`runs/current/migrations-pending/` — there is nothing for the owner to apply.

## 4. Throwaway Postgres

**Never started.** There is no database in this package and no test needs one.

- `chg-cr-design-system-006-pg` was **never created**.
- No container is running, **no container is stopped**, and **port 5433 was never held**.
- Nothing was left for the conductor's sweep to clean up.

## 5. What genuinely cannot be verified from here — stated, not papered over

| Item | Why | Who verifies it, and when |
|---|---|---|
| That the CRM sales order grid actually lines up | The CRM is not readable or runnable from this worktree, and **its adoption is out of scope** | **The CRM**, in its own change, after it bumps its pin to the merged `main` sha |
| That the option looks right in a real browser at real row heights | No app, no browser, no screen in this package | The first adopting screen (the CRM's grid) |
| That no consumer passes the legacy `valign` attribute | Four of five consumer repos are unreadable from here | **Each consumer**, one grep at its own pin bump. DC is already proven clean — zero occurrences |
| That DC's suites stay green | Consumer suites are not runnable here and **none was run** | **DC**, at its own pin bump. Its three Table specs are behavioural and cannot redden on a class-string change |

**No claim is made anywhere in this pack that a consumer app was built, run, deployed or visually
checked.**
