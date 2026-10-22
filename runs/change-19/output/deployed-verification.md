# Deployed verification — CR-DESIGN-SYSTEM-021

Not a deployed system: the kit is TypeScript source consumed by git sha, with no deployment, database or migration. Nothing was deployed or applied.

What was verified instead: the real components rendered from `src/` in a real Edge browser at 375×812 and 1024×768 with touch emulation (`runs/change-19/evidence/browser-proof/proof.mjs`, ALL PASS), frames in `runs/change-19/evidence/frames/` (`01-gallery-375.png`, `02-gallery-1024.png`). No Postgres container was started.
