# Accepted refactors (Stage 05) — CR-DESIGN-SYSTEM-007

## None. 0 of 4 candidates accepted.

This is a recorded outcome, not an omission or a skipped stage. The Stage 05 simplification pass ran
over the two files in `changed-files.md` §1, produced four candidates, and rejected all four on
stated grounds (`simplification-opportunities.md`):

| # | Candidate | Rejected because |
|---|---|---|
| S-1 | Collapse the two class-emission positions into one | Breaks **D-2**, the estate-wide contract — it would silently revert every caller using today's `className="align-top"` workaround across five sha-pinned apps. Guarded by T-8, mutations M-2 / M-4. **This change depends on both slots existing** |
| S-2 | Keep `resolvedValign` as a named intermediate | That variable **is** the defect's mechanism; keeping it in scope re-arms the exact silent regression this change removes |
| S-3 | Fold T-17 into T-18, T-20 into T-21 | They localise different failures. Deduplicating them buys lines and costs diagnosis |
| S-4 | Extract precedence into a `resolveVertical(...)` helper | Requires parsing `className` on every cell render, duplicates twMerge's last-wins resolution, and is essentially option **C** — which the owner did not pick |

## Why "none accepted" is the right answer here

The change is **three lines of behaviour inside one function body**. It adds no abstraction, no
helper, no option, no configurability and no new export. There is no structure to simplify, because
the change introduces none.

The genuinely available simplifications are all **contract violations wearing a cleanup's clothes** —
S-1 above being the canonical one, now rejected in three consecutive changes and reinforced by this
one. Accepting a refactor here to make the stage look productive would be the worst outcome
available: it is exactly how a package that four apps pin by sha breaks its callers.

## Refactoring carried out as part of the fix itself

Recorded here so it is not mistaken for an unrequested tidy:

- **`askedForValign` → `cellAskedForValign`**, and the removal of the `resolvedValign` intermediate.
  These are **the fix**, not a refactor alongside it — the old name was false (it read "asked" while
  meaning "anybody asked") and that falseness is how the defect survived CR-006's review. Both were
  specified in the approved plan §2 and are covered by mutations M-1 … M-4.
