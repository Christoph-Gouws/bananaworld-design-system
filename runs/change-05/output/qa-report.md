# QA report — CR-DESIGN-SYSTEM-005

> Stage 04. Every acceptance criterion drawn from the change request and the approved plan, each
> traced to a verdict. **22 criteria · 21 PASS · 1 N/A with a stated cause · 0 FAIL.**
> Plus 12 adversarial checks and 8 standards, below.

## 1. Acceptance criteria — from the change request

| # | Criterion (as written) | Verdict | Evidence |
|---|---|---|---|
| AC-1 | The depot slot's label becomes overridable, **defaulting to "DC"** | **PASS** | `dcLabel?: string`, `props.dcLabel ?? "DC"`. Specs T-1, T-2 |
| AC-2 | A caller that passes nothing renders "DC" and is **byte-identical to today** | **PASS** | T-1 asserts `slotLabels()` equals `[...DOCUMENT_HEADER_SLOTS]`. The prop is `undefined`; `?? "DC"` yields the identical string; `HeaderSlot` receives identical props. Mutation M-2 proves T-1's block bites |
| AC-3 | The CRM can pass its own word | **PASS** | T-2, T-7. `dcLabel="Branch"` renders "Branch" in slot 2 |
| AC-4 | **Decide, explicitly, what an app does when it has nothing for that slot** | **PASS** | **Layout A: the slot is always present; omission is NOT offered.** Stated in the `dcLabel` doc comment, `implementation-summary.md` §2, `developer-handover.md` §1 |
| AC-5 | If omission is NOT offered, **say why not** | **PASS** | Three reasons, in weight order, in `implementation-summary.md` §2 — the `lg:grid-cols-4` layout consequence against the owner's 2026-08-08 "document number top right" instruction being the binding one |
| AC-6 | It must be a **stated** answer, not a thing the CRM discovers | **PASS** | In the source where a CRM developer reads the prop, in the handover, and as a spec (T-6) that fails if a hole appears |
| AC-7 | 🔴 `DOCUMENT_HEADER_SLOTS` remains the **single expression of ORDER** | **PASS** | Not one character changed. T-11 asserts exactly one array literal of slot names, four entries, `"DC"` second, and that the render still walks the constant. Mutation M-4 caught |
| AC-8 | 🔴 **Additive or it is wrong.** No existing caller changes a line or changes behaviour | **PASS** | `git diff` on all three barrels is **empty**; `src/` is `+30 / −1` with the one deletion itemised (a one-line `return` → its braced form); no field removed, no default changed, no export moved |
| AC-9 | 🔴 **Keep the constant and the render expression intact** — DC pins the source text | **PASS** | Declaration byte-identical; `const slots = DOCUMENT_HEADER_SLOTS;` unchanged; `slots.map(` unchanged. T-10 pins all three and now names DC as the reason |
| AC-10 | Pin the cross-repo negative **as an assertion in THIS repo** | **PASS** | T-10 re-fenced with DC's contract test named; **T-11 added**. M-4 confirms both bite |
| AC-11 | No change to Bananaworld-DC and none to Bananaworld-CRM | **PASS** | No consumer file touched; no consumer repo opened. `changed-files.md` §3 |
| AC-12 | Do not touch `DocumentOrigin`, its discriminant, or CR-DC-039's reason | **PASS** | Lines 166–182 untouched. Verified in the diff |
| AC-13 | Do not touch the Document no. slot's five states or the Date slot's states | **PASS** | Untouched. Their 12 existing specs pass unedited |
| AC-14 | No fifth slot · no reorder · no restyle | **PASS** | Four entries; T-6 asserts four slots across 4 prop combinations; **not one class name changed** anywhere in the file |
| AC-15 | Do not remove `dateLabel` or fold the two label props into one shape | **PASS** | `dateLabel` untouched at line 186 and at both points of use. Two independent optional props. T-7 asserts they do not interact |
| AC-16 | Follow the `dateLabel` precedent unless you can say why it must differ | **PASS** | Followed exactly — one optional prop, defaulted at the point of use, `??` not `||`. No reason to differ was found, and T-9 pins the two to the same semantics |

## 2. Acceptance criteria — from the TESTING section of the request

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| AC-17 | Every existing caller renders identically with the prop absent — **assert the four labels in order, unchanged** | **PASS** | T-1, literally that assertion |
| AC-18 | A caller passing a label renders that word in that slot and **leaves the other three untouched** | **PASS** | T-2 asserts the full four-label array |
| AC-19 | The slot's empty state still behaves as today when the name is null, under **both** the default label and an overridden one | **PASS** | T-4 (default) and T-5 (overridden) — em dash, `border-dashed`, `text-fg-subtle` |
| AC-20 | Whatever is decided about omission is covered by a test that **would fail if it silently changed** | **PASS** | T-6, proved by mutation M-3 (4 specs red) |
| AC-21 | The exported declaration still reads **character for character** as DC expects, and the render still reads `const slots = DOCUMENT_HEADER_SLOTS;` | **PASS** | T-10, proved by mutation M-4 |

## 3. Deployed / runtime verification

| # | Criterion | Verdict | Cause |
|---|---|---|---|
| AC-22 | Verified in a running application | **N/A — stated cause, not a skip** | This is a **source-only, sha-pinned library** with no app shell, no route and no runnable screen. It is not deployed; consumers transpile it. Substitute proofs in `deployed-verification.md` |

## 4. Adversarial checks — what a reviewer would try to break

| # | Attack | Result |
|---|---|---|
| ADV-1 | Pass `dcLabel="Date"` — can a label impersonate a slot? | **No.** T-8: the render keys off the array entry, never the printed text. Both slots stay put and their values differ |
| ADV-2 | Pass `dcLabel=""` — does it silently fall back to "DC"? | **No, and deliberately so.** `??` passes the empty string through, exactly as `dateLabel=""` does. T-9 pins it. A `\|\|` here would make the two props behave differently for the same input |
| ADV-3 | Pass `dcLabel` **and** `dateLabel` — do they collide? | **No.** T-7: both words land, order intact |
| ADV-4 | Does the override leak into `DOCUMENT_HEADER_SLOTS` or `DocumentHeaderSlot`? | **No.** The constant and the derived type are untouched; T-11 asserts no second slot list and no interpolated array |
| ADV-5 | Does the new prop reach the barrel's export surface? | **No.** A new optional field on an already-exported interface. T-12 asserts exactly the same eight symbols; `git diff` on all three barrels is empty |
| ADV-6 | Can a caller now produce a 3-slot header? | **No.** T-6 across 4 prop combinations, counting both labels and `dl > div` children. M-3 confirms |
| ADV-7 | Does anything read a session, or an app path? | **No.** The two pre-existing guards (`no @/…`, `no useAuth`) pass; the narrowed spec still asserts the value comes from `props.origin.dcName` |
| ADV-8 | Could a future "tidy-up" fold the label into the array and stay green? | **No** — that is exactly mutation M-4, and it reddens T-10 and T-11 |
| ADV-9 | Does the change add an interactive element that should have been Radix? | **No element added at all.** The change is one prop and one defaulted string. Nothing was hand-rolled and no Radix control was replaced |
| ADV-10 | Does the empty state under an overridden label quietly gain wording? | **No.** T-5 asserts "Not applicable" is absent — option C was considered and not built |
| ADV-11 | Is `DocumentOrigin`'s discriminant still load-bearing and unsimplified? | **Yes.** Untouched; its two existing specs pass unedited |
| ADV-12 | Does the change claim to unblock CR-CRM-015 by itself? | **No, and it says so in five places.** It is one half of a two-lane unblock; the CRM bumps against the **merged** sha |

## 5. Standards held

| Standard | Held |
|---|---|
| **Additive-only lane rule** | ✅ proved by diff, not asserted — barrels empty, one itemised deletion |
| **Radix underpins interactive primitives** | ✅ N/A by construction — no interactive element added or replaced |
| **Pure presentation** (TECH-CON-004 / TECH-COMP-003) | ✅ no network, no session, no permission logic, no app import |
| **No consumer pin bumped** | ✅ none, and never against a branch sha (KI-M001E19-002) |
| Accessibility | ✅ the `<dl>/<dt>/<dd>` shape is unchanged; the depot slot has no control, so it correctly remains a `<dt>` and not a `<label>` — a `<label>` with nothing to label would be a lie to a screen reader |
| Owner ruling Q12 (date top left) · 2026-08-08 (document number top right) | ✅ T-3, T-6, T-8 |
| Comment-stripped source scans | ✅ the new T-11 scans stripped source, so a claim cannot be satisfied by a comment |
| No performance claim made anywhere | ✅ none made |

## 6. Verdict

**PASS — ready for PR.** 0 open defects. 0 open decisions. 21 of 22 acceptance criteria PASS, 1 N/A
with a stated cause.
