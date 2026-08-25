# Centrality scorecard (Stage 05) — CR-DESIGN-SYSTEM-007

> How central is the changed code, and did the change respect that centrality?

## 1. Centrality rating: **HIGH**

`TableCell` is one of the most-instantiated primitives in the estate. Every admin and transactional
list in every consumer app composes it — Pallets, POs, Sales Orders, Users, Crates, Cycle Counts,
Dispatches, Fleet, Delivery Runs. A wrong class emitted here appears in thousands of DOM nodes across
five applications.

| Signal | Value |
|---|---|
| Consumers pinning this package by git sha | **5** (DC, CRM, RMS, org-admin, Manga Verde) |
| `TableCell` call sites in DC alone | **30+** across 20+ view files (grep, this session) |
| Rendering surface of a wrong class | every table row in every consumer, at its next pin bump |
| Blast radius **today** | **zero** — measured, §3 |

## 2. Did the change respect that centrality?

| Obligation for HIGH-centrality code | How it was met |
|---|---|
| **Prove, do not assert, that existing callers are unaffected** | 1,536 caller shapes rendered against `main@ce47010` and against this component, whole `innerHTML` diffed → **no output** |
| **Bound the behaviour change precisely** | 576-shape group-3 sweep, every difference classified: **48 rendering changes, all exactly the defect's shape**; 72 order-only; 456 identical |
| **Change the smallest possible thing** | three lines of behaviour, one predicate, inside one function body |
| **Move no export surface** | all three barrels byte-identical; `VAlign` stays module-private |
| **Add no field, remove none, change no default** | none added, none removed; the `"middle"` default keeps its value **and its position** (D-2) |
| **Prove the new specs fail against the bug** | mutation M-1 restores the shipped predicate → T-17/T-18 redden |
| **Do not weaken an existing guard to pass** | **0 existing specs edited** (`−0` deletions in the test file) |
| **Leave the trap marked for the next author** | the "two emission positions are a contract" warning restated in code and in three artifacts |

## 3. Blast radius today — zero, and that is measured

| Check | Result |
|---|---|
| DC's pin (`bananaworld-dc/package.json:54`) | `#0633476…` — **CR-004's sha**, three changes behind. DC's build cannot see `TableRow.valign` |
| `grep -rni "valign"` across DC | **0 occurrences** |
| Vertical utility inside any DC `TableCell` `className` | **none** — all 10 `align-*` hits are `<span>`s except `SalesOrderForm.tsx`, which applies `align-top` to **raw `<td>`s** and does not import `TableCell` at all |
| CRM / RMS / org-admin / Manga Verde | **not readable from a build worktree; not opened.** All are behind CR-006 by construction. Stated as a limit, **not a clearance** |

**Nobody can be hitting F1 yet.** This is the one window in which the fix costs nothing — before the
first consumer bumps onto `ce47010` and writes the combination.

## 4. Cross-app intersection map — who writes, who reads

| # | Seam | WRITES | READS | Decision |
|---|---|---|---|---|
| S-1 | The vertical-alignment precedence rule for every table cell in the estate | **This package** owns the rule and the default | all five consumers, **each only after it bumps its own pin** | This package sets it: **cell prop > cell `className` > row prop > `middle`**. Opt-in throughout |
| S-2 | DC at pin `0633476` | DC | this package | **Unaffected, provably** — pin predates `TableRow.valign`; `valign` 0 occurrences; no DC `TableCell` carries a vertical utility |
| S-3 | The CRM sales-order line grid — the intended first adopter | the CRM, in **its own** change | this option | **Out of scope, and the ORDER matters:** this merges → CRM bumps to the **merged `main` sha** (never a branch sha — KI-M001E19-002) → CRM writes `valign`. Fixing now means the CRM never meets the bug |
| S-4 | RMS · org-admin · Manga Verde | each app | this package | **Not readable from a build worktree; not opened.** All behind CR-006, so none can be exercising the defective combination |
| S-5 | The export surface (three barrels) | this package | all five consumers at bump time | **No movement at all.** Behaviour correction inside one function body |
| S-6 | Database / migration | — | — | **None.** This package has no database by construction |

## 5. Cross-system register — seventh consecutive raise

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **still does not exist** and there is no `governance/`
directory. This is the **seventh** consecutive change to raise it (CR-001 D-12, CR-002 D-10, CR-003,
CR-004, CR-005 D-12, CR-006 D-12, here).

Creating it is a **governance decision for the owner**, not something a change may invent. The seams
above are recorded here, in the plan §3 and in `developer-handover.md` instead. Carried as **OQ-2**;
no change proposes to create it unilaterally.

## 6. Verdict

**PASS.** The change is appropriately small for HIGH-centrality code, its no-op claim is measured
rather than asserted, and its one behavioural change is bounded to exactly the defect's shape with
zero consumers currently able to observe it.
