# CR-DESIGN-SYSTEM-006 — a row of fields can line up along the top

> Logic plan. Written 2026-08-24 against `change/cr-design-system-006`, branched from `main` @ `fc6f6c6`
> (CR-DESIGN-SYSTEM-005 merged as PR #15).
> **Nothing has been built. No source file has been edited. No test has been run.**

<!-- OWNER-BRIEF-START -->

## What this gets you

On the customer system's order screen every order line is a row of boxes across the page — item,
container, quantity, unit, price, total. The item box carries a small stock note underneath it, so it
is taller than the rest, and today every other box floats to the middle of that extra height. The row
visibly sags: the fields sit lower than the item they belong to.

This lets a row be lined up along the **top** instead, so every field starts level with the item field.

## What I need you to decide

Three pictures are attached — how we should be able to ask for it:

- **A — my recommendation.** Ask once for the whole row, and still let one box opt out (a buttons
  column usually reads better centred).
- **B.** Ask box by box. Miss one and that box keeps sagging — the picture shows it.
- **C.** Ask once for a whole grid, no exceptions at all.

## Not included

No screen changes today. This only makes the setting exist; the customer system switches its order
screen over in its own separate piece of work, when it chooses. Nothing else is touched.

## Risk

Every list in every one of our systems is built from this one shared kit, so the real risk is moving
something nobody asked to move. The setting stays off unless asked for, and I will prove existing
screens come out identical — character for character — rather than assert it.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 1. What is true today — read from this worktree, not recalled

| # | Fact | Location |
|---|---|---|
| F-1 | `TableCell` hardcodes `align-middle` inside its base class string: `"px-3 py-2 align-middle"` | `src/components/Table.tsx:197` |
| F-2 | `TableCellProps.align?: Align` is **horizontal only** — `Align = "left" \| "right" \| "center"`; there is no vertical option anywhere in the file | `Table.tsx:107`, `:178` |
| F-3 | 🔴 **The alignment precedent, verbatim:** *"Emit exactly ONE alignment class so twMerge can't drop it (a stray default `text-left` previously overrode `numeric`'s `text-right`, mis-aligning numeric columns)."* `alignClass()` returns exactly one class on every path | `Table.tsx:109–113`, `:189–192` |
| F-4 | Class order in the cell is: base → `numeric` → `muted` → `alignClass(...)` → **`className` last**. twMerge keeps the LAST of two conflicting classes, so a caller's `className` currently wins over the base `align-middle` | `Table.tsx:196–202` |
| F-5 | `TableRowProps` has exactly one prop today (`interactive?: boolean`) and extends `HTMLAttributes<HTMLTableRowElement>` — which does **not** declare `valign` | `Table.tsx:84–87` |
| F-6 | `type Align` is **module-private — not exported**, yet is used in two exported interfaces. Precedent: a new union type needs no export | `Table.tsx:107` |
| F-7 | The barrel exports seven Table values + three Table types. A new optional field on an already-exported interface needs **no barrel edit** | `src/components/index.ts:34–46` |
| F-8 | ⚠ **This package has NO specs for `Table` at all.** `tests/components/` holds ChoiceGroup, Combobox, DataTableToolbar, DocumentHeader, Select, TablePagination, document-date, table-controls, table-paging — no `Table.test.tsx` | verified by directory listing |
| F-9 | The component-test project is `include: ["tests/components/**/*.test.tsx"]`, happy-dom — a new file there is picked up with no config change | `vitest.config.ts:21–28` |
| F-10 | `cn` = `twMerge(clsx(...))`; tailwind-merge v3 groups `align-baseline/top/middle/bottom/text-top/text-bottom/sub/super` as one conflicting `vertical-align` group | `src/lib/cn.ts`, `package.json` (`tailwind-merge@^3.6.0`) |
| F-11 | 🔴 **Bananaworld-DC's sales order grid does NOT use `TableCell`.** It hand-rolls `<td className={cell}>` with `const cell = "px-[1.125rem] py-2.5 align-top"`, commented *"align-top so every h-9 field lines up across the row (the price hint sits below its field without nudging the others)"* | `bananaworld-dc/src/components/sales-order/SalesOrderForm.tsx:1024–1033` (read-only) |
| F-12 | DC's only Table specs are behavioural (renders cells; `aria-sort`; `onSort`). **No DC test reads this file's source text and none asserts a cell's class string** | `bananaworld-dc/tests/unit/ui/table.test.tsx` (read-only) |
| F-13 | The string `valign` appears **nowhere** in Bananaworld-DC. The only `align-*` utilities there are `align-middle` on `<span>` elements and the `align-top` at F-11 | grep across the DC worktree (read-only) |
| F-14 | DC re-exports all seven Table symbols from `@bananaworld/design-system` through `@/components/ui`; **50 DC files reference `TableCell`** | `bananaworld-dc/src/components/ui/index.ts:44–54` (read-only) |
| F-15 | `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist, and there is no `governance/` directory | verified by search |

**F-11 is the finding that most shapes this plan.** DC hit this exact problem first — a taller first
cell with a hint under it — and solved it by **abandoning the primitive** and writing raw `<td>`s. That
is the cost of the missing option, already paid once in another lane. It is also the proof that the
option is not speculative.

**F-8 is the second.** There is nothing to break here and nothing to lean on: the change must bring
`tests/components/Table.test.tsx` into existence.

## 2. The design

### 2.1 A private union and a one-class helper — the `alignClass` precedent, mirrored exactly

```ts
type VAlign = "top" | "middle" | "bottom";

// Exactly ONE vertical-alignment class on every path — the same rule the horizontal `alignClass`
// above obeys, and for the same reason: twMerge keeps the last of two conflicting classes, so a
// second one emitted anywhere is a silent, invisible override waiting to happen.
function valignClass(valign: VAlign | undefined): string {
  if (valign === "top") return "align-top";
  if (valign === "bottom") return "align-bottom";
  return "align-middle";
}
```

`VAlign` stays **module-private**, exactly as `Align` is (F-6). Zero barrel movement.

### 2.2 `TableCellProps` gains one optional field

```ts
  /**
   * Vertical alignment. Defaults to "middle" — 🔴 AND THAT DEFAULT IS ESTATE-WIDE CONTRACT.
   * Five apps pin this package by sha; flipping it would move the contents of every table in the
   * estate at their next bump. The option is opt-in and nothing else.
   *
   * Set "top" when a row holds cells of unequal height — a field with a hint or a chip under it
   * makes its cell taller and every middle-aligned neighbour then sits visibly lower than it.
   */
  valign?: VAlign;
```

### 2.3 `TableRowProps` gains the same field, as a default for its own cells

```ts
  /** Vertical alignment for every cell in this row. A cell's own `valign` wins. */
  valign?: VAlign;
```

carried by a module-private context, mirroring `SurfaceContext`'s shape (`src/lib/SurfaceContext.tsx`):

```tsx
const RowValignContext = createContext<VAlign | undefined>(undefined);
```

`TableRow` renders `<RowValignContext.Provider value={valign}>` around its `<tr>` — **always**, even
when `valign` is `undefined`. A provider emits no DOM node, so the rendered HTML is untouched; always
providing means a row **resets** the value for anything nested inside it, so a table inside a cell of a
top-aligned row does not silently inherit that row's alignment. (Providing only when set was
considered: it keeps the React tree literally unchanged for existing tables, at the price of exactly
that leak. The leak's failure mode is *silent visual misalignment* — the bug this change exists to
fix — so correctness wins. Cost is one context read per row, value `undefined`, no consumer.)

### 2.4 `TableCell` — where the class is emitted, and why the position matters

```tsx
  const rowValign = useContext(RowValignContext);
  const resolved = valign ?? rowValign;         // the cell's own answer wins over its row's
  const vertical = valignClass(resolved);       // exactly one class, always
  const asked = resolved !== undefined;

  <td
    className={cn(
      "px-3 py-2",
      // Nobody asked: the default sits exactly where `align-middle` has always sat, so an existing
      // cell's class string is byte-identical — INCLUDING one that already overrides vertical
      // alignment through className, which today wins because className is emitted last.
      !asked && vertical,
      numeric && "tabular-nums",
      muted && "text-fg-subtle",
      alignClass(effectiveAlign),
      className,
      // Asked: emitted AFTER className so a stray utility in className cannot silently defeat the
      // prop. twMerge keeps the last of a conflicting pair, so the answer the caller asked for wins.
      asked && vertical,
    )}
    {...props}
  />
```

**Exactly one vertical class enters the list, in exactly one of two positions.** That is the whole
mechanism, and both positions are pinned by specs (§5 T-7, T-8) and by mutation (§5 M-2, M-3).

Why the two positions, stated plainly:

| Caller | Today | After | Same? |
|---|---|---|---|
| `<TableCell>` | `px-3 py-2 align-middle text-left` | identical | ✅ byte-identical |
| `<TableCell numeric>` | `px-3 py-2 align-middle tabular-nums text-right` | identical | ✅ byte-identical |
| `<TableCell className="align-top">` (today's only workaround) | `px-3 py-2 tabular-nums? text-left align-top` | identical | ✅ byte-identical — this is why the default is **not** moved to the end |
| `<TableCell valign="top">` | *impossible today* | `... text-left align-top` | new |
| `<TableCell valign="top" className="align-middle">` | *impossible today* | `align-top` — the prop wins | new |

### 2.5 🔴 The one residual risk in the name, declared rather than found later

`TableCellProps extends TdHTMLAttributes<HTMLTableCellElement>`, and React's `TdHTMLAttributes`
**already declares `valign?: "top" | "middle" | "bottom" | "baseline"`** — the deprecated HTML
presentational attribute. So today `<TableCell valign="top">` **compiles**, is spread onto the `<td>`
by `{...props}`, and is **visually inert** (the `align-middle` class beats a presentational attribute).
After this change that prop is destructured out, so such a caller loses a dead DOM attribute and gains
the alignment it literally asked for.

- This is **precisely the move the file already made once**: `align?: Align` shadows and consumes
  `TdHTMLAttributes.align` in exactly the same way. `VAlign` is a subset of the inherited union, so the
  narrowing typechecks.
- **DC is clean — zero occurrences of `valign` anywhere in the repo (F-13)**, across 50 files that use
  `TableCell` (F-14).
- 🔴 **CRM, RMS, org-admin and Manga Verde cannot be read from this worktree and were not opened.**
  Nothing here claims they were checked. The residual is one hypothetical caller passing a deprecated,
  currently-inert attribute; if one exists, it starts doing what its author asked for.
- **Mitigation, in the consumer's own lane:** each consumer greps `valign` before it bumps its pin —
  one line, recorded in the developer handover and in `SESSION_HANDOVER.md`.
- **Fallback if a live usage is ever found:** name it `verticalAlign` instead. That name is provably
  unreachable today (not in `TdHTMLAttributes`, no index signature, so passing it is a TypeScript
  error), i.e. zero residual — at the cost of asymmetry with `align`. Carried as OQ-2, **not** built.

The `TableRow` half carries **no** such risk: `HTMLAttributes<HTMLTableRowElement>` has no `valign`
(F-5), so no existing caller can be passing one.

### 2.6 What is deliberately NOT touched

- 🔴 **The default. `align-middle` remains the answer for every cell that does not ask.** Not
  negotiable and pinned by three specs.
- `alignClass`, `Align`, `align`, `numeric`, `muted` — untouched. Horizontal behaviour is not
  re-litigated; T-9 re-guards the original numeric bug.
- `TableHead` — **gains nothing.** Header cells are single-line by construction
  (`whitespace-nowrap`), no caller has asked, and widening two surfaces to answer one request is the
  configurability-in-anticipation this package has refused twice (CR-005 D-6, D-10). OQ-4.
- `TableContainer`, `Table`, `TableHeader`, `TableBody`, `sortIndicator`, `ariaSort` — untouched.
- **All three barrels** (`src/index.ts`, `src/components/index.ts`, `src/lib/index.ts`) —
  byte-identical. No new export, no moved symbol, no new type name.
- `package.json`, `pnpm-lock.yaml` — untouched. No new dependency.
- **Radix:** nothing here is an interactive control. `Table` is a plain semantic `<table>` primitive
  with no Radix underpinning today, this change adds no control, and nothing hand-rolled replaces one.
  The Radix rule has nothing to bite on.
- **No consumer file, no consumer pin, in any repo.** The sibling DC worktree is read-only and was
  read only.

## 3. Cross-app intersection map — who writes, who reads

| # | Seam | Who WRITES | Who READS | Decision |
|---|---|---|---|---|
| S-1 | The vertical alignment of every table cell in the estate | **This package** owns the default (`middle`) and the mechanism | DC, CRM, RMS, org-admin, Manga Verde — **each only after it bumps its own pin** | The package keeps the default; the consumer opts a specific row or cell in. Opt-in only; no consumer pin bumped here. |
| S-2 | The CRM sales order line grid | The CRM, in **its own** change | This package's new option | **Explicitly out of scope.** Two changes, two lanes, in order. The CRM moves against the **merged** `main` sha, never this branch's (KI-M001E19-002). |
| S-3 | DC's `tests/unit/ui/table.test.tsx` | DC | This package's behaviour | **Cannot redden.** All three specs are behavioural (render, `aria-sort`, `onSort`) and none reads source text or class strings (F-12). |
| S-4 | DC's 50 files using `TableCell` (F-14) | DC | This package's default | Unaffected — none passes `valign` (F-13), so `resolved` is `undefined` and the emitted string is byte-identical. Proof method in §6. |
| S-5 | `TdHTMLAttributes.valign` — a prop name this change takes over (§2.5) | This package | Any consumer that passes the legacy attribute | **Declared, not hidden.** DC proven clean; four repos unreadable from here. One-line grep at each consumer's bump; `verticalAlign` is the fallback name. |
| S-6 | The export surface (three barrels) | This package | All five consumers, at bump time | **No movement.** Two exported interfaces each gain one optional field; zero barrel edits. |
| S-7 | Database / migration | — | — | **None.** This package has no database by construction; this change is pure presentation. |

**Cross-system register:** `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no
`governance/` directory (F-15). **Sixth consecutive change to raise it** (CR-001 D-12, CR-002 D-10,
CR-003, CR-004, CR-005 D-12, here). Creating it is a governance decision for the owner, not something a
change may invent — the seams above are recorded here, in the estimate, and in the change's own
evidence pack instead. Carried as OQ-3.

## 4. Files expected to touch

| File | Change | Rough size |
|---|---|---|
| `src/components/Table.tsx` | `VAlign` + `valignClass()` (the `alignClass` twin); `RowValignContext`; `valign` on `TableRowProps` + its provider; `valign` on `TableCellProps` + the two-position emission; the composition example in the file header comment gains one line | **+45 / −4** |
| `tests/components/Table.test.tsx` | **NEW FILE** — the package's first Table specs (F-8) | **+185 / −0** |

**Two files. No barrel, no config, no `package.json`, no `pnpm-lock.yaml`, no new source file.**

The four `src/` deletions are the lines being rewritten in place (the base class string, the two
interface bodies' closing context, the `<td>` class list) and each is itemised at the gate.

Explicitly NOT touched: every other file under `src/`; every file in every consumer repo; any
`runs/epic-*/`, `milestone-NN/` or `runs/current/epic-plan/` path. This change lands in
`runs/change-06/` and creates no epic or milestone folder.

## 5. Testing plan

`pnpm test` runs **before any edit** to record the baseline (expected 246 passed / 13 files, per
CR-005's close), and again after.

🔴 **T-1 and T-2 are written and run GREEN against the untouched component first.** They assert the
exact class string of a plain, a numeric, a muted and a `className`-carrying cell. That converts the
additive claim from an argument into a regression test that existed before the diff did — which is the
only honest way to prove "byte-identical" for repos I cannot read.

| # | Spec | What it holds |
|---|---|---|
| T-1 | A cell with no props renders class **exactly** `px-3 py-2 align-middle text-left` | 🔴 The default, character for character. Written green pre-edit. |
| T-2 | The same exactness for `numeric`, for `muted`, for `align="center"`, and for `className="w-40"` | 🔴 Every existing shape of caller. Written green pre-edit. |
| T-3 | `valign="top"` → `align-top`, and no `align-middle` / `align-bottom` | The option works. |
| T-4 | `valign="bottom"` → `align-bottom` only | Completeness of the union. |
| T-5 | `valign="middle"` explicitly → `align-middle`, and the cell is otherwise identical to the default | Asking for the default is not a special case. |
| T-6 | 🔴 **Exactly one** `align-(top\|middle\|bottom)` class, asserted by regex match count, across every combination of `{undefined,top,middle,bottom}` × `{numeric}` × `{muted}` × `{className}` | **The `alignClass` precedent (F-3), applied to the vertical axis.** The bug this change was told not to reintroduce. |
| T-7 | `valign="top" className="align-middle"` → resolves to `align-top` | 🔴 **A caller's className cannot silently defeat the prop** — the request's explicit requirement. |
| T-8 | `className="align-top"` with **no** `valign` → resolves to `align-top` | Today's only workaround still behaves exactly as today. This is what pins the default's *position*, not just its value. |
| T-9 | `numeric` still right-aligns, and `align="right"` still wins, with and without `valign` | The original twMerge bug (F-3), re-guarded on the axis it actually happened on. |
| T-10 | `<TableRow valign="top">` → every `TableCell` inside is `align-top` without repeating the prop | The row-level answer. |
| T-11 | Row `valign="top"` + cell `valign="middle"` → the cell is `align-middle` | **The cell wins.** Option A's opt-out. |
| T-12 | A sibling row with no `valign` is `align-middle`; **and a nested `<Table>` inside a top-aligned row's cell has middle-aligned cells** | No leak, no bleed. Pins §2.3's always-provide decision. |
| T-13 | The rendered `<td>` has **no `valign` attribute** and the `<tr>` has none either | §2.5 — the prop is consumed, never passed through. Nobody re-adds it by accident. |
| T-14 | A `TableHead` inside `<TableRow valign="top">` carries no vertical-align class and is byte-identical to today | The scope fence, asserted. |
| T-15 | `<TableRow>` with no props renders class **exactly** `border-b border-border last:border-0`; with `interactive`, exactly today's string | The row half of the byte-identity proof. Written green pre-edit. |
| T-16 | The package root barrel still exports the same seven Table values and three Table types, same names | The export surface did not move. |

**Mutation checks — four deliberate breakages, each must be caught:**

| # | Mutation | Must fail |
|---|---|---|
| M-1 | Default flipped to `"align-top"` in `valignClass` | T-1, T-2 |
| M-2 | The default emitted at the END of the list instead of in place | T-8 |
| M-3 | `align-middle` left in the base string *and* the resolved class emitted | T-6 |
| M-4 | Row context made to win over the cell's own prop | T-11 |

## 6. Additive proof — what will actually be shown at the gate

1. **T-1, T-2 and T-15 committed and shown green against the unmodified component**, then green again
   after — the byte-identity claim as a test, not a sentence.
2. `git diff --numstat -- src/` — expected **+45 / −4**, every deletion itemised.
3. `git diff -- src/index.ts src/components/index.ts src/lib/index.ts` — expected **empty**.
4. `pnpm typecheck` clean; `pnpm test` green, with before/after spec counts. **No existing spec is
   edited** — there are no Table specs to edit (F-8), and no other component renders a `<td>`
   (verified: `<td` appears once in `src/`, in `Table.tsx`).
5. **Which existing callers were checked, and why they are unaffected:**
   - **Bananaworld-DC** — 50 files use `TableCell` (F-14). None passes `valign` (F-13, grep across the
     read-only worktree). `resolved` is `undefined` for every one, so the emitted string is the same
     string. Its sales order grid does not use `TableCell` at all (F-11), so it is untouched twice
     over. Its three Table specs are behavioural and cannot redden (F-12).
     🔴 **DC's suite was NOT run and nothing will claim it was** — consumer repos are not runnable from
     a build worktree. The argument above is a code argument, plus a read-only grep.
   - **CRM, RMS, org-admin, Manga Verde** — **not readable from here and not opened.** Their safety
     rests on the mechanism (a cell that passes nothing emits the identical string) plus T-1/T-2/T-15,
     with the single named residual at §2.5 / S-5. Stated as a limit, not papered over.
   - **This package's own suite** — 246 specs; none renders a `Table`. Nothing to regress.
6. A dependency audit reproduced in Node (`pnpm audit` is permission-blocked in build sessions), **read
   rather than trusted** — two probes in a row have lied on their first run (SESSION_HANDOVER note 10).
   Sanity checks: the prod closure is ~70 packages and `nanoid@3.3.18` must be present. 🔴 An unchanged
   dependency tree is **not** evidence of audit health.
7. **No migration** — this package has no database. **No consumer pin bumped.**

## 7. Open questions

| # | Question | Blocking? | Default if unanswered |
|---|---|---|---|
| OQ-1 | **The authoring shape — A, B or C** (§2.3, three rendered mockups). A: row-level default with a per-cell override. B: per-cell only. C: whole-grid only, no override. | **Decide-point at the gate.** | **A.** The bug is a property of the *row*; per-cell-only makes correctness depend on a caller never missing one of six cells, and the miss is silent (option B's mockup). The override exists because a buttons column genuinely reads better centred. |
| OQ-2 | Is any consumer passing the legacy `valign` attribute to `TableCell` today (§2.5)? **Unanswerable from here** for four of five repos. | No — DC is proven clean and nothing reaches an unbumped consumer. | Ship `valign`. Record the one-line grep each consumer runs at its own pin bump, and `verticalAlign` as the zero-residual fallback name if a live usage is ever found. |
| OQ-3 | Should this repo have `governance/CROSS_SYSTEM_CHANGE_REGISTER.md`? **Sixth consecutive change to ask.** | No. | Not created — a governance decision, not a change's to invent. Seams recorded in §3 and in the evidence pack. |
| OQ-4 | Should `TableHead` take `valign` too? | No — **out of scope.** | Not built. Header cells are single-line; no caller asked. One optional field away; recorded in `runs/change-06/technical-debt.md`. |
| OQ-5 | Should DC's hand-rolled sales-order `<td>`s (F-11) fold back onto `TableCell` now that the option exists? | No — **another repo's lane.** | Not touched, not planned here. Recorded in the developer handover as a DC-side opportunity for DC to take or refuse. |

## 8. Scope fences carried from the request

- 🔴 **The default stays `middle`.** The new option is opt-in and every existing caller renders
  byte-identically. Proved by T-1/T-2/T-15, not asserted.
- **Exactly one vertical-align class is emitted**, on every path — the file's own alignment precedent
  (F-3), and a `className` cannot silently defeat the prop (T-7).
- **No consumer file is edited and no consumer pin is bumped**, never against a branch sha
  (KI-M001E19-002). The CRM's adoption of top alignment is a **separate follow-up, out of scope.**
- The sibling `bananaworld-dc` worktree is **read-only**: read and cited by path and line, never
  written, staged, committed or formatted.
- No Radix control is added, replaced or hand-rolled.
- This is a **change**, landing in `runs/change-06/`. No epic, no milestone, no write into any archive.
- If the build finds the change cannot be made additively, it **stops and says so at the gate.** On
  the evidence in §1–§6 it can: two optional fields, one helper, one context, zero barrel movement.
