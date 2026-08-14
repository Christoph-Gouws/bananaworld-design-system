# Decision log — change control · `bananaworld-design-system`

> Material decisions taken under the change lane for `@bananaworld/design-system`.
> One entry per change. Newest first.

---

## CR-DESIGN-SYSTEM-004 — a shared paging control for long lists

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate (after one REVISE round), built on branch `change/cr-design-system-004`. All decisions closed; **0 open** |
| Date | 2026-08-14 |
| Branch point | `origin/main` @ `fc2c5b8` |
| Approved layout | **A** — `Showing 1–25 of 312` at the top left; `Rows per page` + Previous/Next at the top right; the arrows again at the bottom right |
| Approved option | **(a)** — the control is presentation only; the client-side-narrowing trap is answered by a written contract |
| Ship mode | **on-green** |
| Archive | `runs/change-04/` |

### What was asked

Every app has unbounded lists that show everything at once. Add a **shared paging control** to
`@bananaworld/design-system` — a page-size picker (25/50/100/200), previous/next, and an honest
"showing X–Y of N" — so that sixteen lists page from one implementation instead of sixteen.

The request was explicit on three points. **It is not a performance fix** — nothing is slow today and
the owner said so plainly, so no artefact may claim otherwise. **It must be additive** — DC imports
`DataTableToolbar` in roughly eleven files and `useTableControls` in seven, every one of those screens
is live, and none of them asks for paging. And **shipping it is two steps** — consumers pin this
package by exact sha, so CR-DC-052 is not unblocked until this merges *and* DC's pin bump merges.

It also named the one thing that makes this more than a button pair: `useTableControls` narrows
client-side over the rows it holds. Wire that to server paging naively and the operator gets a search
box that searches the 25 rows on screen and silently reports "no match" for a record that exists.

### What was decided at the plan gate

The plan put **both readings of the trap** on the card with the trade-off named, and offered three
layouts. The owner answered twice.

| # | Decision | Rationale |
|---|---|---|
| D-1 | **This is not a performance change and no artefact may claim it is.** | Nothing is slow today; the owner said so. An unverifiable claim cannot pass the close gate. Checked at Stage 05: no artefact in the pack claims one, and nothing measuring speed was run. |
| D-2 | **Option (a): the control is presentation only (TECH-COMP-003); the trap is answered by a written contract.** | (b) — a controlled/server mode on `DataTableToolbar` / `useTableControls` — redesigns a live shared toolbar driven by ~11 call sites across three apps, for a consumer **that does not yet exist**, and cannot answer what `optionsFor` derives its options from when the rows on screen are one page. That question has no good answer without a real caller. Adding (b) later is **itself additive**, so nothing is foreclosed. **Cost, stated rather than softened:** the package cannot enforce the contract, so if a consumer ignores it the defect ships there. |
| D-3 | **(a) and (b) are never mixed.** | A half-controlled toolbar — some narrowing local, some emitted — is the worst of the three and the hardest defect to see. Held: `DataTableToolbar.tsx` and `table-controls.ts` are untouched; there is no partial mode and no unused flag. |
| D-4 | **New files only. `Table.tsx`, `DataTableToolbar.tsx` and `table-controls.ts` are not edited.** | The strongest available additive proof: no existing symbol is called, widened or defaulted differently. Realised as `git diff --numstat -- src/` = **+24 / −0**. |
| D-5 | **One callback, `onChange({ page, pageSize })`, not two.** | Two callbacks let a consumer reach page 9 with a size of 200 against a total of 312 — a state the control would then have to render as "showing nothing". One callback makes it unrepresentable and gives the consumer's fetch effect one dependency. No existing caller constrains the shape. |
| D-6 | **Changing the page size returns to page 1.** | Keeping the first visible row in view needs stable row identity, which a server re-query does not give. Predictable beats clever in a control four apps share. |
| D-7 | **The control clamps for rendering and never calls back to correct its parent.** | A callback fired during render is a re-render loop and a lie about who owns the state. Pinned by a no-callback-on-mount spec so nobody "helpfully" adds one. |
| D-8 | **`Showing 312–312 of 312` is left literal, not collapsed.** | `Showing 312 of 312` reads as a **count**, not a **position**. Ambiguity in a shared control is worse than an ugly dash. |
| D-9 | **Disabled arrows carry no tooltip; the adjacent status text is the reason.** | UX-DS-003's tooltip rule is met by text inches away that a screen reader reads. A tooltip on a disabled button needs a pointer-event wrapper this control should not grow. Recorded rather than skipped silently. |
| D-10 | **`role="status"` on the range text, whose announced text equals its visible text.** | Paging replaces rows silently; the range is the acknowledgement. Same string both ways — the opposite of an aria afterthought. Asserted, including the absence of any `aria-label`. |
| D-11 | **The picker is this package's Radix `Select`; the arrows are `Button`.** | No new dependency, no second idiom, nothing hand-rolled. **Radix ships no pagination primitive**, so the project's Radix rule bites only on the picker — and that is Radix, unchanged. |
| D-12 | **`offset` is part of `TablePageRange`.** | One place computes what the bar says and what the query asks for, so they cannot disagree. Sixteen hand-rolled `(page-1)*size` are sixteen off-by-ones, in the one place where an off-by-one looks like a missing record. `offset + 1 === from` is an asserted invariant. |
| D-13 | **No `variant` prop — one layout is built.** The component does take a `placement` (`"top"` \| `"bottom"`, default `"top"`). | A style variant would be anticipatory configurability and Stage 05 would remove it. `placement` is different in kind: the owner's approved layout **has** two positions, so the component must know which it is drawing. |
| D-14 | **Per-user / per-list page-size memory is NOT built.** | Explicitly out of scope. Raised as a question at the gate rather than smuggled in. Nothing was left half-built for it. |
| D-15 | **`uiBearing: true`** | An operator reads a new line of text and picks a page size. Three mockups plus a comparison page. |
| D-16 | **`epicRecommended: false`** | One control, one pure helper, five files. No new service, integration, tenancy or authorisation model; it does not decompose into five controlled units of work. |
| D-17 | **No consumer pin is bumped and no consumer file is edited.** | Consumers move their own pins, in their own changes, against the **merged** sha — never a branch sha (KI-M001E19-002). |
| D-18 | **The two bars are one component rendered twice, not two exports and not a table wrapper.** | Same props object, so the bars cannot disagree about the page; one copy of the arithmetic; `Table` keeps its neighbours out of its business. |
| D-19 | 🔴 **Exactly one live region per list — only `placement="top"` carries `role="status"`.** | Two bars announcing the same range would speak every page change twice. Asserted by count, not left to care. |
| D-20 | **The picker renders only in the top bar; the bottom bar is arrows only.** | The owner put the picker at the top right. Two pickers would be two sources of truth for one number. Asserted **by absence**, so a tidy-up cannot add one. |
| D-21 | **The top bar is a sibling row between the toolbar and the table — `DataTableToolbar` gains no slot and no prop.** | Putting it in the toolbar would edit the most-depended-upon component in the package (~11 call sites, three apps) to achieve a layout that right-alignment achieves for free. |

### Clarify questions and answers

The plan raised **two** decide-points for the owner, and both were answered. The owner responses
recorded for this change were:

- **`[plan]` — plan REVISE:** *"Let's put the rows per page picker at the top right of the list please
  with the next and previous page arrows at the top and bottom right of the list."*
- **`[plan]` — plan APPROVED (layout A) — ship on-green.**

**The first response is a material design decision and is treated as one.** Revision 1 of the plan
drew a single paging strip **under** the list. The owner replaced that arrangement outright: the
picker once, at the **top right**; the arrows **twice**, top right and bottom right. Revision 2
redrew all three mockups to that arrangement and reduced the remaining open question to where the
`Showing 1–25 of 312` line sits — A (top left), B (in the right-hand cluster) or C (at both ends).

That instruction is also what forced D-18, D-19 and D-20 into existence: rendering the control twice
around one list creates a duplicate-live-region hazard and a two-pickers hazard that a single strip
never had. Both are now rules with specs behind them.

**The second response settled decide-point 1: layout A**, which the plan recommended. It also, by
approving the plan **as written**, settled decide-point 2 — the plan states in §2 that *"this plan is
written to do option (a)"* and the owner gave no instruction to switch. Option (a) is therefore what
was built (D-2), and it was not silently mixed with (b) (D-3).

Plan open questions 3 (remembered page size), 4 (the CRM discrepancy) and 5 (the missing cross-system
register) were flagged as non-blocking and were not answered; they are carried forward as D-14,
`known-issues.md` D-3 and `known-issues.md` C-3 respectively.

**No further clarification was requested and none was needed** — no new decision arose during the
build that the approved plan had not already answered, so no `NEEDS_OWNER: decision` gate was hit.

### The new contract this change creates

A consumer obligation, binding on CR-DC-052 first, written in three places (the fenced comment atop
`src/components/TablePagination.tsx`, `runs/change-04/evidence/developer-handover.md` §2, and
`runs/change-04/technical-debt.md`):

> A table whose rows are paged **by the server** must not use `useTableControls` for searching or
> filtering. `useTableControls` narrows only the rows it holds, which is one page. Send the search
> text and the filter values to the server and let it decide both the rows and the total; feed the
> total back into `TablePagination.totalCount`. Using both together produces a search that hides
> matching records with no indication that it has.

And with it: `totalCount` must be the count of rows **that person may see** — the same scope filter as
the page query — or a number leaks the existence of records (RBAC-PRINCIPLE-001).

### Deviation from the approved plan

**One, and it is a path rather than a premise.** The plan puts the arithmetic spec at
`tests/lib/table-paging.test.ts`; `vitest.config.ts` globs only `tests/pricing/**`,
`tests/sales-order/**` and `tests/components/**/*.test.tsx`, so a file there would never have run.
The repo's own precedent — `table-controls.ts` is a `src/lib` module tested at
`tests/components/table-controls.test.tsx` — was followed instead, leaving `vitest.config.ts`
untouched as the plan requires. `known-issues.md` A-1.

Everything else the plan cites was spot-checked against the code before building and was **exact**:
9 of 9 facts, nothing stale, `main` had not moved.

### Outcome

Built as approved. `pnpm typecheck` clean; `pnpm test` **235 passed / 13 files** (baseline **189 / 11**
before any edit, so **+46** new specs and **0** existing specs edited). Source diff **+24 / −0** —
zero deletions and zero modified lines; the committed `DataTableToolbar` snapshot hash is unchanged
(`ce7bd849…`). Dependency audit: 6 highs, all six on the standing owner-approved ignore list, 0 new.
No migration (this package has no database) and no throwaway Postgres started. **0 open defects, 0
open decisions.** Two technical-debt items recorded, both with a named owner and a revisit trigger.
Full evidence in `runs/change-04/`.

🔴 **CR-DC-052 is not unblocked by this change alone** — only by this **and** DC's pin bump, in that
order, against the merged sha on `main`.

---

## CR-DESIGN-SYSTEM-003 — a toolbar filter may hold several values

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-003`. All decisions closed; **0 open** |
| Date | 2026-08-14 |
| Branch point | `origin/main` @ `9aa20f7` |
| Approved layout | **A** — the closed trigger reads `Cape Town +2` |
| Ship mode | **on-green** |
| Archive | `runs/change-03/` |

### What was asked

A toolbar filter models a filter as a single value (`FilterValue { kind: "select", value: string }`)
rendered as a Radix Select with an "All" sentinel. One choice replaces the last; there is no way to
express "these two". From the CRM availability screen, a rep wants two rooms, or three depots.

**Add a multi-select filter kind beside the existing one.** A filter definition declares which kind it
is; a screen that wants one value keeps declaring exactly what it declares today and behaves
identically. The request was explicit that this is additive or it is wrong: no existing caller changes
a line and none changes behaviour — and that if the design pulls toward reshaping the single-select to
make room, the answer is to stop and say so rather than migrate nine screens inside a package change.

Excluded by the request: new filter types beyond multi-select, search inside the filter list, grouping,
"select all matching", and any change to the search box, the date-range filter or the toolbar layout.

### Clarify questions and answers

**No `[clarify]` questions were raised or answered on this change.** The owner responses on record are
a single line: *plan APPROVED (layout A) — ship on-green*. The plan's brief asked exactly one question
— how a filter holding several choices should read when closed — and it is answered by that approval;
it is recorded as D-16 below.

### What was decided at the plan gate

**The plan was APPROVED, ship mode on-green, layout A.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **`multiSelect` is ADDED as a third kind. `select` is not reshaped, not deprecated, not migrated.** | Additive-only is the lane rule. Reshaping would migrate eleven call sites across three repos inside a package change — the epic the request forbids. The tempting alternative (a `multiple?: boolean` on the existing def) was considered again during the build and rejected in writing. |
| D-2 | **`values: []` means All**, mirroring `select`'s `value: null`. | One mental model for both kinds; `clear()` and `emptyFilterValue` then need no special case. |
| D-3 | **Union, never intersection**, and no option to choose between them. | A row holds one value per filter, so "and" is always empty. An option would be anticipatory configurability for a case that cannot occur. |
| D-4 | **Radix `DropdownMenu.CheckboxItem`** — not a new Popover dependency, not a hand-rolled list. | Keyboard, focus and screen-reader behaviour are why the primitive exists (project rule). Already a dependency, already shipped in `RowActions`, so no new dependency and no second dropdown idiom. |
| D-5 | **`onSelect` preventDefault keeps the menu open across toggles.** | Otherwise the menu closes per value and the change fails at the thing it exists to do. Mutation-tested at build time rather than trusted. |
| D-6 | **The "All" wording is reused verbatim from the Select sentinel.** | An unset filter must read identically whichever kind it is, or the toolbar has two vocabularies. Implemented as one shared `allOptionLabel` function so it is structural rather than a promise. |
| D-7 | **The stored shape is a bare `string` for one value and `string[]` for two or more.** | Maximises what a build on an older pin reads correctly: a single-value multi-select is invisible to it, so only the genuinely multi-value case needs new reader code. **This is a new contract consumers must follow** (see below). |
| D-8 | **Two pure stored-shape helpers ship, with a `widened` flag; the wording of any notice stays in the app.** | The package supplies the fact; "the depot filter now shows every depot" is app vocabulary (TECH-COMP-003). |
| D-9 | **The filter def/value types are added to the barrels.** | Their absence is already recorded as a wart in CRM's own source (`AvailabilityView.tsx:118` pins the shape with `as const` because `FilterDef` was unreachable). A consumer writing a two-shape reconciler must be able to *name* `MultiSelectFilterValue` or it re-declares it locally and drifts. Additive; same reasoning as CR-002's D-7. |
| D-10 | **The multi-select control stays private to `DataTableToolbar.tsx`**, like the other two controls. | Exporting it as a standalone primitive is anticipatory — org-admin, which renders its own controls over the shared engine, has not asked. |
| D-11 | **Characterisation tests for the existing kinds are written BEFORE any source edit.** | There was **no test for this engine at all**, so a green suite proved nothing about the existing screens and citing it as the additive proof would have been hollow. This is the request's *"prove it, do not assert it"* read literally. |
| D-12 | **`uiBearing: true`** — three mockups plus a comparison page. | A rep reads and picks something genuinely new the first time a screen adopts it, and the owner had to choose the closed-state reading. |
| D-13 | **`epicRecommended: false`.** | One filter kind, one control, five files. No new service, integration, tenancy or authorisation model. It does not decompose into five controlled units of work. |
| D-14 | **No consumer pin is bumped and no consumer file is edited.** | Consumers move their own pins in their own changes, against the **merged** sha on `main` — never a branch sha (KI-M001E19-002). |
| D-15 | **DC's stale private copy of `table-controls.ts` is not touched.** | Another repo, another lane. Named as seam S-4 debt for DC's own change. |
| **D-16** | **LAYOUT A — the closed trigger names the first chosen value and counts the rest: `Cape Town +2`.** | **The owner's decision at the plan gate**, from three drawn options (A: first + more · B: count only, `3 of 7 depots` · C: tags in the trigger). A names something real, holds one line, truncates predictably and keeps a stable width in a narrow toolbar. It was the plan's recommendation and the owner took it. |
| D-17 | **The blast radius is eleven call sites across three apps, not the nine across two the request assumed.** | Recorded rather than corrected silently: six DC toolbar screens (not eight — two files name `DataTableToolbar` only in comments), one CRM, plus **four org-admin screens that drive the shared engine without the toolbar and that the request did not know about**. No scope change: all eleven are proved unaffected. |

### Decided during the build

| # | Decision | Rationale |
|---|---|---|
| D-18 | **The menu caps its height to the room Radix reports and scrolls inside it** — not in the plan. | CR-DC-008 is exactly this bug on `Select`: with no height cap nothing overflows, so a long list silently looks like it ends. One class, applied before a fifty-item customer list can repay for the lesson. Affects only the new control. |
| D-19 | **`allOptionLabel` is extracted and the existing `SelectFilterControl` calls it too**, touching one pre-existing render line. | D-6 made structural instead of duplicated. Because it touches an existing line it was **proved, not argued**: the seven screens' DOM snapshot hash is unchanged (`ce7bd849…`). Had it moved, the refactor would have been reverted. |
| D-20 | **The stored-shape contract deliberately does not carry date ranges.** | `string \| string[]` cannot express two bounds, so a `dateRange` reads back cleared and reports `widened: true` rather than pretending. Documented in the source; CRM's availability screen has no date filter. |

### The contract this creates for consumers

**A filter value is stored as a bare `string` when it holds one value, and as a `string[]` only when
it holds two or more**, and `filterValueFromStored` reports `widened: true` whenever a stored shape
could not be represented. This binds CRM's saved availability views first (CR-CRM-011): the full
seven-point obligation is in `runs/change-03/evidence/developer-handover.md` §3, and **until all seven
are done CRM must not declare any availability filter as `multiSelect`.**

### Verification

`pnpm typecheck` clean · `pnpm test` **189 passed / 11 files** (baseline before any edit: 115 / 9;
+74 new specs, **0 existing specs edited**) · the seven toolbar screens' DOM snapshot hash **unchanged**
across the source edit · `src/` **+347 / −26** with every deletion itemised · dependency audit
reproduced in Node: 6 highs, all six already on the standing owner-approved ignore list, **0 new** ·
no migration and no database · 0 open defects.

---

## CR-DESIGN-SYSTEM-002 — the document header moves into the shared package

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-002`. **All decisions closed; D-12 answered by the owner 2026-08-14** (unrelated CI dependency advisory — overridden, not ignored) |
| Date | 2026-08-14 |
| Branch point | `origin/main` @ `365be65` |
| Approved layout | **n/a — not UI-bearing** (D-9) |
| Ship mode | **on-green** |
| Archive | `runs/change-02/` |

### What was asked

Move Bananaworld-DC's four-slot document header — Date, DC, Raised by, Document no. — out of DC and
into this package, so that the CRM's numbered documents can wear the **same** header rather than a
second hand-built one that drifts.

The driver: DC put this header on fourteen forms in EPIC-023 and its flag went on in production on
2026-08-10. There are two ways to make the CRM match and only one survives contact with time. This
estate already has the scar — DC's own `DocumentPdf` comment records ten surfaces each spelling
their own label as *"exactly the drift this milestone exists to stop"*.

The request carried a hard precondition: the component was app-coupled until **CR-DC-039** removed
its `useAuth()` session read, and a coupled component may not enter this package (TECH-CON-004 /
TECH-COMP-003). **Verified before any code was written: CR-DC-039 landed, no `useAuth` import or
call remains, DC's own guard at `transaction-form-standard.test.ts:885` asserts the same.**

### Clarify questions and answers

**No `[clarify]` questions were raised or answered on this change.** The single owner response on
record is the plan-gate approval below. The plan's own owner brief carried one *confirm point* rather
than a question — see D-2 — and the plan was approved with it in place.

### What was decided at the plan gate

**The plan was APPROVED, ship mode on-green, layout n/a.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **The header is ADDED to this package. DC is not touched.** | Additive-only is the lane rule: five repos pin this package by git sha. Consumers move their own pins in their own changes, against the **merged** sha (never a branch sha — KI-M001E19-002). The move is two halves in two repos, and between them the header exists in both trees. |
| D-2 | **The eight transitional pieces are NOT re-created.** | The request asked that `PRE_EPIC_HEADER_SLOTS` and `renderedBeforeThisEpic` be carried across as the flag-OFF rollback. **They no longer exist** — deleted by CR-DC-046 on 2026-08-12 under the owner's own ruling **DECISION-358**, which made numbering permanent and ON; `renderedBeforeThisEpic` has zero occurrences in DC's `src/`. Re-adding owner-deleted rollback code to a shared package is a regression, not fidelity. **Surfaced to the owner in the plan's brief as a confirm point, not decided silently**, and repeated in `user-verification-steps.md`. |
| D-3 | **No flag prop is added.** | The request named the feature flag as "the one honest coupling to solve" and expected a prop. There is no longer a question for a prop to answer: CR-DC-046 also removed `useDocumentNumbering` and `DocumentNumberingProvider` from the component. Adding one now would be the "configurability added in anticipation" the request forbids. **No app import was smuggled in to avoid the question** — guarded by `tsc --noEmit` and by a source scan. |
| D-4 | **Only the pure day-line describer crosses (`src/lib/document-date.ts`); DC's SQL fragments, column map, row readers and validator stay in DC.** | The describer is presentation — two calendar-day strings in, a mood and two sentences out; it picks a colour and a sentence and never blocks a save. The rest is business rules and database shape, excluded by TECH-COMP-003. The rejected alternative (the app computes the sentences and hands them in) is "purer" but puts the wording and the threshold back into each app — the second copy that drifts, i.e. the exact thing this change exists to prevent. |
| D-5 | **The 60-day threshold moves with it, unconfigurable.** | Uniformity across the apps is the point of the change. An override prop is an additive change later, if ever needed. |
| D-6 | **All 🔴/⚠ fences travel verbatim with their DC anchors.** | They are the record of why the discriminant stays, why `auto` is a value and not a disabled input, why `<dl>` was chosen. **Four were adapted** because their subject was the file's old location and they would otherwise have been false statements in the new home — including one instructing the reader not to perform the move that the file *is*. Each is listed individually in `changed-files.md` §3. |
| D-7 | **`DocumentDateSlotState` is added to the barrel** although DC's own barrel does not re-export it today. | DC's `use-document-date.ts:28` reaches it by deep path; after adoption that path is gone and its follow-up needs somewhere to point. Additive, and it costs nothing. |
| D-8 | **`epicRecommended: false`.** | Two new files and three barrel edits. No service, no integration, no tenancy or authorisation model. It does not decompose into five controlled units of work. |
| D-9 | **`uiBearing: false`.** | The change is *defined* by byte-identical rendering. No operator, in any of the five consumers, reads or picks anything different. There is nothing to mock up: the approved design is the shipped screen. |
| D-10 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is not created.** | It does not exist and there is no `governance/` directory. Creating one is a governance decision, not part of this change. **Second consecutive change to raise it** (CR-DESIGN-SYSTEM-001 D-12). Flagged, not invented. |

### Decided during the build

| # | Decision | Rationale |
|---|---|---|
| D-11 | **`src/index.ts` is also edited (+7 / −0)**, beyond the plan's four-file table. | That file enumerates its `./lib` re-exports by name rather than starring them, so the describer would have existed in the package and been **unreachable from the package root**. The approved approach required it; the plan's §7 table was one file short of its own §7.1 intent. Logged as defect D-1 — unfixed it would have surfaced in DC's lane weeks later as this change's problem. |

### Decided by the owner at the decision gate — D-12

| # | Decision | Status |
|---|---|---|
| D-12 | **Two new `nanoid` advisories that fail CI's `dependency-audit` job are cleared by a `pnpm.overrides` bump — NOT by a seventh `ignoreGhsas` entry.** | **ACCEPTED — owner ruling, in writing, 2026-08-14.** Applied and pushed to this branch as `13d90bb`. |

**Not attributable to this change.** When the block was raised, `package.json` and `pnpm-lock.yaml`
were untouched on this branch, so the dependency tree was byte-identical to `main` and the same job
would have failed on any PR opened against this repo that day. The two files are now deliberately
changed **by the owner's fix**, and by nothing else — no source file moved in that round.

**What was found.** CI runs `pnpm audit --prod --audit-level=high`. Two **high** advisories were
unignored and therefore blocking:

- `GHSA-28wg-ghj8-5hjv` — nanoid `<3.3.16`, non-secure generators can loop indefinitely on negative size
- `GHSA-2v37-7h3g-55p8` — nanoid `<3.3.18`, custom generators can loop indefinitely when size is zero

**The path.** Both reached this package solely via `. > next@15.5.19 > postcss@8.4.31 > nanoid@3.3.12`
— the auto-installed `next` **peer** (`autoInstallPeers: true`), the identical route as the six GHSAs
the owner approved ignoring on 2026-07-22 (sharp) and 2026-07-26 (next/postcss). Those approvals set
the revisit trigger *"when the estate advisory batch bumps next"*; this was that trigger firing. The
library ships TypeScript source only (`files: ["src"]`) and never calls nanoid.

**The ruling, and why the recommendation was overturned.** This session's predecessor recommended
extending `ignoreGhsas` now and doing the override later, estate-wide. **The owner chose the override
instead, and the reasoning is the better one:** the standing next-peer ignore records its own revisit
trigger as *"when the estate advisory batch bumps next"*, so booking a **seventh** standing exception
at the exact moment the sixth said to stop is the wrong direction. Bananaworld-DC met the identical
advisory first and resolved it exactly this way (`a20cf381`, PR #160, 2026-08-08), so this repo now
matches the estate rather than diverging from it.

```jsonc
"pnpm": { "overrides": { "nanoid@<3.3.17": "^3.3.17" } }
```

`ignoreGhsas` **was not extended** — it still holds the same six entries, and no Hard Rule 2 citation
was added or needed. That absence is the substance of the ruling: an ignore trades a risk away and so
is the owner's to sign; an override removes the risk and so trades nothing. Resolved version in
`pnpm-lock.yaml` is **`nanoid@3.3.18`**, above both advisory ceilings.

**⚠ A claim in the previous round is corrected rather than deleted.** That round recorded the override
as *"mechanically impossible in this session"*. **That was wrong, and the distinction matters.** It was
a *session permission* limit — `pnpm` could not be run, so the lockfile could not be regenerated — not
a property of the fix. The owner applied it from the desktop into this same worktree, so the branch and
the remote never diverged. The honest statement is "this session could not perform it", not "it cannot
be done". Corrected in `known-issues.md` B-4/E-1, `changed-files.md` §4, the owner card, and
`SESSION_HANDOVER.md` note 8.

**Verified after the fix.** `pnpm install --frozen-lockfile` passes (lock and manifest agree) ·
`pnpm audit --prod --audit-level=high` exits 1 before / 0 after · `pnpm typecheck` clean ·
`pnpm test` 115 passed / 9 files. **All five PR #10 checks are green** on `13d90bb` — Typecheck,
Test, **Dependency Audit**, SAST (Semgrep CE) and Secret Scanner (Gitleaks).

### The contract this creates for consumers

**A forward API contract, frozen:** the eight component exports and the four describer exports listed
in `evidence/developer-handover.md` §2 are the names DC's adoption change compiles against. They were
carried over from DC unchanged **deliberately**, so DC's follow-up is a change of import path only,
never of call sites. Renaming any of them here would be a second migration DC absorbs invisibly.

**And a shared-wording contract:** the day-line sentences and the 60-day threshold now bind the CRM
too (seam S-3). That is the intended uniformity, recorded here so it is a decision rather than a side
effect nobody noticed.

### Verification

`pnpm typecheck` clean · `pnpm test` **115 passed / 9 files** (baseline 79 / 7) · **0 open defects** ·
`git diff --numstat -- src/` → **34 insertions, 0 deletions** · byte identity vs DC's `main`:
**282 / 282 code lines, 2 differing, both import specifiers**.

---

## CR-DESIGN-SYSTEM-001 — a colour swatch and an accessible name on a ChoiceGroup chip

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-001` |
| Date | 2026-08-04 |
| Branch point | `origin/main` @ `b1373c7` (the sha Bananaworld-DC pins) |
| Ship mode | **on-green** |
| Archive | `runs/change-01/` |

### What was asked

Let a `ChoiceGroup` chip carry a colour swatch and its own accessible name, **additively**.

The driver: Bananaworld-DC change **CR-DC-022** set out to replace the tablet receiving screen's
colour-stage dropdown with tappable chips, so a receiver in gloves picks a banana colour stage in
one tap instead of tap-scroll-tap. It could not be built. At the pinned sha a `ChoiceOption` was
exactly `{ id, name, disabled? }` and the chip rendered `{option.name}` as its only child — no
swatch, no adornment slot, and no way to give a chip an accessible name distinct from its visible
text. The owner's layout needs a colour block beside a short code (CS1, CS2 …) with the full stage
name ("Green with trace of yellow") still reachable to a screen reader and as a tooltip. Neither the
chosen layout nor its alternative was expressible against the existing props, so CR-DC-022 shipped
its other two items and this became its own change in the design-system repository.

### What was decided at the plan gate

**The plan was APPROVED, with layout B, ship mode on-green.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **Two optional fields on `ChoiceOption`: `swatch` and `description`.** Nothing removed, no default changed, no export surface moved. | Five repos pin this package by git sha and each bumps when it chooses. A change that forces them all to move at once is not a change, it is a coordinated multi-app migration — i.e. an epic. Purely additive is what keeps it a change. |
| D-2 | **Field names frozen as `swatch` and `description`.** | So DC's prepared follow-up (`ColourStageChips.proposed.tsx.txt`, which maps `swatch: { hex: stage.colour_hex, accentHex: stage.accent_hex }` and `description: formatColourStageLabel(stage)`) compiles against the merged package without edit. |
| D-3 | **`accentHex` typed `string \| null \| undefined`**, not `string \| undefined`. | Matches `ColourSwatchProps` exactly and matches DC's `ColourStageOption.accent_hex?: string \| null`. Narrowing it would force every caller to strip nulls — how an "additive" change quietly becomes a migration. |
| D-4 | **Layout B — the full-height colour stripe** flush to the chip's left edge, with the short code beside it. | **The owner's choice**, made at the plan gate from three rendered mockups (A: small square — the treatment already reviewed at CR-DC-022; B: full-height edge stripe; C: larger round dot). B reads as a colour-coded row from further away — the strongest option across a cold room — at the cost of a slightly bolder look. The trade recorded in the mockup: a chip with a colour is slightly wider than one without, and the pale selected fill has less room to show. |
| D-5 | **Reuse the existing `ColourSwatch`; do not write a new one.** Chip-relative sizing lives in `ChoiceGroup`. | `ColourSwatch` already handles the solid and blended two-colour cases and is already `aria-hidden`. But only `ChoiceGroup` knows the 32px browser / 48px tablet chip the stripe must fit — putting the sizing in `ColourSwatch` would silently resize every other `ColourSwatch` caller in every consumer. |
| D-6 | **Keep Radix `RadioGroup` underneath.** | One tab stop, arrow keys between options, announced as a radio group. A hand-rolled group of buttons that looks identical and loses that is a regression, not a simplification — keyboard, focus and screen-reader behaviour are the reason the primitive exists. |
| D-7 | **`description` must be a SUPERSET of the visible text** — recorded as a written contract in the component's doc comment. | `aria-label` *replaces* the accessible name, it does not extend it. A chip reading "CS3" with `description: "Green with trace of yellow"` would be announced as only the long name, so the code the operator can see would never be spoken. Correct for DC (whose `formatColourStageLabel` includes the code), but without it written down the next caller silently loses the visible label from the announcement. |
| D-8 | **Keep `title` even though it gives no tooltip on a touchscreen**; reject wrapping chips in Radix `Tooltip`. | `title` only fires on hover, and the tablet is the whole reason this change exists — so on tablet the long name rides on the accessible name alone. Kept anyway: it is the agreed contract, costs nothing, and serves the browser surface. The `Tooltip` alternative would add a wrapper element and a `TooltipProvider` requirement to **every existing caller's** DOM, breaking the byte-identical rule outright. Rejected on that ground, not on taste. Disclosed to the owner in the plan's brief as an honest limit. |
| D-9 | **No consumer pin bumped by this change.** | Each consumer moves its own pin, in its own change, against the **merged** sha on `main` — never a branch sha. KI-M001E19-002 is that exact mistake on record. |
| D-10 | **The colour-stage chip component is NOT built here.** | It belongs in Bananaworld-DC and is the follow-up change. This change delivers the capability, not the screen. |
| D-11 | **`epicRecommended: false` — this is a change, not an epic.** | Two files, one optional-field pair, no service, no integration, no tenancy or authorisation model, no new section of the system. It does not decompose into five controlled units of work. |
| D-12 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here.** | It does not exist in this repo and there is no `governance/` directory. Creating it is a governance decision, not part of this change — flagged rather than invented. Seams are recorded in the plan, in `centrality-scorecard.md` and in `developer-handover.md`. |

### Clarify questions and answers

The owner responses recorded for this change were:

- **`[plan]` — plan APPROVED (layout B) — ship on-green.**

That single response settled the one open question the plan raised for the owner (open question 1,
the swatch treatment: small square / edge stripe / round dot). The plan's stated default had the
owner not picked was **A** (the reference proposal's square, already reviewed at CR-DC-022); the
owner picked **B** instead, so B is what was built. See D-4.

Open question 2 in the plan (whether to add a cross-system change register to this repo) was noted
as non-blocking and was not answered; it is carried forward as D-12 and `known-issues.md` C-4.

**No further clarification was requested and none was needed** — no new decision arose during the
build that the approved plan had not already answered, so no `NEEDS_OWNER: decision` gate was hit.

### Findings against the reference proposal

The change request supplied a complete drop-in replacement written during CR-DC-022 in another
repository, by a session that could not run this package's tests, and explicitly asked that it be
verified rather than pasted unread. It was verified. Three findings, all recorded in the plan §2.3
and honoured in the build:

1. **A comment contradicted its own code** — it claimed "28px (ColourSwatch's own default) fills a
   32px browser chip" while the code set 16px. 28px cannot fit a 32px chip that also has a 1px
   border, 12px of horizontal padding and text beside it. The comment was not carried over.
2. **The `aria-label` replacement behaviour was undocumented** → became D-7.
3. **The touch-tooltip limit was unstated** → became D-8.

Otherwise the proposal was sound and was kept: same field names, same placement, same Radix
foundation. The visual treatment differs only because the owner chose layout B after it was written.

### Outcome

Built as approved. `pnpm typecheck` clean; `pnpm test` **79 passed / 7 files** (baseline 61/6 before
any edit, so +18 new tests). 57 insertions and **0 deletions** in the source file. 0 open defects.
Full evidence in `runs/change-01/`.
