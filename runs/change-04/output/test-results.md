# Test results — CR-DESIGN-SYSTEM-004

> Stage 04. Every number below was produced by a command run in this session and is quoted from its
> output. Nothing here measures speed, and nothing may claim it does (D-1).

## 1. Headline

| Gate | Command | Result |
|---|---|---|
| Tests | `pnpm test` | **235 passed / 13 files** · 0 failed · 0 skipped |
| Baseline before any edit | `pnpm test` at `fc2c5b8` | **189 passed / 11 files** |
| This change's contribution | — | **+46 specs, +2 files** |
| Existing specs edited | — | **0** |
| Typecheck | `pnpm typecheck` (`tsc --noEmit`) | **clean** — 0 diagnostics |

```
 Test Files  13 passed (13)
      Tests  235 passed (235)
```

The 189 that existed pass **unchanged, with no existing spec edited**. That is the additive claim in
its cheapest form: 189 → 235 with a `+24 / −0` source diff.

## 2. The new specs — 46, in two files

| File | Specs | What it pins |
|---|---|---|
| `tests/components/table-paging.test.tsx` | **16** | the arithmetic: sizes, boundaries, the offset invariant, junk input |
| `tests/components/TablePagination.test.tsx` | **30** | the control: picker, arrows, range text, keyboard, the two placements |

Both import **from the package root** (`../../src`), not from the deep file — spec 17 of the plan. A
control a consumer cannot reach from `@bananaworld/design-system` has not shipped, whatever is on
disk. This also proves all three barrel appends in one line each.

## 3. The arithmetic — `table-paging.test.tsx` (16)

| Plan spec | Assertion | Verdict |
|---|---|---|
| 1 | `TABLE_PAGE_SIZES` is exactly `[25, 50, 100, 200]`, in order | PASS |
| 1 | first page at **each of the four sizes** reports `from`/`to`/`offset`/`pageCount` | PASS |
| 1 | last page at each of the four sizes reports `from`/`to`/`isLast` | PASS |
| **2** | **exact multiple** — 100 rows at 25 is **four pages, not five**; page 4 → `76–100`, `isLast`; asking for page 5 clamps back to 4 | PASS |
| **3** | **remainder** — 312 at 25 is 13 pages; page 13 → `301–312`, **twelve rows**, never padded to 325 | PASS |
| **4** | **total 0** → `pageCount 1`, `from 0`, `to 0`, `isFirst` and `isLast` both true (asserted as a whole object, so no field can drift) | PASS |
| 5 | total 1, and total below the page size → one page, both arrows dead | PASS |
| 5 | last page holding a **single row** → `313–313` | PASS |
| 6 | first / middle / last are distinguished | PASS |
| **7** | `offset === (page − 1) × pageSize` on the page actually in force, over 7 cases | PASS |
| **7** | **`offset + 1 === from` whenever `total > 0`** — the invariant that keeps the bar and the query in agreement (D-12) | PASS |
| 8 | page 0 and page −5 clamp up to 1 | PASS |
| 8 | **page 9 of 4 clamps down to page 4** and reports `76–100`, `isLast` | PASS |
| 8 | `NaN`, `Infinity` and a non-integer page all take page 1; `NaN`/`Infinity` page size takes 1 | PASS |
| 8 | page size 0 or negative clamps to 1 rather than dividing by zero | PASS |
| 8 | a negative or non-finite total is nothing to show | PASS |

## 4. The control — `TablePagination.test.tsx` (30)

### The page-size picker (plan specs 9, 15) — 4

- is a **labelled combobox** (`getByRole("combobox", { name: "Rows per page" })`) reading the size in
  force — the "labelled control" requirement, asserted by role and accessible name, not by class.
- opening it lists **exactly the four sizes, in order**.
- 🔴 choosing **100 from page 7** emits **one** call carrying **both** fields with the page reset:
  `{ page: 1, pageSize: 100 }` (D-5, D-6). One call, not two; page 1, not 7.
- a consumer's own `pageSizes` list is honoured without inventing one.

### The arrows (specs 10, 11) — 6

first page disables Previous · last page disables Next · **total 0 disables both** · Next on page 1
emits `{ page: 2, pageSize: 50 }` with the size carried through · Previous on page 2 emits
`{ page: 1, pageSize: 50 }` · **a disabled arrow emits nothing when clicked**.

### The range text at every boundary (spec 12) — 5

| Case | Asserted string | Verdict |
|---|---|---|
| 312 rows, page 1, size 25 | `Showing 1–25 of 312` | PASS |
| the remainder | `Showing 301–312 of 312` | PASS |
| **exact multiple** | `Showing 76–100 of 100` | PASS |
| **total zero** | `Showing 0 of 0` | PASS |
| a last page holding one row | `Showing 313–313 of 313` — left literal, not collapsed (D-8) | PASS |

### Text, not an aria afterthought (spec 13) — 1

`getByRole("status").textContent` **is** the visible string, character for character, and the element
carries **no `aria-label`** — so there is nothing that can drift from what is on the screen.

### Keyboard (spec 14) — 4

Tab reaches the picker, then Next, **skipping the disabled Previous** on page 1 · Tab reaches picker →
Previous → Next in visual order when both are live · **Enter on Next pages forward** · **no positive
`tabIndex` anywhere** in the two-bar tree — document order is the order.

### A stale page (spec 16, D-7) — 1

🔴 page 9 of 4 renders `Showing 76–100 of 100` with Next disabled and **emits nothing on mount**. This
is the spec that stops someone "helpfully" adding a self-correcting callback and creating a re-render
loop.

### The two placements (specs 18, 19, 21, 22) — 5

🔴 `placement="bottom"` renders **no picker at all** — asserted by absence (D-20) · the bottom bar
carries the arrows only, **no `status` role and no "Showing" text anywhere** (layout A) · the bottom
bar's arrows work and its disabled states match the top bar's on the same props · `placement` defaults
to the **complete** bar, so a one-bar consumer never gets orphan arrows · the two bars are
distinguishable to a screen reader: `getByRole("navigation", { name: /end of list/i })` finds the
bottom one and `"List paging"` the top.

### 🔴 Exactly one live region per list (spec 20, D-19) — 1

Both bars rendered around one table yield **`getAllByRole("status").length === 1`**, and the top bar
contains it. This is the assertion that stops a screen reader announcing every page change twice — the
one genuinely new risk the owner's two-bar layout introduces.

### The two bars driven by one state (spec 23) — 3

Keyboard order across the whole list is `25 → Previous → Next → the row → Previous → Next` · paging
from the **bottom** bar moves the **top** bar's count (`Showing 1–25` → `Showing 26–50`) — one state,
never two · changing the size from the top bar resets **both** bars to page 1.

## 5. The additive proof (plan specs 24, 25)

| Proof | Result |
|---|---|
| The 189 existing specs, **unmodified**, still pass | ✅ 189 / 189, including every `Table`, `DataTableToolbar` and `table-controls` spec |
| The committed toolbar snapshot's sha256 | `ce7bd849…` — **identical to `HEAD`**, and `git diff` reports no content change |
| `git diff --numstat -- src/` | **+24 / −0** across three barrels. **Zero deletions, zero modified lines** — there was nothing to itemise |
| New files' effect on existing callers | Two files nothing imported before. No existing symbol is called, widened, defaulted differently, renamed or moved |

## 6. Standalone-build proof (plan spec 26)

`pnpm typecheck` runs `tsc --noEmit` with **no app path alias**, so an `@/…` import cannot resolve
and would fail the gate. It is clean. Neither new file imports anything outside this package other
than `react` and `lucide-react`, both already dependencies.

## 7. Dependency audit — run, not reasoned about

CI's job is `pnpm audit --prod --audit-level=high`. **`pnpm audit` is permission-blocked in this
session** (SESSION_HANDOVER §8) and is **not** claimed to have been run. It was reproduced in Node
against npm's bulk advisory endpoint over the installed tree (126 unique package names across 145
installed versions), with this repo's six owner-approved `ignoreGhsas` applied:

```
probing 126 packages
ignored  high  next     >=14.1.1 <15.5.21  GHSA-89xv-2m56-2m9x  SSRF in Server Actions on custom servers
ignored  high  next     >=13.0.0 <15.5.21  GHSA-m99w-x7hq-7vfj  DoS in App Router using Server Actions
ignored  high  next     >=12.0.0 <15.5.21  GHSA-p9j2-gv94-2wf4  SSRF in rewrites
ignored  high  postcss  <=8.5.11           GHSA-6g55-p6wh-862q  arbitrary file read via sourceMappingURL
ignored  high  postcss  <=8.5.17           GHSA-r28c-9q8g-f849  path traversal in source-map auto-loading
ignored  high  sharp    <0.35.0            GHSA-f88m-g3jw-g9cj  inherited libvips CVEs

NO BLOCKING HIGH/CRITICAL ADVISORIES
```

Six highs, and they are **exactly** the six standing owner-approved ignores — no seventh, no new
advisory. `nanoid` resolves to **3.3.18**, clean, via CR-002's `pnpm.overrides` already in this
branch's base. **This change adds no dependency and edits neither `package.json` nor
`pnpm-lock.yaml`.** CI's own job remains the authoritative gate. The probe script was deleted.

## 8. Not run here, and why — no claim is made either way

| Not run | Why | Where it is covered |
|---|---|---|
| DC / CRM / org-admin / RMS suites | Those repos are not checked out in this worktree and cannot be reached from it (permission-blocked). **No consumer suite was executed and nothing claims one was** — fourth change to record this | `deployed-verification.md` §3 |
| `pnpm lint` | **There is no `lint` script and no eslint config in this package.** `pnpm lint` fails with `Command "lint" not found` — recorded, not invented | `known-issues.md` C-2 |
| `pnpm format:check` | Pre-existing repo-wide drift: there is **no prettier config**, so the default 80-column width disagrees with the repo's ~100-column house style. Verified this session — `Button.tsx`, `Select.tsx`, `Table.tsx` and `table-controls.ts`, all **untouched by this change**, fail it at `HEAD` exactly as the new files do. Not a CI job | `known-issues.md` C-1 |
| Throwaway Postgres | **Never started.** This package has no database, no migration and no query. Nothing to rehearse, nothing left behind, no port held | `deployed-verification.md` §2 |
| A browser | No browser or deployed instance in this lane. The control is proved in happy-dom against Radix's real DOM output — roles, accessible names, focus order and disabled states, not screenshots | `deployed-verification.md` §4 |
| Anything measuring speed | **Nothing is slow today and the owner said so.** There is no performance claim to test (D-1) | — |
