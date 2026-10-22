// CR-DESIGN-SYSTEM-021 mutation battery. Each mutant edits one anchor in src/, runs the two new test
// files, and must turn them RED. The original bytes are always restored. "ANCHOR NOT FOUND" exits 1.
// Usage (package root):  node runs/change-19/output/mutation-battery.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const K = "src/components/Keypad.tsx";
const E = "src/components/keypad-entry.ts";
const A = "src/components/ActionTile.tsx";
const mutants = [
  ["leading zero kept", E, 'if (value === "0") return key;', 'if (value === "0") return value + key;'],
  ["max check > instead of >=", E, "value.length >= maxDigits", "value.length > maxDigits"],
  ["onChange called on a no-op", K, "if (next !== value) onChange(next);", "onChange(next);"],
  ["Delete mapped to backspace", K, 'key = "clear";', 'key = "backspace";'],
  ["modifier keys not ignored", K, "if (event.ctrlKey || event.metaKey || event.altKey) return;", ""],
  ["handler active when disabled", K, "if (event.defaultPrevented || disabled) return;", "if (event.defaultPrevented) return;"],
  ["key type dropped", K, 'className={DIGIT_KEY}\n            onClick={() => press(k)}', 'className={DIGIT_KEY}\n            onClick={() => press(k)}'],
  ["live region off", K, 'aria-live="polite"', 'aria-live="off"'],
  ["link path loses the hover override", A, 'primary: "bg-fg text-surface border-fg hover:text-surface hover:bg-fg/90"', 'primary: "bg-fg text-surface border-fg hover:bg-fg/90"'],
  ["href + disabled renders a link", A, '&& !disabled) {', ") {"],
  ["truncate added to the label", A, "whitespace-normal [overflow-wrap:anywhere]", "truncate [overflow-wrap:anywhere]"],
];
// The key `type` mutant needs a different anchor: the button element for digits.
mutants[6] = ["key type dropped", K, '<button\n            key={k}\n            type="button"', "<button\n            key={k}"];

let survived = 0;
for (const [name, file, from, to] of mutants) {
  const original = readFileSync(file, "utf8");
  const text = original.replace(/\r\n/g, "\n");
  if (!text.includes(from)) {
    console.log(`ANCHOR NOT FOUND: ${name}`);
    process.exit(1);
  }
  writeFileSync(file, text.replace(from, to));
  const r = spawnSync("pnpm", ["vitest", "run", "--project", "components", "tests/components/Keypad.test.tsx", "tests/components/ActionTile.test.tsx"], { encoding: "utf8", shell: true });
  writeFileSync(file, original);
  const killed = r.status !== 0;
  if (!killed) survived += 1;
  console.log(`${killed ? "KILLED " : "SURVIVED"}  ${name}`);
}
console.log(survived ? `\n${survived} SURVIVED` : `\nALL ${mutants.length} KILLED`);
process.exit(survived ? 1 : 0);
