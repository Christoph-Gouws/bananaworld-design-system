# Developer handover — CR-DESIGN-SYSTEM-025

**Current state:** `BarChart` built, kit 0.9.0, layout A, PR opened from `change/cr-design-system-025`. Nothing else in this repo is in flight.

**Next agent / next action:** the packhouse EPIC-004-M-03 build pins the MERGED sha of this change (never the branch sha), imports `BarChart`, and passes `valueText` + `percentText` and `total.value` so the chart matches the packout table. No consumer pin was moved here.

**Rules to keep:** additive only (new names, optional props); the chart draws lengths and prints caller text — it computes nothing business-specific; the one override of caller text is "base 0 → dashes" (header comment and test pin it). Run prettier with `--print-width 100`.

**Cited artifacts:** `runs/change-23/output/known-issues.md` (what is not run, what the packhouse owes), `runs/change-23/output/test-results.md`, browser proof at `runs/change-23/evidence/browser-proof/proof.mjs` with frames in `runs/change-23/evidence/frames/`.
