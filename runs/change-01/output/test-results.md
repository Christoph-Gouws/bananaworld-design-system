# Test results — CR-DESIGN-SYSTEM-001

> Package: `@bananaworld/design-system` · Branch `change/cr-design-system-001` · off `origin/main` @ `b1373c7`
> Runner: vitest 4.1.10, two projects (`engines` = node, `components` = happy-dom)

## Verdict: PASS

| Gate | Command | Before the change | After the change |
|---|---|---|---|
| Typecheck | `pnpm typecheck` (`tsc --noEmit`) | clean | **clean** |
| Full suite | `pnpm test` (`vitest run`) | 61 passed / 6 files | **79 passed / 7 files** |
| Components project only | `npx vitest run --project components` | 10 passed / 2 files | **28 passed / 3 files** |

**Net: +18 tests, 0 failures, 0 skipped, 0 pre-existing tests modified or deleted.**

The baseline was captured on a clean checkout *before* any edit, so the 61→79 delta is this change's
own contribution and nothing else. No existing test file was touched.

### Raw output — full suite, final run

```
> @bananaworld/design-system@0.1.0 test
> vitest run

 RUN  v4.1.10 D:/.../worktrees/CR-DESIGN-SYSTEM-001

 Test Files  7 passed (7)
      Tests  79 passed (79)
   Duration  1.19s
```

### Raw output — typecheck, final run

```
> @bananaworld/design-system@0.1.0 typecheck
> tsc --noEmit
```

(no diagnostics; `tsconfig.json` has `strict`, `noUncheckedIndexedAccess` and `noImplicitOverride` on)

## The 18 new tests

All in `tests/components/ChoiceGroup.test.tsx`. Verbatim from `--reporter=verbose`, all `✓`.

### Group 1 — "the baseline that must not move" (5) — THE ADDITIVE PROOF

| # | Test | What it actually pins |
|---|---|---|
| 1 | renders every option, and only the selected one is checked | Unchanged behaviour incl. `disabled` |
| 2 | shows the empty label, and no chips at all, when there is nothing to choose from | `emptyLabel` default `"None configured."` unchanged |
| 3 | is announced as ONE radio group with zero buttons | The Radix guarantee. `radiogroup` count 1, `button` count 0 — a hand-rolled chip row would report 4 buttons and no group |
| 4 | moves AND selects with an arrow key, from a single tab stop | One tab stop + arrow-key roving selection |
| 5 | **adds NOTHING to a chip that passes neither new field** | The headline additive assertion — see below |

Test 5 is the one that makes "byte-identical" a fact rather than a claim. For every chip that
passes neither new field it asserts:

- `hasAttribute("title") === false` — **absent**, not `title=""`. React omits an `undefined`
  attribute entirely; asserting absence is what catches a regression to an empty string.
- `hasAttribute("aria-label") === false` — same reasoning.
- no `[aria-hidden]` descendant — no swatch element.
- `childNodes.length === 1` and that node is a `TEXT_NODE` — the text is still the chip's only
  child, so no wrapper was introduced around it.
- **the full `class` attribute equals the exact string that shipped at `b1373c78`**, written out as
  a literal rather than a snapshot so it cannot be silently re-recorded when it drifts.

### Group 2 — `swatch` (7)

| # | Test |
|---|---|
| 6 | renders one aria-hidden colour block filled with the hex it was handed |
| 7 | blends the two colours through ColourSwatch rather than re-implementing the gradient |
| 8 | falls back to the solid fill when accentHex is **null** |
| 9 | falls back to the solid fill when accentHex is **an empty string** |
| 10 | falls back to the solid fill when accentHex is **undefined** |
| 11 | sizes the block as a full-height stripe flush to the chip's left edge (owner-approved option B) |
| 12 | leaves ColourSwatch itself untouched — a plain swatch still renders at its own default size |

Test 7 asserts the rendered background contains `linear-gradient(135deg,` plus both hexes — that is
`ColourSwatch`'s own code path, proving the blend is reused and not re-implemented in `ChoiceGroup`.
Tests 8–10 cover the exact shape nullable master data produces (`accent_hex?: string | null`).
Test 11 also pins that `px-3` survives alongside `pl-0` in the merged class list — subtle and
load-bearing: if `twMerge` ever collapsed those, the chip would silently lose its RIGHT padding.
Test 12 guards the "sizing lives in ChoiceGroup" decision from being refactored into `ColourSwatch`,
which would resize every other `ColourSwatch` caller in every consumer.

### Group 3 — `description` (2)

| # | Test |
|---|---|
| 13 | **becomes the accessible name while the visible text stays the short code** |
| 14 | works without a swatch, and a swatch works without a description — the two fields are independent |

Test 13 is the headline requirement of the change: one element, two names. It resolves the chip by
`getByRole("radio", { name: "CS3 · More green than yellow" })` — i.e. through the accessibility
tree — and on that same element asserts `textContent === "CS3"` and `title` carries the long string.

### Group 4 — "the new fields change no behaviour" (4)

| # | Test |
|---|---|
| 15 | keeps one tab stop and arrow-key movement when every chip carries a swatch |
| 16 | reports the option id on click, even though the click landed on the swatch |
| 17 | still accepts a consumer's own richer option type, the way DC passes `PickerOption[]` |
| 18 | does not widen the public export surface |

Test 15 tabs *past* the group and asserts focus left it — the swatch must not become a second tab
stop inside the chip. Test 16 clicks the swatch itself and asserts `onValueChange` fired with the
chip's id: the swatch must not swallow the click, or the biggest part of a gloved-hand target
would be dead. Test 17 is the type-collision risk, compiled rather than argued (see
`qa-report.md` §3). Test 18 asserts the runtime export surface is exactly `["ChoiceGroup"]`.

## Environment notes

- **No polyfills needed.** `Select.test.tsx` needs `ResizeObserver` and pointer-capture shims;
  Radix `RadioGroup` needs none under happy-dom. The plan predicted this and it held — no
  `beforeAll` block was required, and no component code was bent to suit the test environment.
- **The held-key form `"{ArrowRight>}"` is deliberate**, and the reason is recorded in a comment in
  the suite: Radix clears its "an arrow is down" flag on `keyup`, which in a headless DOM runs
  before the deferred focus macrotask, so a normal press-and-release moves focus without changing
  the value. That is a test-environment artefact, not a component bug. Reasoning ported from
  Bananaworld-DC's own ChoiceGroup suite, credited in the file.

## Not run, and why

- **No database, so no Postgres.** This package has no persistence, no migrations and no network by
  construction. The throwaway container `chg-cr-design-system-001-pg` was therefore never started;
  `docker ps -a --filter name=chg-cr-design-system-001-pg` returns empty, so nothing was left behind.
- **Consumer test suites were not run.** DC's `tests/unit/components/ChoiceGroup.test.tsx` is a real
  regression gate on this change, but it lives in DC's repository and this session is sandboxed to
  this worktree. It runs in DC's own pin-bump change. See `qa-report.md` §3 for what was done instead.
- **`pnpm lint` does not exist in this package** — there is no `lint` script and no eslint config.
  `pnpm format:check` (prettier) exists but fails repo-wide on pre-existing drift; see
  `known-issues.md`. CI runs neither.
