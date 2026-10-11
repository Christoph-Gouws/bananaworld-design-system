// CR-DESIGN-SYSTEM-018 mutation battery. Each mutant edits one source line, runs the two test files,
// and must turn at least one test red. "ANCHOR NOT FOUND" exits non-zero. Always restores the file.
// Usage (package root): node runs/change-16/output/mutation-battery.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const NB = "src/components/NavigationBusy.tsx";
const LK = "src/components/Link.tsx";
const MUTANTS = [
  ["drop the cleanup decrement", NB, "return () => report(-1);", "return;"],
  ["drop the 150 ms delay", NB, "NAVIGATION_BUSY_DELAY_MS = 150", "NAVIGATION_BUSY_DELAY_MS = 0"],
  ["render the mark without a provider", LK, "if (!busyContext || props.legacyBehavior)", "if (props.legacyBehavior)"],
  ["remove the legacyBehavior guard", LK, "if (!busyContext || props.legacyBehavior)", "if (!busyContext)"],
  ["flip the pendingIndicator default", LK, "pendingIndicator !== false", "pendingIndicator === true"],
  ['remove role="progressbar" while busy', NB, 'role: "progressbar", ', ""],
  ["drop the tablet prefetch rule's survival (force prefetch undefined)", LK, 'prefetch ?? (surface === "tablet" ? false : undefined)', "prefetch"],
];

let survived = 0;
for (const [name, file, from, to] of MUTANTS) {
  const original = readFileSync(file, "utf8");
  const normalised = original.replace(/\s+/g, " ");
  if (!normalised.includes(from.replace(/\s+/g, " ")) && !original.includes(from)) {
    console.log(`ANCHOR NOT FOUND  ${name}`);
    process.exit(2);
  }
  // Prettier may have wrapped the anchor across lines, so match with flexible whitespace.
  const pattern = new RegExp(from.split(/\s+/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*"));
  try {
    writeFileSync(file, original.replace(pattern, to));
    const run = spawnSync("pnpm", ["exec", "vitest", "run", "tests/components/NavigationBusy.test.tsx", "tests/components/Link.additive.test.tsx"], { encoding: "utf8", shell: true });
    const killed = run.status !== 0;
    console.log(`${killed ? "KILLED  " : "SURVIVED"}  ${name}`);
    if (!killed) survived++;
  } finally {
    writeFileSync(file, original);
  }
}
console.log(survived ? `\n${survived} SURVIVED` : "\nALL MUTANTS KILLED");
process.exit(survived ? 1 : 0);
