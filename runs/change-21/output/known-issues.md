# Known issues — CR-DESIGN-SYSTEM-023

- **Plan premise check:** the plan's facts held on fresh `main` @ `bb6c22e` (baseline 615/30 re-measured; `DocumentHeader.tsx` slot array, `slots.map(` and `Tooltip`/`Sheet` as cited). Nothing moved.
- **K-1 (D-1 confirmed by measurement):** axe reports `definition-list` for the brief's literal `<dl>…<div role="group">` shape; the built shape (line beside the `<dl>`, inside the frame) is clean.
- **K-2 (inherited):** `DocumentHeader()` is 57 lines and the file 600+ lines — both pre-date this change; two readable-code rows stay BLOCKED by the sensor. Owner may accept or split in its own change.
- **R1:** on a touch device the info buttons appear just after hydration (one small reflow).
- **R2:** a desktop screen-reader user hears the card only partly (aria-describedby lands on the wrapping span); touch gets the full panel.
- **R3:** hybrid devices report `hover: hover`, so no info button; the mouse card works.
- **For CR-DC-223:** mount `TooltipProvider` (DC does, `delayDuration={200}`); pin the MERGED sha on `refs/heads/main`; pass nothing (or a node rendering `null`) for an unsaved document — the strip hides via `empty:hidden`; re-export the two names through DC's `ui/index.ts`.
- **Seams:** S1 DC pin (CR-DC-223), S2 `DocumentHeader.linked`, S3 link node is the app's, S4 refusal decided by the app, S5 `TooltipProvider` required. No `CROSS_SYSTEM_CHANGE_REGISTER.md` exists (carried).
- Carried: 4 inert `ignoreGhsas`; the `.snap` CRLF artefact (never staged).
