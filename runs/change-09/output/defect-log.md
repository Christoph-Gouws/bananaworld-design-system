# Defect log — CR-DESIGN-SYSTEM-010

> Stage 04. Defects found and resolved **during this session**. The three defects this change EXISTS
> to fix are the reviewer's findings and are logged as F1–F3 below for the record; D-1 is a defect
> found in this session's own tooling.

## Open at close: **0**

---

## The three findings this change fixes — all CONFIRMED against the code as it stood, all closed

| Id | Severity | Where | State |
|---|---|---|---|
| **F1** | medium/high | `src/components/GridFilterRow.tsx:284, 289, 293, 343` | **FIXED** |
| **F2** | medium/high | `src/components/DataTableToolbar.tsx:399` · `src/components/GridFilterRow.tsx:326` | **FIXED** |
| **F3** | medium/medium | `src/components/Table.tsx:483` (declared) · `:487` (destructured out) | **FIXED** |

### F1 — the grid's tick-list under-counts and then discards a value the option list no longer offers

**Confirmed as it stood.** `MultiSelectCell` derived everything from `options.filter((o) =>
selected.includes(o.id))`, so a saved view restoring `f_room=cold-1&f_room=cold-9` (with `cold-9`
retired) rendered `Cold room 1` with no `+1` and `1 chosen`, while the query narrowed by two. The
toolbar in the identical state read `Cold room 1 +1` / `2 chosen`. `toggle()` re-derived from the same
filter, so ticking any third room committed `[cold-1, cold-2]` and `cold-9` was deleted with no
indication.

**And worse than the reviewer had room to say, confirmed:** `set` (`:289`) came from the same
`chosen`, so a value restored as *only* unknown ids rendered the cell **completely unset** — grey
chrome, resting placeholder "All rooms" — on a filtered column.

**Fixed** by moving the value arithmetic into `MultiSelectMenu` (`multiSelectChosenLabels`,
`multiSelectToggle`) and having both surfaces call it; every count is now `values.length`.
⚠ **The discard half was symmetric, not drift** — the toolbar dropped unknown ids on a tick too, with
a comment defending it. Repairing both is therefore a **behaviour correction in already-shipped
toolbar code**, not a re-alignment, and the plan said so at §0. Pinned by **M-3, M-4, M-7, M-8**.

### F2 — "Select all" narrows the table instead of widening it

**Confirmed in both surfaces.** `onToggle={(all) => onChange(all ? options.map(...) : [])}` committed
every option id. `deriveSelectOptions` never produces an option for a `null` or `""` accessor result
and `matchesFilter`'s multiSelect arm requires `actual !== null`, so the gesture **dropped every
blank-valued row** and `hasActiveControls` then lit "Clear" — on a tap the reader made to see more.
The grid additionally wrote N repeated parameters into the URL and the saved-view definition where the
one empty state has always been an absent key.

**Fixed** by giving the master row `onShowEverything: () => void`. No boolean to interpret and no id
list reaching it, so the defect is **unreachable** rather than fixed. Pinned by **M-5, M-6**.

### F3 — `TableCellProps.width` shadows the DOM attribute and is swallowed

**Confirmed, and confirmed by compiling** rather than by reading — the plan flagged that
`node_modules` was absent when it was written.

- `@types/react/index.d.ts:3541-3551` — `TdHTMLAttributes.width?: number | string`.
- `:3553-3560` — `ThHTMLAttributes` declares **no** `width`. The asymmetry is real.
- `git show 6ed975d:src/components/Table.tsx` contains **no `width` at all**, so the prop was
  inherited and `<TableCell width={120}>` → `<td width="120">` was legal before CR-009.
- A probe declaring it against the pre-change tree: `TS2322: Type 'number' is not assignable to type
  'TableColumnWidth | undefined'`. `<TableHead width={120}>` fails in **both** trees, so it is not a
  regression and `TableHeadProps` was correctly left alone.

**Fixed** by widening the union and splitting the two meanings once, in `TableCell`. Pinned by
**M-9, M-10**.

---

## D-1 · the mutation battery's multi-line anchors do not match a CRLF checkout — FIXED

**Severity: harness (this session's tooling). Not shipped code.**

**Symptom.** The first run of `mutation-battery.mjs` reported **7/10 caught, 3 skipped**. M-5, M-6 and
M-9 printed `ANCHOR NOT FOUND — MUTATION NEVER RAN`.

**Cause.** Git stores LF; `core.autocrlf` hands out CRLF on this Windows checkout. The three skipped
anchors were the only **multi-line** ones, so their embedded `\n` matched nothing on disk. The seven
single-line anchors were unaffected — which is exactly why it presented as a partial run rather than
as a broken harness.

**This is the same root cause as CR-DESIGN-SYSTEM-009's own D-1, arriving from the other direction.**
That one hit the *restore* (`git checkout --` returns CRLF bytes, so the restored file is
byte-different and later anchors stop matching); this one hit the *match*. CR-009's fix — hold the
original bytes and write them back — was carried over here from the start and worked; what it did not
cover was the anchor itself.

**Fix.** The anchor takes the file's own line ending:
`const eol = text.includes("\r\n") ? "\r\n" : "\n"` and both `from` and `to` are re-joined on it.
Re-run: **10/10 caught, 0 skipped**, every restore `Buffer.equals`-verified.

**🔴 The 7/10 run is not the reported result and was never reported as one.** The harness's own
"ANCHOR NOT FOUND — MUTATION NEVER RAN" line is what surfaced it — the self-check CR-007 demanded and
CR-009 proved the value of. Kept, and made a non-zero exit.

**For the next session:** the estate now has two independent CRLF traps recorded on the same tooling.
The general rule is one line — **normalise to LF before matching, and write original bytes back** —
and it applies to every text-manipulating harness on Windows, including `quality-sensors.mjs`, which
has the third instance of it (`known-issues.md` §C).

---

## Defects found in the CHANGE itself: **0**

Nothing in the four source files failed a spec, a mutation or the byte-identity comparison after the
first green run. Two spec failures occurred during authoring and were **spec bugs, not code bugs**,
and are recorded because they are a trap worth naming:

**An open Radix menu `aria-hidden`s the rest of the page**, so `screen.queryByRole("button", { name:
"Clear" })` finds nothing while the tick-list is open — a "Clear is off" assertion written that way
**passes on the defect**. Both affected specs now press `{Escape}` before asserting. This is a
sibling of the CR-008 lesson already in the suite header ("a spec that ends with a Radix menu open
leaves `pointer-events: none` on the body"), and it belongs beside it.
