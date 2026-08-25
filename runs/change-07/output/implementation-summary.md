# Implementation summary — CR-DESIGN-SYSTEM-007

> Review follow-up on CR-DESIGN-SYSTEM-006. One finding, F1. Built to the owner-approved plan
> `runs/current/logic-plan/CR-DESIGN-SYSTEM-007.md`, layout **A**, ship mode **on-green**.

## 1. 🔴 The plan's premise was re-verified against the code as it is now — everything still as described

The plan's facts were read when it was written; this session started from a fresh copy of `main` that
may have moved. Every file, function and line the plan **cites** was spot-checked before any edit:

| The plan cites | Found | Verdict |
|---|---|---|
| `Table.tsx:249` — `const askedForValign = resolvedValign !== undefined;` | present, verbatim, at line **249** | ✅ unchanged |
| `Table.tsx:246-249` (the four-line resolution block) | verbatim | ✅ unchanged |
| `Table.tsx:255-258` / `:265` (the two emission positions) | verbatim | ✅ unchanged |
| Branch point `main @ ce47010` | `git rev-parse HEAD` = `ce470103e657d016e0dfe40ae63d9f38fa414df7` | ✅ exact |
| T-6 at `Table.test.tsx:274-302`, 80 combinations, every cell in a **plain** row | exact | ✅ the gap is real |
| T-7 `:304-315`, T-8 `:317-329` — both cell-only, plain row | exact | ✅ |
| T-11 `:379-389` — cell prop vs row prop, opt-out uses the **prop**, never `className` | exact | ✅ |
| T-12's two exact-string assertions at `:417-418` | exact | ✅ |
| DC pin `bananaworld-dc/package.json:54` = `0633476…` (CR-004's sha) | exact | ✅ |
| `SalesOrderForm.tsx:1024-1026` hand-rolls `<td>` with `align-top` | exact | ✅ |

**Nothing moved. No premise changed shape.** The finding was confirmed present, not taken on the
reviewer's word — and the fix went ahead on that basis.

## 2. F1 — confirmed real, and why

`askedForValign` was computed from `resolvedValign`, which has **already absorbed the row's answer**.
So a row-sourced value took the *asked* path and was emitted at position (B), after `className`.
`cn` is `twMerge(clsx(...))` and twMerge keeps the last of a conflicting pair, so a row-level
`valign` silently beat a cell's own vertical-align utility written in `className`:

```
<TableRow valign="top"><TableCell className="align-middle">
  main: px-3 py-2 text-left align-top      ← the cell's align-middle was dropped
  now : px-3 py-2 text-left align-middle   ← fixed
```

That inverts **D-6** ("precedence is cell > row > default — the more specific answer wins"). A
`className` utility is a **cell-level** answer; before CR-006 it was the *only* way to write one,
which is exactly why **D-2** pinned the default's position to preserve it.

## 3. The fix — one predicate

`askedForValign` must mean *"the cell itself asked"*, not *"anybody asked"*:

```diff
-  const resolvedValign = valign ?? rowValign;
-  const vertical = valignClass(resolvedValign);
-  const askedForValign = resolvedValign !== undefined;
+  const vertical = valignClass(valign ?? rowValign);
+  const cellAskedForValign = valign !== undefined;
```

Both emission positions keep their places, re-keyed on the new predicate. Resolution is unchanged, so
a row still answers for cells that express nothing of their own. **Exactly one vertical class on
every path**, in exactly one of two positions — the invariant D-3 set and T-6 guards.

Final precedence, now stated in the file header and both doc-comments:
**cell `valign` prop > cell `className` > row `valign` prop > the `"middle"` default.**

## 4. What was built

| File | Change |
|---|---|
| `src/components/Table.tsx` | **+31 / −13.** The predicate, its comment, the two emission comments, the precedence sentence in both `valign` doc-comments and the file header |
| `tests/components/Table.test.tsx` | **+155 / −0.** A new **§8** with six specs (T-17 … T-22). **No existing spec edited** |

**No other file.** All three barrels byte-identical (`git diff --cached --stat` on them is empty).
`package.json` / `pnpm-lock.yaml` untouched — no dependency. No consumer file, no consumer pin.

## 5. Verification headline

| Gate | Result |
|---|---|
| `pnpm typecheck` | **clean** |
| `pnpm test` | **269 passed / 14 files** (baseline re-measured before any edit: **263 / 14**) |
| New specs | **6**; **0 existing specs edited**; all 17 existing specs green |
| Mutation checks | **5 run, 5 caught** |
| Byte-identity | **1,536 shapes** rendered against `main@ce47010` and against this component, whole `innerHTML` diffed — **byte-identical, no output** |
| Group-3 measurement | **576 shapes**; 456 identical, 72 class-ORDER-only, **48 rendering changes — every one exactly the defect's shape** |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new, 0 blocking**; id parse proven sound |
| Migration | **none** — this package has no database by construction |
| Throwaway Postgres | **never started**; nothing left behind |

Detail in `test-results.md`; scope and residuals in `known-issues.md`.

## 6. Scope fences held

1. **One finding, F1.** Nothing else fixed, tidied or refactored on the way past — including
   CR-006's below-the-bar findings.
2. **No consumer pin bumped, no consumer file touched.** The DC worktree was **read only**.
3. **This is a CHANGE.** One unit, `runs/change-07/`. No `runs/epic-NN/`, no `milestone-NN/`,
   nothing under `runs/current/epic-plan/`. CR-006's archive was **cited, never edited**.
