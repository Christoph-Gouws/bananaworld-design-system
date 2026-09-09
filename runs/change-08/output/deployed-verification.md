# Deployed verification — CR-DESIGN-SYSTEM-009

## There is nothing deployed to verify, and that is structural

`@bananaworld/design-system` **is not deployed.** It ships **TypeScript source only** (`files: ["src"]`
— no build step, no bundle, no artifact), and its five consumers transpile it through Next.js
`transpilePackages` after pinning it **by git sha**. There is no environment, no URL, no running
process and no database belonging to this package.

So "verify it on staging" has no referent here. Stating that plainly is the verification; an
unrecorded N/A would be a skip.

| Thing normally verified after deploy | Here |
|---|---|
| Staging URL / smoke test | **N/A** — no deployable unit. Eighth change to record it |
| Migration applied to staging | **N/A** — no database by construction (TECH-COMP-003 / ADR-001) |
| Rollback captured | **N/A** — nothing applied. A consumer "rolls back" by not moving its pin |
| Post-apply verification | **N/A** |
| Throwaway Postgres torn down | **No container was ever started.** Nothing running, nothing stopped, no port held |

## What stands in its place

The claim a deployment check would make — *"the thing that runs is the thing we think it is"* — is made
here by rendering instead, and more strictly than a smoke test would:

| Claim | How it was verified |
|---|---|
| Every existing caller renders identically | **1,972 caller shapes**, whole `innerHTML`, against `main@6ed975d` — **0 differences** |
| The seven shipped toolbar screens are unmoved | whole-DOM snapshot, **zero-line diff** |
| The new behaviour actually works | driven by clicking and ticking, never by inspecting props |
| The specs would catch a regression | **8 mutations, 8 caught** |
| Types still compile for a consumer | `pnpm typecheck` clean; `select` gained only an OPTIONAL property, so a narrower consumer type still accepts it |

## Where verification genuinely still has to happen — and by whom

🔴 **This change fixes NO screen, and nothing the owner opens will look different yet.** The report
opens smaller only after all three of these, **in order**:

1. this merges to `main`;
2. **DC bumps its pin to the MERGED `main` sha** — never a branch sha (KI-M001E19-002);
3. DC passes `density="compact"`, `wrap="truncate"`, a `width` per column, and `multiple` on its
   filter cells, and moves its query writer to `append` / `getAll` — **its own change, its own gate**.

Two checks belong to that DC change and cannot be made from here:

- **The three-row width wiring (§C.4a).** A column is its `GridHeadCell`, its filter cell and its body
  cell. Wiring two of three lets the widest win and the cap is silently defeated. The package asserts
  all three emit the same class for the same step; the *wiring* is DC's gate.
- **Chip columns must opt to `wrap="nowrap"`** (`ColourStageCell`, `DrillCell`), or `overflow:hidden`
  clips the chip's ring. This would look like a rendering bug in this package and would not be one.

## One open verification that is THIS change's, and could not be run here

**OQ-8** — does `max-width` actually cap a `<td>` under `table-layout: auto`? happy-dom does no layout,
and **no browser binary can be executed from this sandbox**. A ready-to-run probe ships at
`runs/change-08/output/truncate-probe.html`; opening it in any browser answers it in one click.
**No claim is made that it has been opened.** See `qa-report.md` §5 for the bounded risk and the named,
untaken fallback.
