# QA report — CR-DESIGN-SYSTEM-004

> Stage 04. Every acceptance criterion traced to a verification method and a verdict.
> **23 criteria · 22 PASS · 1 N/A with a stated cause · 0 FAIL.**

## 1. Acceptance criteria

| # | Criterion (from the change request + approved plan) | How verified | Verdict |
|---|---|---|---|
| AC-1 | A page-size picker offering **25 / 50 / 100 / 200** | `TABLE_PAGE_SIZES` asserted equal to `[25,50,100,200]`; opening the picker lists exactly those four, in order | **PASS** |
| AC-2 | Previous / next | Both render in both bars; Next on page 1 emits page 2, Previous on page 2 emits page 1, size carried through | **PASS** |
| AC-3 | An **honest** "showing X–Y of N" | 5 boundary strings asserted literally, including the exact multiple and zero | **PASS** |
| AC-4 | Exported from `src/components/index.ts` like every other component | Appended there; both specs import from the **package root** `../../src`, which fails if any of the three barrels missed a name | **PASS** |
| AC-5 | It belongs **beside** `Table`/`DataTableToolbar` — do not fork the table | `Table.tsx` untouched; the bars are siblings the consumer renders above and below `TableContainer`. `git diff` on `src/` is `+24 / −0` | **PASS** |
| AC-6 | **Option (a)** settled on the card: presentation only, TECH-COMP-003, with the contract written down | No network, no fetch, no data, no state of its own. Contract written in three places: the fenced comment atop `TablePagination.tsx`, `developer-handover.md` §2, `technical-debt.md` TD-1 | **PASS** |
| AC-7 | Total-count and page-index are **inputs**; computing them is the consumer's job | `page`, `pageSize`, `totalCount` are plain number props. The package never counts anything and never asks anyone for a count | **PASS** |
| AC-8 | **Out of scope:** remembering the chosen page size per user or per list | Not built. No prop, no storage, no dead code left behind. Raised as a question at the gate (plan Q3, D-14) instead of smuggled in | **PASS** |
| AC-9 | **Out of scope:** wiring any DC or CRM screen | No consumer file touched; no consumer repo reachable from here anyway | **PASS** |
| AC-10 | **Out of scope:** any change to existing sort / filter / search / empty-state behaviour | `DataTableToolbar.tsx` and `table-controls.ts` are untouched. Their 189 specs pass unmodified and the committed toolbar snapshot hash is unchanged | **PASS** |
| AC-11 | 🔴 If any existing consumer must change even one line, say which and why | **None must.** No existing symbol is called, widened, renamed, moved or defaulted differently; the diff has zero deletions. §2 below addresses the call sites individually | **PASS** |
| AC-12 | Match the existing tokens and `Button`/`Select` primitives — no new visual language | Picker is this package's Radix `Select` in the toolbar's own `<label>`+caption idiom; arrows are `Button variant="secondary" size="sm"`; every class already ships and is already used by `Select`/`Button`. **No new dependency, no new token** | **PASS** |
| AC-13 | Keyboard reachable and screen-reader sane: the picker is a **labelled control**, and X–Y of N is **text a screen reader can read**, not an aria afterthought | Picker asserted by `getByRole("combobox", { name: "Rows per page" })`. Range text is a `<p role="status">` whose `textContent` **is** the visible string and which carries **no `aria-label`**. Tab order asserted across both bars; disabled arrows skipped; no positive `tabIndex` | **PASS** |
| AC-14 | The last page shows the remainder honestly — never a padded page | Page 13 of 312@25 → `301–312`, twelve rows; exact multiple 100@25 → four pages, `76–100`, no empty fifth | **PASS** |
| AC-15 | Unit test: **each page size** renders and reports correctly | First and last page asserted at all four sizes; choosing 100 emits `{ page: 1, pageSize: 100 }` | **PASS** |
| AC-16 | Unit test: **first page disables previous** | Asserted on `.disabled`, in both placements | **PASS** |
| AC-17 | Unit test: **last page disables next** | Asserted on `.disabled`, in both placements; total 0 disables both | **PASS** |
| AC-18 | Unit test: X–Y of N right at the boundaries **including an exact multiple and a total of zero** | Both named explicitly: `Showing 76–100 of 100` and `Showing 0 of 0` | **PASS** |
| AC-19 | Prove the existing `Table` / `DataTableToolbar` tests still pass **untouched** | 189 → 235, **0 existing specs edited**, snapshot sha256 `ce7bd849…` identical to `HEAD` | **PASS** |
| AC-20 | Build clean | `pnpm typecheck` clean under `strict` + `noUncheckedIndexedAccess`, with no app path alias | **PASS** |
| AC-21 | 🔴 The card must say shipping is **two steps** | Stated in `implementation-summary.md` §5, `developer-handover.md` §1, `user-verification-steps.md`, `known-issues.md` D-1 and this report §5 | **PASS** |
| AC-22 | The owner's approved **layout A** is what is built | Count top-left, picker + arrows top-right, arrows bottom-right — matching `mockups/CR-DESIGN-SYSTEM-004/option-a.html`. 5 specs assert the placement rules directly | **PASS** |
| AC-23 | Deployment verified | **N/A — recorded with cause.** Source-only, sha-pinned library: `private: true`, `files: ["src"]`, no build step, no server, no URL, no database. Nothing reaches a user until a consumer moves its own pin | **N/A** |

## 2. The blast radius — the call sites, addressed rather than sampled

The request counted DC importing `DataTableToolbar` in 11 files and `useTableControls` in 7; CR-003's
plan read 9 naming / 6 rendering the toolbar in DC, 1 CRM screen (`AvailabilityView.tsx`) and 4
org-admin screens driving the engine without the toolbar.

**Whether the number is 6, 9, 11 or 20 does not change the answer, and that is the point.** Every one
of those call sites imports `DataTableToolbar`, `useTableControls`, `applyTableControls`, `Table` or
the filter types. This change:

- **adds two files nothing imports yet**, and
- **appends 24 lines to three barrels, deleting none.**

There is no arm added to an existing function, no union widened, no default preserved-or-not, and no
export moved. A call site cannot observe a name it does not import. CR-003 needed a DOM snapshot to
prove its claim because it edited a live component; this change's proof is the diff itself, which
anyone can check without running anything.

⚠ **Stated plainly:** those consumer repositories **cannot be read or run from this sandboxed
worktree** (permission-blocked) — the same limitation CR-001, -002 and -003 each recorded. **No
consumer suite was executed and nothing here claims one was.** The counts above are transcribed from
the approved plan and CR-003's inventory and are labelled as such.

⚠ **One inherited claim is flagged, not resolved:** the request says "the CRM uses neither yet";
CR-003 read CRM's `AvailabilityView.tsx` rendering `DataTableToolbar` with five select filters.
Nothing in this change depends on which is right, but a later session must not inherit "CRM uses
neither" as established fact. `known-issues.md` D-3.

## 3. Standards held

| Standard | Held how |
|---|---|
| **TECH-COMP-003 / ADR-001** — pure UI primitives, no network, no business rules, no permission logic | No fetch, no session read, no `warehouse_id`, no `legal_entity`, no tenancy identifier anywhere in either new file. `offset` is arithmetic on the caller's own numbers, not an instruction to anybody |
| **Radix underpins the interactive primitives** | The only part with non-trivial keyboard/SR behaviour is the picker, and it is this package's Radix `Select`, unchanged — keyboard, typeahead, `role="combobox"`, portal and z-layer all come from the primitive. **Radix ships no pagination primitive**, so there is nothing here that a hand-rolled control replaced. Zero hand-written roles or key handlers; the arrows are native `<button>`s via `Button`, so `disabled` announces for free |
| **UX-DS-003** (Button) / **UX-DS-004** (Select) | Composed as they ship. The disabled-arrow tooltip clause is answered by the adjacent status text rather than a tooltip, and that is recorded as D-9 rather than skipped silently — the reason Previous is unavailable is inches away, is read by a screen reader, and a tooltip on a disabled button would need a pointer-event wrapper this control should not grow |
| **RBAC-PRINCIPLE-001** | No permission logic gained. Named as a consumer obligation instead: `totalCount` must be the count of rows **that person may see**, or a number leaks the existence of records. `developer-handover.md` §2 |
| **Per-surface variants via `data-surface`, not prop drilling** | Inherited: `Select`'s trigger and `Button` already carry their `[[data-surface=tablet]_&]` rules, so both bars grow to tablet height with no prop and no new rule |
| **Additive-only lane rule** | `+24 / −0`. 0 fields removed, 0 defaults changed, 0 exports renamed, reordered or removed |
| **Quality over cost (Hard Rule 2)** | Nothing was trimmed for budget. The keyboard-order, live-region-count and no-callback-on-mount specs are the expensive ones and they are the ones that matter |

## 4. Adversarial checks — what I tried to break

| Check | Result |
|---|---|
| Can the last page be padded? | No. `to = min(offset + pageSize, total)`. Pinned at the remainder and at the exact multiple |
| Can an empty list offer a page 0 or a page 2? | No. `pageCount = max(1, …)`; both arrows disabled at total 0 |
| Can the bar and the consumer's query disagree? | Not if the consumer uses `offset`. `offset + 1 === from` is asserted over 7 cases |
| Can a screen reader hear the range twice? | No. Exactly one `role="status"` across both bars, asserted by count |
| Can two pickers appear? | No. `placement="bottom"` renders none, asserted **by absence** so a tidy-up cannot add one |
| Can a consumer land on page 9 with size 200 against 312 rows? | Not through this control: one callback always emits a complete pair, and a size change resets to page 1 |
| Can a stale page trigger a render loop? | No. Clamping is render-only and a spec asserts **no callback on mount** |
| Can a disabled arrow still fire? | No — native `disabled`; asserted that clicking emits nothing |
| Can the announced text drift from the visible text? | No `aria-label` on the status element; the spec asserts `textContent` equals the exact string |
| Can a consumer pass a page size that is not on the list and blank the trigger? | No. `SelectValue` is given the size in force by name, so the trigger always reads the real number |
| Does anything here import from an app? | No. `tsc --noEmit` runs with no `@/` alias, so an app import cannot resolve |
| Did anything existing move? | No. `+24 / −0` and an unchanged snapshot hash |

## 5. 🔴 What this change does NOT deliver

**CR-DC-052 is not unblocked when this merges.** Consumers pin this package to an exact commit
(DC currently `365be65`). It is unblocked when this merges **and** DC's pin bump merges — two
changes, in that order, in two different lanes, and the pin must move against the **merged sha on
`main`**, never a branch sha (KI-M001E19-002).

**Nothing is faster.** Nothing was slow. This change buys that the control exists, once, in the
shared package, when a list does need paging (D-1).

**The client-side-narrowing trap is not enforced, only written down.** Under option (a) this package
cannot detect that a consumer has combined server paging with `useTableControls`. That is the trade
the owner approved, stated in those terms: `developer-handover.md` §2 and `technical-debt.md` TD-1.
