# Implementation summary — CR-DESIGN-SYSTEM-006

> A row of fields can line up along the top. Built 2026-08-24 on `change/cr-design-system-006`,
> branched from `main` @ `fc6f6c6` (CR-DESIGN-SYSTEM-005 merged as PR #15).

## 0. Plan-vs-code confirmation — required first line

**Fourteen of the plan's fifteen cited facts were re-read in this worktree and are exact; the
fifteenth (F-14) is a count that was overstated and does not touch the approved approach, so it is
recorded in `known-issues.md` A-1 and the build carried on.** Nothing the plan relies on had moved:
`main` is still at `fc6f6c6`, and the pre-edit baseline was **246 passed / 13 files**, exactly the
number the plan predicted.

| Fact | Verified | Note |
|---|---|---|
| F-1 `TableCell` hardcodes `align-middle` in `"px-3 py-2 align-middle"` | ✅ exact | `Table.tsx:197` |
| F-2 `align` is horizontal only; no vertical option anywhere | ✅ exact | `:107`, `:178` |
| F-3 the one-class alignment precedent, verbatim | ✅ exact | `:189–192` |
| F-4 class order base → numeric → muted → `alignClass` → `className` LAST | ✅ exact | `:196–202` |
| F-5 `TableRowProps` has exactly one prop; `HTMLAttributes` declares no `valign` | ✅ exact | `:84–87` |
| F-6 `Align` is module-private | ✅ exact | `:107` |
| F-7 barrel exports 7 Table values + 3 Table types | ✅ exact | `components/index.ts:34–46` |
| F-8 **no Table specs exist in this package** | ✅ exact | `tests/components/` listing |
| F-9 component project picks up a new file with no config change | ✅ exact | `vitest.config.ts:21–28` |
| F-10 `cn` = `twMerge(clsx())`; tailwind-merge v3 groups vertical-align | ✅ exact | `lib/cn.ts`, `tailwind-merge@^3.6.0` |
| F-11 DC's sales order grid hand-rolls `<td>` with `align-top` | ✅ exact | `SalesOrderForm.tsx:1026` (comment `:1024–1025`) |
| F-12 DC's Table specs are behavioural; none reads a class string | ✅ exact | `tests/unit/ui/table.test.tsx` |
| F-13 **`valign` appears nowhere in DC** | ✅ exact — **0 occurrences** across `src` + `tests` | the fact the additive claim rests on |
| F-14 "50 DC files reference `TableCell`" | ⚠ **39** in `src` (40 incl. tests) | overstated; see `known-issues.md` A-1 |
| F-15 no `governance/CROSS_SYSTEM_CHANGE_REGISTER.md`, no `governance/` dir | ✅ exact | sixth change to raise it |

**F-14 is a magnitude, not a premise.** What the plan actually leans on is F-13 — that *none* of
those files passes `valign` — and that was re-run and is zero. 39 or 50, the emitted class string is
the same string.

## 1. What was built

Two optional fields, both defaulting to `"middle"`, plus one private helper and one private context.

```tsx
<TableRow valign="top">            {/* asked once for the whole row */}
  <TableCell>item</TableCell>
  <TableCell valign="middle">…</TableCell>   {/* one column opts back out */}
</TableRow>
```

Owner-approved **layout A**: a row-level default with a per-cell override.

| Piece | Where | What |
|---|---|---|
| `type VAlign = "top" \| "middle" \| "bottom"` | `Table.tsx` | **module-private**, exactly as `Align` is (F-6). No barrel movement. |
| `valignClass(valign)` | `Table.tsx` | the `alignClass` twin: **exactly ONE** vertical class on every path |
| `RowValignContext` | `Table.tsx` | module-private; how a row reaches its own cells |
| `TableRowProps.valign?` | `Table.tsx` | the row's default for its cells |
| `TableCellProps.valign?` | `Table.tsx` | the cell's own answer; **wins over the row's** |
| `tests/components/Table.test.tsx` | NEW | this package's **first** Table specs (F-8) — 17 of them |

### 1.1 The mechanism, and why the position of the class matters

`TableCell` emits the vertical class in **exactly one of two positions**, never both:

```tsx
"px-3 py-2",
!askedForValign && vertical,   // NOBODY ASKED — sits exactly where `align-middle` always sat
numeric && "tabular-nums",
muted && "text-fg-subtle",
alignClass(effectiveAlign),
className,
askedForValign && vertical,    // ASKED — after className, so a stray utility can't defeat the prop
```

- **Nobody asked** → the class sits where it has always sat, so an existing cell's string is
  byte-identical — *including* a cell that overrides vertical alignment through `className`, which
  wins today only because `className` is emitted last. That is what T-8 pins.
- **Asked** → the class is emitted *after* `className`, so twMerge (which keeps the last of a
  conflicting pair) resolves to what the caller asked for. That is what T-7 pins.

Both positions are pinned by specs and proved to bite by mutation (M-2 and M-5 respectively).

### 1.2 Why the row provides its context ALWAYS, even when `valign` is undefined

A provider renders no DOM node, so the HTML is identical either way. Always providing means a row
**resets** the value for anything nested inside it — so a `<Table>` inside a top-aligned row's cell
does not silently inherit that row's alignment. The alternative (provide only when set) keeps the
React tree literally unchanged for existing tables, at the price of exactly that leak; the leak's
failure mode is *silent visual misalignment*, which is the bug this change exists to fix, so
correctness won. Pinned by T-12.

### 1.3 The prop-name collision, handled rather than discovered later

`TdHTMLAttributes` already declares the deprecated presentational `valign`, so `<TableCell
valign="top">` **compiled before this change**, was spread onto the `<td>`, and was visually inert
(the `align-middle` class beat the attribute). It is now destructured out — **the same move the file
already made for `align`**, which shadows `TdHTMLAttributes.align` identically. `VAlign` is a subset
of the inherited union, so the narrowing typechecks. **DC is proven clean: zero occurrences (F-13.)**
The four repos that cannot be read from here are named as unchecked in `known-issues.md` B-1 and in
the developer handover, with the one-line grep each owes at its own pin bump.

## 2. The additive claim, measured

| Proof | Result |
|---|---|
| All three barrels | `git diff fc6f6c6 -- src/index.ts src/components/index.ts src/lib/index.ts` prints **nothing** |
| `src/` diff | **+77 / −13**; ignoring whitespace **+67 / −3** — only **3 real deletions**, itemised in `changed-files.md` §1; the other 10 are the `<tr>` block re-indented two spaces inside the provider |
| Pre-edit regression test | T-1/T-2/T-15/T-16 written and committed **GREEN against the unmodified component** (`f59f2c7`), still green after, **unedited** |
| 🔴 Full existing-caller render diff | **384 caller shapes** rendered against `main@fc6f6c6`'s component and against this one, comparing the **whole `innerHTML`** — **byte-identical**. `test-results.md` §3 |
| Existing specs edited | **0** — there were no Table specs to edit (F-8), and no other component in `src/` renders a `<td>` |
| Default changed? | **No.** `align-middle` remains the answer for every cell that does not ask |
| Field removed / export moved / default changed | **none, none, none** |

## 3. What was deliberately NOT touched

`alignClass`, `Align`, `align`, `numeric`, `muted`, `TableHead` (OQ-4 → `technical-debt.md` TD-1),
`TableContainer`, `Table`, `TableHeader`, `TableBody`, `sortIndicator`, `ariaSort`; all three
barrels; `package.json`; `pnpm-lock.yaml`; every other file under `src/`; **every file in every
consumer repo**; any `epic-NN/`, `milestone-NN/` or `runs/current/epic-plan/` path.

**No consumer pin was bumped and none may be from here.** The CRM opts its sales order grid into top
alignment in **its own change, against the MERGED `main` sha** — never this branch's
(KI-M001E19-002). DC's hand-rolled `<td>`s (F-11) are DC's lane to fold back or refuse (OQ-5).

**Radix:** nothing here is an interactive control. `Table` is a plain semantic `<table>` primitive
with no Radix underpinning today; this change adds no control and hand-rolls no replacement for one.

## 4. Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | **clean** |
| `pnpm test` | **263 passed / 14 files** (baseline **246 / 13**); +17 new, 0 edited, 0 failed, 0 skipped |
| Mutation | **5 run, 4 caught, 1 (M-3) proven observationally inert** across a 320-row byte-identical matrix — reported as not-caught rather than rounded up. `test-results.md` §4 |
| Dependency audit | **6 highs, all six on the standing owner-approved ignore list, 0 new, 0 blocking.** The probe **lied on its first run** and was corrected — `defect-log.md` D-1 |
| Migration | **N/A — this package has no database.** Nothing written, nothing classified, nothing promoted |
| Throwaway Postgres | **never started.** No running container, no stopped container, no port held |
| `pnpm lint` | **no `lint` script and no eslint config exist in this package** — pre-existing, `known-issues.md` C-1 |
| `pnpm audit:deps` | **no such script in this repo** — `known-issues.md` C-3 |
| `pnpm format:check` | Pre-existing repo-wide drift: **all 48 `src/` files fail, including files this change never opened** (verified on `Button.tsx`). No prettier config; not a CI job. `known-issues.md` C-2 |
