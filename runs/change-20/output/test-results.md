# Test results — CR-DESIGN-SYSTEM-022

Commands: `pnpm test` → **682 passed / 35 files** (baseline at `5c14f37`: 671 / 32; +11 tests, +3 files). `tsc --noEmit` clean. `pnpm install --frozen-lockfile` passes and `pnpm-lock.yaml` is unchanged. `pnpm audit --prod --audit-level=high` exits 0 (only the owner-ignored advisories). `prettier --print-width 100 --end-of-line auto --check` clean on the new files and `Link.tsx` (`GridFilterRow.tsx` was already not prettier-clean at `main`; only its lines were touched). Existing tests and snapshots: zero edits. Real Edge run `node runs/change-20/evidence/browser-proof/proof.mjs` → **ALL PASS** (desktop 1280 px, tablet 820 px; five link shapes). The same run on the old `Link` (`before` tag) → **12 FAILED**.

## Acceptance criteria
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-1 (F1) | The three filter open lists share one chrome constant, same bytes | MET | `GridFilterRow.chrome.test.tsx`; existing `GridFilterRow`/`allTicked` tests green unedited |
| AC-2 (F2) | The secret-scan exemption does not depend on a commit sha | MET (config + test); scan NOT run locally | `packhouse-theme.test.ts` allowlist case; `.gitleaks.toml`; see known-issues K-1 |
| AC-3 (F3) | sharp floor kept, notes corrected, advisory ID confirmed | MET | `tests/lib/package-overrides.test.ts` (fails against `main`'s package.json); `gh api advisories/GHSA-wq5f-xc86-pv6w`: high, `< 0.35.5` |
| AC-4 (F4) | The waiting ring moves nothing in any link shape, and sits after the words | MET | Edge: anchor, every child, next sibling identical idle vs waiting in 5 shapes × 2 surfaces; ring within 2 px of target; `Link.outOfFlow.test.tsx` |
| AC-5 (F4b) | Inline links in text unchanged | MET | Edge shape 1; unit test pins the exact classes and attributes; `Link.additive.test.tsx` green unedited |
| AC-6 (F5) | next floor kept, notes + decision log corrected | MET | override-notes test; `gh api` for both next advisories: patched 15.5.28 |
| AC-7 (F6) | ActionTile name ratified as built, no code change | MET | decision-log entry; `ActionTile.test.tsx` green unedited |
| AC-8 (AC-A) | Additive: no export added or removed, no default changed | MET | `DragBoard.additive.test.tsx` green unedited |

## Mutation evidence
- Old `Link` in place (the "ring put back in flow" mutant): Edge proof FAILS 12 checks (badge moves 118 px, block link grows 24 px, tile content shifts 3 px).
- `main`'s `package.json` against the override-notes rule: `next@<15.5.28` and `sharp@<0.35.5` have no note → test fails; `.gitleaks.toml` at `main` does not contain the hash → allowlist test fails.

## Manual verification
Steps, expected and actual: `runs/change-20/evidence/milestone-evidence.md` §7.

Overall QA verdict: PASS
