# Defect log — CR-DESIGN-SYSTEM-024

| # | Found | Defect | Status |
|---|---|---|---|
| 1 | Build | Listbox byte-identity compare differed only in `aria-labelledby` ids (useId noise) | Fixed in the test normaliser |
| 2 | Build | `Object.freeze({...})` lost the contextual type for `range`'s argument (`any` under strict) | Fixed: `Object.freeze<TablePaginationLabels>` |
| 3 | Build | Browser proof page failed axe `region` (no landmark on the scratch page) | Fixed: page wrapped in `<main>` |

No defect remains open. No defect was found in `TablePagination` itself by the real-browser run.
