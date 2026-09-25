# Known issues — CR-DESIGN-SYSTEM-011

- **K-1 — touch drag is not supported, by decision.** A drag started by a finger is cancelled; the consumer's
  dropdowns are the tablet's way to make the same move (DC EPIC-030-M-06, owner default accepted). Revisit only
  if a consumer's owner asks for touch drag — it needs a pointer-events path, not HTML5 drag.
- **K-2 — the rehearsal runner is not this repo's runner** (`test-results.md` §1): vitest 2 vs 4. The 7
  toolbar-snapshot failures it shows are identical on untouched `main`; CI is the authority.
- **K-3 — DC's `StopList.tsx` still has its own hand-rolled drag** — the consumer's follow-on
  (`TD-030-M06-01`), not this package's.
