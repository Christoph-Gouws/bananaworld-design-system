// CR-DESIGN-SYSTEM-030 plan 5.6 mutation battery. Run from the repo root: node runs/change-28/output/mutation-battery.mjs
// Each mutant edits src/components/PrintPreviewPanel.tsx, runs the panel spec, must see a NAMED spec fail, then restores.
// "ANCHOR NOT FOUND" exits non-zero; a mutant that leaves the spec green (SURVIVED) exits non-zero.
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const FILE = "src/components/PrintPreviewPanel.tsx";
const SPEC = "tests/components/PrintPreviewPanel.test.tsx";
const original = readFileSync(FILE, "utf8");

const GUARD = 'if (armed.current === null || frameRef.current?.getAttribute("src") !== armed.current) return;';
const NULLCHK = "if (!alive.current || blob === null) return;";
const MUTANTS = [
  ["M1 the preview's own load prints", GUARD, "if (false) return;"],
  ["M2 null still prints", NULLCHK, 'if (!alive.current || (blob === null && action === "download")) return;'],
  ["M3 null still saves", NULLCHK, 'if (!alive.current || (blob === null && action === "print")) return;'],
  ["M4 no-viewer Print calls download()", "latest.current[action]()", 'latest.current[action === "print" && !viewer ? "download" : action]()'],
  ["M5 no-viewer still calls load()", "if (hasViewer) {", "if (true) {"],
  ["M6 `!== false` becomes `!`", "navigator.pdfViewerEnabled !== false", "!navigator.pdfViewerEnabled"],
  ["M7 in-flight ref removed", "if (inflight.current) return;", ""],
  ["M8 frame URL not revoked", "useEffect(() => () => void (frameUrl && URL.revokeObjectURL(frameUrl)), [frameUrl]);", "useEffect(() => undefined, [frameUrl]);"],
  ["M9 target=_blank added", "link.hidden = true;", 'link.hidden = true; link.target = "_blank";'],
  ["M10 load in the effect's dependencies", "}, [latest]);", "}, [latest, latest.current.load]);"],
  ["M11 iframe key removed", "        key={frameUrl}\n", ""],
];

let bad = 0;
try {
  for (const [name, anchor, replacement] of MUTANTS) {
    if (!original.includes(anchor)) {
      console.log(`${name}: ANCHOR NOT FOUND`);
      bad++;
      continue;
    }
    writeFileSync(FILE, original.replace(anchor, replacement));
    const run = spawnSync(
      "npx",
      ["vitest", "run", SPEC, "--pool=threads", "--maxWorkers=2", "--testTimeout=60000", "--reporter=verbose"],
      { encoding: "utf8", shell: true },
    );
    const red = (run.stdout + run.stderr).split("\n").filter((l) => /^\s*(×|✗|FAIL)\s/.test(l) && l.includes(">"));
    const names = [...new Set(red.map((l) => l.replace(/^\s*(×|✗|FAIL)\s+/, "").replace(/\s+\d+ms$/, "").trim()))];
    if (run.status === 0 || names.length === 0) {
      console.log(`${name}: SURVIVED (spec stayed green)`);
      bad++;
    } else {
      console.log(`${name}: KILLED by -> ${names.join(" | ")}`);
    }
  }
} finally {
  writeFileSync(FILE, original);
}
process.exit(bad === 0 ? 0 : 1);
