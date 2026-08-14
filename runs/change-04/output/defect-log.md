# Defect log — CR-DESIGN-SYSTEM-004

> Stage 04. **2 found · 2 closed · 0 open.**
> Both were caught inside this session, before any commit. Nothing was found by a test that then had
> to be relaxed, and no test was weakened to make anything pass.

## 1. Defects

### DEF-1 — the junk-input rule drifted from the plan's table · **medium** · CLOSED

| Field | Value |
|---|---|
| Where | `src/lib/table-paging.ts`, `wholeNumberAtLeast` |
| Found by | Writing the arithmetic spec **against the plan's §3.1 rules table**, not against the code I had just written |
| Symptom | My first implementation used `Number.isFinite` + `Math.floor`, so a non-integer page (2.7) became page 2 and `Infinity` became page 1 by a different route. The approved plan's table says plainly: *"`page < 1`, or a non-finite / non-integer input → clamped to 1"* |
| Why it matters | Not because 2.7 is a real page number — it is not. Because a shared control that quietly reinterprets its own contract is how four apps end up disagreeing about what page they are on, and because the plan is what the owner approved |
| Fix | One line: `if (!Number.isInteger(value)) return floor;` — `Number.isInteger` is false for `NaN`, for `±Infinity` and for any fraction, so the single predicate **is** the plan's rule, exactly as written |
| Verified | 5 assertions in `table-paging.test.tsx`: `NaN`, `+Infinity`, `2.7`, `NaN` page size and `Infinity` page size |
| Status | **CLOSED** |

### DEF-2 — the audit probe reported a false "3 BLOCKING" · **low, tooling not product** · CLOSED

| Field | Value |
|---|---|
| Where | `audit-probe.mjs` — the throwaway script that reproduces CI's `pnpm audit` (created and deleted this session; never committed) |
| Found by | Reading the output instead of accepting the verdict: `next` advisories were absent from a tree that certainly has `next`, and every GHSA id printed as `undefined` |
| Symptom | Two parsing bugs. pnpm suffixes peer-resolved store directories (`next@15.5.19_react-dom@19.2.7_react@19.2.7__react@19.2.7`), so `lastIndexOf("@")` read the wrong `@` and dropped `next` entirely; and npm's bulk endpoint does not name the field `github_advisory_id`, so the ignore-list lookup missed every entry and reported three genuinely-ignored advisories as blocking |
| Why it matters | It is recorded rather than quietly fixed because the wrong answer was the **alarming** one. A build session that had trusted its own tool would have reported three blocking highs on a dependency tree this change does not touch, and the estate has been burned the other way round too (SESSION_HANDOVER §9: CR-002 inferred audit health from an unchanged tree and CI proved it wrong). Neither inferring nor mis-measuring is acceptable |
| Fix | Strip the `_peer` suffix before parsing, and resolve the advisory id from `github_advisory_id ?? url` |
| Verified | Re-run: `probing 126 packages` → **6 highs, all six on the standing owner-approved ignore list, `NO BLOCKING HIGH/CRITICAL ADVISORIES`** — identical to CR-003's result, on a `package.json` and `pnpm-lock.yaml` this change does not edit |
| Status | **CLOSED.** Probe deleted; CI's own job remains the authoritative gate |

## 2. Checked and **not** a defect — recorded so the next session need not re-derive them

| # | Check | Finding |
|---|---|---|
| N-1 | `git status` shows `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` as **M** | **Not a change.** `git diff` reports no content difference and the file's sha256 is still `ce7bd849…`. It is this Windows worktree's CRLF/stat artefact (git warns `LF will be replaced by CRLF`). The file is deliberately **not staged** |
| N-2 | `pnpm lint` fails | **Not this change.** There is no `lint` script and no eslint config in this package. Pre-existing, SESSION_HANDOVER §8, `known-issues.md` C-2 |
| N-3 | `prettier --check` flags all four new files | **Not a regression.** There is no prettier config, so the default 80-column width disagrees with the repo's ~100-column house style. Verified this session that `Button.tsx`, `Select.tsx`, `Table.tsx` and `table-controls.ts` — **all untouched by this change** — fail identically at `HEAD`. The new files match the repo's real style; reformatting only them to 80 columns would make them the odd ones out. Not a CI job. `known-issues.md` C-1 |
| N-4 | `Showing 312–312 of 312` looks wrong | **Deliberate (D-8).** Collapsing it to `Showing 312 of 312` reads as a count, not a position. The ambiguity is worse than the dash in a control four apps share |
| N-5 | Two buttons named "Previous page" on one screen | **Correct and allowed.** They do the same thing. Each bar is a `<nav>` with its own accessible name (`List paging` / `List paging, end of list`), asserted by spec |
| N-6 | The bottom bar has no count in layout A | **The owner's approved layout.** Option C put the count at both ends and was not chosen. Asserted by absence, so it cannot drift in |
| N-7 | A consumer could pass a `pageSize` that is not among `pageSizes` | Handled without inventing behaviour: the trigger is given the size in force by name, so it always reads the real number rather than blanking |
| N-8 | The control does not fetch, count, or remember anything | **By construction** (TECH-COMP-003, AC-6/AC-7/AC-8). Not a gap |
| N-9 | Nothing got faster | **Nothing was slow.** No performance claim is made anywhere in this pack (D-1) |

## 3. Deferred to their owners — not defects here, and not silently dropped

| # | Item | Owner |
|---|---|---|
| F-1 | 🔴 A server-paged table that also uses `useTableControls` gets a search box that hides matching records | **The consumer.** CR-DC-052 first. Written contract: `developer-handover.md` §2, the fenced comment atop `TablePagination.tsx`, `technical-debt.md` TD-1 |
| F-2 | `totalCount` must carry the same scope filter as the page query, or a number leaks the existence of records | **The consumer.** `developer-handover.md` §2 |
| F-3 | The request's "the CRM uses neither yet" conflicts with CR-003's reading of `AvailabilityView.tsx` | **A later session**, with the CRM repo actually in hand. Nothing here depends on it. `known-issues.md` D-3 |
| F-4 | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist in this repo | **The owner** — creating one is a governance decision. **Fourth change to raise it.** `known-issues.md` C-3 |
