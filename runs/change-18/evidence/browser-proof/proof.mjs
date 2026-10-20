// CR-DESIGN-SYSTEM-020 — drive the REAL ExportButton in a REAL browser (Edge) and save frames.
// Same harness as runs/change-10/evidence/browser-proof/proof.mjs (bananaworld-dc modules read-only).
// Usage (package root):  node runs/change-18/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-18/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-18/evidence/frames");
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
// index.html has no stylesheet link; inject the compiled CSS through a tiny wrapper page.
const css = readFileSync(join(OUT, "proof.css"), "utf8");

const vite = await import(pathToFileURL(VITE).href);
const react = (await import("@vitejs/plugin-react")).default;
const server = await vite.createServer({
  root: HERE,
  configFile: false,
  plugins: [react()],
  cacheDir: join(OUT, "vite-cache"),
  logLevel: "error",
  server: { port: 5198, strictPort: true, fs: { allow: [ROOT] } },
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
  for (const touch of [false, true]) {
    const ctx = await browser.newContext({
      viewport: touch ? { width: 390, height: 844 } : { width: 900, height: 420 },
      deviceScaleFactor: 2,
      hasTouch: touch,
      isMobile: touch,
      acceptDownloads: true,
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:5198/");
    await page.addStyleTag({ content: css });
    const link = page.getByRole("link", { name: "Export Excel" }).first();
    await link.waitFor();
    const mode = touch ? "touch" : "mouse";

    check(`${mode}: link has href and download=report.xlsx`, [await link.getAttribute("href"), await link.getAttribute("download")], ["/sample.xlsx", "report.xlsx"]);
    check(`${mode}: translated children shown`, await page.getByRole("link", { name: "Exportar PDF" }).count(), 1);
    const dis = page.getByRole("button", { name: "Exportar Excel" });
    check(`${mode}: disabled variant is a disabled button, no link`, [await dis.isDisabled(), await page.getByRole("link", { name: "Exportar Excel" }).count()], [true, 0]);

    const box = await link.boundingBox();
    if (touch) check("touch: link height >= 44px", box.height >= 44, true);
    else check("mouse: link height is 36px (unchanged browser size)", Math.round(box.height), 36);

    if (!touch) {
      const [dl] = await Promise.all([page.waitForEvent("download"), link.click()]);
      check("mouse click downloads with suggested name report.xlsx", dl.suggestedFilename(), "report.xlsx");
      // keyboard: Tab to the first link, Enter
      await page.mouse.click(5, 5);
      await page.keyboard.press("Tab");
      check("keyboard: Tab focuses the link", await link.evaluate((e) => e === document.activeElement), true);
      const [dl2] = await Promise.all([page.waitForEvent("download"), page.keyboard.press("Enter")]);
      check("keyboard Enter downloads report.xlsx", dl2.suggestedFilename(), "report.xlsx");
      await page.screenshot({ path: join(FRAMES, "01-link-focused-mouse.png") });

      let got = false;
      page.once("download", () => (got = true));
      await dis.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
      check("disabled variant produces no download", got, false);

      await page.getByRole("button", { name: "Export CSV" }).click();
      check("no-href button still shows today's toast", await page.getByText("Export coming soon").count() >= 1, true);
      await page.screenshot({ path: join(FRAMES, "02-toast-path-unchanged.png") });

      const tab = await page.locator("#row-tablet a").boundingBox();
      check("tablet surface link height 56px", Math.round(tab.height), 56);
    } else {
      await page.screenshot({ path: join(FRAMES, "03-touch-390.png") });
    }

    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => (await window.axe.run(document.body)).violations.map((v) => v.id));
    check(`${mode}: axe violations`, violations, []);
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
