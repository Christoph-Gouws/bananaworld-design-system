# Milestone Evidence

> _Fill this by **copying the template and editing the values in** — never re-type the boilerplate (Kernel Rule 9 artifact mechanics). Where a section reports on another artifact (test log, QA report, scorecard), cite it — path + status + counts — rather than restating its content. Every section still completes in full; the rule changes production mechanics, not evidence requirements._

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-010 — (not an epic: a CHANGE REQUEST, archived at runs/change-09/)
Milestone:      CR-DESIGN-SYSTEM-010 — review follow-up on CR-DESIGN-SYSTEM-009 (3 reviewer findings)
Date:           2026-09-10
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ **This is a Change Request, not an epic or a milestone.** The two fields above carry the CR id
> because the close gate greps for it; **no `runs/epic-NN/` folder, no `milestone-NN/` folder and
> nothing under `runs/current/epic-plan/` was created.**

> ⚠ **The kernel template file itself could not be opened from this worktree** (it is outside the
> session's allowed directories). This file was produced by copying the **filled** template from the
> previous change, `runs/change-08/evidence/milestone-evidence.md`, and editing the values in — the
> same boilerplate, section for section, never re-typed.

---

## 1. Scope Implemented

Built to the owner-approved logic plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-010.md` (layout **A**,
ship mode **on-green**). Three defects an independent reviewer found in CR-DESIGN-SYSTEM-009's merged
diff (`3143646`, PR #22) — **live code**.

🔴 **All three were re-confirmed against the source AS IT STOOD before any fix was designed, and all
three still held. None was dropped.** F3 was confirmed by **compiling** rather than reading, because
the plan itself flagged that `node_modules` was absent when it was written.

- **F1 — the grid's tick-list under-counted and then discarded a value the option list no longer
  offers.** Every reading came from `options.filter(o => selected.includes(o.id))`, so a restored
  saved view holding a retired id read `Cold room 1` / `1 chosen` on a query narrowing by two;
  a cell holding **only** retired ids rendered **completely unset**; and the next tick **deleted** the
  retired id. The toolbar in the identical state read `Cold room 1 +1` / `2 chosen`.
- **F2 — "Select all" narrowed the table instead of widening it.** It committed every option id, and
  `matchesFilter`'s multiSelect arm requires `actual !== null`, so **every blank-valued row vanished**
  and `hasActiveControls` lit "Clear" — on a gesture the reader made to see everything. The grid
  additionally wrote N repeated wire parameters where the one empty state is a dropped key.
- **F3 — `TableCellProps.width` shadowed the DOM attribute and was swallowed.** React's
  `TdHTMLAttributes` declares `width?: number | string`; declaring the design-system step under the
  same name narrowed the inherited prop and destructured it away, so a consumer with
  `<TableCell width={120}>` fails `tsc` on a file it never touched at its pin bump — or, cast, loses
  the column's sizing silently.

🔴 **One cause, not three edits.** CR-009's remedy for *"two multi-selects that look or count
differently is the defect"* moved the **presentation** into `MultiSelectMenu` and left the **value
arithmetic** duplicated at each call site. This finishes that extraction: `multiSelectChosenLabels`
(moved in from the toolbar, body unchanged) and `multiSelectToggle` (new — preserves ids the options
no longer offer) now serve both surfaces, and the count is `values.length` in both. `MultiSelectAllRow`
loses the ability to narrow (`onToggle: (all: boolean) => void` → `onShowEverything: () => void`), so
F2 becomes **unreachable** rather than fixed. F3 is fixed on its own terms: one prop, two meanings,
split once by `isColumnWidth`.

Full detail: `runs/change-09/output/implementation-summary.md`.

---

## 2. Out-of-Scope Items Avoided

| Not done | Why |
|---|---|
| **Teaching `matchesFilter` that "every option" means "not narrowed"** | The engine is right: `[]` means not narrowed, a non-empty list means these values only. Changing it moves behaviour for **every existing multiSelect caller** the moment a reader ticks the last box by hand. Plan §2.5; `simplification-opportunities.md` S-5 |
| **Widening `TableHeadProps.width`** | `ThHTMLAttributes` declares no `width`, so `<TableHead width={120}>` was already a type error before CR-009. Not a regression — widening it would be a feature wearing a repair's clothes |
| **Renaming `TableCell.width` to `columnWidth`** | Removes `width` from the export surface, which the additive-only lane rule forbids outright, and leaves the head and the cell with two names for one column answer |
| **A "(retired)" affix for a value the options no longer offer** | Plan **OQ-3**: inventing wording is a new idea and a decision the owner has not been asked. Recorded as `technical-debt.md` **TD-3** |
| **A `(blank)` menu entry** | Only needed by layout **C**, which the owner did not pick. `technical-debt.md` **TD-2** — recorded as not incurred |
| **Unifying `SelectCell` and `MultiSelectCell`** | CR-009 handover point 2, and this change now *depends* on it: 900 byte-identity shapes are 0-difference **because `SelectCell`'s bytes never moved** |
| **Any consumer pin bump** | Consumers move their own pin, in their own change, against the **MERGED** `main` sha — never a branch sha (KI-M001E19-002) |
| **Retiring the 4 now-inert `ignoreGhsas` entries** | Retiring an owner-approved security exception is a posture change in its own right, not a side effect of a defect fix. Still the owner's call |
| **Any write inside `bananaworld-dc`** | Read-only sibling. **This session issued reads only** — its `package.json` and three greps over `src`. Zero writes |

---

## 3. Source Documents Consulted

| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-010.md` | **the whole file** — the owner-approved contract. §0 (all three re-confirmations), §1 (the shared cause), §2.1–2.5, §3, §4 (the six seams), §5, §6, §7 (OQ-1…OQ-4), §8, §9 |
| `runs/current/mockups/CR-DESIGN-SYSTEM-010/option-a.html` | the approved layout — the three states, `All 3` vs `3 of 3`, and the blank-row table that names F2 in plain English |
| `runs/current/SESSION_HANDOVER.md` (CR-009's) | items 1–17; especially 2 (do not unify the two cells), 5 (`values` absent below arity 2; never drop `onSelect` preventDefault), 7 (never `git checkout --` on Windows), 9 (the sensor's CRLF bug), 10 (normalise radix ids), 11 (additive-only), 12 (consumers unreadable) |
| `runs/current/active-milestone.md` | the active unit pointer |
| `runs/change-08/output/{test-results,qa-report,known-issues}.md` | §4 the byte-identity method and its radix-id correction; §5 the mutation battery's restore rule; the standing repo-drift list |
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | prior CR entries, for the entry format and the standing decisions this change had to obey |
| `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` | this file's boilerplate — ⚠ **not openable from this worktree**; copied from `runs/change-08/evidence/milestone-evidence.md`, which is the filled template |
| **In-repo source, re-read to verify the plan's premises** | `src/components/{Table,GridFilterRow,DataTableToolbar,MultiSelectMenu,GridHeadCell}.tsx`, `src/lib/{grid-view,table-controls}.ts`, `tsconfig.json`, `package.json`, `node_modules/@types/react/index.d.ts` (`TdHTMLAttributes` / `ThHTMLAttributes`), `git show 6ed975d:src/components/Table.tsx`, and all four affected spec files |
| **`bananaworld-dc` — READ-ONLY, reads only** | `package.json` (the pin, line 55) and three greps over `src` (`width=` on the three components; `kind: "multiSelect"`; `selectAll` / `multiple: true`) — all 0 matches |

---

## 4. Files and Folders Changed

**Cited, not restated** — the authoritative list is `runs/change-09/output/changed-files.md`:
**7 files, +529 / −81**, of which 4 source and 3 tests.

| File | Action | Reason |
|---|---|---|
| `src/components/MultiSelectMenu.tsx` | Modified | `MultiSelectOption`; `multiSelectChosenLabels` (moved in); `multiSelectToggle` (new); `MultiSelectAllRow` → `onShowEverything` + layout A |
| `src/components/GridFilterRow.tsx` | Modified | `MultiSelectCell` only — the shared arithmetic, `selected.length`, `onCommit([])`. **`SelectCell` untouched** |
| `src/components/DataTableToolbar.tsx` | Modified | local `chosenLabelsInOptionOrder` **deleted**; local reducer replaced; master row → `onShowEverything`. `"allOption"` branch untouched |
| `src/components/Table.tsx` | Modified | `TableCellProps.width` widened; `isColumnWidth`; `htmlWidth` forwarded. **`TableHead` deliberately unchanged** |
| `tests/components/Grid.test.tsx` | Modified | the master-row block rewritten (layout A, clears not narrows, no-op second tap, hand-ticked `3 of 3`); **+ a new F1 block**; harness gained `initial` |
| `tests/components/DataTableToolbar.test.tsx` | Modified | 2 specs rewritten (the `"—"` row survives; Clear stays off) + 2 added; **+ a new F1 block**; harness gained `rows`, `DEPOTS_WITH_POLOKWANE` added |
| `tests/components/Grid.additive.test.tsx` | Modified | **+ a new F3 block** — the legacy attribute reaches the `<td>`; the four step names never do |

**Deleted: none.** `package.json`, `pnpm-lock.yaml`, `src/lib/*`, `src/components/index.ts`,
`src/lib/index.ts`, `src/components/GridHeadCell.tsx` and `tests/components/Table.test.tsx`
**untouched**. Evidence tooling added under `runs/change-09/output/` (three files) is not shipped code.

---

## 5. Gates Completed

| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | Discharged at the **plan gate**, which the owner approved (layout A, on-green) with no revise note. The three findings are traced to 21 acceptance criteria in `test-results.md` §2 |
| Architecture Gate | **Pass** | The six-seam cross-app map is plan §4 — writer, reader and decision for each. The routes rejected (touch the engine; rename the prop) are decided there with reasons and re-affirmed in `revision-review.md` §3 |
| File Inspection Gate | **Pass** | 🔴 **Every file, function and line the plan cites was re-opened and verified BEFORE any edit, and every citation was exact.** `main` had not moved (`HEAD` = `3143646`). DC's facts re-verified by reading DC |
| Database Gate | **Not applicable** | This package has no database by construction (TECH-COMP-003 / ADR-001). `migrationExpected: false`; no migration written, none rehearsed, **no Postgres started** |
| API and Integration Gate | **Not applicable** | No network call, no endpoint, no client. The only "integration" is the value-shape and wire seam, covered by the Architecture Gate — and **no shape changed**; only which ids survive a tick |
| UX Gate | **Pass** | The mockup gate ran before this session: `runs/current/mockups/CR-DESIGN-SYSTEM-010/` (three options plus a comparison, each showing the blank-valued row). Owner approved **A** |
| Security and Permissions Gate | **Pass** | No authorisation surface exists here (§8). The dependency audit — part of this gate in practice — is **exit 0, 0 blocking**, on a `package.json`/`pnpm-lock.yaml` this change did not touch |
| Test Planning Gate | **Pass** | Plan §6 specified the proof up front: baseline re-measured first, the byte-identity harness reused with radix ids normalised, the toolbar snapshot at zero-diff, named callers stated, and a mutation battery restoring **original bytes**. **All five executed.** |

---

## 6. Tests Run

**Cited, not restated** — full report: `runs/change-09/output/test-results.md` (§1–§6).

| Test | Command | Expected | Actual | Result |
|---|---|---|---|---|
| Baseline, **before any edit** | `pnpm test` | a measured number, never a quoted one | **363 passed / 17 files** | **Pass** |
| Type surface | `pnpm typecheck` | clean | clean | **Pass** |
| Full suite, final | `pnpm test` | ≥ baseline; only the defect-pinning specs edited | **377 passed / 17 files**; **+14 new**, **6 edited (5 because they asserted the defect)**, **0 reddened** | **Pass** |
| 🔴 Byte-identity vs `main@3143646` | the committed harness: render every existing caller shape against both trees, compare whole markup | 0 differences except the three states the findings name | **9,936 shapes, 0 differences** + **4 deliberate**, each asserted in the repaired direction | **Pass** |
| 🔴 The seven shipped toolbar screens | `vitest` DOM snapshot | unchanged, character for character incl. class order | **zero-line diff** | **Pass** |
| Mutation battery | `node runs/change-09/output/mutation-battery.mjs` | 10/10 caught, every restore verified byte for byte | **10/10 caught, 0 skipped, 10/10 restores byte-exact** | **Pass** |
| Quality sensors | `quality-sensors.mjs --changed … --scorecard …` | 0 open findings | **0 open, 4 justified, 0 weak** | **Pass** |
| Dependency audit | `pnpm run audit:deps` | 0 blocking | **exit 0** — 4 found (2 moderate, 2 high, both on the standing ignore list) | **Pass** |
| F3 reproduced against the PRE-change tree | `tsc` on a probe declaring `<TableCell width={120}>` | the type error the finding describes | **`TS2322: Type 'number' is not assignable to type 'TableColumnWidth \| undefined'`** | **Pass — finding confirmed** |
| Migration rehearsal | — | N/A, no database | none written, none run | **N/A, recorded** |
| Throwaway Postgres | — | nothing left behind | **never started**: no container, no stopped container, no port held | **Pass** |
| `pnpm lint` | — | — | 🔴 **NOT RUN — there is no `lint` script and no ESLint config in this repository.** Pre-existing, out of lane, and not claimed | **Not run, stated** |
| **Real-browser check of OQ-8** | — | the `max-width` cap holds on a `<td>` | 🔴 **NOT RUN** — no browser binary is executable from this sandbox. **Untouched by this change**; probe still shipped | **Not run, stated** |

---

## 7. Manual Verification

**Cited, not restated** — the owner-facing steps are `runs/change-09/evidence/user-verification-steps.md`.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Confirm the approved mockup matches what was built | option **A** — ticked + `All 3` unset, dash + `2 of 3`, ticked + `3 of 3`; and the highlighted blank row **stays** on a "Select all" tap | exactly what the specs assert, in both surfaces | **Pass** |
| Confirm nothing an owner opens changes today | every screen in every app renders identically | 9,936 caller shapes byte-identical; toolbar snapshot zero-line diff; **and no consumer is on a sha that has this code at all** | **Pass** |
| Drive the tick-list as a reader would | tap "Select all" → everything shows, blanks included, Clear off; tap again → nothing happens | asserted by clicking in both suites; mutations M-5/M-6 prove the specs are real | **Pass** |
| Restore a saved view holding a retired room | the box counts it, shows it, and keeps it through the next tick | asserted in both suites; mutations M-3/M-4/M-7/M-8 | **Pass** |
| A consumer's legacy `<TableCell width={120}>` | still compiles, still reaches the DOM | `<td width="120">`, and stripping that one attribute makes the markup identical to the pre-change render | **Pass** |
| 🔴 **Confirm a long value is visibly cut** | an ellipsis appears on screen | **NOT VERIFIED — no browser is executable from this sandbox.** Carried from CR-009, untouched here. Probe: `runs/change-08/output/truncate-probe.html` | **Owner step, open** |

---

## 8. Security Review

- Triggered: **Yes** — the dependency audit, as always in this repo.
- Outcome: **Pass.**

**Application-surface review: nothing to review, and the reason is structural.** This package is pure
presentation (TECH-COMP-003 / ADR-001): no network call, no record read or written, no authorisation
logic, no tenancy, no secret, no `process.env`. **This change adds no import and no dependency** — it
deletes one function, moves one, adds two, renames a prop on an internal component, and widens one
type. No user input is interpolated into markup; the only strings rendered are labels a consumer
already passes, plus `All N` / `N of M`.

**Dependency review: `pnpm run audit:deps` → exit 0, 0 blocking.** 4 advisories found — 2 moderate
(below the `--audit-level=high` threshold; the standing PostCSS watch items) and 2 high, both on the
**owner-approved standing ignore list**. `package.json` and `pnpm-lock.yaml` are **unchanged by this
change**, so CI walks the same closure `main` does — the one CR-009's decision **A** repaired
(`next` 15.5.25, `sharp` 0.35.4, via two `pnpm.overrides` floors).

⚠ **4 of the 6 `ignoreGhsas` entries are now inert** and want retiring. Deliberately **not** done here:
retiring an owner-approved accepted-risk entry is a security-posture change in its own right, not a
side effect of a defect fix. `known-issues.md` C-4.

⚠ **One accessibility consequence, stated because it is real:** under layout A the master row is now
**ticked** in the nothing-chosen state, so a screen reader announces "Select all, checked, All 3"
where it said "not checked, 0 of 3". That is the owner's approved reading, it uses Radix's own
`aria-checked` rather than anything hand-drawn, and **no shipped screen sees it** because no consumer
declares `selectAll: "master"`.

---

## 9. Code Quality Review

**Cited:** `runs/change-09/output/revision-review.md`, `simplification-opportunities.md`,
`accepted-refactors.md`.

**Revision review — ACCEPT. The change is the approved plan, clause by clause** (`qa-report.md` §2
tabulates all 16 plan clauses against what landed). **Nothing in the plan was skipped and nothing
outside it was added.** The one thing built beyond the plan's letter is evidence tooling under
`runs/` — the byte-identity setup script, committed so the next change does not build it a third
time.

**Simplification — 9 candidates considered, 3 applied, 6 rejected with reasons.**

| Applied | Effect |
|---|---|
| **S-1** the value arithmetic moves into `MultiSelectMenu` | one function **deleted outright**; two inline reducers become two calls to one named function; the count is `values.length` in both surfaces by construction |
| **S-2** `onToggle(boolean)` → `onShowEverything()` | one parameter fewer, one branch fewer at each of two call sites, and **the defective answer becomes unwritable** |
| **S-3** `isColumnWidth` | the two meanings of one prop separated once, named, instead of assumed |

**The most important rejection is the same one CR-009 made: merging `SelectCell` into
`MultiSelectCell`.** It is the largest apparent duplication in the file and removing it would destroy
the proof — 900 of this change's 9,936 byte-identity shapes are 0-difference *because* `SelectCell`'s
bytes never moved. Also rejected: teaching the engine (S-5, changes every existing caller), merging
the trigger and master-row readings (S-6, needs a mode flag — F2's shape), extracting the
known/unknown partition (S-7, the symmetry is the property being asserted), hoisting the option map
into the row (S-8, touches the one function that must stay unedited), and the `ignoreGhsas` cleanup
(S-9, out of lane).

🔴 **The change is a net simplification where it counts:** `DataTableToolbar.tsx` is **shorter again**,
and the tick-list now has exactly one arithmetic serving two surfaces — which is the thing CR-009 said
it had done and had only half done.

---

## 10. Readable Code Review

**Cited:** `runs/change-09/output/readable-code-scorecard.md` — **generated** by
`organization/scripts/quality-sensors.mjs`, never hand-authored; the five JUDGMENT rows answered
in-session, **no machine-filled cell edited**.

- Score: **11 of 11 dimensions** — 6 machine-decided PASS, 5 JUDGMENT answered PASS
- Minimum required: PASS (all mechanical checks meet threshold)
- Status: **Pass**

**Sensor result: 7 of 7 requested files scanned, 0 open findings, 4 justified, 0 weak.**

**The judgment row worth reading is #3, names.** The one deliberate rename in this change *is* the fix:
`onToggle: (all: boolean) => void` named a gesture that has two outcomes when it has one, and both
call sites read the boolean the wrong way round. **F2 is what a misleading name costs.**

⚠ Row #6 (dead code) is answered from `tsc` plus a read of the diff, **because there is no ESLint
config and no `lint` script in this repository**. That limit is stated in the scorecard rather than
papered over.

⚠ The changed files were normalised to **LF** before the sensor ran — it silently ignores every
`QUALITY-JUSTIFY` on a CRLF checkout (`.` does not match `\r`). Second change running to hit it; still
an estate tooling bug, still outside this project's lane. `known-issues.md` B-1.

---

## 11. Centrality Review

**Cited:** `runs/change-09/output/centrality-scorecard.md` — generated by the same sensor; the four
JUDGMENT rows answered in-session.

- Score: **8 of 8 dimensions** — 4 machine-decided PASS, 4 JUDGMENT answered PASS
- Minimum required: PASS (all mechanical checks meet threshold)
- Status: **Pass**

Two of the four judgment rows are **N/A with the reason recorded** (no authorisation code, no
validators — this package is pure presentation by construction; an unrecorded N/A would be a skip).
**Row #4, business calculations, is the row this whole change is about:** F1 *is* duplicated logic
that diverged. It is now one implementation with two callers, and the count both surfaces read is the
same expression.

⚠ **Two dimension groups were NOT scanned** (`CE-01`/`CE-05`, `CE-08`/`RC-09` — no `componentGlobs` or
`wiringGlobs` in this project's sensor config), so their PASS rows are a silence rather than a
measurement. Flagged in the scorecard itself and in `known-issues.md` B-2.

---

## 12. Known Issues

**Cited in full:** `runs/change-09/output/known-issues.md` (§A–§E) and `defect-log.md`.

**Open defects in the change: 0.** One defect was found and fixed **in this session's own tooling** —
it never reached shipped code, and it is recorded because it produced a confidently wrong result that
looked like a real one (`defect-log.md` **D-1**).

| # | Open item | Owner |
|---|---|---|
| **A** | **OQ-8 not verified in a browser** — no browser binary is executable from this sandbox. **Carried; untouched by this change.** Bounded (failure mode = "the column does not narrow"), cannot move any existing render, fallback recorded and untaken, probe shipped ready to run | Owner, one click |
| **A** | **OQ-3 — a retired value shows its raw id**, with no wording of its own. Deliberately not invented. `technical-debt.md` TD-3 | Owner, when wanted |
| **B** | `quality-sensors.mjs` silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout; and `CE-01/05`, `CE-08`/`RC-09` are not scanned at all for this project | Estate tooling |
| **B** | 🔴 **A third CRLF trap, this one in this session's own harness** — 3 of 10 mutations never ran. **Fixed here** and written up as the general rule | Fixed |
| **C** | **4 of the 6 `ignoreGhsas` entries are now inert** and want retiring in a standalone housekeeping change | **Owner decision** |
| **C** | Standing repo drift, fifth change running: no prettier config, no eslint/`lint` script, and the snapshot's zero-diff CRLF artifact. ⚠ **`audit:deps` DOES now exist and is green** — CR-009's handover listed it as missing; that is no longer true | Out of lane |
| **C** | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — ninth change to raise it.** The plan's six-seam map (§4) is this change's record in its place. ⚠ Separately: still no decision-log entry for CR-DESIGN-SYSTEM-008 | **Owner decision** |
| **D** | **No consumer suite was executed and nothing claims one was — ninth change to record it.** CRM, RMS, org-admin and Manga Verde cannot be read from a build worktree | Recorded, no action |

---

## 13. Deferred Items

| Item | Reason deferred | Approved by | Target Milestone |
|---|---|---|---|
| **A wording for a value the options no longer offer** (plan OQ-3) | Inventing an affix is a new idea and a wording decision the owner has not been asked, in a change whose subject is fixing defects. The value is now *correct* and *counted*; only its display name is unhelpful | Not yet approved — raised in `technical-debt.md` TD-3 and `user-verification-steps.md` | Owner's call; one change to one shared function, landing in both surfaces at once |
| **The real-browser verification of OQ-8** | No browser binary is executable from this sandbox. **Carried from CR-009, not created here** | Not approved — carried | Owner, one click |
| **Retiring the 4 inert `ignoreGhsas` entries** | A security-posture change in its own right, not a side effect of a defect fix | Not yet approved | A standalone housekeeping change |

**Nothing in the approved plan's scope was deferred.** All three findings were fixed in full.

---

## 14. Source Document Amendments

| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | A CHANGE/DECISION entry for **CR-DESIGN-SYSTEM-010**: what was asked (the three findings in the reviewer's own words), what was decided at the plan gate, the layout picked (**A**), the ship mode (**on-green**), the clarify record, and six in-session decisions **D-1…D-6** | **Applied** |

🔴 **No Stage 07 amendment to a rule, contract or workflow was required, and here is the reason** — an
unrecorded N/A would be a skip:

- **No rule changed.** Additive-only, one-class-per-axis, "consumers move their own pin against a
  merged sha" and "Radix underpins the interactive primitives" were all *obeyed*, not amended. This
  change is a **correction to an implementation that had drifted from those rules**, which is the
  opposite of amending one.
- **No contract changed.** `GridFilterValue` and `FilterValue` are byte-identical; only *which ids
  survive a tick* changed. `TableCell.width` **regained** a meaning it had before CR-009 — an
  addition, and a restoration, not an alteration. No shape, default or export moved.
- **No workflow changed.** Same pipeline, same gates, same archive shape.

⚠ **The one document that would have taken an amendment does not exist:**
`governance/CROSS_SYSTEM_CHANGE_REGISTER.md`. This is the **ninth** change to raise it. Creating it is
a governance decision for the owner, so the approved plan's six-seam map (§4) plus this archive is the
record in its place.

---

## 15. Scorecards

### Agent Scorecard

| Dimension | Score | Status |
|---|---|---|
| Scope compliance | 100% | **Pass** — all three findings fixed, nothing beyond them; every plan clause honoured, including the ones where the plan chose the *less* obvious answer (do not touch the engine; do not widen `TableHead`; do not rename the prop) |
| Gate completion | 100% | **Pass** — 6 gates passed, 2 N/A with reasons (§5). No gate deferred |
| Test coverage | 100% | **Pass** — 377/377; +14 specs; **10/10 mutations caught, 0 skipped**; 9,936 byte-identity shapes at 0 differences |
| Security compliance | 100% | **Pass** — audit exit 0, 0 blocking, on a lockfile this change did not touch. No application security surface exists |
| Code quality | 100% | **Pass** — sensors **0 open findings**, 4 justified, 0 weak; 3 simplifications applied, 6 rejected with reasons |
| Documentation | 100% | **Pass** — every repaired site carries a comment naming the finding and what the wrong version cost; one comment that *defended the removed behaviour* was corrected rather than left arguing against its own file |
| Evidence completeness | 100% | **Pass** — every required artifact exists as its own file, and the tooling that produced the numbers is archived beside them |

### Global Milestone Scorecard

| Category | Score | Minimum | Status |
|---|---|---|---|
| Readable code | 11/11 dimensions | PASS | **Pass** |
| Centrality | 8/8 dimensions | PASS | **Pass** |
| Security | audit **0 blocking** | PASS | **Pass** |
| QA | **21/21** acceptance criteria met | PASS | **Pass** |
| Evidence | **16/16** required artifacts present as their own files | PASS | **Pass** |
| **Overall** | **5 of 5** | **PASS** | ✅ **PASS** |

The same table is carried, with its reasoning, in
`runs/change-09/evidence/global-milestone-scorecard.md`.

---

## 16. Blocking Reports

**None raised, and none was warranted.**

- **No `CHANGE_BLOCKED`.** The plan's premise held in full — `main` had not moved, every citation was
  exact, and nothing the plan relies on had changed shape.
- **No `NEEDS_OWNER: decision`.** The plan gate settled the only open question (layout **A**), and
  nothing arose that the plan had not answered. Plan **OQ-2** — whether `(string & {})` survives this
  repo's TS config — was a build-time *verification*, not a decision, and it passed; the `| string`
  fallback the plan pre-authorised was not needed.
- **No emergency path was used.** No gate was deferred, no scorecard thinned, no evidence step
  skipped.

---

## 17. Handoff

```
Next agent:            The conductor (poll CI, merge on green). Then bananaworld-dc, in its own change.
Required next action:  None from this lane.
Blocking status:       Not blocked
Notes:                 Three reviewer findings in already-merged code, all re-confirmed against the
                       current source before any fix was designed, all still present, all fixed.
                       F1 and F2 share one cause and were fixed by finishing the extraction
                       CR-DESIGN-SYSTEM-009 started: the tick-list's value arithmetic now lives in
                       MultiSelectMenu.tsx and both surfaces call it. The master row lost the ability
                       to narrow (onToggle(boolean) -> onShowEverything()), so F2 is unreachable
                       rather than fixed. F3 widened TableCellProps.width so the legacy HTML
                       attribute reaches the <td> again; TableHeadProps deliberately NOT widened,
                       because ThHTMLAttributes declares no width and it was never a regression there.
                       377/377 green, typecheck clean, audit exit 0, 9,936 caller shapes byte-
                       identical, 10/10 mutations caught. No consumer pin bumped; no consumer is on a
                       sha that has the defective code at all.
Follow-up created:     None owed by this change. TD-3 (wording for a retired value) is the only new
                       recorded debt and it is a wording decision, not a defect.
```

---

## 18. Status

```
PASS
```

**The work is complete.** Three findings confirmed against the live code, three findings fixed, each
pinned by a spec and by a mutation that reddens without it, and the additive claim measured rather
than asserted.

**What remains true and is not rounded up:** `pnpm lint` was **not run**, because this repository has
no lint script and no ESLint config. **No consumer app's test suite was executed.** OQ-8's real-browser
truncation check was **never run** — no browser binary is executable from this sandbox — and it is
carried, untouched, from CR-009. None of these is claimed anywhere in this pack.

**What is NOT outstanding:** the code (377/377 green, typecheck clean), the additive proof (9,936
caller shapes byte-identical, toolbar snapshot zero-line diff), the mutation battery (10/10, 0
skipped), both scorecards (PASS, 0 open findings), the dependency audit (exit 0), every Stage 04 and
Stage 05 artifact, the decision log, the technical-debt record, the handover, and the context-usage
row.

⚠ **What this session does NOT claim:** that CI is green. The local gates are; this session does not
wait on CI and does not merge — that is the conductor's job. The session ends on `CHANGE_PR`.

---

## 19. Context Usage Summary

[Captured in-session by the active instance via `/cost` and `/context` per `CONTEXT_USAGE_SUMMARY_TEMPLATE.md`. The same figures are appended as one row to `organization/CONTEXT_USAGE_LOG.md`. Required at every Milestone close — Kernel Rule 9.]

| Metric | Value |
|---|---|
| Model(s) used | `claude-opus-5` |
| Input tokens | 500 |
| Output tokens | 197,444 |
| Cache read tokens | 41,994,888 |
| Cache write tokens | 518,545 |
| **Total tokens** | **42,711,377** |
| Peak context-window usage | 301k / **150% of 200k** |
| Session duration (wall / API) | one continuous build session, 2026-09-10 |
| Sessions this Milestone | **1** |
| Appended to `organization/CONTEXT_USAGE_LOG.md` | **Yes** |

Written by `organization/scripts/log-context-usage.mjs --team sw --project
bananaworld-design-system --epic CR-DESIGN-SYSTEM-010 --milestone CR-DESIGN-SYSTEM-010 --status
Closed` — the `--project` value is the repo **folder name verbatim**, which is what the close gate
greps (CR-DC-015 burned two remediation rounds on the display title). The figures are **measured by
the script from this session's own transcript**, not estimated. The row:

```
| 2026-09-10 | sw | bananaworld-design-system | CR-DESIGN-SYSTEM-010 | CR-DESIGN-SYSTEM-010 | opus-5 | 500 | 197444 | 41994888 | 518545 | 42711377 | 301k / 150% of 200k | 1 | Closed |
```

⚠ **This is measurement, not a budget** (MWP Rule 10.5). It is **~2.4× cheaper than CR-009** on the
same project, for a change that measured 5× as many caller shapes — because the byte-identity harness
was reused rather than rebuilt, which is exactly why it has now been **committed** to
`runs/change-09/output/` instead of thrown away a third time.

---

## 20. Close-Down Confirmation

| Requirement | Done? |
|---|---|
| All required stage outputs produced / updated | **Yes** — Stage 04: `test-results.md`, `qa-report.md`, `defect-log.md`, `deployed-verification.md`. Stage 05: `revision-review.md`, `simplification-opportunities.md`, `accepted-refactors.md`, `readable-code-scorecard.md`, `centrality-scorecard.md`. Plus `changed-files.md`, `implementation-summary.md`, `known-issues.md`, `technical-debt.md`, and the three tooling files. **Each as its own file — no roll-up substituted for one** (Rule 9.1) |
| Session handover (`runs/current/SESSION_HANDOVER.md`) updated | **Yes** — rewritten for CR-DESIGN-SYSTEM-010, and `runs/current/active-milestone.md` reconciled with it. **Both name this CR**, and both were **measured** against their token targets (2,540/5,000 and 1,685/2,000), never estimated |
| Context Usage Summary recorded (§19) and appended to the global log | **Yes** — §19 above, and one row appended with `--project bananaworld-design-system` |
| Owner notified: "Milestone [ID] is closed and ready for the next session" | **Yes.** Built, green, closed out, pushed, PR open. ⚠ **What is NOT claimed:** that CI is green — the local gates are, and the conductor polls CI and merges. The session ends on `CHANGE_PR` |
