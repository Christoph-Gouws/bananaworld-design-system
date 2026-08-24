# Technical debt — CR-DESIGN-SYSTEM-006

> Debt knowingly left by this change. **Nothing is appended to a closed epic's register.**

## TD-1 — `TableHead` has no `valign` (OQ-4)

| Field | Value |
|---|---|
| What | The vertical option exists on `TableCell` and `TableRow`, but **not** on `TableHead`. A `TableHead` inside `<TableRow valign="top">` is unaffected — asserted by **T-14**, so the fence is tested, not assumed |
| Why it was left | Header cells are single-line by construction (`whitespace-nowrap`), **no caller has asked**, and widening two surfaces to answer one request is the configurability-in-anticipation this package has refused twice (CR-005 D-6, D-10) |
| Cost if wrong | **One optional field**, purely additive, plus one `useContext`. Not a migration, not a break |
| Trigger | A real caller with a multi-line or unequal-height header row |
| Owner | A future change in this package |

## TD-2 — `VAlign` omits `"baseline"`

| Field | Value |
|---|---|
| What | `TdHTMLAttributes["valign"]` allows `"baseline"`; `VAlign` is `top \| middle \| bottom` |
| Why | The plan's union is three values and nobody asked for the fourth. A caller passing `valign="baseline"` now gets a **TypeScript error** where before it was accepted and silently inert |
| Cost if wrong | Adding a union member is additive; one branch in `valignClass` |
| Trigger | A caller wanting baseline alignment — or a consumer discovering it was passing the legacy `valign="baseline"` DOM attribute (see TD-3) |
| Owner | A future change in this package |

## TD-3 — the `valign` prop name shadows a deprecated DOM attribute (OQ-2)

| Field | Value |
|---|---|
| What | `TdHTMLAttributes` already declares presentational `valign`, so `<TableCell valign="top">` **compiled before this change**, was spread onto the `<td>`, and was visually inert. It is now consumed and does what it says. Same move the file already made for `align` |
| Residual | **DC is proven clean — zero occurrences repo-wide.** CRM, RMS, org-admin and Manga Verde **cannot be read from a build worktree and were not opened** |
| Mitigation | **One grep for `valign`**, by each consumer, before it bumps its pin. Recorded in `developer-handover.md` §2 and `SESSION_HANDOVER.md` |
| Fallback if a live usage is found | Rename to **`verticalAlign`** — provably unreachable today (not in `TdHTMLAttributes`, no index signature → passing it is a TypeScript error), i.e. **zero residual**, at the cost of asymmetry with `align`. **Carried, not built** |
| Owner | Whichever consumer's grep finds one; then a rename change in this package |

## TD-4 — pre-existing repository drift this change did not fix

Recorded because it is real and unfixed, **not** because this change caused it. All were present at
CR-005's close and were re-verified this session.

| # | Item | Why not fixed here |
|---|---|---|
| 1 | **No `lint` script and no eslint config** — `pnpm lint` fails with `Command "lint" not found` | Adding tooling config is not a two-field additive change to a component. Owner/repo-maintenance decision |
| 2 | **`pnpm format:check` fails repo-wide** — no prettier config; **all 48 `src/` files fail, including files this change never opened** | `prettier --write` would rewrite 48 files and bury a two-file diff. It is **not a CI job** |
| 3 | **No `audit:deps` script**, though the build instruction names one | The audit was reproduced in Node instead (`test-results.md` §5) |
| 4 | `ci.yml`'s test job label is stale | Out of lane |
| 5 | **`governance/CROSS_SYSTEM_CHANGE_REGISTER.md` does not exist** — **sixth** change to raise it | A **governance decision for the owner**. A change may not invent one |

## TD-5 — the audit probe is rewritten from scratch every change

| Field | Value |
|---|---|
| What | `pnpm audit` is permission-blocked in build sessions, so each change writes a throwaway Node reproduction and deletes it. **Three in a row have been wrong on their first run** (CR-004, CR-005, and this one — `defect-log.md` D-1) |
| Cost | Each change spends real effort re-deriving it, and each gets it wrong differently |
| Suggested fix | Either grant `pnpm audit` in build sessions, or commit the probe as a checked-in script with its sanity checks (closure ≈70 packages, `nanoid@3.3.18` present, **every advisory id non-empty and `/^GHSA-/`**) |
| Owner | **Owner / conductor** — a permissions or repo-tooling decision, outside a component change's lane |
