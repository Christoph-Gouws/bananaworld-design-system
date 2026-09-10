# Global Milestone Scorecard — CR-DESIGN-SYSTEM-010

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-010 — (not an epic: a CHANGE REQUEST, archived at runs/change-09/)
Milestone:      CR-DESIGN-SYSTEM-010 — review follow-up on CR-DESIGN-SYSTEM-009 (3 reviewer findings)
Date:           2026-09-10
Approved layout: A · Ship mode: on-green
```

> ⚠ **This is a Change Request, not an epic or a milestone.** The two id fields carry the CR id
> because the close gate greps for it; **no `runs/epic-NN/` folder, no `milestone-NN/` folder and
> nothing under `runs/current/epic-plan/` was created.**

## Result

| Category | Score | Minimum | Status |
|---|---|---|---|
| Readable code | **11 / 11 dimensions** | PASS | ✅ **Pass** |
| Centrality | **8 / 8 dimensions** | PASS | ✅ **Pass** |
| Security | dependency audit **exit 0 — 0 blocking**; no application security surface exists in this package | PASS | ✅ **Pass** |
| QA | **21 / 21 acceptance criteria met** | PASS | ✅ **Pass** |
| Evidence | **16 / 16 required artifacts present, each as its own file** | PASS | ✅ **Pass** |
| **Overall** | **5 of 5** | **PASS** | ✅ **PASS** |

## The reasoning behind each row

### Readable code — 11/11 · `runs/change-09/output/readable-code-scorecard.md`

**Generated** by `organization/scripts/quality-sensors.mjs`, never hand-authored. 6 machine-decided
rows PASS; the 5 JUDGMENT rows are answered in-session and no machine-filled cell was edited.
Sensor: **7 of 7 requested files scanned, 0 open findings, 4 justified, 0 weak.**

⚠ The changed files were normalised to **LF** before the sensor ran, because it silently ignores every
`QUALITY-JUSTIFY` on a CRLF checkout (`known-issues.md` B-1 — an estate tooling bug carried from
CR-009, not fixed here). Git stores LF anyway, so the commit is unaffected and nothing was gamed.

### Centrality — 8/8 · `runs/change-09/output/centrality-scorecard.md`

4 machine-decided PASS; the 4 JUDGMENT rows answered. Two are **N/A with the reason recorded** (no
authorisation code and no validators exist in a pure-presentation package — an unrecorded N/A would
be a skip). **Row 4, business calculations, is the one this change exists to fix:** the tick-list's
value arithmetic went from two divergent copies to one implementation serving both surfaces.

⚠ `CE-01`/`CE-05` and `CE-08`/`RC-09` are **not scanned for this project** (no `componentGlobs` /
`wiringGlobs` configured), so their PASS is a silence rather than a measurement. Flagged in both
scorecards and in `known-issues.md` B-2.

### Security — PASS

**Application surface: nothing to review, structurally.** Pure presentation (TECH-COMP-003 /
ADR-001): no network, no record read or written, no authorisation, no tenancy, no secret, no
`process.env`. This change adds **no import and no dependency**; it deletes one function, renames one
prop on an internal component, and widens one type. No user input is interpolated into markup.

**Dependency surface: `pnpm run audit:deps` → exit 0, 0 blocking.** 4 advisories found (2 moderate, 2
high), both highs on the standing owner-approved ignore list. `package.json` and `pnpm-lock.yaml` are
**unchanged by this change**, so CI walks the same closure `main` does — the one CR-009 repaired.

⚠ One accessibility consequence, stated rather than buried: under layout A the master row is now
**ticked** in the nothing-chosen state, so a screen reader announces "checked, All 3" where it said
"not checked, 0 of 3". That is the owner's approved reading, and no shipped screen sees it because no
consumer declares `selectAll: "master"`.

### QA — 21/21 · `runs/change-09/output/qa-report.md` and `test-results.md` §2

All 21 acceptance criteria met, including the three that could only be discharged by *confirming the
findings against the current code first* (AC-1…AC-3) — one of which, F3, was confirmed by
**compiling** rather than reading, because the plan itself flagged that uncertainty.

**No finding was dropped**, and none needed to be: all three still held.

### Evidence — 16/16, each as its own file

Stage 04: `test-results.md` · `qa-report.md` · `defect-log.md` · `deployed-verification.md`.
Stage 05: `revision-review.md` · `simplification-opportunities.md` · `accepted-refactors.md` ·
`readable-code-scorecard.md` · `centrality-scorecard.md`.
Plus `changed-files.md` · `implementation-summary.md` · `known-issues.md` ·
`runs/change-09/technical-debt.md`, and the three evidence roll-ups beside this file.
**No roll-up was substituted for a per-stage artifact** (Rule 9.1).

Tooling archived with the evidence, because it is what the numbers were produced by:
`byte-identity-setup.mjs` · `byte-identity.harness.test.tsx` · `mutation-battery.mjs`.

## What is measured, and what is not claimed

| Measured | Number |
|---|---|
| `pnpm test` | **377 / 17 files** (baseline re-measured before any edit: **363 / 17**) |
| `pnpm typecheck` | clean |
| Byte-identity vs `main@3143646` | **9,936 caller shapes, 0 differences** + 4 deliberate, asserted differences |
| Seven shipped toolbar screens | **zero-line diff** |
| Mutation battery | **10 run, 10 caught, 0 skipped**, every restore byte-exact |
| Dependency audit | **exit 0, 0 blocking** |

| NOT run, and NOT claimed | Why |
|---|---|
| Any consumer app's test suite | Consumer repos cannot be run from a build worktree. Ninth change to record it |
| `pnpm lint` | **There is no `lint` script and no ESLint config in this repository** — pre-existing drift, out of lane |
| A real-browser check of OQ-8 | No browser binary is executable from this sandbox. Carried, untouched, probe at `runs/change-08/output/truncate-probe.html` |
| A migration rehearsal | This package has no database by construction. `migrationExpected: false` |
| A throwaway Postgres | **Never started; nothing left behind.** No container, no stopped container, no port held |
