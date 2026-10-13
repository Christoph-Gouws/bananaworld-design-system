# Test results — CR-DESIGN-SYSTEM-019

| Command | Result |
|---|---|
| `pnpm test` (vitest run) | **531 passed / 26 files** (baseline 517 / 25; +14 new tests in the new `tests/components/Button.test.tsx`) |
| `pnpm typecheck` | clean |
| `prettier --check --print-width 100` on `Button.tsx`, `Button.test.tsx` | clean after `--write` (diff stays two lines) |
| `quality-sensors.mjs` on the two changed files | 0 open findings |
| `pnpm audit` | NOT run: the sandbox refused the command. No dependency changed; CI runs `audit:deps`. |
| Lint | no lint script in the package |

Mutation check (run by hand, then restored): `disabled ?? inflight` → 5 tests fail; `Boolean(disabled)` alone → 6 tests fail. Both killed.

## Acceptance criteria

| # | Criterion | Verdict |
|---|---|---|
| AC-1 | `disabled={false} inflight` renders a disabled button (`disabled`, `aria-busy`, `data-inflight`) | **MET** |
| AC-2 | A click while in flight does not call `onClick` (user-event click and raw `fireEvent.click`) | **MET** |
| AC-3 | In flight then settled: no call while busy, exactly one call once `inflight` is false | **MET** |
| AC-4 | A `type="submit"` button with `disabled={false} inflight` inside a form submits nothing | **MET** |
| AC-5 | Every other `disabled` × `inflight` cell is unchanged (9-cell table test) | **MET** |
| AC-6 | Export surface unchanged (`DragBoard.additive.test.tsx` green) | **MET** |
| AC-7 | Version 0.3.1 with a behaviour-fix changelog entry | **MET** |
| AC-8 | Consumer reliance check reported | **MET** (`known-issues.md`) |

## Manual verification

Not performed in a real browser: see `deployed-verification.md`. The disabled state is the native attribute, asserted by the DOM tests; the greyed look is the existing `disabled:opacity-50` class already used by every `inflight`-only button.

Overall QA verdict: **PASS**
