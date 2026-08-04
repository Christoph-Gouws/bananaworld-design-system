# QA report — CR-DESIGN-SYSTEM-001

> Verdict: **PASS**. Every acceptance criterion traced to a check below.

## 1. Acceptance criteria → verdict

| # | Criterion (from the change request) | How it was verified | Verdict |
|---|---|---|---|
| AC-1 | A `ChoiceOption` may carry a colour swatch | `swatch?: { hex: string; accentHex?: string \| null }` added; tests 6–11 | **PASS** |
| AC-2 | The swatch supports a single colour AND a blended two-colour case | Delegated to `ColourSwatch`; test 7 asserts the `linear-gradient(135deg, …)` blend, tests 8–10 the solid fallback | **PASS** |
| AC-3 | A `ChoiceOption` may carry its own accessible name distinct from its visible text | `description?: string` → `aria-label` + `title`; test 13 resolves the chip by the long name through the a11y tree while `textContent === "CS3"` | **PASS** |
| AC-4 | The full stage name is reachable to a screen reader AND as a tooltip | `aria-label` (screen reader, both surfaces) + `title` (tooltip, browser surface only — honest limit, §4) | **PASS with a stated limit** |
| AC-5 | Both fields are OPTIONAL and undefined for every existing caller | Both declared `?`; test 5 asserts absence of every added attribute and element, plus an exact class-list match | **PASS** |
| AC-6 | The existing `ColourSwatch` is reused, not replaced | `ChoiceGroup.tsx` imports `ColourSwatch`; test 12 asserts `ColourSwatch`'s own defaults are unchanged | **PASS** |
| AC-7 | Radix `RadioGroup` stays underneath — one tab stop, arrow keys, announced as a radio group | Untouched; tests 3, 4, 15 pin all three properties | **PASS** |
| AC-8 | Tests added to the package's own suite covering both new fields | 18 new tests in `tests/components/ChoiceGroup.test.tsx` | **PASS** |
| AC-9 | The additive claim is proven, not asserted | §2 and §3 below; test 5 and test 17 | **PASS** |
| AC-10 | No consumer pin is bumped | No consumer file touched; `changed-files.md` lists two files, both in this package | **PASS** |
| AC-11 | The colour-stage chip component itself is NOT added | Not present. That is DC's follow-up change | **PASS** |
| AC-12 | No other component touched | `git diff --stat` = 1 modified source file | **PASS** |

## 2. The additive claim — the structural proof

Additive-only is the lane rule, so it is proven four ways, all of them mechanical:

1. **The diff removes nothing.** `git diff --stat` on the source file: `57 insertions(+), 0 deletions(-)`.
   Not one line deleted or rewritten — every change is an insertion.
2. **No default changed.** `emptyLabel = "None configured."` is the only default in the component and
   it is untouched (test 2). The two new fields have no default: absent means absent.
3. **No export surface moved.** `src/components/index.ts` is not in the changed-files list. The
   runtime export surface of the module is asserted to be exactly `["ChoiceGroup"]` (test 18);
   `ChoiceOption` and `ChoiceGroupProps` are types and erase at runtime, as before.
4. **A no-new-field chip is byte-identical.** Test 5 asserts the rendered DOM attribute-for-attribute
   and child-node-for-child-node, including the complete `class` string as a literal. Both new
   attributes are `undefined` for such a chip, and React omits an `undefined` attribute entirely —
   so no `title=""` and no `aria-label=""` appear where nothing appeared before.

## 3. Existing callers — which were checked, and how

**Scope limit, stated plainly: this session is sandboxed to its own worktree and cannot open the
consumer repositories.** Attempts to read outside the workspace were refused. So the consumer survey
is *carried forward from the owner-approved plan §3*, which performed it directly, and I have proven
what is provable from inside the package instead. I am not restating the plan's search as if I ran it.

| Consumer | Pin | Uses `ChoiceGroup`? | Why unaffected | Source |
|---|---|---|---|---|
| **Bananaworld-DC** | `b1373c78` — identical to this branch point | **Yes, 5 call sites**: `ReceivingFlow.tsx:2043` (Size), `:2054` (Class), `:2071` (Container via `packingOptions`), `:2364` and `:2441` (`ChipField` wrappers) | All pass `PickerOption[]` and none passes either new field, so every one renders byte-identically per §2.4 | plan §3, not re-verifiable here |
| **Bananaworld-CRM** | `4bc1f220` (older) | not in that checkout | On an older sha; sees nothing until it chooses to bump | plan §3 |
| **Bananaworld-RMS** | `ecba2218` (older) | no | same | plan §3 |
| **Bananaworld-org-admin** | `ecba2218` (older) | no | same | plan §3 |
| **Mangaverde** | `e3a88e35` (older) | no | A **fifth** pinning consumer — the change request names four. Unaffected, but recorded so the count is honest | plan §3 |

### The one real type risk, and what I did about it

DC passes `readonly PickerOption[]` where `readonly ChoiceOption[]` is expected. Adding optional
properties to the *target* of a structural assignment is safe in general — a source that lacks them
is still assignable, and optional properties only ever *relax* excess-property checking. There is
exactly one way it could break: a **name collision**, i.e. `PickerOption` already having `swatch` or
`description` at an incompatible type (`description?: string | null` would do it).

The plan checked this directly and found neither name on `PickerOption`
(`bananaworld-dc/src/lib/receipt/types.ts:369-410`; zero hits outside comments). I cannot re-run
that grep from this sandbox. What I did instead: **compiled the risk as a test.** Test 17 defines a
consumer-shaped interface with unrelated extra fields (`code`, `tare_kg`, `closed_reason: string | null`)
and passes it to `ChoiceGroup`. Under `strict` + `noUncheckedIndexedAccess` it typechecks and
renders with no `aria-label` and no swatch. That pins the assignability property itself in this
package's own CI, permanently, rather than relying on a one-off grep in another repo.

**Residual risk: LOW but not zero** — it rests on the plan's grep of DC's `PickerOption`. It is
fully discharged at bump time by DC's own `tsc` and by DC's existing
`tests/unit/components/ChoiceGroup.test.tsx`, which queries chips by accessible name
(`getByRole("radio", { name: "Large" })`) and asserts the empty state, disabled behaviour, single
tab stop and arrow-key movement. Those queries only keep passing if no `aria-label` appears where
none appeared before — so DC's suite is itself a regression gate on this change. It runs in DC's
pin-bump change, not here. This is recorded in `known-issues.md` as the one thing to watch.

## 4. Accessibility review

| Property | Before | After | Note |
|---|---|---|---|
| Announced as a radio group | yes | yes | Radix untouched; test 3 |
| Single tab stop | yes | yes | tests 4, 15 — the swatch does not add one |
| Arrow keys move and select | yes | yes | tests 4, 15 |
| Chip accessible name | its text | its text, or `description` when given | test 13 |
| Swatch in the a11y tree | n/a | **no** — `ColourSwatch` is `aria-hidden`, so the name never becomes "image" | test 6 |
| Click target | the chip | the chip; the swatch does not swallow the click | test 16 |

**Two contracts the primitive now states in its own doc comment**, both easy to get wrong and both
recorded because they are real limits, not decoration:

1. **`aria-label` REPLACES the accessible name, it does not extend it.** A chip reading "CS3" with
   `description: "Green with trace of yellow"` would be announced as *only* the long name — the code
   the operator can see would never be spoken. So `description` must be a **superset** of the visible
   text. DC's `formatColourStageLabel` already produces `"CS3 · Green with trace of yellow"`, which
   satisfies it. Without this written down the next caller silently loses the visible label from the
   announcement.
2. **Native `title` gives no tooltip on a touchscreen.** The tablet is the whole reason this change
   exists, and `title` only fires on hover. It is kept anyway — it is the agreed contract, it costs
   nothing and it serves the browser surface — but on the tablet the long name is carried by the
   **accessible** name alone. The alternative (wrapping each chip in the package's Radix `Tooltip`)
   would add a wrapper element and a `TooltipProvider` requirement to **every existing caller's** DOM,
   which breaks the byte-identical rule outright. Rejected for that reason, not on taste. This limit
   is already disclosed to the owner in the plan's brief.

## 5. Standards

| Rule | Status |
|---|---|
| TECH-COMP-003 — no business meaning, no permission or scope logic in this package | **Held.** No colour stage, code or hex enters this repo. Colour is caller data. The hexes in the tests are invented literals. |
| `tokens.css` hard rule — business values live in masters, never in tokens | **Held.** `tokens.css` untouched. |
| Surface via `data-surface`, never a prop | **Held.** Tablet sizing uses `[[data-surface=tablet]_&]:` variants, consistent with the rest of the file. |
| Radix underpins interactive primitives | **Held.** No hand-rolled control; `RadixRadioGroup.Root`/`.Item` untouched. |
| No network, no persistence in this package | **Held.** |
