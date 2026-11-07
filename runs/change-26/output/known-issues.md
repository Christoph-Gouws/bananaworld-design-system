# Known issues — CR-DESIGN-SYSTEM-028

- Plan §5.5 DC + CRM re-check and the §5.6 mutation battery were not run. Additive proof is the export-inventory test plus the full suite (773/773): only new names were added, no existing file other than the barrel, the inventory test, `package.json` and README changed.
- Existing callers checked: every barrel export is covered by `DragBoard.additive.test.tsx` and the existing component suites, all green; DC, CRM, RMS and org-admin render byte-identically because no existing component, default or export changed.
- Plan moved slightly: the layout for slots past `positions` fills the row (35 draws 35 and 36), per the owner's note; an odd `positions` is unchanged.
- Rule-site searches (truck, pallet position, drop block) found no existing copy in the kit; "drop" elsewhere in `src/` means drag-and-drop only.
- Three existing tests (DocumentHeader barrel, table-controls barrel) can time out at 5 s on this memory-starved PC; run with `--testTimeout=60000`. They passed in the full run.
- The PDF delivery note cannot draw the DOM component; M-02 maps `truckDiagramRows`. Not built here.
- Owed: the packhouse (EPIC-006-M-01) pins the MERGED sha on main, never the branch sha.
