# Test results — CR-DESIGN-SYSTEM-002

**Verdict: PASS.** `pnpm test` → **115 passed / 9 files**, 0 failed, 0 skipped.
`pnpm typecheck` → clean.

## 1. Baseline and delta

| | Files | Tests |
|---|---|---|
| Baseline at `origin/main` @ `365be65` (matches SESSION_HANDOVER) | 7 | **79** |
| After this change | 9 | **115** |
| This change's contribution | +2 | **+36** |

**Zero existing tests were modified or deleted.** The 79 that passed before pass unchanged — re-run
with the new source in place *before* any new spec was written, and they were still 79/7.

```
 RUN  v4.1.10

 Test Files  9 passed (9)
      Tests  115 passed (115)
   Duration  1.02s
```

## 2. `tests/components/DocumentHeader.test.tsx` — 27 specs

Mirrors DC's `tests/unit/components/DocumentHeader.test.tsx`, rewritten to build `origin` as a
literal instead of mocking DC's `AuthProvider` / `useDocumentOrigin`, which do not exist here.

### The four slots and their order (4)

| # | Claim |
|---|---|
| 1 | The four slots render in `DOCUMENT_HEADER_SLOTS` order, **read off the DOM** (`querySelectorAll("dt, label")`) — date first, number fourth |
| 2 | A renamed date slot (`dateLabel="Order date"`) stays **first**: position, not name (owner ruling Q12) |
| 3 | `dateControl` — the form's own control renders in the top-left slot |
| 4 | Given **both** `dateControl` and `documentDate`, the form's own control wins: exactly one input, it is the bare one, and the shared slot's day line is absent |

### Whose facts the middle two slots show (4)

| # | Claim |
|---|---|
| 5 | An EXISTING document names **its own** person and depot; the viewer's name appears nowhere |
| 6 | A NEW form still names the person raising it and their depot — the half that must not change |
| 7 | An EXISTING document with nothing recorded shows the em dash — **and neither "No person recorded" nor "someone"**, the two wordings the owner did not pick |
| 8 | The empty slot is dashed and the filled one is not: the two states differ in the DOM, not just in intent |

### The Document no. slot — five visible states (7)

| # | State | Claim |
|---|---|---|
| 9 | **absent** | em dash + "Not numbered yet"; **no input element at all** |
| 10 | **auto** | the code + "Given automatically"; **no input, nothing in the tab order** |
| 11 | **editable / calm** | input pre-filled with the preview, hint shown, no "Changed" pill, no `aria-invalid` |
| 12 | **editable / warn** | "Changed" pill, the consequence sentence naming the next number verbatim |
| 13 | **editable / warn** | Undo fires the callback exactly once (real click via `userEvent`) |
| 14 | **editable / error** | the server's sentence **and** `DOCUMENT_NUMBER_WHERE_TO_SET`, `role="alert"`, `aria-invalid="true"` |
| 15 | all three kinds | `documentPdf` renders inside the number slot in **absent, auto and editable** alike |

### The shared date slot (7)

| # | Claim |
|---|---|
| 16 | The shared slot renders when the form owns no control of its own; it is a real `type="date"` input |
| 17 | **today** → the word "Today", no Undo, no amber |
| 18 | **informed** → "Friday 7 August" + "· 1 day back" + Undo, and **no colour at all** (the difference between option C and option B) |
| 19 | **questioned** → bold "Thursday 7 August 2025 · 366 days back.", "Is that right?", amber border |
| 20 | **questioned** → any future day, however near ("1 day ahead") |
| 21 | An error outranks the day's mood: the refusal shows, the day line does not, border danger, `aria-invalid` |
| 22 | **value** → shown not offered: em dash for null, the hint, **no input at all** |

### The promotion's own guards (5) — the three things the request asked to be PROVED

| # | Claim | Why it exists |
|---|---|---|
| 23 | The ported source contains no `@/…` path, no `bananaworld-dc`, and no `from "./index"` | **The package builds standalone.** Second guard behind `tsc --noEmit` (no `@/` alias is configured, so such an import cannot resolve). Scans comment-stripped source, so a fence that *names* a banned import does not trip its own guard |
| 24 | The source contains no `useAuth`, and both middle slots read `props.origin.*` | Mirrors DC's `transaction-form-standard.test.ts:883–887` on this side of the move |
| 25 | The order constant is declared once, verbatim, and the render **maps it** (`const slots = DOCUMENT_HEADER_SLOTS;` + `slots.map(`) | Mirrors DC's contract test 690–704. Neither half alone is enough: the constant could drift from the markup, and spec 1 alone could not say what the standard IS |
| 26 | `DocumentHeader`, `DOCUMENT_HEADER_SLOTS` and `DOCUMENT_NUMBER_WHERE_TO_SET` are importable **from the package root** (`../../src`) and the root export **renders** | **The barrel re-export** — the line between "not one of DC's import lines changes" and thirteen broken render sites |
| 27 | `describeDocumentDate` and `DOCUMENT_DATE_WARN_DAYS` are importable from the package root | DC's follow-up re-points its deep import at this |

## 3. `tests/components/document-date.test.tsx` — 9 specs

Mirrors the `describeDocumentDate` half of DC's `tests/unit/document-date.test.ts`. Only that half
crossed; DC's SQL, column-map and validator specs stayed with the code they test.

| # | Claim |
|---|---|
| 1 | Today → mood `today`, `daysBack` 0, empty distance |
| 2 | "Friday 7 August" / "1 day back" — the mockup's example character for character |
| 3 | The year prints only when it is not the current one → "Thursday 7 August 2025" / "366 days back" |
| 4 | Quiet **at** the 60-day threshold, questioned **past** it |
| 5 | Any future day is questioned, and says "ahead" rather than "back" |
| 6 | Pluralises honestly ("2 days back" / "2 days ahead") |
| 7 | The weekday joins with a **space**, never a comma (why two `Intl` formatters exist) |
| 8 | The threshold is 60 and lives in ONE place the screen and this spec both read |
| 9 | Both ends read in UTC, so the answer does not depend on where the test runs |

⚠ **Spec 3 carries DC's own recorded note forward rather than silently matching a drawing.** The
approved mockup drew "367 days back" for that exact pair and the arithmetic in the drawing is wrong
— 2025-08-07 to 2026-08-08 is 366 days. The shipped code counts days; the mockup's label was
illustration. DC recorded this in its known-issues at the time and the comment travels with the spec.

## 4. What these tests do NOT prove — stated plainly

**DC's own suites cannot be run from here, and no claim in this pack says otherwise.** This is a
sandboxed design-system worktree: no DC checkout, no DC dependencies, no DC test runner. The DC
source above was read from the `bananaworld-dc` repository on GitHub at `main` in order to port it
faithfully and to verify the plan's citations; reading it is not running its tests.

DC's adoption change owes the five items listed in `evidence/developer-handover.md` §3. The largest
is that **five assertions in DC's `transaction-form-standard.test.ts` are designed to go red at
adoption** — line 889 exists specifically to assert the promotion has *not* happened. That is
disclosed here, not discovered later.

⚠ **The request's "flag ON and flag OFF" testing clause is not testable by anyone.** There is no
flag: CR-DC-046 removed it on 2026-08-12 under DECISION-358. Flag-ON is the only path production has
run since the EPIC-023 flip. Recorded rather than reported as passed.

## 5. Environment

No database, no Docker, no throwaway Postgres — this package has none by construction. Nothing was
started and nothing was left behind: no running container, no stopped container, no port held.
