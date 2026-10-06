# Test results — CR-DESIGN-SYSTEM-014

Run 2026-10-06 on the branch tree (base `main` @ `d94a5ebf`, CR-DESIGN-SYSTEM-013), `pnpm install --frozen-lockfile`.

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | clean |
| Suite | `pnpm test` | **458 passed / 22 files** (baseline at `d94a5ebf` per its handover: 450 / 21 ⇒ +8 tests, +1 file) |
| Mutation battery | `node runs/change-13/output/mutation-battery.mjs` | **5/5 red** (part dot, tag, values-mode tint/before, kept-back rows, `aria-expanded`) |
| Quality sensors | `quality-sensors.mjs --changed` the 3 source files | **0 open** on all 10 sensed dimensions |
| Dependency audit | `pnpm audit --prod --audit-level=high` | **not run locally** (the session's sandbox refused the command). No dependency changed; package CI's *Dependency Audit* job is the check |

## Acceptance criteria
| AC | Criterion | Verdict |
|---|---|---|
| AC-1 | `ActivityTimeline` renders an ordered list, entries in the order handed in, optional parts only when given | **PASS** |
| AC-2 | `ChangeTable` changes mode: Field · Before · After, changed values tinted, unchanged plain | **PASS** |
| AC-3 | `ChangeTable` values mode: Field · Recorded as, never a before | **PASS** |
| AC-4 | The kept-back rows' toggle is reached and pressed from the keyboard, with `aria-expanded` | **PASS** |
| AC-5 | Additive: every prior export unchanged; the new names counted and named | **PASS** |

Overall QA verdict: **PASS**
