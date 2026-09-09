# Active unit — `bananaworld-design-system`

> This is a FILE, not a unit folder. It records what is currently in flight.
> Updated 2026-09-09.

## Current: CR-DESIGN-SYSTEM-009 — **BUILT, GREEN, CLOSED OUT, PR OPEN · CI audit cause fixed**

| Field | Value |
|---|---|
| Unit type | **Change Request** — archived to `runs/change-08/`. Not an epic, not a milestone |
| Id | **CR-DESIGN-SYSTEM-009** |
| Title | A grid filter cell holds several values, and the grid reads at a compact density |
| Branch | `change/cr-design-system-009`, off `origin/main` @ `6ed975d` (CR-008, PR #20) |
| Approved layout | **B** — three column width steps, per column (D-7) |
| Ship mode | **on-green** |
| Build status | **Complete.** `pnpm typecheck` clean · `pnpm test` **363 passed / 17 files** (baseline **re-measured before any edit: 314 / 17**) · **+49 specs, 0 existing edited, 0 reddened** · **0 open defects** · `src/` +763 / −90 across 10 files |
| Additive proof | **1,972 caller shapes** rendered against `main@6ed975d` and diffed on whole `innerHTML` — **0 differences**; the seven shipped toolbar screens' DOM snapshot **zero-line diff**; **8 mutations run, 8 caught**; quality sensors **0 open findings** |
| PR | **#22 open.** CI refused the first push on `dependency-audit`; that cause is fixed — see below |
| Remaining | **Nothing owed.** The conductor polls CI and merges on green. One non-blocking housekeeping follow-up: 4 now-inert `ignoreGhsas` entries |

### What it did

Four **strictly opt-in** additions, every one defaulting to today's behaviour:

- **A — a `select` filter cell may hold SEVERAL ids.** `multiple` turns it into a Radix tick-list that
  **stays open** while ticking, with the owner's option **C** tri-state "Select all" carrying `3 of 12`.
  The value gained **one optional field** (`values?`) — no fifth `kind`, and `value` was **not** widened
  to a union (that breaks DC's typecheck the moment it bumps its pin). The wire encoding is a
  **repeated parameter**, stated in `lib/grid-view.ts`'s header.
- **B — a `compact` density**, asked once on `<Table>` and reaching the head, the filter row and the
  body together. ≈24px rows against ~36–44px. **The package default does not move.**
- **C — values stay on one line**, cut with a "…" and recoverable on hover (`wrap`).
- **D — a named three-step per-column width** (`narrow`/`medium`/`wide`/`full`) — layout **B**, so a
  customer name is given more room than a reference code. A **ceiling, not a fixed width**.

🔴 **No second multi-select was written.** `multiSelectTriggerLabel` and `MultiSelectItem` were
**moved** out of `DataTableToolbar` into `components/MultiSelectMenu.tsx` and now serve both surfaces;
`selectAll` defaults to the row every shipped toolbar renders today.

### ✅ Why CI went red, and what cleared it

Three advisories published **2026-09-08** — two **critical unauthenticated Next.js RCEs**
(`GHSA-2xp9-vwfh-vxw4`, `GHSA-p293-qw3h-jr36`) and one high on `sharp` (`GHSA-rgj7-g3m4-5g8c`) — failed
CI's `dependency-audit` job on PR #22. **Not caused by this change:** `package.json` and
`pnpm-lock.yaml` were **byte-identical to `main`**, which failed the same audit.

**The owner answered the card: option A** — take the repaired versions, nothing on the ignore list.
✅ **Executed (D-11, superseding D-10):** two `pnpm.overrides` floors (`next@<15.5.24` → `^15.5.24`,
`sharp@<0.35.4` → `^0.35.4`) re-resolved with `pnpm install --lockfile-only` → **next 15.5.25, sharp
0.35.4**. Audit closure re-measured **3 blocking → 0**, validated first against CI's own published
pre-fix numbers. `pnpm install --frozen-lockfile` / `typecheck` / `test` **363/363** green.

🔴 `sharp` needed its own floor — next's widened `^0.34.3 || ^0.35.4` range left the locked 0.34.5 in
place, so the `next` bump alone did not clear it. `peerDependencies` untouched, so no consumer moves.

### Also open, not blocking

**OQ-8** — whether the `max-width` cap holds on a `<td>` under auto table layout — **could not be
verified**: no browser binary is executable from this sandbox. A ready-to-run probe ships at
`runs/change-08/output/truncate-probe.html`; the named fallback is recorded and untaken.

## Previous units

- **CR-DESIGN-SYSTEM-008** — the grid controls: sort in the header, group in a strip, filter under the
  headers. Merged as `6ed975d` (PR #20). ⚠ **It has no decision-log entry** — the log jumps 007 → 009.
- **CR-DESIGN-SYSTEM-007** — a row's valign is a default for its cells. `runs/change-07/`; `54597ac` (#18).
- **CR-DESIGN-SYSTEM-006** — a row of fields can line up along the top. `runs/change-06/`; `ce47010` (#17).
- **CR-DESIGN-SYSTEM-005** — the depot slot's label. `runs/change-05/`; `fc6f6c6` (#15).
- **CR-DESIGN-SYSTEM-004** — a shared paging control. `runs/change-04/`; `0633476` (#14).
- **CR-DESIGN-SYSTEM-003** — a toolbar filter may hold several values. `runs/change-03/`; `fc2c5b8` (#13).
- **CR-DESIGN-SYSTEM-002** — the document header. `runs/change-02/`; `9aa20f7` (#10/#11).
- **CR-DESIGN-SYSTEM-001** — ChoiceGroup swatch + accessible name. `runs/change-01/`; `365be65`.

## No epic is in flight

`runs/epic-020/` is pre-existing and closed. CR-DESIGN-SYSTEM-009 created **no** `runs/epic-NN/`
folder, **no** `milestone-NN/` folder, and nothing under `runs/current/epic-plan/`.

## Next units (not started; most are not in this repository)

1. **Retire the 4 now-inert `ignoreGhsas` entries** — a small standalone housekeeping change, the
   owner's call. **Non-blocking**; deliberately not folded into the CI fix (`known-issues.md` §A).
2. 🔴 **DC's half of this change — a separate CR.** Bump the pin to the **MERGED `main` sha** (never a
   branch sha, KI-M001E19-002), then pass `density="compact"`, `wrap="truncate"`, a `width` per column
   and `multiple` on its filter cells, and move its query writer to `append` / `getAll`.
   ⚠ **DC must opt its CHIP columns (`ColourStageCell`, `DrillCell`) to `wrap="nowrap"`** or
   `overflow:hidden` clips them — it will look like a bug in this package and will not be.
   ⚠ **The width must reach all THREE of a column's rows**; wiring two of three defeats the cap silently.
3. **DC's report WIDTH** (`max-w-[1440px]`) — the other half of the owner's ask, DC's own lane.
4. **`selectAll: "master"` in DC and the CRM** — converges the two tick-lists (`technical-debt.md` TD-1).
5. Carried, unaffected by this change: the CRM's pin bump + `dcLabel` (CR-005, unblocking CR-CRM-015,
   blocked since 2026-08-18); DC's pin bumps for CR-002/CR-004 then CR-DC-052; the CRM's seven-point
   saved-view obligation (CR-003); CR-001's colour-stage chips; **DC's dead private copy of
   `src/lib/table-controls.ts`** that nothing in DC imports.
6. **org-admin / RMS / Manga Verde** — nothing required. Every option is opt-in; their tables are
   byte-identical whether they bump or not. Their repositories **cannot be read from a build worktree**
   and no claim is made about them.
