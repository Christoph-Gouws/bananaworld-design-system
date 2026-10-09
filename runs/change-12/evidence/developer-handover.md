# Developer handover — CR-DESIGN-SYSTEM-015

**Next agent:** the conductor (poll CI, merge on green). Then the packhouse session (EPIC-001-M-02) in its own lane.
**Next action:** packhouse pins the **merged** sha on `main` (never the branch sha, KI-M001E19-002), imports `tokens.css` then `themes/packhouse.css`, and sets `data-theme="packhouse"` on `<html>`. It proves "same as re-checked" by comparing `git rev-parse <merged>:src` (= `e5359ddb…`) and `<merged>:package.json` (= `7be0ba47…`) with the re-checked head, per the owner's 2026-10-09 rule (code-only, not the whole-tree hash). Full shas: `dc-crm-recheck.md` §1.
**State:** built, green (464/23), closed out, PR open. Artifacts: `../output/*`, `dc-crm-recheck.md`, `frames/`.

## Rules
1. 🔴 **The theme holds five tokens and nothing else.** The guard test fails on a sixth property, a changed value, a second rule or any edit to `tokens.css`. A change to `tokens.css` needs QG-CEN-003's full re-check and a new hash constant.
2. 🔴 **`data-theme="packhouse"` belongs on `<html>`.** Lower down on a tablet surface the focus halo stays yellow (`known-issues.md` 1).
3. 🔴 **The test lives under `tests/`, not `src/`** — `files: ["src"]` would publish it.
4. Consumers pin by sha and move on their own; this change moved none.
5. Kit error toasts persist until clicked; the packhouse 6-second rule is packhouse M-04's, not this change's.
