// CR-DESIGN-SYSTEM-021 — drive the REAL Keypad / ActionTile in a REAL browser (Edge) at 375 and 1024 px.
// Same harness as runs/change-18/evidence/browser-proof/proof.mjs (bananaworld-dc modules read-only).
// Usage (package root):  node runs/change-19/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-19/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-19/evidence/frames");
const DC = "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });
const css = readFileSync(join(OUT, "proof.css"), "utf8");

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
  for (const [width, height] of [[375, 812], [1024, 768]]) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: width < 600,
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5199/");
    await page.addStyleTag({ content: css });
    await page.locator("#pad-live").waitFor();
    const w = `${width}px`;

    // Keys: height >= 64.
    const keyBoxes = await page.locator("#pad-empty button").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    check(`${w}: 12 keys`, keyBoxes.length, 12);
    check(`${w}: every key >= 64px tall`, keyBoxes.every((h) => h >= 64), true);

    // Tiles: >= 86px tall, equal width, label not truncated.
    const tiles = await page.locator("#tiles-grid > *").evaluateAll((els) => els.map((e) => ({ h: e.getBoundingClientRect().height, w: Math.round(e.getBoundingClientRect().width) })));
    check(`${w}: tiles >= 86px tall`, tiles.every((t) => t.h >= 86), true);
    check(`${w}: three tiles equal width`, new Set(tiles.map((t) => t.w)).size, 1);
    const clipped = await page.locator("#tiles-grid, #tiles-grid-2").locator("span[id$='-label']").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
    check(`${w}: no tile label truncated`, clipped, []);
    const rowH = await page.locator("#tiles-grid-2 > *").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    check(`${w}: tiles in one row share a height`, new Set(rowH).size, 1);

    // No horizontal page scroll.
    check(`${w}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);

    // Real tap + keyboard on the live pad: 1, 2, Backspace, Delete.
    const out = page.locator("#pad-live output");
    await page.locator("#pad-live").getByRole("button", { name: "1", exact: true }).tap();
    await page.locator("#pad-live").getByRole("button", { name: "2", exact: true }).tap();
    check(`${w}: taps 1,2 -> 12`, (await out.textContent()).trim(), "12");
    await page.locator("#pad-live").getByRole("button", { name: "2", exact: true }).focus();
    await page.keyboard.press("Backspace");
    check(`${w}: Backspace -> 1`, (await out.textContent()).trim(), "1");
    await page.keyboard.press("9");
    check(`${w}: keyboard 9 -> 19`, (await out.textContent()).trim(), "19");
    await page.keyboard.press("Delete");
    check(`${w}: Delete clears (announces "empty")`, (await out.textContent()).includes("empty"), true);
    for (const k of ["5", "0", "0", "0", "7"]) await page.keyboard.press(k);
    check(`${w}: max 4 digits, fifth ignored`, (await out.textContent()).trim(), "5000");
    check(`${w}: live region is polite`, await out.getAttribute("aria-live"), "polite");

    // Link tile navigates to its hash.
    await page.getByRole("link", { name: "New client" }).tap();
    check(`${w}: link tile navigates`, await page.evaluate(() => location.hash), "#new-client");

    // Disabled pad & tiles.
    check(`${w}: disabled pad keys all disabled`, await page.locator("#pad-disabled button:not([disabled])").count(), 0);
    check(`${w}: href+disabled tile is a disabled button`, await page.getByRole("button", { name: "Link disabled" }).isDisabled(), true);

    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body)).violations.map((v) => v.id));
    check(`${w}: axe violations`, violations, []);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(FRAMES, `0${width === 375 ? 1 : 2}-gallery-${width}.png`), fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
