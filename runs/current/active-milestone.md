# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-08-14.

## Current: CR-DESIGN-SYSTEM-002 — **CLOSED OUT, PR #10 open and GREEN, awaiting merge**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-02/`. Not an epic, not a milestone. |
| Id | **CR-DESIGN-SYSTEM-002** |
| Title | The document header moves into the shared package, so two apps wear one header instead of two copies that drift |
| Branch | `change/cr-design-system-002`, off `origin/main` @ `365be65` |
| Approved layout | **n/a — not UI-bearing** (D-9: defined by byte-identical rendering) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` 115 passed / 9 files · 0 open defects · 34 insertions / **0 deletions** in `src/` |
| CI | **All five PR #10 checks green** on `13d90bb` — Typecheck · Test · Dependency Audit · Semgrep CE · Gitleaks |
| Remaining | **Nothing in this lane.** Owner decision **D-12 is answered** (2026-08-14): the two `nanoid` advisories that refused PR #10 — unrelated to the header work — were cleared by a `pnpm.overrides` bump to `nanoid@3.3.18`, **not** by a seventh `ignoreGhsas` entry. Applied as `13d90bb`. The conductor merges. |

## Previous unit

**CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. Archived to `runs/change-01/`;
merged to `main` as `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-002 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next unit (not started, and not in this repository)

**Bananaworld-DC's adoption change:** bump DC's pin against the **merged `main` sha** (never a branch
sha), re-point its imports, delete DC's local copy of the component — and expect **five assertions in
`tests/contract/transaction-form-standard.test.ts` to go red by design** (line 889 exists to assert
this move had not happened). Full instructions: `runs/change-02/evidence/developer-handover.md` §3.

Then `CR-CRM-document-header-parity` in the crm lane, which this change unblocks.
