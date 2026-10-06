# Implementation summary — CR-DESIGN-SYSTEM-013

> "Select all" ticks every option, so the reader can untick the ones they do not want. Owner-raised 2026-10-06;
> plan approved, **layout B**, **on-green**. Branch `change/cr-design-system-013` off `main@26fa005`.

**Plan fit:** every cited file, function and line range was re-checked on the fresh `main` — **all still as
described**; built to the plan (`known-issues.md` §A).

## What a reader gets (once an app opts in)
Open a tick-list: every option is ticked. Untick SBF-003 → only it is hidden; the box reads "5 of 6 batches" and
the list's footer "Hidden: SBF-003". "Select all" re-ticks everything. Untick "Select all" → every tick clears,
the report keeps showing everything ("Nothing ticked — showing everything until you tick one"), and ticking a few
shows only those (today's "SBF-001 +2"). Rows with no batch keep showing when a batch is unticked.

## How
- **Opt-in**: `selectAll: "allTicked"` on a grid cell (`multiple: true`) or a toolbar `multiSelect` def. Defaults
  unchanged (`"master"` / `"allOption"`), so every existing caller renders byte-identically.
- **Stored as an exclude list**: `excluded` (new optional field) with `value: ""`; wire `f_<key>_not`. Include
  lists keep today's shape and meaning. An older reader widens, never inverts.
- **One state machine** (`multi-select-reading.ts`, pure) and **one open list** (`MultiSelectAllTicked.tsx`) shared
  by both surfaces; the "nothing ticked" state is a draft local to the open menu and never committed.
- **Engine**: `matchesFilter` keeps null rows in an exclusion; `hasActiveControls` lights "Clear" for it;
  `storedExclusionFromFilterValue` + `filterValueFromStored(def, stored, storedExcluded?)` carry it to and from a
  saved filter, and a def that has not opted in opens wider and says so.
- **New exports (3)**: `gridFilterExclude`, `gridFilterExcluded`, `storedExclusionFromFilterValue`.

## Proof
450/21 green (baseline 405/19) · typecheck clean · 10,029 caller shapes 0 differences · seven-screen snapshot zero
diff · 15/15 mutations · sensors 0 open · audit exit 0 · **real Edge browser 17/17, frames 01–06**.

## Also in this change
`source-map-js` override for a new high advisory that failed the audit on `main` (D-4); CR-011's archive moved
unchanged to make room for the assigned slot (D-5). Consumer pins: **none moved** — DC and CRM follow-ups in
`known-issues.md` §C.
