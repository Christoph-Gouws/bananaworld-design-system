# CR-DESIGN-SYSTEM-002 — the document header moves into the shared package

> Logic plan. Written 2026-08-14 against `origin/main` @ `365be65`, branch `change/cr-design-system-002`.
> **Nothing has been built. No feature code exists for this change.**

<!-- OWNER-BRIEF-START -->

## What this gives you

Nothing on any screen changes today.

The strip at the top of your fourteen depot forms — the date, the depot, who raised it, the
document number — currently lives inside the depot system only. This moves it into the shared kit
that both the depot system and the sales system already draw their buttons and boxes from.

Once it is there, the sales system can wear the **same** strip rather than someone building a
lookalike that slowly drifts out of step. The depot's fourteen forms keep looking exactly as they
do now.

## One thing to confirm

When you asked for this you asked me to carry across the old fall-back wiring, in case you ever
wanted numbering switched back off. Since then you ruled numbering permanent and on, and that
fall-back was deleted two days ago. So there is nothing left to carry — I will move the strip
exactly as it stands today. Tell me if you meant otherwise.

## Not included

The sales system does not start using the strip here. That is its own job, straight after this
one. No new boxes, no new layout, nothing added "just in case".

## Risk

Fourteen live forms lean on this strip. None of them changes in this piece of work: the depot
system only picks up the new home later, in a separate step of its own that it controls.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 1. The precondition — VERIFIED, and it passed

The request says: *"START BY VERIFYING IT ACTUALLY DID; if useAuth is still in there, STOP."*

**Verified against `teams/AI Dev Team 6/projects/bananaworld-dc/src/components/ui/DocumentHeader.tsx`.**

| Check | Result |
|---|---|
| `useAuth` imported? | **No.** The only occurrences (lines 120, 201, 271) are comments recording its removal. |
| Import list | `react` (`useId`, types) · `@bananaworld/design-system` (`Input`) · `@/lib/document-number/document-date` (`describeDocumentDate`, `DocumentDateMood`) |
| Middle two slots | `props.origin.dcName` / `props.origin.raisedBy` — a **required, discriminated** `DocumentOrigin` prop (lines 253–256) |
| DC's own guard | `tests/contract/transaction-form-standard.test.ts:883` — *"the shared component reads NO session"*, asserting `not.toContain("useAuth")` |

CR-DC-039 landed. The session read is gone. **The gate is open.**

## 2. 🔴 TWO PREMISES OF THE REQUEST ARE STALE — CR-DC-046 LANDED 2026-08-12

The run order was set 2026-08-12. CR-DC-046 merged into DC the same day, and it went further than
the request knows. Both stale premises are recorded here rather than quietly worked around.

### 2.1 The eight transitional pieces no longer exist

The request: *"PRE_EPIC_HEADER_SLOTS and renderedBeforeThisEpic are the flag-OFF path… Carry them
across unchanged. Do not tidy them, do not decide here that they have served their purpose."*

They are already gone, and **not by a session's tidying decision — by the owner's**:

- `DocumentHeader.tsx:55` — *"🔴 CR-DC-046 — `PRE_EPIC_HEADER_SLOTS` REMOVED, 2026-08-12. …The owner
  ruled the flag permanent and ON (DECISION-358), so the far-right order above is the ONLY order,
  which is what production has rendered since the EPIC-023 flip."*
- `DocumentHeader.tsx:213` — *"🔴 CR-DC-046 — IT ALWAYS RENDERS, AND ALWAYS IN THE CANONICAL ORDER.
  The flag that used to decide whether a form got a header at all, and in which order, is gone."*
- `transaction-form-standard.test.ts:707` — the spec that asserted the pre-epic order existed is
  deleted, and says so in place.
- `renderedBeforeThisEpic` — **zero occurrences anywhere in DC's `src/`.**

There is nothing to carry across. I am not deciding they served their purpose; DECISION-358 already
did, and re-introducing deleted code into a shared package would be a regression in its own right.
**Surfaced to the owner in the brief as a confirm point, not decided silently.**

### 2.2 There is no flag left to solve

The request: *"THE FLAG IS THE ONE HONEST COUPLING TO SOLVE. The component asks DC whether numbering
is on… Decide how the answer arrives — a prop the app supplies is the obvious shape."*

`DocumentHeader` no longer asks. `useDocumentNumbering` and `DocumentNumberingProvider` were removed
by CR-DC-046 (`src/components/document-number/index.ts:9`). Zero occurrences in the component.

**Decision D-3 below: no flag prop is added.** Adding one now would be exactly the "configurability
added in anticipation" the request forbids, for a question the owner has already closed.

### 2.3 What the request did not know about, and IS still a coupling

The request names one coupling. There is a **different** one, and it is the only real work in this
change: line 38 imports `describeDocumentDate` and `DocumentDateMood` from
`@/lib/document-number/document-date` — an app path. That must be resolved or the package cannot
build standalone. See §4.

## 3. What moves, exactly

`bananaworld-dc/src/components/ui/DocumentHeader.tsx` (515 lines) lands as
`src/components/DocumentHeader.tsx`, beside `Sheet`, `SlideOver` and `Modal`.

Everything in the file comes with it, unchanged in behaviour:

| Piece | Kind | Note |
|---|---|---|
| `DocumentHeader` | component | The `<dl>` grid, mapping over the slot constant |
| `DOCUMENT_HEADER_SLOTS` | const | `["Date", "DC", "Raised by", "Document no."]` — the canonical order |
| `DocumentHeaderSlot` | type | derived from the constant |
| `DocumentNumberSlotState` | type | `absent` \| `auto` \| `editable` |
| `DocumentDateSlotState` | type | `value` \| `editable` |
| `DocumentOrigin` | type | discriminated `new` \| `existing` |
| `DocumentHeaderProps` | type | 8 props; `documentNumber` + `origin` required |
| `DOCUMENT_NUMBER_WHERE_TO_SET` | const | the owner's second refusal line |
| `HeaderSlot` · `DocumentDateSlot` · `DocumentNumberSlot` · `UndoDate` | private | not exported, as today |
| `slotMood` · `moodBorder` · `dateBorder` · `DocumentNumberMood` | private | not exported, as today |

### 3.1 "Five states" is three kinds — do not "fix" it

The request says the number slot has five states; `DocumentNumberSlotState` has three arms. Both are
right and neither is a defect. The five *visible* states of the approved option-c mockup are
`absent` · `auto` · `editable`-calm · `editable`-warn (Changed) · `editable`-error (collision) —
the last three are the `mood` split inside the one arm (`slotMood`, lines 419–426). **Carried across
as-is. A session that "collapses" this to three, or splits it to five, changes what a user sees.**

### 3.2 Every comment travels

The 🔴/⚠ fences in that file are load-bearing — they are the record of why the discriminant stays,
why the `auto` state is a value and not a disabled input, why `title` survives, why `<dl>` was
chosen. They carry over verbatim, with their DC anchors intact (an anchor to `DECISION-358` is still
a true statement about why the code looks as it does). Only the two import lines change.

## 4. 🔴 THE ONE REAL COUPLING, AND THE DECISION

`DocumentDateSlot` calls `describeDocumentDate(state.value, state.today)` to produce the day line —
"Friday 7 August · 1 day back", "Is that right?", "Today" — and the amber/blue mood that colours the
box. That function lives in DC's `src/lib/document-number/document-date.ts`.

That file is **420 lines and mostly not presentation**: SQL fragments (`DOCUMENT_DATE_NOW_SQL`,
`documentDateSql`, `documentDateTimestampSql`), the column map (`DOCUMENT_DATE_COLUMN`), row readers
(`documentDateFor`), validation (`isValidDocumentDate`). **None of that may enter this package** —
it is business rules and database shape, which TECH-COMP-003 excludes outright.

### The three options

| | Option | Verdict |
|---|---|---|
| **A** | Move only the pure day-line describer into `src/lib/document-date.ts`; leave every SQL/column/validation function in DC | **CHOSEN** |
| B | Hoist the description into the prop — the app computes `{mood, dayLabel, distanceLabel}` and hands it in | Rejected |
| C | Import the DC path into the package | Refused outright — it is the smuggled app import the request forbids |

**Why A.** What moves is `describeDocumentDate`, `DocumentDateDescription`, `DocumentDateMood`,
`DOCUMENT_DATE_WARN_DAYS`, and the three private helpers `moodFor` / `formatDistance` /
`formatDayLabel` with their three `Intl` formatters. Every one is pure: two calendar-day strings in,
a mood and two labels out. No IO, no `node:`, no `process.env` — DC's own file already calls this
half "THE PURE LEAF" and imports it from a client component for exactly that reason.

**Why B is wrong even though it is the "purer" answer.** It moves the wording and the colour rule
back into each app. The CRM would then compute its own day line, spell its own "Is that right?", and
pick its own threshold — which is the second copy that drifts, i.e. the precise thing this change
exists to prevent. A shared header whose sentences are supplied by the caller is not a shared header.

**On `DOCUMENT_DATE_WARN_DAYS = 60` being a "business rule".** It is not one, and DC's own file says
so twice: *"IT NEVER BLOCKS A SAVE. It changes a colour and a sentence."* The server applies no bound
(DECISION-259). A threshold that only decides which of two sentences is printed is presentation.
There is also standing precedent for non-UI purity here — this package already ships `./pricing` and
`./sales-order` engines.

**No option is added to override it.** "No configurability added in anticipation" (the request).
If the CRM ever needs a different number, that is an additive optional prop in a later change.

## 5. Data model + scoping

**There is no data model. This package has no database, no migration, no query, and gains none.**
`migrationExpected: false`.

The "data model" that matters is the exported **type surface**, and it is scoped by construction:

- `DocumentOrigin` carries `dcName` / `raisedBy` as plain `string | null` — **no `warehouse_id`, no
  `legal_entity`, no tenancy identifier of any kind**. The component cannot scope anything because it
  is never told what the depot *is*, only what it is *called*. That is what makes it wearable by the
  CRM, whose equivalent concept is not a depot at all.
- `DocumentNumberSlotState` carries rendered strings and callbacks. It never takes a transaction key,
  never mints a number, never talks to the numbering registry.
- `documentPdf` is a `ReactNode`. The package never learns which document is being printed.

## 6. Permission shape

**None. The component holds no permission logic and gains none.**

Who may edit a date or a number is decided by the caller: the app hands in
`documentDate.kind: "value"` (shown, not offered) or `"editable"` (the box), and that choice is made
by DC's `useDocumentDate`, which reads `usePermission`. The refusal itself is the server's
(RBAC-PRINCIPLE-001). `PermissionGate` stays in DC where it belongs — the same line this package has
drawn since extraction.

## 7. Files I expect to touch

All paths relative to this worktree.

| # | File | Action | Est. lines |
|---|---|---|---|
| 1 | `src/components/DocumentHeader.tsx` | **new** — the ported component | ~490 |
| 2 | `src/lib/document-date.ts` | **new** — the pure day-line describer only | ~115 |
| 3 | `src/lib/index.ts` | modified — add 4 exports | +6 |
| 4 | `src/components/index.ts` | modified — add 8 exports | +10 |
| 5 | `tests/components/DocumentHeader.test.tsx` | **new** — mirrored DOM + order + state specs | ~420 |
| 6 | `tests/components/document-date.test.ts` | **new** — mirrored describer specs | ~120 |

**Source estimate: 4 files, ~620 lines.** Tests are excluded from the estimate per the runner's rule.

### 7.1 The exact export additions (purely additive — nothing removed, no default changed)

`src/components/index.ts`:

```ts
export {
  DocumentHeader,
  DOCUMENT_HEADER_SLOTS,
  DOCUMENT_NUMBER_WHERE_TO_SET,
  type DocumentHeaderProps,
  type DocumentHeaderSlot,
  type DocumentNumberSlotState,
  type DocumentDateSlotState,
  type DocumentOrigin,
} from "./DocumentHeader";
```

`src/lib/index.ts`:

```ts
export {
  describeDocumentDate,
  DOCUMENT_DATE_WARN_DAYS,
  type DocumentDateMood,
  type DocumentDateDescription,
} from "./document-date";
```

⚠ **`DocumentDateSlotState` is exported from the package barrel even though DC's `@/components/ui`
barrel does not re-export it today.** DC's `use-document-date.ts:28` imports it by deep path
(`@/components/ui/DocumentHeader`), which will not exist after DC adopts. Exporting it now means DC's
follow-up has somewhere to point. Additive; costs nothing.

### 7.2 The two import lines that change

```diff
- import { Input } from "@bananaworld/design-system";
+ import { Input } from "./Input";
- import { describeDocumentDate, type DocumentDateMood } from "@/lib/document-number/document-date";
+ import { describeDocumentDate, type DocumentDateMood } from "../lib";
```

No cycle: `src/lib` imports nothing from `src/components`. `"use client"` stays on line 1, as on
every other interactive primitive here.

### 7.3 Files deliberately NOT touched

| File | Why |
|---|---|
| `package.json` | No new dependency. `useId` is React; every Tailwind token used is already in `tokens.css` and already used by shipped primitives — verified: `text-2xs` (Table:143, DataTableToolbar:216), `bg-warning-subtle`/`text-warning-fg` (StatusBadge:26), `border-danger` (Input:28), `text-fg-muted`, `text-fg-subtle`, `bg-surface-muted`, `--color-info-fg` (tokens.css:63). **No new token, no consumer Tailwind change.** |
| `vitest.config.ts` | The `components` project already globs `tests/components/**/*.test.tsx`. `document-date.test.ts` is a `.ts` — it will be placed under `tests/components/` as `.test.tsx`, or the engines glob widened; decided at build, whichever needs no config edit. Prefer no edit. |
| `src/lib/formatters.ts` | `formatDateZA` is a different function for a different job. Not merged, not reused — merging would change what an existing caller renders. |
| `.github/workflows/ci.yml` | Nothing new to run. |
| **Anything under `bananaworld-dc/`** | Not this repo, not this lane. See §8. |
| **Anything under `runs/epic-*/` or `runs/current/epic-plan/`** | A closed epic is immutable. EPIC-023 is cited throughout this plan and written to nowhere. |

## 8. 🔴 CROSS-APP INTERSECTION MAP

Five seams. **Not "none".**

### S-1 — The package writes; DC reads, on DC's own clock

| | |
|---|---|
| **Writer** | This change, in this repo. The header becomes an export of `@bananaworld/design-system`. |
| **Reader** | Bananaworld-DC, **later, in its own change**, when it bumps its pin. |
| **This change does NOT** | bump DC's pin, edit DC's barrel, delete DC's copy, or touch DC's fourteen forms. |

DC pins this package by git sha (`b1373c78` at last handover; five consumers total — DC, CRM, RMS,
org-admin, **Mangaverde**, per SESSION_HANDOVER §1). Each bumps when it chooses, **against the merged
sha on `main`, never a branch sha** (KI-M001E19-002 is that mistake on record).

🔴 **Consequence the request's framing hides: "the move" is two halves in two repos.** Half one is
this change. Half two is DC's adoption change. Between them, the header exists in both trees. That is
not drift — it is how a pinned estate moves, and it ends when DC's half lands.

### S-2 — DC's contract test asserts this move has NOT happened

🔴 **The single most important finding in this plan, and it contradicts the request's testing clause.**

The request says: *"the existing contract tests that pin the slot order and the number states must
pass unchanged against the imported component."* **They cannot.** DC's
`tests/contract/transaction-form-standard.test.ts` is a `@vitest-environment node` **repo scanner**.
`SHARED_HEADER = "ui/DocumentHeader.tsx"` (line 159) is a path under DC's own `src/components`, read
as **text**, and five assertions are bound to it:

| Line | Assertion | After DC adopts |
|---|---|---|
| 671 | `expect(formExists(SHARED_HEADER)).toBe(true)` | **RED** |
| 692 | source contains `export const DOCUMENT_HEADER_SLOTS = [...] as const;` | **RED** |
| 699–704 | source contains `slots.map(` and `const slots = DOCUMENT_HEADER_SLOTS;` | **RED** |
| 889 | `expect(formExists(SHARED_HEADER)).toBe(true)` — commented **"🔴 THE PROMOTION HAS NOT HAPPENED, ASSERTED"** | **RED** |
| 1515 | LEG 3 — the shipped component names all four slot literals | **RED** |

Line 889 is explicit that it exists to assert the promotion has not occurred, and line 881 says
*"THAT MOVE IS A LATER CHANGE IN THE DESIGN-SYSTEM LANE; this spec asserts only that the door is now
open, not that anybody walked through it."*

| | |
|---|---|
| **Owner of the fix** | Bananaworld-DC, in its adoption change. |
| **The fix** | Re-point `SHARED_HEADER` at the resolved package file, and **invert** line 889's spec — it should assert the promotion HAS happened. A loud, deliberate edit, the same shape as M003's slot re-order — never by relaxing the check. |
| **This change** | Cannot and must not do it. It is DC's file, in DC's repo, and DC's tests cannot be run from this sandboxed worktree (SESSION_HANDOVER §3 records exactly that limitation on CR-DESIGN-SYSTEM-001). |
| **What this change does instead** | Mirrors the equivalent assertions into this package's own suite (§9), so the standard is guarded on this side from day one and DC's re-point has something real to point at. |

### S-3 — The day-line rule crosses into shared territory

`describeDocumentDate` and its 60-day threshold move into the shared kit. **Writer:** this package.
**Readers:** DC today (after adoption), CRM tomorrow. The CRM will inherit DC's wording and DC's
threshold. That is the intended uniformity, and it is stated here so it is a recorded decision rather
than a side effect nobody noticed. DC's SQL, column map and validation stay in DC and do **not**
cross.

### S-4 — The four other consumers read nothing new

CRM, RMS, org-admin and Mangaverde pin this package. This change adds exports and removes nothing, so
all four continue to build byte-identically against their current pins, and against a bumped pin they
simply gain an export they do not import. **No consumer action required, from any of them.**

⚠ One forward note for the CRM only: the header uses `text-2xs`, the `warning-*`/`info-*`/`danger-*`
token families and `bg-surface-muted`. All exist in this package's `tokens.css` and in DC's Tailwind
theme. **The CRM's Tailwind theme must define the same scale before it renders the header** — the
package's standing consumer requirement (README), checked in the CRM's adoption change, not here.

### S-5 — The CRM does not adopt here

`CR-CRM-document-header-parity` is blocked on this change and runs in the crm lane afterwards.
**Nothing in this change writes to, reads from, or anticipates the CRM.**

### Register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo and there is no
`governance/` directory** — the same finding CR-DESIGN-SYSTEM-001 recorded as D-12 and carried as
known-issue C-4. Creating one is a governance decision, not part of this change. Flagged again rather
than invented; the seams above are the record.

## 9. Testing

**Standing constraint, stated plainly: DC's tests cannot run from this worktree.** This is a
sandboxed design-system worktree with no DC checkout, no DC dependencies and no DC test runner. Any
claim that "DC's fourteen forms were proved" from here would be a fabrication. What follows is
therefore split into what this change can prove and what DC's adoption change must prove.

### 9.1 Provable here — the package's own suite (`pnpm test`)

Baseline to record before any edit (last known: 79 passed / 7 files).

**`tests/components/DocumentHeader.test.tsx`** — mirrors DC's `tests/unit/components/DocumentHeader.test.tsx`
(16 specs), rewritten to construct `origin` objects as literals instead of mocking DC's
`AuthProvider`/`useDocumentOrigin`, which do not exist here:

1. The four slots render in `DOCUMENT_HEADER_SLOTS` order, read off the **DOM** (`querySelectorAll("dt, label")`), date first, number fourth.
2. A renamed date slot (`dateLabel="Order date"`) stays **first** — position, not name.
3. `dateControl` wins: the form's own control renders in the top-left slot.
4. `documentDate` renders the shared slot when `dateControl` is absent; `dateControl` wins when both are given (the precedence at lines 230–239).
5. `origin.kind: "existing"` names the document's own person and depot; **the viewer's name appears nowhere.**
6. `origin` with `null` fields renders the dashed empty state — not a name, not a guess.
7. Number slot **absent** — em dash + "Not numbered yet".
8. Number slot **auto** — the code, "Given automatically", and **no input element**.
9. Number slot **editable/calm** — input pre-filled, hint shown.
10. Number slot **editable/warn** — "Changed" pill, the consequence sentence naming the next number, Undo fires the callback.
11. Number slot **editable/error** — the server's sentence **and** `DOCUMENT_NUMBER_WHERE_TO_SET`, `role="alert"`, `aria-invalid`.
12. Date slot moods — `today` → "Today"; `informed` → day + distance + Undo, no amber; `questioned` → bold day, "Is that right?", amber border.
13. `documentPdf` renders inside the number slot in **all three** of its kinds.
14. The rendered order comes from **mapping the constant** — reordering the constant reorders the DOM.

**`tests/components/document-date.test.ts(x)`** — mirrors the day-line half of DC's
`tests/unit/document-date.test.ts`: the mood boundaries (0 → `today`, 1..60 → `informed`, 61 →
`questioned`, **any** future day → `questioned`), the year printed only when it is not the current
year, "1 day" vs "2 days", "back" vs "ahead", and the no-comma weekday join.

**Standalone-build proof (the request's explicit ask):** `pnpm typecheck` runs `tsc --noEmit` over
`src/` with no app path alias configured. An `@/…` import would not resolve and would fail the
typecheck outright. Additionally, a spec asserts the ported source contains no `@/` and no
`bananaworld-dc` string — a scan, cheap, and it bites the day someone re-plumbs an app import in.

**Barrel re-export proof (the request's explicit ask):** a spec that imports
`{ DocumentHeader, DOCUMENT_HEADER_SLOTS, DOCUMENT_NUMBER_WHERE_TO_SET }` from the **package root**
(`../../src`), not from the component file, and renders it. That is the line between "no import
changed" and fourteen broken forms — on this side of it.

**Additive proof:** `git diff --stat` on `src/` must show **0 deletions** outside the two new files.

### 9.2 NOT provable here — DC's adoption change owes these

Handed over, not hidden:

1. `pnpm test tests/unit/components/DocumentHeader.test.tsx` — DC's real 16 specs, against the imported component.
2. `pnpm test tests/contract/transaction-form-standard.test.ts` — after re-pointing `SHARED_HEADER` and inverting the line-889 spec (S-2).
3. `pnpm test tests/unit/adjustment/adjustment-sheet.test.tsx` and the twelve forms' own suites.
4. A visual check of all **thirteen render sites across twelve files** (`HEADER_RENDER_SITES`, contract test line 245 — note it is **twelve files / thirteen headers**, not fourteen forms; `RipeningRunsView` renders two).
5. `pnpm typecheck` with `use-document-date.ts:28`'s deep import re-pointed at the package barrel.

⚠ **The "flag ON and flag OFF" half of the request's testing clause is not testable by anyone.**
There is no flag (§2.2). Flag-ON is the only path production has run since the EPIC-023 flip.

## 10. Decisions

| # | Decision | Rationale |
|---|---|---|
| D-1 | **The header is ADDED to this package. DC is not touched.** | Additive-only is the lane rule. Consumers move their own pins in their own changes, against the merged sha. |
| D-2 | **The eight transitional pieces are NOT re-created.** | They were deleted by CR-DC-046 under owner ruling DECISION-358, before this session ran. Re-adding deleted rollback code to a shared package is a regression, not fidelity. Surfaced to the owner in the brief. |
| D-3 | **No flag prop is added.** | There is no flag left to answer. Adding one is anticipatory configurability, which the request forbids. |
| D-4 | **The pure day-line describer moves to `src/lib/document-date.ts`; every SQL/column/validation function stays in DC.** | The describer is presentation (it picks a sentence and a colour, never blocks a save). The rest is business + database and is excluded by TECH-COMP-003. |
| D-5 | **The 60-day threshold moves with it, unconfigurable.** | Uniformity is the point of the change. An override prop is a later, additive change if ever needed. |
| D-6 | **All 🔴/⚠ fences travel verbatim, with their DC anchors.** | They are the record of why the discriminant stays, why `auto` is a value not a disabled input, why `<dl>`. A fence stripped of its anchor is a fence nobody honours. |
| D-7 | **`DocumentDateSlotState` is added to the barrel** though DC's barrel does not export it today. | DC's `use-document-date.ts` reaches it by deep path; after adoption that path is gone. Additive, and it unblocks DC's follow-up. |
| D-8 | **`epicRecommended: false`.** | Two new files, two barrel edits. No service, no integration, no tenancy or authorisation model, no new section of the system. It does not decompose into five controlled units of work. |
| D-9 | **`uiBearing: false`.** | The change is defined by byte-identical rendering. No operator reads or picks anything different — in any of the five consumers — on this change or on DC's adoption of it. Nothing to mock up: the approved design is the shipped screen. |
| D-10 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is not created.** | It does not exist and there is no `governance/` directory. Creating it is a governance decision (CR-DESIGN-SYSTEM-001 D-12, known-issue C-4). Flagged, not invented. |

## 11. Open questions

1. **(For the owner, non-blocking — in the brief.)** The eight transitional pieces are gone by your
   own DECISION-358. This plan moves the header as it stands today. If you intended them restored,
   that is a different change and it belongs in the DC lane, not here.
2. **(For DC's adoption change, not this one.)** Whether DC's contract test re-points `SHARED_HEADER`
   at the resolved package path or replaces the text scan with a real import once the component is no
   longer a DC file. Both work; DC owns the call. Recorded in S-2 and repeated in the developer
   handover at close.
3. **(Non-blocking, carried.)** The cross-system change register still does not exist in this repo.
   Second change running to raise it.

## 12. Risks

| Risk | Reality |
|---|---|
| Fourteen live forms break | **Not from this change.** Nothing DC ships changes until DC bumps its pin, which DC does in its own change. This change adds an export nobody imports yet. |
| A caller renders differently after adoption | The whole design is byte-identity: same JSX, same class strings, same slot order, same five number states, same date behaviour, same empty state. Only two import specifiers change. Proved by the mirrored DOM suite here and by DC's real suite at bump time. |
| A DC test goes red at adoption | **It will — five assertions, and they are supposed to.** S-2 names each one and hands the fix to DC. This is disclosed, not discovered later. |
| An app import sneaks into the package | Two guards: `tsc --noEmit` cannot resolve `@/…` with no alias configured, and a spec scans the ported source for `@/` and `bananaworld-dc`. |
| The day-line rule now binds the CRM too | Stated as S-3 and D-5, deliberately. If the CRM ever needs a different threshold, that is an additive optional prop later — not something to pre-build now. |
