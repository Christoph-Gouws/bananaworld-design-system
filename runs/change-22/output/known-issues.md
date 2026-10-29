# Known issues — CR-DESIGN-SYSTEM-024

- **Plan premise check:** the plan's cited lines in `TablePagination.tsx` (`:101`, `:110`, `:118`, `:128`, `:136-139`, `:148`, `:155`) matched the fresh copy of `main` (`6a25c8d`). Nothing moved.
- **S1 (owed to CR-MANGAVERDE-095's build):** pin the MERGED sha on `main` (never the branch sha). Key names differ from its plan's text (`showing`/`of`/`navLabel`/`navLabelEnd`): this change ships `range`, `listPaging`, `listPagingEnd`. Its plan is not edited here.
- **S2:** DC, CRM, RMS and Org Admin gain the new names only when they move their own pin. DC's two render sites (`ListPagination.tsx`) pass no `labels` and render byte-identically.
- **R1:** an app can ignore `position` and rebuild text from `from`/`to`, undoing D-8; the README steers against it.
- **R2:** an app that formats numbers by locale inside `range` prints different digit grouping; the class stays `tabular-nums`.
- **Not done:** the plan's mutation battery (M1–M8) was not run; the plan's `known-issues` item about the cross-system register: `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist (the owner's decision).
- **Look A vs B (plan D-6):** the plan was approved as layout A (emphasis spans on the numbers); the README example and the Portuguese specs use A.
- `src/components/index.ts` fails `prettier --check` with or without this change (pre-existing).
- The request typed "Linhas por pagina"; the specs and README use the correct "página" (plan §5.3).
