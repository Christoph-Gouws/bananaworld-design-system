# Decision log — change control · `bananaworld-design-system`

> Material decisions taken under the change lane for `@bananaworld/design-system`.
> One entry per change. Newest first.

---

## CR-DESIGN-SYSTEM-010 — review follow-up on CR-DESIGN-SYSTEM-009 (3 reviewer findings)

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **BUILT, GREEN, CLOSED OUT, PR OPENED.** Plan-gate decision ACCEPTED; D-1…D-6 recorded below. 0 open defects, 0 open decisions |
| Date | 2026-09-10 |
| Branch point | `origin/main` @ `3143646` (CR-DESIGN-SYSTEM-009, merged as PR #22) |
| Approved layout | **A** — the tick at the top means "everything is showing" |
| Ship mode | **on-green** |
| Archive | `runs/change-09/` |

### What was asked

An independent reviewer session was given CR-DESIGN-SYSTEM-009's owner-approved plan and its diff —
and nothing the build session had written about its own work — and asked one question: *does this do
what was approved?* It raised three defects. Each was judged real; none was severe enough to send
CR-009 back to its builder, so **CR-009 merged with them in it and the code went live**. This change
fixes them.

| # | Severity | The reviewer's finding |
|---|---|---|
| **F1** | medium/high | `GridFilterRow.tsx:281` — the grid's multi-select counts and commits only ids present in `options`, silently under-reporting and then discarding a stored id the option list no longer offers — diverging from the toolbar, which **this same change deliberately taught to preserve unknown values** |
| **F2** | medium/high | `DataTableToolbar.tsx:397` — tapping the new tri-state "Select all" commits every option id instead of clearing, so it **narrows** the table (dropping rows whose value is null/blank) and lights "Clear", where the row it replaces widened to everything |
| **F3** | medium/medium | `Table.tsx:481` — `TableCellProps.width` shadows the inherited `TdHTMLAttributes.width` and is destructured out rather than forwarded, so the legacy HTML attribute is silently lost and any consumer passing it fails typecheck at its pin bump |

### What was decided at the plan gate

**APPROVED, layout A, ship mode on-green.** One recorded owner response: `[plan] plan APPROVED
(layout A) — ship on-green`. No revision was asked for and no clarification was sought, so there are
**no `[clarify]` lines for this change** — stated explicitly, because an absent record and an
unrecorded one look identical from outside.

| # | Decision | Rationale |
|---|---|---|
| **D-1** | 🔴 **All three findings were re-confirmed against the code AS IT STOOD before any fix was designed, and all three still held.** None was dropped. | A finding is one reviewer's reading of a diff at one moment, and a later change may already have corrected it — implementing a fix for a defect that is not there makes the system worse and passes every gate on the way. `main` had not moved (`HEAD` = `3143646`, the plan's own merge base) and **every line reference the plan cites was exact**: `GridFilterRow.tsx:284/289/293/343`, `DataTableToolbar.tsx:399`, `GridFilterRow.tsx:326`, `Table.tsx:483`/`:487`. **F3 was confirmed by COMPILING rather than by reading**, because the plan itself flagged that `node_modules` was absent when it was written: `@types/react/index.d.ts:3541-3551` declares `TdHTMLAttributes.width?: number \| string`, `:3553-3560` declares none on `ThHTMLAttributes`, `git show 6ed975d:src/components/Table.tsx` contains **no `width` at all**, and a probe reproduces `TS2322` against the pre-change tree. |
| **D-2** | **Three findings, ONE fix — finish the extraction rather than patch three call sites.** The value arithmetic joins the presentation in `MultiSelectMenu.tsx` (`multiSelectChosenLabels` moved in from the toolbar, `multiSelectToggle` new), and both surfaces call it. | CR-009's stated remedy for *"two multi-selects that look or count differently is the defect"* moved the **presentation** and left the **value arithmetic** — which stored ids count as chosen, what labels they produce, what a tick commits — duplicated at each call site. Three of the four duplicates then disagreed (F1) and the fourth was wrong in both copies (F2). Patching each site would leave the same structure that produced the divergence in the first place. **The count is now `values.length` in both surfaces, by construction.** |
| **D-3** | 🔴 **The master row LOSES THE ABILITY TO NARROW: `onToggle: (all: boolean) => void` becomes `onShowEverything: () => void`.** | Radix hands the next checked state, and **all three starting points now mean the same thing** (stop narrowing). A boolean the call site must interpret is exactly how F2 got in — both call sites read `all === true` as "commit every option id", which drops every row whose value is blank (`matchesFilter` requires `actual !== null`) and lights "Clear" on a gesture made to see MORE. With no boolean to branch on and no id list reaching the row, **the defect becomes unreachable rather than fixed** — the same argument `useCellLayout` makes about conditional hooks in `Table.tsx`. ⚠ **This is a RENAME on an internal, un-barrelled component** whose only two callers are in this package and both changed here; `components/index.ts` is byte-unchanged, so no export surface moved and the lane rule holds. |
| **D-4** | **The owner picked layout A** — ticked + `All N` when nothing is chosen, a dash + `N of M` while some are, ticked + `N of M` when every option is named by hand. | The tick means *"nothing is being hidden"*, which is the honest reading of the not-narrowed state, and tapping the row always returns to the whole list — blanks included. ⚠ **Ticking every option by hand is still NOT "everything"**, and that is deliberate: it is a request for N named values, so a blank-valued row is correctly left out. `All 3` versus `3 of 3` is what tells the two ticked states apart on screen; both readings are asserted by spec. The pick changed **two lines** — `state` and `count` — and nothing else in the change depended on it. |
| **D-5** | **`TableCellProps.width` is WIDENED to carry both meanings (`TableColumnWidth \| number \| (string & {})`), not renamed.** `TableHeadProps` is deliberately **not** widened. | Renaming the prop to `columnWidth` removes `width` from the export surface, which the additive-only lane rule **forbids outright**, and it would leave the head and the cell with two different names for one column answer — defeating CR-009 §C.4a's *"declare the step once and pass it to all three"*. The four step names are not valid HTML widths, so no value changes meaning in either direction. **The asymmetry with `TableHead` is React's, not this file's:** `ThHTMLAttributes` declares no `width`, so `<TableHead width={120}>` was already a type error before CR-009 and is not a regression — widening it would be a new feature wearing a repair's clothes. ⚠ Plan **OQ-2 is settled: `(string & {})` compiles cleanly under this repo's TS config**; the `\| string` fallback was not needed. |
| **D-6** | **`src/lib/table-controls.ts` is NOT touched — the engine is right, and the defect is at the control that builds the list.** | The reviewer's F2 cites `matchesFilter`'s multiSelect arm. But `[]` meaning "not narrowed" and a non-empty list meaning "these values only" is correct. Teaching the engine that "every option" means "no filter" would change behaviour for **every existing multiSelect caller** the moment a reader ticked the last box by hand — a larger and much quieter change than the defect itself, and not additive. |

### Clarify questions and answers

**None.** The plan gate produced exactly one owner response — `[plan] plan APPROVED (layout A) — ship
on-green` — with no revise note and no clarification requested. Recorded explicitly per spec §3a.4, so
that "no questions were asked" is distinguishable from "questions were asked and not written down".

### Also recorded

- 🔴 **One half of F1 is a behaviour correction in already-shipped toolbar code, not a re-alignment.**
  The *discard* on a tick was symmetric — the toolbar dropped unknown ids too, with a comment
  defending it — so both copies were repaired. The plan said so at §0 and it is restated here because
  the two halves of F1 have different characters and only one is drift.
- **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is still NOT created here — the ninth consecutive
  change to raise it** (CR-001 D-12, CR-002 D-10, CR-003, CR-004, CR-005 D-12, CR-006 D-12,
  CR-007 D-7, CR-009 D-8, here). Creating it is a governance decision for the owner, not something a
  change may invent. The plan's six-seam map (§4) plus `runs/change-09/` is the record meanwhile.
  ⚠ Separately, still true: **there is no decision-log entry for CR-DESIGN-SYSTEM-008** — this log
  jumps 007 → 009.
- **No Stage 07 amendment to a rule, contract or workflow was required.** No rule changed
  (additive-only, one-class-per-axis, "consumers move their own pin against a merged sha" and "Radix
  underpins the interactive primitives" were all *obeyed*); no contract changed (`GridFilterValue`
  and `FilterValue` shapes are untouched — only *which ids survive a tick* changed, and `TableCell`
  regained a meaning it had before CR-009); no workflow changed. **This is the recorded N/A, with its
  reason — an unrecorded one would be a skip.**
- **No consumer pin was bumped** (project rule; KI-M001E19-002). No consumer can currently be running
  the defective code at all: `selectAll` and `multiple` did not exist before `3143646`, and
  `bananaworld-dc` pins `6ed975d` (verified at its own `package.json:55`).

---

## CR-DESIGN-SYSTEM-009 — a filter cell holds several values, and the grid reads at a compact density

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **BUILT, GREEN, CLOSED OUT, PR OPEN.** Plan-gate decisions ACCEPTED (D-1…D-8). **D-9 DECIDED by the owner — option A, and D-11 records that it is now EXECUTED.** D-10 (execution owed) is **SUPERSEDED**. `dependency-audit` measures **0 blocking** |
| Date | 2026-09-09 |
| Branch point | `origin/main` @ `6ed975d` (CR-DESIGN-SYSTEM-008, merged as PR #20) |
| Approved layout | **B** — three column width steps, per column |
| Ship mode | **on-green** |
| Archive | `runs/change-08/` |

### What was asked

The owner, about the reporting module this package's grid controls render:

1. *"If I look at the columns and I want to filter by things in the column, I can only select one item
   at a time. That's not very helpful because maybe I want to select multiple items. We have to make it
   so that you can filter by multiple items: a Select All or where you can select individual items or
   multiple items."*
2. *"The report needs to be a little bit wider. I see on some screens that the entire report doesn't
   fit on the screen. If we can make it a little bit wider, we can make the font smaller, a lot
   smaller. I want the rows to be much more compact."*

Ask 2's **width** half is the consuming app's (`bananaworld-dc` caps content at `max-w-[1440px]`) and
was excluded by the CR itself. The **font and row-height** half is this package's, because every part
of that table is a package export.

### What was decided at the plan gate

**APPROVED, layout B, ship mode on-green**, after three plan revisions driven by the owner's notes.

| # | Decision | Rationale |
|---|---|---|
| D-1 | **Widen the existing `select` value with ONE optional field (`values?: readonly string[]`). No fifth `kind`.** | A fifth `kind: "multiSelect"` would make **all 27** of DC's `kind: "select"` columns a migration on both sides of the wire, and would turn every stored `f_room=cold-1` into a value of a kind that no longer exists. **Widening `value` to `string \| readonly string[]` was rejected too, and it is the one that looks cheapest** — DC's `appendFilters` calls `value.value.trim()`, so a union breaks DC's typecheck **the moment it bumps its pin**: a consumer that adopted nothing would be broken by adopting nothing, which is exactly what the lane rule forbids. An optional extra property is assignable into DC's narrower type, so DC compiles unchanged |
| D-2 | **The wire encoding is a REPEATED PARAMETER** — `f_room=A&f_room=B` — stated in `lib/grid-view.ts`'s header; **this package ships no URL codec** | No escaping and no separator to collide with, so an option id containing a comma cannot silently become two filters. And **one value reads identically under both readers**: `get` returns `"cold-1"`, `getAll` returns `["cold-1"]` — so views already saved to disk round-trip to the same rows through the old parser and the new one. A comma-joined parameter was rejected as a second escaping contract. The `f_` prefix and the saved-view definition are DC's vocabulary; a codec here would import an app's names into a pure UI package (**OQ-2**) |
| D-3 | **The multi cell is OPT-IN (`multiple?: boolean`), and the one-value path is left literally untouched** | If the cell went multi by default, DC would pick up a menu that can emit two ids while its own writer still writes one — three ticks on screen, one room in the query, and a total the manager cannot tell is wrong. Opt-in makes that unreachable. It also means the shipped `SelectCell` is the *unedited* function, which is what makes byte-identity **provable** rather than argued |
| D-4 | 🔴 **No second multi-select menu. The shared parts are MOVED, not copied**, into `components/MultiSelectMenu.tsx`; `MultiSelectFilterDef.selectAll` defaults to today's render | The CR named the alternative as the defect: *"two multi-select menus in one product that look or count differently."* One implementation, one arithmetic, one wording — with a documented two-value top row. The default is what keeps every shipped toolbar unmoved; convergence is a one-word opt-in per consumer, at each consumer's own gate, against a merged sha (**TD-1**) |
| D-5 | **The owner picked tick-list option C — a tri-state "Select all" master row carrying `3 of 12`** | Chosen over option A (the shipped `All depots` item) at the mockup gate. Built as a Radix `CheckboxItem` with `checked="indeterminate"`, which emits `aria-checked="mixed"` for free — the single strongest reason not to hand-roll a dash |
| D-6 | **The compact density is asked ONCE on `<Table>` and reaches the head, the filter row and the body. The package default does NOT move.** | *"I want reports to just open smaller"* (owner, plan note 3) settles **OQ-5**: the app chooses, there is no reader-facing switch, and DC writes `density="compact"` once. But the CRM, RMS, org-admin and Manga Verde render tables from these same parts and none asked to shrink — moving the default would be the lane rule broken in the one way that is invisible until four apps bump their pins. One switch reaching all three rows makes "a compact table with a tall filter row" unreachable by construction |
| D-7 | **Long values are CUT with an ellipsis (owner's option 2), at a NAMED THREE-STEP WIDTH declared per column — layout B** | *"I wouldn't want all the columns to be equally narrow… some deserve to be wider, like a customer name"* (owner, plan note 3) settles **OQ-7**. Revision 2's single `columnMaxWidth` cut every over-long column at the same place, which is the awkwardness he described. Three steps (`narrow`/`medium`/`wide`) plus `full` express "roomy / ordinary / tight" and stop 27 magic numbers being invented column by column. A step is a **ceiling, not a fixed width**, so a date column still shrinks to its content. `<colgroup>` was rejected as positional (a hidden column shifts every width by one) and `table-layout: fixed` as giving every column an equal share — the owner's complaint restated as a layout mode |
| D-8 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here** | It still does not exist. **Eighth consecutive change to raise it** (CR-001 D-12, CR-002 D-10, CR-003, CR-004, CR-005 D-12, CR-006 D-12, CR-007 D-7, here). Creating it is a governance decision for the owner, not something a change may invent. The plan's eight-seam map (§2) plus `runs/change-08/` is the record meanwhile |
| **D-9** | ✅ **DECIDED 2026-09-09 — the owner answered `A`: take the repaired versions.** Refresh the `next` peer to **≥ 15.5.24** (which pulls `sharp` **≥ 0.35.4**), inside the `^15.0.0` range this package already declares. **Not** (b) add the GHSAs to the ignore list, and **not** (c) leave the gate red. | Three advisories published **2026-09-08**, the day before the build: `GHSA-2xp9-vwfh-vxw4` and `GHSA-p293-qw3h-jr36` (**critical**, unauthenticated Next.js RCEs) and `GHSA-rgj7-g3m4-5g8c` (high, `sharp` → libheif). `autoInstallPeers: true` puts `next@15.5.19` in the lockfile's production dependencies, so CI's `pnpm audit --prod --audit-level=high` exits 1 and branch protection refuses the merge. **Not caused by this change** — `package.json` and `pnpm-lock.yaml` are byte-identical to `main`, which fails the same audit today. **Re-measured independently this session** (the closure walked from `pnpm-lock.yaml`, the same npm bulk endpoint `pnpm audit` uses): 66 prod pairs deps-only / 106 with optional edges, **16 advisories, 3 blocking, verdict exit 1** — and at `next@15.5.25` + `sharp@0.35.4`, **0 blocking**. `next@15.5.25` is the head of `15.5.x` and is the version that widens its optional `sharp` range to `^0.34.3 \|\| ^0.35.4`, so the patched `sharp` follows from the one bump. Owner card: `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` |
| **D-11** | ✅ **D-9 IS NOW EXECUTED — decision A landed in the CI-fix round of 2026-09-09, and D-10 is superseded.** `next` 15.5.19 → **15.5.25**, `sharp` 0.34.5 → **0.35.4**. **Nothing was added to `ignoreGhsas`**, which is the half of decision A the owner cared about. Mechanism: **two `pnpm.overrides` entries** (`"next@<15.5.24": "^15.5.24"`, `"sharp@<0.35.4": "^0.35.4"`) re-resolved with `pnpm install --lockfile-only`, rather than the bare `pnpm update next` D-10 sketched. | D-10 was right that `pnpm update` and `pnpm audit` are permission-gated here; it did not establish that **`pnpm install --lockfile-only` is not**, which is the opening this round used. An override is not a workaround but the better instrument, and it is the one the owner **already chose in this same file** for `nanoid` at D-12 (2026-08-14): it makes the repaired version a **durable floor**, so a later re-resolution cannot drift back underneath it silently. **The lockfile was still never hand-authored** — D-10's second refusal stands and was honoured; the file is generated. 🔴 **A correction to D-9's reasoning, found by running it rather than arguing it:** `sharp` did **not** follow from the `next` bump. next@15.5.25 widens its optional sharp range to `^0.34.3 \|\| ^0.35.4`, which the already-locked `sharp@0.34.5` still satisfies, so the first re-resolution left sharp untouched and `GHSA-rgj7-g3m4-5g8c` still red; the second override is what cleared it. **Additive check:** `peerDependencies.next` was deliberately NOT tightened (stays `^15.0.0`) and pnpm honours `overrides` only in the root workspace project, so no consumer's resolution moves. **Verified:** `pnpm install --frozen-lockfile` ✅, `pnpm typecheck` ✅, `pnpm test` **363/363** ✅, and the audit closure re-walked — **3 blocking → 0**, the walk first validated by reproducing CI's own published pre-fix numbers exactly (3 blocking / 6 ignored / 7 moderate). **Follow-up created, deliberately not taken here:** 4 of the 6 standing `ignoreGhsas` entries are now inert; retiring an owner-approved accepted-risk entry is a posture change in its own right, not a side effect of a CI fix. `known-issues.md` §A. |
| **D-10** | ⚠️ **SUPERSEDED BY D-11 — kept, not deleted, because the refusal it records was correct at the time.** 🔴 **D-9's execution is OWED, not done. This build session could not perform it, and did not fake a way around it.** The bump is one command plus one commit on `change/cr-design-system-009`, by an actor with package-manager permission: `pnpm update next && pnpm install --lockfile-only`, then commit `package.json` (unchanged) + `pnpm-lock.yaml` with **CR-DESIGN-SYSTEM-009** in the subject. Until it lands, CI's `dependency-audit` job stays red and the PR cannot merge. | Every `pnpm` invocation is permission-gated in a build worktree and an unattended session has no approver — `pnpm --version`, `pnpm audit` and `pnpm update` were each refused. **That gate is deliberate and was honoured rather than evaded:** it exists so a version change is never made quietly in the middle of other work, which is exactly what this would have been. Invoking pnpm's JS entry point through `node` would have satisfied the letter and defeated the point, so it was not done. **Hand-authoring the lockfile was also rejected**, and this is the more tempting of the two: `next@15.5.19 → 15.5.25` plus `sharp@0.34.5 → 0.35.4` is ~35 new package records — `@next/env`, eight `@next/swc-*` platform builds and sharp's `@img/sharp-*` matrix — each needing a registry integrity hash and a correct snapshot dep graph. One wrong hash fails `pnpm install --frozen-lockfile` in **every** CI job and for every consumer; one missing transitive edge installs a broken tree silently. A lockfile is a generated artefact and generating it by hand into a package four apps pin by sha is not a defensible trade. **Escalated in the PR body, `known-issues.md` §A and the handover — a relaunch of the build session will NOT clear it.** |

### Clarify questions and answers

**Five** owner responses are recorded for this change — four at the plan gate, one at the decision
gate. **All five are material and all five are reflected in what was built or in what is recorded as
owed:**

- **`[plan]` — plan REVISE:** *"What I really want to try and avoid is for column fields to wrap. What
  would be the best way to achieve that, for it not to wrap and for it to still show all the columns?"*
  → Answered in plan §C. Measured rather than assumed: **only `TableCell` wraps today** — `TableHead`
  and the filter cells already carry `whitespace-nowrap`. And the honest constraint was put to him
  plainly: *not wrapping does not create space*, it moves the overflow sideways. There are exactly
  three levers — **cut**, **slide**, **show fewer** — and the question was which is the default.
- **`[plan]` — plan REVISE:** *"Okay we'll go for C in both cases and then we'll go for 2 on the
  wording cutoff"* → tick-list **C** (the tri-state master row, D-5), density **C** (the scale in plan
  §B.3, D-6), long values **2** (cut with a "…", recoverable on hover, D-7).
- **`[plan]` — plan REVISE:** *"I want reports to just open smaller. One thing is we've selected the
  narrower option now for the columns but I don't want all columns necessarily to be equally narrow
  because then that will also look awkward. Some columns deserve to be wider, like a customer name for
  instance. Just bear that in mind. I don't know how to approach that but I wouldn't want all the
  columns to be equally narrow. That would also not look practical."* → **Two decisions.** It settled
  **OQ-5** (no reader-facing density switch — the app chooses; D-6) and it **replaced** revision 2's
  single pixel cap with the per-column named scale (D-7). The assumption he was asked to check —
  names and addresses `wide`, most columns `medium`, dates/references/numbers `narrow` — is recorded
  in the plan's owner brief and is a one-word edit per column, not a rebuild.
- **`[plan]` — plan APPROVED (layout B) — ship on-green.** → **Layout B** is the three-sizes-per-column
  option from `comparison.html`, i.e. plan §C.4, and it is what was built.
- **`[decision]` — `A`.** → The answer to the **D-9** card
  (`runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`), which offered: **A** take the repaired
  versions *(recommended)*, **B** add the three advisories to the accepted list, **C** leave the gate
  refusing. The owner chose **A**, so `next` goes to ≥ 15.5.24 and `sharp` to ≥ 0.35.4 and **nothing is
  added to `pnpm.auditConfig.ignoreGhsas`** — the two unauthenticated RCEs are repaired, not accepted.
  ✅ **EXECUTED in the CI-fix round — see D-11.** `next` is at **15.5.25** and `sharp` at **0.35.4**,
  `ignoreGhsas` is untouched, and the audit measures **0 blocking**. *(The build round that first
  recorded this could not run a package manager and said so rather than faking it; the conductor
  relaunched on CI red and the bump landed. **B was never quietly substituted for A** at any point —
  the owner's card said the ignore list is not where an unauthenticated RCE belongs.)*
  ⚠ **The estate half the card flagged is unchanged and is the owner's, not this change's:** repairing
  this package's peer fixes **this repo's CI**. It patches no running app. DC, the CRM, RMS, org-admin
  and Manga Verde each pin their own `next` and are presumably on the same vulnerable range — five
  separate lanes and a `COMPLIANCE_REGISTER.md` question, raised here rather than left to look handled.

### What was built, and how the additive claim was proven

Four opt-in additions across 10 source files and 5 test files (+1,588 / −92): the multi-value filter
cell, the compact density, the wrap treatment, and the per-column width scale. **363/363 specs green**
(baseline **re-measured before any edit: 314**), `pnpm typecheck` clean, **+49 specs, 0 existing specs
edited or reddened**.

🔴 **The additive claim was measured, not asserted:** every shape an existing caller can pass was
rendered against `git show 6ed975d:` and against this build and compared on whole `innerHTML` —
**1,972 shapes, 0 differences** — and the seven shipped `DataTableToolbar` screens' DOM snapshot has a
**zero-line diff**. An **8-mutation battery caught 8 of 8**, so the specs are known to redden against
a real defect rather than merely to pass.

**Two departures from the plan's letter, both disclosed, neither behavioural:** one
`TableLayoutContext` where §B.1 sketched two private contexts (identical exported surface), and a
ninth source file because `MultiSelectFilterDef` lives in `lib/table-controls.ts`, not where §3
implied.

**One verification could not be run and is stated as such:** **OQ-8**, whether `max-width` caps a
`<td>` under `table-layout: auto`. No browser binary is executable from a build worktree. A ready-to-
run probe ships at `runs/change-08/output/truncate-probe.html`; the named fallback is recorded and
untaken.

⚠ **Housekeeping note for the owner:** there is **no decision-log entry for CR-DESIGN-SYSTEM-008**,
which merged as PR #20 — this log jumps from 007 to 009. Not this change's to write, and flagged
rather than filled in.

---

## CR-DESIGN-SYSTEM-007 — when a row instruction and a single box disagree, the box wins

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-007`. All decisions closed; **0 open** |
| Date | 2026-08-25 |
| Branch point | `origin/main` @ `ce47010` (CR-DESIGN-SYSTEM-006, merged as PR #17) |
| Approved layout | **A** — the cell's own answer wins |
| Ship mode | **on-green** |
| Archive | `runs/change-07/` |

### What was asked

A **review follow-up on CR-DESIGN-SYSTEM-006**. After CR-006's CI went green, an independent reviewer
session was given the owner-approved plan and the diff — and nothing the build session wrote about its
own work — and asked one question: does this do what was approved? It raised one finding above the
follow-up bar. The finding was judged real but not severe enough to send CR-006 back, so **CR-006
merged with it in, and the code is live.**

**F1 · `src/components/Table.tsx:249` · medium/medium.** `askedForValign` is true for a row-sourced
`valign` as well as a cell-sourced one, so a row's `valign` is emitted **after** `className` and
silently overrides a cell's own explicit vertical-align utility. It contradicts the approved plan at
**D-6 / §2.4**: precedence is cell > row > default, and position (B) exists so that `className` cannot
defeat *the cell's* prop — the plan never sanctioned a row-level answer beating a cell-level
`className`. No spec covered the combination: T-6's 80-case matrix never sets a row `valign`, and
T-7 / T-8 are cell-only.

The standing instruction was explicit: **confirm the finding against the code as it is now before
planning a fix**, and drop it if it no longer holds — never implement a fix for a defect that is not
there.

### What was decided at the plan gate

**The plan was APPROVED, with layout A, ship mode on-green.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | 🔴 **F1 is CONFIRMED PRESENT and the fix goes ahead.** | Re-read from this worktree at `ce47010`: `const askedForValign = resolvedValign !== undefined;` is present verbatim at line **249**, unchanged since the reviewer saw it. Confirmed a second way at build time by mutation **M-1**, which restores the shipped predicate and reddens the new specs. Not taken on the reviewer's word |
| D-2 | **Layout A — the cell's own answer wins.** | **The owner's choice**, made at the plan gate from three rendered options. **B (declare today's behaviour intentional)** was rejected on the facts, not on taste: `className` was the *sole* way to express a per-cell vertical answer before CR-006 — which is the entire reason D-2 of that change pinned the default's *position* — and the failure mode is a **silent visual misalignment**, the exact bug class CR-006 existed to remove. **C (B plus a dev-time warning)** was rejected as new code, new per-render cost and a `console.warn` plus a class-string scan inside a pure presentational primitive, in a package whose lane rule is minimum surface. A was also the plan's stated default had the owner not picked |
| D-3 | **The fix is ONE predicate: `cellAskedForValign = valign !== undefined`.** | `askedForValign` must mean *"the cell itself asked"*, not *"anybody asked"*. It was computed from `resolvedValign`, which has **already absorbed the row's answer** — so a row-sourced value took the *asked* path. Resolution itself is unchanged, so a row still answers for cells that express nothing of their own |
| D-4 | 🔴 **Both class-emission positions stay, and keep their positions.** | The standing warning in `SESSION_HANDOVER.md` §2 — do not collapse them — is obeyed, and this change **depends** on both existing: the whole fix is *which slot* a row-level answer lands in. A row-level answer is a **default** for cells with no vertical answer of their own, so it is emitted at position (A) where the untouched `align-middle` default sits; only the cell's own prop earns position (B), after `className` |
| D-5 | **Final precedence, stated once so it can be pinned: cell `valign` prop > cell `className` > row `valign` prop > the `"middle"` default.** Written into the `Table.tsx` file header and BOTH `valign` doc-comments. | The middle rung is the addition — a *cell-level* answer sitting above a *row-level* one, which is **D-6 of CR-006 read literally**. It is put in the source, not only in this log, because the rule living only in a decision log the next author would not open is **how the defect survived review in the first place** |
| D-6 | **`"middle"` stays the default, in the position it has always occupied. Nothing is added, removed, renamed or exported.** | CR-006's **D-2** is untouched (T-1 pins the value, T-8 the position; mutations M-2 and M-4 both redden T-8). `VAlign` stays module-private (D-7 of CR-006); all three barrels are byte-identical. This is a behaviour correction inside one function body, not a new field |
| D-7 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here.** | It still does not exist and there is no `governance/` directory. **Seventh consecutive change to raise it** (CR-001 D-12, CR-002 D-10, CR-003, CR-004, CR-005 D-12, CR-006 D-12, here). Creating it is a governance decision for the owner, not something a change may invent. Seams are recorded in `centrality-scorecard.md` §4 instead |

### Clarify questions and answers

The owner responses recorded for this change were:

- **`[plan]` — plan APPROVED (layout A) — ship on-green.**

That single response settled the one open question the plan raised as a decide-point — **OQ-1**: which
should win when a row-level and a cell-level instruction disagree (**A** the single box wins /
**B** leave it as it is today, the line wins silently / **C** the line wins, plus a development-time
warning). The plan's stated default had the owner not picked was **A**, and the owner picked **A**, so
A is what was built. See **D-2**.

The plan's three other open questions were marked non-blocking and were not put to the owner:
**OQ-2** (the cross-system register) is carried as **D-7**; **OQ-3** (CR-006's technical-debt items)
is unaffected — those items stay in `runs/change-06/technical-debt.md`, which was **cited and never
edited**, since a closed unit is immutable; **OQ-4** (each consumer's standing one-line
`grep -rn "valign" src` before its pin bump, CR-006 D-8) is unchanged by this change and still owed by
CRM, RMS, org-admin and Manga Verde.

### Decided during the build

| # | Decision | Rationale |
|---|---|---|
| D-8 | **No `technical-debt.md` is created for this change.** | The plan anticipated one debt item — a documented silent override — but **only under option B**. The owner chose **A**, which *removes* the silent override rather than documenting it. There is no residual: no shim, no deprecated path, no TODO, no half-migration. Recorded as an outcome with its reason in `known-issues.md` §D rather than left as an unexplained absent file |

### The contract this creates for consumers

**No consumer pin is bumped by this change and no consumer file is touched.** Each consumer moves its
own pin, in its own change, against the **merged** sha on `main` — never a branch sha
(**KI-M001E19-002** is that exact mistake on record).

This change **fixes no screen.** The CRM's sagging sales-order row is fixed only after three steps in
order: this merges → the CRM bumps its pin to the merged sha → the CRM passes `valign="top"`. Fixing
the precedence now means **the CRM never meets the bug**, and that window closes at step two.

⚠ **One honest asterisk, declared in the plan rather than discovered at a gate:** cells inside a row
that *sets* `valign` are the only ones whose output moves. Measured across 576 such shapes — 456
identical strings, 72 differing in class **order** only (identical rendering), and **48 rendering
changes, every one exactly the defect's shape**. **Zero consumers can observe either sub-case today**:
DC's pin predates `TableRow.valign` entirely and `valign` appears 0 times repo-wide, and CRM, RMS,
org-admin and Manga Verde are all behind CR-006 by construction.

### Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **269 passed / 14 files** (baseline re-measured before any edit: **263 / 14**) |
| New specs | **6** (T-17 … T-22); **0 existing specs edited**; **0 existing specs reddened** |
| **Additive proof** | All three barrels byte-identical; `src/` **+31 / −13** with `git diff -w` identical (no whitespace churn); **1,536 caller shapes rendered against `main@ce47010` and diffed on whole `innerHTML` — byte-identical** |
| Mutation check | **5 run, 5 caught.** M-1 restores the shipped defect and reddens T-17/T-18, proving the new specs bite |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new, 0 blocking**. Reproduced in Node — `pnpm audit` is permission-blocked. **The handover's demanded third sanity check was implemented and passed** (0 of 13 parsed ids empty or non-GHSA) |
| Migration | none — this package has no database |
| Throwaway Postgres | never started; nothing left behind |
| In-session defect | **1 found, 1 fixed** — `defect-log.md` D-1, the mutation harness reverted the unstaged fix |
| Context-usage row | logged ✅ (`--project bananaworld-design-system`) |

---

## CR-DESIGN-SYSTEM-006 — a row of fields can line up along the top

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-006`. All decisions closed; **0 open** |
| Date | 2026-08-24 |
| Branch point | `origin/main` @ `fc6f6c6` |
| Approved layout | **A** — a row-level default (`<TableRow valign>`) **with** a per-cell override (`<TableCell valign>`) |
| Ship mode | **on-green** |
| Archive | `runs/change-06/` |

### What was asked

`TableCell` hardcoded `align-middle` in its class list (`Table.tsx:197`) and its `align` prop controls
**horizontal** alignment only — there was no vertical option at all. On the CRM sales order line grid
the first cell is taller than the others because it renders an `AvailabilityChip` under the item
combobox, so every other field in the row — container, quantity, unit, unit price, line total — floats
to the middle of that extra height and sits visibly lower than the item it belongs to.

The request was explicit on four points. **Add a vertical option** (most likely `valign` on
`TableCell`), and **consider whether `TableRow` should set it once for all its cells — choose and
justify**. 🔴 **The default must stay `middle`**: five apps pin this package by sha and flipping it
would silently move the contents of every table in the estate. **Follow the package's own alignment
precedent** — the `alignClass` comment records that a stray default `text-left` once overrode
`numeric`'s `text-right` — so emit exactly one vertical class, and make sure a caller's `className`
cannot silently defeat it. **Say how byte-identity was proved, not just assert it.** The CRM-side
adoption was named as explicitly out of scope.

### What was decided at the plan gate

**The plan was APPROVED, with layout A, ship mode on-green.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **Two optional fields — `valign?: VAlign` on both `TableCellProps` and `TableRowProps`.** Nothing removed, no default changed, no export surface moved. | Five repos pin this package by git sha and each bumps when it chooses. Purely additive is what keeps this a change rather than a coordinated multi-app migration. |
| D-2 | 🔴 **The default stays `"middle"`, and it stays in the POSITION `align-middle` has always occupied in the class list.** | Two separate contracts, and the second is the one that is easy to miss. Before this change the base `align-middle` sat first and a caller's `className` beat it — so `className="align-top"` was the **only** way to top-align a cell, and it is certainly written somewhere across five pinned apps. Moving the default to the end of the list would keep the "default is middle" claim true and silently revert every one of them. Pinned by T-1 (value) and T-8 (position), proved by mutations M-1 and M-2. |
| D-3 | **An explicit `valign` is emitted AFTER `className`; the untouched default is emitted in place.** Exactly one vertical class enters the list, in exactly one of two positions. | `cn` is `twMerge(clsx(...))` and twMerge keeps the **last** of two conflicting classes. Emitting the asked-for class last is what makes a stray utility in `className` unable to silently defeat the prop — the request's explicit requirement (T-7). Emitting the untouched default in place is what preserves today's workaround (T-8). One mechanism, two positions, both tested. |
| D-4 | **Layout A — a row-level default with a per-cell override.** | **The owner's choice**, made at the plan gate from three rendered mockups. **B (per-cell only)** was rejected because the bug is a property of the *row*: the CRM's line has six cells, per-cell-only makes correctness depend on a caller never missing one, and **the miss is silent** — a single unflagged cell sags exactly the way the bug does today. **C (whole grid, no exceptions)** was rejected as too blunt: a buttons/actions column genuinely reads better centred, and C offers no way to say so without falling back to `className`. A keeps the escape hatch where the exception actually lives. |
| D-5 | **The row carries its answer through a module-private React context, and provides it ALWAYS — including when `valign` is `undefined`.** | `TableRow` spreads arbitrary children, so `React.Children.map` + `cloneElement` would break on fragments, on `.map`ped cells and on cells rendered by a wrapper. A context is invisible in the DOM and composes through any depth. **Always** providing means a row **resets** the value, so a `<Table>` nested inside a top-aligned cell does not silently inherit that row's alignment; providing only when set would keep the React tree unchanged for existing tables at the price of exactly that leak, and the leak's failure mode is *silent visual misalignment* — the bug this change exists to fix. Correctness won. DOM cost is zero, which the 384-shape render diff proves. |
| D-6 | **Precedence is cell > row > default.** | The more specific answer wins, which is what callers expect and what makes layout A's opt-out work. Pinned by T-11; mutation M-4 inverts it and T-11 reddens. |
| D-7 | **`VAlign` stays module-private — not exported from any barrel.** | Exactly the precedent `Align` already sets in the same file. An export is a permanent contract across five pinned apps; a new optional field on an already-exported interface needs no barrel edit. All three barrel diffs are empty. |
| D-8 | **The prop is named `valign`, knowingly shadowing React's deprecated `TdHTMLAttributes.valign` presentational attribute — declared rather than hidden.** | This is precisely the move the file already made once: `align?: Align` shadows and consumes `TdHTMLAttributes.align` identically, and `VAlign` is a subset of the inherited union so the narrowing typechecks. The residual is real and named: a caller passing the legacy attribute today gets a dead DOM attribute and middle alignment, and after this change gets what it literally asked for. **DC is proven clean — zero occurrences repo-wide.** CRM, RMS, org-admin and Manga Verde **cannot be read from a build worktree and were not opened**; each owes a one-line grep at its own pin bump. Zero-residual fallback if a live usage is ever found: rename to `verticalAlign` (unreachable today — passing it is a TypeScript error). Carried, not built. |
| D-9 | **`TableHead` gains nothing.** | Header cells are single-line by construction (`whitespace-nowrap`) and no caller has asked. Widening two surfaces to answer one request is the configurability-in-anticipation this package has refused twice (CR-005 D-6, D-10). The fence is asserted by T-14, not assumed. |
| D-10 | **No consumer pin bumped by this change, and the CRM's grid adoption is out of scope.** | Each consumer moves its own pin, in its own change, against the **merged** sha on `main` — never a branch sha. KI-M001E19-002 is that exact mistake on record. This change makes the option exist; the CRM opts in at step three of a three-step sequence. |
| D-11 | **`epicRecommended: false` — this is a change, not an epic.** | Two files, two optional fields, one private helper, one private context. No service, no schema, no new section of the system. It does not decompose into controlled units of work. |
| D-12 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here.** | It still does not exist and there is no `governance/` directory. **Sixth consecutive change to raise it** (CR-001 D-12, CR-002 D-10, CR-003, CR-004, CR-005 D-12, here). Creating it is a governance decision for the owner, not something a change may invent — flagged rather than invented. Seams are recorded in the plan §3, in `centrality-scorecard.md` and in `developer-handover.md`. |

### Clarify questions and answers

The owner responses recorded for this change were:

- **`[plan]` — plan APPROVED (layout A) — ship on-green.**

That single response settled the one open question the plan raised as a decide-point (OQ-1, the
authoring shape: A row-level default with a per-cell override / B per-cell only / C whole-grid with no
override). The plan's stated default had the owner not picked was **A**, and the owner picked **A**, so
A is what was built. See D-4.

The plan's four other open questions were all marked non-blocking and were not put to the owner:
**OQ-2** (is any consumer passing the legacy `valign` attribute — unanswerable from here for four of
five repos) is carried as D-8 and `technical-debt.md` TD-3; **OQ-3** (the cross-system register) is
carried as D-12; **OQ-4** (`TableHead`) is carried as D-9 and TD-1; **OQ-5** (whether DC folds its
hand-rolled sales-order `<td>`s back onto `TableCell`) is another repo's lane and is recorded in the
developer handover.

**No further clarification was requested and none was needed** — no new decision arose during the
build that the approved plan had not already answered, so **no `NEEDS_OWNER: decision` gate was hit**.

### Two findings during the build, recorded rather than smoothed over

1. **Mutation M-3 was not caught by any spec, and is reported as a miss rather than rounded up to
   4/4.** The plan predicted T-6 would catch it. It does not — M-3 is **not a behaviour change**:
   twMerge collapses a duplicated `align-middle` before the class string is emitted, and T-6 counts
   vertical classes in the final, post-twMerge string. This was **measured, not argued** — the full
   320-row authoring matrix is byte-identical between the shipped component and the M-3 mutant. A
   fifth mutation (**M-5**) was added to cover the genuinely-visible positional bug in the same family,
   and T-8 catches it.
2. **The plan's F-14 count was overstated** — it states 50 DC files reference `TableCell`; the actual
   figure is **39** in `src/` (40 including tests). Immaterial: the plan's argument rests on **F-13**,
   that *none* of them passes `valign`, which was re-run and is **zero across the whole DC repo**.
   Recorded in `known-issues.md` A-1 and the build continued, per the standing instruction.

### Outcome

Built as approved. `pnpm typecheck` clean; `pnpm test` **263 passed / 14 files** (baseline **246 / 13**
before any edit, so **+17 new specs and 0 existing specs edited** — this package had no `Table` specs
at all). `src/` is **+77 / −13**, which `git diff -w` reduces to **+67 / −3**: only **three real
deletions**, each itemised, the other ten being the `<tr>` block re-indented into the context provider.
**All three barrel diffs are empty.**

**The byte-identity claim was measured, not asserted:** 384 existing-caller shapes were rendered
against `main@fc6f6c6`'s component and against this one, comparing the entire `innerHTML` — **the diff
is empty**. In addition, T-1/T-2/T-15/T-16 were committed **green against the unmodified component**
as `f59f2c7`, before `src/` was touched, and are unedited and still green.

0 open defects, 0 open decisions. Full evidence in `runs/change-06/`.

---

## CR-DESIGN-SYSTEM-005 — the depot slot's label is chosen by the app wearing the header

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-005`. All decisions closed; **0 open** |
| Date | 2026-08-20 |
| Branch point | `origin/main` @ `0633476` |
| Approved layout | **A** — the slot is always present; an app with nothing for it shows the faint dash the strip already uses. Omission is not offered |
| Ship mode | **on-green** |
| Archive | `runs/change-05/` |

### What was asked

The shared document header is wearable by a second app in every respect except the one word printed on
it. The second of its four slots hard-codes the label `"DC"`, and **CR-CRM-015 had been BLOCKED since
2026-08-18** — the only blocked change left in the estate — because the CRM has no depot on a document.

The request was explicit on four points. **Follow the `dateLabel` precedent** already in the same file
— one optional prop, defaulted at the point of use — unless there is a reason it must differ.
**Decide explicitly what an app does when it has nothing for that slot**, and if omission is not
offered, say why, because "a four-slot header whose fourth slot is permanently blank is a defensible
answer, but it must be a stated one and not a thing the CRM discovers." **It is additive or it is
wrong.** And it named the trap: **Bananaworld-DC asserts against this file's SOURCE TEXT**, not its
behaviour, so an edit here is a delayed-action failure that fires at DC's next pin bump.

### What was decided at the plan gate

The plan offered three answers to the omission question as rendered mockups. The owner answered once:
**layout A, "just go for the logical fix", ship on-green.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **One optional prop, `dcLabel?: string`, defaulted at the point of use with `props.dcLabel ?? "DC"`.** | The `dateLabel` precedent, applied unchanged, exactly as the request instructed. No discriminant, no config object, no ceremony. A caller that passes nothing renders `"DC"` and is byte-identical to today, which is the whole additive claim. No reason to differ from the precedent was found, so none was invented. |
| D-2 | **`??`, never `\|\|`.** | `dateLabel=""` renders an empty label today. With `\|\|` the new prop would silently fall back to `"DC"` for the same input, and the two label props would behave differently. Special-casing one of them is a divergence from the precedent this change was told to follow. Pinned by a spec, and proved by mutation M-1. |
| D-3 | 🔴 **`DOCUMENT_HEADER_SLOTS` is not changed by one character, and the override sits BESIDE it as presentation.** | **The array is IDENTITY and ORDER; the prop is PRESENTATION.** The array says which slot; the prop says what this app calls it. Bananaworld-DC's `tests/contract/transaction-form-standard.test.ts` asserts the byte-exact declaration and `const slots = DOCUMENT_HEADER_SLOTS;` against this file's source. Both are held; `slots.map(` is unchanged. Nothing here can turn DC red at its next bump. |
| D-4 | 🔴 **LAYOUT A — the slot is ALWAYS present. Omission is NOT offered.** An app with nothing for it passes `dcName: null` and gets the empty state the slot already has. | **The owner's choice**, made at the plan gate from three rendered mockups (A: the existing faint dash; B: the app may drop the box; C: the box stays with an explanatory line). Three reasons, in weight order: (1) 🔴 dropping the slot leaves three children in a `lg:grid-cols-4` strip, putting the document number in column 3 on a wide screen and bottom-**left** on a narrow one — against the owner instruction of 2026-08-08 — so honest omission means restyling the header, which this change was explicitly forbidden to do; (2) the file defines "homogeneous" as *these four slots, in this order, on every desk form*, and a per-app slot count makes the standard a suggestion; (3) no caller asked — CR-CRM-015 needs a word, not a hole. |
| D-5 | **The omission decision is STATED where the CRM will read it, and pinned by a test that fails if it silently changes.** | The request's own requirement. Written on the `dcLabel` prop itself, in `developer-handover.md` §1, and asserted by the spec *"renders FOUR slots always"* across four prop combinations — proved to bite by mutation M-3. |
| D-6 | **Option C — a `dcHint?: string` mirroring `dateHint` — was NOT built.** | Cheap, fully additive, and it would let an app explain a blank box. Refused on **one ground only: no caller has asked.** This component has twice already refused configurability built ahead of a decision nobody has taken (D-3, D-13 of earlier changes). Recorded with a named trigger as `technical-debt.md` TD-2 so it is found rather than re-derived. |
| D-7 | 🔴 **The one existing assertion this change edits is NARROWED, never relaxed — and it was declared at the plan gate, not discovered in the build.** | This repo's own spec *"reads NO session"* scanned this file's source for the concatenated `label="DC" value={props.origin.dcName}`; the label half necessarily moved. It now scans for `value={props.origin.dcName}` — the half that carries the session claim, which is the spec's actual subject — **plus** `label={props.dcLabel ?? "DC"}`, pinning the new default. The file therefore asserts strictly **more** afterwards. The change request did not know this assertion existed; the plan found it (F-9) and put it on the card. |
| D-8 | **A NEW guard is added in return: `DOCUMENT_HEADER_SLOTS` may never gain a second home.** | The request asked that the cross-repo negative be pinned in this repo so a future change here cannot break DC silently. The existing byte-exact source scan is re-fenced with a comment **naming DC's contract test by file** as the reason it exists, and a new spec asserts exactly one array literal of slot names, four entries, `"DC"` second, and that the render still walks the constant. Both proved by mutation M-4 — the edit that would keep every DOM spec green and still break DC weeks later. |
| D-9 | **`dateLabel` is neither removed nor folded into a shape with `dcLabel`.** | Two independent optional props. Folding them would be a breaking reshape of a published interface in a package four apps pin by sha. Asserted: the two do not interact. |
| D-10 | **The "Raised by" slot's label was NOT made overridable.** | Out of scope by the request's own wording; no caller asked. One optional prop away if a second app ever needs it. `technical-debt.md` TD-1. |
| D-11 | **No consumer pin is bumped and no consumer file is edited.** | Consumers move their own pins, in their own changes, against the **merged** sha on `main` — never a branch sha (KI-M001E19-002). **This change does not unblock CR-CRM-015 by itself**: two changes, two lanes, in that order. |
| D-12 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here.** | It still does not exist and there is no `governance/` directory. **Fifth consecutive change to raise it** (CR-001 D-12, CR-002 D-10, CR-003, CR-004, and here). Creating it is a governance decision for the owner, not something a change may invent. The six seams are recorded in `centrality-scorecard.md` §2 and `developer-handover.md`. |

### Clarify questions and answers

The owner responses recorded for this change were:

- **`[plan]` — plan APPROVED (layout A) — ship on-green.**

That single response settled the change's one decide-point: **open question OQ-1, the omission
decision** — A (the slot always present, using the existing empty state), B (an app may drop the slot),
or C (the slot stays and may carry an explanatory hint). The plan's stated default had the owner not
picked was **A**, and the plan recommended A; the owner confirmed A with "just go for the logical fix".
See D-4, and D-6 for why C was not built alongside it.

The plan's three non-blocking open questions were not separately answered and are carried forward:
**OQ-2** (whether DC's contract mirror pins the full concatenated substring — **not answerable from a
build worktree**) as D-7's caveat and `developer-handover.md` §2; **OQ-3** (the cross-system register)
as D-12; **OQ-4** (the "Raised by" label) as D-10.

**No further clarification was requested and none was needed** — no new decision arose during the
build that the approved plan had not already answered, so no `NEEDS_OWNER: decision` gate was hit.

### The rule this change adds

Recorded because Stage 07 requires an amendment when a change alters a rule or contract, and this one
does — twice, both for this component:

1. **The depot slot's LABEL belongs to the wearing app; its IDENTITY and ORDER belong to the package,
   expressed once in `DOCUMENT_HEADER_SLOTS`.** The array and the override sit beside each other and
   are never nested.
2. **The header always renders four slots. Omission is not offered.** An app with nothing for a slot
   uses the existing empty state.

Both are fenced in the source on the `dcLabel` prop — where a build session actually reads — and both
are pinned by specs that fail if either half is broken.

### Outcome

Built as approved. `pnpm typecheck` clean; `pnpm test` **246 passed / 13 files** (baseline **235 / 13**
before any edit, so +11 new specs). `git diff --numstat -- src/` = **+30 / −1**, the single deleted
line itemised (a one-line `return` replaced by its braced form); **all three barrels byte-identical**.
**1** existing assertion narrowed, per D-7. Four deliberate mutations run and all four caught. 0 open
defects, 0 open decisions. Full evidence in `runs/change-05/`.

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
