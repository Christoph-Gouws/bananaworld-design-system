// CR-DESIGN-SYSTEM-014 — mutation battery. Each mutation breaks one promise of the two new components;
// the spec MUST go red on every one. Run from the repo root: `node runs/change-13/output/mutation-battery.mjs`.
// Every file is restored byte-for-byte afterwards, whether the run passes or not.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SPEC = "tests/components/ActivityTimeline.test.tsx";
const MUTATIONS = [
  {
    name: "a part's dot drawn in the accent",
    file: "src/components/ActivityTimeline.tsx",
    from: 'tone === "part" ? "border-border-strong" : "border-accent"',
    to: '"border-accent"',
  },
  {
    name: "the tag is dropped",
    file: "src/components/ActivityTimeline.tsx",
    from: "              {tag}\n",
    to: "\n",
  },
  {
    name: "values mode tints and keeps a before column",
    file: "src/components/ChangeTable.tsx",
    from: "const tinted = !values && row.changed === true;",
    to: "const tinted = row.changed === true;",
  },
  {
    name: "the kept-back rows are always shown",
    file: "src/components/ChangeTable.tsx",
    from: "{open && <Grid rows={more.rows}",
    to: "{<Grid rows={more.rows}",
  },
  {
    name: "the toggle loses aria-expanded",
    file: "src/components/ChangeTable.tsx",
    from: "aria-expanded={open}",
    to: "",
  },
];

let failures = 0;
for (const m of MUTATIONS) {
  const original = readFileSync(m.file, "utf8");
  if (!original.includes(m.from)) {
    console.log(`✗ ANCHOR MISSING: ${m.name}`);
    failures += 1;
    continue;
  }
  if (original.split(m.from).length !== 2) {
    console.log(`✗ ANCHOR NOT UNIQUE: ${m.name}`);
    failures += 1;
    continue;
  }
  writeFileSync(m.file, original.replace(m.from, m.to));
  let red = false;
  try {
    execSync(`npx vitest run ${SPEC}`, { stdio: "pipe" });
  } catch {
    red = true;
  } finally {
    writeFileSync(m.file, original);
  }
  const ok = m.expectGreen ? !red : red;
  console.log(`${ok ? "✓" : "✗"} ${m.name}: spec ${red ? "RED" : "green"}${m.expectGreen ? " (expected green)" : ""}`);
  if (!ok) failures += 1;
}
console.log(failures === 0 ? `battery ${MUTATIONS.length}/${MUTATIONS.length}` : `battery FAILED: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
