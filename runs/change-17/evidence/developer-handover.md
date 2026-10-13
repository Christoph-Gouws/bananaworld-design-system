# Developer handover — CR-DESIGN-SYSTEM-019

**Next agent:** the conductor (poll CI, merge on green), then each consumer app's own change.
**Next action:** every consumer pins the MERGED `main` sha (never the branch sha) and runs the plan's two greps (`inflight`; `disabled=` near `inflight=`) on its own tree. List and priorities: `runs/change-17/output/known-issues.md` (S1 Manga Verde first, bundled with its purchase-screen change).
**Current state:** kit 0.3.1. `src/components/Button.tsx:100` is `disabled={Boolean(disabled) || inflight}`; tests in `tests/components/Button.test.tsx` (14). Suite 531/26 green, typecheck clean. Artifacts: `runs/change-17/output/test-results.md`, `revision-review.md`.

Rules for the next kit session:
1. A busy button is never clickable. Do not reintroduce `??` between `disabled` and `inflight`; the mutation check showed the tests catch it.
2. This is a behaviour fix, not an additive one: the changelog says so. Residuals R1 (`asChild`) and R2 (`cursor-progress` masked) are in `known-issues.md`.
3. No real-browser run was possible this session; Manga Verde's bump should run the 2.5 s repro.
4. Standing carries are in `runs/current/SESSION_HANDOVER.md`.
