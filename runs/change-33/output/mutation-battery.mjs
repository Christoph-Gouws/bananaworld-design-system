// CR-DESIGN-SYSTEM-035 mutation battery. Each mutant edits one anchor in the source, runs the named specs,
// and must turn them RED. A missing anchor exits non-zero ("ANCHOR NOT FOUND"). Sources are restored after.
// Usage (package root): node runs/change-33/output/mutation-battery.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ST = "src/components/StatTile.tsx";
const AI = "src/components/AttentionItem.tsx";
const SB = "src/components/StatusBadge.tsx";
const SPEC = "tests/components/CR-DESIGN-SYSTEM-035.test.tsx";

const MUTANTS = [
  [ST, 'uppercase tracking-wide text-fg-muted [overflow-wrap:anywhere]', 'uppercase text-fg-muted [overflow-wrap:anywhere]', "LABEL loses tracking-wide (frozen HTML)"],
  [ST, 'return tone === "warning" || tone === "danger" || tone === "success" ? tone : null;', 'return tone === undefined ? null : (tone as ToneKey);', 'tone classes applied for tone="default"'],
  [ST, 'toneKey === "danger" && "text-danger")}>', 'toneKey !== null && "text-danger")}>', "danger value colour on every tone"],
  [ST, '{footed ? <TileFoot linkLabel={linkLabel!} /> : null}', '{footed ? null : null}', "link label not drawn"],
  [ST, '{linked && !footed ? (', '{linked ? (', "chevron kept with linkLabel"],
  [AI, '{hasDetail ? (', '{false ? (', "AttentionItem detail line not drawn"],
  [AI, 'hidden items-center gap-1', 'inline-flex items-center gap-1', "action shown under 480 px"],
  [SB, 'if (shown <= 0 || !Number.isFinite(shown)) return null;', 'if (!Number.isFinite(shown)) return null;', "CountBadge renders 0"],
  [SB, 'COUNT_TONE[tone] ?? COUNT_TONE.default,', 'COUNT_TONE[tone] ?? COUNT_TONE.default, "uppercase",', "CountBadge draws uppercase"],
];

let escaped = 0;
let missing = 0;
for (const [file, from, to, name] of MUTANTS) {
  const original = readFileSync(file, "utf8");
  const norm = original.replace(/\r\n/g, "\n");
  if (!norm.includes(from)) {
    console.log(`ANCHOR NOT FOUND  ${name}`);
    missing += 1;
    continue;
  }
  writeFileSync(file, norm.replace(from, to));
  let red = false;
  try {
    execFileSync("npx", ["vitest", "run", "--pool=threads", "--maxWorkers=2", "--testTimeout=60000", SPEC, "tests/components/StatTile.test.tsx"], { stdio: "pipe", shell: true });
  } catch {
    red = true;
  } finally {
    writeFileSync(file, original);
  }
  console.log(`${red ? "KILLED " : "ESCAPED"}  ${name}`);
  if (!red) escaped += 1;
}
console.log(`\n${MUTANTS.length - escaped - missing} / ${MUTANTS.length} killed`);
process.exit(escaped || missing ? 1 : 0);
