# Revision review — CR-DESIGN-SYSTEM-005

> Stage 05. Reviews **only** the files listed in `changed-files.md`:
> `src/components/DocumentHeader.tsx` and `tests/components/DocumentHeader.test.tsx`.

## 1. Built to the approved plan — clause by clause

The plan is the contract. Every clause it states, checked against what actually landed.

| # | Plan clause | Built? |
|---|---|---|
| P-1 | §2.1 — one new field on `DocumentHeaderProps`, added immediately **above** `origin` | ✅ exactly there |
| P-2 | §2.1 — `readonly dcLabel?: string` | ✅ verbatim |
| P-3 | §2.1 — the fence comment: names the slot, does not move it, is not an identity | ✅ written, and extended with the DC source-scan reason and the omission decision |
| P-4 | §2.2 — `label={props.dcLabel ?? "DC"}` in a braced block | ✅ verbatim |
| P-5 | §2.2 — `??`, not `\|\|`; no special case for `""` | ✅, and pinned by T-9 |
| P-6 | §2.3 — `DOCUMENT_HEADER_SLOTS` not one character changed | ✅ verified by T-10's byte-exact scan |
| P-7 | §2.3 — `const slots = DOCUMENT_HEADER_SLOTS;` and `slots.map(` unchanged | ✅ |
| P-8 | §2.3 — `DocumentOrigin`, discriminant, `dcName`, `raisedBy` untouched | ✅ |
| P-9 | §2.3 — Document no. states, Date states, `dateLabel`, `dateHint`, `HeaderSlot`, every class name and string untouched | ✅ diff confirms: no class name changed anywhere |
| P-10 | §2.3 — **all three barrels untouched**, export surface byte-identical | ✅ `git diff` on all three is **empty**; T-12 asserts the eight symbols |
| P-11 | §2.3 — no new dependency, no token, no Radix control added or replaced | ✅ `package.json` and `pnpm-lock.yaml` untouched; no element added |
| P-12 | §3 — **layout A**: the slot is always present; omission NOT offered | ✅ built, and stated in three places |
| P-13 | §3.1 — the reason omission is not offered is written down | ✅ `implementation-summary.md` §2, three reasons in weight order |
| P-14 | §5.2 — the one existing assertion narrowed exactly as declared | ✅ both replacement lines verbatim as the plan wrote them |
| P-15 | §5.3 — T-10 re-fenced with a comment naming DC's contract test | ✅ |
| P-16 | §6 — **two files touched. No barrel, no config, no `package.json`, no lockfile, no new file** | ✅ |
| P-17 | §6 — no `runs/epic-*/`, no `milestone-NN/`, nothing under `runs/current/epic-plan/` | ✅ none created; archive is `runs/change-05/` |
| P-18 | §7 — baseline `pnpm test` recorded **before any edit** | ✅ 235 / 13, the number the plan predicted |
| P-19 | §7 — specs T-1 … T-12 | ✅ 11 new specs (T-10 was an extension of an existing spec, as the plan described) |
| P-20 | §8 — `git diff --numstat -- src/` reproduced, deletion itemised | ✅ `changed-files.md` §1 |
| P-21 | §8 — barrel diff shown empty | ✅ |
| P-22 | §8 — which existing callers were checked and why they are unaffected, **stated plainly** | ✅ `evidence/milestone-evidence.md` §3 |
| P-23 | §8 — dependency audit reproduced in Node and **read**, not trusted | ✅ and its first cut was wrong — `defect-log.md` DEF-1 |
| P-24 | §8 — no migration; no consumer pin bumped | ✅ |
| P-25 | §9 OQ-2 — DC's mirror recorded as a one-line narrowing DC must make, in the handover and `SESSION_HANDOVER.md` | ✅ |
| P-26 | §9 OQ-3 — cross-system register **not** created | ✅ seams recorded in `centrality-scorecard.md` |
| P-27 | §9 OQ-4 — "Raised by" label **not** built; noted as a one-prop follow-up | ✅ `technical-debt.md` TD-1 |
| P-28 | §10 — `dateLabel` neither removed nor folded into a shape with `dcLabel` | ✅ two independent optional props |

**28 / 28 clauses built. 0 clauses skipped. 0 clauses exceeded.**

## 2. Deviations — recorded, not smoothed over

| # | Deviation | Why | Material? |
|---|---|---|---|
| DEV-1 | `src/` came out **+30 / −1**; the plan estimated **+15 / −1** | Entirely the two fence comments written out in full: the `dcLabel` doc block covers the DC source-text trap and the omission decision, both of which the plan required be written *somewhere* a reader will find them, and the source is where a future build session actually looks. **Zero extra behaviour, zero extra API, zero extra file** | **No.** A comment-only overshoot on a line estimate |
| DEV-2 | The plan's §7 listed T-1…T-12 as twelve specs; **11** were added | T-10 is an **extension of an existing spec** (a fence comment naming DC), which is what the plan's §5.3 itself described — "re-fences it". No spec was dropped: T-10's three assertions exist and are proved to bite by mutation M-4 | **No** |
| DEV-3 | T-11 asserts slightly more than the plan's wording | The plan asked for "no second array literal of slot names" and "exactly 4 entries with `DC` second". The built spec also asserts the render does not rebuild the list locally (`slots = [`) and that the array is not interpolated. Strictly more guard, same subject | **No** — additive to the plan's own intent |

**Nothing the plan relied on had moved** (`implementation-summary.md` §0: 11 / 11 facts verified
exact), so no premise-change stop was triggered.

## 3. Review dimensions

| Dimension | Finding |
|---|---|
| **Correctness** | The default preserves every existing caller; the override is a pure substitution in one JSX attribute. There is no branch to get wrong — `??` on an optional string is the entire logic |
| **Readability** | The render line reads as one thought: *this slot, this app's word for it, this document's value*. The `??` matches the two `dateLabel` lines directly above, so a reader meets one pattern, not two |
| **Consistency with the file** | The precedent was named in the request and followed exactly. A `dcLabel` reader who already knows `dateLabel` learns nothing new |
| **Minimality** | One prop, one expression. No discriminant, no `null`-means-omit, no `dcHint`, no config object |
| **Testability** | Every claim the change makes is asserted, and every assertion was **proved to fail** under a matching mutation |
| **Cross-repo safety** | The one thing that could hurt DC silently — the source-text contract — is now pinned by two specs in this repo, one of which names DC by file |
| **Accessibility** | Unchanged shape. The depot slot has no control, so it stays a `<dt>` — a `<label>` with nothing to label would be a lie to a screen reader, which is why the file's `<dl>` structure was kept at promotion |
| **Security** | No new input, no new sink, no interpolation into markup, no dependency. `dcLabel` is rendered as a text child of a `<dt>`, which React escapes; there is no `dangerouslySetInnerHTML` anywhere in the file |

## 4. Over-build temptations declined

| # | Temptation | Declined because |
|---|---|---|
| OB-1 | `dcLabel?: string \| null` where `null` means omit | The layout consequence is a restyle this change is forbidden to do, and no caller asked. Layout A was approved |
| OB-2 | A `dcHint?: string` alongside (plan option C) | Cheap and additive, but **no caller has asked**. Recorded as TD-2 with a named trigger instead |
| OB-3 | Making `"Raised by"` overridable "while we're here" | Out of scope by the request's own wording; TD-1 |
| OB-4 | A `labels?: { date?: string; dc?: string }` object folding both props | Explicitly forbidden — and it would be a breaking reshape of `dateLabel` |
| OB-5 | Deriving the labels from `DOCUMENT_HEADER_SLOTS` via a lookup map | This is mutation **M-4**'s shape. It breaks DC's source-text contract |
| OB-6 | Renaming `DOCUMENT_HEADER_SLOTS`'s `"DC"` entry to something app-neutral | The single most dangerous edit available here. It is the exact string DC's contract test asserts |
| OB-7 | Adding a `slotLabels` prop for all four at once | Configurability in anticipation; D-3 and D-13 refused this shape in this component already |
| OB-8 | Running `prettier --write` to make `format:check` pass | With no prettier config it reformats existing source at default settings — a mass non-additive diff |

## 5. Verdict

**PASS.** Built to the approved plan, 28 / 28 clauses; three immaterial deviations recorded; nothing
added beyond the plan; nothing removed.
