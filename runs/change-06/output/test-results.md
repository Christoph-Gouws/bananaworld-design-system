# Test results — CR-DESIGN-SYSTEM-006

> Every number below was produced by a command run in this session. Nothing is recalled or estimated.

## 1. Headline

| Gate | Command | Result |
|---|---|---|
| Baseline, **before any edit** | `pnpm test` | **246 passed / 13 files** — exactly the number the plan predicted |
| After the change | `pnpm test` | **263 passed / 14 files**, 0 failed, 0 skipped |
| New specs | — | **+17** (T-1 … T-16; T-16 is two specs) |
| **Existing specs edited** | — | **0** — there were no Table specs to edit (F-8), and no other `src/` component renders a `<td>` |
| Typecheck | `pnpm typecheck` | **clean**, before and after |

```
 Test Files  14 passed (14)
      Tests  263 passed (263)
```

## 2. The 17 specs, and what each holds

| # | Spec | Verdict |
|---|---|---|
| T-1 | a cell with no props renders **exactly** `px-3 py-2 align-middle text-left` | ✅ |
| T-2 | the same exactness for 7 shapes: `numeric`, `muted`, `align=center`, `align=right`, `align=left`+`numeric`, `className`, and numeric+muted+className | ✅ |
| T-3 | `valign="top"` → `px-3 py-2 text-left align-top`, one vertical class | ✅ |
| T-4 | `valign="bottom"` → `align-bottom` only | ✅ |
| T-5 | `valign="middle"` is not a special case — **same set of classes as the default** | ✅ |
| T-6 | 🔴 **exactly one** `align-(top\|middle\|bottom)`, across **80 combinations** of `{undefined,top,middle,bottom}` × `numeric` × `muted` × `{undefined,w-40,align-top,align-bottom,align-middle}` | ✅ |
| T-7 | 🔴 `valign="top" className="align-middle"` → `align-top` — **a className cannot silently defeat the prop** | ✅ |
| T-8 | 🔴 `className="align-top"` with **no** `valign` → `align-top` — today's only workaround is untouched. **This pins the default's POSITION, not just its value** | ✅ |
| T-9 | horizontal alignment untouched with and without `valign` (5 cases) — the original twMerge bug re-guarded | ✅ |
| T-10 | `<TableRow valign="top">` → all **6** cells `align-top` without repeating the prop | ✅ |
| T-11 | row `valign="top"` + cell `valign="middle"` → the **cell wins** (layout A's opt-out) | ✅ |
| T-12 | a sibling row **and a nested `<Table>` inside a top-aligned cell** are byte-identical to the default | ✅ |
| T-13 | the `<td>` carries **no `valign` attribute**, and neither does the `<tr>` | ✅ |
| T-14 | a `TableHead` inside `<TableRow valign="top">` is byte-identical to today, no vertical class | ✅ |
| T-15 | `<TableRow>` and `<TableRow interactive>` render **exactly** today's strings (3 shapes) | ✅ |
| T-16 | the root barrel still exports the same **7 Table values** and the **3 Table types** | ✅ (2 specs) |

### 2.1 🔴 Four of them were green BEFORE the feature existed

T-1, T-2, T-15 and T-16 were written against the **unmodified** component, run green, and
**committed in that state** as `f59f2c7` — before one character of `Table.tsx` moved. They are
unedited in the final tree and still green. That converts "every existing caller renders
byte-identically" from an argument into a regression test that pre-dates the diff, which is the only
honest way to make that claim for four repos this session cannot read.

## 3. 🔴 The additive claim, measured — 384 existing-caller shapes, byte-identical

The strongest proof available from here, and it was actually run:

1. A throwaway spec rendered **every prop shape that exists on `main`** — no `valign` anywhere —
   across `interactive` × `rowClass` × `align{undefined,left,right,center}` × `numeric` × `muted` ×
   `className{undefined,w-40,align-top,align-bottom,align-middle,py-4}` = **384 shapes**, each inside
   a full `TableContainer > Table > TableHeader(TableHead ×2, one sortable) + TableBody` tree.
2. It dumped the **entire `container.innerHTML`** — classes, attributes, nesting, the lucide SVG, the
   `aria-sort` value — not just a class attribute.
3. It was run once against this change's component, then again with `main@fc6f6c6`'s `Table.tsx`
   swapped in (`git show fc6f6c6:src/components/Table.tsx`, verified to contain **0** occurrences of
   `valign`), then the component was restored.
4. `diff legacy-main.txt legacy-new.txt` → **no output. 768 lines, byte-identical.**

Sample row, identical in both files:

```
interactive=false rowClass=undefined align=undefined numeric=false muted=false className=undefined
  …<tbody class=""><tr class="border-b border-border last:border-0">
    <td class="px-3 py-2 align-middle text-left">x</td></tr></tbody>…
```

And the case that matters most — today's only workaround, on a numeric cell — also identical:

```
align=undefined numeric=true muted=false className=align-top
  …<td class="px-3 py-2 tabular-nums text-right align-top">x</td>…
```

**This is the proof the request asked for: how it was proved, not that it is asserted.**

## 4. Mutation checks — 5 run, 4 caught, 1 reported as NOT caught

Each mutation was applied to `src/components/Table.tsx`, the suite was run, and the file was reverted
with `git checkout`.

| # | Mutation | Predicted | Actual | Verdict |
|---|---|---|---|---|
| M-1 | default flipped to `"align-top"` in `valignClass` | T-1, T-2 | **5 failed** — T-1, T-2, T-5, T-11, T-12 | ✅ **caught** |
| M-2 | the default emitted at the END of the class list instead of in place | T-8 | **4 failed** — T-1, T-2, T-8, T-12 | ✅ **caught** |
| M-3 | `align-middle` left in the base string **and** the resolved class also emitted | T-6 | **0 failed — 17 passed** | ❌ **NOT caught** — see §4.1 |
| M-4 | row context made to win over the cell's own prop | T-11 | **1 failed** — T-11 | ✅ **caught** |
| M-5 | *(added this session)* the vertical class emitted in **both** positions unconditionally | — | **4 failed** — T-1, T-2, T-8, T-12 | ✅ **caught** |

### 4.1 🔴 M-3 was not caught, and here is why — measured, not argued

M-3 is **not a behaviour change**. `cn` is `twMerge(clsx(...))`, and tailwind-merge v3 treats
`align-baseline/top/middle/bottom/…` as one conflicting group, so a duplicate `align-middle` sitting
*earlier* in the list is removed before the string is ever emitted. T-6 counts vertical classes in
the **final, post-twMerge** string — where there is still exactly one. The plan's prediction that T-6
would catch M-3 was wrong about the mechanism.

Rather than assert that, it was measured:

- A throwaway spec dumped the exact `<td>` and `<tr>` class attributes for the **full 320-row
  authoring matrix** (4 row-`valign` × 4 cell-`valign` × `numeric` × `muted` × 5 `className`).
- Dumped once from the shipped component and once from the M-3 mutant.
- `diff matrix-clean.txt matrix-m3.txt` → **no output. 320 rows, byte-identical.**

So M-3 is dead weight in the source, not a defect a user could ever see. **It is reported as
not-caught rather than rounded up to 4/4.**

**M-5 was added because M-3 left a real gap unproved**: the *positional* bug in the same family — the
vertical class emitted in both positions, so the copy after `className` overrides a caller's own
override. That one is a genuine, visible regression (today's `className="align-top"` workaround stops
working in five apps) and **T-8 catches it**.

## 5. Dependency audit

`pnpm audit` is **permission-blocked in build sessions** and is **not claimed as run**. It was
reproduced in Node against the same npm bulk advisory endpoint, over the production closure
(declared `dependencies` + the auto-installed `next` peer, resolved through `realpath`).

**Handover note 10's two sanity checks were applied FIRST, because two probes in a row have lied:**

```
PRODUCTION CLOSURE: 69 packages
SANITY 1 — closure size ~70: 69  OK
SANITY 2 — nanoid present: nanoid@3.3.18
```

Both pass — and `nanoid@3.3.18` confirms the `nanoid@<3.3.17` override (D-12, CR-002) is still doing
its job.

**Verdict — 6 high advisories, all six on the standing owner-approved ignore list, 0 new, 0 blocking:**

```
  [ignored] next@>=12.0.0 <15.5.21  high  GHSA-p9j2-gv94-2wf4  Next.js: SSRF in rewrites…
  [ignored] next@>=13.0.0 <15.5.21  high  GHSA-m99w-x7hq-7vfj  Next.js: DoS in App Router…
  [ignored] next@>=14.1.1 <15.5.21  high  GHSA-89xv-2m56-2m9x  Next.js: SSRF in Server Actions…
  [ignored] postcss@<=8.5.11        high  GHSA-6g55-p6wh-862q  PostCSS: arbitrary file read…
  [ignored] postcss@<=8.5.17        high  GHSA-r28c-9q8g-f849  PostCSS: path traversal…
  [ignored] sharp@<0.35.0           high  GHSA-f88m-g3jw-g9cj  sharp/libvips CVEs
VERDICT: 0 blocking, 6 on the standing ignore list.
```

🔴 **This probe also lied on its first run** — it read a `github_advisory_id` field that does not
exist in that endpoint's response, got `""` for every id, matched nothing against the ignore list and
reported **all six as BLOCKING**. The id actually lives in `url`. Caught by reading the output
instead of the verdict — the id column was empty. Logged as `defect-log.md` **D-1**. Third probe in
a row to be wrong first time.

**Seven moderate advisories sit below the `--audit-level=high` threshold and do not block.** One is
worth the owner's eye and is carried in `known-issues.md` D-1: **GHSA-fxqj-rqcc-2cmp**, *"PostCSS:
incomplete fix of GHSA-6g55-p6wh-862q"* — an incomplete fix of an advisory that **is** on the
standing ignore list. Moderate, so neither CI nor this change is blocked by it, and changing the
ignore list is an owner decision, not a change's to make.

🔴 **An unchanged dependency tree is not evidence of audit health** (CR-002 learned this) — nothing
here rests on the tree being untouched. `package.json` and `pnpm-lock.yaml` are byte-identical, and
the closure was walked and queried anyway.

## 6. What was NOT run, stated plainly

| Not run | Why |
|---|---|
| **Any consumer app's test suite** (DC, CRM, RMS, org-admin, Manga Verde) | Consumer repos are not runnable from a build worktree. **Sixth change to record this.** The DC argument in §3 and in `qa-report.md` is a *code* argument plus a read-only grep — nothing claims a DC suite was executed |
| CI | Not waited for, by instruction. The conductor polls and merges |
| `pnpm lint` | **No `lint` script and no eslint config exist in this package** (`known-issues.md` C-1) |
| `pnpm audit:deps` | **No such script in this repo** (`known-issues.md` C-3) |
| `pnpm audit` | permission-blocked; reproduced in Node instead, above |
| Any migration | **This package has no database.** No file written, nothing classified, nothing promoted |
| Throwaway Postgres | **Never started** — nothing to test against. No container running, none stopped, port 5433 never held |
| Visual/browser verification | No screen exists here; this is a source-only, sha-pinned library. See `deployed-verification.md` |
