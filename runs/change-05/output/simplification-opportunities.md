# Simplification opportunities — CR-DESIGN-SYSTEM-005

> Stage 05 simplification gate. Reviews **only** the two files in `changed-files.md`.
> **6 candidates considered: 1 accepted, 5 rejected with reasons.**

## 1. Candidates

### S-1 — collapse the braced render block back to a one-liner · **REJECTED**

```tsx
if (slot === "DC") return <HeaderSlot key={slot} label={props.dcLabel ?? "DC"} value={props.origin.dcName} />;
```

Fewer lines, and it would make the diff `+29 / −1` instead of `+30 / −1`. **Rejected:** at 108
characters it is well past the width every other line in this file keeps, and it would be the longest
line in the component by a distance. The braced form is what the plan specified (§2.2) and what the
`"Raised by"` slot immediately below already uses for the same reason. Consistency with the two
neighbouring branches is worth one line.

### S-2 — add `dcHint?: string` now, mirroring `dateHint` · **REJECTED**

The plan's option C. One optional field, one render argument, no layout change, fully additive — it
would let an app write "Not applicable" under the dash instead of shipping a mystery box.

**Rejected on one ground: no caller has asked.** CR-CRM-015 needs a word, not an explanation, and this
component has twice refused configurability built in anticipation of a decision nobody has taken
(D-3, D-13). It costs nothing to add later and nothing is foreclosed. Recorded with a named trigger as
`technical-debt.md` TD-2 so the next lane finds it rather than re-derives it.

### S-3 — factor the two `?? "DC"` / `?? "Date"` defaults into a helper · **REJECTED**

Something like `slotLabel(props, slot)`. **Rejected, and firmly.** It is mutation **M-4**'s shape in
disguise: any indirection that maps a slot identity to a label creates a second place where the slot
model lives, which is precisely what the request forbade and what T-11 now guards. It would also make
three call sites read worse to save two `??` operators. `??` inline is the simplest thing that works
and it is the pattern the file already teaches.

### S-4 — assert the empty state once, parameterised over both labels · **REJECTED**

T-4 and T-5 differ only in whether `dcLabel` is passed, and could be a two-case loop.

**Rejected:** they are not the same claim. T-4 says *the existing behaviour did not change*; T-5 says
*this is the answer for an app with nothing for the slot* — the omission decision, which the request
required be covered by a test that would fail if it silently changed. Merging them would give the
omission decision no name of its own in the test output, and a spec that cannot be read as a statement
is the recorded trap where a check gets filed as compliance. T-5 also asserts something T-4 does not
(that no explanatory wording appeared).

### S-5 — drop T-8 (`dcLabel="Date"`) as an unreal case · **REJECTED**

No app will label its depot "Date". **Rejected:** the spec is not about that app. It is the assertion
that the render keys off the **array entry** and never off the printed text — the property that makes
`DOCUMENT_HEADER_SLOTS` the single expression of identity. It is cheap and it states something true
about the design that no other spec states.

### S-6 — simplify T-12's barrel scan to a runtime import check · **ACCEPTED, and applied**

The first draft located the export block with a pair of `indexOf` / `lastIndexOf` calls and a
conditional slice — six lines of index arithmetic that were hard to read and would silently return the
wrong region if the barrel's shape moved. Replaced with a single regex over the barrel source:

```js
const block = /export \{([^}]*)\} from "\.\/DocumentHeader";/.exec(barrel);
```

Same claim, one line, and it fails loudly (`expect(block).not.toBeNull()`) rather than quietly slicing
the wrong text. **A runtime `import` check was considered and rejected for the same spec** — five of
the eight symbols are TYPES and erase at runtime, so a runtime check could only ever see three of them
and the spec's whole point is the full export surface.

Applied in this session; typecheck clean and 246 / 246 green afterwards. Recorded in
`accepted-refactors.md`.

## 2. Simplifications already built in — recorded so they are not re-proposed

| # | Kept simple by construction |
|---|---|
| B-1 | **One optional prop**, not a discriminated union, not a config object, not a shape shared with `dateLabel` |
| B-2 | **Defaulted at the point of use**, not in a `defaultProps`, not destructured with a default in the signature — matching `dateLabel` exactly |
| B-3 | **No new type exported**, so no barrel edit and no export-surface movement |
| B-4 | **No new file.** Two files touched, both of which already existed |
| B-5 | **No branch added.** `??` is not a conditional a reader has to trace |
| B-6 | **Omission not built**, so there is no `null`-means-omit arm, no computed grid class and no breakpoint special case |
| B-7 | **No abstraction over the four slots.** The render is still three explicit `if`s and a fallthrough |
| B-8 | The empty state was **reused, not re-implemented** — it is the behaviour `HeaderSlot` already had |

## 3. Verdict

**PASS.** One simplification accepted and applied; five rejected with stated reasons; eight recorded
as already built in. Nothing in this change is more complicated than the `dateLabel` line it was told
to imitate.
