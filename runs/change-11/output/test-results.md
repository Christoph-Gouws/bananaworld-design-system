# Test results — CR-DESIGN-SYSTEM-012

> Rehearsed 2026-10-01 by the raising session (Bananaworld-DC CR-DC-210) on a scratch copy of the branch tree;
> the package's own CI on the PR is the binding run.

| Check | Command | Result |
|---|---|---|
| Component tests | `vitest run tests/components/Combobox.test.tsx` | **11 passed / 0 failed** (6 before; +5) |
| Typecheck | `tsc --noEmit` over `src/components/Combobox.tsx` + its test (the package's own compiler options) | clean |

## The five new specs
1. 🔴 without `group` the listbox markup is **byte-identical** to `76fec2a0` — compared against a literal captured by
   rendering that version (icon `<svg>` and `&amp;` escaping normalised on both sides).
2. one heading per section change, and only there (4 options + 2 headings = 6 children).
3. ↓ ↓ Enter crosses the heading onto the first option of the next section.
4. a section the query empties loses its heading.
5. pressing a heading chooses nothing.

## Consumer proof
The sectioned picker is driven in Bananaworld-DC's real browser by CR-DC-210's own e2e spec, recorded in that
change's archive (`runs/change-211/` in DC) — not here, because this package has no app to load it in.

Overall: **PASS**.
