# Defect log — CR-DESIGN-SYSTEM-030

No defects in the shipped code. Three issues in my own proof, fixed before the final run:
- The fixture's Sheet had no `onOpenChange`, so Escape could not close it (fixture bug, not the panel).
- The proof counted Edge's own `edge://downloads-hub/` panel (browser chrome shown on a save) as an opened tab; it now ignores `edge://` pages, while still counting `window.open` calls and any surviving app page.
- Two sensor findings (function size) and the barrel passing 300 lines were fixed in code, not suppressed.
