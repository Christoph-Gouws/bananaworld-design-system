# Known issues — CR-DESIGN-SYSTEM-026

- **K-1 Not run:** plan §5.5 DC + CRM re-check and §5.6 mutation battery M1–M9. The additive claim rests on the diff (`StatTile.tsx` new, one comment + one export line in `index.ts`) and the unedited existing suite.
- **K-2 Owed downstream:** packhouse EPIC-004-M-03 pins the MERGED sha and adopts `StatTile`. No consumer pin moved here. The ~35 page-local figure tiles in DC, CRM, RMS and Manga Verde are listed in the plan §1.2 and untouched.
- **K-3 Cold-import timeouts:** under the default 5 s timeout `DocumentHeader` and `table-controls` barrel specs can time out on a cold start (as at CR-025); they pass with `--testTimeout=60000`.
- **K-4 Link on the server:** `StatTile` itself has no client directive; the linked path renders the kit `Link`, a client component, which a server parent handles normally. The unit spec server-renders read-only tiles only because the test's `next/link` mock uses a hook.
- **K-5 Plan moved:** nothing material. `README.md` line numbers shifted by the earlier 0.9.0 entry; same content.
- `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows a CRLF working-copy artifact; not staged.
