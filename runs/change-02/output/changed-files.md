# Changed files — CR-DESIGN-SYSTEM-002

**6 files: 2 source added, 3 source modified (append-only), 2 tests added.**
Stage 05 reviewed exactly this list.

## 1. Source

| # | File | Action | Diff |
|---|---|---|---|
| 1 | `src/components/DocumentHeader.tsx` | **added** | 555 lines |
| 2 | `src/lib/document-date.ts` | **added** | 127 lines |
| 3 | `src/components/index.ts` | modified | **+17 / −0** |
| 4 | `src/index.ts` | modified | **+7 / −0** |
| 5 | `src/lib/index.ts` | modified | **+10 / −0** |

```
$ git diff --numstat -- src/
17  0   src/components/index.ts
7   0   src/index.ts
10  0   src/lib/index.ts
```

**Zero deletions anywhere in `src/`.** That is the additive claim, mechanically.

## 2. Tests

| # | File | Action | Contents |
|---|---|---|---|
| 6 | `tests/components/DocumentHeader.test.tsx` | **added** | 515 lines, **27 specs** |
| 7 | `tests/components/document-date.test.tsx` | **added** | 97 lines, **9 specs** |

⚠ `document-date.test.tsx` is a `.tsx` with no JSX in it, deliberately: the `engines` vitest project
globs only `tests/pricing/**` and `tests/sales-order/**`, and the `components` project globs
`tests/components/**/*.test.tsx`. Placing it there is what let this change add a suite **without
editing `vitest.config.ts`** — the plan's stated preference (§7.3), and the config file is the one
five pinned consumers would have to reason about.

## 3. The four comments adapted during the port — every one, individually

282 of 282 code lines are identical to DC's (see `implementation-summary.md` §3). Comments were held
to the same standard, with four exceptions: comments whose **subject is where the file lives**, which
would have become false statements in the new home (defect D-2). Each keeps its DC anchor and its
reasoning; only the location claim changed.

| # | DC's comment | What it says now | Why |
|---|---|---|---|
| a | *"`Input` COMES FROM THE PACKAGE, NOT FROM `./index`"* | *"`Input` COMES FROM THE SIBLING MODULE, NOT FROM `./index`"* — plus a note that the line read `from "@bananaworld/design-system"` before the promotion and carried the same warning for the same reason, one hop out | "From the package" is meaningless inside the package. **The cycle warning is the substance and it is unchanged and still true** — `./index` re-exports this file |
| b | *"THE PURE LEAF, never the `document-number` barrel"* + DC's app path | Same warning, plus what the line read before and the record that only the pure half crossed (D-4), plus an explicit fence: **no `@/…` path may ever appear in this file**, naming both guards | The path changed; the reason the describer is safe to import from a client component did not |
| c | *"THAT MOVE IS ITS OWN CHANGE IN THE DESIGN-SYSTEM LANE. Do not do it here."* | Quotes DC's note, then states that the change it anticipated **is CR-DESIGN-SYSTEM-002 and is this file** — and re-points the fence at what is now still forbidden: the CRM does not adopt here | Kept verbatim, it would sit in the very file where the move was done, telling readers not to do it. **The `raisedByName` record and its DC anchor are unchanged** |
| d | *"The DC's calendar day"* (×2, in `DocumentDateSlotState.today` and `describeDocumentDate`) | *"The caller's calendar day"*, plus: **this package never reads a clock or a timezone of its own** — it is handed both days | A second app in a second region wears this header. Saying "the DC's" would tell that app's developer something untrue about the prop they must fill |

Three **additions** were also made, all comment-only, all recording decisions the plan requires to be
stated: the promotion note at the top of the file; the "five visible states, three arms" fence
(plan §3.1, so nobody "reconciles" the two numbers); and the D-3 / D-5 / D-7 reasoning where a reader
will actually meet it. No fence was removed, weakened or stripped of its anchor.

## 4. Files deliberately NOT touched — considered, with reasons

| File | Why not |
|---|---|
| `package.json` | **No new dependency.** `useId` is React. Every Tailwind token used already exists in `tokens.css` and is already used by shipped primitives — verified: `text-2xs` (Table:143, DataTableToolbar:216), `warning-subtle`/`warning-fg` (tokens.css:54–55), `danger`/`danger-fg` (57–59), `info`/`info-fg` (61–63), `surface-muted` (30), `fg-muted`/`fg-subtle` (39–40) |
| `pnpm-lock.yaml` | Follows from the above. **No new advisory can be introduced by a change that adds no dependency** |
| `vitest.config.ts` | Both new suites fall under the existing `components` glob. Preferred over widening a glob — see §2 |
| `tsconfig.json` | `include` already covers `src/**` and `tests/**`. Nothing to add |
| `.github/workflows/ci.yml` | Nothing new to run. Its `test` job label still says "pricing & sales-order engines" — inaccurate since CR-DESIGN-SYSTEM-001 added component tests, but it is a **label**, not behaviour, and fixing it is out of this lane (`known-issues.md` C-3) |
| `src/lib/formatters.ts` | `formatDateZA` is a different function for a different job. **Not merged and not reused** — merging would change what an existing caller renders, which is exactly what additive-only forbids |
| `src/components/Input.tsx` | Imported and reused unmodified. The ported component uses it exactly as DC's did |
| `README.md` | The consumer Tailwind-token requirement it already states covers the tokens this component uses. Nothing new to say |
| **Anything under `bananaworld-dc/`** | Not this repo, not this lane. DC bumps its own pin in its own change, against the merged sha |
| **Anything under `runs/epic-*/` or `runs/current/epic-plan/`** | A closed epic is immutable, and the Epic Runner wedges on a stray `epic-NN` folder. `runs/epic-020/` is pre-existing on `main`; **this change created nothing under it**. `runs/current/epic-plan/` does not exist and was not created |
| Consumer pins (DC, CRM, RMS, org-admin, Mangaverde) | **Never from here.** Each consumer moves its own pin, in its own change, against the merged `main` sha |

## 5. Paper trail written by this change (not source)

`runs/change-02/output/` — 12 discrete artifacts · `runs/change-02/evidence/` — 4 roll-ups ·
`source-documents/active/DECISION_LOG_CHANGE_CONTROL.md` — CHANGE/DECISION entry appended ·
`runs/current/SESSION_HANDOVER.md` + `runs/current/active-milestone.md` — reconciled ·
`organization/CONTEXT_USAGE_LOG.md` — one row (outside the worktree, written by the kernel script).
