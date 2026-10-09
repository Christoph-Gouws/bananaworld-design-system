# DC + CRM re-check (QG-CEN-003) — CR-DESIGN-SYSTEM-015 — regression record (plan §5)

Run 2026-10-09, 19:20–20:50 UTC (21:20–22:50 SAST), on the owner's Windows machine. Every step was run, not argued.
Fresh clones in `%TEMP%\claude\d--Projects-Team-Builder\cr-ds-015-recheck` (deleted afterwards). No local estate
folder was touched, nothing was merged, and no pin moved on `main` in DC or CRM.

**VERDICT: BLOCKED, by the letter of the §5 blocking rule.** Two required checks fail on the candidate (DC Gitleaks, CRM
Dependency Audit), and the screenshots are not pixel-zero. **Every one of these was measured as either already there on
`main` or present with no change at all. None traces to CR-DESIGN-SYSTEM-015** (evidence below). Whether that clears AC-02
is the owner's call; this record does not make it.

## 1. What was tested

| Item | Value |
|---|---|
| Kit branch `change/cr-design-system-015`, head tested | `17cd5e14775b1a832433da368299107a5df7fa01`, tree `0db701d4fccb398655a7bdbe7d6375432e1974cd` |
| Kit code commit (parent of head) | `59ce1abc366d3126e0ea9a57ebad2b82281b62a7`, tree `2311bbc34889a34ac9185e16adfc86ab07281b3d` |
| 59ce1ab → 17cd5e1 | 8 files, all under `runs/` (proof tooling and records). The package ships `files: ["src"]`, so nothing shipped changed |
| **Shipped content (identical at both commits)** | `src` tree `e5359ddb8beef9d69080c41d1b03b96629623d9a`, `package.json` blob `7be0ba479e0bc4f3df6e19d293c6fdd2da4b3bbd`, `README.md` blob `9d699dd08fb5d87b3b55b7c4011c6113e36c1836` |
| Kit base | `cde6f4ef21e86610157ea5997c124418acc1ae93` (`src` tree differs from the head only by the new `src/lib/themes/packhouse.css`) |
| DC `main` | `7fb6a83d10e61be84c4a76fdfbd2f02bb02e183a`; kit pin `cde6f4e…` (`package.json:57`); pnpm 9.15.0 |
| CRM `main` | `00cf9f7a6af86a0a2f00858e6622deed2085e642`; kit pin **`54597acd4f5caac7d4243ab7067a695cbea5c694`** (`package.json:48`), which is ten kit commits behind base (CR-DESIGN-SYSTEM-008…014); pnpm 10.33.2 |
| Org Admin `main` (CRM e2e schema only) | `793293745989c6429799a9247e4443f5136cf6f0` |
| Tooling | node 24.18.0, Playwright 1.60.0 (chromium 1223), Docker 29.6.2, postgres:16, supabase/auth:v2.180.0 |

Installed-package fingerprint (sha256 over `node_modules/@bananaworld/design-system/src`): DC control and CRM-base
`eeb3870e…` (0.1.0, 63 files); **both candidates `f160e9ce…` (0.2.0, 64 files, the extra one is `packhouse.css`)**;
CRM control `a58a9b35…` (0.1.0, 48 files).

**Tree-hash rule (KI-M001E19-002), a caveat.** The whole-tree hash will NOT carry over to the squash-merged sha. The branch
carries `runs/` records (including this file once committed), so its tree changes with every record commit. The packhouse
session should compare what ships: `git rev-parse <merged>:src` = `e5359ddb…` and `git rev-parse <merged>:package.json`
= `7be0ba47…`. Using that instead of the whole-tree rule is an owner decision. It is flagged here and not assumed.

## 2. Candidates: exactly two files (step 2)

Branch `throwaway/cr-design-system-015-recheck` in each app. The commits carried no co-author trailer.

| App | Candidate commit | Diff |
|---|---|---|
| DC | `8792a87fa31c87108157ae50f4c2b87221880dd6` | `package.json` 1 line (pin `cde6f4e…` → `17cd5e1…`); `pnpm-lock.yaml` +8/−7: the pin in 3 places, `version: 0.1.0 → 0.2.0`, and one `deprecated:` notice pnpm added to `eslint@9.39.4` |
| CRM | `80595772cade0a90dd3a302198e5e46843c4b1c4` | `package.json` 1 line (pin `54597acd…` → `17cd5e1…`); `pnpm-lock.yaml`: the pin in 4 places plus `version: 0.1.0 → 0.2.0` |

CRM's committed lockfile is Prettier-formatted, and `pnpm install --lockfile-only` rewrote all 6,020 lines. So the pin edit was
applied to the original text instead. Parsed as YAML, it equals pnpm's own output except for that same eslint
`deprecated` notice. `pnpm install --frozen-lockfile` passed in every checkout.

**CRM needed a third build.** Its control pin is ten kit changes behind, so control → candidate also carries CR-008…014.
To isolate CR-015, a **CRM-base** variant (pin `cde6f4e`, built the same way, never pushed) was measured alongside.

## 3. Built-artefact identity (step 3)

`next build` was run with each app's CI env (DC: CI e2e env incl. `FEATURE_EPIC_30_TRUCK_DRIVER_PLAN=on`; CRM: CI e2e env
with the CI placeholder JWTs). All builds exited 0. Compared sets: every `.next/static/**/*.{css,js}` (what the browser
receives) **and** `.next/server/**/*.{js,css}` (SSR, beyond the plan), plus `public/sw.js`.
Normalisation: build id, absolute checkout path, and (`*_client-reference-manifest.js` only) JSON key order.

**Why a raw control-vs-candidate comparison cannot be zero.** pnpm names the kit's install folder after the tarball URL,
which contains the sha (`…design-sys_ap5znbb…` vs `…_6uifptp…`). Webpack's deterministic module ids hash the module path,
so ids and chunk names shift with no content change. Builds of the same code in two different folders also differ.
So the decisive test holds the folder and install path fixed (**path-neutral A/B**):
- A third checkout (`dc-swap` / `crm-swap`, control pin) is built clean as **A**.
- Only the kit folder's files are replaced with the candidate's installed files, then it is built clean as **B**.
- The folder is restored afterwards.

| Comparison | Static CSS | Static JS | Server JS | `sw.js` |
|---|---|---|---|---|
| **DC A vs B (CR-015 alone)** | **2/2 byte-identical** | **511/511 byte-identical** | 1014 files: 580–591 byte-identical; the other 423–434 equal once digit runs are masked. The only differing tokens are module ids (`#:(`, `#)`, `"id":"#"`, `b.s=#)`, `c.t.bind(c,#,23)`) | identical apart from 2 build-id occurrences |
| DC A vs A2 (no change at all: noise floor) | 2/2 identical | 511/511 identical | 591 identical, **423 differ** by the same module-id renumbering | — |
| **CRM base-pin A vs B (CR-015 alone)** | **1/1 identical** | **214/214 identical** | **444/444 identical** | identical apart from 2 build-id occurrences |
| CRM positive control (A vs B with one token changed to `--color-accent:#123456`) | **detected**: new CSS file containing `#123456` | — | 180 differ | — |
| Raw DC `dc` vs `dc-cand` (for the record) | 2/2 same name and identical | 136 identical, 375 renamed | 857 differ | — |
| Raw CRM control vs candidate (literal §5) | **differs**: 70 Tailwind rules added, 3 regrouped (`.shadow-*`). Tailwind scans the kit's `src`, and CR-008…014 added components | 159 identical, 54/56 renamed | 374 differ | — |
| Raw CRM base vs candidate | 1/1 identical | 159 identical, 55 renamed | 376 differ | — |

The string `packhouse` appears in **0** emitted CSS files of either candidate. Neither app's Tailwind config could pick up a
stray kit checkout: its `../bananaworld-design-system/src` glob matched nothing in the scratch layout.
**Step 3 result: zero differences attributable to CR-015** (client bundles byte-identical, CRM server byte-identical, DC
server equal up to the same module-id renumbering a no-change rebuild produces).

## 4. Screen renders (step 4)

The app's own Playwright config was used unchanged, plus one overlay adding an end-of-test screenshot to **every** test
(`screenshot:"on"`) and a JSON reporter. The servers ran `next start` on production builds, on fresh databases via each
app's CI bootstrap, bound to 127.0.0.1:
- DC: `supabase-ci-shim.sql`, 167/167 migrations, audit_log partitions, `e2e-seed.mjs`.
- CRM: `db:bootstrap:test` (Org Admin 31, DC 167 and CRM 44 migrations), GoTrue container, auth gateway, DC intake double, `e2e:seed`.

Each app was run **twice per variant** so non-determinism could be measured, not assumed.

| Run | Tests | Spec-written frames | End-of-test screenshots |
|---|---|---|---|
| DC control ×2, candidate ×2 | each: **246 passed, 66 skipped, 0 failed** (same as CI) | 229 per run | 313 per run |
| CRM control ×2, base ×2, candidate ×2 | each: **70 passed** (control run 2: 69 passed + 1 flaky¹) | 43 per run | 77 per run (78 with the retry) |

Pixel diff: pixelmatch threshold 0 with anti-aliasing included, so ANY changed pixel counts. Then a **four-run test** per
file over control, control-2, candidate and candidate-2. A real candidate effect shows as the pattern **AABB**: both
controls equal, both candidates equal, and the pairs different. If there is no effect, AABB is exactly as likely as the
pure-noise patterns ABAB/ABBA.

| Comparison | Pairs | Pixel-identical (ctl vs cand) | Noise floor (ctl vs ctl2) | AABB | ABAB / ABBA |
|---|---|---|---|---|---|
| DC frames | 229 | 166 (63 differ) | 150 (79 differ) | 4 | 7 / 5 |
| DC end-of-test | 313 | 214 (99 differ) | 198 (115 differ) | 9 | 9 / 10 |
| **CRM isolated (base vs cand)** frames | 43 | 21 (22 differ) | — | **0** | 0 / 0 |
| **CRM isolated** end-of-test | 77 | 27 (50 differ) | — | **0** | 0 / 0 |
| CRM literal (own pin vs cand) frames | 43 | 20 (23 differ) | — | 0 | 0 / 0 |
| CRM literal end-of-test | 77 | 23 (54 differ) | — | **3** | 0 / 0 |

**DC.** Two unchanged control runs differ from each other more (79 / 115) than control differs from candidate (63 / 99). There
is no excess of AABB over ABAB/ABBA. Each of the 13 AABB files was opened and measured:
- 8 are 5–26 px at 1–15 levels of colour change: anti-aliasing on rounded corners and icon edges.
- 3 are the 648 px logo drawn vs not yet drawn. Every one of the four runs has 29–37 desktop shots with the logo not yet drawn, including both controls.
- 1 is 2,492 px at most 7 levels: a button-fill transition caught mid-way. The same Export buttons flip 254,254,253 ↔ 254,254,254 between the two **control** runs.
- 1 is a tablet fade at most 6 levels.

**Named non-determinism (DC):**
- logo image load timing;
- CSS transitions and slide-in panels captured mid-animation (up to whole-screen diffs, same content);
- anti-aliasing jitter.

**CRM.** The diffs are dominated by per-run generated fixture names, e.g. `…1F30C1107A Depot` vs `…1F64JW0FC7 Depot` and
`ZZTEST-E2E-SEG-MV1F3ZX14646…`. They reflow every list and dialog that shows them, alongside the same transition and
anti-aliasing effects. **CR-015 isolated: zero systematic differences.** The literal comparison's 3 systematic files are
the login screens (`auth-…signs-in…`, `auth-…signed-out-visitor…`, `auth-wrong-credentials…`): 68 px of the focused input's
yellow ring, at most 8 levels. They come from the CSS regrouping caused by the CR-008…014 pin jump. They are absent between
base and candidate.

¹ CRM control run 2, `availability-saved-views.spec.ts` "tick two values in one filter…": failed once
(`toBeGreaterThan`), then passed on retry. This was a control run, not the candidate.

**Specs not run:** none were dropped. 66 DC tests skipped themselves by their own guards, identically in all four local runs
and in CI (66 skipped / 246 passed on both CI runs):
- 33 because "EPIC-029 is OFF on this server" (CR-DC-194/195/196/197/203/207/209/213 browser specs; tablet CR-DC-210, CR-DC-213);
- 31 because "the day plan / report does not exist in this server" (CR-DC-198, CR-DC-226, EPIC-030 M-03…M-07);
- 2 because "EPIC-021 … off in this server" (EPIC-030 M-02).

This matches the flag set DC's CI e2e job uses. The plan's "327 screenshots" counts `screenshot(` calls in the source. 229
frame files are written per run, because calls inside the self-skipped tests do not execute. CRM: all 70 tests ran.

## 5. App CI against the candidate (step 5)

`gh workflow run ci.yml --ref throwaway/cr-design-system-015-recheck` (both apps have `workflow_dispatch`, so no PR was
opened in either). The same workflow was dispatched on `main` as the control.

| Run | Result | Jobs |
|---|---|---|
| DC candidate https://github.com/Christoph-Gouws/bananaworld-dc/actions/runs/37980304710 | attempt 1: **failure** | 11 jobs: 9 ✓, 2 ✗. Gitleaks; Unit+Integration+Contract (1 of 3,129 integration tests, `reporting-grid-multi-value.test.ts` "THE TOTAL MOVES WITH THE SET", **timed out at 5,000 ms**; its siblings ran 1.9–4.7 s) |
| same run, attempt 2 (`--failed`) | **failure** | Unit+Integration+Contract **✓**; Gitleaks ✗; final state 10 ✓, 1 ✗ |
| DC `main` https://github.com/Christoph-Gouws/bananaworld-dc/actions/runs/37980310007 | **failure** | 11 jobs: 10 ✓, Gitleaks ✗ |
| CRM candidate https://github.com/Christoph-Gouws/bananaworld-crm/actions/runs/37980316063 | **failure** | 9 jobs: 8 ✓ (incl. E2E, Integration, Build), Dependency Audit ✗ |
| CRM `main` https://github.com/Christoph-Gouws/bananaworld-crm/actions/runs/37980321112 | **failure** | 9 jobs: 8 ✓, Dependency Audit ✗ |

- **DC Gitleaks:** fails identically on `main`. Under `workflow_dispatch` the action scans the whole history (`git log --all`).
  On a pull request it scans only the PR's commits. It reports the same **4 findings** in both runs, in
  `tests/contract/opening-stock-pack-date-contract.test.ts` and `tests/unit/receipt/pack-date-validation.test.ts`, from 3
  historical commits. None are in the candidate commit or its two files.
- **DC integration timeout:** not reproduced on re-run. The test exercises DC's report SQL against Postgres; the kit
  TypeScript it imports is byte-identical between base and candidate.
- **CRM Dependency Audit:** fails identically on `main`: `sharp <0.35.5` (GHSA-wq5f-xc86-pv6w) and `source-map-js <1.2.2`
  (GHSA-68fv-2mgg-jv7q), both HIGH, in CRM's own production tree. This is pre-existing CRM debt, outside this change.

## 6. Pins and branches (step 6)

- Nothing merged; no PR opened in either app. `main` after the run: DC `7fb6a83…`, CRM `00cf9f7…` (unchanged).
- **Branches deleted 2026-10-09 ~20:48 UTC:** `throwaway/cr-design-system-015-recheck` in bananaworld-dc and in
  bananaworld-crm (`git ls-remote` returns 0 refs for both).
- All containers started (`cr015-dc-pg`, `cr015-crm-pg`, `cr015-crm-gotrue`) were removed. No test port is left listening.
  The scratch folder was deleted.
- A branch push may have produced a Vercel preview deployment; none was checked or used.

## 7. Summary for AC-02

| Check | CR-015 effect | Other findings (not CR-015) |
|---|---|---|
| Artefacts | **none**: client CSS/JS byte-identical in both apps; CRM server identical; DC server = no-change noise | raw path/module-id shifts; CRM pin-jump CSS (CR-008…014) |
| Screens | **none**: AABB at chance in DC, 0 in CRM-isolated | DC/CRM render non-determinism; CRM login focus ring from the pin jump |
| CI | **none** | DC Gitleaks (on `main` too); CRM Dependency Audit (on `main` too); one DC integration timeout, green on re-run |

VERDICT: **BLOCKED** under the §5 rule as written: required checks are red (also red on `main`), and the screens are not
pixel-zero (non-determinism measured at the same rate with no change). No measured difference traces to CR-DESIGN-SYSTEM-015.

## Owner decisions on this record (2026-10-09, owner's chat)

1. **ACCEPTED as clearing QG-CEN-003 / packhouse AC-02.** CR-DESIGN-SYSTEM-015 causes zero differences in the DC and CRM.
   Every browser CSS/JS file is byte-identical (DC 513/513, CRM 215/215), and screenshot variation is run-to-run noise
   present without the change. The two red checks are pre-existing on each app's `main`, as the control runs prove: DC Gitleaks
   (4 old findings in history) and CRM Dependency Audit (`sharp`, `source-map-js` HIGH). They are not caused by this change and do
   not block it. Each is lined up as its own change run. The build may finish the close pack and open the PR.
2. **Fingerprint rule changed: code-only.** The packhouse proves "same as re-checked" by comparing the git tree hashes of
   `src` and of `package.json` (`git rev-parse <sha>:src` and `<sha>:package.json`) between the re-checked head and the merged
   commit, NOT the whole-tree hash. `runs/` paperwork-only commits do not void this record.
