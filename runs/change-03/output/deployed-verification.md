# Deployed verification — CR-DESIGN-SYSTEM-003

**Status: N/A, with the cause stated — an unrecorded N/A would be a skip.**

## 1. Why there is nothing to deploy

`@bananaworld/design-system` is a **source-only, sha-pinned library**. It has no build step, no server,
no deployed instance and no URL. `package.json` publishes `files: ["src"]`; consumers transpile the raw
TypeScript through Next.js `transpilePackages`. Nothing this change contains executes anywhere until a
consuming app moves its pin — **in its own change, against the merged sha on `main`**.

## 2. No database, so no migration and no throwaway Postgres

| Item | State |
|---|---|
| Migration files added | **none** — this package has no database by construction (plan §3, `migrationExpected: false`) |
| `classify-migration.mjs` run | **not run — there is no migration file to classify** |
| `runs/current/migrations-pending/CR-DESIGN-SYSTEM-003.md` | **not written**, correctly: it is required only for an ORANGE migration, and there is no migration |
| Throwaway container `chg-cr-design-system-003-pg` | **never started.** Nothing to rehearse against |
| Left behind | **nothing** — no running container, no stopped container, no port held |

The only persistence anywhere near this change is CRM's `availability_saved_views` row, which lives in
another repo and another database that this package cannot see. It is covered as a **consumer
obligation** (`developer-handover.md` §3), not as a migration here.

## 3. What stands in for a deployed check — five substitute proofs

| # | Proof | Result |
|---|---|---|
| 1 | The seven existing screens rendered in a real DOM (happy-dom, Radix's genuine output) and snapshotted **before** the source edit, then re-run after | Snapshot file hash **unchanged**: `ce7bd849…` |
| 2 | The new control driven **only from the keyboard** through `@testing-library/user-event` — the same event sequence a rep produces | Tab → Enter → ↓ → Space ticks and the menu stays open → Escape closes and focus returns to the trigger |
| 3 | Roles and state read back from the rendered DOM, not from the source | `menuitemcheckbox` × 4 with `aria-checked` flipping per toggle; the All row checked while nothing is chosen |
| 4 | Standalone-build proof | `tsc --noEmit` with no app path alias — an `@/…` import cannot resolve — plus a source scan for `@/` and `bananaworld-` |
| 5 | Barrel proof from the package **root** (`../../src`), not the deep file | Both helpers callable, all six type names nameable |

## 4. What genuinely cannot be checked from here — no claim is made

| Not checked | Why | Who checks it, and when |
|---|---|---|
| The control on a real screen, in a browser, at tablet size | No consuming app is checked out in this lane, and none declares a multi-select yet — **there is no screen to look at** | The first adopting screen's own change |
| The `[[data-surface=tablet]]` step at 14px/56px on real hardware | Same reason. The classes are copied from `SelectTrigger`, which is already proved on the tablet surface | The adopting screen |
| Any DC / CRM / org-admin suite | Those repos cannot be reached from this sandboxed worktree — the same limitation CR-DESIGN-SYSTEM-001 and -002 both recorded | Each consumer's pin bump |
| A saved availability view actually re-opening | The table is CRM's and is invisible from here | CRM's adoption change, test point 7 of `developer-handover.md` §3 |

**Residual risk: LOW.** Nothing renders differently until a screen declares the new kind, and no screen
declares it. The first real-screen verification is owned by the first adopter and is written down for
them rather than left to be discovered.
