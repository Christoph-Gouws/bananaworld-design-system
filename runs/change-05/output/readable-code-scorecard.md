# Readable code scorecard — CR-DESIGN-SYSTEM-005

> Stage 05. Scored against the two files in `changed-files.md` only.
> **12 / 12 PASS.** Two weak points are stated honestly below rather than trimmed away.

| # | Criterion | Verdict | Note |
|---|---|---|---|
| 1 | **Names say what the thing is** | ✅ PASS | `dcLabel` sits beside `dateLabel` and means the same kind of thing. A reader who knows one knows the other without being told |
| 2 | **The change reads as one thought** | ✅ PASS | `label={props.dcLabel ?? "DC"}` — this app's word for this slot, or the default. There is no second step |
| 3 | **No new control flow to trace** | ✅ PASS | `??` on an optional string. No branch, no early return, no state |
| 4 | **Follows the file's existing pattern rather than introducing a second one** | ✅ PASS | Identical in shape and position to the two `props.dateLabel ?? "Date"` lines 20 lines above |
| 5 | **Comments explain WHY, not WHAT** | ✅ PASS | The `dcLabel` block explains the DC source-text trap, why the override sits beside the array instead of inside it, and why omission is not offered. None of it restates the code |
| 6 | **A dangerous edit is fenced where somebody would make it** | ✅ PASS | "🔴 NEVER MOVE THE OVERRIDE INTO THE ARRAY" sits on the prop, and the render comment says why `??` and not `\|\|`. Both are backed by specs that fail |
| 7 | **Test names are statements a person could read aloud** | ✅ PASS | e.g. *"renders FOUR slots always — labelled or not, filled or empty"*, *"cannot impersonate another slot"*, *"keeps the slot SECOND even when the app gives it its own name"* |
| 8 | **Each spec asserts one claim** | ✅ PASS | T-4 and T-5 were deliberately **not** merged for exactly this reason (`simplification-opportunities.md` S-4) |
| 9 | **No magic values** | ✅ PASS | `"DC"` appears as the default in one place and in the canonical array; `"Branch"` in tests is obviously a stand-in |
| 10 | **No dead code, no unused import, no commented-out code** | ✅ PASS | Verified: `tsc --noEmit` clean, nothing left behind, the throwaway probe deleted |
| 11 | **A newcomer can find the decision without asking** | ✅ PASS | The omission answer is in the prop's own doc comment — the first place a CRM developer reading `DocumentHeaderProps` will land |
| 12 | **Consistent with the surrounding file's voice** | ✅ PASS | The file uses 🔴 / ⚠ fences for load-bearing rules; the new comments use the same convention at the same density |

## Weak points, stated rather than trimmed

**W-1 — the comment-to-code ratio on this change is roughly 25 : 2.** Twenty-five comment lines were
added for one prop declaration and one render line. That is a lot, and it is why `src/` came out
`+30 / −1` against a plan estimate of `+15 / −1` (`revision-review.md` DEV-1).

It is defended rather than excused: the two things a future session most needs to know here — *the
depot label may be overridden* and *the array's `"DC"` is pinned by a test in another repository that
you cannot see from this one* — are both invisible from the code itself. The second one in particular
is a cross-repo failure with a weeks-long fuse. The alternative is that the knowledge lives only in
`runs/change-05/`, which nobody opens while editing a component. **The file's own house style already
carries this density**, deliberately, for the same reason.

**W-2 — `DocumentHeaderProps` is now ten fields.** It was nine; three of them are date-related and two
are now label-related. It is approaching the size where a reader wants grouping. This change did not
group them, because reordering or nesting existing fields would be a non-additive reshape of a
published interface — exactly what the lane rule forbids. Noted so the observation is not lost, with
no action proposed: the interface is documented field by field and each doc comment stands alone.

## Verdict

**PASS — 12 / 12**, with two weak points recorded.
