# CR-DESIGN-SYSTEM-007 — when a row instruction and a single box disagree, the box wins

<!-- OWNER-BRIEF-START -->

## What this gets you

Last week's change let a whole line of fields be told "line up along the top", with the option for one
box in that line to say "not me". A reviewer found the second half only half works. If that box was
told where to sit **the older way** — the only way there was before last week — the line's instruction
quietly wins and the box's own is thrown away. Nobody is told; the box just sits where its author did
not ask for.

This makes the more specific instruction win, which is what was agreed when the option was approved and
what anyone building a screen expects.

## What I need you to decide

Which should win when the two disagree? Three versions are drawn side by side:

- **A — the single box wins.** My recommendation, and what was originally agreed.
- **B — leave it as it is today.** The line wins; the box's own instruction is dropped silently.
- **C — the line wins, but loudly.** Same result as B on screen, plus a warning to whoever builds it.

## Not included

No screen in any app changes. Each app picks this up in its own time, in its own piece of work. Nothing
is removed and no new setting is added.

## Real risks

Very low. No app is using the whole-line instruction yet, so nothing anyone sees today moves. The only
thing that changes is what happens the first time an app uses it.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

**Unit:** Change Request CR-DESIGN-SYSTEM-007. Not an epic, not a milestone. Lands in `runs/change-07/`.
**Branch:** `change/cr-design-system-007`, off `main` @ `ce47010` (CR-DESIGN-SYSTEM-006, merged as PR #17).
**Type:** review follow-up on CR-DESIGN-SYSTEM-006 — one finding, F1, medium/medium.

## 1. The finding, re-confirmed against the code as it is now

🔴 The standing instruction is to confirm each finding against current `main` before planning a fix. F1
was re-read from the file, not from the reviewer's words.

**F1 · `src/components/Table.tsx:249` · CONFIRMED, unchanged since the reviewer saw it.**

```tsx
// src/components/Table.tsx:246-249 — read from this worktree at ce47010
const rowValign = useContext(RowValignContext);
const resolvedValign = valign ?? rowValign;
const vertical = valignClass(resolvedValign);
const askedForValign = resolvedValign !== undefined;   // ← the defect, verbatim
```

`askedForValign` is computed from `resolvedValign`, which has already absorbed the row's answer. So a
row-sourced value takes the **asked** path and is emitted at position (B), *after* `className`
(`Table.tsx:265`). `cn` is `twMerge(clsx(...))` and twMerge keeps the last of a conflicting pair, so a
row-level `valign` silently beats a cell's own vertical-align utility written in `className`.

**Reproduction, by reading the emission list.** `<TableRow valign="top"><TableCell className="align-middle">`:

```
cn("px-3 py-2", false, false, false, "text-left", "align-middle", "align-top")
                ↑ (A) skipped, because askedForValign is true
→ "px-3 py-2 text-left align-top"     the cell's own align-middle is dropped
```

**Why it is a defect and not a design choice.** The contract it breaks is written down in three places:

| Source | What it says |
|---|---|
| `DECISION_LOG_CHANGE_CONTROL.md` **D-6** | "Precedence is **cell > row > default**. The more specific answer wins." |
| CR-006 plan **§2.4** / **D-3** | position (B) exists "so a stray utility in `className` cannot silently defeat **the prop**" — *the cell's* prop |
| `Table.tsx:255-258` (its own comment) | position (A) exists so an existing cell "including one that overrides vertical alignment through `className`" is byte-identical |

A cell's `className="align-top"` is a **cell-level** answer — before CR-006 it was the *only* way to
express one, which is exactly why D-2 pinned the default's position to preserve it. Letting a
**row-level** answer beat it inverts D-6 for that pair. Nothing in the approved plan sanctions it.

**No spec covers the combination**, re-verified in `tests/components/Table.test.tsx`:
- **T-6** (`:274-302`) is the 80-combination matrix — every cell renders inside a **plain** `<TableRow>`; no row `valign` anywhere in it.
- **T-7** (`:304-315`) and **T-8** (`:317-329`) are cell-only, both inside a plain row.
- **T-11** (`:379-389`) proves cell prop > row prop, but the opt-out cell uses the **prop**, never `className`.

So the reviewer's scenario falls exactly in the gap between T-7/T-8 (cell vs `className`) and T-11
(cell vs row). Confirmed real, confirmed uncovered, and **the fix goes ahead.**

### 1.1 Blast radius today: zero screens, and that is measured

| Check | Result |
|---|---|
| DC's pin (`bananaworld-dc/package.json:54`) | `#0633476...` — **CR-004's sha**, three changes behind. DC's build cannot even *see* `TableRow.valign`. |
| `grep -i valign` across the whole DC repo | **0 occurrences** — re-run this session, matching CR-006 F-13 |
| Any `align-top/middle/bottom` inside a DC `TableCell` `className` | **none.** The 10 hits are all `<span>`s, plus `SalesOrderForm.tsx:1024-1026`, which hand-rolls its own `<td>` with `align-top` and never touches `TableCell` |
| CRM / RMS / org-admin / Manga Verde | **not readable from a build worktree; not opened; nothing here claims they were.** All four are behind CR-006 by construction — CR-006 merged 2026-08-24 and the handover records every pin bump as still owed |

**Nobody can be hitting F1 yet.** That does not demote it — it means this is the one window in which the
fix costs nothing, before the first consumer bumps onto `ce47010` and writes the combination.

## 2. The fix

**One predicate.** `askedForValign` must mean *"the cell itself asked"*, not *"anybody asked"*.

```tsx
  const rowValign = useContext(RowValignContext);
  // Resolution is unchanged: the cell's own answer wins over its row's (D-6).
  const vertical = valignClass(valign ?? rowValign);
  // 🔴 Only the CELL's own prop earns position (B) — after `className`. A row-level answer is a
  //    default for cells that express no vertical answer of their own, so it is emitted at position
  //    (A), exactly where the untouched `align-middle` default sits, and a cell's own `className`
  //    still beats it. Computing this from the RESOLVED value let a row beat a cell (CR-007 F1).
  const cellAskedForValign = valign !== undefined;
```

and the two emission slots keep their positions, keyed on the new predicate:

```tsx
      className={cn(
        "px-3 py-2",
        !cellAskedForValign && vertical,   // (A) default OR the row's answer — className may beat it
        numeric && "tabular-nums",
        muted && "text-fg-subtle",
        alignClass(effectiveAlign),
        className,
        cellAskedForValign && vertical,    // (B) the cell's own prop — beats className
      )}
```

**Still exactly one vertical class on every path**, in exactly one of two positions — the invariant D-3
set and T-6 guards. Nothing else in the file's logic moves.

### 2.1 The precedence table this produces

| The caller writes | Today (defective) | After | Right? |
|---|---|---|---|
| `<TableCell>` | `align-middle` (A) | `align-middle` (A) | unchanged — **byte-identical** |
| `<TableCell className="align-top">` | `align-top` wins | `align-top` wins | unchanged — **byte-identical**, D-2 preserved |
| `<TableCell valign="top">` | `align-top` (B) | `align-top` (B) | unchanged |
| `<TableCell valign="top" className="align-middle">` | `align-top` — prop wins | `align-top` — prop wins | unchanged, T-7 |
| `<TableRow valign="top">` + plain cell | `align-top` (B) | `align-top` **(A)** | same rendering, class order moves — §4 |
| `<TableRow valign="top">` + `<TableCell className="align-middle">` | **`align-top` — the bug** | **`align-middle`** | 🔴 **fixed** |
| `<TableRow valign="top">` + `<TableCell valign="middle">` | `align-middle` | `align-middle` | unchanged, T-11 / D-6 |

Final precedence, stated once so it can be pinned: **cell `valign` prop > cell `className` > row
`valign` prop > default `middle`.** The middle rung is the addition — and it is a *cell-level* answer
sitting above a *row-level* one, which is D-6 read literally.

### 2.2 The three options the owner is choosing between

Rendered at `runs/current/mockups/CR-DESIGN-SYSTEM-007/`.

- **A — the cell's own answer wins (recommended, and the default if the owner does not pick).** The fix
  above. Restores D-6 as written; the row becomes a genuine *default* for its cells rather than an
  override of them. Costs one predicate and edits no existing spec.
- **B — no change; today's behaviour is declared intentional.** Defensible only on the argument that a
  prop outranks a `className` on principle. It loses on the facts: `className` was the sole way to say
  this before CR-006 (D-2's entire reason for existing), and the failure mode is a silent visual
  misalignment — the exact bug class CR-006 was created to remove. If picked, the finding is closed as
  WONT-FIX with a doc-comment stating the rule, and the change becomes documentation-only.
- **C — B plus a development-time warning** when a row-sourced value overrides a cell's own
  vertical-align utility. Removes the silence but not the surprise, and puts a `console.warn` and a
  class-string scan into a pure presentational primitive on every cell render — new code, new cost, in
  a package whose lane rule is minimum surface. Named for completeness; not recommended.

### 2.3 What is deliberately NOT touched

- 🔴 **The default.** `align-middle`, in the position it has always occupied. D-2 is untouched and
  T-1/T-8 still pin it.
- 🔴 **Both class-emission positions stay.** The standing warning in `SESSION_HANDOVER.md` §2 — do not
  collapse them into one — is obeyed; this change *depends* on both existing.
- **The export surface.** No new field, no removed field, no renamed field, no new type. `VAlign` stays
  module-private (D-7). All three barrels byte-identical.
- **`TableRow`, `TableHead`, `TableContainer`, `Table`, `TableHeader`, `TableBody`, `alignClass`,
  `valignClass`, `RowValignContext`, the provider-always rule (D-5).** Untouched.
- **`package.json` / `pnpm-lock.yaml`.** No dependency.
- **Radix.** Nothing here is an interactive control; `Table` has no Radix underpinning and this change
  adds and replaces none. The rule has nothing to bite on.
- **No consumer file and no consumer pin, in any repo.** The DC worktree is read-only and was read only.
- **`runs/epic-*/`, any `milestone-NN/`, `runs/current/epic-plan/`.** Not read for writing, not written,
  not proposed. CR-006's archive `runs/change-06/` is **cited, never edited**; anything owed to it goes
  in `runs/change-07/technical-debt.md`.

## 3. Cross-app intersection map — who writes, who reads

| # | Seam | Who WRITES | Who READS | Decision |
|---|---|---|---|---|
| S-1 | The vertical-alignment precedence rule for every table cell in the estate | **This package** owns the rule and the default | DC, CRM, RMS, org-admin, Manga Verde — **each only after it bumps its own pin** | This package sets the rule: cell prop > cell `className` > row prop > `middle`. Opt-in throughout; no consumer pin bumped here. |
| S-2 | DC, at pin `0633476` (`bananaworld-dc/package.json:54`) | DC | This package | **Unaffected, and provably so** — DC's pin predates `TableRow.valign` entirely, `valign` appears 0 times repo-wide, and no DC `TableCell` carries a vertical utility in `className`. |
| S-3 | The CRM sales-order line grid — the intended first adopter of `TableRow valign` | The CRM, in **its own** change | This package's option | **Out of scope, and the ORDER matters:** this merges → CRM bumps to the **merged `main` sha** (never a branch sha — KI-M001E19-002) → CRM writes `valign`. Fixing this now means the CRM never meets the bug. |
| S-4 | RMS · org-admin · Manga Verde | each app | This package | **Not readable from a build worktree; not opened.** All are behind CR-006, so none can be exercising the defective combination. Stated as a limit, not a clearance. |
| S-5 | The export surface (three barrels) | This package | All five consumers, at bump time | **No movement at all.** No interface gains or loses a field; this is a behaviour correction inside one function body. |
| S-6 | Database / migration | — | — | **None.** This package has no database by construction; the change is pure presentation. |

**Cross-system register:** `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist and there is
no `governance/` directory. **Seventh consecutive change to raise it** (CR-001 D-12, CR-002 D-10, CR-003,
CR-004, CR-005 D-12, CR-006 D-12, here). Creating it is a governance decision for the owner, not
something a change may invent — the seams above are recorded here, in the estimate and in the change's
own evidence pack instead. Carried as OQ-2.

## 4. The additive claim, and the one honest asterisk on it

The lane rule is additive-only, and this change **removes nothing, renames nothing, adds no field and
moves no export**. But it *is* a behaviour change for one input combination, so the claim gets stated
precisely rather than waved at:

1. **Every caller that sets no `valign` anywhere — i.e. every caller in every consumer today — renders
   byte-identically.** `rowValign` is `undefined`, `valign` is `undefined`, the default is emitted at
   position (A) exactly as before. Proof by the CR-006 method (§6 of that plan, reusable in ~10 minutes):
   render every existing caller shape against `git show ce47010:src/components/Table.tsx` and against the
   edited file, diffing whole `innerHTML`. **384 shapes already exist for this.**
2. **Every caller that sets `valign` on a `TableCell` renders byte-identically.** Position (B) is
   reached on exactly the same condition as before for that group.
3. ⚠ **Cells inside a row that sets `valign` change.** Two sub-cases, both deliberate:
   - cell carries a conflicting vertical utility in `className` → **rendering changes.** This is the fix.
   - cell carries none → **rendering is identical, but the class string's ORDER changes**
     (`px-3 py-2 align-top text-left` instead of `px-3 py-2 text-left align-top`). Tailwind utilities are
     order-independent unless they conflict, and there is exactly one vertical class either way — the
     same argument T-5 already records at `Table.test.tsx:256-260`. **A whole-`innerHTML` diff WILL show
     this**, so it is declared here rather than discovered at the gate.
   - **Nobody is in group 3 yet** (§1.1). Zero consumers can observe either sub-case.

That asterisk is the reason to do this now rather than after the CRM adopts.

## 5. Files expected to touch

| File | Change | Size |
|---|---|---|
| `src/components/Table.tsx` | The predicate at `:249`, its comment, the two emission comments at `:255-265`, and the precedence sentence in the `TableCellProps.valign` / `TableRowProps.valign` doc-comments + the file header at `:41-43` | ~6 real lines, ~20 with comments |
| `tests/components/Table.test.tsx` | **New specs appended in a new §8. No existing spec edited.** | ~70 lines |

**No other file.** Not the barrels, not `package.json`, not any consumer.
Paper trail (outside the estimate): `runs/change-07/**`, `source-documents/active/DECISION_LOG_CHANGE_CONTROL.md`, `runs/current/SESSION_HANDOVER.md`.

## 6. Testing plan

**Every one of the 17 existing specs stays green, unedited — traced individually, not assumed:**

| Spec | Why it cannot move |
|---|---|
| T-1, T-2, T-15, T-16 | No `valign` anywhere; path (A) with the default, identical string |
| T-3, T-4, T-5, T-7, T-8, T-9 | Plain `<TableRow>`, so `rowValign` is `undefined` and `valign !== undefined` ≡ `resolved !== undefined` |
| T-6 | Same — all 80 combinations render in a plain row |
| T-10 | Row `valign="top"`, plain cells → class moves to (A); the spec asserts `verticalClasses(...)` **equals `["align-top"]`**, which still holds |
| T-11 | Cell prop still wins; both assertions are on `verticalClasses`, not the exact string |
| T-12 | The two exact-string assertions (`:417-418`) are on cells in rows with **no** `valign` — unchanged. `cells[0]` is asserted by `verticalClasses` only |
| T-13, T-14 | Destructuring and the `TableHead` fence are untouched |

🔴 If any existing spec reddens, the fix is wrong — **stop and re-plan, never edit the spec.**

**New specs (§8, appended):**

| # | Spec |
|---|---|
| T-17 | 🔴 **The finding, verbatim.** `<TableRow valign="top">` + `<TableCell className="align-middle">` → `verticalClasses` is `["align-middle"]`. Reddens against `main` today. |
| T-18 | The reviewer's full CRM shape: a six-cell top-aligned row whose actions cell carries `className="align-middle"` → five `align-top`, one `align-middle`, one vertical class each. |
| T-19 | The cell prop still beats `className` **inside** a top-aligned row: row `top` + cell `valign="middle"` + `className="align-bottom"` → `["align-middle"]`. Position (B) intact. |
| T-20 | A row-level answer still reaches a cell whose `className` is non-alignment (`"w-40"`) → `["align-top"]`. Guards against over-narrowing the row's reach. |
| T-21 | **The matrix T-6 never ran:** row `valign` ∈ {undefined, top, middle, bottom} × cell `valign` ∈ same × `className` ∈ {undefined, w-40, align-top, align-middle, align-bottom} = 80 combinations, **exactly one** vertical class in every one. |
| T-22 | Byte-identity re-guard: the T-1/T-2 shapes rendered inside a row that sets **no** `valign` still produce the exact strings T-1/T-2 pin. |

**Mutations to run (5, reported honestly — a miss is reported as a miss, per CR-006's M-3 precedent):**
M-1 revert the predicate to `resolvedValign !== undefined` → T-17/T-18 must redden ·
M-2 `cellAskedForValign = true` → T-8 · M-3 `cellAskedForValign = false` → T-7 ·
M-4 swap the two emission positions → T-8 · M-5 drop `?? rowValign` → T-10.

**Also:** `pnpm typecheck` clean, `pnpm test` green (expected **263 + 6 = 269**, baseline re-measured
before any edit), dependency audit reproduced in Node — 🔴 **with the third sanity check the handover
demands: assert every parsed advisory id is non-empty and matches `/^GHSA-/` before comparing anything.**
Three probes in a row have lied on their first run. Read the output, never the verdict.

## 7. Open questions

- **OQ-1 (the decide-point, on the owner's card):** A / B / C from §2.2. **Default if unanswered: A** —
  it restores the approved contract D-6 and is the smallest of the three.
- **OQ-2:** `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` — seventh raise. Owner's governance call; not
  invented here.
- **OQ-3 (non-blocking, carried):** CR-006's TD items are unaffected and stay where they are. The one
  new debt this change creates if B is chosen — a documented silent override — would go in
  `runs/change-07/technical-debt.md`, **never** into `runs/change-06/`.
- **OQ-4 (non-blocking):** the consumers' standing one-line `grep -rn "valign" src` before each pin bump
  (CR-006 D-8) is unchanged by this and still owed by CRM, RMS, org-admin and Manga Verde.
- **Repo drift, re-verified and still out of lane:** no prettier config (so `pnpm format:check` fails
  repo-wide), no lint script or eslint config, no `audit:deps` script, stale `ci.yml` test-job label.

## 8. Scope fences carried from the request

1. **One finding, F1. Confirmed present. Nothing else is fixed, tidied or refactored on the way past** —
   including the below-the-bar findings that CR-006's review deliberately did not queue.
2. **No consumer pin is bumped and no consumer file is touched.** Consumers move against the **merged**
   sha on `main`, in their own change.
3. **This is a CHANGE.** One unit, `runs/change-07/`. No milestones, no `runs/epic-NN/`, nothing under
   `runs/current/epic-plan/`. It does not decompose into five controlled units of work — it is one
   predicate and six specs.
4. **Nothing has been built, run or tested in this session.** Every number above is an estimate or a
   figure read from an existing artifact, and is labelled as such.
