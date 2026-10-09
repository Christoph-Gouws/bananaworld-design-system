# Known issues — CR-DESIGN-SYSTEM-015

**Plan premise check:** everything the plan cites is as described. `origin/main` is still `cde6f4e`, the base the plan was written against, and `tokens.css`, `vitest.config.ts` and `package.json` match the plan's description.

1. **Halo placement limit.** The theme holds five tokens only, so `data-theme="packhouse"` must sit on `<html>`. On the same element as a tablet surface with no themed ancestor, the focus halo (`--shadow-focus`) stays yellow while the ring token is teal. Documented in the README. A sixth token is a later kit change if an app ever needs the attribute lower down.
2. **Toast lifetimes (S5).** Kit error toasts persist until clicked, which conflicts with the packhouse rule "closes by itself within 6 seconds". Packhouse M-04 handles it with `durationMs ≤ 6000`; a later kit change may add an opt-in.
3. **Pre-existing red checks in the consumers** (not caused by this change, owner-accepted, each its own change run): DC Gitleaks; CRM Dependency Audit (`sharp`, `source-map-js`). `dc-crm-recheck.md` §5.
4. **CRM pin is ten kit changes behind.** CRM pins `54597ac…`; its own bump is its own change. The re-check isolated CR-015 with a CRM-base variant.
5. **Stale comment in DC** `tests/contract/list-paging-page-sizes.test.ts:7-8` names four export subpaths; now five. For DC's next pin bump, in DC's lane.
6. **Dependency audit not run locally** (sandbox refused); no dependency changed. CI runs it.
7. **Fingerprint rule (owner decision 2026-10-09):** the packhouse compares `git rev-parse <sha>:src` and `<sha>:package.json` with the re-checked head, not the whole-tree hash. Values in `dc-crm-recheck.md` §1.
8. **Cross-system change register** still does not exist in this repo (standing, owner's decision).
