# Centrality scorecard (Stage 05) — CR-DESIGN-SYSTEM-002

**12 / 12 PASS.** 5 cross-system seams mapped. 0 coordinated multi-app moves created.

Centrality asks: is the thing defined **once**, in the **right** place, and does everything that
needs it reach that one definition? This change is unusually on-topic for the scorecard — it exists
to move a definition to the place where two apps can share it.

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | **One definition, not two** | PASS | This is the change's whole purpose. The alternative — the CRM hand-builds a second header — is the drift the estate already has a scar from: DC's own `DocumentPdf` comment records ten surfaces each spelling their own label as *"exactly the drift this milestone exists to stop"* |
| 2 | **It is in the RIGHT place** | PASS | Beside Sheet, SlideOver and Modal in a package both apps already consume. It qualifies only because CR-DC-039 removed the session read: pure presentation is the package's own rule (TECH-CON-004 / TECH-COMP-003) |
| 3 | **What did NOT belong stayed out** | PASS | DC's SQL fragments, column map, row readers and validator stayed in DC — business rules and database shape, excluded by TECH-COMP-003. 54 lines crossed of a 420-line file (D-4) |
| 4 | **No app coupling smuggled in to avoid a question** | PASS | The request warned specifically against this. Zero `@/…` imports; guarded by `tsc --noEmit` (no alias configured) **and** by a source scan (test 23) that is itself checked for vacuity |
| 5 | **The order constant is the single source of order** | PASS | Declared once; the render maps it. Test 25 pins both halves — neither alone is enough, since a constant can drift from its markup and a DOM test cannot say what the standard IS |
| 6 | **The threshold is defined once** | PASS | `DOCUMENT_DATE_WARN_DAYS = 60`, read by the screen and by its spec. Not overridable (D-5): an override prop is how two apps end up questioning dates on different days |
| 7 | **Existing definitions were reused, not re-created** | PASS | `Input` imported unmodified. `formatDateZA` deliberately **not** merged with the describer — different jobs, and merging would change an existing caller's render |
| 8 | **The export surface is reachable from the one place consumers use** | PASS | Defect D-1 was exactly this failing: the describer existed and was unreachable from the package root. Fixed; tests 26 and 27 import from `../../src` |
| 9 | **No consumer pin bumped from here** | PASS | None touched. Each consumer moves its own pin, in its own change, against the **merged** `main` sha — never a branch sha (KI-M001E19-002) |
| 10 | **Cross-system seams mapped, not discovered later** | PASS | Five seams, §"Seams" below. The one that will redden DC's tests is disclosed with line numbers |
| 11 | **No coordinated multi-app move created** | PASS | The change is additive; no consumer must move in step. DC moves when DC chooses. If this had required a lockstep bump it would have been an epic, not a change |
| 12 | **No forbidden unit created** | PASS | No `runs/epic-NN/`, no `milestone-NN/`, nothing under `runs/current/epic-plan/`. Archived to `runs/change-02/`, its own unit |

## Seams

### S-1 — This package writes; DC reads, on DC's own clock
**Writer:** this change. **Reader:** Bananaworld-DC, later, in its own change, when it bumps its pin.
This change does **not** bump DC's pin, edit DC's barrel, delete DC's copy or touch its thirteen
render sites.

🔴 **The move is two halves in two repos.** Between them the header exists in both trees. That is not
drift — it is how a sha-pinned estate moves, and it ends when DC's half lands.

### S-2 — DC's contract test asserts this move has NOT happened
**The seam that matters most, and it is disclosed with line numbers rather than found later.** DC's
`tests/contract/transaction-form-standard.test.ts` is a `@vitest-environment node` **repo scanner**;
`SHARED_HEADER = "ui/DocumentHeader.tsx"` (line 159) is a path under DC's own tree, read as text.
Five assertions bind to it and **all five go red when DC adopts** — 671, 692, 699–704, 889, 1515.

**Line 889 exists specifically to assert the promotion has not occurred** ("🔴 THE PROMOTION HAS NOT
HAPPENED, ASSERTED"), and line 881 records that the spec "asserts only that the door is now open, not
that anybody walked through it."

**Owner of the fix:** DC's adoption change. **The fix:** re-point `SHARED_HEADER` at the resolved
package file and **invert** the 889 spec so it asserts the promotion HAS happened — a loud,
deliberate edit, never a relaxed check. **This change cannot and must not do it:** DC's file, DC's
repo, and DC's tests cannot be run from this worktree. **What this change did instead:** mirrored the
equivalent assertions into this package's own suite (tests 24, 25), so the standard is guarded on
this side from day one and DC's re-point has something real to point at.

### S-3 — The day-line rule crosses into shared territory
`describeDocumentDate` and its 60-day threshold now live in the shared kit. **Readers:** DC after
adoption, the CRM afterwards. The CRM inherits DC's wording and DC's threshold. **That is the
intended uniformity**, recorded here as a decision rather than left as a side effect nobody noticed.

### S-4 — The four other consumers read nothing new
CRM, RMS, org-admin and Mangaverde pin this package. This change adds exports and removes nothing, so
all four build byte-identically against their current pins and, against a bumped pin, gain an export
they do not import. **No action required from any of them.**

⚠ One forward note, **CRM only:** the header uses `text-2xs`, the `warning-*`/`info-*`/`danger-*`
families and `bg-surface-muted`. All exist in this package's `tokens.css` and in DC's theme. **The
CRM's Tailwind theme must define the same scale before it renders the header** — the package's
standing consumer requirement, checked in the CRM's adoption change, not here.

### S-5 — The CRM does not adopt here
`CR-CRM-document-header-parity` is blocked on this change and runs in the crm lane afterwards.
Nothing here writes to, reads from, or anticipates the CRM.

## Register

`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` **does not exist in this repo and there is no
`governance/` directory** — the same finding CR-DESIGN-SYSTEM-001 recorded as D-12 and carried as
known-issue C-4. Creating one is a governance decision, not part of this change (D-10). Flagged for
the second consecutive change rather than invented; the five seams above are the record in the
meantime.
