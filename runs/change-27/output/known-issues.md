# Known issues — CR-DESIGN-SYSTEM-029

- Plan §5.2 frozen HTML fixtures, §5.5 DC + CRM re-check and §5.6 mutation battery were not run. Substitutes: an in-test `renderToString` equality of no-`density` vs `density="default"` vs an unknown value (and no `max-sm:` in the default output); a pixel-identity browser check of compact vs default at 768, 1440 and A4 print; neither DC nor CRM imports `TruckDiagram` (grep over DC `src/`; plan §0 found none anywhere); the full kit suite passes unedited.
- Existing callers checked: no importer of `TruckDiagram` in DC (read-only grep); the default strings are untouched, so any caller without `density` renders as at `eefc0c8`.
- Owed by packhouse EPIC-006-M-01: pin the MERGED sha, pass `density="compact"`, and tighten the rest of the phone screen (the "not on the truck yet" list, header, column), which is most of the length gap (plan S1, R1).
- Plan seams S1–S5 stand; `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist.
- A phone turned sideways (≥ 640 px) shows the default size, by design.
