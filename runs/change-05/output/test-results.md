# Test results — CR-DESIGN-SYSTEM-005

> Stage 04. Every number below is copied from a run in this session, not estimated.

## 1. Verdict

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | **clean** — 0 diagnostics |
| Tests | `pnpm test` | **246 passed / 13 files**, 0 failed, 0 skipped |
| Baseline (before ANY edit) | `pnpm test` | **235 passed / 13 files** |
| Net | — | **+11 specs**; **0 specs deleted**; **1 existing assertion narrowed** |
| Mutation check | 4 deliberate breakages | **4 / 4 caught** — §4 |
| Dependency audit | Node reproduction of CI's job | **0 blocking**, 6 highs all on the standing ignore list — §5 |

**PASS.**

## 2. The runs, as they came out

Baseline, recorded before a single character was edited:

```
 RUN  v4.1.10
 Test Files  13 passed (13)
      Tests  235 passed (235)
   Duration  11.76s
```

After the change:

```
 RUN  v4.1.10
 Test Files  13 passed (13)
      Tests  246 passed (246)
   Duration  3.56s
```

`pnpm typecheck` (`tsc --noEmit`, `strict` + `noUncheckedIndexedAccess`, no app path alias) printed
nothing and exited 0, both before and after.

**235 is the number the approved plan predicted** from CR-004's close, which is a small confirmation
that this worktree really is the `0633476` the plan was written against.

## 3. The 11 new specs, and what each would catch

All in `tests/components/DocumentHeader.test.tsx`. Nine sit in a new describe block —
`<DocumentHeader> — the depot slot's label (CR-DESIGN-SYSTEM-005)` — and two extend existing blocks.

| # | Spec | Fails if… |
|---|---|---|
| T-1 | prints "DC" when no label is given | the default changed → **every existing caller moved**. This is the additive claim as an assertion |
| T-2 | `dcLabel="Branch"` → `["Date","Branch","Raised by","Document no."]` | the word lands in the wrong slot, or another slot moved |
| T-3 | the slot is still second when named | naming a slot moved it |
| T-4 | `dcName: null`, no label → `"—"` + `border-dashed` | the empty state changed under the default |
| T-5 | `dcName: null`, `dcLabel="Branch"` → `"—"` + `border-dashed` + `text-fg-subtle` | **the omission answer changed.** Also asserts no "Not applicable" wording appeared |
| T-6 | four slots always, across 4 prop combinations | **somebody added a hole.** Counts both labels and `dl > div` children |
| T-7 | `dateLabel` + `dcLabel` together | the two props interact |
| T-8 | `dcLabel="Date"` | a printed word became a slot identity |
| T-9 | `dcLabel=""` and `dateLabel=""` both render empty | `??` became `||` and the two props drifted |
| T-11 | one array literal of slot names; 4 entries; `"DC"` second; render walks the constant | ORDER got a second home |
| T-12 | the barrel re-exports exactly the eight header symbols | the export surface moved |

## 4. 🔴 Mutation check — the specs were proved to BITE, not assumed to

A green suite proves nothing about a spec that cannot fail. Four deliberate breakages were introduced
into `src/components/DocumentHeader.tsx`, run, and reverted. **Every one was caught, and the final
state of the file is the correct implementation** (re-verified green at 246/246 afterwards).

| # | Mutation | Expected to catch | Actually caught |
|---|---|---|---|
| M-1 | `props.dcLabel ?? "DC"` → `props.dcLabel \|\| "DC"` | the `??` pin | **2 failed** — T-9, and the narrowed source scan |
| M-2 | ignore the prop: back to `label="DC"` | the whole feature | **7 failed** — T-2, T-3, T-5, T-7, T-8, T-9, source scan |
| M-3 | omit the slot when `dcName === null` | the omission decision | **4 failed** — T-4, T-5, **T-6**, and the pre-existing CR-DC-039 empty-state spec |
| M-4 | `const slots = ["Date","DC","Raised by","Document no."] as const;` | the cross-repo source pin | **2 failed** — **T-10** (the DC mirror) and **T-11** |

M-4 is the one that matters most: it is the shape of edit that would look harmless in review, keep
every DOM spec green, and hand Bananaworld-DC a broken contract test weeks later at its pin bump.
It reddens here, in this repo, immediately.

## 5. Dependency audit

⚠ `pnpm audit` is **permission-blocked in build sessions** — the attempt was refused, and nothing here
claims the command was run. Fifth change to record this. CI's `dependency-audit` job runs it for real
and is authoritative. Reproduced in Node against npm's own bulk advisory endpoint, with the prod
closure rebuilt from the installed tree and the repo's `pnpm.auditConfig.ignoreGhsas` applied:

```
PROD CLOSURE: 72 package versions across 72 packages
overrides in force: {"nanoid@<3.3.17":"^3.3.17"}
nanoid versions present: ["3.3.18"]

HIGH/CRITICAL advisories against the prod closure: 6
  IGNORED  HIGH GHSA-89xv-2m56-2m9x next@>=14.1.1 <15.5.21 — Next.js: SSRF in Server Actions on custom servers
            path: .>next
  IGNORED  HIGH GHSA-m99w-x7hq-7vfj next@>=13.0.0 <15.5.21 — Next.js: DoS in App Router using Server Actions
            path: .>next
  IGNORED  HIGH GHSA-p9j2-gv94-2wf4 next@>=12.0.0 <15.5.21 — Next.js: SSRF in rewrites via attacker-controlled destination hostname
            path: .>next
  IGNORED  HIGH GHSA-6g55-p6wh-862q postcss@<=8.5.11 — PostCSS: arbitrary file read via sourceMappingURL
            path: .>next>postcss
  IGNORED  HIGH GHSA-r28c-9q8g-f849 postcss@<=8.5.17 — PostCSS: path traversal in source-map auto-loading
            path: .>next>postcss
  IGNORED  HIGH GHSA-f88m-g3jw-g9cj sharp@<0.35.0 — sharp inherited libvips CVEs
            path: .>next>sharp

VERDICT: 0 blocking, 6 on the standing owner-approved ignore list (package.json pnpm.auditConfig.ignoreGhsas).
```

**All six reach this package only through the auto-installed `next` PEER**, exactly as the six standing
owner-approved ignores describe (`.>next`, `.>next>postcss`, `.>next>sharp`). **0 new, 0 blocking.**
The nanoid override is confirmed doing its job: `nanoid@3.3.18` is what is installed, and neither
nanoid advisory appears.

🔴 **This change adds no dependency — and an unchanged tree is NOT evidence of audit health.** CR-002
inferred exactly that and CI proved it wrong; the advisory set moves under a static lockfile. The probe
above is the reason this section exists at all.

⚠ **And the probe's own first cut was wrong — read the output, don't take the verdict** (CR-004's
DEF-2, same trap, different mechanism). Its first run reported a **16-package** closure with **no
nanoid at all** and **3 BLOCKING** advisories. Both were artefacts: the module walk used a lexical
parent instead of `realpathSync`, so it never descended through pnpm's symlinked store and never saw
`next`'s own dependencies; and the ignore check compared npm's **numeric** advisory `id` against a list
of **GHSA** strings, which can never match. Corrected, re-run, and only then read. Logged as
`defect-log.md` DEF-1.

## 6. What was NOT run, stated plainly

| Not run | Why |
|---|---|
| **Bananaworld-DC's own suites** — including `tests/contract/transaction-form-standard.test.ts` and `tests/unit/components/DocumentHeader.test.tsx` | Consumer repos are not readable or runnable from this worktree; none was opened. 🔴 **Nothing in this pack claims a DC suite was executed.** The additive argument is a code argument plus this repo's own mirrors (T-1, T-10, T-11) |
| Bananaworld-CRM / RMS / org-admin suites | Same reason. None imports `DocumentHeader` today |
| `pnpm lint` | **No `lint` script and no eslint config exist in this package.** Recorded, not invented — `known-issues.md` C-2 |
| `pnpm audit:deps` | **No such script in this package.** The audit job in CI is `pnpm audit --prod --audit-level=high` |
| `pnpm format:check` | Fails repo-wide on pre-existing drift (no prettier config). Verified this session against **four files this change never touched** — they fail identically. Not a CI job. `known-issues.md` C-1. **`prettier --write` was deliberately NOT run**: with no config it would reformat existing source at default settings, which is a mass non-additive diff |
| Any migration rehearsal | **This package has no database.** No migration file exists or was created |
| A throwaway Postgres container | **Never started.** `chg-cr-design-system-005-pg` was never created, so no container is running or stopped and no port is held |
| CI | Not waited for, by instruction. The conductor polls and merges |
