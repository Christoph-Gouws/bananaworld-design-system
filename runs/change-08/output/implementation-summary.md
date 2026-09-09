# Implementation summary — CR-DESIGN-SYSTEM-009

> *A grid filter cell holds one value. Let it hold several — and let the grid be read at a compact
> density.*
> Branch `change/cr-design-system-009`, off `main` @ `6ed975d` (CR-DESIGN-SYSTEM-008, PR #20).
> Approved layout **B** · ship mode **on-green**.

## Plan-premise check — done first, as instructed

🔴 **Everything the plan cites in THIS repository is exactly as described**, verified by opening the
files before anything was built: `grid-view.ts`'s "the shapes are ours to state" header at lines
16–18; `Table.tsx`'s one-class-per-axis rule at 100–102, its bare `HTMLAttributes` signature at 69,
`whitespace-nowrap` at 191, `TableCell` with no whitespace class, the `RowValignContext` provider
argument; `GridFilterRow`'s `CELL_BASE`/`CELL_SET` at 66–70 and the one-value menu at 170–188;
`DataTableToolbar`'s `multiSelectTriggerLabel` at 277–288, `MultiSelectItem` at 382–410, the Radix
gotcha comment, the `All depots` row and the `N chosen` footer; `GridHeadCell` rendering a `TableHead`
with `px-2.5`; `ListCard`'s `density` variant. **Nothing had moved.**

⚠ Three of the plan's **`bananaworld-dc`** citations drifted in path or line — `grid-state.ts` is under
`src/lib/reports/`, not `src/components/reports/`, and `appendFilters` is at `:81` not `:88`. **Every
underlying fact holds**, including the load-bearing one: DC's `filterCells` builds all 27 filter defs
with **no `multiple` and no `width`**. Recorded in `known-issues.md` §B; the approved approach was
unaffected, so the build went ahead.

## What was built

### A · A `select` filter cell that holds several values

- **The value shape** (`lib/grid-view.ts`): the `select` arm gained **one optional field**,
  `values?: readonly string[]`. `value: string` stays required and keeps its meaning. A fifth `kind`
  was rejected (27 DC columns would migrate) and so was widening `value` to a union — that one *looks*
  cheapest and is the trap, because DC's `appendFilters` calls `value.value.trim()` and a union breaks
  its typecheck **the moment it bumps its pin**, i.e. a consumer that adopted nothing would be broken
  by adopting nothing.
- **The invariant**, enforced by construction rather than by care: `values` is absent for zero or one
  id; present, it holds two or more in displayed order with `values[0] === value`. `gridFilterSelect`
  is the only constructor, `gridFilterSelected` the only reader — both exported.
- **The wire encoding**, stated in the file header for the consumer's parser to be built to: **a
  repeated parameter** (`f_room=A&f_room=B`). No escaping, no separator to collide with, and one value
  reads identically under `get` and `getAll` — so views already saved to disk keep their meaning.
  Round-tripped through the real `URLSearchParams` in a spec, not asserted in prose.
- **The cell** (`components/GridFilterRow.tsx`): `multiple?: boolean`, default false. Off ⇒ **the
  shipped one-value menu on its original, unedited code path**. On ⇒ a Radix `DropdownMenu` of
  `CheckboxItem`s that stays open across ticks, with the owner's **option C** tri-state "Select all"
  master row carrying `3 of 12`, and the shipped `N chosen` footer.
- 🔴 **No second multi-select was written.** `multiSelectTriggerLabel` and `MultiSelectItem` were
  **moved** out of `DataTableToolbar` into a new internal `components/MultiSelectMenu.tsx` and are now
  the single implementation both surfaces render. `MultiSelectFilterDef` gained
  `selectAll?: "allOption" | "master"`, defaulting to what every shipped toolbar renders today — so
  the grid gets C, nothing else moves, and convergence is a one-word opt-in per consumer instead of a
  promise.

### B · A compact density for the whole table family

Asked **once** on `<Table>` and read by `TableHead`, `TableCell`, `GridHeadCell` and `GridFilterRow`'s
cells through one context. A table that went compact while its filter row did not is unreachable by
construction. `text-sm`→`text-xs`, cells `px-3 py-2`→`px-1.5 py-1`, filter boxes `h-7`→`h-6`, header
chrome scaled with them — **≈24px rows against today's ~36–44px**. `TableRow` and `TableHeader` take
no class, deliberately: a row's height *is* its cells' padding, and a second class on that axis is the
silent override the file's own rule forbids. **No new design token.**

### C · Values on one line, cut at a per-column width (the owner's layout **B**)

`wrap?: "wrap" | "nowrap" | "truncate"` and a named three-step scale — `narrow` 6rem / `medium` 11rem /
`wide` 20rem, plus `full` for "never cut me" — declared per column and passed to all three of a
column's rows. A ceiling, not a fixed width, so a date column still shrinks to its content and the
report does not become a grid of equal boxes. A cut value is recoverable on hover when the cell's
children are a plain string.

🔴 **Every one of the four options is opt-in and defaults to today.** `density="default"`,
`wrap="wrap"`, uncapped columns, `selectAll="allOption"`, no `multiple`.

## Proof, not assertion

| | |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **363 passed / 17 files** (baseline **re-measured before any edit: 314 / 17**) |
| New specs · existing specs edited · reddened | **+49** · **0** · **0** |
| 🔴 **Byte-identity, measured** | **1,972 caller shapes** rendered against `git show 6ed975d:` and against these components, whole `innerHTML` compared — **0 differences** |
| 🔴 **The seven shipped toolbar screens** | whole-DOM snapshot, **zero-line diff** — the extraction moved nothing |
| Mutation battery | **8 run, 8 caught**, every restore verified byte for byte |
| Quality sensors | **0 open findings**, 5 justified, 0 weak |
| Named callers checked | `qa-report.md` §3 — DC re-read this session, read-only |
| Migration · Postgres | none · **never started, nothing left behind** |

## Deviations from the plan's letter — both disclosed, neither behavioural

1. **One `TableLayoutContext` carrying `{density, wrap, columnWidth}`**, where §B.1/§C.3 sketch two
   private contexts. The exported surface — `useTableDensity`, `useTableWrap`, the three props — is
   identical; one record is less machinery for the same result.
2. **A ninth source file**, `src/lib/table-controls.ts`, because `MultiSelectFilterDef` lives there and
   not in `DataTableToolbar.tsx` as §3 implied.

## 🔴 Why there is no pull request

**The change is complete, green and additive. It is not mergeable today, for a reason that is not
its own.** Three high/critical advisories published **2026-09-08** — two unauthenticated Next.js RCEs
and a `sharp` high — sit in the production closure CI audits, and `pnpm audit --prod --audit-level=high`
will fail. `package.json` and `pnpm-lock.yaml` are byte-identical to `main`, so **`main` fails the same
audit right now.**

The remedy is inside the already-declared `^15.0.0` peer range and clears all three
(`next` ≥ 15.5.24 pulls `sharp` ≥ 0.35.4; verified — zero high/critical remain). But every
lockfile-writing command is permission-blocked in this worktree, and the alternative — ignoring two
RCEs — is not a change's call. **Escalated as `NEEDS_OWNER: decision`** with a plain-English card at
`runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`. The work is committed and pushed on the
branch; nothing is lost, and the resumed session picks up from the owner's answer.

## What the owner will see when this eventually lands

**Nothing, yet — and that is the lane rule working, not a shortfall.** This ships a capability. The
report opens smaller only after this merges, **DC bumps its pin to the merged `main` sha** (never a
branch sha — KI-M001E19-002), and DC passes `density="compact"`, `wrap="truncate"`, a `width` per
column and `multiple` on its filter cells, moving its query writer to `append`/`getAll`. That is DC's
own change, its own gate. The report's **width** (`max-w-[1440px]`) is DC's too, and was never in this
one.
