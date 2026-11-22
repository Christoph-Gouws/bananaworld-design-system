// CR-DESIGN-SYSTEM-032 mutation battery. Each mutant edits one source anchor and the three frame specs
// MUST go red; the original file is always restored. "ANCHOR NOT FOUND" exits non-zero.
// Usage (package root): node runs/change-30/output/mutation-battery.mjs
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SPECS = ["tests/components/AppShell.test.tsx", "tests/components/UserMenu.test.tsx", "tests/components/app-menu.test.tsx"];
const MUTANTS = [
  { name: "accordion type=multiple", file: "src/components/SideMenu.tsx", edits: [['type="single" collapsible', 'type="multiple"']] },
  { name: "roll-up counts hidden items", file: "src/components/app-menu.ts", edits: [["    .filter((item) => item.hidden !== true)\n    .reduce", "    .reduce"]] },
  { name: "empty-group filter removed", file: "src/components/app-menu.ts", edits: [["\n    .filter((group) => group.items.length > 0);", ";"]] },
  { name: "current heading never marked", file: "src/components/SideMenu.tsx", edits: [['data-current={current ? "" : undefined}', "data-current={undefined}"]] },
  { name: "flyout does not open on focus", file: "src/components/MenuRail.tsx", edits: [["else props.onFocusOpen();", "else undefined;"]] },
  { name: "stored value read during render", file: "src/components/AppShell.tsx", edits: [['useState<AppMenuMode>("open")', "useState<AppMenuMode>(() => readMenuMode(props.storageKey ?? DEFAULT_MENU_STORAGE_KEY))"]] },
  { name: "junk stored value means rail", file: "src/components/app-menu.ts", edits: [['=== "rail" ? "rail" : "open"', '!== "open" ? "rail" : "open"']] },
  { name: "menu button is not the Dialog.Trigger", file: "src/components/AppHeader.tsx", edits: [["<Dialog.Trigger asChild>", "<>"], ["</Dialog.Trigger>", "</>"]] },
  { name: "choosing an item does not close the slide-out", file: "src/components/AppShell.tsx", edits: [["onNavigate={props.close}", "onNavigate={undefined}"]] },
  { name: "max-w cap added to main", file: "src/components/AppShell.tsx", edits: [["min-h-0 flex-1 overflow-auto p-6", "min-h-0 max-w-[1440px] flex-1 overflow-auto p-6"]] },
  { name: "language item closes the menu (no preventDefault)", file: "src/components/UserMenu.tsx", edits: [["onSelect={(event) => event.preventDefault()}", "onSelect={() => undefined}"]] },
];

let survived = 0;
for (const m of MUTANTS) {
  const original = readFileSync(m.file, "utf8");
  let mutated = original;
  for (const [from, to] of m.edits) {
    if (!mutated.includes(from)) {
      console.error(`ANCHOR NOT FOUND: ${m.name} — ${from}`);
      process.exit(2);
    }
    mutated = mutated.replace(from, to);
  }
  try {
    writeFileSync(m.file, mutated);
    const run = spawnSync("npx", ["vitest", "run", "--pool=threads", "--maxWorkers=2", "--testTimeout=20000", ...SPECS], { shell: true, encoding: "utf8" });
    const killed = run.status !== 0;
    const named = [...(run.stdout + run.stderr).matchAll(/FAIL\s+\|components\|\s+(\S+) >/g)].map((x) => x[1]);
    console.log(`${killed ? "KILLED  " : "SURVIVED"} ${m.name}${killed ? `  (${[...new Set(named)].join(", ")})` : ""}`);
    if (!killed) survived += 1;
  } finally {
    writeFileSync(m.file, original);
  }
}
console.log(`\n${MUTANTS.length - survived}/${MUTANTS.length} killed`);
process.exit(survived ? 1 : 0);
