# Milestone Evidence

> _Fill this by **copying the template and editing the values in** — never re-type the boilerplate (Kernel Rule 9 artifact mechanics). Where a section reports on another artifact (test log, QA report, scorecard), cite it — path + status + counts — rather than restating its content. Every section still completes in full; the rule changes production mechanics, not evidence requirements._

```
Project:        bananaworld-design-system
Epic:           CR-DESIGN-SYSTEM-009 — (not an epic: a CHANGE REQUEST, archived at runs/change-08/)
Milestone:      CR-DESIGN-SYSTEM-009 — A grid filter cell holds several values, and the grid reads at a compact density
Date:           2026-09-09
Active Agent:   Software Developer Agent (build), then Code Reviewer / Refactor Agent (Stage 05)
```

> ⚠ **This is a Change Request, not an epic or a milestone.** The two fields above carry the CR id
> because the close gate greps for it; **no `runs/epic-NN/` folder, no `milestone-NN/` folder and
> nothing under `runs/current/epic-plan/` was created.**

---

## 1. Scope Implemented

Built to the owner-approved logic plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-009.md` (layout **B**,
ship mode **on-green**). Four strictly opt-in additions to the shared UI package:

- **A — a `select` filter cell that holds SEVERAL option ids.** `GridFilterCellDef.multiple` turns the
  cell into a Radix `DropdownMenu` of `CheckboxItem`s that stays open across ticks, with the owner's
  option **C** tri-state "Select all" master row carrying `3 of 12`. The value shape gained ONE
  optional field (`values?`), and the wire encoding — a repeated parameter — is stated in
  `lib/grid-view.ts`'s header for the consumer's parser to be built to.
- **B — a `compact` density for the table family.** Asked once on `<Table>`, read by `TableHead`,
  `TableCell`, `GridHeadCell` and `GridFilterRow`'s cells through one context: ≈24px rows against
  today's ~36–44px.
- **C — values that stay on one line**, cut with an ellipsis and recoverable on hover (`wrap`).
- **D — a named per-column width scale** (`narrow`/`medium`/`wide`/`full`) so a customer name is given
  more room than a reference code — the owner's third plan note, approved as layout **B**.

🔴 **No second multi-select menu was written.** The tick-list's shared parts were MOVED out of
`DataTableToolbar` into `components/MultiSelectMenu.tsx` and now serve both surfaces.

Full detail: `runs/change-08/output/implementation-summary.md`.

---

## 2. Out-of-Scope Items Avoided

Per the CR and plan §0 / §C.6:

| Not done | Why |
|---|---|
| **The report's WIDTH** (`max-w-[1440px]`) | `bananaworld-dc`'s shell — DC's file, DC's lane, DC's own change. Named out of scope by the CR itself |
| **Any consumer pin bump** | Consumers move their own pin, in their own change, against the **MERGED** `main` sha — never a branch sha (KI-M001E19-002) |
| **Column resizing by dragging a header edge** | A genuinely bigger feature (pointer capture, a width in `GridState`, in the saved view, in the wire format). Not needed to stop wrapping. Its own change if wanted — plan §C.6 |
| **A per-column cap the READER sets or the system remembers** | The width is a static declaration in the app's column list; it never enters `GridState`, the saved view or the wire format. That is the whole distinction from resizing (OQ-7) |
| **A `minWidth`** | The one addition that could make a report *wider*. Deliberately left out |
| **A count-first TRIGGER** ("3 of 12 rooms" in the closed box) | Every approved mockup shows `Cold room 1 +2`; changing it would move shipped CRM/DC toolbars (OQ-1) |
| **A URL codec for `f_<key>`** | The parameter names are DC's; a codec here would import an app's vocabulary into a pure UI package (OQ-2) |
| **A reader-facing density switch** | Answered by the owner's third note — *"I want reports to just open smaller."* The app chooses; the package default does not move (OQ-5) |
| **Any new design token** | `src/lib/tokens.css` untouched — plan §B.3 |
| **Any write inside `bananaworld-dc`** | Read-only sibling. **This session issued reads only** — four files opened to re-verify the plan's citations, zero writes |

---

## 3. Source Documents Consulted

| Document | Sections referenced |
|---|---|
| `runs/current/logic-plan/CR-DESIGN-SYSTEM-009.md` | **the whole file** — the owner-approved contract. §A.1–A.5, §B.1–B.4, §C.1–C.6, §2 (the eight seams), §3, §4, §5, §6 (OQ-1…OQ-9), §7, §8, §9 |
| `runs/current/mockups/CR-DESIGN-SYSTEM-009/comparison.html` | the width-scale options — confirming approved **layout B** is §C.4's three-step scale, and the "Roomy / Ordinary / Tight / Never cut" reading |
| `runs/current/SESSION_HANDOVER.md` | items 1–13; especially 4 (additive-only), 5 (the byte-identity harness), 6 (`git checkout --` restores from the INDEX), 7 (the audit probe's three lies), 10, 12, 13 |
| `runs/current/active-milestone.md` | the active unit pointer |
| `runs/change-07/output/{test-results,qa-report}.md` | §7 the audit method and its S1–S4 assertions; §8 "what was NOT run" |
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | prior CR entries, for the entry format |
| `_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` | this file, copied and filled |
| `teams/AI Dev Team 6/_config/governance/REFACTORING_GUIDE.md` | `GUIDE-RC-04` / `GUIDE-RC-05` — via the sensor's own hook output and §4's justification valve (⚠ the file itself is outside this worktree and could not be opened; the rule was followed from the sensor's stated protocol) |
| **In-repo source, re-read to verify the plan's premises** | `src/components/Table.tsx`, `GridFilterRow.tsx`, `GridHeadCell.tsx`, `DataTableToolbar.tsx`, `ListCard.tsx`, `src/lib/{grid-view,table-controls,cn,index}.ts`, `src/{components/index,index}.ts`, all five affected test files, `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml` |
| **`bananaworld-dc` — READ-ONLY, reads only** | `src/components/reports/ReportGrid.tsx` (the filter-row block, the raw Actions `<th>`), `src/components/reports/grid-props.ts` (`filterCells` — confirmed it sets no `multiple`/`width`), `src/lib/reports/grid/grid-request.ts` (`filterValueFor`, `params.get`), `src/lib/reports/grid/grid-state.ts` (`appendFilters`) |

---

## 4. Files and Folders Changed

**Cited, not restated** — the authoritative list is `runs/change-08/output/changed-files.md`:
**15 files, +1,588 / −92**, of which 10 source (+763 / −90) and 5 tests (+825 / −2).

| File | Action | Reason |
|---|---|---|
| `src/components/Table.tsx` | Modified | density / wrap / column-width vocabulary, the one layout context, the per-axis class records, `wrap`+`width` on head and cell, the string-children `title` |
| `src/components/GridFilterRow.tsx` | Modified | `multiple` + `width` on the def, the new `MultiSelectCell`, `FilterHeadCell`, density-aware chrome. **The one-value `SelectCell` untouched** |
| `src/components/MultiSelectMenu.tsx` | **Added** | the tick-list's shared parts, MOVED here, + the tri-state `MultiSelectAllRow` |
| `src/components/DataTableToolbar.tsx` | Modified | imports the extracted parts; renders the master row on `selectAll: "master"`. **Net −18 lines, identical render** |
| `src/components/GridHeadCell.tsx` | Modified | reads the density; passes `width` through to its `TableHead` |
| `src/lib/grid-view.ts` | Modified | optional `values`, the two arity helpers, one `gridFilterIsEmpty` clause, the wire encoding in the header |
| `src/lib/table-controls.ts` | Modified | optional `selectAll` on `MultiSelectFilterDef` (⚠ the ninth file — plan §3 listed eight) |
| `src/components/index.ts` · `src/lib/index.ts` · `src/index.ts` | Modified | six names added to the barrels; **none removed, none moved** |
| `tests/components/Table.test.tsx` | Modified | §9, T-23 … T-38 |
| `tests/components/Grid.test.tsx` | Modified | the multi cell, driven by ticking |
| `tests/components/Grid.additive.test.tsx` | Modified | the additive claim + the grid's three rows moving together |
| `tests/components/grid-view.test.tsx` | Modified | §2, the arity helpers and the wire encoding |
| `tests/components/DataTableToolbar.test.tsx` | Modified | `selectAll` defaults and the master opt-in |

**Deleted: none.** `package.json`, `pnpm-lock.yaml` and `src/lib/tokens.css` **untouched**.

---

## 5. Gates Completed

| Gate | Status | Notes |
|---|---|---|
| Requirements Gate | **Pass** | Discharged at the **plan gate**, which the owner approved (layout B, on-green) after three revisions and four recorded responses. The owner's two sentences are traced to acceptance criteria in `qa-report.md` §1 |
| Architecture Gate | **Pass** | The eight-seam cross-app map is plan §2 — writer, reader and decision for each. Value shape, wire encoding and the routes rejected (a fifth `kind`; widening `value` to a union) are decided there with reasons |
| File Inspection Gate | **Pass** | Every file the plan cites was **re-opened and verified before any edit**. In-repo: all exact. In `bananaworld-dc`: three path/line drifts, **every underlying fact intact** — `known-issues.md` §B |
| Database Gate | **Not applicable** | This package has no database by construction (TECH-COMP-003 / ADR-001). `migrationExpected: false`; no migration written, none rehearsed, no Postgres started |
| API and Integration Gate | **Not applicable** | No network call, no endpoint, no client. The only "integration" is the shape/wire seam, covered by the Architecture Gate above |
| UX Gate | **Pass** | The mockup gate ran before this session: `runs/current/mockups/CR-DESIGN-SYSTEM-009/` — the open filter menu with ticks and "Select all", and both densities side by side. Owner chose tick-list **C**, density **C**, long-values **2**, and approved **layout B** for the width scale |
| Security and Permissions Gate | **Pass, and it BIT** | No authorisation surface exists here (§8). But the dependency audit — part of this gate in practice — found **3 new high/critical advisories** and is the reason this change did not open a PR. §12 and `known-issues.md` §A |
| Test Planning Gate | **Pass** | Plan §4 specified the proof up front: baseline first, caller-shape render diff against the merge base, `git add` before any mutation battery, a real-browser check for §C.4, the named callers to state, and the audit's third sanity check. **All executed except the browser check** — §7 |

---

## 6. Tests Run

**Cited, not restated** — full report: `runs/change-08/output/test-results.md` (§1–§8).

| Test | Command | Expected | Actual | Result |
|---|---|---|---|---|
| Baseline, **before any edit** | `pnpm test` | a measured number, never a quoted one | **314 passed / 17 files** | **Pass** |
| Type surface | `pnpm typecheck` | clean | clean | **Pass** |
| Full suite, final | `pnpm test` | ≥ baseline, 0 existing specs reddened | **363 passed / 17 files**; **+49 new**, **0 edited**, **0 reddened** | **Pass** |
| 🔴 Byte-identity vs `main@6ed975d` | throwaway harness: render every existing caller shape against `git show 6ed975d:` and against this build, compare whole `innerHTML` | **0 differences** — this change alters no behaviour | **1,972 shapes, 0 differences** (TableCell 576, Row×Cell 192, TableHead 192, frame 4, GridHeadCell 864, GridFilterRow 144) | **Pass** |
| 🔴 The seven shipped toolbar screens | `vitest` DOM snapshot | unchanged, character for character incl. class order | **zero-line diff** | **Pass** |
| Mutation battery | throwaway harness: restore 8 specific defects, confirm each reddens | 8/8 caught, every restore verified byte for byte | **8/8 caught, 8/8 restores verified** | **Pass** |
| Quality sensors | `quality-sensors.mjs --changed … --scorecard …` | 0 open findings | **0 open, 5 justified, 0 weak** | **Pass** |
| Dependency audit (CI's job, reproduced in Node) | `pnpm audit --prod --audit-level=high` equivalent | 0 blocking | 🔴 **3 BLOCKING** (2 critical `next` RCEs, 1 high `sharp`), published **2026-09-08** | **FAIL — and it is pre-existing on `main`** |
| Migration rehearsal | — | N/A, no database | none written, none run | **N/A, recorded** |
| Throwaway Postgres | — | nothing left behind | **never started**: no container, no stopped container, no port held | **Pass** |
| **Real-browser check of OQ-8** | — | the `max-width` cap holds on a `<td>` | 🔴 **NOT RUN** — no browser binary is executable from this sandbox. Probe shipped ready to run | **Not run, stated** |

---

## 7. Manual Verification

**Cited, not restated** — the owner-facing steps are `runs/change-08/evidence/user-verification-steps.md`.

| Step | Expected | Actual | Result |
|---|---|---|---|
| Confirm the approved mockup matches what was built | comparison.html option **B** — three column sizes, roomy for names — is the shipped design | §C.4's scale is exactly option B: `narrow` 6rem / `medium` 11rem / `wide` 20rem / `full` | **Pass** |
| Confirm nothing an owner opens changes today | every screen in every app renders identically | 1,972 caller shapes byte-identical; toolbar snapshot zero-line diff | **Pass** |
| Drive the tick-list as a reader would | tick three, list stays open, "Select all" takes all then clears, count reads `3 of 12` | all asserted by clicking in `Grid.test.tsx`; mutation M-5 proves the "stays open" spec is real | **Pass** |
| Read a compact grid | head, filter row and body all tighten together | one `density` reaches all three — `Grid.additive.test.tsx` | **Pass** |
| 🔴 **Confirm a long value is visibly cut** | an ellipsis appears on screen | **NOT VERIFIED — no browser is executable from this sandbox.** Probe shipped: `runs/change-08/output/truncate-probe.html`, one click to settle | **Owner step, open** |
| 🔴 **Decide the advisory question** | the change can merge | **blocked** — decision card at `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` | **Owner step, open** |

---

## 8. Security Review

- Triggered: **Yes — by the dependency audit, and it FAILED.**
- Outcome:

**Application-surface review: nothing to review, and the reason is structural.** This package is pure
presentation (TECH-COMP-003 / ADR-001): no network call, no record read or written, no authorisation
logic, no tenancy, no secret, no `process.env`. The three app-coupled components that would carry any
of that — `PermissionGate`, `SyncStatusIndicator`, `SyncStatusDetail` — are deliberately not here.
This change adds no import of any kind and no new dependency. No user input is interpolated into
markup; the only strings rendered are labels a consumer already passes today.

🔴 **Dependency review: THREE NEW HIGH/CRITICAL ADVISORIES, and they stop the change.**

| Advisory | Severity | Package | Published | Fixed in |
|---|---|---|---|---|
| `GHSA-2xp9-vwfh-vxw4` | **critical** | `next` — unauthenticated RCE, Image Optimization API (AVIF) | **2026-09-08** | 15.5.24 |
| `GHSA-p293-qw3h-jr36` | **critical** | `next` — unauthenticated RCE on windows-hosted servers | **2026-09-08** | 15.5.24 |
| `GHSA-rgj7-g3m4-5g8c` | high | `sharp` — inherited libheif CVEs | **2026-09-08** | 0.35.4 |

Confirmed against **two independent sources** (the npm bulk endpoint `pnpm audit` uses, and the GitHub
advisory API), because this probe has lied on its first run four changes running — `defect-log.md` D-2.

**Not caused by this change:** `package.json` and `pnpm-lock.yaml` are byte-identical to `main`, which
fails the same audit today. **Not fixable here:** every lockfile-writing command is permission-blocked
in this worktree, and adding two RCEs to the owner-approved ignore list is not a change's call.
Escalated as a decision — `known-issues.md` §A and the owner's card.

Six previously-known highs remain on the standing owner-approved ignore list, unchanged. Seven
moderates sit below the blocking threshold; two are the standing watch items (`GHSA-fxqj-rqcc-2cmp`,
`GHSA-qx2v-qp2m-jg93`) — **third change to raise them**.

---

## 9. Code Quality Review

**Cited:** `runs/change-08/output/revision-review.md`, `simplification-opportunities.md`,
`accepted-refactors.md`.

**Revision review — the change is the approved plan.** All 16 plan requirements honoured, including
the ones where the plan chose the *less* obvious answer (OQ-1 the trigger wording does not change;
OQ-2 no URL codec here; OQ-4 two density values not three; OQ-5 no reader-facing switch). **Two
departures from the plan's letter, both disclosed and neither behavioural:** one `TableLayoutContext`
where §B.1 sketched two private contexts (identical exported surface), and a ninth source file because
`MultiSelectFilterDef` lives in `table-controls.ts`, not where §3 implied.

**Simplification — 8 candidates considered, 2 applied, 6 rejected with reasons.**

| Applied | Effect |
|---|---|
| `useCellLayout` — one shared reader replacing the same five-line hook-and-resolve dance in `TableHead` and `TableCell` | **−8 lines**, one fewer internal hook, and "never call a hook conditionally" becomes structural rather than a comment repeated twice |
| `CELL_BASE` composed once at module load instead of per render | removes a function and a `cn()` per cell per render; restores the shape the file already had |

**The most important rejection: merging `SelectCell` into `MultiSelectCell`.** It is the largest
apparent duplication in the change and removing it would have destroyed the proof — the one-value path
being the shipped function *unedited* is what makes byte-identity provable rather than argued. The
parts that genuinely must not drift were extracted instead (`MultiSelectMenu.tsx`). Also rejected:
folding the master row into the item (four optional props to save twelve lines — `GUIDE-RC-04`'s named
anti-pattern), splitting `Table.tsx` or `GridFilterRow.tsx` (both would still exceed 300 lines
afterwards), splitting the untouched `useTableControls`, and collapsing `chosenLabelsInOptionOrder`
(its two-array form *is* the behaviour).

🔴 **The change is a net simplification where it counts:** `DataTableToolbar.tsx` is **18 lines
shorter**, and the tick-list now has exactly one implementation serving two surfaces.

---

## 10. Readable Code Review

**Cited:** `runs/change-08/output/readable-code-scorecard.md` — **generated** by
`organization/scripts/quality-sensors.mjs`, never hand-authored; the five JUDGMENT rows answered
in-session, no machine-filled cell edited.

- Score: **11 of 11 dimensions** — 6 machine-decided PASS, 5 JUDGMENT answered PASS
- Minimum required: PASS (all mechanical checks meet threshold)
- Status: **Pass**

**Sensor result: 0 open findings, 5 justified, 0 weak.** The five justified are RC-04 ×1 and RC-05 ×4,
each recorded in the source as a `QUALITY-JUSTIFY` with the measurement behind it — not a restatement
of the threshold. Two of the four RC-05 files (`DataTableToolbar.tsx`, `table-controls.ts`) were
already over the line before this change, and this change made the first of them **shorter**.

⚠ **A sensor bug was found and reported while filling this.** `scanJustifications` cannot match a
justification on a **CRLF working tree** — `.` does not match `\r`, so `(.*)$` never anchors. The
scorecard first returned `BLOCKED (5 open, 0 justified)` with five correct justifications present in
the source. Isolated against the sensor's own exported function, worked around by normalising the
changed files to LF (which is what git stores in the index anyway, so the commit is byte-identical and
nothing was gamed). **The sensor still has the bug**; it is estate tooling, outside this project's
lane — `known-issues.md` §D.

---

## 11. Centrality Review

**Cited:** `runs/change-08/output/centrality-scorecard.md` — generated by the same sensor; the four
JUDGMENT rows answered in-session.

- Score: **8 of 8 dimensions** — 4 machine-decided PASS, 4 JUDGMENT answered PASS
- Minimum required: PASS (all mechanical checks meet threshold)
- Status: **Pass**

Three of the four judgment rows are **N/A with the reason recorded** (no authorisation code, no
validators, no vendor seam — this package is pure presentation by construction; an unrecorded N/A
would be a skip). The fourth, **business calculations**, is the one this change actively improved:
the tick-list's trigger arithmetic went from *about to be duplicated* to **one implementation serving
two surfaces**, which is precisely what the CR demanded — *"two multi-select menus in one product that
look or count differently is the defect, not the feature."*

⚠ **Two dimension groups were NOT scanned** (`CE-01`/`CE-05`, `CE-08`/`RC-09` — no `componentGlobs` or
`wiringGlobs` in this project's sensor config), so their PASS rows are a silence rather than a
measurement. Answered by hand in the scorecard and flagged for the owner in `known-issues.md` §D.

---

## 12. Known Issues

**Cited in full:** `runs/change-08/output/known-issues.md` (§A–§G) and `defect-log.md`.

**Open defects in the change: 0.** Two defects were found and fixed **in this session's throwaway
harnesses** — they never reached shipped code, and both are recorded because both produced a
confidently wrong result that looked like a real one (`defect-log.md` D-1, D-2).

| # | Open item | Owner |
|---|---|---|
| **§A** | 🔴 **Three high/critical advisories block the PR** — 2 unauthenticated `next` RCEs and a `sharp` high, published 2026-09-08. **Pre-existing on `main`**, byte-identical lockfile. Remedy is inside the declared `^15.0.0` range and verified to clear all three, but every lockfile-writing command is permission-blocked here | **Owner decision** |
| **§C** | **OQ-8 not verified in a browser** — no browser binary is executable from this sandbox. Bounded (failure mode = "the column does not narrow"), cannot move any existing render, named fallback recorded and untaken, probe shipped ready to run | Owner, one click |
| **§D** | `quality-sensors.mjs` silently ignores every `QUALITY-JUSTIFY` on a CRLF checkout; and `CE-01/05`, `CE-08`/`RC-09` are not scanned at all for this project | Estate tooling |
| **§B** | Three of the plan's `bananaworld-dc` citations drifted in path/line. **Every underlying fact intact** — including the load-bearing one, that DC's `filterCells` sets no `multiple` and no `width` | Recorded, no action |
| **§E** | Standing repo drift, fourth change running: no prettier config, no eslint/`lint` script, no `audit:deps`, and the snapshot's zero-diff CRLF artifact | Out of lane |
| **§E** | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist — eighth change to raise it.** The plan's eight-seam map (§2) is this change's record in its place | **Owner decision** |
| **§F** | Two moderate PostCSS advisories below the blocking threshold, **third change to raise them** | Owner |

---

## 13. Deferred Items

| Item | Reason deferred | Approved by | Target Milestone |
|---|---|---|---|
| **The real-browser verification of OQ-8** | No browser binary is executable from this sandbox. Deferred to a one-click owner step rather than skipped or claimed — `runs/change-08/output/truncate-probe.html` | Not yet approved — raised in `user-verification-steps.md` Step 2 | Owner acceptance of this change |
| **The `next` / `sharp` dependency refresh** | Every lockfile-writing command is permission-blocked in this worktree, and the alternative (ignoring two RCEs) is not a change's call | Not yet approved — decision card raised | Whichever unit the owner chooses; this change resumes on the answer |

**Nothing in the approved plan's scope was deferred.** All four parts (A multi-value filter, B compact
density, C one-line values, D the per-column width scale) shipped complete.

---

## 14. Source Document Amendments

| Document | Amendment | Status |
|---|---|---|
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | A CHANGE/DECISION entry for **CR-DESIGN-SYSTEM-009**: what was asked, what was decided at the plan gate, the layout picked (**B**), the ship mode (**on-green**), all four recorded owner responses including the two revise notes, and the eight in-session decisions (D-1…D-8) | **Applied** |
| `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` | **D-9, the advisory question — recorded PROPOSED, not decided.** Refresh the pinned `next`/`sharp`, extend the ignore list, or accept a red audit gate | **Proposed** |

🔴 **No Stage 07 amendment to a rule, contract or workflow was required, and here is the reason** — an
unrecorded N/A would be a skip:

- **No rule changed.** Additive-only, the one-class-per-axis rule, "consumers move their own pin
  against a merged sha" and "Radix underpins the interactive primitives" were all *obeyed*, not
  amended.
- **No contract changed in a way that alters an existing one.** The `select` filter value gained an
  **optional** field and the package now states a wire encoding it did not state before — both
  additions to `lib/grid-view.ts`'s own declared contract, written **into the file that owns it**,
  which is where that contract lives. No existing shape, default or export moved.
- **No workflow changed.** Same pipeline, same gates, same archive shape.

⚠ **The one document that would have taken an amendment does not exist:**
`governance/CROSS_SYSTEM_CHANGE_REGISTER.md`. This is the **eighth** change to raise it. Creating it
is a governance decision for the owner, not something a change may invent, so the approved plan's
eight-seam map (§2) plus this archive is the record in its place.

---

## 15. Scorecards

### Agent Scorecard

| Dimension | Score | Status |
|---|---|---|
| Scope compliance | 100% | **Pass** — all four approved parts built, nothing beyond them; the two departures from the plan's letter are non-behavioural and disclosed |
| Gate completion | 100% | **Pass** — 6 gates passed, 2 N/A with reasons (§5). No gate deferred |
| Test coverage | 100% | **Pass** — 363/363; +49 specs; 0 existing edited or reddened; **8/8 mutations caught** |
| Security compliance | **BLOCKED** | 🔴 the dependency audit **fails** on 3 advisories published 2026-09-08. **Not caused by this change** — `main` fails identically. Escalated, not absorbed |
| Code quality | 100% | **Pass** — sensors report **0 open findings**, 5 justified, 0 weak; 2 simplifications applied, 6 rejected with reasons |
| Documentation | 100% | **Pass** — every new field carries a doc comment stating what it does *and why the default does not move*; the wire encoding is written into the file that owns it |
| Evidence completeness | 95% | **Pass with one open item** — every required artifact exists as its own file; the single gap is OQ-8's browser check, which is **stated as not run** rather than claimed, and shipped as a one-click probe |

### Global Milestone Scorecard

| Category | Score | Minimum | Status |
|---|---|---|---|
| Readable code | 11/11 dimensions | PASS | **Pass** |
| Centrality | 8/8 dimensions | PASS | **Pass** |
| Security | — | PASS | 🔴 **Blocked** — 3 new high/critical advisories, **pre-existing on `main`**, owner decision pending |
| QA | 18/18 acceptance criteria met (2 class-level only, stated) | PASS | **Pass** |
| Evidence | 16/16 required artifacts present as their own files | PASS | **Pass** |
| **Overall** | **4 of 5** | **PASS** | 🔴 **BLOCKED on Security — see §18** |

The same table is carried, with its reasoning, in
`runs/change-08/evidence/global-milestone-scorecard.md`.

---

## 16. Blocking Reports

**One, raised at the end of Stage 04 and unresolved by design — it is the owner's to answer.**

| Report | Raised | Status |
|---|---|---|
| 🔴 **`NEEDS_OWNER: decision` — three high/critical advisories block the merge** | Stage 04, dependency audit | **OPEN.** Recorded PROPOSED as **D-9** in `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`; plain-English card written to `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md` |

**No `CHANGE_BLOCKED` was raised.** The change itself is complete, green and additive; what is blocked
is the merge, by a repository-wide condition that predates this branch.

**No `NEEDS_OWNER: decision` was raised for anything the plan already answered** — the plan gate
settled every design question (OQ-1…OQ-9), and none was re-opened.

---

## 17. Handoff

```
Next agent:            Human Owner (decision), then the Software Developer Agent on resume
Required next action:  Answer the decision card at
                       runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md — how to clear the three
                       advisories that fail CI's dependency-audit job. Optionally, open
                       runs/change-08/output/truncate-probe.html to close OQ-8 in one click.
Blocking status:       Blocked
Blocking reason:       CI's dependency-audit job (ci.yml:68) fails on GHSA-2xp9-vwfh-vxw4 and
                       GHSA-p293-qw3h-jr36 (critical, unauthenticated Next.js RCEs) and
                       GHSA-rgj7-g3m4-5g8c (high, sharp), all published 2026-09-08. NOT caused by
                       this change — package.json and pnpm-lock.yaml are byte-identical to main, and
                       main fails the same audit. Every lockfile-writing command is permission-blocked
                       in this worktree, and extending the ignore list is not a change's call.
                       The code is committed and pushed on change/cr-design-system-009; no PR opened.
```

---

## 18. Status

```
BLOCKED
```

**The work is complete; the merge is not permitted.** Stating that as PASS would be the false claim
this pack exists to prevent.

**What must be resolved before this change can close:**

1. 🔴 **The advisory decision (the only true blocker).** CI's `dependency-audit` job fails on three
   high/critical advisories published 2026-09-08. The owner picks one of the options on the decision
   card; the recommended one — refresh `next` to ≥ 15.5.24, **inside the `^15.0.0` range this project
   already declares**, which also pulls `sharp` ≥ 0.35.4 — was verified to clear all three. On the
   answer, a resumed session applies it, re-runs the audit, opens the PR, and the conductor merges on
   green.

2. **OQ-8, optional and one click.** Open `runs/change-08/output/truncate-probe.html`. If it reports
   the cap does not hold, the fallback is already specified and touches only the new truncate path.

**What is NOT outstanding:** the code (363/363 green, typecheck clean), the additive proof (1,972
caller shapes byte-identical, toolbar snapshot zero-line diff), the mutation battery (8/8), both
scorecards (PASS, 0 open findings), every Stage 04 and Stage 05 artifact, the decision log, the
technical-debt record, the handover, and the context-usage row.

---

## 19. Context Usage Summary

[Captured in-session by the active instance via `/cost` and `/context` per `CONTEXT_USAGE_SUMMARY_TEMPLATE.md`. The same figures are appended as one row to `organization/CONTEXT_USAGE_LOG.md`. Required at every Milestone close — Kernel Rule 9.]

| Metric | Value |
|---|---|
| Model(s) used | `claude-opus-5` |
| Input tokens | 822 |
| Output tokens | 412,218 |
| Cache read tokens | 101,363,797 |
| Cache write tokens | 758,442 |
| **Total tokens** | **102,535,279** |
| Peak context-window usage | 415k / **207% of 200k** (auto-compacted) |
| Session duration (wall / API) | one continuous build session, 2026-09-09 |
| Sessions this Milestone | **1** |
| Appended to `organization/CONTEXT_USAGE_LOG.md` | **Yes** |

Written by `organization/scripts/log-context-usage.mjs --team sw --project
bananaworld-design-system --epic CR-DESIGN-SYSTEM-009 --milestone CR-DESIGN-SYSTEM-009 --status
Closed` — the `--project` value is the repo **folder name verbatim**, which is what the close gate
greps (CR-DC-015 burned two remediation rounds on the display title). The row:

```
| 2026-09-09 | sw | bananaworld-design-system | CR-DESIGN-SYSTEM-009 | CR-DESIGN-SYSTEM-009 | opus-5 | 822 | 412218 | 101363797 | 758442 | 102535279 | 415k / 207% of 200k | 1 | Closed |
```

⚠ **This is measurement, not a budget** (MWP Rule 10.5). The figures are high because the additive
claim was *measured* — 1,972 caller shapes rendered twice and diffed, plus an 8-mutation battery —
rather than asserted in a sentence. That is the trade this project's quality-over-cost rule makes
explicitly.

---

## 20. Close-Down Confirmation

| Requirement | Done? |
|---|---|
| All required stage outputs produced / updated | **Yes** — Stage 04: `test-results.md`, `qa-report.md`, `defect-log.md`, `deployed-verification.md`. Stage 05: `revision-review.md`, `simplification-opportunities.md`, `accepted-refactors.md`, `readable-code-scorecard.md`, `centrality-scorecard.md`. Plus `changed-files.md`, `implementation-summary.md`, `known-issues.md`, `technical-debt.md`, `truncate-probe.html`. **Each as its own file — no roll-up substituted for one** (Rule 9.1) |
| Session handover (`runs/current/SESSION_HANDOVER.md`) updated | **Yes** — rewritten for CR-DESIGN-SYSTEM-009, and `runs/current/active-milestone.md` reconciled with it. Both name this CR |
| Context Usage Summary recorded (§19) and appended to the global log | **Yes** — §19 above, and one row appended with `--project bananaworld-design-system` |
| Owner notified: "Milestone [ID] is closed and ready for the next session" | 🔴 **No — and deliberately not.** This change is **BLOCKED**, not closed (§18). What the owner is handed instead is a decision card at `runs/current/decisions-pending/CR-DESIGN-SYSTEM-009.md`, and the session ends on `NEEDS_OWNER: decision`. Reporting it as closed would be the false claim this pack exists to prevent |
