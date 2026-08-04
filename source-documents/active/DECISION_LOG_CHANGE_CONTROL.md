# Decision log — change control · `bananaworld-design-system`

> Material decisions taken under the change lane for `@bananaworld/design-system`.
> One entry per change. Newest first.

---

## CR-DESIGN-SYSTEM-001 — a colour swatch and an accessible name on a ChoiceGroup chip

| Field | Value |
|---|---|
| Type | CHANGE / DECISION |
| Status | **ACCEPTED** — plan approved at the plan gate, built on branch `change/cr-design-system-001` |
| Date | 2026-08-04 |
| Branch point | `origin/main` @ `b1373c7` (the sha Bananaworld-DC pins) |
| Ship mode | **on-green** |
| Archive | `runs/change-01/` |

### What was asked

Let a `ChoiceGroup` chip carry a colour swatch and its own accessible name, **additively**.

The driver: Bananaworld-DC change **CR-DC-022** set out to replace the tablet receiving screen's
colour-stage dropdown with tappable chips, so a receiver in gloves picks a banana colour stage in
one tap instead of tap-scroll-tap. It could not be built. At the pinned sha a `ChoiceOption` was
exactly `{ id, name, disabled? }` and the chip rendered `{option.name}` as its only child — no
swatch, no adornment slot, and no way to give a chip an accessible name distinct from its visible
text. The owner's layout needs a colour block beside a short code (CS1, CS2 …) with the full stage
name ("Green with trace of yellow") still reachable to a screen reader and as a tooltip. Neither the
chosen layout nor its alternative was expressible against the existing props, so CR-DC-022 shipped
its other two items and this became its own change in the design-system repository.

### What was decided at the plan gate

**The plan was APPROVED, with layout B, ship mode on-green.**

| # | Decision | Rationale |
|---|---|---|
| D-1 | **Two optional fields on `ChoiceOption`: `swatch` and `description`.** Nothing removed, no default changed, no export surface moved. | Five repos pin this package by git sha and each bumps when it chooses. A change that forces them all to move at once is not a change, it is a coordinated multi-app migration — i.e. an epic. Purely additive is what keeps it a change. |
| D-2 | **Field names frozen as `swatch` and `description`.** | So DC's prepared follow-up (`ColourStageChips.proposed.tsx.txt`, which maps `swatch: { hex: stage.colour_hex, accentHex: stage.accent_hex }` and `description: formatColourStageLabel(stage)`) compiles against the merged package without edit. |
| D-3 | **`accentHex` typed `string \| null \| undefined`**, not `string \| undefined`. | Matches `ColourSwatchProps` exactly and matches DC's `ColourStageOption.accent_hex?: string \| null`. Narrowing it would force every caller to strip nulls — how an "additive" change quietly becomes a migration. |
| D-4 | **Layout B — the full-height colour stripe** flush to the chip's left edge, with the short code beside it. | **The owner's choice**, made at the plan gate from three rendered mockups (A: small square — the treatment already reviewed at CR-DC-022; B: full-height edge stripe; C: larger round dot). B reads as a colour-coded row from further away — the strongest option across a cold room — at the cost of a slightly bolder look. The trade recorded in the mockup: a chip with a colour is slightly wider than one without, and the pale selected fill has less room to show. |
| D-5 | **Reuse the existing `ColourSwatch`; do not write a new one.** Chip-relative sizing lives in `ChoiceGroup`. | `ColourSwatch` already handles the solid and blended two-colour cases and is already `aria-hidden`. But only `ChoiceGroup` knows the 32px browser / 48px tablet chip the stripe must fit — putting the sizing in `ColourSwatch` would silently resize every other `ColourSwatch` caller in every consumer. |
| D-6 | **Keep Radix `RadioGroup` underneath.** | One tab stop, arrow keys between options, announced as a radio group. A hand-rolled group of buttons that looks identical and loses that is a regression, not a simplification — keyboard, focus and screen-reader behaviour are the reason the primitive exists. |
| D-7 | **`description` must be a SUPERSET of the visible text** — recorded as a written contract in the component's doc comment. | `aria-label` *replaces* the accessible name, it does not extend it. A chip reading "CS3" with `description: "Green with trace of yellow"` would be announced as only the long name, so the code the operator can see would never be spoken. Correct for DC (whose `formatColourStageLabel` includes the code), but without it written down the next caller silently loses the visible label from the announcement. |
| D-8 | **Keep `title` even though it gives no tooltip on a touchscreen**; reject wrapping chips in Radix `Tooltip`. | `title` only fires on hover, and the tablet is the whole reason this change exists — so on tablet the long name rides on the accessible name alone. Kept anyway: it is the agreed contract, costs nothing, and serves the browser surface. The `Tooltip` alternative would add a wrapper element and a `TooltipProvider` requirement to **every existing caller's** DOM, breaking the byte-identical rule outright. Rejected on that ground, not on taste. Disclosed to the owner in the plan's brief as an honest limit. |
| D-9 | **No consumer pin bumped by this change.** | Each consumer moves its own pin, in its own change, against the **merged** sha on `main` — never a branch sha. KI-M001E19-002 is that exact mistake on record. |
| D-10 | **The colour-stage chip component is NOT built here.** | It belongs in Bananaworld-DC and is the follow-up change. This change delivers the capability, not the screen. |
| D-11 | **`epicRecommended: false` — this is a change, not an epic.** | Two files, one optional-field pair, no service, no integration, no tenancy or authorisation model, no new section of the system. It does not decompose into five controlled units of work. |
| D-12 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` is NOT created here.** | It does not exist in this repo and there is no `governance/` directory. Creating it is a governance decision, not part of this change — flagged rather than invented. Seams are recorded in the plan, in `centrality-scorecard.md` and in `developer-handover.md`. |

### Clarify questions and answers

The owner responses recorded for this change were:

- **`[plan]` — plan APPROVED (layout B) — ship on-green.**

That single response settled the one open question the plan raised for the owner (open question 1,
the swatch treatment: small square / edge stripe / round dot). The plan's stated default had the
owner not picked was **A** (the reference proposal's square, already reviewed at CR-DC-022); the
owner picked **B** instead, so B is what was built. See D-4.

Open question 2 in the plan (whether to add a cross-system change register to this repo) was noted
as non-blocking and was not answered; it is carried forward as D-12 and `known-issues.md` C-4.

**No further clarification was requested and none was needed** — no new decision arose during the
build that the approved plan had not already answered, so no `NEEDS_OWNER: decision` gate was hit.

### Findings against the reference proposal

The change request supplied a complete drop-in replacement written during CR-DC-022 in another
repository, by a session that could not run this package's tests, and explicitly asked that it be
verified rather than pasted unread. It was verified. Three findings, all recorded in the plan §2.3
and honoured in the build:

1. **A comment contradicted its own code** — it claimed "28px (ColourSwatch's own default) fills a
   32px browser chip" while the code set 16px. 28px cannot fit a 32px chip that also has a 1px
   border, 12px of horizontal padding and text beside it. The comment was not carried over.
2. **The `aria-label` replacement behaviour was undocumented** → became D-7.
3. **The touch-tooltip limit was unstated** → became D-8.

Otherwise the proposal was sound and was kept: same field names, same placement, same Radix
foundation. The visual treatment differs only because the owner chose layout B after it was written.

### Outcome

Built as approved. `pnpm typecheck` clean; `pnpm test` **79 passed / 7 files** (baseline 61/6 before
any edit, so +18 new tests). 57 insertions and **0 deletions** in the source file. 0 open defects.
Full evidence in `runs/change-01/`.
