# Developer handover — CR-DESIGN-SYSTEM-022

**Next agent:** the conductor (CI, merge on green), then whoever bumps a consumer pin.
**Next action:** none in this repo. Dispatch or await `secret-scan.yml` to confirm the gitleaks allowlist on a full-history scan (known-issues K-1). Consumers that mounted a `NavigationBusyProvider` (Org Admin first) pick up 0.7.1 against the MERGED sha on `main`, never the branch sha.

**Current state:** built, green (682/35), typecheck clean, audit exit 0, Edge proof ALL PASS (12 FAIL on old `Link`). Archive `runs/change-20/`. Plan `runs/current/logic-plan/CR-DESIGN-SYSTEM-022.md`; summary `output/implementation-summary.md`; proof harness `evidence/browser-proof/proof.mjs` (`node runs/change-20/evidence/browser-proof/proof.mjs [tag]`, Edge).

**Rules this change leaves behind:**
- `Link`'s waiting ring is in flow only for `display: inline` links; every other display gets the out-of-flow mark (`data-link-pending-placement="out-of-flow"`), placed by a layout effect. Do not "simplify" it back into the anchor's flow.
- Every `pnpm.overrides` floor needs a note naming its version (`tests/lib/package-overrides.test.ts`). Raise a floor, write the note in the same change.
- A new `tokens.css` hash goes in the test constant AND `.gitleaks.toml`'s allowlist.
- The grid filter's three open lists share `FILTER_MENU`; change it once.
- `vitest.config.ts` runs nothing at the `tests/` root; put tests under `components/`, `lib/` or `themes/`.
