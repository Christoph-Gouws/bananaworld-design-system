# Developer handover — CR-DESIGN-SYSTEM-006

> For the next session in this package, and for each consumer lane. Read §1 and §2 before touching
> `Table.tsx` or bumping a pin.

## 1. 🔴 The trap in this change — read before editing `TableCell`

The change looks like two optional props. It is really **one prop and one invariant about WHERE a
class is emitted**, and the invariant is the part that will bite.

`TableCell` emits **exactly one** vertical-align class, in **exactly one of two positions**:

```tsx
"px-3 py-2",
!askedForValign && vertical,   // (A) NOBODY ASKED — in place, where align-middle always sat
numeric && "tabular-nums",
muted && "text-fg-subtle",
alignClass(effectiveAlign),
className,
askedForValign && vertical,    // (B) ASKED — after className, so the prop wins
```

| Position | Why it must stay there | Spec | Mutation |
|---|---|---|---|
| **(A) in place** | `cn` is `twMerge(clsx(...))` and twMerge keeps the **last** of two conflicting classes. Today a caller writing `className="align-top"` beats the base `align-middle` — that is the **only** way to top-align a cell before this change, and it is certainly written somewhere across five pinned apps. Move the default to the end and every one of them silently reverts to middle | **T-8** | **M-2** — 4 specs redden |
| **(B) after `className`** | So a stray utility in `className` cannot silently defeat an explicit `valign`. This was an explicit requirement of the request | **T-7** | **M-5** — 4 specs redden |

🔴 **Collapsing these into one position is the obvious "cleanup" and it breaks one contract or the
other while keeping T-1 green.** It is fenced by comments on both lines, in `known-issues.md` D-2, and
in `simplification-opportunities.md` S-1. Do not do it.

**Two more things not to do:**

- **Do not flip the default to `top`.** `align-middle` is estate-wide contract across DC, CRM, RMS,
  org-admin and Manga Verde. Mutation M-1 reddens five specs.
- **Do not read the context conditionally.** `valign ?? useContext(RowValignContext)` **short-circuits
  and calls a hook conditionally**. The context must be read unconditionally into `rowValign` first.

## 2. 🔴 What each consumer owes before it bumps its pin

**One line, per repo, before the bump:**

```
grep -rn "valign" src
```

**Why:** React's `TdHTMLAttributes` already declares the deprecated presentational `valign`
attribute. So `<TableCell valign="top">` **compiled before this change**, was spread onto the `<td>`,
and was visually inert (the `align-middle` class beat it). After this change the prop is consumed and
**does what it says**. A caller passing the legacy attribute therefore starts getting the alignment it
literally asked for.

| Repo | State |
|---|---|
| **Bananaworld-DC** | ✅ **Proven clean — 0 occurrences repo-wide**, across 39 files that use `TableCell`. Nothing to do |
| **CRM, RMS, org-admin, Manga Verde** | ⚠ **Not readable from a build worktree and not opened.** Each owes the grep at its own bump. Nothing claims they were checked |

**If a live usage is ever found:** do **not** patch around it. The fallback is to rename the prop to
`verticalAlign`, which is provably unreachable today (not in `TdHTMLAttributes`, no index signature →
passing it is a TypeScript error), i.e. **zero residual**. Carried in `technical-debt.md` TD-3, not
built, because it costs the symmetry with the existing `align` prop.

## 3. The two-lane sequence — do not over-report this

**This change does not fix the CRM's sales order grid.** It makes the option exist. In order:

1. ✅ **This change merges to `main`.** (You are here.)
2. ⬜ **The CRM bumps its pin** to the **MERGED `main` sha — never this branch's sha.** That mistake
   has a name in this estate: **KI-M001E19-002**.
3. ⬜ **The CRM opts its sales order line grid into `valign="top"`**, in its own change. Only at step 3
   does the misaligned row the owner reported actually line up on screen.

**No consumer pin was bumped here and none may be bumped from here.**

### For DC specifically (optional, DC's call)

DC hit this exact problem first and solved it by **abandoning the primitive**: `SalesOrderForm.tsx:1026`
hand-rolls `<td className={cell}>` with `const cell = "px-[1.125rem] py-2.5 align-top"` and a comment
explaining why. Now that `TableCell` supports it, DC *may* fold those back onto the primitive
(`<TableRow valign="top">` + `<TableCell>`). **That is DC's lane to take or refuse** — it is recorded
as OQ-5 and nothing here depends on it. DC is red nowhere today and needs no action at all.

## 4. What the next session in THIS package should know

1. **This package now has Table specs — 17 of them, in `tests/components/Table.test.tsx`, where there
   were none before.** Four (T-1, T-2, T-15, T-16) were committed **green against the unmodified
   component** as `f59f2c7`. They pin exact class strings for the default cell, the row, and the
   export surface. **Narrow them if you must; never relax them.**
2. **The additive claim is now reproducible, not rhetorical.** The method — render every existing
   caller shape against `git show <main-sha>:src/components/Table.tsx` and diff the whole `innerHTML`
   — is written up in `test-results.md` §3. **Reuse it.** It is the strongest proof available from a
   worktree that cannot run any consumer, and it costs about ten minutes.
3. 🔴 **A future audit probe must assert every advisory id is non-empty and matches `/^GHSA-/` before
   comparing.** Three probes in a row have been wrong on their first run, and this one's bug was
   *downstream* of the two existing sanity checks (closure ≈70 packages, `nanoid@3.3.18` present) —
   both of which passed while the verdict was wrong. `defect-log.md` D-1. Consider asking the owner to
   either grant `pnpm audit` in build sessions or check the probe in (`technical-debt.md` TD-5).
4. **`TableHead` still has no `valign`** (TD-1) and `VAlign` has no `"baseline"` (TD-2). Both are one
   additive field away. Neither was built because nobody asked.
5. **Pre-existing drift, all out of lane, all re-verified this session:** no `lint` script and no
   eslint config; `pnpm format:check` fails on **all 48 `src/` files including untouched ones** (no
   prettier config, not a CI job); no `audit:deps` script; `ci.yml`'s test job label is stale.
6. **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist** — **sixth** consecutive
   change to raise it. A governance decision for the owner, not a change's to invent.
7. ⚠ **The read-only `bananaworld-dc` worktree had a file modified at 18:00, during this session, by
   another process** (`runs/current/logic-plan/EPIC-025-M-06.md`, a DC epic plan about label
   printers). **This session issued reads only against DC.** Disclosed in `known-issues.md` A-2 so the
   conductor's fingerprint check is not misread as a lane violation here.
8. **Still open from earlier changes, none affected by this one:** the CRM's pin bump + `dcLabel`
   adoption (CR-005, which unblocks CR-CRM-015); DC's pin bumps for CR-002 and CR-004, then CR-DC-052;
   the CRM's seven-point saved-view obligation (CR-003); CR-001's colour-stage chips. **DC still keeps
   a byte-for-byte private copy of `src/lib/table-controls.ts` that nothing in DC imports** — DC's
   lane to delete.

## 5. The API, in one block

```tsx
// Ask once for the whole row — the common case, and the one the CRM grid wants:
<TableRow valign="top">
  <TableCell>item</TableCell>          {/* align-top */}
  <TableCell>container</TableCell>     {/* align-top */}
  <TableCell numeric>12</TableCell>    {/* align-top, still right-aligned */}
  <TableCell valign="middle">…</TableCell>  {/* opts out — a buttons column reads better centred */}
</TableRow>

// Or per cell, with no row-level answer:
<TableCell valign="bottom">…</TableCell>
```

- **Default is `"middle"` everywhere.** Both props are optional; omitting them is byte-identical to
  today.
- **Precedence: cell > row > default.**
- `"top" | "middle" | "bottom"`. `VAlign` is **module-private** — not exported, exactly like `Align`.
- A row **always** provides its context, so a nested `<Table>` **resets** to the default rather than
  inheriting (T-12).
- `TableHead` is unaffected, even inside a top-aligned row (T-14).

## 6. Verification state at handover

| Item | State |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm test` | **263 passed / 14 files** (baseline 246 / 13) |
| Mutations | 5 run; **4 caught**, 1 (M-3) proven inert over a 320-row byte-identical diff and reported as not caught |
| Additive proof | 3 barrel diffs empty; 3 real `src/` deletions itemised; **384-shape `innerHTML` diff vs `main@fc6f6c6` byte-identical** |
| Dependency audit | 6 highs, **all six on the standing ignore list, 0 new, 0 blocking** |
| Migration | none — no database in this package |
| Throwaway Postgres | never started; nothing left behind |
| Open defects / decisions | **0 / 0** |
| CI | **not waited for, by instruction** — the conductor polls and merges |
