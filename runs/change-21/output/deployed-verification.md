# Deployed verification — CR-DESIGN-SYSTEM-023

Not a deployed system: the kit is TypeScript source consumed by git sha, with no deployment, database or migration. Nothing was deployed or applied.

What was verified instead: the real components rendered from `src/` in a real Edge browser at 1270×800 (mouse) and 820×1100 / 375×812 (touch emulation) (`runs/change-21/evidence/browser-proof/proof.mjs`, ALL PASS), frames in `runs/change-21/evidence/frames/`. No Postgres container was started.
