# CR-DESIGN-SYSTEM-001 — a colour block and a fuller name on a choice chip (additive)

> Repo: `bananaworld-design-system` · Branch: `change/cr-design-system-001` · Planned 2026-08-04
> Nothing has been built, run or tested in this session. This is a plan only.

<!-- OWNER-BRIEF-START -->

**What you get.** The shared set of building blocks that all your systems draw from can today only put
words on a tappable button. This adds two optional extras: a small block of colour on the button, and a
fuller name that is shown when you hover and read out to anyone using a screen reader. That is the
missing piece that lets the receiving screen's colour-stage buttons be built next, so a receiver in
gloves taps a stage once instead of tapping, scrolling and tapping again.

**What I need from you.** Please look at the three pictures and tell me which colour block you prefer —
a small square, a full-height stripe down the edge of the button, or a larger round dot. That is the
only decision. The shape of the buttons themselves is already settled from last time and I am not
reopening it.

**Not included.** The receiving screen's colour buttons themselves — those are the next, separate piece
of work in the delivery system. No other button row anywhere changes. None of your five systems is
moved onto this update; each one picks it up when it chooses to.

**Risks.** None to what is on screens today: every existing button row must look exactly as it does
now, and proving that is part of the work. One honest limit — hover text does not appear on a
touchscreen, so on the tablet the fuller name is read aloud but not shown.

<!-- OWNER-BRIEF-END -->

---

# Technical plan

## 1. Verified current state (read this session, not assumed)

| Fact | Evidence |
|---|---|
| `ChoiceOption` is exactly `{ id, name, disabled? }` | `src/components/ChoiceGroup.tsx:26-30` |
| The chip renders `{option.name}` as its only child | `src/components/ChoiceGroup.tsx:77` |
| Built on Radix `RadioGroup.Root` / `.Item` | `src/components/ChoiceGroup.tsx:4,44,55` |
| `ColourSwatch` already exists, handles single + blended two-colour, is `aria-hidden`, accepts `className` | `src/components/ColourSwatch.tsx:19-31` |
| Both are already exported from the barrel — `ChoiceGroup`, `ChoiceOption`, `ChoiceGroupProps`, `ColourSwatch` | `src/components/index.ts:32,70` |
| The package HAS its own component test runner (happy-dom project) | `vitest.config.ts:21-28`; `tests/components/{Select,Combobox}.test.tsx` |
| CI runs `pnpm test`, which covers the components project | `.github/workflows/ci.yml:41-53` (job label still says "pricing & sales-order engines" — pre-existing drift, out of lane, leaving it) |

So the reference proposal's premise is correct: the two fields genuinely do not exist, and the chip has
no adornment slot of any kind.

**HEAD of this worktree is `b1373c7`** — the exact sha Bananaworld-DC pins. The proposal was written
against the current source, not a stale one.

## 2. The change

### 2.1 `ChoiceOption` — two optional fields, names frozen

```ts
readonly swatch?: { readonly hex: string; readonly accentHex?: string | null };
readonly description?: string;
```

Names kept exactly as `swatch` and `description` so the prepared DC follow-up
(`ColourStageChips.proposed.tsx.txt`, which maps `swatch: { hex: stage.colour_hex, accentHex:
stage.accent_hex }` and `description: formatColourStageLabel(stage)`) compiles against the merged
package without edit. `accentHex` is `string | null | undefined` to match `ColourSwatchProps` exactly and
to match DC's `ColourStageOption.accent_hex?: string | null` — a narrower `string | undefined` would
force every caller to strip nulls, which is how an "additive" change turns into a migration.

### 2.2 Rendering

- When `swatch` is present, render `<ColourSwatch hex accentHex className=…/>` before `option.name`.
  Nothing else moves. `ColourSwatch` is already `aria-hidden`, so the chip's accessible name is never
  polluted with "image".
- `title={option.description}` and `aria-label={option.description}`. Both are `undefined` for every
  existing caller, and React omits an attribute whose value is `undefined` — no `title=""`, no
  `aria-label=""`, no rendered element. That is the byte-identical guarantee, and §5 pins it as a test.
- Sizing lives in `ChoiceGroup`, not in `ColourSwatch`: the swatch has to fit a 32px browser chip and a
  48px tablet chip, and only `ChoiceGroup` knows those. `ColourSwatch`'s own default (`h-7 w-7`) is
  overridden through `className`; `cn` is `twMerge(clsx(...))` (`src/lib/cn.ts:8-10`), so `h-4 w-4`
  cleanly displaces `h-7 w-7` and the `[[data-surface=tablet]_&]:` variants merge independently.
  **`ColourSwatch` itself is not touched.**

### 2.3 Where the reference proposal is wrong, and what I am doing instead

Three findings, stated plainly as instructed:

1. **A comment contradicts its own code.** The proposal's inline comment claims "28px (ColourSwatch's
   own default) fills a 32px browser chip" while the code sets `h-4 w-4` (16px) and `h-5 w-5` (20px) on
   tablet. 28px cannot fit inside a 32px chip that also has a 1px border, 12px horizontal padding and
   text beside it — the code is right and the comment is wrong. The comment gets rewritten to state the
   real sizes and why.
2. **`aria-label` REPLACES the accessible name; it does not add to it.** A chip reading "CS3" with
   `description: "Green with trace of yellow"` would be announced as *only* the long name — the code the
   operator can see would not be spoken at all. This is fine and is what the DC follow-up already does,
   because DC's `formatColourStageLabel` produces `"CS3 · Green with trace of yellow"` (code included).
   But it is a contract the primitive must state, so the doc comment will say: **`description` must be a
   superset of the visible text, not a replacement for it.** Without that written down, the next caller
   silently loses the visible label from the announcement.
3. **`title` gives no tooltip on a touchscreen.** The tablet is the whole reason this exists, and native
   `title` only fires on hover. I am keeping `title` anyway — it is the agreed contract, it costs
   nothing, and it serves the browser surface — but the *accessible* name is what carries the long name
   on the tablet, and the doc comment will say so. The alternative (wrapping each chip in the package's
   Radix `Tooltip`) would add a wrapper element and a `TooltipProvider` requirement to **every existing
   caller's** DOM, which breaks the byte-identical rule outright. Rejected for that reason, not on taste.

Otherwise the proposal is sound and I am keeping it: same field names, same placement, same class list,
same Radix `RadioGroup` underneath. No hand-rolled control, no export surface movement.

## 3. Additive proof — the callers I actually checked

Every consumer repo on this machine was searched, not assumed.

| Consumer | Pin | Uses `ChoiceGroup`? | Why unaffected |
|---|---|---|---|
| **Bananaworld-DC** | `b1373c78` (= this HEAD) | **Yes — 5 call sites** | `src/components/tablet/ReceivingFlow.tsx:2043` (Size), `:2054` (Class), `:2071` (Container via `packingOptions`), and the two `ChipField`/wrapper sites at `:2364`, `:2441`. All pass `PickerOption[]`. |
| **Bananaworld-CRM** | `4bc1f220` (older) | No source present in this checkout | On an older sha; sees nothing until it bumps. |
| **Bananaworld-RMS** | `ecba2218` (older) | No match | Same. |
| **Bananaworld-org-admin** | `ecba2218` (older) | No match | Same. |
| **Mangaverde** | `e3a88e35` (older) | No match | **A fifth pinning consumer** — the change request names four. Unaffected, but recorded. |

**The one real type risk, checked:** DC passes `readonly PickerOption[]` where `readonly ChoiceOption[]`
is expected. If `PickerOption` already carried a `description` or `swatch` of an incompatible type
(e.g. `description?: string | null`), adding the fields would break DC's `tsc` the moment it bumps —
an additive change that is not additive. **It does not.** `PickerOption`
(`bananaworld-dc/src/lib/receipt/types.ts:369-410`) has `id`, `code`, `name`, `size_id`, `class_id`,
`tare_kg`, `pallet_tare_kg`, `min_kg`, `max_kg`, `parent_container_type_id`, `units_per_parent`,
`packed_directly`, `closed_reopens_at`, `closed_reason`, `room_type` — **no `description`, no `swatch`**
(grepped both names across that file: zero hits outside comments). Structural assignability is
unchanged, both before and after a bump.

**Runtime proof at bump time:** DC's own `tests/unit/components/ChoiceGroup.test.tsx` queries chips by
accessible name (`getByRole("radio", { name: "Large" })`) and asserts the empty state, disabled
behaviour, single tab stop and arrow-key movement. Those queries only keep passing if no `aria-label`
appears where none appeared before — so DC's suite is itself a regression gate on this change, and the
build session must state that it read it. It cannot *run* it (that is DC's repo, DC's change).

**Verification the build session must actually perform (not assert):** `pnpm typecheck` and `pnpm test`
in this package, both green, output pasted into the evidence.

## 4. Cross-app intersection map (MANDATORY)

Seams this change touches or reveals:

1. **design-system → Bananaworld-DC.** This package **writes** the option contract; DC **reads** it. DC
   is on the identical sha today, so the moment this merges DC is one pin-bump behind — a bump **DC
   performs in its own change, against the merged `main` sha, never this branch sha** (KI-M001E19-002 was
   exactly that mistake). Nothing in this change touches DC.
2. **design-system → CRM / RMS / org-admin / Mangaverde.** Four consumers **read** the package on older
   shas. Each bumps when it chooses. No coordinated move is created or required by this change — which is
   the definition of it staying a change rather than becoming a migration.
3. **design-system → the DC follow-up change (colour-stage chips).** A forward seam this change
   *creates*: the field names `swatch` and `description` and the `accentHex: string | null` nullability
   are the contract that follow-up compiles against. They are frozen here deliberately.
4. **Colour data ownership.** `colour_hex` / `accent_hex` are DC master data
   (`banana_colour_stage`). The package **renders what it is handed and owns no colour constant** —
   TECH-COMP-003 and the `tokens.css` hard rule (business values live in masters, never in tokens). No
   colour stage name, code or hex enters this repo, including in tests, where they are invented literals.
5. **No shared-record write seam. No database, no migration, no permission surface.** This package has
   no network access and no persistence by construction.

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo** (there is no `governance/`
directory and no `source-documents/`), so there is nowhere to record seams beyond this plan. Creating
that register is a governance decision, not part of this change; flagging it rather than inventing it.

## 5. Test plan — `tests/components/ChoiceGroup.test.tsx` (new)

The package owns the proof from now on. Written in this repo's existing style (plain DOM assertions, no
`jest-dom` matchers — it is not wired in here either).

Baseline, so the additive claim is a *test* and not a sentence:

1. Renders every option; only the selected one is `aria-checked="true"`.
2. Announces as one `radiogroup`, zero `button` roles — the Radix guarantee that a hand-rolled chip row
   would fail.
3. Arrow key moves *and* selects. Must use the held-key form `"{ArrowRight>}"`; DC's suite documents why
   (Radix clears its "arrow is down" flag on `keyup` before the deferred focus macrotask runs, so a
   normal press-and-release moves focus without changing the value — in the test only). Porting that
   reasoning across, credited.
4. **An option with neither new field renders no `title` and no `aria-label` attribute at all, and the
   chip's only child is its text** — the byte-identical assertion, stated as `hasAttribute(...) === false`
   rather than a snapshot, so it cannot rot silently.

The two new fields:

5. `swatch: { hex }` renders one `aria-hidden` block whose inline background is that hex; the chip's
   accessible name is still just `name`.
6. `swatch: { hex, accentHex }` renders the `linear-gradient(135deg, …)` blend — proving the blended
   path reaches `ColourSwatch` rather than being re-implemented.
7. `accentHex: null` and `accentHex: ""` fall back to the solid fill (`ColourSwatch.tsx:20-23` treats
   both as absent) — the exact shape DC's nullable master data produces.
8. **`description` becomes the accessible name while the visible text stays the short code** — the
   headline requirement: `getByRole("radio", { name: "CS3 · Green with trace of yellow" })` and
   `textContent === "CS3"` on the same element, plus `title` carrying the same string.
9. A chip with a swatch is still reachable by arrow key and still reports its id on click — the swatch
   does not become a click target or an extra tab stop.
10. Export surface unchanged: `Object.keys(await import("../../src/components/ChoiceGroup")).sort()`
    equals `["ChoiceGroup"]`, mirroring the convention in `tests/components/Select.test.tsx:84-97`.

**Environment risk: low, and checked.** `Select.test.tsx` needed `ResizeObserver` / pointer-capture
polyfills. Radix `RadioGroup` appears not to — DC runs this identical component under happy-dom with no
polyfills at all (`bananaworld-dc/vitest.config.ts:8`, and its ChoiceGroup suite declares none). If a
gap does appear, the fix is the same `beforeAll` block already used here, not a component change.

## 6. Files expected to change

| File | Change | Rough size |
|---|---|---|
| `src/components/ChoiceGroup.tsx` | Two optional fields + swatch/title/aria-label rendering + doc comment covering the `description` superset rule and the touch-tooltip limit | ~+45 lines, 0 removed |
| `tests/components/ChoiceGroup.test.tsx` | New suite, §5 | ~+155 lines |

Not touched, deliberately: `src/components/ColourSwatch.tsx`, `src/components/index.ts` (already exports
everything needed), `vitest.config.ts` (`tests/components/**/*.test.tsx` is already globbed),
`.github/workflows/ci.yml`, `package.json`, every other component, and every consumer repo.

## 7. Data model, scoping, permissions

- **Data model:** none. No database, no migration, no persisted field. `swatch` and `description` are
  presentation inputs handed in per render.
- **Scoping / tenancy:** none. This package has no `warehouse_id` / `legal_entity` awareness by rule.
- **Permissions:** none. No permission logic may live here (TECH-COMP-003); the chip renders whatever a
  caller who already passed its own gate hands it.

## 8. Open questions

1. **Swatch treatment (owner, in the brief).** Small square / edge stripe / round dot — rendered as
   options A, B, C. Default if the owner does not pick: **A**, the reference proposal's small square, as
   it is the treatment already reviewed at CR-DC-022.
2. **Whether to add `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` to this repo** — noted in §4, not done
   here, not blocking.

Neither blocks the build; question 1 changes about four class names.

## 9. Why this is a change, not an epic

Two files, one optional-field pair, no service, no integration, no tenancy or authorisation model, no
new section of the system. It does not decompose into five controlled units of work — it barely
decomposes into two. `epicRecommended: false`.
