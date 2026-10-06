# Test results + QA verdict — CR-DESIGN-SYSTEM-013

> Branch `change/cr-design-system-013` off `origin/main` @ `26fa005`. Run 2026-10-06 on Windows, Node 24.18.0,
> vitest 4.1.11 (the repo's own — not the consuming app's vitest 2). No raw logs are committed.

## 1. Commands and counts

| Gate | Command | Result |
|---|---|---|
| Baseline, **before any edit** | `pnpm test` / `pnpm typecheck` | **405 passed / 19 files**; typecheck clean |
| Type surface, final | `pnpm typecheck` | **clean** |
| Full suite, final | `pnpm test` | **450 passed / 21 files** — +45 specs, 0 failing. Existing specs edited: **1** (D-3: the export inventory gained this change's three approved names; its "nothing undeclared" assertion is kept) |
| Unused code | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | **0** in any changed file |
| 🔴 Byte-identity vs `main@26fa005` | `node runs/change-09/output/byte-identity-setup.mjs 26fa005`, then `runs/change-09/output/byte-identity.harness.test.tsx` + `runs/change-10/output/byte-identity-013.harness.test.tsx` copied into `tests/components/` for one run, then deleted with `baseline-tmp/` | **10,029 caller shapes, 0 differences** (9,936 CR-010 shapes + 93 CR-013 shapes: a multi cell with `selectAll` absent / `"master"` × 5 value states incl. an exclusion it never asked for × 3 densities × 3 `multiple` values; the toolbar with `selectAll` absent / `"allOption"` / `"master"`). ⚠ CR-010's two "expected difference" assertions (F1, F3) now report **identical** — correct: `main` already carries those fixes |
| 🔴 Seven shipped toolbar screens | the DOM snapshot in `DataTableToolbar.test.tsx` | **zero-line diff** (the `.snap` shows modified only by CRLF — `git diff --ignore-cr-at-eol` is empty; not staged) |
| Mutation battery | `node runs/change-10/output/mutation-battery.mjs` | **15 run, 15 killed, 0 anchors missed**; every restore writes the original bytes |
| 🔴 Real browser | `node runs/change-10/evidence/browser-proof/proof.mjs` (Edge, real components, real clicks) | **17 / 17 checks PASS**, 6 frames in `runs/change-10/evidence/frames/` |
| Quality sensors | `quality-sensors.mjs --changed <14 files>` | **0 open findings**, 4 justified (pre-existing), 0 weak |
| Dependency audit | `pnpm run audit:deps` | **exit 0** after D-4 (was exit 1 on untouched `main`: GHSA-68fv-2mgg-jv7q) |
| `pnpm install --frozen-lockfile` | after the override | "Already up to date" — manifest and lock agree |
| `pnpm lint` | — | **NOT RUN — no `lint` script and no ESLint config in this repo** (standing drift, out of lane) |
| Migration / Postgres | — | **N/A** — no database. No container started; nothing left behind |

## 2. Acceptance criteria — verdicts

| AC | Criterion (owner's words → plan) | Proven by | Verdict |
|---|---|---|---|
| AC-1 | Not narrowed: **every option shows a tick**; Select all ticked, `All N` | grid spec "STATE 1"; toolbar spec; browser frame 01 | **MET** |
| AC-2 | Unticking one option **hides just that one**; the rest stay ticked | grid "STATE 2"; toolbar "UNTICKING ONE"; frame 02, 06; M9, M14 | **MET** |
| AC-3 | "Everything except" is stored as an **exclude list** in a new field (`excluded`, wire `f_<key>_not`) — a later value is not left out | grid "STATE 2" emits `{value:"", excluded:["b2"]}`; browser check "stored as an EXCLUSION"; `gridFilterExclude` specs | **MET** |
| AC-4 | **Select all re-ticks everything** — clears the narrowing (key dropped) | grid "'Select all' RE-TICKS"; toolbar "'Select all' puts every row back"; M1 | **MET** |
| AC-5 | **Unticking Select all clears every tick**; nothing is committed — the report shows everything until a box is ticked (owner point 3) | grid "STATE 3"; toolbar "UNTICKING 'SELECT ALL'"; frame 03; M4, M8 | **MET** |
| AC-6 | From nothing ticked, ticking a few shows **only those** (today's include list and wording) | grid "FROM STATE 3"; frame 04 | **MET** |
| AC-7 | Trigger and counts honest — layout B: "5 of 6 batches", footer names what is hidden, master count | grid specs; pure wording specs; frames 02, 06 | **MET** |
| AC-8 | Rows with **no value keep showing** in "except" (owner point 2); still left out in "only" | engine spec; toolbar spec; browser toolbar check; M2 | **MET** |
| AC-9 | **Both surfaces** behave identically — one shared list | both driven suites run the same states; `MultiSelectAllTickedList` is the only list; M11, M12 | **MET** |
| AC-10 | **Additive**: every existing caller renders byte-identically; defaults unchanged (`"master"` / `"allOption"`) | 10,029 shapes 0 diff; snapshot zero-line; "A CELL THAT DOES NOT ASK FOR IT" specs; frame 05 | **MET** |
| AC-11 | Existing stored include-lists keep their meaning; stored contract unchanged; exclusion via sibling helper + optional param | characterisation suite untouched and green; engine specs; M13, M15 | **MET** |
| AC-12 | A hidden id the options no longer offer is **preserved** (CR-010 F1 rule) | pure spec; M10 | **MET** |
| AC-13 | **Radix keyboard** behaviour retained — no hand-rolled control | keyboard spec (Enter, ArrowDown, Space) | **MET** |
| AC-14 | **"Clear" lights** for an exclusion | engine + toolbar specs; browser check; M6 | **MET** |
| AC-15 | Export surface: **3 names added, none removed or renamed** | `DragBoard.additive` inventory spec; barrel diff | **MET** |
| AC-16 | The three states are **drawn in a real browser** and match the approved layout | `proof.mjs` 17/17; frames 01–06 | **MET** |

## 3. Manual verification (done in a real browser, this session)

| Step | Expected | Actual |
|---|---|---|
| Open the "Batch (allTicked)" filter | every batch ticked, "Select all · All 6", footer "Nothing hidden" | as expected — frame 01 |
| Untick SBF-2610-003 | only it clear; "Select all" a dash "5 of 6"; box "5 of 6 batches"; footer "Hidden: SBF-2610-003" | as expected — frame 02 |
| Tap Select all (dash), then tap it again | first re-ticks all; second clears every tick; footer "Nothing ticked — showing everything…"; box still "All batches"; value `{}` | as expected — frame 03 |
| Tick SBF-2610-002 and -005 | only those two; value is today's include list | as expected — frame 04 |
| Open the "Batch (default)" column | today's list: nothing ticked, "None chosen" | as expected — frame 05 |
| Toolbar: untick SBF-2610-003, close | table loses only that batch; the row with no batch stays; "Clear" shows | as expected — frame 06 |

**Overall QA verdict: PASS**
