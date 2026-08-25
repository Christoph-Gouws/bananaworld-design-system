# Centrality scorecard — CR-DESIGN-SYSTEM-006

> Does this change sit in the right place, and what does it oblige anyone else to do?

**12 / 12 PASS.** 7 cross-system seams mapped. **0 coordinated multi-app moves created.**

| # | Criterion | Verdict | Reasoning |
|---|---|---|---|
| 1 | The change is in the layer that owns the concern | **PASS** | Vertical alignment of a table cell is a property of the table primitive. It belongs here, beside `align`, not in five apps' stylesheets |
| 2 | It is not duplicated anywhere | **PASS** | `<td` appears exactly **once** in `src/`. One place emits a cell's classes and it is the one that changed |
| 3 | It removes duplication rather than adding it | **PASS** | DC already solved this by **abandoning the primitive** for raw `<td>`s (`SalesOrderForm.tsx:1026`). The option exists so the next app does not have to. DC may now fold back — its call (OQ-5) |
| 4 | No consumer is forced to change | **PASS** | Opt-in. Every existing caller renders byte-identically — **measured over 384 shapes**, not asserted |
| 5 | The export surface is unchanged | **PASS** | Three barrel diffs empty; T-16. `VAlign` is module-private, like `Align` |
| 6 | No coordinated multi-app migration is created | **PASS** | Nothing must move in lockstep. Each app bumps when it chooses and opts in when it chooses, or never |
| 7 | Downstream work is named with an owner and a trigger | **PASS** | §2 below |
| 8 | The default — the estate-wide contract — is untouched | **PASS** | 🔴 The single most central fact of this change. `align-middle` still answers every cell that does not ask. Mutation M-1 proves the specs bite |
| 9 | No database, no migration, no lockstep schema | **PASS** | This package has no database by construction |
| 10 | No permission, scope, session or i18n logic added | **PASS** | Pure presentation (TECH-COMP-003 / ADR-001). Nothing added reads data or session |
| 11 | Radix's role is respected | **PASS** | `Table` is a plain semantic `<table>` with no Radix underpinning. No interactive control was added, replaced or hand-rolled; keyboard, focus and screen-reader behaviour are untouched |
| 12 | The change is the smallest thing that answers the request | **PASS** | Two optional fields, one private helper, one private context, two files |

## 1. Cross-system seams

| # | Seam | Who writes | Who reads | Resolution |
|---|---|---|---|---|
| S-1 | Vertical alignment of every table cell in the estate | **This package** owns the default (`middle`) and the mechanism | DC, CRM, RMS, org-admin, Manga Verde — **each only after it bumps its own pin** | Package keeps the default; a consumer opts a row or a cell in. **Opt-in only; no pin bumped here** |
| S-2 | The CRM sales order line grid | **The CRM**, in its own change | this option | **Explicitly out of scope.** Two changes, two lanes, in order. The CRM moves against the **merged** `main` sha, never this branch's (KI-M001E19-002) |
| S-3 | DC's `tests/unit/ui/table.test.tsx` | DC | this package's behaviour | **Cannot redden.** All three specs are behavioural (render, `aria-sort`, `onSort`); none reads source text or a class string |
| S-4 | DC's 39 files using `TableCell` | DC | this package's default | **Unaffected** — none passes `valign` (0 occurrences repo-wide), so the emitted string is the same string. Proved by the 384-shape render diff |
| S-5 | `TdHTMLAttributes.valign` — a prop name this change takes over | **This package** | any consumer passing the legacy attribute | **Declared, not hidden.** DC proven clean; four repos unreadable from here. One-line grep at each consumer's bump; `verticalAlign` is the zero-residual fallback name |
| S-6 | The export surface (three barrels) | **This package** | all five consumers, at bump time | **No movement.** Two exported interfaces each gain one optional field; zero barrel edits |
| S-7 | Database / migration | — | — | **None.** No database by construction; this change is pure presentation |

## 2. Downstream work this change creates — named, owned, triggered

| # | Work | Owner | Trigger | Blocking anything? |
|---|---|---|---|---|
| 1 | Bump the pin, then opt the sales order grid into `valign="top"` | **The CRM's own change** | after this **merges to `main`** — against the merged sha, never a branch sha | No. Nothing is blocked on it |
| 2 | One grep for `valign` before bumping the pin | **CRM, RMS, org-admin, Manga Verde**, each in its own lane | that repo's pin bump | No. DC already proven clean |
| 3 | Whether to fold DC's hand-rolled sales-order `<td>`s back onto `TableCell` | **DC's lane** | DC's discretion (OQ-5) — take it or refuse it | No |
| 4 | `TableHead` gaining `valign` | a future change | **only if a caller asks.** Not built (OQ-4 → `technical-debt.md` TD-1) | No |

**Nothing renders differently in any app until that app bumps its pin AND passes the new prop. No app
does either today.**

## 3. The cross-system register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist, and there is no `governance/`
directory.** This is the **sixth consecutive change** to raise it (CR-001 D-12, CR-002 D-10, CR-003,
CR-004, CR-005 D-12, and here).

**Not created by this change, deliberately** — creating a governance artifact is an owner decision,
not something a change may invent. The seams above are recorded in the plan §3, in this scorecard and
in `developer-handover.md` instead. Carried as OQ-3 and in `known-issues.md` C-5.
