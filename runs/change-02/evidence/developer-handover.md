# Developer handover — CR-DESIGN-SYSTEM-002

**The document header now lives in `@bananaworld/design-system`. This is half one of a two-half move.
Half two is Bananaworld-DC's adoption change, and it is not optional — read §3 before you start it.**

## 1. What landed

| File | Action |
|---|---|
| `src/components/DocumentHeader.tsx` | **new** — ported from `bananaworld-dc/src/components/ui/DocumentHeader.tsx`, 282 of 282 code lines identical |
| `src/lib/document-date.ts` | **new** — the pure day-line describer only (54 code lines of DC's 420-line file) |
| `src/components/index.ts` · `src/index.ts` · `src/lib/index.ts` | appended, +34 / −0 |
| `tests/components/DocumentHeader.test.tsx` · `tests/components/document-date.test.tsx` | **new** — 36 specs |

## 2. 🔴 THE FROZEN EXPORT CONTRACT — do not rename, do not tighten

DC's adoption change compiles against these exact names. They were carried over unchanged from DC
deliberately, so DC's re-point is a change of **import path only**, never of call sites.

From the package root (`@bananaworld/design-system`):

```ts
DocumentHeader                 // the component
DOCUMENT_HEADER_SLOTS          // ["Date", "DC", "Raised by", "Document no."] as const
DOCUMENT_NUMBER_WHERE_TO_SET   // "Numbering is set under Masters → Document Numbers."
type DocumentHeaderProps
type DocumentHeaderSlot
type DocumentNumberSlotState   // "absent" | "auto" | "editable"  (five VISIBLE states — see below)
type DocumentDateSlotState     // "value" | "editable"
type DocumentOrigin            // discriminated "new" | "existing"

describeDocumentDate           // (chosen, today) → { mood, dayLabel, distanceLabel, daysBack }
DOCUMENT_DATE_WARN_DAYS        // 60
type DocumentDateMood          // "today" | "informed" | "questioned"
type DocumentDateDescription
```

⚠ **`DocumentDateSlotState` is exported here even though DC's `@/components/ui` barrel does not
re-export it today** (decision D-7). DC's `use-document-date.ts:28` reaches it by deep path into DC's
own tree; after adoption that path is gone, and this is where it points instead.

⚠ **"Five states" is three type arms and both numbers are right.** The five visible states of the
approved option-c mockup are `absent` · `auto` · `editable`-calm · `editable`-warn · `editable`-error
— the last three are the `mood` split inside the one arm. 🔴 **Do not "reconcile" this by collapsing
it to three or splitting it to five.** Either changes what a user sees. Fenced in the source.

## 3. 🔴 FOR BANANAWORLD-DC'S ADOPTION CHANGE — the five things this change could not do

Run in DC's own repo, in DC's own change, **against the MERGED sha on `main` — never a branch sha**
(KI-M001E19-002 is that mistake on record).

### 3.1 Bump the pin, re-point the imports, delete DC's copy

DC keeps importing from `@/components/ui`; that barrel re-exports this package, exactly as it already
re-exports every other shared primitive. **Not one of the thirteen render sites changes.** What
changes in DC:

- its `@/components/ui` barrel entry for `DocumentHeader` → re-point at the package
- `use-document-date.ts:28`'s deep import of `DocumentDateSlotState` → the package barrel
- anything importing `describeDocumentDate` / `DOCUMENT_DATE_WARN_DAYS` from
  `@/lib/document-number/document-date` → the package barrel. **Delete only those four symbols from
  that file**; its SQL fragments, column map, row readers and validator stay in DC and must not move
- delete `src/components/ui/DocumentHeader.tsx`

### 3.2 🔴 FIVE ASSERTIONS IN DC'S CONTRACT TEST WILL GO RED. THAT IS BY DESIGN.

`tests/contract/transaction-form-standard.test.ts` is a `@vitest-environment node` **repo scanner**.
`SHARED_HEADER = "ui/DocumentHeader.tsx"` (line **159**) is a path under DC's own `src/components`,
read as **text**. Verified against DC's `main` on 2026-08-14:

| Line | Assertion | After adoption |
|---|---|---|
| **671** | `expect(formExists(SHARED_HEADER)).toBe(true)` | RED |
| **692** | source contains `export const DOCUMENT_HEADER_SLOTS = [...] as const;` | RED |
| **699–704** | source contains `slots.map(` and `const slots = DOCUMENT_HEADER_SLOTS;` | RED |
| **889** | `expect(formExists(SHARED_HEADER)).toBe(true)` — commented **"🔴 THE PROMOTION HAS NOT HAPPENED, ASSERTED"** | RED |
| **1515** | LEG 3 — the shipped component names all four slot literals | RED |

**The fix:** re-point `SHARED_HEADER` at the resolved package file, and **invert** the 889 spec so it
asserts the promotion **has** happened. A loud, deliberate edit — the same shape as M003's slot
re-order. 🔴 **Never by relaxing or deleting the check.** Line 881 already records that the spec
"asserts only that the door is now open, not that anybody walked through it"; walking through it is
what your change does, and the spec should say so.

**Open question DC owns:** re-point the text scan at the resolved package path, or replace it with a
real import now that the component is no longer a DC file. Both work. The mirrored assertions in this
package (tests 24, 25) guard the same standard on this side either way.

### 3.3 Run DC's real suites — they are the regression gate, and they were NOT run here

**This is a sandboxed design-system worktree with no DC checkout, dependencies or runner. Nothing in
this evidence pack claims DC's forms were proved.** Owed at bump time:

1. `pnpm test tests/unit/components/DocumentHeader.test.tsx` — DC's real specs against the imported
   component
2. `pnpm test tests/contract/transaction-form-standard.test.ts` — after §3.2
3. `pnpm test tests/unit/adjustment/adjustment-sheet.test.tsx` and the twelve forms' own suites
4. `pnpm typecheck` with the deep imports re-pointed

### 3.4 Visually check the thirteen render sites across twelve files

`HEADER_RENDER_SITES` (contract test line 245): **twelve files, thirteen headers** — `RipeningRunsView`
renders two. Note this is thirteen render sites, not "fourteen forms" as the change request framed it.

### 3.5 Do it soon rather than let it sit

Until DC bumps, **the header exists in both trees**. That is not drift — it is how a sha-pinned
estate moves — but it is the window in which somebody edits DC's copy believing they have changed the
shared one. It closes when your change lands.

## 4. For the CRM's adoption change (`CR-CRM-document-header-parity`)

Blocked on this change; runs in the crm lane afterwards. Nothing here anticipates it.

⚠ **One prerequisite:** the header uses `text-2xs`, the `warning-*` / `info-*` / `danger-*` token
families and `bg-surface-muted`. All exist in this package's `tokens.css` and in DC's Tailwind theme.
**The CRM's Tailwind theme must define the same scale before it renders the header** — the package's
standing consumer requirement.

⚠ **You inherit DC's wording and DC's 60-day threshold** (seam S-3, decision D-5). That is the
intended uniformity, not an oversight. If the CRM genuinely needs a different number, that is an
**additive optional prop in a later change** — do not fork the describer.

## 5. Decisions a future session must not silently reverse

| # | Decision |
|---|---|
| D-2 | **The eight transitional pieces are NOT re-created.** `PRE_EPIC_HEADER_SLOTS` and `renderedBeforeThisEpic` were deleted by CR-DC-046 under owner ruling DECISION-358 on 2026-08-12. The change request predates that and asked for them to be carried across; the plan surfaced this to the owner and was approved. Re-adding owner-deleted rollback code to a shared package is a regression, not fidelity |
| D-3 | **No flag prop.** There is no flag left to answer |
| D-4 | **Only the pure describer crossed.** DC's SQL, column map, row readers and validator stay in DC — business rules and database shape, excluded by TECH-COMP-003 |
| D-5 | **The 60-day threshold is not configurable.** Uniformity is the point |
| D-6 | **The 🔴/⚠ fences travel with their DC anchors.** Four were adapted because their subject was the file's old location; each is listed in `changed-files.md` §3. Do not strip the rest |
| D-7 | **`DocumentDateSlotState` is on the barrel** so DC's follow-up has somewhere to point |
| D-10 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` was not created.** It does not exist and there is no `governance/` directory. Creating it is a governance decision. **Second consecutive change to raise it** |

## 6. State of this repo

- Branch `change/cr-design-system-002`, off `origin/main` @ `365be65`. PR #10 open with **all five
  checks green**; **the conductor merges** — do not merge from a build session.
- `pnpm typecheck` clean · `pnpm test` **115 / 9** (baseline 79 / 7) · **0 open defects, 0 open decisions**
- **No migration** — this package has no database. **No throwaway Postgres was ever started.**
- ⚠ **`package.json` and `pnpm-lock.yaml` differ from `main`** — the D-12 `nanoid` override only
  (`"nanoid@<3.3.17": "^3.3.17"`, resolving **3.3.18**), no source touched. Two advisories published
  against an unchanged tree were refusing every PR in this repo; the owner ruled **override, not a
  seventh ignore**, matching DC's fix (`a20cf381`, PR #160). `ignoreGhsas` is untouched at six.
  **Nothing a consumer ships changes** — this package publishes `files: ["src"]` and never calls nanoid.
- Carried drift, all out of lane: `format:check` fails repo-wide (44 files, all three edited barrels
  already failed at `HEAD`); **there is no `lint` script and no eslint config**; `ci.yml`'s test job
  label is stale; `pnpm audit` is permission-blocked in build sessions, so CI's job is the real gate —
  **do not infer audit health from an unchanged dependency tree**, which is how this change first
  missed it. Details in `runs/change-02/output/known-issues.md`.
