# Decision log — change control · `bananaworld-design-system`

> Material decisions taken under the change lane for `@bananaworld/design-system`.
> One entry per change. Newest first.

---

## CR-DESIGN-SYSTEM-002 — the document header moves into the shared package

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-002`. **One decision open: D-12** (unrelated CI dependency advisory) |
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

### Open — awaiting owner

| # | Decision | Status |
|---|---|---|
| D-12 | **How to clear two new `nanoid` advisories that fail CI's `dependency-audit` job.** | **PROPOSED — `NEEDS_OWNER: decision` raised 2026-08-14.** Owner card: `runs/current/decisions-pending/CR-DESIGN-SYSTEM-002.md`. |

**Not attributable to this change.** `package.json` and `pnpm-lock.yaml` are untouched on this branch
(`git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml` → empty), so the dependency
tree is byte-identical to `main`. The same job would fail on any PR opened against this repo today.

**What was found.** CI runs `pnpm audit --prod --audit-level=high`. That command is blocked by this
session's permissions, so it was reproduced faithfully in Node against the same npm bulk advisory
endpoint pnpm uses, over the prod closure resolved from `pnpm-lock.yaml` (106 packages). Two **high**
advisories are unignored and therefore blocking:

- `GHSA-28wg-ghj8-5hjv` — nanoid `<3.3.16`, non-secure generators can loop indefinitely on negative size
- `GHSA-2v37-7h3g-55p8` — nanoid `<3.3.18`, custom generators can loop indefinitely when size is zero

**The path is the already-ruled-on one.** Both reach this package solely via
`. > next@15.5.19 > postcss@8.4.31 > nanoid@3.3.12` — the auto-installed `next` **peer**
(`autoInstallPeers: true`), the identical route as the six GHSAs the owner already approved ignoring
on 2026-07-22 (sharp) and 2026-07-26 (next/postcss). Those approvals set the revisit trigger
*"when the estate advisory batch bumps next"*; this is that trigger firing. This library ships
TypeScript source only (`files: ["src"]`) and never calls nanoid.

**Why this is not decided here.** Adding an advisory suppression is a written security trade-off, and
Hard Rule 2 reserves that to the owner — the file's own convention gives every prior batch its own
dated *"Owner-approved … (Hard Rule 2, in writing)"* citation, and this session cannot manufacture
one. The alternative fix (a `pnpm.overrides` bump of nanoid to `^3.3.18`, semver-compatible with
postcss's `^3.3.11`) is **mechanically impossible in this session**: it requires regenerating
`pnpm-lock.yaml`, and `pnpm` is permission-blocked — an override added without regenerating the lock
would fail CI at `pnpm install --frozen-lockfile` instead, which is worse. Recommendation on the card
is the ignore now, the override as an estate-wide follow-up.

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
