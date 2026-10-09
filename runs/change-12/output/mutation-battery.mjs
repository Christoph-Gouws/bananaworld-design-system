// CR-DESIGN-SYSTEM-015 mutation battery: each mutant must turn tests/themes red. Restores every file.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const T = "src/lib/themes/packhouse.css";
const K = "src/lib/tokens.css";
const P = "package.json";
const muts = [
  ["sixth property", T, (s) => s.replace("--color-ring: #0f766e;", "--color-ring: #0f766e;\n  --color-bg: red;")],
  ["change one hex", T, (s) => s.replace("#0b5f58", "#0b5f59")],
  ["drop :root[data-theme]", T, (s) => s.replace(':root[data-theme="packhouse"],\n', "")],
  ["second block", T, (s) => s + "\n[data-x] { --color-accent: red; }\n"],
  ["edit tokens.css one byte", K, (s) => s.replace("--font-sans", "--font-sanz")],
  ["delete export entry", P, (s) => s.replace(/,\s*"\.\/themes\/packhouse\.css": "[^"]+"/, "")],
];
let killed = 0;
for (const [name, file, fn] of muts) {
  const orig = readFileSync(file, "utf8");
  const next = fn(orig);
  if (next === orig) {
    console.log("ANCHOR NOT FOUND:", name);
    process.exit(2);
  }
  writeFileSync(file, next);
  let red = false;
  try {
    execSync("npx vitest run --project themes", { stdio: "pipe" });
  } catch {
    red = true;
  }
  writeFileSync(file, orig);
  console.log(red ? "KILLED  " : "SURVIVED", name);
  if (red) killed++;
}
console.log(`${killed}/${muts.length}`);
process.exit(killed === muts.length ? 0 : 1);
