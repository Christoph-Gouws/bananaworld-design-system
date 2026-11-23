// CR-DESIGN-SYSTEM-034 — drive the REAL AppShell with `topItems` in a REAL browser (Edge): the open menu,
// the 64 px rail and the slide-out, in packhouse teal and the DC's yellow, with measurements and axe
// (incl. colour contrast). Tailwind and playwright-core come from `pnpm dlx` (nothing is added to the repo).
// Usage (package root):
//   pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node runs/change-32/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-32/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-32/evidence/frames");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.6.6/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

// `pnpm dlx` puts its install's .bin on PATH; its node_modules sits beside it.
const dlxModules = process.env.PATH.split(delimiter)
  .filter((p) => p.endsWith(join("node_modules", ".bin")))
  .map((p) => dirname(p))
  .find((m) => existsSync(join(m, "playwright-core")) && existsSync(join(m, "tailwindcss")));
if (!dlxModules) throw new Error("run through: pnpm dlx --package=playwright-core@1.60.0 --package=tailwindcss@3.4.19 node <this file>");
const TW_CLI = join(dlxModules, "tailwindcss/lib/cli.js");
const PW = join(dlxModules, "playwright-core");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n${readFileSync(join(ROOT, "src/lib/themes/packhouse.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });
mkdirSync(join(HERE, "public"), { recursive: true });
writeFileSync(join(HERE, "public/proof.css"), readFileSync(join(OUT, "proof.css")));

const vite = await import(pathToFileURL(VITE).href);
const react = (await import("@vitejs/plugin-react")).default;
const server = await vite.createServer({
  root: HERE,
  configFile: false,
  plugins: [react()],
  cacheDir: join(OUT, "vite-cache"),
  logLevel: "error",
  resolve: { alias: { "next/link": join(HERE, "next-link-stub.tsx") } },
  server: { port: 5199, strictPort: true, fs: { allow: [ROOT] } },
});
await server.listen();

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — ${detail}`}`);
  if (!ok) failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
const axeOf = async (page, label, scope = "body", off = []) => {
  await page.addScriptTag({ path: AXE });
  const v = await page.evaluate(async ([sel, offRules]) => (await window.axe.run(document.querySelector(sel), { rules: Object.fromEntries(["region", ...offRules].map((r) => [r, { enabled: false }])) })).violations.map((x) => `${x.id}:${x.nodes.map((n) => n.target.join(" ") + " " + n.html.slice(0, 200)).join("|")}`), [scope, off]);
  check(`${label}: axe 0 violations (incl. colour contrast)`, v.length === 0, v.join(","));
};

async function open(w, h, query, stored) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (stored) await page.addInitScript((m) => localStorage.setItem("bw.app-shell.menu", m), stored);
  await page.goto(`http://localhost:5199/?${query}`);
  await page.getByRole("heading", { name: "Dashboard", level: 1 }).waitFor();
  return page;
}
const shot = (page, name) => page.screenshot({ path: join(FRAMES, `${name}.png`) });
const isFirstBefore = (page, aSel, bSel) => page.evaluate(([a, b]) => { const x = document.querySelector(a), y = document.querySelector(b); return !!(x && y && x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING); }, [aSel, bSel]);

try {
  for (const [theme, tag] of [["packhouse", "teal"], ["", "yellow"]]) {
    const q = (extra = "") => `${theme ? `theme=${theme}&` : ""}${extra}`;

    // ---- OPEN MENU, Dashboard current
    let page = await open(1440, 900, q("path=/dashboard"));
    let col = page.locator("aside");
    let dash = col.getByRole("link", { name: "Dashboard" });
    check(`${tag} open: Dashboard is current (aria-current=page)`, (await dash.getAttribute("aria-current")) === "page");
    check(`${tag} open: Dashboard sits above the first heading`, await isFirstBefore(page, "aside a[href='/dashboard']", "aside button[aria-expanded]"));
    check(`${tag} open: no chevron and no aria-expanded on Dashboard`, (await dash.getAttribute("aria-expanded")) === null && (await dash.locator("svg").count()) === 1);
    check(`${tag} open: no heading is marked current while Dashboard is`, (await col.locator("[data-current]").count()) === 0);
    const onStyle = await dash.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, shadow: getComputedStyle(el).boxShadow, w: getComputedStyle(el).fontWeight }));
    check(`${tag} open: the on style is drawn (tinted fill, inset bar, semibold)`, onStyle.bg !== "rgba(0, 0, 0, 0)" && onStyle.shadow.includes("inset") && Number(onStyle.w) >= 600, JSON.stringify(onStyle));
    await shot(page, `01-open-dashboard-current-${tag}`);
    await axeOf(page, `${tag} open (Dashboard current)`);
    // keyboard only: collapse button, then Dashboard
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    check(`${tag} open: Tab Tab from the page start lands on Dashboard`, await page.evaluate(() => document.activeElement?.getAttribute("href") === "/dashboard"));
    await page.close();

    // ---- OPEN MENU, another screen current
    page = await open(1440, 900, q("path=/loads/waiting"));
    col = page.locator("aside");
    dash = col.getByRole("link", { name: "Dashboard" });
    check(`${tag} open: on another screen Dashboard is not current`, (await dash.getAttribute("aria-current")) === null);
    check(`${tag} open: the Loads heading is current`, (await col.getByRole("button", { name: /^Loads/ }).getAttribute("data-current")) !== null);
    await shot(page, `02-open-other-current-${tag}`);
    await page.close();

    // ---- RAIL
    page = await open(1440, 900, q("path=/dashboard"), "rail");
    col = page.locator("aside");
    await page.getByRole("button", { name: "Expand menu" }).waitFor();
    check(`${tag} rail: 64px wide`, [64, 65].includes(Math.round((await col.boundingBox()).width)));
    dash = col.getByRole("link", { name: "Dashboard" });
    check(`${tag} rail: accessible name is the label, current, above the first heading`, (await dash.getAttribute("aria-current")) === "page" && (await isFirstBefore(page, "aside a[href='/dashboard']", "aside button[aria-haspopup], aside nav button:not([aria-label='Expand menu'])")));
    await axeOf(page, `${tag} rail`, "body", ["aria-hidden-focus"]);
    await page.keyboard.press("Tab"); // expand button
    await page.keyboard.press("Tab"); // Dashboard
    check(`${tag} rail: keyboard reaches Dashboard`, await page.evaluate(() => document.activeElement?.getAttribute("href") === "/dashboard"));
    await page.getByRole("tooltip").first().waitFor({ timeout: 3000 });
    check(`${tag} rail: the tooltip shows the label`, (await page.getByRole("tooltip").first().innerText()) === "Dashboard");
    check(`${tag} rail: focusing it opens no flyout`, (await page.getByRole("link", { name: "Waiting 2" }).count()) === 0 && (await page.getByRole("link", { name: "Waiting" }).count()) === 0);
    await shot(page, `03-rail-tooltip-${tag}`);
    await page.keyboard.press("ArrowDown");
    check(`${tag} rail: ArrowDown moves to the first heading`, await page.evaluate(() => (document.activeElement?.getAttribute("aria-label") ?? "").startsWith("Loads")));
    await page.close();

    // ---- SLIDE-OUT at 390
    page = await open(390, 844, q("path=/dashboard"));
    check(`${tag} 390: no sideways scroll`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await page.getByRole("button", { name: "Open menu" }).click();
    const dlg = page.getByRole("dialog");
    await dlg.waitFor();
    await page.waitForTimeout(350);
    const first = dlg.getByRole("link").first();
    check(`${tag} slide-out: Dashboard is the first link and is current`, (await first.innerText()) === "Dashboard" && (await first.getAttribute("aria-current")) === "page");
    await shot(page, `04-slide-out-${tag}`);
    await axeOf(page, `${tag} slide-out`, "[role=dialog]");
    await first.click();
    await dlg.waitFor({ state: "detached", timeout: 2000 }).catch(() => undefined);
    check(`${tag} slide-out: choosing Dashboard closes the menu`, (await page.getByRole("dialog").count()) === 0);
    await page.close();
  }

  // ---- ABSENT (the control): no topItems draws nothing new
  const page = await open(1440, 900, "theme=packhouse&path=/loads/waiting&top=0");
  check("absent: no Dashboard link, and the first thing in the menu is a heading", (await page.locator("aside a", { hasText: "Dashboard" }).count()) === 0 && (await page.locator("aside nav a").first().getAttribute("href")) !== "/dashboard");
  await shot(page, "05-absent-control");
  await page.close();
} finally {
  await browser.close();
  await server.close();
  rmSync(join(HERE, "public"), { recursive: true, force: true });
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
