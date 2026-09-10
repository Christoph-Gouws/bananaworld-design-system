# QA report — CR-DESIGN-SYSTEM-010

> Stage 04. Reviewed against the owner-approved plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-010.md`
> — that plan is the contract, not this session's own idea of the change. Counts and verdicts are
> cited from `test-results.md` rather than restated.

## Verdict

**PASS — ship on-green.** The three findings are fixed, each fix is pinned by a spec and by a mutation
that reddens without it, and the additive claim is measured at **9,936 caller shapes / 0 differences**
with **4 deliberate differences** that are exactly the three states the findings name.

## 1. Did the plan's premise still hold?

**Yes — all three findings were re-confirmed in the current source before any fix was designed, and
every citation in the plan was exact.** `main` had not moved: `HEAD` is `3143646`, the plan's stated
merge base.

| # | Plan's citation | Found there | Verdict |
|---|---|---|---|
| F1 | `GridFilterRow.tsx:284, 289, 293, 343` | `chosen = options.filter(...)` · `set = chosen.length > 0` · `toggle`'s `options.filter(...)` re-derive · the footer's `chosen.length` | **CONFIRMED** |
| F2 | `DataTableToolbar.tsx:399` · `GridFilterRow.tsx:326` | `onToggle={(all) => onChange(all ? options.map(...) : [])}` in both | **CONFIRMED** |
| F3 | `Table.tsx:483` declared, `:487` destructured out | both exact | **CONFIRMED, and proven by compiling** — see below |

**F3 was the one worth compiling rather than reading**, because the plan itself flagged that
`node_modules` was absent when it was written and the React type shapes were stated from memory. They
are right: `@types/react/index.d.ts:3541-3551` declares `TdHTMLAttributes.width?: number \| string`
and `:3553-3560` declares no `width` on `ThHTMLAttributes` — so the hazard is asymmetric exactly as
the plan says. A probe declaring `<TableCell width={120}>` fails the pre-change tree with
`TS2322: Type 'number' is not assignable to type 'TableColumnWidth | undefined'`, and
`git show 6ed975d:src/components/Table.tsx` contains **no `width` at all**, which settles that the
prop was inherited and legal before CR-009. **`<TableHead width={120}>` fails in both trees** and is
therefore not a regression — which is why widening `TableHeadProps` would have been scope, not repair.

**Nothing the plan relies on had moved, so nothing was blocked and nothing was built around a stale
premise.** No finding was dropped: none of the three had been corrected by a later change.

## 2. Does it do what was approved — clause by clause?

| Plan clause | Built | Note |
|---|---|---|
| §2.1 three additions to `MultiSelectMenu`, all internal, barrel untouched | ✅ | `MultiSelectOption`, `multiSelectChosenLabels`, `multiSelectToggle`. `components/index.ts` unchanged |
| §2.1 `MultiSelectAllRow` loses the ability to narrow (`onToggle` → `onShowEverything`) | ✅ | no boolean reaches a call site; no id list reaches the row |
| §2.1 owner's pick **A** changes only this function's body | ✅ | `chosen === 0 ? true : …` and `All N` / `N of M` — the whole owner-facing decision is 2 lines |
| §2.2 `MultiSelectCell` reads the shared arithmetic; `SelectCell` untouched | ✅ | `SelectCell`'s bytes are unchanged; byte-identity §4 covers 900 single-value shapes |
| §2.2 `onCommit([])` drops the key | ✅ | asserted as `onChange({})` |
| §2.3 the toolbar's local copy deleted, not duplicated | ✅ | `chosenLabelsInOptionOrder` removed; the same body now serves two callers |
| §2.4 `width` widened, `isColumnWidth`, `htmlWidth` forwarded | ✅ | and **OQ-2 is settled: `(string & {})` compiles here**; the `\| string` fallback was not needed |
| §2.4 `TableHead` deliberately NOT widened | ✅ | `Table.test.tsx` untouched and green |
| §2.5 `table-controls.ts` not touched | ✅ | |
| §2.5 ticking every option by hand still excludes blanks | ✅ | asserted, with `3 of 3` vs `All 3` as the on-screen tell |
| §2.5 no consumer pin bumped | ✅ | `package.json` unchanged |
| §5 the two defect-pinning specs rewritten, and CALLED OUT | ✅ | `test-results.md` §3 — six edited, five of them because they were wrong |
| §5 "every other spec untouched and green" | ✅ | 15 of 17 spec files unedited; 377/377 |
| §6 baseline re-measured before any edit | ✅ | **363 / 17**, matching the plan's stated expectation |
| §6 byte-identity harness reused, radix ids normalised | ✅ | and the setup script is now committed so the next change does not rebuild it |
| §6 mutation battery restoring ORIGINAL BYTES | ✅ | 10/10, every restore verified with `Buffer.equals` |

**Nothing in the plan was skipped, and nothing outside it was added.** The one thing built beyond the
plan's letter is the *committed* setup script for the byte-identity harness — evidence tooling under
`runs/`, not shipped code.

## 3. Additive-only — the lane rule

| Axis | Answer |
|---|---|
| A field removed? | **No.** One prop was widened (`TableCellProps.width`) and one prop was renamed **on an internal, un-barrelled component** (`MultiSelectAllRow.onToggle` → `onShowEverything`). `MultiSelectMenu` is not exported from `components/index.ts`; a consumer cannot reach it, and its only two callers are both in this package and both changed here |
| A default moved? | **No.** `selectAll` still defaults to the `"allOption"` row every shipped screen renders; `multiple` still defaults false; `width` still defaults to the table's step; `density` and `wrap` untouched |
| An export surface altered? | **No.** `src/components/index.ts` and `src/lib/index.ts` are byte-unchanged |
| Every existing caller byte-identical? | **Measured: 9,936 shapes, 0 differences.** The 4 that differ are the repairs, and each is asserted to differ *in the repaired direction* — the F3 case additionally proves that stripping the one restored attribute makes the two markups identical, so nothing rode along with it |

### Callers checked, and why each is unaffected

- **`bananaworld-dc`** — read-only, and **read only** in this session (`package.json` and a grep over
  `src`). It pins **`6ed975d`** (`package.json:55`), which is CR-008 — *before* CR-009. It therefore
  does not have `selectAll`, `multiple` or the `width` prop at all. It also declares **no**
  `kind: "multiSelect"` filter and passes **no** `width` to `TableCell` / `TableHead` /
  `GridHeadCell` (0 matches). **Unaffected on every axis.** Nothing was written, staged, committed or
  formatted there.
- **CRM, RMS, org-admin, Manga Verde** — **not readable from this worktree, and no claim is made
  about them beyond this**: `selectAll` and `multiple` are one day old, so no pin can hold them; and
  the `width` hazard is now *repaired* rather than documented, so the per-consumer grep CR-007
  imposed for `valign` is a courtesy here rather than a gate — the attribute keeps working either way.
- **Inside the package** — `MultiSelectMenu` has exactly two callers, both changed here and both
  covered by specs and mutations.

## 4. Radix (project rule)

No interactive control was hand-rolled or replaced. The master row remains a
`DropdownMenu.CheckboxItem` carrying Radix's own `checked="indeterminate"` → `aria-checked="mixed"`,
and the change *removes* a prop from it rather than adding markup. `onSelect={(e) =>
e.preventDefault()}` is intact on every menu item (mutation **M-5** of CR-009 still guards it).
Keyboard, focus return, typeahead and the `menuitemcheckbox` roles are untouched.

⚠ One accessibility note, stated because it is a real consequence of layout A: **the master row is now
ticked in the "nothing chosen" state**, so a screen reader announces "Select all, checked, All 3"
where it previously said "not checked, 0 of 3". That is the owner's approved reading — the tick means
"nothing is being hidden" — and the count is what distinguishes it from `3 of 3`. It is a wording
change no shipped screen sees, because no consumer declares `selectAll: "master"`.

## 5. Defects found during QA

**One, in this session's own tooling, none in the change.** The mutation battery's first run reported
`7/10 with 3 skipped` — three multi-line anchors did not match a CRLF checkout. Recorded as
`defect-log.md` **D-1**, fixed, re-run **10/10**. It is the same root cause as CR-009's D-1 arriving
from the opposite direction, which is why it is written up rather than quietly fixed.

## 6. Open items at close

- **0 open defects.**
- **0 open decisions** — the plan gate answered the only one (layout **A**).
- **0 actions owed** by this change.
- Technical debt: **4 items**, all inherited or explicitly deferred by the plan — `technical-debt.md`.
- Carried, not this change's: **OQ-8** (does `max-width` cap a `<td>` under `table-layout: auto`) —
  no browser binary is executable from this sandbox; the probe still ships at
  `runs/change-08/output/truncate-probe.html`.
