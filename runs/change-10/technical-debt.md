# Technical debt — CR-DESIGN-SYSTEM-013

| # | Debt | Why it was taken | Retire it by |
|---|---|---|---|
| TD-1 | `MultiSelectEveryRow` (`MultiSelectAllTicked.tsx`) repeats ~20 lines of `MultiSelectAllRow`'s row JSX (same classes, same indicator, same count span) | `MultiSelectAllRow` is what every `"master"` caller renders, and an open-menu row cannot be reached by the static byte-identity harness — leaving its bytes untouched is the additive proof. The class strings themselves are shared (`ITEM_SIZE` / `ITEM_ICON`) | once consumers have moved to `"allTicked"` and `"master"` can be reviewed, extract one row frame both use, proven by the open-menu specs in `Grid.test.tsx` and `CR-DESIGN-SYSTEM-013.allTicked.test.tsx` |
| TD-2 | The real-browser proof (`runs/change-10/evidence/browser-proof/proof.mjs`) is a one-off driver, not a CI job | this repo has no browser-test tool; adding Playwright is a dependency and CI decision outside the approved plan. The CI-run guard is the happy-dom spec `CR-DESIGN-SYSTEM-013.allTicked.test.tsx` | adopt a browser runner for this package (an owner decision), then move `proof.mjs`'s 17 checks into it |
