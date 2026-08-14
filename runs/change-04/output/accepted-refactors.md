# Accepted refactors — CR-DESIGN-SYSTEM-004

> Stage 05. **1 accepted, applied and re-verified.** Everything else considered is in
> `simplification-opportunities.md` with its reason for rejection.

## AR-1 — `rangeLabel(from, to, total)` → `positionLabel(range)`

| Field | Value |
|---|---|
| File | `src/components/TablePagination.tsx` |
| Source of the finding | Stage 05 simplification pass, candidate S-1 |
| Applied | Yes, in this session, before the commit |

### What changed

```diff
-        <span className="font-medium text-fg">{rangeLabel(range.from, range.to, range.total)}</span>
+        <span className="font-medium text-fg">{positionLabel(range)}</span>

-function rangeLabel(from: number, to: number, total: number): string {
-  if (total === 0) return "0";
-  return `${from}–${to}`;
-}
+function positionLabel(range: TablePageRange): string {
+  if (range.total === 0) return "0";
+  return `${range.from}–${range.to}`;
+}
```

`TablePageRange` is now imported as a type alongside `TablePageState` (a four-name import block
instead of a three-name one).

### Why

Two reasons, both small and both real:

1. **Three same-typed positional arguments is an ordering bug with no compiler help.** Swap `from`
   and `to` and TypeScript is perfectly happy while the bar reads `Showing 25–1 of 312`. The range
   object was already at the call site; passing it whole makes the mistake unrepresentable.
2. **The name promised more than it returned.** `rangeLabel` sounds like it produces
   `Showing 1–25 of 312`; it produces `1–25`. `positionLabel` is what it is — and the distinction
   matters here, because the full sentence is deliberately assembled in the JSX so that the visible
   text and the announced text are the same characters (D-10).

### Why it is safe

- **Pure rename plus argument shape.** No behaviour, no branch, no string changed.
- `pnpm typecheck` **clean** afterwards.
- `pnpm test` **235 passed / 13 files** afterwards — including the five specs that assert the exact
  boundary strings (`Showing 1–25 of 312`, `Showing 301–312 of 312`, `Showing 76–100 of 100`,
  `Showing 0 of 0`, `Showing 313–313 of 313`). If the assembled sentence had shifted by one
  character, those fail.
- **Entirely inside a new file.** No existing caller, no export surface, no barrel touched. The
  additive proof is unaffected: `src/` is still `+24 / −0` across the three barrels.

## Not refactored — recorded

No existing file was refactored, tidied or "improved" in passing. `Table.tsx`,
`DataTableToolbar.tsx` and `table-controls.ts` are untouched, deliberately: in an additive-only lane
with four sha-pinned consumers, an opportunistic cleanup of a live shared component is a risk with no
owner and no acceptance criterion. The one cleanup this package is owed — DC's dead private copy of
`table-controls.ts` — belongs to DC's lane (CR-003 seam S-4) and would be a lane violation from here.
