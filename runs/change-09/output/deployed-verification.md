# Deployed verification — CR-DESIGN-SYSTEM-010

> Stage 04. What was verified against something that RUNS, as opposed to something that compiles.

## There is nothing to deploy, and that is structural

`@bananaworld/design-system` is a **library**, not an application. It has:

- **no deployment** — it is consumed as TypeScript source over a git sha (`files: ["src"]`, and every
  consumer transpiles it via Next.js `transpilePackages`);
- **no database, no migration, no network, no environment** (TECH-COMP-003 / ADR-001);
- **no URL, no server and no runtime of its own** to point a check at.

So there is no staging environment for this change, no production apply, and no post-apply
verification step. `migrationExpected: false`.

## What WAS verified against something that executes

| # | What | How | Result |
|---|---|---|---|
| 1 | Every control's behaviour, driven the way a reader drives it | `pnpm test` — `happy-dom` + `@testing-library/user-event`; every new assertion is on what a **click** produced, never on a source scan | **377 passed / 17 files** |
| 2 | The additive claim, against the shipped code | 9,936 caller shapes rendered against `main@3143646` **and** against this build in one process, whole markup compared | **0 differences** |
| 3 | The seven shipped toolbar screens | whole-DOM snapshot | **zero-line diff** |
| 4 | That the suite actually catches these defects | 10 mutations restoring the findings | **10/10 caught** |
| 5 | The dependency closure CI will walk | `pnpm run audit:deps` | **exit 0 — 0 blocking** |
| 6 | The pre-change type error F3 describes | a probe compiled against the pre-change tree | **reproduced verbatim** — `TS2322` |

## Throwaway Postgres

**Never started. Nothing left behind.**

`docker run --name chg-cr-design-system-010-pg …` was **not executed**, because this package has no
database to rehearse anything against. There is no running container, no stopped container and no
port held. This is stated rather than left silent, because a session that quietly skips the teardown
and a session that never needed the container look identical from outside.

## What could NOT be verified from here, stated plainly

1. **No consumer app was run, and no consumer suite was executed.** `bananaworld-dc` is readable and
   was **read only** (its `package.json`, and three greps over `src`); the CRM, RMS, org-admin and
   Manga Verde cannot be read from a build worktree at all. **Ninth change to record this.** Nothing
   in this pack claims otherwise.
2. **No browser was driven.** `happy-dom` does no layout, so the carried **OQ-8** — whether
   `max-width` actually caps a `<td>` under `table-layout: auto` — is **still unverified**. It is
   untouched by this change; the one-click probe still ships at
   `runs/change-08/output/truncate-probe.html`.
3. **The `<td width="…">` attribute is asserted in the DOM, not rendered in a browser.** Its layout
   effect is HTML's own and predates CR-009; the claim measured here is that the package forwards it
   again, which it does.

## What a consumer will see, and when

**Nothing, until it chooses to.** No consumer pin is bumped by this change (project rule;
KI-M001E19-002 — a consumer moves its own pin, in its own change, against the **merged** `main` sha).
And no pinned consumer can currently be running the defective code at all: `selectAll` and `multiple`
did not exist before `3143646` (2026-09-10), and DC pins `6ed975d` (verified at
`bananaworld-dc/package.json:55`), which is CR-008. **No live screen moves when this merges.**
