# Centrality scorecard — CR-DESIGN-SYSTEM-001

> Does the change live in the right place, at the right altitude, owned by the right module?
> Scored against the files in `changed-files.md`.

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | The change lives in the module that owns the concept | **PASS** | `ChoiceGroup` owns the chip's option contract. The two fields are properties of *an option*, so they belong on `ChoiceOption` — not on `ChoiceGroupProps`, and not in a consumer. |
| 2 | No logic duplicated from elsewhere | **PASS** | The single/blended colour rendering is `ColourSwatch`'s, reused via import. Zero colour maths added here. Test 7 asserts the `linear-gradient(135deg, …)` string comes out of that shared path rather than a local re-implementation. |
| 3 | Sizing owned by whoever knows the constraint | **PASS** | The stripe's 7px/10px width and its gap live in `ChoiceGroup`, because only `ChoiceGroup` knows it must fit a 32px browser chip and a 48px tablet chip. Putting it in `ColourSwatch` would resize every unrelated `ColourSwatch` caller in every consumer — pinned against by test 12. |
| 4 | Business meaning stays out of the shared package | **PASS** | TECH-COMP-003 held. No colour stage, code or hex enters this repo — including the tests, where every hex is an invented literal. Colour is caller data handed in per render; `colour_hex`/`accent_hex` remain DC master data (`banana_colour_stage`). |
| 5 | No permission, tenancy or scoping logic added | **PASS** | None. The chip renders whatever a caller who already passed its own gate hands it. |
| 6 | No network, persistence or IO introduced | **PASS** | None. The package has none by construction and this change adds none. |
| 7 | The export surface is the right shape | **PASS** | Nothing added to it. The change extends an already-exported interface, so `src/components/index.ts` needed no edit — consumers inherit both fields with zero import changes. Asserted by test 18. |
| 8 | Change is at the right altitude for its blast radius | **PASS** | Five repos pin this package by sha. The change is therefore constrained to be purely additive, and is: 57 insertions, 0 deletions, no default changed, no export moved. Every consumer picks it up when it chooses. |
| 9 | Seams identified and recorded | **PASS** | Five seams mapped in the plan §4 and carried into `developer-handover.md`. The forward seam this change *creates* — the frozen field names `swatch`/`description` and the `accentHex: string \| null` nullability that DC's follow-up compiles against — is the important one. |
| 10 | No coordinated multi-app move created | **PASS** | This is the definition of the change staying a change rather than becoming a migration. No consumer is forced to move; no consumer pin is touched. |
| 11 | Foundational behaviour not weakened | **PASS** | Radix `RadioGroup` untouched — single tab stop, arrow-key roving, `radiogroup` role all preserved and pinned by tests 3, 4 and 15. A hand-rolled replacement would look identical and lose all three. |
| 12 | The right thing was left undone | **PASS** | The colour-stage chip component itself is **not** here — it belongs in DC and is the follow-up change. Nor is `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` invented (see below). |

## Score: 12 / 12 PASS

## Cross-system seams touched or revealed

| # | Seam | Direction | Effect of this change |
|---|---|---|---|
| 1 | design-system → Bananaworld-DC | this package **writes** the option contract, DC **reads** it | DC is on the identical sha today (`b1373c78`), so on merge DC is one pin-bump behind. That bump is **DC's own change, against the MERGED `main` sha, never this branch sha** (KI-M001E19-002 was exactly that mistake). Nothing here touches DC. |
| 2 | design-system → CRM / RMS / org-admin / Mangaverde | four consumers **read** on older shas | Nothing. Each bumps when it chooses. |
| 3 | design-system → DC's colour-stage-chip follow-up | forward seam this change **creates** | The field names and the `accentHex` nullability are frozen here deliberately so that follow-up compiles unedited. |
| 4 | Colour data ownership | DC master data → this package | The package renders what it is handed and owns no colour constant. Unchanged by this work, and defended by criterion 4 above. |
| 5 | Shared-record write seam | — | **None.** No database, no migration, no permission surface. |

## Recorded, not invented

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repository** — there is no
`governance/` directory. The seams above are therefore recorded in the plan, in this scorecard and
in `developer-handover.md`, and nowhere else. Creating that register is a governance decision, not
part of this change; flagged in `known-issues.md` rather than invented here.
