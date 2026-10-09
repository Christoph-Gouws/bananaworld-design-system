# Test results — CR-DESIGN-SYSTEM-015

Run 2026-10-09 on the branch tree (base `main` @ `cde6f4e`, CR-DESIGN-SYSTEM-014; `origin/main` was re-fetched and is still `cde6f4e`).

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | clean |
| Suite | `pnpm test` | **464 passed / 23 files** (baseline per CR-014 handover: 458 / 22 ⇒ +6 tests, +1 file; no existing test touched) |
| Mutation battery | `node runs/change-12/output/mutation-battery.mjs` | **6/6 killed** (sixth property; changed hex; dropped `:root[data-theme]`; second block; one byte of `tokens.css`; deleted export entry) |
| Format | `prettier --check` on the new CSS and test | clean |
| Quality sensors | `quality-sensors.mjs --changed tests/themes/packhouse-theme.test.ts` | **0 open** on all 10 sensed dimensions |
| Real browser | `runs/change-12/evidence/browser-proof/proof.mjs` | frames `01`–`03` in `runs/change-12/evidence/frames/` (see `milestone-evidence.md` §7) |
| Dependency audit | `pnpm audit --prod --audit-level=high` | **not run locally** (the session's sandbox refused the command). No dependency changed and `pnpm-lock.yaml` is untouched; package CI's *Dependency Audit* job is the check |
| Lint | — | the package has no lint script |
| DC + CRM re-check | `runs/change-12/evidence/dc-crm-recheck.md` | done; owner ACCEPTED it as clearing QG-CEN-003 / packhouse AC-02 |

## Acceptance criteria

| AC | Criterion | Verdict |
|---|---|---|
| AC-01 | `packhouse.css` declares exactly the five accent tokens with the DLC-DEC-054 values and nothing else; `tokens.css` is unchanged | **MET** (guard test + mutation battery) |
| AC-02 | DC and CRM unaffected: artefacts, screens, CI | **MET** per the owner's recorded acceptance of `dc-crm-recheck.md` (client bundles byte-identical; the two red CI checks are red on each app's `main` too) |
| AC-03 | Export `./themes/packhouse.css` added, four existing entries unchanged, version 0.2.0 | **MET** (guard test) |
| AC-04 | The teal wins over `[data-surface="browser"]` and applies on browser and tablet surfaces in a real browser | **MET** (frames 02, 03) |
| AC-05 | README "Themes" section and 0.2.0 entry | **MET** |

Overall QA verdict: **PASS**
