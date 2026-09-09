# QA report — CR-DESIGN-SYSTEM-009

> Stage 04. Written against the code as it stands on `change/cr-design-system-009`.
> Companion to `test-results.md` (the numbers) and `defect-log.md` (what went wrong on the way).

## 1. Does it do what the owner asked?

He said two things. This change answers one and a half of them, and the half it does not answer is
out of its lane by the CR's own instruction.

| The owner's words | What ships | Verdict |
|---|---|---|
| *"I can only select one item at a time… we have to make it so that you can filter by multiple items: a Select All or where you can select individual items or multiple items."* | A `select` filter cell can be declared `multiple`. It becomes a Radix `DropdownMenu` of `CheckboxItem`s that **stays open** while ticking, with a tri-state **"Select all"** master row carrying "3 of 12", individual ticks, and a footer count. | ✅ |
| *"…make the font smaller, a lot smaller. I want the rows to be much more compact."* | `<Table density="compact">` — `text-sm`→`text-xs`, cells `px-3 py-2`→`px-1.5 py-1`, filter boxes `h-7`→`h-6`, header chrome scaled with them. Body row ≈ **24px against today's ~36–44px**. | ✅ |
| *"The report needs to be a little bit wider…"* | **Not this change.** DC's shell caps content at `max-w-[1440px]`; that is DC's file, DC's lane, DC's own CR — stated by the CR itself and by the plan §0. | ✅ N/A, recorded |
| *"I wouldn't want all the columns to be equally narrow… some deserve to be wider, like a customer name."* (plan note 3, layout **B**) | A named three-step scale declared per column — `narrow` 6rem / `medium` 11rem / `wide` 20rem — plus `full` for "never cut me". A ceiling, not a fixed width, so a column still takes only the room it needs. | ✅ |

**What he will actually see, and it is worth being blunt about it: NOTHING, yet.** This change ships a
*capability*; nothing in DC has asked for it. Every option is opt-in and defaults to today. The report
opens smaller only after DC bumps its pin to the **merged** `main` sha and passes `density="compact"`,
`wrap="truncate"` and a `width` per column in its own change. That is the plan's §0 and seam **S8**,
and it is not a shortcoming — it is the lane rule working.

## 2. Is it additive? — the question this package lives or dies on

| Check | Result |
|---|---|
| Fields added | **6** (`multiple`, `width` on the filter def; `density`, `wrap`, `columnWidth` on `Table`; `selectAll` on the toolbar def) + `wrap`/`width` on `TableHead`/`TableCell` + `width` on `GridHeadCell` |
| 🔴 Fields removed | **0** |
| 🔴 Defaults moved | **0** — `density="default"`, `wrap="wrap"`, uncapped columns, `selectAll="allOption"`, `multiple` absent |
| 🔴 Exports removed or renamed | **0**. Six names added, none moved |
| Type widened in a way an existing reader could fail on | **No.** `select` gained an OPTIONAL property; `value: string` stays required and keeps its meaning |
| Measured byte-identity | **1,972 caller shapes, whole `innerHTML`, 0 differences** |
| The toolbar's seven shipped screens | **DOM snapshot diff: zero lines** |

### The two routes deliberately NOT taken, and why each would have broken a consumer

- **A fifth `kind: "multiSelect"`** — DC declares 27 columns as `kind: "select"`, and every stored
  `f_room=cold-1` would become a value of a kind that no longer exists.
- **Widening `value` to `string | readonly string[]`** — this is the one that looks cheapest and is the
  most dangerous. DC's `appendFilters` calls `value.value.trim()`; a union there fails DC's
  `typecheck` **the moment it bumps its pin**, so a consumer that adopted nothing would be broken by
  adopting nothing. That is precisely what the lane rule forbids.

An optional `values` keeps every existing reader compiling *and* reading a real chosen id, and it is
the precedent this package already set (`storedFromFilterValue` writes a bare string for one value and
an array only for two or more).

## 3. Named callers checked, and why each is unaffected

🔴 **Re-verified against the files in this session, read-only, not carried forward from the plan.**

| Caller | Why it is unaffected | How checked |
|---|---|---|
| DC `src/components/reports/grid-props.ts` → `filterCells` | Builds every def from `column.filter.kind` with **no `multiple` and no `width`** — so all 27 columns keep the one-value menu on the untouched code path | **read this session**; the mapped object has neither field |
| DC `src/components/reports/ReportGrid.tsx` | Renders `<GridFilterRow>` with `columns` / `values` / `onChange` only — **no `density`, no `wrap`, no `columnWidth`** anywhere in the `<Table>` it sits in | **read this session** (its filter-row block, and the raw Actions `<th>` at ~239–245) |
| DC `src/lib/reports/grid/grid-request.ts` | Parses with `params.get(\`f_${column.key}\`)`. Under the stated encoding a single value is written as the identical bytes and `get` returns the identical string | **read this session** — `filterValueFor`, the `params.get` line |
| DC `src/lib/reports/grid/grid-state.ts` → `appendFilters` | Writes one parameter per key. Nothing DC writes today changes; it moves to `append`/`getAll` in its own change | **read this session** (function located at `:81`) |
| DC's saved and shared views on disk | Rows hold `f_room=cold-1`. Those bytes keep their meaning under both the old parser and the new one — asserted with the real `URLSearchParams` | `grid-view.test.tsx` §2 |
| DC's legacy list screens (`SalesOrdersListLegacy`, `ReceiptsListLegacy`, …) | Use `DataTableToolbar`; their `MultiSelectFilterDef`s carry no `selectAll` | the seven-screen DOM snapshot, **zero-line diff** |
| Every in-package caller of `Table*` | 1,972-shape `innerHTML` diff | `test-results.md` §4 |
| **CRM, RMS, org-admin, Manga Verde** | 🔴 **NOT READABLE from a build worktree. No claim is made about them and no suite of theirs was run** — eighth change to record it. Their protection is that no option they do not pass can reach them, which is what `Grid.additive.test.tsx` asserts | — |

⚠ **Three of the plan's DC citations have drifted in PATH or LINE** — `grid-state.ts` lives under
`src/lib/reports/grid/`, not `src/components/reports/grid/`, and `appendFilters` is at `:81` not `:88`.
**Every underlying FACT holds**; only the coordinates moved. Recorded in `known-issues.md` §B.

## 4. Adversarial checks — where this could have looked right and been wrong

| Risk | Why it is plausible | Check | Result |
|---|---|---|---|
| **The menu closes on the first tick** | The Radix default; it silently defeats the entire feature | ticking three rooms in one opening; mutation **M-5** | menu stays open |
| **A one-value state stops looking like today's** | The shape gained a field, and the consumer stores it on disk | key list asserted as exactly `["kind","value"]`; mutation **M-4** | `values` absent below arity 2 |
| **A head loses `whitespace-nowrap`** | A shared wrap record maps "wrap" to "" — the obvious refactor, and it would move every table in the estate | separate `HEAD_WRAP` record; T-24 pins the exact string; mutation **M-1** | one class, unmoved |
| **Two classes on one axis** | The exact bug class this file's own rule exists to prevent | T-28 / T-30 / T-38 across every path | exactly one, everywhere |
| **A width cap emitted where nothing clips** | Would spill values out of cells AND move existing renders | T-34; mutation **M-3** | emitted only under `truncate` |
| **A truncating table that cuts nothing** | `text-overflow` needs a definite width; a `wrap="truncate"` with no cap is a setting that lies | `truncate` defaults columns to `medium`; T-35 | it cuts |
| **§C.4a desync** — the filter row keeps its own width and re-widens the column | Three passes from one declaration; wiring two of three looks like a package bug | all three asserted to emit one identical ceiling; mutation **M-7** | same class on all three |
| **Tick order leaking into the wire** | The trigger would shuffle and the stored order would stop being stable | displayed-order spec; mutation **M-8** | displayed order always |
| **The master row reads "all" when only some are chosen** | A boolean checkbox is the easy implementation | `aria-checked="mixed"`; mutation **M-6** | tri-state, via Radix |
| **A hand-rolled dash instead of Radix's indeterminate** | It would look identical and lose `aria-checked="mixed"` | `MultiSelectAllRow` is a Radix `CheckboxItem` | primitive kept |
| **The extraction quietly changed the toolbar** | Moving a component usually reorders its class string | seven-screen whole-DOM snapshot | **zero-line diff** |
| **An unknown stored value changes the "+N"** | `chosenLabels` derived from options alone would drop it and shrink the count | `chosenLabelsInOptionOrder` keeps one entry per stored value, unknown ids included | count preserved |
| **A conditionally-called hook** | `wrap ?? useTableWrap()` short-circuits — the exact trap CR-007 recorded | hooks called unconditionally, then props resolved over them | no conditional hook |
| **A new spec that never reddens** | A regression test that cannot fail proves nothing | **8 mutations, 8 caught** | they are real |

## 5. 🔴 OQ-8 — the one claim this session could NOT verify

**The claim.** `max-width` on a `<td>` under `table-layout: auto`, paired with `overflow:hidden`, is
the standard "truncate inside a table" pattern and is honoured for shrinking by current browsers — but
it is weaker than a block box's `max-width`, and a cell with unbreakable content can push past it. The
plan named this at §C.4 and OQ-8 and required **a real-browser check, because jsdom does no layout**.

**It was not run.** No browser binary can be executed from this sandbox — every path outside the
worktree is refused, and `pnpm update`-class commands are blocked too. **Nothing in this pack claims
otherwise.**

**What ships instead of a claim:** `runs/change-08/output/truncate-probe.html` — a self-contained page
reproducing exactly what the package emits (auto layout, `overflow-x-auto` container, `truncate` plus
one `max-w-` step, and an uncapped control column). It measures `getBoundingClientRect().width` and
`scrollWidth > clientWidth` and prints seven PASS/FAIL lines and a verdict. **Open it in any browser;
it answers OQ-8 in one click.**

**Why this is a bounded risk rather than an open wound:**

- The failure mode is *"the column does not narrow"* — visible immediately on the first compact report,
  no data harm, nothing corrupted.
- It **cannot move an existing render** either way: no caller truncates today.
- The plan's named fallback is recorded and untaken: wrap the truncating cell's children in an inner
  `<span class="block truncate">` carrying the width class, where `max-width` is fully reliable. It
  touches only the `wrap === "truncate"` path.
- It was **not** taken pre-emptively, because the plan makes it conditional on an observed failure and
  a session must not build around a hypothesis it has not tested.

## 6. Accessibility

| | |
|---|---|
| The multi cell | Radix `DropdownMenu.CheckboxItem` ⇒ `role="menuitemcheckbox"` + `aria-checked`, arrow keys, typeahead, focus return to the trigger on `Esc`. The trigger keeps `aria-label="Filter by ${label}"`, so a set cell still reads as set |
| The master row | Radix `checked="indeterminate"` ⇒ **`aria-checked="mixed"`** — asserted, and the single strongest argument against hand-rolling it |
| The trigger's `+N` | inside the same `<span>` as the label, so it reads as one accessible name ("Cold room 1 +2") |
| The footer | states "None chosen" / "N chosen" as text |
| Compact density | padding and type only. `h-7`→`h-6` is 28px→24px **on a browser-only surface**; the `data-surface=tablet` variants are untouched, so no tablet touch target shrinks |
| Truncation | **visual only.** The DOM text node stays whole, so a screen reader reads the entire value whether or not it is visually cut. The `title` is an addition for sighted mouse users, never the accessible name |
| No `title` invented for element children | a tooltip reading "[object Object]" is worse than none |

## 7. Open defects at the end of Stage 04

**In the change: 0.** One defect was found and fixed **in the test harness** during the session
(`defect-log.md` D-1) — it never reached the shipped code.

**Blocking the merge: 1, and it is not this change's.** Three high/critical advisories published
2026-09-08 against the auto-installed `next` peer and `sharp` will fail CI's `dependency-audit` job.
`main` fails the same audit today. The remedy is an owner decision and every route to it is
permission-blocked here — `test-results.md` §7, `known-issues.md` §A, and the decision card at
`runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`.
