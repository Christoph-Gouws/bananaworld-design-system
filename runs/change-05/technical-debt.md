# Technical debt — CR-DESIGN-SYSTEM-005

> **2 items. Both are deliberate non-builds with a named trigger, not shortcuts taken.**
> 🔴 This is this change's OWN register. Nothing here is appended to a closed epic's register.

## TD-1 — the "Raised by" slot's label is still hard-coded

| Field | Value |
|---|---|
| What | `if (slot === "Raised by") return <HeaderSlot label="Raised by" … />` — the third slot's label is a literal, exactly as the depot slot's was before this change |
| Why not fixed here | **Explicitly out of scope.** The change request names the depot slot only, and the approved plan carried it as OQ-4 with the answer "not built". No caller has asked. Building it now is the configurability-in-anticipation that decisions D-3 and D-13 already refused **in this component** |
| Cost if it is ever needed | **One optional prop and one defaulted expression** — `raisedByLabel?: string`, `props.raisedByLabel ?? "Raised by"`. Identical in shape to `dateLabel` and `dcLabel`. Fully additive; no barrel edit; no consumer forced to move |
| 🔴 Constraint that carries over | `DOCUMENT_HEADER_SLOTS` must stay the single expression of order, and its `"Raised by"` entry must stay byte-identical — Bananaworld-DC's contract test scans this file's source. The override goes **beside** the array, never inside it. The specs added by this change (T-10, T-11) already guard that |
| Trigger | A **second** app whose equivalent concept is not called "Raised by" and which asks for it. Not before |
| Owner | A future change in the design-system lane |

## TD-2 — `dcHint` was not built, so an empty depot slot cannot explain itself

| Field | Value |
|---|---|
| What | The plan's option C: a `dcHint?: string` mirroring the existing `dateHint?: string`, rendered through `HeaderSlot`'s existing `hint` prop. It would let an app write "Not applicable" under the dash instead of shipping a box that reads as a mystery |
| Why not fixed here | **One ground only: no caller has asked.** The owner picked layout A. CR-CRM-015 needs a word, not an explanation, and this component has twice refused configurability built ahead of a decision nobody has taken |
| Cost if it is ever needed | **One optional field and one render argument.** `HeaderSlot` already accepts `hint` and already renders it; nothing new is invented. No layout change. Fully additive |
| Trigger | **CR-CRM-015 saying it wants it** — i.e. the CRM finding that a bare dash reads as an error to its users. It is cheap enough that it should be added the moment that is known, rather than debated |
| Owner | A future change in the design-system lane, prompted by the CRM |

## Not technical debt — recorded here so it is not mistaken for it

| Item | Why it is not debt |
|---|---|
| **Omission is not offered** | A **decision**, taken at the plan gate and stated in three places, not a shortcut. Offering it requires an owner ruling on the narrow-breakpoint layout, because dropping a slot moves the document number out of its corner. `evidence/developer-handover.md` §1 |
| **The narrowed assertion** | Narrowed, never relaxed — the file asserts strictly more afterwards. `known-issues.md` A-1 |
| **`pnpm format:check` failing** | **Pre-existing repo-wide drift**, not created here — four untouched files fail identically. Adopting prettier is a repo-wide decision, not this change's. `known-issues.md` C-1 |
| **No `lint` script / no eslint config** | Pre-existing. `known-issues.md` C-2 |
| **The missing cross-system change register** | A **governance decision for the owner**, raised for the fifth consecutive change. Not something a change may invent |
| **DC's possible contract-mirror narrowing** | Work in **another lane**, named with an owner and a trigger. `evidence/developer-handover.md` §2 |
