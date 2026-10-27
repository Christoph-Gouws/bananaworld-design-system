# Implementation summary — CR-DESIGN-SYSTEM-022

**Plan check:** every file and line the plan cites (`GridFilterRow.tsx:267/362/403`, `Link.tsx:45-78`, `.gitleaksignore:2`, `package.json:74/79/82`, `ActionTile.tsx:46`) was re-read on fresh `main` `5c14f37`: everything is as the plan describes. Built to the plan, layout A.

| Finding | Verdict | What was done | Test that would have caught it |
|---|---|---|---|
| F1 CR-013 | confirmed, fixed | one `FILTER_MENU` constant, same bytes, used by the three select cells | `GridFilterRow.chrome.test.tsx` |
| F2 CR-015 | confirmed, fixed | `.gitleaks.toml` allowlists the tokens.css hash by value; `.gitleaksignore` deleted. History check: the hash is in `main` under `820c980` (squash) as well as `59ce1abc` | `packhouse-theme.test.ts` "gitleaks allowlist names this hash" |
| F3 CR-015 | confirmed, floor kept, notes corrected | sharp `<0.35.5` clears GHSA-wq5f-xc86-pv6w (high; checked at the advisory); `//auditConfig` text fixed | `tests/lib/package-overrides.test.ts` (fails on `main`) |
| F4 CR-018 | confirmed, fixed | `LinkPendingMark` leaves the flow unless the link is `display: inline`; placed just after the link's words (layout A) | Edge proof: 12 checks FAIL on the old `Link`, ALL PASS now; `Link.outOfFlow.test.tsx` |
| F5 CR-021 | confirmed, floor kept, notes + decision log corrected | next `<15.5.28` clears GHSA-2464-fhr4-w9xw (critical), GHSA-p3m5-59mp-jv5r (high) | same override-notes test |
| F6 CR-021 | confirmed, ratified as built | decision log only; no code | pinned already by `ActionTile.test.tsx:26-28` |

Kit 0.7.0 → 0.7.1, README changelog. No export added or removed. Lockfile untouched.
