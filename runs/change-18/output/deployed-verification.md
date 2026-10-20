# Deployed verification — CR-DESIGN-SYSTEM-020

Nothing is deployed: this is a source package consumed by git sha. The stand-in is the real-browser run: the real `ExportButton` from `src/`, compiled with the consumer-side Tailwind config, served by vite, driven in Edge. 16/16 checks PASS (`runs/change-18/evidence/browser-proof/proof.mjs`); frames `01-link-focused-mouse.png`, `02-toast-path-unchanged.png`, `03-touch-390.png` in `runs/change-18/evidence/frames/`. After merge, Manga Verde's pin bump (CR-MANGAVERDE-069) is the first real consumer.
