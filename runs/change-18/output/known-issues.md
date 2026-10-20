# Known issues — CR-DESIGN-SYSTEM-020

- R1 — `download` is a hint: cross-origin URLs navigate instead; MV's export route must be same-origin or answer `Content-Disposition: attachment` (README says so).
- R2 — the link variant has no ref (an `<a>` is not an `HTMLButtonElement`); documented.
- R3 — the no-link export button stays 36 px on a touch phone (unchanged to keep DC byte-identical).
- R4 — Space does not activate a link (native behaviour).
- Mutation battery not run (test-results.md).
- Owed (none done here): **CR-MANGAVERDE-069** moves MV's pin from `1fefb6c6` to the MERGED sha of this change; DC/CRM/RMS/Org Admin bump when they choose. `governance/CROSS_SYSTEM_CHANGE_REGISTER.md` still does not exist.
