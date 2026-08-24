# Readable code scorecard — CR-DESIGN-SYSTEM-006

> Scored against the files in `changed-files.md`: `src/components/Table.tsx`,
> `tests/components/Table.test.tsx`.

**12 / 12 PASS.** Two weak points are stated below rather than trimmed away.

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | Names say what the thing is | **PASS** | `valign` matches the CSS property and the sibling `align` prop; `VAlign`/`valignClass` mirror `Align`/`alignClass`; `rowValign`, `resolvedValign`, `askedForValign` each name a distinct step |
| 2 | Follows the file's existing idiom | **PASS** | private union + one-class helper (`Align`/`alignClass`); optional props with doc comments; `forwardRef` + `cn(...)` composition; the context mirrors `SurfaceContext`'s shape |
| 3 | Non-obvious code carries its reason | **PASS** | every one of the four subtle points is commented **at the line**: why two positions, why always-provide, why the default is estate-wide, why the prop shadows a deprecated DOM attribute |
| 4 | The named precedent is honoured visibly | **PASS** | `valignClass`'s comment states the one-class rule **and why** (twMerge keeps the last of a conflicting pair), the same reasoning `alignClass` carries |
| 5 | Functions are short and single-purpose | **PASS** | `valignClass` is 3 returns; `TableRow` and `TableCell` each gained ~4 lines of logic |
| 6 | No dead code, no speculative generality | **PASS** | no unused export, no unused branch; `TableHead` deliberately untouched; the union is 3 values, not the 4 the DOM type allows |
| 7 | Control flow is flat | **PASS** | no nesting added; the resolution is one `??` |
| 8 | Types are honest | **PASS** | `VAlign` is a strict subset of `TdHTMLAttributes["valign"]`, so the narrowing typechecks; no `any`, no cast, no `!` |
| 9 | Tests read as documentation | **PASS** | each spec is named for the behaviour it holds (T-1 … T-16); the file header explains why four of them pre-date the feature |
| 10 | Tests assert the real thing | **PASS** | exact `class` attributes, not `toContain` — stated in the file header as deliberate, because `toContain` would pass with a second conflicting class present |
| 11 | Failure messages locate the failure | **PASS** | every table-driven `expect` carries a label (`shape.name`, the combination string, `JSON.stringify(props)`), so a red run names the case |
| 12 | A future maintainer is warned where it matters | **PASS** | the two-position emission is fenced in the source, in `known-issues.md` D-2, in `simplification-opportunities.md` S-1 and in `accepted-refactors.md` |

## Weak points — stated, not trimmed

### W-1 — comment-to-code ratio in `TableCell` is high

The `<td>` class list is 8 code lines carrying 6 lines of comment. That reads as over-commented for a
class list. **Left as is deliberately:** those two conditional lines are the entire mechanism of the
change, the difference between them is *position*, and position is invisible to a reader who does not
already know the history. The alternative — a shorter comment — is exactly what would let someone
"tidy" it into S-1 and silently break five apps.

### W-2 — `TableCellProps` is now a five-field interface with a 13-line doc comment on one field

The `valign` comment is long because it carries three separate things a caller must know: the default
is estate-wide contract, when to reach for `"top"`, and that the prop consumes a deprecated DOM
attribute. Splitting it would scatter the warning. Accepted as the cost of the collision being
**declared rather than discovered**.

### W-3 — the spec file is 463 lines for a two-field change

Long, and it is the package's **first** Table coverage (F-8), so it is carrying more than this
change: the default's exact string, the row's exact string, the export surface, and the horizontal
regression this file already suffered once. T-6 alone exercises 80 combinations in a loop. **Not
trimmed** — the byte-identity claim for four unreadable repos is only as good as its assertions.
