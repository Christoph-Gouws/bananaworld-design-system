# Defect log — CR-DESIGN-SYSTEM-034

Found during the build, all fixed before the push.

| # | Found by | Defect | Fix | Status |
|---|---|---|---|---|
| 1 | First frozen capture | The id normaliser looked for `radix-:r1:` but React 19 writes `_r_5_`, so ids leaked into the frozen HTML (would fail on any re-run) | Normaliser matches `_r_…_`; re-captured before any component edit | Fixed |
| 2 | First frozen capture | `renderToString` with menu links throws: the shared `next/link` stand-in has no server snapshot | The server-render state uses no menu links (as the existing server test does) | Fixed (fixture) |
| 3 | Quality hook / sensors | `AppShell()` grew to 52 lines (RC-04, limit 50) | Slide-out filters its own top items; open/rail memory extracted to `useMenuMode` | Fixed |
| 4 | Mutation battery design | "Current by href equality" could not be killed: only `exact` items were tested | Added "without exact, a sub-path marks it current" for the open menu and rail; mutant now killed | Fixed |

Open defects: none.
