# Defect log — CR-DESIGN-SYSTEM-009

> Stage 04. Defects found **during this session**, whether in the change, in a harness, or in the
> plan. A clean log is only worth reading if a dirty one would have been written.

**In the shipped change: 0 found, 0 open.**
**In this session's harnesses: 2 found, 2 fixed.** Both are recorded because both would have produced
a **confidently wrong report**, which is the failure mode this project has paid for four times.

---

## D-1 — the mutation harness's restore was byte-different, and two mutations silently never ran

| | |
|---|---|
| **Severity** | High *(as a reporting defect — it produced a wrong result that looked like a real one)* |
| **Where** | the throwaway mutation battery, not the shipped code |
| **Status** | **Fixed and re-run.** Final: 8/8 caught, 8/8 restores verified byte for byte |

**What happened.** The battery was written to restore each mutated file with `git checkout --`,
following CR-DESIGN-SYSTEM-007's own `defect-log.md` D-1 — which warns that `git checkout --` restores
from the **INDEX**, so the source must be staged first. It was staged first. That precaution turned out
to be **necessary but not sufficient**.

On Windows, git's autocrlf rewrites line endings on the way out. The restored file was therefore
byte-**different** from the file under test even though its content was identical. Two consequences,
one loud and one silent:

- **Loud:** the harness's own `restored` self-check went `false` and printed
  `!!! A RESTORE FAILED — do not trust the run above.`
- **Silent, and the dangerous one:** every later **multi-line** anchor stopped matching, because the
  file now held `\r\n` where the anchor held `\n`. Mutations **M-1** and **M-7** never ran at all. The
  run reported `6/8` — which reads like "two mutations were not caught" when the truth was "two
  mutations were never applied."

**Why it matters beyond this session.** M-7 is the §C.4a desync guard and M-1 is the `HEAD_WRAP`
regression — the two mutations most worth running. A report of `6/8` that had been rounded up to "the
suite is fine" would have shipped two untested guards.

**Fix.** Stop using `git checkout --` for this at all:

- keep the **original bytes** in memory and write them back verbatim (`writeFileSync(path, bytes)`);
- verify the restore with `Buffer.equals`, not a string compare;
- match anchors against **LF-normalised** content, and report `*** ANCHOR NOT FOUND ***` loudly instead
  of skipping silently.

**Standing lesson for the next session** — this supersedes CR-007's D-1 rather than repeating it:
🔴 **Do not restore a mutated file with `git checkout --` on Windows.** Staging first fixes the index
hazard but not the line-ending one. Keep the bytes and write them back; and make a harness that skips a
mutation SAY SO — a silent skip is indistinguishable from a pass.

---

## D-2 — the dependency-audit probe lied on its first run (the fourth in a row), and its own assertion caught it

| | |
|---|---|
| **Severity** | High *(as a reporting defect)* |
| **Where** | the throwaway audit probe, not the shipped code |
| **Status** | **Fixed and re-run.** Final numbers reconcile with the standing figures |

**What happened.** The probe walked the pnpm store by parsing directory names — `name@version(peers)`
with `/` escaped as `+` — stripping the peer suffix explicitly, which is the trap CR-004 fell into.
It fell into the *next* one along. On Windows pnpm **shortens** a long store directory:

```
@radix-ui+react-checkbox@1._c2b24e10d7c6f0fc373f9fd857c6266f
```

The version is truncated to `1.` and the peer suffix is a hash, so **no** name/version regex over the
directory name can be right. Result: a 46-package closure with `next` and `nanoid` **absent** — which
would have reported **zero** `next` advisories and a clean audit.

**It never reached a verdict**, because the probe asserts its own inputs first:

```
S1  prod closure, deps + optionalDeps = 46
!!! S1 FAILED — the closure is implausibly small; the store walk is wrong. STOP.
```

**Fix.** Stop parsing directory names. Read every `package.json` under `.pnpm/*/node_modules/` and
take the `name` and `version` the manifest itself states. After the fix the numbers reconcile with the
standing figures — 102 with optional edges, **66 deps-only against the standing "~70"**, `sharp`
reachable only via an optional edge, `nanoid@3.3.18` present.

**Standing lesson.** 🔴 **A pnpm store directory name is not parseable on Windows. Read the manifest.**
That is now the fourth distinct way this one probe has been got wrong (CR-004 peer suffixes, CR-005
symlink parents and numeric-vs-GHSA ids, CR-006 a `github_advisory_id` field that does not exist, and
now truncated store dirs). **Keep every S-assertion, and keep them failing loudly** — S1 is the only
reason this session did not file a false all-clear, and S4 is the only reason CR-007 did not.

---

## Not defects — recorded so the next session does not re-investigate them

| Observation | Why it is not a defect |
|---|---|
| `tests/components/__snapshots__/DataTableToolbar.test.tsx.snap` shows as modified after any `vitest` run | **Zero-line content diff** — the known CRLF artifact, standing handover note 12. Not staged. Verified again this session |
| The byte-identity harness's first run showed differences on `GridHeadCell` and `GridFilterRow` | Radix mints a fresh `id` per render (`radix-_r_21g_`), so it differs between any two renders of the *same* component. Normalising only the generated portion cleared every one; the four Radix-free comparisons were identical on the first run |
| `pnpm format:check` fails repo-wide | **No prettier config exists.** Pre-existing drift across all `src/` files including ones never opened here, and not a CI job |
| No `lint` script, no eslint config, no `audit:deps` script | Pre-existing drift, out of lane. Recorded for the fourth time |
| Three new blocking advisories | **Real, and not a defect in this change.** Published 2026-09-08, `main` fails the same audit. `known-issues.md` §A and the decision card |
