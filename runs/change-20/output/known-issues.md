# Known issues — CR-DESIGN-SYSTEM-022

- **K-1 Gitleaks not run.** `gitleaks` is not installed on this machine and the sandbox would not clone a scratch repo. The allowlist is proven by a test (hash present in the toml) and by reading the config, not by a scan. Check: dispatch `secret-scan.yml` on this branch or wait for the nightly. Any OTHER old finding it shows is a new known issue, not part of this change.
- **K-2 `GridFilterRow.tsx` is over 300 lines** (readable-code RC-05, inherited: 645 at `main`, 636 now). Splitting is its own change.
- **K-3 Ring geometry is proven in Edge only**, not in CI (TD-2 from CR-013). happy-dom has no layout.
- **K-4 Residual (plan R2):** an inline `<a>` that wraps block children and has no display class still gets the in-flow ring. The consumer gives it `block`. Named in the README.
- **K-5 Residual (plan R1):** a link that changes layout while waiting keeps its first ring position until the wait ends.
- **K-6 Four inert `ignoreGhsas`** remain; retiring them is still the owner's separate call.
- **K-7 Record errors are named, not rewritten:** CR-015 `test-results.md:13` ("no dependency changed") and CR-021's "Built as approved" are corrected only in this change's decision-log entry.
- **K-8 New test location:** the override-notes test lives in `tests/lib/` because `vitest.config.ts` includes no file at the `tests/` root.
