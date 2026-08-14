# Readable-code scorecard — CR-DESIGN-SYSTEM-004

> Stage 05. Scored over exactly the files in `changed-files.md`.
> **Overall: 12 / 12 PASS.** Two weak points are stated honestly at the end rather than trimmed away.

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **Names say what the thing is** | PASS | `tablePageRange`, `TablePageState`, `TablePageRange`, `TABLE_PAGE_SIZES`, `TablePaginationPlacement`, `positionLabel`, `wholeNumberAtLeast`. `PageRange` was deliberately not used — `TablePageRange` is unambiguous at a package root shared by four apps. `positionLabel` was renamed from `rangeLabel` in Stage 05 precisely because the old name promised the whole sentence |
| 2 | **A reader can find the logic without running it** | PASS | The repo's own split is honoured: arithmetic in `src/lib/table-paging.ts`, React skin in `src/components/TablePagination.tsx` — the same shape as `table-controls.ts` under `DataTableToolbar.tsx`. The nine-field `TablePageRange` is documented field by field |
| 3 | **Functions are small and do one thing** | PASS | Three functions in the lib file (one exported, one helper, plus the interface block); one component plus one helper in the tsx. `tablePageRange` is 20 lines and has one `if`-free body — every clamp is a named expression |
| 4 | **No cleverness where plain code would do** | PASS | `Number.isInteger` as the single junk predicate; `Math.max`/`Math.min`/`Math.ceil` and nothing else. No bit tricks, no chained ternaries, no regex |
| 5 | **Comments explain *why*, not *what*** | PASS | Every comment answers a "why would you do that?": why `offset` is on the range, why clamping never calls back, why one live region, why the picker is top-only, why `Showing 312–312 of 312` is left literal, why the trigger names its own value |
| 6 | **The dangerous thing is fenced where someone will hit it** | PASS | The consumer obligation — server paging must not use `useTableControls` — is a 🔴 block at the top of `TablePagination.tsx`, the same idiom this repo already uses for the `onSelect` gotcha and the `hasActiveControls` arm. It is where a build session opening the file will read it, not only in a document |
| 7 | **Types carry the constraints** | PASS | Every prop and every range field is `readonly`. `TablePaginationPlacement` is a two-member union, so an invalid placement is a compile error. One callback taking a complete `TablePageState` makes an inconsistent page/size pair unrepresentable |
| 8 | **No dead code, unused prop, or hook for a future feature** | PASS | Every prop is read; every exported name is exercised by a spec; no `variant`, no `mode`, no storage, no jump-to-page |
| 9 | **Errors and edges are handled where they arise** | PASS | Six junk-input cases clamp in one place rather than at each call site, and none throws. `pageCount` is never 0, so no caller needs an "empty list" branch |
| 10 | **Tests read as a specification** | PASS | `describe` blocks name the behaviour (*"the last page shows the REMAINDER honestly and is never padded"*, *"exactly one live region per list"*), and the four 🔴 specs say in their titles what regression they exist to stop |
| 11 | **Consistent with the house style** | PASS | `"use client"`, `cn(...)` composition, `: ReactElement` returns, `readonly` props, the `<label>`+caption Radix idiom, `[[data-surface=tablet]_&]` inherited from `Select`/`Button` rather than re-declared. No new dependency, no new token, no second idiom |
| 12 | **A newcomer can change it safely** | PASS | The three rules a newcomer would most plausibly break — add a second live region, add a picker to the bottom bar, add a self-correcting callback — are each fenced in the source **and** pinned by a spec that fails loudly |

## Weak points, stated rather than trimmed

**W-1 — comment density in `TablePagination.tsx` is high (roughly 40 of 178 lines).** Most of it is
the fenced consumer-obligation block at the top. That block is doing real work: under option (a) the
package cannot *enforce* the contract, so prose in the file a consumer opens is one of only three
places the trap is stated at all. Trimming it would make the file look tidier and the change less
safe. Left as is, deliberately.

**W-2 — `TablePageRange` returns nine fields, and a caller typically uses four.** `offset` is required
by D-12; `isFirst`/`isLast` were considered for removal in Stage 05 (S-2) and kept, because computing
them at the call site would use the caller's *unclamped* page and reintroduce the stale-page bug. The
alternative — a smaller range plus per-caller arithmetic — is more code in more places, and each copy
can be wrong.

## Line counts

| File | Lines |
|---|---|
| `src/components/TablePagination.tsx` | 178 |
| `src/lib/table-paging.ts` | 83 |
| `tests/components/TablePagination.test.tsx` | 393 |
| `tests/components/table-paging.test.tsx` | 167 |

Both source files are comfortably under the package's largest existing modules
(`DataTableToolbar.tsx` at 449, `table-controls.ts` at 296), and neither needed splitting.
