# Simplification opportunities — CR-DESIGN-SYSTEM-004

> Stage 05 simplification gate (MWP §5). Candidates considered across exactly the files in
> `changed-files.md`. **7 candidates · 1 accepted · 6 rejected, each with a reason.**

## 1. Accepted

### S-1 — `rangeLabel(from, to, total)` → `positionLabel(range)` · **ACCEPTED, applied**

The helper took three loose numbers when the `TablePageRange` it came from was sitting right there at
the call site. Three same-typed positional arguments is an ordering bug waiting to happen — swap
`from` and `to` and nothing complains — and the caller had to destructure an object only to pass its
pieces back in.

```diff
- <span …>{rangeLabel(range.from, range.to, range.total)}</span>
+ <span …>{positionLabel(range)}</span>

- function rangeLabel(from: number, to: number, total: number): string {
-   if (total === 0) return "0";
-   return `${from}–${to}`;
+ function positionLabel(range: TablePageRange): string {
+   if (range.total === 0) return "0";
+   return `${range.from}–${range.to}`;
```

Renamed too: it produces the **position** part (`1–25`), not the whole label — the old name promised
more than it returned. Applied, `pnpm typecheck` clean and **235 / 235** still green afterwards; see
`accepted-refactors.md`.

## 2. Rejected — and why each would cost more than it saves

### S-2 — drop `isFirst` / `isLast` from `TablePageRange`; they are derivable · **REJECTED**

They are `page === 1` and `page === pageCount`, so a caller could compute them. But the caller that
matters is a **disabled arrow**, and `disabled={range.isFirst}` cannot get the comparison wrong
whereas `disabled={page === 1}` uses the caller's *unclamped* `page` — which is exactly the stale-page
case the clamping exists for. Removing two fields to reintroduce the bug the module was written to
prevent is not a simplification.

### S-3 — drop `offset`; it is `(page - 1) * pageSize` · **REJECTED — the plan forbids it (D-12)**

That is the whole point of it being on the range. Sixteen lists each writing `(page - 1) * size` by
hand is sixteen chances to be off by one, in the one place where an off-by-one looks to an operator
exactly like a missing record. `offset + 1 === from` is an asserted invariant.

### S-4 — inline `wholeNumberAtLeast`; it is three lines used three times · **REJECTED**

Those three call sites are `page`, `pageSize` and `total`, and the rule they share **is** the plan's
junk-input row. Inlining it means writing the same predicate three times and letting them drift — and
DEF-1 was exactly that predicate being subtly wrong once. One place to be right is the reason it is a
function.

### S-5 — collapse the two `<nav>` branches into one return with conditionals · **REJECTED**

The early return for `placement="bottom"` is four lines and says "the bottom bar is arrows and
nothing else" in a form a reader can check at a glance. A single return with
`{isTop && …}` around the status text, the picker **and** the `justify-*` class would need three
conditionals to express what one branch expresses once — and the picker's absence is a **rule**
(D-20), not a display detail. It reads better as a branch than as three guards.

### S-6 — two components, `TablePaginationHeader` and `TablePaginationFooter` · **REJECTED (D-18)**

Doubles the export surface, duplicates the range arithmetic, and lets the two bars disagree about the
page. `placement` keeps them provably in sync because they are the same props object — asserted by
the spec where the **bottom** bar's Next moves the **top** bar's count.

### S-7 — hoist the shared `arrows` JSX out of the component · **REJECTED**

It already exists once, as a local `const` used by both branches, which is the simplification. Hoisting
it to a module-level component would mean threading `range` and `goTo` through props to save nothing —
more surface, more indirection, identical output.

## 3. Simplifications already built in — recorded so they are not undone as "opportunities"

| # | What | Instead of |
|---|---|---|
| B-1 | **Two new files; nothing existing edited** | Adding a slot to `DataTableToolbar` or a prop to `Table` — 11 live call sites reached to save one right-aligned row (D-21) |
| B-2 | **One component, two placements** | Two exports, or a wrapper that takes the table as `children` (D-18) |
| B-3 | **One callback carrying a complete pair** | `onPageChange` + `onPageSizeChange`, which admits states the bar cannot render (D-5) |
| B-4 | **Radix `Select` and this package's `Button`** | A hand-rolled picker or icon buttons — no new dependency, no new token, no second idiom (D-11) |
| B-5 | **`pageCount` is never 0** | Every caller branching on "empty list" separately |
| B-6 | **Clamp for rendering, never call back** | A `useEffect` that "fixes" the parent, i.e. a re-render loop (D-7) |
| B-7 | **The announced string IS the visible string** | An `aria-label` that can drift from what is on the screen (D-10) |
| B-8 | **No `variant` prop** | Shipping all three mockup layouts behind configuration (D-13) |

## 4. Verdict

**PASS.** One genuine simplification found and applied; six rejected with reasons; eight recorded as
already built in. Nothing was removed that a test or a stated decision depends on, and the suite is
green after the accepted change.
