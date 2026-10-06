// CR-DESIGN-SYSTEM-013 — drive the REAL controls in a REAL browser and save what the owner looks at.
//
// This package has no browser-test tool of its own (vitest + happy-dom only), so this is a one-off
// driver, archived with the change: it compiles the page's Tailwind classes, serves `main.tsx` through
// vite, opens it in Edge (system install) through bananaworld-dc's playwright-core — READ-ONLY use of
// that repo: modules are loaded from it, nothing is written into it — presses the controls, asserts
// what the owner asked for, and writes screenshots to ../frames/.
//
// Usage (from the package root):  node runs/change-10/evidence/browser-proof/proof.mjs
// Every scratch file (compiled CSS, vite cache, browser profile) lives in ./.out and is deleted after.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-10/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-10/evidence/frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

// 1. The consumer-side CSS: the package's own tokens, then Tailwind over the package's source.
writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], {
  stdio: "pipe",
});

// 2. Serve the page.
const vite = await import(pathToFileURL(VITE).href);
const react = (await import("@vitejs/plugin-react")).default;
const server = await vite.createServer({
  root: HERE,
  configFile: false,
  plugins: [react()],
  cacheDir: join(OUT, "vite-cache"),
  logLevel: "error",
  server: { port: 5199, strictPort: true, fs: { allow: [ROOT] } },
});
await server.listen();

const failures = [];
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
  if (!ok) failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 760 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:5199/");
  // ⚠ By attribute, not by role: an open Radix menu aria-hides the rest of the page, trigger included.
  const gridCell = page.locator('button[aria-label="Filter by Batch"]');
  await gridCell.waitFor();

  const boxes = async () =>
    page.getByRole("menuitemcheckbox").evaluateAll((els) =>
      els.map((e) => `${(e.textContent ?? "").trim()}=${e.getAttribute("aria-checked")}`),
    );
  const shot = async (name) => {
    const menu = page.getByRole("menu");
    const a = await gridCell.boundingBox();
    const b = await menu.boundingBox();
    const x = Math.min(a.x, b.x) - 16;
    const y = Math.min(a.y, b.y) - 40;
    const clip = { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x + 16, height: b.y + b.height - y + 16 };
    await page.screenshot({ path: join(FRAMES, name), clip });
  };

  // STATE 1 — nothing narrowed.
  check("grid trigger at rest reads 'All batches'", (await gridCell.textContent()).trim(), "All batches");
  await gridCell.click();
  await page.getByRole("menu").waitFor();
  check("state 1: master ticked 'All 6', every batch ticked", await boxes(), [
    "Select allAll 6=true",
    ...["001", "002", "003", "004", "005", "006"].map((n) => `SBF-2610-${n}=true`),
  ]);
  check("state 1: footer", await page.getByText("Nothing hidden").count(), 1);
  await shot("01-grid-state1-nothing-narrowed.png");

  // STATE 2 — untick SBF-2610-003.
  await page.getByRole("menuitemcheckbox", { name: "SBF-2610-003" }).click();
  check("state 2: only 003 unticked, master mixed '5 of 6'", await boxes(), [
    "Select all5 of 6=mixed",
    ...["001", "002", "003", "004", "005", "006"].map((n) => `SBF-2610-${n}=${n === "003" ? "false" : "true"}`),
  ]);
  check("state 2: footer names the hidden batch", await page.getByText("Hidden: SBF-2610-003").count(), 1);
  check("state 2: trigger counts (layout B)", (await gridCell.textContent()).trim(), "5 of 6 batches");
  check(
    "state 2: stored as an EXCLUSION",
    await page.getByTestId("grid-value").textContent(),
    JSON.stringify({ batch: { kind: "select", value: "", excluded: ["SBF-2610-003"] } }),
  );
  await shot("02-grid-state2-one-unticked.png");

  // STATE 3 — untick Select all (from everything).
  await page.getByRole("menuitemcheckbox", { name: /Select all/ }).click(); // dash → everything
  await page.getByRole("menuitemcheckbox", { name: /Select all/ }).click(); // ticked → clear every tick
  check("state 3: every tick cleared, master '0 of 6'", await boxes(), [
    "Select all0 of 6=false",
    ...["001", "002", "003", "004", "005", "006"].map((n) => `SBF-2610-${n}=false`),
  ]);
  check(
    "state 3: footer says the table still shows everything",
    await page.getByText("Nothing ticked — showing everything until you tick one").count(),
    1,
  );
  check("state 3: nothing committed (still everything)", await page.getByTestId("grid-value").textContent(), "{}");
  check("state 3: trigger rests unset", (await gridCell.textContent()).trim(), "All batches");
  await shot("03-grid-state3-select-all-unticked.png");

  // From state 3, tick two → ONLY those two.
  await page.getByRole("menuitemcheckbox", { name: "SBF-2610-002" }).click();
  await page.getByRole("menuitemcheckbox", { name: "SBF-2610-005" }).click();
  check(
    "from state 3, ticking two narrows to only those",
    await page.getByTestId("grid-value").textContent(),
    JSON.stringify({ batch: { kind: "select", value: "SBF-2610-002", values: ["SBF-2610-002", "SBF-2610-005"] } }),
  );
  await shot("04-grid-ticked-two-from-nothing.png");
  await page.keyboard.press("Escape");

  // ABSENT where it must not appear: the column that did not ask for it behaves as today.
  const defaultCell = page.locator('button[aria-label="Filter by Batch default"]');
  await defaultCell.click();
  await page.getByRole("menu").waitFor();
  check("a column without selectAll keeps today's list: nothing ticked", (await boxes()).slice(1), [
    ...["001", "002", "003", "004", "005", "006"].map((n) => `SBF-2610-${n}=false`),
  ]);
  check("a column without selectAll keeps today's footer", await page.getByText("None chosen").count(), 1);
  {
    const a = await defaultCell.boundingBox();
    const b = await page.getByRole("menu").boundingBox();
    const x = Math.min(a.x, b.x) - 16;
    const y = a.y - 40;
    await page.screenshot({
      path: join(FRAMES, "05-grid-default-column-unchanged.png"),
      clip: { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x + 16, height: b.y + b.height - y + 16 },
    });
  }
  await page.keyboard.press("Escape");

  // The toolbar — untick one batch and look at the TABLE.
  const barTrigger = page.locator('button[aria-label="Filter by Batches"]');
  await barTrigger.click();
  await page.getByRole("menu").waitFor();
  await page.getByRole("menuitemcheckbox", { name: "SBF-2610-003" }).click();
  await page.keyboard.press("Escape");
  const rows = await page.getByRole("list", { name: "rows" }).locator("li").allTextContents();
  check("toolbar: only SBF-2610-003 is gone; the row with no batch stays", rows, [
    "SBF-2610-001",
    "SBF-2610-002",
    "SBF-2610-004",
    "SBF-2610-005",
    "SBF-2610-006",
    "— (no batch recorded)",
  ]);
  check("toolbar: trigger counts", (await barTrigger.textContent()).trim(), "5 of 6 batches");
  check("toolbar: Clear is offered", await page.getByRole("button", { name: /Clear/ }).count(), 1);
  const section = page.locator("section").nth(1);
  await section.screenshot({ path: join(FRAMES, "06-toolbar-one-unticked-table.png") });
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}

console.log(`\n${failures.length === 0 ? "ALL PASS" : `${failures.length} FAILED`}`);
process.exit(failures.length === 0 ? 0 : 1);
