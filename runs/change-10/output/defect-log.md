# Defect log — CR-DESIGN-SYSTEM-013

**Open defects in the shipped change: 0.** Four found during the build, all fixed or contained in-session.

| # | Found | What | Fix | Status |
|---|---|---|---|---|
| D-1 | archive set-up | The conductor's assigned archive `runs/change-10/` already held CR-DESIGN-SYSTEM-011's archive (CR-011 picked "CR № − 1"). Writing the required files would have overwritten a closed change's record | CR-011's six files moved **unchanged** to `runs/change-10/CR-DESIGN-SYSTEM-011/`; pointer `runs/change-10/README.md`; decision log D-5. Root cause (two numbering schemes) is estate tooling — `known-issues.md` B-1 | Contained |
| D-2 | Stage 05 sensors | Appending the mode to `MultiSelectMenu.tsx` took it to 546 lines (RC-05) | Split along the repo's pure/React seam: `multi-select-reading.ts` + `MultiSelectAllTicked.tsx`; sensors 0 open | Fixed |
| D-3 | build verification | `pnpm run audit:deps` exit 1 on untouched `main` — GHSA-68fv-2mgg-jv7q (`source-map-js` <1.2.2 via the `next` peer) | `pnpm.overrides` floor `^1.2.2` (decision log D-4); audit exit 0 | Fixed |
| D-4 | browser proof tooling | Two failures in this session's own driver, not in shipped code: the package barrel pulls `next/link`, which needs a `process` global; and an open Radix menu `aria-hides` the trigger so a role lookup times out | the proof page supplies the one global a Next app supplies; triggers located by `aria-label` attribute | Fixed |

No defect was found in the change's own behaviour by the specs, the 15 mutations, or the 17 browser checks.
