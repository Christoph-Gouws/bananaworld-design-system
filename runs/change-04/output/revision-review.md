# Revision review — CR-DESIGN-SYSTEM-004

> Stage 05. Reviews exactly the files listed in `changed-files.md`, against the owner-approved plan
> `runs/current/logic-plan/CR-DESIGN-SYSTEM-004.md` (revision 2) — the contract, not what I would
> have designed.

## 1. Plan clauses — built, clause by clause

**21 clauses checked · 21 built · 1 deviation, recorded below · 0 unbuilt.**

| # | Plan clause | Built? |
|---|---|---|
| 1 | §3.1 `TABLE_PAGE_SIZES = [25, 50, 100, 200] as const` | ✅ verbatim |
| 2 | §3.1 `TablePageState { page, pageSize }` | ✅ |
| 3 | §3.1 `TablePageRange` with all nine fields, `readonly` | ✅ every field, same names, same meanings |
| 4 | §3.1 `pageCount = max(1, ceil(total / pageSize))`, never 0 | ✅ |
| 5 | §3.1 rules table — the six clamping cases | ✅ all six, each with its own assertion |
| 6 | §3.1 🔴 clamping renders, never calls back (D-7) | ✅ no effect, no callback; pinned by a no-callback-on-mount spec |
| 7 | §3.2 `TablePaginationProps` — the seven props, exactly as typed | ✅ verbatim, including the doc comments |
| 8 | §3.2.1 one component, two placements — not two exports, not a table wrapper (D-18) | ✅ |
| 9 | §3.2.1 `placement` defaults to `"top"` | ✅ |
| 10 | §3.2.1 🔴 exactly one live region — `role="status"` on the top bar only (D-19) | ✅ asserted by count across both bars |
| 11 | §3.2.1 each bar is a `<nav>` with its own accessible name | ✅ `List paging` / `List paging, end of list` |
| 12 | §3.2.1 the picker renders in the top bar **only** (D-20) | ✅ asserted by absence |
| 13 | §3.2 one callback emitting a complete pair (D-5) | ✅ |
| 14 | §3.2 changing the size returns to page 1 (D-6) | ✅ |
| 15 | §3.2 composition table — Radix `Select` picker, `Button` arrows, `<p role="status">`, `<nav>` bar | ✅ all four rows |
| 16 | §3.2 the four range strings, en dash, `tabular-nums` | ✅ all four asserted literally, plus the single-row last page |
| 17 | §3.2 disabled arrows: first→Previous, last→Next, total 0→both | ✅ |
| 18 | §3.2 no `variant` prop; `placement` is the layout, not a style choice (D-13) | ✅ no `variant` exists |
| 19 | §3.3 **layout A** — count left, picker + arrows right, arrows bottom right | ✅ matches `option-a.html` |
| 20 | §6 five files, two new and three barrel appends; §6.1 the exact export blocks | ✅ five files, `+24 / −0` |
| 21 | §6.2 the seven files deliberately not touched | ✅ none touched |

### 1.1 The one deviation — a test path, recorded not hidden

The plan puts the arithmetic spec at **`tests/lib/table-paging.test.ts`**. `vitest.config.ts` globs
only `tests/pricing/**`, `tests/sales-order/**` and `tests/components/**/*.test.tsx` — a file at that
path **would never have run**, and the suite would have gone green with sixteen specs silently
absent. The plan also lists `vitest.config.ts` as a file not to touch.

The repo already answers this: `table-controls.ts` is a `src/lib` module and its suite lives at
`tests/components/table-controls.test.tsx`. I followed that precedent —
**`tests/components/table-paging.test.tsx`**. Same specs, same coverage, no config edited.
`known-issues.md` A-1.

### 1.2 Option (a) vs (b) — the plan's own open question, and how it was answered

Plan §2 states: *"This plan is written to do option (a). The owner may choose (b) at the gate."* The
owner's recorded response is **plan APPROVED (layout A)** with no instruction to switch. Option (a)
is therefore what was built: `DataTableToolbar.tsx` and `table-controls.ts` are untouched, and the
trap is answered by the written contract in the three places §2a names. **(a) and (b) are not mixed
anywhere** — there is no half-controlled toolbar, no partial emit, no unused mode flag.

## 2. Review dimensions

| # | Dimension | Finding |
|---|---|---|
| R-1 | **Does it do what the owner approved, and only that?** | Yes. Layout A as drawn; option (a) as written; nothing beyond §6's five files |
| R-2 | **Is the additive claim real or asserted?** | Real and cheap to check: `+24 / −0`, zero deletions, zero modified lines, snapshot hash unmoved, 189 existing specs unedited |
| R-3 | **Is the accessibility work load-bearing or decorative?** | Load-bearing and asserted. The live-region **count**, the accessible-name-equals-visible-text check, the tab order across both bars and the disabled-arrow skip are all specs, not comments |
| R-4 | **Is anything hand-rolled that Radix should own?** | No. The picker is this package's Radix `Select`, unchanged. Radix ships no pagination primitive, so nothing was replaced. Zero hand-written roles, zero key handlers |
| R-5 | **Could a consumer misuse this in the way the request feared?** | Yes — that is option (a)'s stated cost, not a defect. It is written into the source, the handover and the debt file, in the plan's own words |
| R-6 | **Is there dead code, an unused prop, or a hook for a future feature?** | No. Every prop is read; every exported name is used by a spec; no page-size memory, no jump-to-page, no `variant`, no `mode` |
| R-7 | **Does any artefact claim a speed improvement?** | No. Checked by search across the pack: no artefact claims one, and `test-results.md` §8 records that nothing measuring speed was run (D-1) |
| R-8 | **Would a reviewer with only the diff be able to believe the claim?** | Yes, and that is the design: the proof is the diff |

## 3. Over-build temptations declined

| # | Temptation | Declined because |
|---|---|---|
| O-1 | A page-number list (`1 2 3 … 13`) | Not asked for. Two arrows and an honest count are the brief |
| O-2 | Jump-to-page input | Same. And it would need its own validation, its own clamping message and its own keyboard story |
| O-3 | Remembering the chosen page size | **Explicitly out of scope** (D-14). Raised as a question at the gate instead |
| O-4 | A `variant` prop shipping all three mockup layouts | Anticipatory configurability; Stage 05 would take it straight back out. One layout was approved and one was built (D-13) |
| O-5 | Giving `DataTableToolbar` a right-hand slot for the picker | Would edit the most-depended-upon component in the package — 11 call sites, three apps — to achieve what right-alignment achieves for free (D-21) |
| O-6 | A `TablePaginatedTable` wrapper taking the table as `children` | Puts a shared primitive in the business of laying out its neighbour, and forks `Table` in all but name (D-18) |
| O-7 | Auto-correcting a stale page via `useEffect` | A re-render loop and a lie about who owns the state. The **absence** of it is pinned by a spec (D-7) |
| O-8 | Emitting `onPageChange` and `onPageSizeChange` separately | Lets a consumer reach an unrenderable state. One callback makes it unrepresentable (D-5) |

## 4. Verdict

**PASS.** Built to the approved plan, layout A as drawn, option (a) as written, one deviation recorded
with its cause. `pnpm typecheck` clean · `pnpm test` **235 / 235** · `src/` **+24 / −0** · 0 open
defects.
