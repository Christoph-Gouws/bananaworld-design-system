# Test results — CR-DESIGN-SYSTEM-003

| Field | Value |
|---|---|
| Commands | `pnpm typecheck` · `pnpm test` (vitest 4.1.10, two projects: `engines` in node, `components` in happy-dom) |
| Baseline before any edit | **115 passed / 9 files** · typecheck clean — recorded at `9aa20f7` before a line changed |
| After | **189 passed / 11 files** · 0 failed · 0 skipped · typecheck clean |
| New specs | **+74** (43 in `table-controls.test.tsx`, 31 in `DataTableToolbar.test.tsx`) |
| Existing specs modified | **0** |
| Verdict | **PASS** |

```
> vitest run
 Test Files  11 passed (11)
      Tests  189 passed (189)
```

## 1. 🔴 There was no test for this engine at all — that is why the suite opens with characterisation

`tests/` held ChoiceGroup, Combobox, DocumentHeader, document-date, Select and the pricing /
sales-order engines. **Nothing covered `DataTableToolbar` or `table-controls`.** So "the package suite
is green" would have proved nothing about the seven toolbar screens, and citing it as the additive
proof would have been hollow (plan §8.1, D-11).

**36 characterisation specs were therefore written and run green BEFORE a line of source changed** —
17 for the engine, 19 for the toolbar — and they pass unchanged afterwards. They are not free to be
edited by a later change: if one goes red, the change that turned it red is not additive.

## 2. 🔴 The additive proof: the seven screens' DOM is byte-identical, by hash

The seven screens that render this toolbar (plan §1.1) were each rendered and snapshotted **before**
the source edit, then re-run after it. Not "looks the same" — the same bytes:

```
before the source edit:  sha256(tests/components/__snapshots__/DataTableToolbar.test.tsx.snap)
                         = ce7bd84978bd36072116bbdb5dd61145cc08d8e2149ef1d198584ae2619eb7c1
after  the source edit:  ce7bd84978bd36072116bbdb5dd61145cc08d8e2149ef1d198584ae2619eb7c1   ← identical
```

A vitest snapshot fails on any drift, so a single changed attribute, class, element or id anywhere in
those seven trees would have turned this red. It did not move.

| # | Screen (plan §1.1) | Declared | Snapshot | Structural assertions |
|---|---|---|---|---|
| 1 | DC · PurchaseOrdersView | 3 select + 1 dateRange | identical | 3 combobox triggers, each reading `All {label}`; 2 date inputs; no Clear |
| 2 | DC · ReceiptsView | 2 select + 1 dateRange | identical | as above, 2 triggers |
| 3 | DC · ReturnsView | 1 select + 1 dateRange | identical | as above, 1 trigger |
| 4 | DC · SalesOrdersView | 2 select + 1 dateRange | identical | as above, 2 triggers |
| 5 | DC · ConversionsView | 1 select + 1 dateRange | identical | as above, 1 trigger |
| 6 | DC · StockAdjustmentView | 2 select + 1 dateRange | identical | as above, 2 triggers |
| 7 | CRM · AvailabilityView | 5 select, no dateRange | identical | 5 triggers, no date input |

⚠ **Provenance, stated rather than implied.** These declarations are transcribed from the approved
plan's inventory (§1.1), which read the consumer sources at plan time. **DC, CRM and org-admin are not
checked out in this sandboxed worktree and could not be read or run from here** — the same limitation
CR-DESIGN-SYSTEM-001 and -002 both recorded. The filter **kinds and counts** are the load-bearing part
and are exact; each `key` and the date-range `label` are representative, because what the toolbar
renders depends on the kind, not on the string. Nothing here claims a consumer suite was executed.

Screens 8–11 (org-admin) render no toolbar at all — they construct `FilterValue` literals over the
shared engine. They are covered as a **type** question, not a DOM one: `qa-report.md` §4.

## 3. The 43 engine specs (`tests/components/table-controls.test.tsx`)

| Group | Specs | Covers |
|---|---|---|
| Characterisation — `emptyFilterValue` / `emptyFilterValues` | 3 | Unchanged shapes for both existing kinds |
| Characterisation — `hasActiveControls` | 4 | Cleared, query, set select, either date bound |
| Characterisation — filtering | 5 | select null = all; exact match; inclusive day bounds incl. a full ISO timestamp; null accessor excluded; absent value ignored |
| Characterisation — `deriveSelectOptions` | 2 | Fixed options win; derived are distinct, sorted, `null`/`""` skipped |
| Characterisation — search + sort | 3 | Multi-part case-insensitive search; nulls sink last both directions; AND-composition; input array never mutated |
| **multiSelect cardinalities** | 6 | **none / one / several / all** — each asserting the exact visible row set; one-chosen returns the *identical* set to the select of that value; a value nothing matches shows **nothing**, not everything |
| **multiSelect mechanics** | 5 | empty value shape; 🔴 `hasActiveControls` true **only** when something is chosen; options derived identically to a select; fixed options; 🔴 kind mismatch returns every row and never throws |
| **`filterValueFromStored`** | 7 | Every row of the §5.3 table, both directions, plus `null` / `undefined` / `""` / `{}` / `42` / `[""]` / `[1,2]` / `[]` junk |
| **`storedFromFilterValue`** | 6 | One value → bare string; two → array; `null` = All; round-trip; 🔴 a pre-change row (`"Cape Town"`) opens showing **Cape Town only** |
| Barrel + boundary | 2 | Both helpers and all six type names reachable from `../../src`; neither edited source contains `@/` or `bananaworld-` |

## 4. The 31 toolbar specs (`tests/components/DataTableToolbar.test.tsx`)

| Group | Specs | Covers |
|---|---|---|
| The seven screens | 14 | Snapshot + structure, one pair per screen (§2 above) |
| A screen that adopts nothing | 3 | No `aria-haspopup`, no `menuitemcheckbox`, no `multiSelect`, no `chosen`, no `data-multi-select` — **absence, not emptiness** (the CR-DESIGN-SYSTEM-001 rule); search-only; no-search |
| Clear, as it behaves today | 2 | Appears on typing, clears, disappears; appears on a date bound |
| The new control | 3 | Opens on Enter; every option is a `menuitemcheckbox` plus the "All …" row; only the All row is `aria-checked` while nothing is chosen; a null-valued row contributes no option |
| **Keyboard-only** | 5 | Tab → Enter → ↓ → Space ticks **and the menu stays open** → ↓ Space ticks a second → Space unticks · Escape closes and **returns focus to the trigger** · clearing from the keyboard via the All row · the toolbar's own Clear empties a multi-select · 🔴 Clear is **not** lit while nothing is chosen |
| Closed-state wording (layout A) | 4 | `All depots` / `Durban` / `Cape Town+1` / `Cape Town+2`, and "first" is first in **displayed option order**, not tick order |

### 4.1 The D-5 guard was mutation-tested, not assumed

`onSelect={(e) => e.preventDefault()}` is the one line that keeps the menu open across several ticks;
without it the rep re-opens the menu per value and the change fails at the thing it exists to do. The
line was temporarily replaced with a no-op and the suite re-run:

```
× 🔴 ticks with Space and THE MENU STAYS OPEN across several toggles
  Unable to find role="menuitemcheckbox"      ← the menu had closed
Tests  1 failed | 30 skipped (31)
```

The guard bites. The line was restored and the full suite re-run green.

## 5. Dependency audit — run, not reasoned about

CI's job is `pnpm audit --prod --audit-level=high`. **`pnpm audit` is permission-blocked in this
session** (SESSION_HANDOVER §8) and is not claimed to have been run. It was reproduced in Node against
npm's bulk advisory endpoint over all 142 installed packages, with this repo's six owner-approved
`ignoreGhsas` applied:

```
probing 142 packages
ignored  high  next     >=14.1.1 <15.5.21  GHSA-89xv-2m56-2m9x  SSRF in Server Actions on custom servers
ignored  high  next     >=13.0.0 <15.5.21  GHSA-m99w-x7hq-7vfj  DoS in App Router using Server Actions
ignored  high  next     >=12.0.0 <15.5.21  GHSA-p9j2-gv94-2wf4  SSRF in rewrites
ignored  high  postcss  <=8.5.11           GHSA-6g55-p6wh-862q  arbitrary file read via sourceMappingURL
ignored  high  postcss  <=8.5.17           GHSA-r28c-9q8g-f849  path traversal in source-map auto-loading
ignored  high  sharp    <0.35.0            GHSA-f88m-g3jw-g9cj  inherited libvips CVEs

NO BLOCKING HIGH/CRITICAL ADVISORIES
```

Six highs, and they are **exactly** the six standing owner-approved ignores — no seventh, no new
advisory. `nanoid` is clean: CR-DESIGN-SYSTEM-002's `pnpm.overrides` (`nanoid@<3.3.17` → `^3.3.17`) is
in this branch's base and resolves 3.3.18. **This change adds no dependency and edits neither
`package.json` nor `pnpm-lock.yaml`.** CI's own job remains the authoritative gate.

## 6. Not run here, and why — no claim is made either way

| Not run | Why | Where it is covered |
|---|---|---|
| DC / CRM / org-admin suites | Those repos are not checked out in this worktree and cannot be reached from it | Each consumer's own adoption change; `deployed-verification.md` §3 |
| `pnpm lint` | **There is no `lint` script and no eslint config in this package** — recorded, not invented (`known-issues.md` C-2) | — |
| `pnpm format:check` | Pre-existing repo-wide drift: all five edited files **already failed at `HEAD`**, verified by stash. Not in CI | `known-issues.md` C-1 |
| Throwaway Postgres | **Never started.** This package has no database, no migration and no query. Nothing to rehearse | `deployed-verification.md` §2 |
| A browser | No browser or deployed instance in this lane; the control is proved in happy-dom via Radix's real DOM output | `deployed-verification.md` §4 |
