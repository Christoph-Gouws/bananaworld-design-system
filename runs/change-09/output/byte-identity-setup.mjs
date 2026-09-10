// CR-DESIGN-SYSTEM-010 — materialise the PRE-CHANGE `src/` tree so the byte-identity harness can
// render every existing caller shape against both trees in one process.
//
// Reused from CR-DESIGN-SYSTEM-009 (handover point 10), which built it ad hoc; committed this time so
// the next change does not rebuild it a third time.
//
// Usage:  node runs/change-09/output/byte-identity-setup.mjs <merge-base-sha>
//
// It copies the working `src/` to `baseline-tmp/src/`, then overwrites every file that DIFFERS from
// the merge base with the merge base's own bytes. Copying first (rather than checking the whole tree
// out) keeps the relative import graph intact with no path rewriting.
//
// ⚠ THE BASELINE IS A THROWAWAY. `baseline-tmp/` is deleted before the change is staged — it is a
//   verbatim copy of already-committed code and must never enter a commit.

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const base = process.argv[2];
if (base === undefined) {
  console.error("usage: node byte-identity-setup.mjs <merge-base-sha>");
  process.exit(2);
}

const root = process.cwd();
const out = join(root, "baseline-tmp");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "src"), join(out, "src"), { recursive: true });

// Which of the working tree's src files differ from the merge base — those are the only ones to roll
// back. `--diff-filter=M` on purpose: an ADDED file has no baseline, and a DELETED one would be a
// removal this lane forbids outright.
const changed = execFileSync("git", ["diff", "--name-only", "--diff-filter=M", base, "--", "src"], {
  encoding: "utf8",
})
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l !== "");

for (const path of changed) {
  // Buffer, never a string: a string round-trip through Windows line endings would make every
  // restored file byte-different from what the merge base actually holds (CR-009 defect-log D-1).
  const bytes = execFileSync("git", ["show", `${base}:${path}`], { maxBuffer: 64 * 1024 * 1024 });
  const target = join(out, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
}

console.log(`baseline @ ${base}: ${String(changed.length)} file(s) rolled back`);
for (const path of changed) console.log(`  ${path}`);
