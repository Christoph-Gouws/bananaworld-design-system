# QA report — CR-DESIGN-SYSTEM-003

| Field | Value |
|---|---|
| Change | A toolbar filter can hold one value. Let it hold several, without disturbing the screens that hold one |
| Approved layout | **A** — closed trigger reads `Cape Town +2` |
| Ship mode | on-green |
| Acceptance criteria | **17 traced, 17 to a verdict** — 15 PASS, 2 N/A **with a stated cause** |
| Open defects | **0** (`defect-log.md`) |
| Verdict | **PASS** |

## 1. Acceptance criteria, each traced to a verdict

| # | Criterion (from the request) | Verdict | Evidence |
|---|---|---|---|
| AC-1 | A multi-select filter kind exists, **added beside** the existing one | **PASS** | `FilterDef` is now `Select \| MultiSelect \| DateRange`; `select` is untouched, undeprecated, unmigrated. `src/lib/table-controls.ts` |
| AC-2 | A filter definition declares which kind it is | **PASS** | `kind: "multiSelect"` — one word, and the def is otherwise a copy of `SelectFilterDef`, so converting a filter changes one word and nothing else |
| AC-3 | A screen that wants one value keeps declaring **exactly** what it declares today | **PASS** | No field was added to, removed from or defaulted differently on `SelectFilterDef`. `git diff` shows 0 deletions in that interface |
| AC-4 | …and behaves identically | **PASS** | Seven screens snapshotted pre-edit, re-run post-edit, **snapshot file hash unchanged** (`test-results.md` §2) |
| AC-5 | 🔴 **No existing caller changes a line** | **PASS** | Not one consumer file is in `changed-files.md`. Five source files, all in this package |
| AC-6 | 🔴 **None changes behaviour — all screens checked, not sampled** | **PASS** | All 11 call sites addressed individually: 7 by DOM snapshot (§2 of `test-results.md`), 4 by the type argument in §4 below. None sampled |
| AC-7 | The control is a popover with checkboxes, matching the package's own conventions | **PASS** | Radix `DropdownMenu` + `CheckboxItem` — the same primitive, portal and `--z-dropdown` `RowActions` already ships. **No new dependency** |
| AC-8 | **Not** a hand-rolled replacement for a Radix control | **PASS** | Zero hand-rolled roles: `menuitemcheckbox`, `aria-checked`, roving focus, typeahead, Escape-restores-focus and outside-click all come from Radix |
| AC-9 | Closed state: several values read in a narrow toolbar without becoming a paragraph | **PASS** | Layout A: first chosen by name + `+N`, one line, `truncate` on the name, count never truncates. 4 specs assert the exact strings |
| AC-10 | The "All" state | **PASS** | Trigger reads `All {label.toLowerCase()}` — **the Select sentinel's exact wording** (D-6), so an unset filter reads identically whichever kind it is |
| AC-11 | A clear-all | **PASS** | The "All …" row is pinned at the top, checked when nothing is chosen, and clears everything when chosen. The toolbar's global Clear also empties it — asserted |
| AC-12 | The keyboard path | **PASS** | 5 keyboard-only specs: Tab → Enter → ↓ → Space (menu **stays open**) → Space again unticks → Escape closes and focus returns to the trigger; clearing from the keyboard too |
| AC-13 | 🔴 A view saved before this change must still open — not crash, not filter to nothing, not quietly widen | **PASS, with the consumer half named** | `filterValueFromStored(multiSelectDef, "Cape Town")` → `["Cape Town"]`, `widened: false`, and the rows prove it shows Cape Town only. The `select`-reading-an-array direction reports `widened: true`. **This package cannot fix CRM's table; §5 states exactly what CRM must do** |
| AC-14 | Say in the evidence what a consumer must do | **PASS** | `developer-handover.md` §3 — the seven-point obligation, verbatim from the plan §5.4, plus the "must not adopt until all seven are done" line |
| AC-15 | The pin is the other half — state it, do not assume | **PASS** | `developer-handover.md` §2 and `SESSION_HANDOVER.md`: nothing reaches DC or CRM until each moves its own pin, in its own change, **against the merged sha on `main`** |
| AC-16 | Not in this change: no new filter types, no search-in-list, no grouping, no select-all-matching, no change to the search box, the date-range filter, or the layout | **PASS** | §3 below, item by item |
| AC-17 | The package still builds standalone with no app import reachable | **PASS** | `tsc --noEmit` runs with no app path alias, so `@/…` cannot resolve; plus a spec scanning both edited sources for `@/` and `bananaworld-` |

### N/A, each with a cause rather than a silence

| # | Item | Why N/A |
|---|---|---|
| N/A-1 | Migration rehearsal on a throwaway Postgres | **This package has no database, no migration, no query and gains none.** `migrationExpected: false` in the plan (§3). No container was started; none needs sweeping |
| N/A-2 | Deployed verification on a running instance | Source-only, sha-pinned library — there is nothing to deploy. Five substitute proofs in `deployed-verification.md` |

## 2. The request said nine screens. There are eleven, and all eleven were checked.

The plan already corrected this (§1) and the correction is carried, not re-litigated:

| Group | Count | How each was checked |
|---|---|---|
| DC screens rendering the toolbar | **6** (the request said 8) | DOM snapshot per screen, pre- and post-edit |
| CRM screens rendering the toolbar | **1** (availability) | DOM snapshot |
| **org-admin screens driving `useTableControls` with no toolbar** | **4** — the request does not mention this app at all | Type-level, §4 |
| RMS, Mangaverde | 0 usages | Nothing to check; they gain a type they do not import |

`document-search/DocumentListSearch.tsx` and `ListControlsRow.tsx` name `DataTableToolbar` only in
header comments and render none — which is why the count is six, not eight.

## 3. Scope discipline — the "not in this change" list, item by item

| Excluded | Held? | How |
|---|---|---|
| New filter types beyond multi-select | ✅ | Exactly one kind added |
| Search inside the filter list | ✅ | No input inside the menu, no prop for one, no dead code toward one |
| Grouping | ✅ | Flat option list only |
| "Select all matching" | ✅ | The only bulk affordance is the All row, which **clears** |
| Change to the toolbar's search box | ✅ | Untouched; its snapshot is inside the seven that did not move |
| Change to the date-range filter | ✅ | `DateRangeFilterControl` untouched |
| Change to the layout for screens that adopt nothing | ✅ | Same wrapper, same gaps, same order — proved by hash, not by eye |
| Reshaping the single-select to make room | ✅ | Explicitly refused; that would be the nine-screen migration the request forbids |

## 4. 🔴 Why widening the `FilterValue` union cannot break a consumer's typecheck

Widening a union is safe in argument position but **can** break a reader that narrows exhaustively
(`if (v.kind === "select") {…} else { v.from }`). Every reader in the estate was enumerated in the
plan (§2.3) from the real sources, and every one uses the positive-test-then-fallback shape:

| Reader | Pattern recorded in the plan | Breaks on a widened union? |
|---|---|---|
| org-admin `people-list.tsx:116–117` | `v !== undefined && v.kind === "select" ? v.value : null` | No — positive narrowing, no `else` |
| org-admin `transport-list.tsx:78–79` | same | No |
| org-admin `farms-list.tsx:76–77` | same | No |
| CRM `captureCurrent` (`AvailabilityView.tsx:371`) | `value.kind === "select" ? value.value : null` | No |
| CRM `applyState` (`:359`) | writes `{kind:"select", …}` | No — argument position |
| DC × 6 | no consumer reads `filterValues` at all; the toolbar does it internally | No |

**Not one exhaustive switch or `else`-implies-dateRange narrowing exists anywhere in the estate.** The
same shape is pinned inside this package: `selectValueOf`, `dateRangeFrom` and `dateRangeTo` were
already positive-narrowing and needed no edit, and the new `multiSelectValuesOf` matches them.

⚠ **The limit of this claim, stated:** those six rows are the plan's readings of the consumer sources
at plan time. **This session cannot open those repos**, so it re-verified nothing there and claims no
execution. What it did verify is everything inside this package, plus the type-level argument, which
is checkable by anyone at the next pin bump.

## 5. 🔴 The trap — saved availability views

CRM shipped saved availability views on 2026-08-10 (CR-CRM-011) and persists every toolbar filter
value verbatim, per rep. Both failure directions are **silent widening**, and neither is fixable from
inside this package:

| Direction | What happens today | What this change ships |
|---|---|---|
| A view saved **before**, opened **after** CRM adopts multi-select | CRM writes `{kind:"select"}` for a `multiSelect` def; `matchesFilter` falls through to `return true` and **the filter matches every row** | `filterValueFromStored` reads the bare string into `["Cape Town"]` — the filter shows Cape Town only, and reports `widened: false` because nothing was lost |
| A view saved **after**, opened by a build on the **old pin** | `reconcileFilters` skips an array before `dropped.push`, so it opens showing everything **with no note** | The stored shape is a **bare string whenever one value is chosen**, so an old build reads it correctly for free. Only the genuinely multi-value case needs new reader code, and there `widened: true` is the hook for CRM's own notice |

**The wording of any notice stays in the app** (TECH-COMP-003) — this package supplies the fact, not
the sentence. The seven-point consumer obligation is in `developer-handover.md` §3, and until CRM has
done all seven it **must not** declare any availability filter as `multiSelect`.

## 6. Standards held

| Standard | Held | Note |
|---|---|---|
| **Additive-only** | ✅ | 0 fields removed, 0 defaults changed, 0 exports moved or renamed. 25 deleted lines, all rewrites of the arms that gained a branch, each listed in `changed-files.md` §1.1 |
| **No consumer pin bumped** | ✅ | No consumer file touched at all |
| **Radix, not hand-rolled** | ✅ | D-4 / AC-8 |
| **Pure UI (TECH-COMP-003)** | ✅ | No network, no `warehouse_id`, no tenancy identifier, no business rule. The accessor returns a caller-supplied string; the package never learns what a depot *is* |
| **Permissions (RBAC-PRINCIPLE-001)** | ✅ | None gained. A filter narrows rows the caller already holds; it can never widen a set. Recorded consequence: an app must **not** treat chosen values as an authorisation input |
| **No forbidden unit created** | ✅ | No `runs/epic-NN/`, no `milestone-NN/`, nothing under `runs/current/epic-plan/` |
| **Throwaway Postgres cleaned up** | ✅ | Never started — no database in this package |
