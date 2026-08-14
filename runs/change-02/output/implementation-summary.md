# Implementation summary — CR-DESIGN-SYSTEM-002

**The document header moves into the shared package, so two apps wear one header instead of two
copies that drift.**

| Field | Value |
|---|---|
| Unit | Change Request **CR-DESIGN-SYSTEM-002** (not an epic, not a milestone). Archive: `runs/change-02/` |
| Project | `bananaworld-design-system` (`@bananaworld/design-system`) |
| Branch | `change/cr-design-system-002`, off `origin/main` @ `365be65` |
| Approved layout | **n/a — not UI-bearing** (decision D-9: the change is defined by byte-identical rendering) |
| Ship mode | **on-green** |
| Date | 2026-08-14 |
| Verdict | **PASS — ready for PR** |

## 1. Plan-vs-code confirmation (required first step)

**Everything the plan cites is still exactly as described. Nothing has moved. One correction to the
plan's own file list is recorded below; it is not a premise change.**

The plan was written against `origin/main` @ `365be65` and this session started from a fresh copy of
the same sha. Every fact the plan CITES was spot-checked against the real Bananaworld-DC source on
`main`, not taken on trust:

| Plan claim | Cited at | Verified |
|---|---|---|
| `useAuth` is gone — CR-DC-039 landed | §1 | ✅ Only three *comments* mention it (DC file lines 120, 201, 271). No import, no call. **The gate is open.** |
| Import list is `react` · `@bananaworld/design-system` · `@/lib/document-number/document-date` | §1 | ✅ exact (DC lines 32, 34, 38) |
| Middle two slots come from a required discriminated `origin` | §1 | ✅ DC lines 253–256 |
| DC's guard "the shared component reads NO session" | §1 | ✅ `transaction-form-standard.test.ts:883`, `not.toContain("useAuth")` at 885 |
| `PRE_EPIC_HEADER_SLOTS` removed by CR-DC-046 / DECISION-358 | §2.1 | ✅ DC file line 55, comment in place; **zero occurrences of `renderedBeforeThisEpic`** |
| "IT ALWAYS RENDERS, AND ALWAYS IN THE CANONICAL ORDER" | §2.1 | ✅ DC file line 213 |
| No flag left: `useDocumentNumbering` gone from the component | §2.2 | ✅ zero occurrences |
| The one real coupling is `describeDocumentDate` from an app path | §2.3 | ✅ DC file line 38 |
| DC's `document-date.ts` is 420 lines, mostly SQL/column-map/validation | §4 | ✅ 420 lines exactly; the pure day-line half is 54 code lines of it |
| S-2's five DC assertions that will redden at DC's adoption | §8 | ✅ all five confirmed at the cited lines — 671, 692, 699–704, 889, 1515; `SHARED_HEADER` at 159 |
| "thirteen render sites across twelve files", not fourteen forms | §9.2 | ✅ contract test 843–845: `HEADER_RENDER_SITES` has 12 keys summing to 13 |

**One extension to the plan's file list, same approach.** Plan §7 lists four source files; the
change needed **five**. `src/index.ts` enumerates its `./lib` re-exports by name rather than
starring them, so adding `describeDocumentDate` / `DOCUMENT_DATE_WARN_DAYS` to `src/lib/index.ts`
alone would have left them unreachable from the package root — and DC's follow-up has to import them
from somewhere once its own copy is re-pointed. Four names added to `src/index.ts`, purely additive.
Recorded in `known-issues.md` A-1 and in `changed-files.md`.

## 2. What was built

Two new source files and three additive barrel edits.

| File | Action | Lines |
|---|---|---|
| `src/components/DocumentHeader.tsx` | **new** — the ported component | 555 |
| `src/lib/document-date.ts` | **new** — the pure day-line describer only | 127 |
| `src/components/index.ts` | modified | +17 / −0 |
| `src/index.ts` | modified | +7 / −0 |
| `src/lib/index.ts` | modified | +10 / −0 |

## 3. The byte-identity claim, proved mechanically rather than asserted

Thirteen live DC render sites carry this header on a flag the owner made permanent on 2026-08-12.
The move had to change nothing a user sees. That is not a sentence here — it is a measurement:

**The component.** Comments stripped from both files, code lines compared position by position
against DC's `main`:

```
DC code lines: 282 | ported code lines: 282
TOTAL DIFFERING CODE LINES: 2
  line 3:  - import { Input } from "@bananaworld/design-system";
           + import { Input } from "./Input";
  line 4:  - import { describeDocumentDate, type DocumentDateMood } from "@/lib/document-number/document-date";
           + import { describeDocumentDate, type DocumentDateMood } from "../lib";
```

**282 of 282 code lines identical; the only two differences are the two import specifiers the plan
predicted (§7.2).** Same JSX, same class strings, same slot order, same five number states, same
date behaviour, same empty state, same strings.

**The describer.** All **54** ported code lines appear **verbatim** in DC's 420-line file. Zero
divergence. What did *not* cross: the SQL fragments, the column map, the row readers and the
validator — business rules and database shape, excluded by TECH-COMP-003 (decision D-4).

## 4. The three decisions the request asked to be stated

| | |
|---|---|
| **The flag** | **No flag prop is added** (D-3). The request called this "the one honest coupling to solve" and expected a prop. There is no longer a question for a prop to answer: CR-DC-046 removed `useDocumentNumbering` and `DocumentNumberingProvider` from the component on 2026-08-12 under owner ruling DECISION-358, which made numbering permanent and ON. Adding a prop now would be the "configurability added in anticipation" the request forbids. **Stated, not smuggled: no app import was added to avoid the question — a spec scans the ported source for `@/` and for `bananaworld-dc` and fails on either.** |
| **The eight transitional pieces** | **Not re-created** (D-2). The request said to carry `PRE_EPIC_HEADER_SLOTS` and `renderedBeforeThisEpic` across unchanged as the rollback path. They no longer exist — deleted by CR-DC-046 under DECISION-358, two days before this session, and `renderedBeforeThisEpic` has zero occurrences anywhere in DC's `src/`. Re-introducing owner-deleted rollback code into a package five repos pin would be a regression, not fidelity. **This was surfaced to the owner in the plan's brief as a confirm point and the plan was approved; it is not a session's tidying decision.** |
| **The day-line describer** | **Its pure half crosses; the rest stays in DC** (D-4/D-5). The alternative — the app computes the sentences and hands them in — is "purer" and was rejected: it puts the wording and the 60-day threshold back into each app, so the CRM would spell its own "Is that right?". That is the second copy that drifts, i.e. exactly what this change exists to prevent. |

## 5. Gates

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics under `strict` + `noUncheckedIndexedAccess` |
| Tests | `pnpm test` | **115 passed / 9 files**, 0 failed, 0 skipped (baseline before any edit: **79 / 7**) |
| Additive | `git diff --numstat -- src/` | **34 insertions, 0 deletions** — zero deletions anywhere in `src/` |
| Lint | — | **no `lint` script exists in this package** (`known-issues.md` C-2), not invented |
| Format | `pnpm format:check` | pre-existing repo-wide drift; all three barrels **already failed at `HEAD`** (verified by stash). Not worsened, not silently "fixed" — see `known-issues.md` C-1 |
| Migration | — | **N/A** — this package has no database by construction |
| Throwaway Postgres | — | **never started.** Nothing to clean up; no container, no port held |

## 6. Scope discipline — what was deliberately NOT done

No consumer pin bumped (DC, CRM, RMS, org-admin, Mangaverde all untouched). No DC file edited — not
its barrel, not its copy of the component, not one of its thirteen render sites. The CRM does not
adopt here. No new slot, no CRM-shaped variant, no configurability added in anticipation. No new
dependency; `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `tsconfig.json` and `.github/`
are all untouched, verified by `git status`.
