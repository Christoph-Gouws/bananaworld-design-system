// CR-DESIGN-SYSTEM-032 — drive the REAL AppShell in a REAL browser (Edge): frames 1-6 of the owner's
// mockup in packhouse teal, frame 7 in the DC's yellow with a reused EmptyState, plus measurements and
// axe (incl. colour contrast) in each state. Tailwind and playwright-core are loaded READ-ONLY from
// bananaworld-dc's node_modules (nothing is written there). Usage (package root):
//   node runs/change-30/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-30/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-30/evidence/frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.6.6/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

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
const URL = (q = "") => `http://localhost:5199/?${q}`;
const axeOf = async (page, label, scope = "body", off = []) => {
  await page.addScriptTag({ path: AXE });
  const v = await page.evaluate(async ([sel, offRules]) => (await window.axe.run(document.querySelector(sel), { rules: Object.fromEntries(["region", ...offRules].map((r) => [r, { enabled: false }])) })).violations.map((x) => `${x.id}:${x.nodes.map((n) => n.target.join(" ") + " " + n.html.slice(0, 200)).join("|")}`), [scope, off]);
  check(`${label}: axe 0 violations (incl. colour contrast)`, v.length === 0, v.join(","));
};

async function open(w, h, query, stored) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (stored) await page.addInitScript((m) => localStorage.setItem("bw.app-shell.menu", m), stored);
  await page.goto(URL(query));
  await page.getByRole("heading", { name: "Waiting loads" }).waitFor();
  return page;
}
const shot = (page, name) => page.screenshot({ path: join(FRAMES, `${name}.png`) });

try {
  // ---- Frame 1: open menu, packhouse teal, 1440x900
  let page = await open(1440, 900, "theme=packhouse");
  const col = page.locator("aside");
  await col.getByRole("link", { name: "Waiting 2" }).waitFor();
  check("f1: Loads is open and its current screen is marked", (await col.getByRole("link", { name: "Waiting 2" }).getAttribute("aria-current")) === "page");
  check("f1: Admin (all items hidden) is absent", (await col.getByText("Admin").count()) === 0);
  check("f1: menu is 240px wide", Math.round((await col.boundingBox()).width) === 241 || Math.round((await col.boundingBox()).width) === 240, String((await col.boundingBox()).width));
  const headIcons = await col.locator("button[aria-expanded] svg").count();
  const itemIcons = await col.locator("a svg").count();
  check("f1: an icon on each heading (4 + chevrons), none on a screen link (only the Help foot icon)", headIcons >= 4 && itemIcons === 1, `${headIcons}/${itemIcons}`);
  await shot(page, "01-open-menu");
  await axeOf(page, "f1 open");

  // scroll contract
  const before = await page.evaluate(() => ({ h: document.querySelector("header").getBoundingClientRect().top, m: document.querySelector("aside").getBoundingClientRect().top }));
  await page.mouse.move(800, 500);
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    h: document.querySelector("header").getBoundingClientRect().top,
    m: document.querySelector("aside").getBoundingClientRect().top,
    doc: document.scrollingElement.scrollHeight === innerHeight,
    main: document.querySelector("main").scrollTop,
  }));
  check("scroll: header and menu never move; the document does not scroll; main does", before.h === after.h && before.m === after.m && after.doc && after.main > 0, JSON.stringify(after));

  // accordion in the real browser
  await col.getByRole("button", { name: "Stock" }).click();
  check("accordion: opening Stock closes Loads", (await col.getByRole("button", { name: /^Loads/ }).getAttribute("aria-expanded")) === "false" && (await col.getByRole("button", { name: "Stock" }).getAttribute("aria-expanded")) === "true");
  check("accordion: the current heading stays marked while closed", (await col.getByRole("button", { name: /^Loads/ }).getAttribute("data-current")) !== null);

  // ---- Frame 2: rail, remembered across reload
  await page.getByRole("button", { name: "Collapse menu" }).click();
  check("f2: rail is 64px", Math.round((await col.boundingBox()).width) === 64 || Math.round((await col.boundingBox()).width) === 65, String((await col.boundingBox()).width));
  await page.reload();
  await page.getByRole("button", { name: "Expand menu" }).waitFor();
  check("f2: the rail choice is remembered after a reload", true);
  await shot(page, "02-rail");
  await axeOf(page, "f2 rail");

  // ---- Frame 3: keyboard focus opens the flyout; not clipped
  await page.keyboard.press("Tab"); // expand button
  await page.keyboard.press("Tab"); // first heading (Today): its flyout opens on focus
  await page.keyboard.press("ArrowDown"); // arrow keys move between rail headings: Loads
  const fly = page.getByRole("link", { name: "Waiting 2" });
  await fly.waitFor({ timeout: 3000 });
  const fb = await fly.boundingBox();
  check("f3: keyboard focus opens a flyout beside the rail, fully on screen", fb.x >= 64 && fb.y > 0 && fb.y + fb.height < 900, JSON.stringify(fb));
  await shot(page, "03-rail-flyout");
  // Radix NavigationMenu's own off-screen focus proxy trips aria-hidden-focus (recorded in known-issues.md).
  await axeOf(page, "f3 flyout", "body", ["aria-hidden-focus"]);
  await page.keyboard.press("Escape");
  check("f3: Esc closes the flyout", (await page.getByRole("link", { name: "Waiting 2" }).count()) === 0);

  // hover (real pointer)
  await page.getByRole("button", { name: "Stock" }).hover();
  await page.getByRole("link", { name: "Bins" }).waitFor({ timeout: 3000 });
  check("f3: hover opens the flyout too", true);
  await page.mouse.move(700, 500);
  await page.getByRole("link", { name: "Bins" }).waitFor({ state: "detached", timeout: 3000 });
  await page.close();

  // ---- Frame 4: user menu
  page = await open(1440, 900, "theme=packhouse");
  await page.getByRole("button", { name: "Ana Silva · Account menu" }).click();
  await page.getByRole("menuitemradio", { name: "PT" }).click();
  check("f4: choosing a language keeps the menu open and shows the new choice", (await page.getByRole("menuitemradio", { name: "PT" }).getAttribute("aria-checked")) === "true");
  await shot(page, "04-user-menu");
  // Radix DropdownMenu hides the page behind it while open, which trips aria-hidden-focus.
  await axeOf(page, "f4 user menu", "body", ["aria-hidden-focus"]);
  await page.keyboard.press("Escape");
  check("f4: Esc closes the menu and focus returns to the name button", await page.evaluate(() => document.activeElement?.getAttribute("aria-label")?.endsWith("Account menu")));
  await page.close();

  // ---- 1920: page area fills the width
  page = await open(1920, 1080, "theme=packhouse");
  const w = await page.evaluate(() => {
    const m = document.querySelector("main");
    const r = m.getBoundingClientRect();
    const c = m.firstElementChild.getBoundingClientRect();
    return { mainLeft: r.left, mainRight: r.right, contentLeft: c.left, contentRight: c.right, menuRight: document.querySelector("aside").getBoundingClientRect().right, vw: innerWidth };
  });
  check("1920: page content spans menu edge + 24px to viewport - 24px (no max-width cap)", Math.abs(w.contentLeft - (w.menuRight + 24)) <= 1 && Math.abs(w.contentRight - (w.vw - 24 - (w.vw - w.mainRight))) <= 16, JSON.stringify(w));
  await page.close();

  // ---- long menu scrolls inside the menu, foot stays
  page = await open(1366, 640, "theme=packhouse&long=1");
  const lm = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const scroller = aside.querySelector(".overflow-y-auto");
    const foot = [...aside.querySelectorAll("a")].find((a) => a.textContent.includes("Help"));
    return { scrolls: scroller.scrollHeight > scroller.clientHeight, footBottom: foot.getBoundingClientRect().bottom, vh: innerHeight };
  });
  check("long menu: scrolls inside the menu while Help stays pinned in view", lm.scrolls && lm.footBottom <= lm.vh, JSON.stringify(lm));
  await page.close();

  // ---- Frames 5-6: 820 wide
  page = await open(820, 1000, "theme=packhouse");
  check("f5: the side menu is hidden under 1024px; the header shows the menu button", (await page.locator("aside").isHidden()) && (await page.getByRole("button", { name: "Open menu" }).isVisible()));
  check("f5: no sideways scroll at 820", await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await shot(page, "05-narrow");
  await page.getByRole("button", { name: "Open menu" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.waitFor();
  await page.waitForTimeout(350);
  check("f6: the slide-out shows the same menu (Loads open, Help at the foot)", (await dlg.getByRole("link", { name: "Waiting 2" }).isVisible()) && (await dlg.getByRole("link", { name: "Help" }).isVisible()));
  await shot(page, "06-slide-out");
  await axeOf(page, "f6 slide-out", "[role=dialog]");
  // focus trapped
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  check("f6: focus stays inside while open", await page.evaluate(() => document.querySelector("[role=dialog]").contains(document.activeElement)));
  await page.keyboard.press("Escape");
  check("f6: Esc closes and focus returns to the menu button", (await page.getByRole("dialog").count()) === 0 && (await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Open menu")));
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(350);
  const hit = await page.evaluate(() => { const e = document.elementFromPoint(800, 500); return e ? `${e.tagName} ${e.className}`.slice(0, 120) : "none"; });
  console.log("scrim hit:", hit);
  await page.mouse.click(800, 500); // the scrim, right of the 240px menu
  await page.getByRole("dialog").waitFor({ state: "detached", timeout: 2000 }).catch(() => undefined);
  check("f6: tapping outside closes it", (await page.getByRole("dialog").count()) === 0);
  await page.close();

  // ---- 390 phone
  page = await open(390, 844, "theme=packhouse");
  check("390: no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await page.close();

  // ---- Frame 7: the DC's yellow, an empty page with EmptyState under a PageHeader
  page = await open(1440, 900, "empty=1");
  check("f7: yellow theme: an empty page keeps its PageHeader and shows the EmptyState", (await page.getByRole("heading", { name: "No loads are waiting" }).isVisible()) && (await page.getByRole("heading", { level: 1 }).count()) === 1);
  await shot(page, "07-dc-yellow-empty");
  await axeOf(page, "f7 yellow");
  await page.close();
} finally {
  await browser.close();
  await server.close();
  rmSync(join(HERE, "public"), { recursive: true, force: true });
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);
