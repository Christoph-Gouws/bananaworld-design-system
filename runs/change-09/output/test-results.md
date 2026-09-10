# Test results — CR-DESIGN-SYSTEM-010

> Stage 04. Every number below was produced by running the command named beside it in this session, in
> this worktree. Nothing is estimated.

## 1. The gates

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** |
| Suite | `pnpm test` | **377 passed / 17 files** — baseline **re-measured before any edit: 363 / 17** |
| Net new specs | — | **+14** (`363 → 377`) · **6 existing specs rewritten, 5 of them because they asserted the defect** (see §3) · **0 reddened** |
| Byte-identity | the harness in §4 | **9,936 caller shapes, 0 differences** + **4 deliberate differences**, each asserted in the repaired direction |
| Seven shipped toolbar screens | `DataTableToolbar.test.tsx.snap` | **zero-line diff** |
| Mutation battery | `node runs/change-09/output/mutation-battery.mjs` | **10 run, 10 caught, 0 skipped**, every restore byte-exact |
| Quality sensors | `quality-sensors.mjs` | **0 open findings**, 4 justified, 0 weak |
| Dependency audit | `pnpm run audit:deps` | **exit 0 — 0 blocking** (4 found: 2 moderate, 2 high, both high on the standing owner-approved ignore list) |
| Lint | — | ⚠ **there is no `lint` script and no ESLint config in this repository.** Pre-existing (CR-009 handover point 14), out of this change's lane, and stated rather than claimed as run. |
| Migration | — | **None.** This package has no database by construction. `migrationExpected: false`. |
| Throwaway Postgres | — | **never started; nothing left behind.** No container was created, so `chg-cr-design-system-010-pg` does not exist. There is nothing for this package to prove against a database. |

## 2. Acceptance criteria → verdict

The contract is the approved plan. Each of its three findings, and each of §2's claims.

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| AC-1 | **F1 confirmed against the code as it is now**, before any fix | `implementation-summary.md` §1 — `GridFilterRow.tsx:284/289/293/343` read in the current source; all four citations exact | ✅ |
| AC-2 | **F2 confirmed**, in both surfaces | `DataTableToolbar.tsx:399`, `GridFilterRow.tsx:326` — exact | ✅ |
| AC-3 | **F3 confirmed**, and confirmed BY COMPILING | a probe declaring `<TableCell width={120}>` was typechecked against the pre-change source: `error TS2322: Type 'number' is not assignable to type 'TableColumnWidth \| undefined'`. `git show 6ed975d:src/components/Table.tsx` contains **no `width` at all**, so the prop was inherited and legal before CR-009. Plan OQ-2 also settled: `(string & {})` compiles under this repo's TS config; the `\| string` fallback was not needed | ✅ |
| AC-4 | The grid's tick-list **counts stored values, not matched options** | `Grid.test.tsx` — "counts it on the trigger and in the footer" (`Cold room 1 +1` / `2 chosen` / `2 of 3`) | ✅ |
| AC-5 | A cell holding **only** retired ids reads as **SET**, not as its placeholder | `Grid.test.tsx` — "READS AS SET even when EVERY stored id has been retired" (asserts `border-info`) | ✅ |
| AC-6 | A tick **keeps** an id the options no longer offer, in both surfaces | `Grid.test.tsx` "KEEPS IT THROUGH THE NEXT TICK"; `DataTableToolbar.test.tsx` "DOES NOT DELETE IT WHEN A THIRD DEPOT IS TICKED" | ✅ |
| AC-7 | "Select all" **clears** rather than committing every id | `Grid.test.tsx` "CLEARS THE FILTER RATHER THAN COMMITTING EVERY ID" (`onChange` receives `{}`) | ✅ |
| AC-8 | 🔴 **The blank-valued row SURVIVES the gesture** | `DataTableToolbar.test.tsx` — `visibleRows()` includes `"—"` after the master tap. This is the exact assertion CR-009 had inverted | ✅ |
| AC-9 | 🔴 **"Clear" stays OFF after it** | `DataTableToolbar.test.tsx` "LEAVES 'Clear' OFF" | ✅ |
| AC-10 | The grid writes **no wire parameter** rather than N repeats | `onCommit([])` → `gridFilterSelect([])` → `null` → `gridFilterSet` drops the key; asserted as `onChange({})` | ✅ |
| AC-11 | Owner's layout **A**: ticked + `All N` unset, dash + `N of M` partial, ticked + `N of M` full | `Grid.test.tsx` ×2 and `DataTableToolbar.test.tsx` ×2; `aria-checked` asserted at every step | ✅ |
| AC-12 | Ticking every option **by hand** still excludes blank rows, and reads differently | `DataTableToolbar.test.tsx` "TICKING ALL THREE BY HAND IS A DIFFERENT STATE" — `3 of 3`, `["Cape Town","Durban","Johannesburg"]`, Clear **on** | ✅ |
| AC-13 | `width={120}` typechecks **and reaches the DOM** | `Grid.additive.test.tsx` — `<td width="120">`; and the byte-identity harness's F3 case shows the two markups are identical once that one attribute is stripped | ✅ |
| AC-14 | `width="wide"` still caps and forwards **nothing** | `Grid.additive.test.tsx` — `max-w-[20rem]`, `hasAttribute("width") === false` | ✅ |
| AC-15 | `TableHead` is **not** widened | asserted by omission and by `Table.test.tsx` staying untouched and green; `ThHTMLAttributes` verified in `node_modules/@types/react/index.d.ts:3553-3560` to declare no `width` | ✅ |
| AC-16 | **Every existing caller renders byte-identically** | §4 — 9,936 shapes, 0 differences | ✅ |
| AC-17 | **No export surface moved** | `src/components/index.ts` and `src/lib/index.ts` are untouched; `MultiSelectMenu` is internal and not barrelled | ✅ |
| AC-18 | **Radix** — no interactive control hand-rolled | the master row is still `DropdownMenu.CheckboxItem` with Radix's own `checked="indeterminate"` → `aria-checked="mixed"`; the change removes a prop from it and adds none of its own markup | ✅ |
| AC-19 | `table-controls.ts` **not touched** — the engine is right | `changed-files.md`; `revision-review.md` §"deliberately not changed" | ✅ |
| AC-20 | No consumer pin bumped | no consumer file exists in this worktree to bump; `package.json` unchanged | ✅ |
| AC-21 | Dependency audit clean | §1 — exit 0 | ✅ |

## 3. 🔴 Six existing specs were rewritten — five of them because they asserted the defect

Called out here because "a spec was edited to make the build pass" is the failure mode this looks like
from a distance, and it is not what happened. **The assertions themselves were what CR-009 got wrong.**

**Five reddened against the fixed code** — they are the table below. **A sixth was rewritten without
having failed:** `Grid.test.tsx`'s `🔴 CLEARS EVERYTHING ON THE SECOND TAP — 'Select all' and 'Clear'
are ONE row, not two`. Its assertion (`onChange` receives `{}` after two taps) still holds, but its
*premise* does not: the row can no longer narrow, so there is no second tap to reverse anything. It
became `a SECOND tap is a no-op`. Leaving it would have been a spec that passes for a reason it does
not state.

| Spec | What it asserted | Why it was wrong |
|---|---|---|
| `DataTableToolbar.test.tsx` — `"master" swaps that one row…` | the master row reads `Select all0 of 3` and `aria-checked="false"` when nothing is chosen | under layout A the tick means "nothing is being hidden", which is exactly the nothing-chosen state |
| `DataTableToolbar.test.tsx` — `READS 'mixed' … takes everything on the next tap` | after the master tap `visibleRows()` is `["Cape Town","Durban","Johannesburg"]` — **the `"—"` row absent** — and returns only on a SECOND tap | the disappearance of the blank-valued row is **written into the spec** at what was line 499. It is F2, asserted as correct |
| `Grid.test.tsx` — `SAYS 'N of M' …` | `aria-checked="false"` / `0 of 3` unset | same as row 1 |
| `Grid.test.tsx` — `takes EVERYTHING in one tap` | `onChange` receives all three ids | F2 in the grid — and it also writes three repeated parameters into the URL and the saved view |
| `Grid.test.tsx` — `a MIXED master row takes everything` | `onChange` receives all three ids | same |

Every OTHER spec in the suite is untouched and green. The rewrite is confined to these five; the two
files' remaining 60-odd specs, and all 15 other spec files, ran unedited.

## 4. Byte-identity, measured against `main@3143646`

The pre-change `src/` was materialised into `baseline-tmp/` (`byte-identity-setup.mjs` — 4 files
rolled back, which is exactly the 4 source files this change touches), and every shape an existing
caller can pass was rendered against **both** trees in one process with `renderToStaticMarkup`, whole
markup compared.

```
TableContainer / TableHeader / TableBody                        6 shapes   0 differences
Table — density × wrap × columnWidth × className              120 shapes   0 differences
TableRow × TableCell — the CR-007 valign precedence surface     96 shapes   0 differences
TableCell — every PRE-EXISTING prop shape                    2,560 shapes   0 differences
TableHead — align × sortable × sortDir × wrap × step × class 1,920 shapes   0 differences
GridHeadCell — every existing prop shape                     4,320 shapes   0 differences
GridFilterRow — kind × value × leadingCells × density × step   900 shapes   0 differences
GridFilterRow — `multiple`, ids the options STILL offer         12 shapes   0 differences
DataTableToolbar — select and multiSelect, no `selectAll`         2 shapes   0 differences
                                                            --------------------------------
                                                             9,936 shapes   0 differences
```

**And 4 shapes that DO differ, which is the whole point of the change.** Each is asserted, not merely
observed:

| Shape | Expected difference | Asserted |
|---|---|---|
| `<TableCell width={120}>` (and `"120"`, `"50%"`) | the `<td>` regains the legacy attribute | `now` contains `width="120"`, `was` contains no `width=`, **and stripping that one attribute makes the two markups identical** — so nothing else moved |
| a `multiple` cell holding `["cold-1","cold-9"]` | the trigger counts two | `now` contains `+1`, `was` does not |

⚠ **The baseline had to be cast at the F3 shape** (`width={legacy as never}`): `120` is not assignable
to the pre-change `TableColumnWidth`. **That type error IS the finding** — it is what a consumer's own
`tsc` hits on a file it never touched, at its pin bump.

⚠ **Radix's per-render generated ids are normalised** (`radix-[A-Za-z0-9_:-]+`), and only those —
CR-DESIGN-SYSTEM-009 handover point 10. The Radix-free comparisons are unaffected by it.

⚠ **What this harness CANNOT reach:** the master row itself. A Radix menu portals its content and
renders nothing while closed, so F2's markup is only visible with the menu open — which needs a real
DOM and a click. That is covered by the rewritten specs in §3 and by mutations **M-5** and **M-6**,
and it is stated here rather than left as an unexplained gap in the shape count.

## 5. Mutation battery — 10 run, 10 caught, 0 skipped

🔴 A green suite proves nothing until a defect reddens it. Each mutation restores something this
change was written to prevent, and the suite must FAIL.

| # | Defect restored | Result | Restored |
|---|---|---|---|
| M-1 | the master row reads UNTICKED when nothing is chosen — the tick stops meaning "nothing is hidden" | ✅ caught | ✅ byte-exact |
| M-2 | `All 3` collapses back to `0 of 3` — the two ticked states stop being distinguishable | ✅ caught | ✅ byte-exact |
| M-3 | **F1** — the shared label arithmetic drops a value the options no longer offer | ✅ caught | ✅ byte-exact |
| M-4 | **F1** — a tick re-derives from the option list, deleting the stored id it cannot show | ✅ caught | ✅ byte-exact |
| M-5 | **F2 (grid)** — "Select all" commits every option id instead of clearing | ✅ caught | ✅ byte-exact |
| M-6 | **F2 (toolbar)** — "Select all" commits every option id, dropping every blank-valued row | ✅ caught | ✅ byte-exact |
| M-7 | **F1** — the grid cell reads UNSET while a retired id is still narrowing the query | ✅ caught | ✅ byte-exact |
| M-8 | **F1** — the grid footer counts matched options instead of stored values | ✅ caught | ✅ byte-exact |
| M-9 | **F3** — the legacy HTML width is swallowed again and never reaches the `<td>` | ✅ caught | ✅ byte-exact |
| M-10 | **F3** — the split misreads the four step names as legacy widths, so the ceiling never applies | ✅ caught | ✅ byte-exact |

🔴 **The first run of this battery reported 7/10 with 3 SKIPPED, and that is reported here rather
than buried.** The three multi-line anchors did not match: git stores LF, `core.autocrlf` hands out
CRLF on Windows, so an anchor written with `\n` matches nothing — which is the *same* failure
CR-DESIGN-SYSTEM-009's `defect-log.md` **D-1** recorded, arriving from the other direction (it hit the
restore, this hit the match). The single-line anchors were unaffected, which is why it looked like a
partial run rather than a broken harness. The harness's own "ANCHOR NOT FOUND — MUTATION NEVER RAN"
self-check is what surfaced it; fixed by taking the file's own line ending. See `defect-log.md` **D-1**.

## 6. What a unit test cannot say here, stated plainly

- `happy-dom` does no layout. Nothing here asserts that an ellipsis appeared or that `max-width`
  actually caps a `<td>` under `table-layout: auto` — the **carried OQ-8**, still unverified, still
  not this change's (the probe ships at `runs/change-08/output/truncate-probe.html`).
- **No consumer suite was executed and nothing here claims one was.** `bananaworld-dc` is readable
  and was read; the CRM, RMS, org-admin and Manga Verde cannot be read from this worktree. Ninth
  change to record it.
- The `<td width="…">` attribute is asserted in the DOM, not in a browser. Its rendering is HTML's,
  unchanged since before CR-009 — the claim is that the package forwards it again, and that is what
  is measured.
