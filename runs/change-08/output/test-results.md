# Test results — CR-DESIGN-SYSTEM-009

> Stage 04. Every number here was measured in this session and is reproducible from the commands
> quoted. **Nothing is carried forward from a previous change's report.**

## 1. Headline

| | |
|---|---|
| `pnpm typecheck` | **clean** — re-run at the resumed session, still clean |
| `pnpm test` — **baseline, measured BEFORE any edit** | **314 passed / 17 files** |
| `pnpm test` — final | **363 passed / 17 files** — re-run at the resumed session, **363/363 still green** |
| New specs | **+49** |
| 🔴 Existing specs edited | **0** |
| 🔴 Existing specs reddened | **0** |
| Byte-identity, measured | **1,972 caller shapes, 0 differences** |
| Mutation battery | **8 run, 8 caught** |
| Dependency audit | 🔴 **3 BLOCKING advisories — see §7 and §7a.** Pre-existing on `main`, not caused by this change. **Owner decided option A** (take the repaired versions); the bump is **owed, not done** — `pnpm` is permission-gated here. CI's `dependency-audit` job will be RED |
| Migration | **none** — this package has no database by construction |
| Throwaway Postgres | **never started; nothing left behind** (no container, no stopped container, no port held) |

⚠ The baseline was **re-measured, not quoted**. CR-007's handover recorded 269/14; this worktree
starts from `main` @ `6ed975d`, which is one change later, and measures **314/17**.

## 2. The suite, file by file (final)

```
 Test Files  17 passed (17)
      Tests  363 passed (363)
```

| File | Specs added | What they cover |
|---|---|---|
| `tests/components/Table.test.tsx` | **16** (T-23 … T-38) | §9 — the unchanged default, both densities, three wrap values, four width steps |
| `tests/components/Grid.test.tsx` | **12** | the multi-value cell, driven by ticking |
| `tests/components/grid-view.test.tsx` | **11** | §2 — the arity helpers and the wire encoding |
| `tests/components/Grid.additive.test.tsx` | **6** | the additive claim, and the grid's three rows moving together |
| `tests/components/DataTableToolbar.test.tsx` | **4** | `selectAll` defaults, and the extraction adding nothing |
| the other 12 files | 0 | untouched, green |

## 3. The acceptance criteria, traced to a verdict

| # | Criterion (from the approved plan) | Evidence | Verdict |
|---|---|---|---|
| AC-1 | A filter cell can hold SEVERAL option ids | `Grid.test.tsx` — three rooms ticked in one opening | ✅ |
| AC-2 | 🔴 The menu STAYS OPEN across ticks | same spec; mutation **M-5** removes the Radix `preventDefault` and reddens it | ✅ |
| AC-3 | "Select all" takes everything; a second tap clears | `Grid.test.tsx`, master-row block | ✅ |
| AC-4 | The master row reads **mixed** while only some are chosen | `aria-checked="mixed"` asserted; mutation **M-6** reddens it | ✅ |
| AC-5 | It carries "3 of 12" | asserted at 0/3, 1/3 and 3/3 | ✅ |
| AC-6 | 🔴 A ONE-VALUE STATE BEHAVES EXACTLY AS TODAY | `grid-view.test.tsx` §2 — the key list is `["kind","value"]`, `values` **absent**; mutation **M-4** reddens it | ✅ |
| AC-7 | A single value round-trips through the stated wire encoding under BOTH `get` and `getAll` | `grid-view.test.tsx`, real `URLSearchParams` | ✅ |
| AC-8 | No second multi-select menu is written | `MultiSelectMenu.tsx` is the only implementation; both surfaces import it | ✅ |
| AC-9 | The grid's tick arithmetic equals the toolbar's | literally the same function | ✅ |
| AC-10 | A compact density exists and reaches `Table`/`TableHead`/`TableCell`/`GridHeadCell`/`GridFilterRow` | `Grid.additive.test.tsx` — one `density`, four assertions | ✅ |
| AC-11 | 🔴 The current density stays the DEFAULT and no existing screen moves | T-23 … T-26 pin the exact strings; the 1,972-shape diff (§4) | ✅ |
| AC-12 | Exactly ONE class per axis | T-28 (padding), T-30 (whitespace/overflow), T-38 (width) | ✅ |
| AC-13 | Values stay on one line; a long one is cut and recoverable on hover | T-31 … T-33: exactly one whitespace/overflow class on every path, `truncate` emitted under the switch, `title` present for string children and absent for element children | ✅ **PASS** — implementation verified. ⚠ **On-screen rendering unverified**: no browser is executable here, so the ellipsis itself is an owner step (§6) |
| AC-14 | Columns are NOT all equally narrow — a named per-column scale | T-34 … T-38: all four steps, emitted only under `truncate`, head and cell identical for the same step, a caller's own `max-w-` still winning | ✅ **PASS** — implementation verified. ⚠ **Whether `max-width` caps a `<td>` in a real engine is unverified** (OQ-8, §6) |
| AC-15 | Every existing caller renders byte-identically | §4 | ✅ |
| AC-16 | Dependency audit reproduced with the third sanity check | §7 — S4: 16 ids parsed, **0 empty or non-GHSA** | ✅ run; ❌ **verdict FAILS** |
| AC-17 | **Radix** — no interactive control hand-rolled or replaced | the multi cell is `DropdownMenu.CheckboxItem` end to end, including the tri-state master row, which is where a hand-rolled dash would have lost `aria-checked="mixed"` | ✅ |
| AC-18 | Migration | **None.** No database | ✅ N/A, recorded |

## 4. Byte-identity, measured against `main@6ed975d`

The harness the CR-007 handover describes (item 5), reused: the pre-change `src/` tree was
materialised from the merge base, every shape an existing caller can pass was rendered against **both**
components, and whole `innerHTML` was compared.

```
TableCell — every existing prop shape                     576 shapes   0 differences
TableRow × TableCell — the CR-007 surface, re-guarded     192 shapes   0 differences
TableHead — sortable and not                              192 shapes   0 differences
TableContainer / Table / TableHeader / TableBody             4 shapes   0 differences
GridHeadCell — every existing prop shape                  864 shapes   0 differences
GridFilterRow — every kind × value state × leadingCells   144 shapes   0 differences
                                                        -------------------------------
                                                        1,972 shapes   0 differences
```

🔴 **ZERO differences, not "differences that were classified as harmless."** CR-007 had to classify 48
because it deliberately changed a behaviour; this change deliberately changes none, so the honest
expected result was zero and the measured result is zero.

⚠ **One harness correction, made and disclosed.** The first run reported differences on
`GridHeadCell` and `GridFilterRow` only. They were **Radix's per-render generated ids**
(`radix-_r_21g_`), which differ between any two renders of the *same* component — the harness was
comparing its own render order. Normalising only the generated portion cleared all of them; the four
Radix-free comparisons were byte-identical on the first run and are unaffected by the normalisation.

**And the seventh piece of evidence is not from this harness at all:**
`tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` holds a whole-DOM snapshot of the
**seven screens that render the toolbar today**. `MultiSelectItem` and the trigger arithmetic were
moved out of that file, and the snapshot's diff is **zero lines** — character for character, including
class order.

## 5. Mutation battery — 8 run, 8 caught

🔴 A green suite proves nothing until a defect reddens it. Each mutation restores a specific defect
this change was written to prevent.

| # | Defect restored | Caught by | Restored |
|---|---|---|---|
| M-1 | `HEAD_WRAP` shares the body cell's record → every header loses `whitespace-nowrap` | `Table.test.tsx` T-24 / T-31 | ✅ byte-exact |
| M-2 | compact emits the default padding → the switch does nothing | T-27 + `Grid.additive` | ✅ |
| M-3 | a width class is emitted while NOT truncating → values spill, and every existing render moves | T-34 + `Grid.additive` | ✅ |
| M-4 | `gridFilterSelect` writes `values` for ONE id → the saved-view shape changes | `grid-view` §2 + `Grid.test` | ✅ |
| M-5 | the Radix `preventDefault` is dropped → the menu closes on the first tick | `Grid.test` + `DataTableToolbar.test` | ✅ |
| M-6 | the master row loses `indeterminate` → "some" reads as "all" | `Grid.test` + `DataTableToolbar.test` | ✅ |
| M-7 | the filter `<th>` is not given the ceiling → §C.4a desync, the cap is silently defeated | `Grid.additive` | ✅ |
| M-8 | the multi cell returns ids in TICK order → the trigger shuffles, the wire order stops being stable | `Grid.test` | ✅ |

**⚠ An in-session defect was found in the HARNESS, and it is worth the next session's attention.**
The battery was first written to restore each file with `git checkout --`, per CR-007's `defect-log.md`
D-1 (which warns that it restores from the INDEX, so the source must be staged first — it was). That
is a **necessary but not sufficient** precaution on Windows: git's autocrlf rewrites line endings on
the way out, so a restored file is byte-**different** from the file under test even when its content is
identical. Two multi-line anchors then failed to match and their mutations **never ran** — reported as
`6/8` with a restore failure flagged. Fixed by keeping the original bytes in memory and writing them
back, and by matching anchors against LF-normalised content. Full detail in `defect-log.md` **D-1**.

🔴 **The `6/8` run is not the reported result and was not reported as one.** The `restored=false` flag
is what exposed it — the harness's own self-check, which is the reason CR-007 demanded one.

## 6. What a unit test CANNOT say here, stated plainly

`happy-dom` does no layout. The §9 specs assert that a cell carries `truncate` and one `max-w-[…]`
ceiling; they **cannot** assert that an ellipsis appeared, or that `max-width` actually caps a `<td>`
under `table-layout: auto` (the plan's **OQ-8**, named there as a build-time verification).

**That verification could NOT be run in this session** — see `qa-report.md` §4 and `known-issues.md`
§C. A ready-to-run probe is shipped at `runs/change-08/output/truncate-probe.html`: it measures
`getBoundingClientRect().width` and `scrollWidth > clientWidth` on capped and uncapped cells and prints
a PASS/FAIL verdict. Opening it in any browser answers OQ-8 in one click. **No claim is made here that
it has been opened.**

## 7. Dependency audit — 🔴 THE ONE THING THAT STOPS THIS CHANGE

`pnpm audit` is permission-blocked in a build worktree (standing handover note 7) and **is not claimed
as run**. CI's exact job (`ci.yml:68` — `pnpm audit --prod --audit-level=high`) was reproduced in Node
against the same npm bulk advisory endpoint.

**The probe asserted its own inputs before it was allowed to reach a verdict — and its FIRST RUN LIED,
exactly as the handover predicted, and its own assertion caught it:**

```
S1  prod closure, deps + optionalDeps = 46      <- IMPLAUSIBLE
!!! S1 FAILED — the closure is implausibly small; the store walk is wrong. STOP.
```

The cause is the fourth distinct way this probe has been got wrong: on Windows, pnpm **shortens** a
long store directory to `@radix-ui+react-checkbox@1._c2b24e10d7…` — the version is truncated and the
peer suffix is a hash, so **any** name/version regex over the directory name is wrong. The fix is to
stop parsing directory names at all and read each package's own manifest, which states its name and
version authoritatively. After the fix:

```
S1  prod closure, deps + optionalDeps = 102
S1  prod closure, deps ONLY           =  66    (standing figure: ~70 — matches)
S1  sharp reachable only via optional edge = true
S2  nanoid in closure = 3.3.18                 (the CR-002 override still doing its job)
S3  roots = 16, incl. next@15.5.19
S4  advisories parsed = 16
S4  ids that are empty or non-GHSA = 0         <- the third check the handover demands
```

### The verdict

```
  BLOCKING GHSA-2xp9-vwfh-vxw4  critical  next     Unauthenticated RCE in the Image Optimization API (AVIF)
  BLOCKING GHSA-p293-qw3h-jr36  critical  next     Unauthenticated RCE on windows-hosted servers
  BLOCKING GHSA-rgj7-g3m4-5g8c  high      sharp    inherited libheif CVEs
  IGNORED  GHSA-6g55-p6wh-862q  high      postcss
  IGNORED  GHSA-89xv-2m56-2m9x  high      next
  IGNORED  GHSA-f88m-g3jw-g9cj  high      sharp
  IGNORED  GHSA-m99w-x7hq-7vfj  high      next
  IGNORED  GHSA-p9j2-gv94-2wf4  high      next
  IGNORED  GHSA-r28c-9q8g-f849  high      postcss
>>> BLOCKING (new, un-ignored high/critical): 3
>>> Audit gate would FAIL
```

**Confirmed against a SECOND, INDEPENDENT source** — the GitHub advisory API, not the npm endpoint —
because a probe that has lied once does not get taken on trust:

| Advisory | Severity | Published | Fixed in |
|---|---|---|---|
| `GHSA-2xp9-vwfh-vxw4` | critical | **2026-09-08** | `next` **15.5.24** |
| `GHSA-p293-qw3h-jr36` | critical | **2026-09-08** | `next` **15.5.24** |
| `GHSA-rgj7-g3m4-5g8c` | high | **2026-09-08** | `sharp` **0.35.4** |

🔴 **All three were published YESTERDAY — 2026-09-08.** That is why CR-007 (2026-08-25) reported 6
highs and 0 blocking, and why this is an estate advisory event rather than anything this change did.
`package.json` and `pnpm-lock.yaml` are byte-identical to `main`; **`main` fails this audit right now,
and so would any other PR to this repo.**

**Why it stops the PR:** `autoInstallPeers: true`, so `next@15.5.19` sits in the lockfile's
**production `dependencies`** (`pnpm-lock.yaml:50`), which is exactly what `pnpm audit --prod` walks.
Three un-ignored high/critical → non-zero exit → the `dependency-audit` job fails → branch protection
refuses the merge.

**Why it was not simply fixed here:** the remedy is a lockfile refresh to `next` ≥ 15.5.24, which is
**inside the already-declared `^15.0.0` peer range** and also pulls `sharp` ≥ 0.35.4 (15.5.25 widens the
optional range to `^0.34.3 || ^0.35.4`). Verified against the same endpoint: **at `next@15.5.25` +
`sharp@0.35.4`, zero high/critical remain.** But every dependency-mutating command
(`pnpm update`, `pnpm install` without `--frozen-lockfile`) is **permission-blocked in this worktree**,
and the only other route — adding two unauthenticated-RCE GHSAs to the owner-approved
`pnpm.auditConfig.ignoreGhsas` list — is not a change's call and is the wrong instinct regardless.

### 7a. Re-run at the resumed session (2026-09-09, after the owner answered the D-9 card)

The owner answered **A — take the repaired versions.** The audit was therefore **re-measured from
scratch** rather than quoted, by a second, independently-written probe that walks the production
closure out of `pnpm-lock.yaml` and queries the same npm bulk endpoint `pnpm audit` uses:

```
direct prod deps (16)
PROD closure — deps only      : 66 name@version pairs
PROD closure — with optional  : 106 name@version pairs
  next: 15.5.19 · sharp: 0.34.5 · postcss: 8.4.31 · nanoid: 3.3.18
ALL advisories in the PROD closure: 16   (2 critical, 7 high, 7 moderate)
BLOCKING (high/critical, not on ignoreGhsas): 3
  critical GHSA-p293-qw3h-jr36 next  >=13.4.0 <15.5.24
  critical GHSA-2xp9-vwfh-vxw4 next  >=10.0.0 <15.5.24
  high     GHSA-rgj7-g3m4-5g8c sharp <0.35.4
VERDICT: `pnpm audit --prod --audit-level=high` would exit 1
SANITY: advisories parsed = 16 | empty or non-GHSA = 0
```

**Independently reproduces the first session's finding exactly** — same 3 blocking, same closure sizes
(66 / 106), same 16 parsed ids, same third-sanity-check result. And at `next@15.5.25` +
`sharp@0.35.4` against the same closure: **0 blocking, verdict exit 0.**

Two incidental confirmations worth recording: the `nanoid@<3.3.17` override **is working** (resolved
`3.3.18`; the `<3.3.18` high does not appear), and both high PostCSS advisories that appear
(`GHSA-6g55-p6wh-862q`, `GHSA-r28c-9q8g-f849`) are already on the ignore list — so the 3 blocking are
the whole of it.

🔴 **The bump itself is still NOT in this commit.** `pnpm` remains permission-gated and an unattended
session has no approver; the gate was honoured rather than routed around, and hand-authoring ~35
lockfile records with registry integrity hashes was rejected as a worse risk than a red gate. The one
owed command, and the full reasoning for both refusals, are in `known-issues.md` §A and decision
**D-10**.

**Seven moderate advisories** sit below the `--audit-level=high` threshold and do not block. Both of
the handover's standing watch items are still present: `GHSA-fxqj-rqcc-2cmp` (PostCSS, *incomplete fix
of* `GHSA-6g55-p6wh-862q`, which **is** on the ignore list — **third** change to raise it) and
`GHSA-qx2v-qp2m-jg93` (PostCSS XSS). **0 low.**

🔴 **Nothing here rests on the dependency tree being untouched.** CR-002 made that inference and CI
proved it wrong; the closure was walked and queried anyway, which is the only reason this was found
before the PR rather than after it.

## 8. What was NOT run, stated plainly

| Not run | Why |
|---|---|
| Any consumer app's test suite | Four of five consumer repos are **not readable from a build worktree**; `bananaworld-dc` is readable but **READ-ONLY** and cannot be built here. **Eighth change to record this.** No consumer suite was executed and nothing in this pack claims one was |
| `pnpm audit` itself | permission-blocked; reproduced in Node and labelled as a reproduction throughout |
| `pnpm update` / any lockfile write | **permission-gated in this worktree, with no approver in an unattended session.** The direct reason owner decision **A** is recorded but not executed (§7a, D-10). The gate was honoured, not routed around |
| A real-browser check of OQ-8 | **No browser binary can be executed from this sandbox** (paths outside the worktree are refused). The probe is shipped ready to run instead — `qa-report.md` §4 |
| `pnpm lint` | **no `lint` script and no eslint config exist** in this repo — pre-existing drift, out of lane |
| `pnpm format:check` | **no prettier config exists**, so it fails repo-wide across all `src/` files including ones this change never opened — pre-existing drift, out of lane, and **not a CI job** |
| `pnpm audit:deps` | **no such script exists** in this repo |
| A throwaway Postgres | **This package has no database by construction.** No container was started and none was left behind |
