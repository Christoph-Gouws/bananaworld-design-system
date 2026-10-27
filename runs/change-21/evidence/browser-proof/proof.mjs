// CR-DESIGN-SYSTEM-023 — drive the REAL LinkedRecords / DocumentHeader in a REAL browser (Edge) at 1270 px
// (mouse), and 820 / 375 px (touch, so `hover: none` is true). Same harness as
// runs/change-19/evidence/browser-proof/proof.mjs (bananaworld-dc modules read-only).
// Usage (package root):  node runs/change-21/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-21/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-21/evidence/frames");
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
  for (const [width, height, touch] of [[1270, 800, false], [820, 1100, true], [375, 812, true]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch && width < 600 });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5199/");
    await page.addStyleTag({ content: css });
    await page.locator("#line-header").waitFor();
    const w = `${width}px${touch ? " touch" : ""}`;
    const header = page.locator("#line-header");

    check(`${w}: info buttons ${touch ? "present (hover: none)" : "absent (mouse)"}`, await header.getByRole("button").count(), touch ? 3 : 0);
    check(`${w}: lock icon on the refused item`, await header.getByRole("img", { name: "You can't open crate corrections" }).count(), 1);
    check(`${w}: refused item has no link`, await header.getByRole("link", { name: "CC-00007" }).count(), 0);
    check(`${w}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    check(`${w}: line sits below the four slots, inside the header frame`, await page.evaluate(() => {
      const line = document.getElementById("line-header");
      const dl = line.closest("div.rounded-lg").querySelector("dl");
      return { below: line.getBoundingClientRect().top >= dl.getBoundingClientRect().bottom, outsideDl: !dl.contains(line), dt: dl.querySelectorAll("dt").length };
    }), { below: true, outsideDl: true, dt: 4 });
    check(`${w}: header without it is a single <dl>`, await page.evaluate(() => document.querySelector("#without-linked > :last-child").tagName), "DL");

    if (!touch) {
      await header.getByRole("link", { name: "DSP-00131" }).hover();
      await page.getByRole("tooltip").waitFor({ timeout: 2000 });
      check(`${w}: hover shows the card`, (await page.getByRole("tooltip").first().textContent()).includes("Acme Fresh Produce"), true);
      await page.screenshot({ path: join(FRAMES, "01-hover-card-1270.png") });
      await page.mouse.move(0, 0);
      await page.keyboard.press("Tab");
      await page.locator("#line-header a").first().focus();
      await page.getByRole("tooltip").first().waitFor({ timeout: 2000 });
      check(`${w}: keyboard focus shows the card`, await page.getByRole("tooltip").count() > 0, true);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(250);
      check(`${w}: Escape hides the card`, await page.getByRole("tooltip").count(), 0);
      await page.screenshot({ path: join(FRAMES, "02-header-with-linked-1270.png"), fullPage: true });
    } else {
      const boxes = await header.getByRole("button").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
      check(`${w}: info targets >= 40 x 40`, boxes.every(([bw, bh]) => bw >= 40 && bh >= 40), true);
      await header.getByRole("button", { name: "Summary of DSP-00131" }).tap();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      check(`${w}: tap opens the sheet with the number as its name`, await page.getByRole("dialog", { name: "DSP-00131" }).count(), 1);
      check(`${w}: sheet holds the app's Open link`, await dialog.getByRole("link", { name: "DSP-00131" }).getAttribute("href"), "#dsp-131");
      const box = await dialog.boundingBox();
      check(`${w}: sheet is the short panel (not full height)`, box.height < height * 0.9 && box.y > 0, true);
      await page.screenshot({ path: join(FRAMES, `0${width === 820 ? 3 : 4}-sheet-${width}.png`) });
      await dialog.getByRole("button", { name: "Close" }).tap();
      await page.waitForTimeout(400);
      check(`${w}: Close closes the sheet`, await page.getByRole("dialog").count(), 0);
      await page.screenshot({ path: join(FRAMES, `0${width === 820 ? 5 : 6}-header-with-linked-${width}.png`), fullPage: true });
    }

    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body)).violations.map((v) => v.id));
    check(`${w}: axe violations`, violations, []);
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
