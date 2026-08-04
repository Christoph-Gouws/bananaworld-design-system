# Known issues — CR-DESIGN-SYSTEM-001

> Open count attributable to this change: **0**.
> Everything below is either pre-existing drift, an environmental limit of this session, or a stated
> property of a sha-pinned shared package. All are recorded rather than glossed.

## A. Nothing in the plan went stale

The plan's premises were spot-checked against the real current source before building — every file,
line reference and fact it cites is exactly as described (the table is in
`implementation-summary.md`). Nothing moved between planning and building, so there is nothing to
record here. HEAD is `b1373c7`, the same sha DC pins.

## B. Limits of this build session — stated, not worked around

| # | Limit | Impact | Handling |
|---|---|---|---|
| B-1 | **This session is sandboxed to its own worktree** and cannot open the consumer repositories. Reads outside the workspace were refused. | The consumer survey in `qa-report.md` §3 is carried forward from the owner-approved plan §3 rather than independently re-run. | Not papered over: the table marks which rows are plan-sourced. What *is* provable from inside the package was proven instead — the byte-identical assertions (test 5) and the type-assignability test (test 17), which turns the one real risk into a permanent compiled constraint in this package's CI. |
| B-2 | **DC's own `tests/unit/components/ChoiceGroup.test.tsx` was not run.** It is a genuine regression gate on this change — it queries chips by accessible name, which only keeps passing if no `aria-label` appears where none appeared before. | It lives in DC's repository. | Runs in DC's pin-bump change, which is where it belongs. Flagged to that change in `developer-handover.md`. |
| B-3 | **`_kernel/universal-templates/MILESTONE_EVIDENCE_TEMPLATE.md` could not be read** — it is outside the workspace and the read was refused. | The instruction to copy that template and edit values in could not be followed literally. | `evidence/milestone-evidence.md` was authored to serve the same purpose — it cites each discrete artifact by path, status and counts rather than restating them. Recorded here so the deviation is visible rather than silent. |
| B-4 | **No Tailwind build runs in this repo** — consumers own it. So the merged class lists were verified as *strings* against the installed `tailwind-merge@3.6.0`, and against Tailwind's stable `.px-*`-before-`.pl-*` emission order, not as computed CSS. | Low. The behaviour relied on is standard across Tailwind v3 and v4. | Pinned by test 11, which asserts both that the new classes are present and that `ColourSwatch`'s `h-7`/`w-7`/`rounded-sm` are gone, plus that `px-3` survives alongside `pl-0`. |
| B-5 | **happy-dom computes no layout** — every measurement is zero. | The stripe's full-height rendering (`align-self: stretch` + `height: auto`) is asserted at the class level, not measured. | Inherent to headless component testing; `Select.test.tsx` documents the same limit for its own case. First real render is in DC's follow-up, against the owner-approved mockup. |

## C. Pre-existing repo drift — untouched, out of lane

| # | Issue | Why not fixed here |
|---|---|---|
| C-1 | **`pnpm format:check` fails on 44 files repo-wide.** `src/components/ChoiceGroup.tsx` is one of them — and it **already failed at `HEAD` before this change**, verified by stashing the change and re-running prettier on the original file. Untouched files (`ColourSwatch.tsx`, `Button.tsx`) fail identically. | Pre-existing, repo-wide, and acknowledged in a comment in `.github/workflows/ci.yml` itself ("the repo's own `format:check` currently fails on pre-existing style drift — run `prettier --write` once to adopt it"). CI runs no format job. Reformatting 44 files would bury a 57-line additive diff and touch every other lane's files. Adopting prettier repo-wide is its own change. |
| C-2 | **`.github/workflows/ci.yml`'s test job is still labelled "Test — pricing & sales-order engines"** although it has run the component tests since they were added. | Cosmetic label drift in another lane's file. The plan spotted it and explicitly left it. |
| C-3 | **There is no `lint` script and no eslint config in this package.** The build instructions call for `pnpm lint`; it does not exist here. | Recorded rather than invented. `pnpm typecheck` (clean) and `pnpm test` (green) are the gates this package actually has, and both are what CI runs. Adding a linter is its own change. |
| C-4 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist in this repo** — there is no `governance/` directory. | The plan §4 flagged this. Seams are recorded in the plan, in `centrality-scorecard.md` and in `developer-handover.md` instead. Creating that register is a governance decision, not part of this change — flagging rather than inventing it. |

## D. The one thing to actually watch

**DC's pin bump is where this change is finally proven.** Nothing here is broken, but the residual
risk in `qa-report.md` §3 — that DC's `PickerOption` might collide with the new field names — is
discharged by DC's own `tsc` and its own ChoiceGroup suite, not by anything in this repository.

The plan checked `PickerOption` directly and found neither `swatch` nor `description` on it
(`bananaworld-dc/src/lib/receipt/types.ts:369-410`, zero hits outside comments). Residual risk:
**LOW**. But it is the one assertion in this change that rests on a read I could not repeat.

**And the pin must be moved against the MERGED sha on `main`, never this branch sha.** That exact
mistake is on record as KI-M001E19-002.
