// CR-DESIGN-SYSTEM-034 mutation battery. Each mutant edits one source anchor and the three topItems specs
// MUST go red; the original file is always restored. "ANCHOR NOT FOUND" exits non-zero.
// Usage (package root): node runs/change-32/output/mutation-battery.mjs
// `nth` picks which occurrence of `from` to change (0-based; default 0).
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SPECS = [
  "tests/components/AppShell.test.tsx",
  "tests/components/AppShell.topitems-absent.test.tsx",
  "tests/components/app-menu.test.tsx",
];
const SM = "src/components/SideMenu.tsx";
const MR = "src/components/MenuRail.tsx";
const AS = "src/components/AppShell.tsx";
const AM = "src/components/app-menu.ts";
const TOP_BLOCK =
  "        {props.topItems.length > 0 && (\n          <TopLinks items={props.topItems} pathname={pathname} onNavigate={props.onNavigate} />\n        )}\n";
const MUTANTS = [
  { name: "top items rendered after the accordion", file: SM, edits: [[TOP_BLOCK, ""], ["        </Accordion.Root>\n", `        </Accordion.Root>\n${TOP_BLOCK}`]] },
  { name: "open: current ignores sub-paths (href equality)", file: SM, edits: [["isMenuItemCurrent(item, props.pathname)", "props.pathname === item.href", 1]] },
  { name: "rail: current ignores sub-paths (href equality)", file: MR, edits: [["isMenuItemCurrent(item, pathname)", "pathname === item.href"]] },
  { name: "hidden not filtered (helper)", file: AM, edits: [["return (items ?? []).filter((item) => item.hidden !== true);", "return [...(items ?? [])];"]] },
  { name: "hidden not filtered (AppShell bypasses the helper)", file: AS, edits: [["const topItems = visibleTopItems(props.topItems);", "const topItems = props.topItems ?? [];"]] },
  { name: "an empty <ul> is rendered when there are no items", file: SM, edits: [["{props.topItems.length > 0 && (", "{("]] },
  { name: "rail link without aria-label", file: MR, edits: [["              aria-label={item.label}\n", ""]] },
  { name: "rail link is not a NavigationMenu.Link", file: MR, edits: [["<NavigationMenu.Link asChild active={current}>", "<>"], ["</NavigationMenu.Link>", "</>"]] },
  { name: "slide-out top link without onNavigate", file: SM, edits: [["onClick={props.onNavigate}", "onClick={undefined}", 1]] },
  { name: "slide-out gets no top items", file: AS, edits: [["topItems={visibleTopItems(shell.topItems)}", "topItems={[]}"]] },
  { name: "open: the on-style inset bar dropped", file: SM, edits: [["text-fg shadow-[inset_3px_0_0_var(--color-accent)]", "text-fg", 1]] },
  { name: "rail: the on-style inset bar dropped", file: MR, edits: [["bg-accent-subtle text-accent shadow-[inset_3px_0_0_var(--color-accent)]", "bg-accent-subtle text-accent"]] },
  { name: "open: a chevron is drawn on the top item", file: SM, edits: [["              <span className=\"truncate\">{item.label}</span>\n            </Link>\n          </li>\n        );\n      })}\n    </ul>\n  );\n}\n\nexport function FootLinks", "              <span className=\"truncate\">{item.label}</span>\n              <ChevronDown aria-hidden=\"true\" className=\"ml-auto h-4 w-4\" />\n            </Link>\n          </li>\n        );\n      })}\n    </ul>\n  );\n}\n\nexport function FootLinks"]] },
];

function replaceNth(text, from, to, nth) {
  let at = -1;
  for (let i = 0; i <= nth; i += 1) {
    at = text.indexOf(from, at + 1);
    if (at === -1) return null;
  }
  return text.slice(0, at) + to + text.slice(at + from.length);
}

let survived = 0;
for (const m of MUTANTS) {
  const original = readFileSync(m.file, "utf8");
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let mutated = original;
  for (const [from, to, nth = 0] of m.edits) {
    const next = replaceNth(mutated, from.replace(/\n/g, eol), to.replace(/\n/g, eol), nth);
    if (next === null) {
      console.error(`ANCHOR NOT FOUND: ${m.name} — ${from}`);
      process.exit(2);
    }
    mutated = next;
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
