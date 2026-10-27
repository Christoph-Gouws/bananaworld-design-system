// CR-DESIGN-SYSTEM-023 mutation battery. Each mutant edits one anchor in src/, runs the two new spec files,
// and must turn them RED. The original bytes are always restored. "ANCHOR NOT FOUND" exits 1.
// Usage (package root):  node runs/change-21/output/mutation-battery.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const L = "src/components/LinkedRecords.tsx";
const H = "src/components/DocumentHeader.tsx";
const mutants = [
  ["M1 info button rendered regardless of hover:none", L, "summary !== undefined && cannotHover &&", "summary !== undefined &&"],
  ["M2 refused item gets the tooltip and the button", L, "if (refusedLabel !== undefined) return <RefusedItem text={text} refusedLabel={refusedLabel} />;", ""],
  ["M3 asChild straight onto the link node (span dropped)", L, '<span className="inline-flex">{numberNode}</span>', "{numberNode}"],
  ["M4 header always takes the wrapper branch", H, "if (linked === undefined || linked === null) {", "if (false) {"],
  ["M5 the line goes inside the dl", H, '<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</dl>\n      <div className="mt-4 border-t border-border pt-3 empty:hidden">{linked}</div>', '<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}<div className="mt-4 border-t border-border pt-3 empty:hidden">{linked}</div></dl>'],
  ["M6 empty test checks groups.length", L, 'state === "ready" && filled.length === 0', 'state === "ready" && groups.length === 0'],
  ["M7 Retry does not call onRetry", L, "onClick={onRetry}", "onClick={() => undefined}"],
  ["M8 the sheet's Open control dropped", L, "link !== null && link !== undefined &&", "false &&"],
  ["M9 refused item renders its date", L, "return <RefusedItem text={text} refusedLabel={refusedLabel} />;", "return <><RefusedItem text={text} refusedLabel={refusedLabel} /><span>{date}</span></>;"],
  ["M10 empty:hidden dropped", H, "pt-3 empty:hidden", "pt-3"],
];

let survived = 0;
for (const [name, file, from, to] of mutants) {
  const original = readFileSync(file, "utf8");
  const text = original.replace(/\r\n/g, "\n");
  if (!text.includes(from)) {
    console.log(`ANCHOR NOT FOUND: ${name}`);
    process.exit(1);
  }
  writeFileSync(file, text.replace(from, to));
  const r = spawnSync("pnpm", ["vitest", "run", "--project", "components", "tests/components/LinkedRecords.test.tsx", "tests/components/DocumentHeader.linked.test.tsx"], { encoding: "utf8", shell: true });
  writeFileSync(file, original);
  const killed = r.status !== 0;
  if (!killed) survived += 1;
  console.log(`${killed ? "KILLED " : "SURVIVED"}  ${name}`);
}
console.log(survived ? `\n${survived} SURVIVED` : `\nALL ${mutants.length} KILLED`);
process.exit(survived ? 1 : 0);
