# Test results — CR-DESIGN-SYSTEM-007

## 1. Headline

| Gate | Command | Result |
|---|---|---|
| Baseline, **re-measured before any edit** | `pnpm test` | **263 passed / 14 files** |
| After the change | `pnpm test` | **269 passed / 14 files** |
| Typecheck | `pnpm typecheck` (`tsc --noEmit`) | **clean**, before and after |
| New specs | — | **6** (T-17 … T-22) |
| Existing specs edited | — | **0** |
| Existing specs reddened | — | **0** — all 17 CR-006 specs green, unedited |
| Mutation checks | — | **5 run, 5 caught** |
| Dependency audit | reproduced in Node | **0 blocking** |

263 + 6 = **269**, exactly the plan's §6 prediction.

## 2. The six new specs

All appended in a new **§8**. Each states the precedence rung it pins.

| # | Spec | Pins |
|---|---|---|
| **T-17** | 🔴 **The finding, verbatim.** `<TableRow valign="top">` + `<TableCell className="align-middle">` → `verticalClasses` is `["align-middle"]` | the fix itself |
| **T-18** | The reviewer's full CRM shape: a six-cell top-aligned row whose actions cell carries `className="align-middle"` → five `align-top`, one `align-middle`, exactly one vertical class each | the fix, at real scale |
| **T-19** | The cell prop still beats `className` **inside** a top-aligned row: row `top` + cell `valign="middle"` + `className="align-bottom"` → `["align-middle"]` | position (B) intact |
| **T-20** | A row's answer still reaches a cell whose `className` is non-alignment (`"w-40"`) → `["align-top"]` | guards against over-narrowing |
| **T-21** | **The matrix T-6 never ran:** row `valign` × cell `valign` × `className` = **80 combinations**. Exactly one vertical class in every one — *and the right one*, checked against precedence expressed as code | the whole rule |
| **T-22** | The T-1/T-2 shapes inside a row that sets **no** `valign` still produce the exact strings T-1/T-2 pin | byte-identity re-guard |

**T-17 and T-18 redden against `main@ce47010`** — proven by mutation M-1 below, which restores the
shipped predicate and reddens exactly them (plus T-21). A regression test that does not fail against
the bug is not a regression test.

### 2.1 Why T-21 asserts more than "exactly one"

T-6 (CR-006) asserts only `toHaveLength(1)`. That would have passed on the defect — the buggy output
had exactly one vertical class, it was simply the **wrong** one. T-21 therefore computes the expected
winner from the precedence rule and asserts equality:

```
cell valign prop  >  cell className  >  row valign prop  >  "middle"
```

## 3. 🔴 The additive claim, measured — 1,536 shapes, byte-identical

Reproduces CR-006's method (`runs/change-06/output/test-results.md` §3), which the handover names as
reusable.

1. A throwaway spec rendered every caller shape across
   `cellValign{undefined,top,middle,bottom}` × `interactive{2}` × `rowClass{2}` ×
   `align{undefined,left,right,center}` × `numeric{2}` × `muted{2}` ×
   `className{undefined,w-40,align-top,align-bottom,align-middle,py-4}`, each inside a full
   `TableContainer > Table > TableHeader(TableHead ×2, one sortable) + TableBody` tree.
2. It dumped the **entire `container.innerHTML`** — classes, attributes, nesting, the lucide SVG, the
   `aria-sort` value — not just a class attribute.
3. Run once against this change's component; then `git show HEAD:src/components/Table.tsx` (verified
   `HEAD` = `ce470103e657d016e0dfe40ae63d9f38fa414df7` and the file contains the pre-fix
   `const askedForValign = resolvedValign !== undefined;` at line 249) was swapped in and it was run
   again; then the component was restored.
4. `diff bi-main.txt bi-new.txt` → **no output.**

| Group | What it is | Shapes | Result |
|---|---|---|---|
| **A** | **No `valign` anywhere** (row or cell) — i.e. **every existing caller in every consumer today** | **384** | **byte-identical** |
| **B** | A **cell** `valign` set, plain row — position (B) reached on the same condition as before | **1,152** | **byte-identical** |
| | | **1,536** | **byte-identical** |

Group A's 384 is the same figure CR-006 measured, which is the expected cross-check.

## 4. ⚠ Group 3 — the row-`valign` group, where behaviour deliberately changes

The plan (§4.3) declared this asterisk up front rather than letting a diff discover it. It was then
**measured**, not argued: 576 shapes of `row valign{top,middle,bottom}` × `cell valign{4}` ×
`align{4}` × `numeric{2}` × `className{6}`, dumped against both components and classified.

```
total shapes                : 576
identical string            : 456
class ORDER moved only      :  72   (same class set -> identical rendering)
RENDERING changed (the fix) :  48
shapes without exactly 1 vertical class: 0
```

🔴 **Every one of the 48 rendering changes is exactly the defect's shape** — and nothing else:

```
  16x  cell=undefined className=align-bottom
  16x  cell=undefined className=align-middle
  16x  cell=undefined className=align-top
```

That is the whole behavioural surface of this change: a cell with **no `valign` of its own** that
carries a **conflicting vertical utility in `className`**, inside a row that sets `valign`. Sample:

```
row=top cell=undefined align=undefined numeric=false className=align-middle
   main: px-3 py-2 text-left align-top       ← the bug
   new : px-3 py-2 text-left align-middle    ← the cell's own answer, restored
```

The 72 order-only moves are the second sub-case the plan declared — same classes, different order:

```
row=top cell=undefined align=undefined numeric=false className=undefined
   main: px-3 py-2 text-left align-top
   new : px-3 py-2 align-top text-left
```

Tailwind utilities are order-independent unless they conflict, and there is exactly one vertical
class either way — the same argument T-5 already records at `Table.test.tsx:256-260`. **Rendering is
identical.**

🔴 **Nobody is in group 3 yet** (§6), so no consumer can observe either sub-case today.

## 5. Mutation checks — 5 run, 5 caught

Each mutation was applied to `src/components/Table.tsx`, the Table suite was run, and the file was
restored from the index. Reported as run, per CR-006's M-3 precedent of reporting a miss as a miss —
**this round there was no miss.**

| # | Mutation | Specs that reddened | Caught |
|---|---|---|---|
| **M-1** | revert the predicate to `(valign ?? rowValign) !== undefined` — **the CR-006 defect, restored** | **T-17, T-18**, T-21 (3 failed) | ✅ |
| **M-2** | `cellAskedForValign = true` | T-1, T-2, **T-8**, T-12, T-17, T-18, T-21, T-22 (8 failed) | ✅ |
| **M-3** | `cellAskedForValign = false` | T-3, T-4, **T-7**, T-19, T-21 (5 failed) | ✅ |
| **M-4** | swap the two emission positions | 12 failed, incl. T-1, T-7, T-8 | ✅ |
| **M-5** | drop `?? rowValign` | **T-10**, T-11, T-12, T-18, T-20, T-21 (6 failed) | ✅ |

M-1 is the one that matters: it proves the new specs actually fail against the code that shipped.
M-3 — inert for CR-006 over a 320-row byte-identical diff — is **caught here**, because T-19 now
exercises position (B) inside a row that has asked.

The harness asserted that each mutation actually applied (`process.exit(9)` otherwise), so a
no-op edit could not be silently scored as "caught".

## 6. Blast radius today — zero screens, and that is measured, not assumed

| Check | Result |
|---|---|
| DC's pin (`bananaworld-dc/package.json:54`) | `#0633476…` — **CR-004's sha**, three changes behind. DC's build cannot see `TableRow.valign` at all |
| `grep -rni "valign"` across DC (ts/tsx/json, excluding node_modules) | **0 occurrences** — re-run this session |
| Any vertical utility inside a DC `TableCell` `className` | **none.** All 10 `align-*` hits are `<span>`s, except `SalesOrderForm.tsx:1024-1026`, which defines `const cell = "px-[1.125rem] py-2.5 align-top"` and applies it to **raw `<td>`s** (lines 1042, 1063, 1074, 1086, 1114, 1119). That file **does not import `TableCell` at all** — verified by grep |
| CRM / RMS / org-admin / Manga Verde | **not readable from a build worktree; not opened; nothing here claims they were.** All four are behind CR-006 by construction |

**Nobody can be hitting F1 yet.** That does not demote the finding — it means this is the one window
in which the fix costs nothing, before the first consumer bumps onto `ce47010` and writes the
combination.

## 7. Dependency audit

`pnpm audit` is **permission-blocked in this worktree** (handover note 11) and is **not claimed as
run**. CI's exact job (`ci.yml:68` — `pnpm audit --prod --audit-level=high`) was reproduced in Node
against the same npm bulk advisory endpoint.

🔴 **Three probes in a row have lied on their first run**, so this one asserted its own inputs before
it was allowed to reach a verdict, and printed the evidence for each:

```
S1  prod closure, deps + optionalDeps = 106
S1  prod closure, deps ONLY           =  66   (standing figure: ~70)
S1  sharp reachable only via optional edge = true
S2  nanoid in closure = 3.3.18                (the CR-002 D-12 override still doing its job)
S3  roots = 16, incl. next@15.5.19 (the auto-installed peer)
S4  advisories parsed = 13
S4  ids that are empty or non-GHSA = 0        ← the third check the handover demanded
```

**On S1, the number is explained rather than rounded to the familiar one.** The standing "~70" figure
matches the **deps-only** closure (66). The larger 106 follows `optionalDependencies` as well — which
is necessary here, because **`sharp` reaches this tree only through an optional edge** and carries one
of the six approved ignores. Dropping optional edges would have hidden it.

**S4 is the check that would have caught CR-006's probe**, which read a `github_advisory_id` field
that does not exist, got `""` for every id, matched nothing against the ignore list, and reported all
six owner-approved ignores as BLOCKING. Here the id is taken from `url`, and every one of the 13
parsed ids is non-empty and matches `/^GHSA-/`.

**Verdict — 6 high advisories, all six on the standing owner-approved ignore list, 0 new, 0 blocking:**

```
  IGNORED  GHSA-89xv-2m56-2m9x  high  next     SSRF in Server Actions on custom servers
  IGNORED  GHSA-m99w-x7hq-7vfj  high  next     DoS in App Router using Server Actions
  IGNORED  GHSA-p9j2-gv94-2wf4  high  next     SSRF in rewrites via attacker-controlled hostname
  IGNORED  GHSA-f88m-g3jw-g9cj  high  sharp    inherited libvips CVEs
  IGNORED  GHSA-6g55-p6wh-862q  high  postcss  arbitrary file read via sourceMappingURL
  IGNORED  GHSA-r28c-9q8g-f849  high  postcss  path traversal in source-map auto-loading
>>> BLOCKING (new, un-ignored high/critical): 0
>>> Audit gate would PASS
```

**Seven moderate advisories** sit below the `--audit-level=high` threshold and do not block. The
count and the set are **identical to CR-006's** — 6 high, 7 moderate, **0 new advisories since**.
Two are worth the owner's eye and are carried in `known-issues.md`, neither actionable by a change:
**GHSA-fxqj-rqcc-2cmp** (PostCSS, *incomplete fix of* `GHSA-6g55-p6wh-862q`, which **is** on the
ignore list — the handover's standing watch item) and **GHSA-qx2v-qp2m-jg93** (PostCSS XSS via
unescaped `</style>`).

🔴 **Nothing here rests on the dependency tree being untouched** (CR-002 made that mistake and CI
proved it wrong). `package.json` and `pnpm-lock.yaml` are byte-identical, and the closure was walked
and queried anyway.

## 8. What was NOT run, stated plainly

| Not run | Why |
|---|---|
| Any consumer app's test suite | Four of five consumer repos are **not readable from a build worktree**; DC is readable but **read-only** and cannot be built here. **Sixth change to record this.** No consumer suite was executed and nothing here claims one was |
| `pnpm audit` itself | permission-blocked; reproduced in Node instead, and labelled as a reproduction throughout |
| `pnpm lint` | **no `lint` script and no eslint config exist** in this repo — pre-existing drift, out of lane |
| `pnpm format:check` | **no prettier config exists**, so it fails repo-wide across all 48 `src/` files including ones this change never opened — pre-existing drift, out of lane, and **not a CI job** |
| `pnpm audit:deps` | **no such script exists** in this repo |
| A browser / visual check | This package ships TypeScript source only (`files: ["src"]`) and has no app shell to render. The rendering claim is made by whole-`innerHTML` diff instead, which is stronger than a screenshot |
| A throwaway Postgres | **This package has no database by construction.** No container was started, and none was left behind |
