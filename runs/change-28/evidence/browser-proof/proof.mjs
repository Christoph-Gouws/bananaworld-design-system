// CR-DESIGN-SYSTEM-030 — drive the REAL PrintPreviewPanel (inside a real Sheet and SlideOver) in a REAL browser
// (Edge). Same method as CR-029: Tailwind and playwright-core are loaded READ-ONLY from bananaworld-dc.
// Usage (package root):  node runs/change-28/evidence/browser-proof/proof.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const HERE = join(ROOT, "runs/change-28/evidence/browser-proof");
const OUT = join(HERE, ".out");
const FRAMES = join(ROOT, "runs/change-28/evidence/frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const TW_CLI = join(DC, "node_modules/.pnpm/tailwindcss@3.4.19_yaml@2.9.0/node_modules/tailwindcss/lib/cli.js");
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const VITE = join(ROOT, "node_modules/.pnpm/vite@8.1.5_@types+node@26.1.1/node_modules/vite/dist/node/index.js");
const AXE = join(ROOT, "node_modules/axe-core/axe.min.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(FRAMES, { recursive: true });

writeFileSync(
  join(OUT, "input.css"),
  `${readFileSync(join(ROOT, "src/lib/tokens.css"), "utf8")}\n${readFileSync(join(ROOT, "src/lib/themes/packhouse.css"), "utf8")}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);
execFileSync(process.execPath, [TW_CLI, "-c", join(HERE, "tailwind.config.cjs"), "-i", join(OUT, "input.css"), "-o", join(OUT, "proof.css")], { stdio: "pipe" });

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
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  — ${detail}`}`);
  if (!ok) failures.push(name);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });

/** A fresh context per scenario so every new page or popup is counted. */
async function open(w, h, q, { viewer = true } = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const pages = [];
  context.on("page", (p) => pages.push(p));
  await context.addInitScript((hasViewer) => {
    window.__opened = 0;
    const real = window.open;
    window.open = (...a) => { window.__opened++; return real ? null : null; };
    // Count window.print() in every frame (the preview frame's own window) — reported to the top page.
    window.print = () => { window.top.__prints = (window.top.__prints || 0) + 1; };
    if (!hasViewer) Object.defineProperty(navigator, "pdfViewerEnabled", { value: false, configurable: true });
  }, viewer);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:5198/?${new URLSearchParams(q)}`);
  await page.getByRole("button", { name: /Imprimir/ }).waitFor();
  return { context, page, pages, errors };
}
const ready = (page) => page.locator("iframe").waitFor();
const frameSrc = (page) => page.locator("iframe").getAttribute("src");
const calls = (page) => page.evaluate(() => window.__calls);
// window.open calls plus extra pages still open after a moment. Chromium briefly creates (and closes) a
// transient page for a download; that is not a tab the person can see, so only a surviving page counts.
const opened = async (s) => {
  await s.page.waitForTimeout(500);
  // Edge's own downloads panel (edge://downloads-hub/) is browser chrome, not a page the app opened.
  const surviving = s.context.pages().filter((p) => p !== s.page && !p.isClosed() && !p.url().startsWith("edge://")).length;
  const spy = await s.page.evaluate(() => window.__opened);
  if (surviving + spy > 0) console.log("   opened detail", { surviving, spy, urls: s.context.pages().map((p) => p.url()) });
  return surviving + spy;
};
const shot = (page, name) => page.screenshot({ path: join(FRAMES, name) });

try {
  const sizes = [[360, 640], [390, 844], [768, 1024], [1440, 900]];
  for (const [w, h] of sizes) {
    for (const [host, surface, theme] of [["sheet", "tablet", "teal"], ["slideover", "browser", "yellow"], ["slideover", "tablet", "teal"]]) {
      const tag = `${w}x${h}/${host}/${surface}/${theme}`;
      const s = await open(w, h, { host, surface, theme, kind: "html" });
      await ready(s.page);
      await s.page.addScriptTag({ path: AXE });
      const m = await s.page.evaluate(() => {
        const dlg = document.querySelector("[role=dialog]").getBoundingClientRect();
        const root = document.querySelector("iframe").closest("div").parentElement.getBoundingClientRect();
        const btns = [...document.querySelectorAll("button")].filter((b) => /Imprimir|Descarregar/.test(b.textContent)).map((b) => b.getBoundingClientRect());
        const f = document.querySelector("iframe").getBoundingClientRect();
        return {
          scrollOk: document.documentElement.scrollWidth === innerWidth,
          rootInside: root.left >= dlg.left - 1 && root.right <= dlg.right + 1,
          frameInside: f.left >= root.left - 1 && f.right <= root.right + 1,
          btnsInView: btns.length === 2 && btns.every((r) => r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth),
          minBtnH: Math.min(...btns.map((r) => r.height)),
          bottom: Math.round(Math.max(...btns.map((r) => r.bottom))),
        };
      });
      check(`${tag}: no sideways scroll; panel and preview inside the host`, m.scrollOk && m.rootInside && m.frameInside, JSON.stringify(m));
      check(`${tag}: Download and Print both in view (bottom ${m.bottom} of ${h})`, m.btnsInView, JSON.stringify(m));
      check(`${tag}: buttons at least ${surface === "tablet" ? 56 : 36}px tall`, m.minBtnH >= (surface === "tablet" ? 56 : 36) - 0.5, JSON.stringify(m));
      const ax = await s.page.evaluate(async () => (await window.axe.run(document.querySelector("[role=dialog]"), { iframes: false })).violations.map((x) => `${x.id}:${x.nodes.length}`));
      check(`${tag}: axe 0 violations (incl. contrast)`, ax.length === 0, ax.join(","));
      if (host === "sheet" || surface === "tablet") await shot(s.page, `${host}-${w}-${theme}.png`);
      await s.context.close();
    }
  }

  // Flows at a phone width, in the packhouse look on the tablet surface.
  const Q = { host: "sheet", surface: "tablet", theme: "teal" };

  {
    const s = await open(390, 844, { ...Q, kind: "html" });
    await ready(s.page);
    const first = await frameSrc(s.page);
    const hist = await s.page.evaluate(() => history.length);
    await s.page.getByRole("button", { name: /Imprimir/ }).click();
    await s.page.waitForFunction((was) => document.querySelector("iframe")?.getAttribute("src") !== was, first);
    await s.page.waitForFunction(() => window.__prints === 1);
    await s.page.waitForTimeout(400);
    const c = await calls(s.page);
    check("Print: print() once, load once, download never", c.filter((x) => x === "print").length === 1 && c.filter((x) => x === "load").length === 1 && !c.includes("download"), JSON.stringify(c));
    check("Print: the frame printed exactly once and no window or tab opened", (await s.page.evaluate(() => window.__prints)) === 1 && (await opened(s)) === 0, String(await opened(s)));
    check("Print: no history entry added (Back leaves the screen in one step)", (await s.page.evaluate(() => history.length)) === hist, String(hist));
    check("Print: focus returned to Print so Escape reaches the host", await s.page.evaluate(() => /Imprimir/.test(document.activeElement?.textContent ?? "")));
    await shot(s.page, "print-after-390-teal.png");
    await s.page.keyboard.press("Escape");
    await s.page.locator("[role=dialog]").waitFor({ state: "detached", timeout: 3000 }).then(() => check("Escape closes the host after a Print", true), () => check("Escape closes the host after a Print", false, "dialog still open"));
    check("Print: no page error", s.errors.length === 0, s.errors.join("|"));
    await s.context.close();
  }

  {
    const s = await open(390, 844, { ...Q, kind: "html", refuse: "1" });
    await ready(s.page);
    const first = await frameSrc(s.page);
    await s.page.getByRole("button", { name: /Imprimir/ }).click();
    await s.page.waitForTimeout(600);
    check("Refused Print (null): frame unchanged, nothing printed, no window, no message, buttons back", (await frameSrc(s.page)) === first && (await s.page.evaluate(() => window.__prints ?? 0)) === 0 && (await opened(s)) === 0 && (await s.page.getByRole("alert").count()) === 0 && (await s.page.getByRole("button", { name: /Imprimir/ }).isEnabled()), "");
    await s.context.close();
  }

  {
    const s = await open(390, 844, { ...Q, kind: "pdf" });
    await ready(s.page);
    const [dl] = await Promise.all([s.page.waitForEvent("download"), s.page.getByRole("button", { name: /Descarregar/ }).click()]);
    check("Download: the saved file has the suggested name", dl.suggestedFilename() === "nota-de-entrega-0042.pdf", dl.suggestedFilename());
    check("Download: no window or tab opened; download() once", (await opened(s)) === 0 && (await calls(s.page)).filter((x) => x === "download").length === 1, "");
    await s.context.close();
  }

  {
    const s = await open(390, 844, { ...Q, kind: "pdf" }, { viewer: false });
    await s.page.getByText(/não mostra PDF/).waitFor();
    const [dl] = await Promise.all([s.page.waitForEvent("download"), s.page.getByRole("button", { name: /Imprimir/ }).click()]);
    const c = await calls(s.page);
    check("No viewer: message shown, no preview frame, load never called", (await s.page.locator("iframe").count()) === 0 && !c.includes("load"), JSON.stringify(c));
    const o = await opened(s);
    check("No viewer: Print acts as Download (print() called, file saved by name, no window)", c.includes("print") && !c.includes("download") && dl.suggestedFilename() === "nota-de-entrega-0042.pdf" && o === 0, JSON.stringify({ c, name: dl.suggestedFilename(), o }));
    await shot(s.page, "no-viewer-390-teal.png");
    await s.context.close();
  }

  {
    const s = await open(1440, 900, { host: "slideover", surface: "browser", theme: "yellow", kind: "pdf" });
    await ready(s.page);
    await s.page.getByRole("button", { name: /Imprimir/ }).click();
    await s.page.waitForTimeout(1500);
    check("Real PDF blob: Print throws nothing, opens no window, frame still there (the dialog itself is the manual check)", s.errors.length === 0 && (await opened(s)) === 0 && (await s.page.locator("iframe").count()) === 1, s.errors.join("|"));
    await shot(s.page, "slideover-pdf-1440-yellow.png");
    await s.context.close();
  }
} finally {
  await browser.close();
  await server.close();
  rmSync(OUT, { recursive: true, force: true });
}
console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILED: ${failures.join(" | ")}`);
process.exit(failures.length === 0 ? 0 : 1);
