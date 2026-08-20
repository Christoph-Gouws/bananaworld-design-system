# Centrality scorecard — CR-DESIGN-SYSTEM-005

> Stage 05. Does this change put logic in the right place, and does it create work in other systems?
> **12 / 12 PASS. 6 cross-system seams mapped. 0 coordinated multi-app moves created.**

## 1. Scorecard

| # | Criterion | Verdict | Note |
|---|---|---|---|
| 1 | **The logic lives at the right altitude** | ✅ PASS | The DEFAULT belongs to the package (it is the standard's word); the OVERRIDE belongs to the wearing app. Nothing else moved |
| 2 | **One definition, not two** | ✅ PASS | `DOCUMENT_HEADER_SLOTS` remains the single expression of slot identity and order. T-11 asserts no second list exists |
| 3 | **No logic pushed into consumers that belongs here** | ✅ PASS | An app supplies a word, which is the only thing it can supply — the package cannot know what a CRM calls its equivalent concept |
| 4 | **No app knowledge pulled into the package** | ✅ PASS | `dcLabel` is a `string`. The component still learns nothing about tenancy, warehouses or entities — the property `DocumentOrigin` already established for the VALUE, now true of the LABEL too |
| 5 | **No session, no network, no permission logic** | ✅ PASS | TECH-CON-004 / TECH-COMP-003 held; the pre-existing `useAuth` and `@/…` guards still green |
| 6 | **The export surface did not move** | ✅ PASS | Three barrels, `git diff` **empty**. T-12 asserts the same eight symbols |
| 7 | **Additive-only lane rule held** | ✅ PASS | No field removed, no default changed, no export moved. `+30 / −1` with the one deletion itemised |
| 8 | **No consumer pin bumped** | ✅ PASS | None of the four. A pin moves in the consumer's own lane, against the **merged** sha (KI-M001E19-002) |
| 9 | **No coordinated multi-app migration created** | ✅ PASS | Every consumer keeps working unchanged, at its current pin and after a bump. Nothing must move in lockstep |
| 10 | **Cross-repo source contracts respected** | ✅ PASS | DC's two pinned strings are byte-identical. The one substring that had to move is declared, and DC is red nowhere today |
| 11 | **Work created in other systems is named, not left to be discovered** | ✅ PASS | Two items, both named with an owner — `developer-handover.md` §2 |
| 12 | **Nothing built in anticipation of a decision nobody has taken** | ✅ PASS | Omission not built; `dcHint` not built; "Raised by" not touched. Three refusals, each with a stated trigger |

## 2. Cross-system seams

| # | Seam | Who WRITES | Who READS | State after this change |
|---|---|---|---|---|
| S-1 | The depot slot's printed word | **This package** writes the default `"DC"` and the mechanism | DC, CRM, RMS, org-admin — **each only after it bumps its own pin** | The package owns the default; the wearing app owns the word. **No pin bumped here** |
| S-2 | CR-CRM-015's unblock | This package (this change) **and** the CRM (its own pin bump + adoption) | — | **Two changes, two lanes, in that order.** This change alone does not unblock it |
| S-3 | DC's `tests/contract/transaction-form-standard.test.ts` — a source-text contract on **this file** | This package writes the source | **DC reads it as text**, once DC adopts | **Held.** The declaration and `const slots = DOCUMENT_HEADER_SLOTS;` are byte-identical, and now pinned here by T-10 with DC named as the reason |
| S-4 | DC's thirteen live render sites across twelve forms | DC | This package's default | **Unaffected.** None passes `dcLabel`; `?? "DC"` yields the identical string. Asserted by T-1 |
| S-5 | The export surface (three barrels) | This package | All four consumers, at bump time | **No movement at all.** Zero barrel edits, zero new exports. A consumer that upgrades sees only a widened optional prop |
| S-6 | Database / migration | — | — | **None.** This package has no database, and the slot's value is a plain `string \| null` name — no `warehouse_id`, no tenancy identifier |

## 3. Work this change creates elsewhere — named, with owners

| # | Work | Owner | Blocking? |
|---|---|---|---|
| W-1 | Bump the CRM's pin to this change's **merged** `main` sha, then pass its own word | **CR-CRM-015**, in the crm lane | It is the other half of the unblock. Not startable until this merges |
| W-2 | 🔴 **Possibly** a one-line narrowing in DC's contract mirror, IF that mirror pins the full `label="DC" value={props.origin.dcName}` substring. **Unverified — consumer repos are unreadable from here and none was opened** | **DC's lane**, at its next pin bump | **No.** DC pins an older sha; nothing here reaches it until DC chooses to move. It is already on the list of assertions that redden **by design** at DC's adoption (`runs/change-02/evidence/developer-handover.md` §3) |

**Nothing else.** RMS and org-admin import `DocumentHeader` nowhere and have no work from this change.

## 4. The governance gap — fifth consecutive change to raise it

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist and there is no `governance/` directory.
The six seams above would belong in it. **Creating one is a governance decision for the owner, not
something a change may invent** — so they are recorded here and in `developer-handover.md` instead.
Raised by CR-001 (D-12), CR-002 (D-10), CR-003, CR-004, and now CR-005.

## 5. Verdict

**PASS — 12 / 12.** The change puts the default where the standard lives and the word where the app
lives, and it creates **zero** lockstep migrations.
