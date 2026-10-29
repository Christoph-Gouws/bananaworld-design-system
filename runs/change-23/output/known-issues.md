# Known issues — CR-DESIGN-SYSTEM-025

- **K-1 — Plan §5.5 / §5.6 not run.** The DC + CRM re-check and the mutation battery M1–M9 were not executed. The additive claim rests on the `src/` diff (one new file + barrel block) and the inventory test.
- **K-2 — Cold-import timeout.** `table-controls.test.tsx` "exports both helpers…" exceeded vitest's 5 s default on this machine (cold import of the whole barrel); passes with `--testTimeout=60000`. Not compared against an unmodified `main`.
- **K-3 — `src/components/index.ts` is not prettier-clean at 100 columns**, identically on HEAD before this change. Not touched.
- **K-4 — Dark is proved with a fixture only.** No estate app defines dark tokens yet; the component uses token classes only.
- **K-5 — DC yellow fill is pale** (`#fac80a` on `#efefee`, ≈1.5:1, below the 3:1 non-text guideline). Every figure is printed, so the bar is not needed to understand the content (plan R1).
- **Owed by the packhouse (EPIC-004-M-03):** pin the MERGED sha, pass `valueText` / `percentText` so the chart matches the packout table, pass `total.value` as the same base its percentages use. No consumer pin was moved here.
- Page-local charts in DC and Manga Verde are listed in the plan §1.2 and left untouched.
