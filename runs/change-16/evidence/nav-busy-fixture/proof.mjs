// CR-DESIGN-SYSTEM-018 — real-browser proof of the navigation busy signal.
// Starts the BUILT fixture (next start), drives it in Edge through bananaworld-dc's playwright-core
// (READ-ONLY use of that node_modules), and writes frames to ../frames/.
// Usage (this folder, after `next build`):  node proof.mjs
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const HERE = process.cwd();
const FRAMES = resolve(HERE, "../frames");
const DC = process.env.DC_ROOT ?? "d:/Projects/Team Builder/teams/AI Dev Team 6/projects/bananaworld-dc";
const PW = join(DC, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");
const NEXT = resolve(HERE, "../../../../node_modules/next/dist/bin/next");
const PORT = 3123;
const BASE = `http://localhost:${PORT}`;
mkdirSync(FRAMES, { recursive: true });

const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  ${detail}`}`);
  if (!ok) failures.push(name);
};

const server = spawn(process.execPath, [NEXT, "start", "-p", String(PORT)], { cwd: HERE, stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch (error) {
    // QUALITY-JUSTIFY CE-06 — the server is still starting; the poll loop retries and fails below.
    void error;
  }
  await sleep(500);
}

const { chromium } = createRequire(join(PW, "package.json"))(PW);
const browser = await chromium.launch({ channel: "msedge" });
const BAR = "[data-navigation-busy-bar] > div";
const roleOf = (p) => p.$eval(BAR, (e) => e.getAttribute("role"));
const rectOf = (p) => p.$eval("#title", (e) => JSON.stringify(e.getBoundingClientRect()));

async function openAt(viewport, { tablet = false, reducedMotion = "no-preference" } = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion });
  const page = await ctx.newPage();
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(tablet ? `${BASE}/?tablet` : `${BASE}/`);
  await page.waitForSelector("#title");
  if (tablet) await page.evaluate(() => document.body.setAttribute("data-surface", "tablet"));
  await sleep(1200); // let any viewport prefetch settle
  return { ctx, page, requests };
}

try {
  // ---- Desktop -------------------------------------------------------------------------------
  {
    const { ctx, page } = await openAt({ width: 1280, height: 800 });
    check("desktop: idle bar has no role", (await roleOf(page)) === null);
    await page.screenshot({ path: join(FRAMES, "01-desktop-idle.png") });
    const idleRect = await rectOf(page);

    await page.click("text=Slow page (1.5 s)");
    await sleep(500); // past the 150 ms delay, before the 1.5 s server answer
    check("desktop: bar is a progressbar while pending", (await roleOf(page)) === "progressbar");
    check("desktop: bar named", (await page.$eval(BAR, (e) => e.getAttribute("aria-label"))) === "Loading page");
    check("desktop: main is aria-busy", (await page.$eval("main", (e) => e.getAttribute("aria-busy"))) === "true");
    check("desktop: bar is the house yellow", (await page.$eval(BAR, (e) => getComputedStyle(e).backgroundColor)) === "rgb(250, 200, 10)");
    check("desktop: spinner sits inside the clicked link", await page.$eval("a[href='/slow'] [data-link-pending]", () => true).catch(() => false));
    check("desktop: other links show no spinner", (await page.$$("[data-link-pending]")).length === 1);
    check("desktop: old page still on screen", (await page.textContent("#title")) === "Home");
    check("desktop: no layout shift while pending", (await rectOf(page)) === idleRect, `${idleRect} vs ${await rectOf(page)}`);
    check("desktop: bar wrapper takes no height", (await page.$eval("[data-navigation-busy-bar]", (e) => e.getBoundingClientRect().height)) === 0);
    await page.screenshot({ path: join(FRAMES, "02-desktop-pending.png") });

    await page.waitForFunction(() => document.querySelector("#title")?.textContent === "Slow page", null, { timeout: 8000 });
    await sleep(600);
    check("desktop: bar clears after the page lands", (await roleOf(page)) === null);
    check("desktop: spinner gone after landing", (await page.$$("[data-link-pending]")).length === 0);
    check("desktop: main no longer busy", (await page.$eval("main", (e) => e.getAttribute("aria-busy"))) === "false");
    await page.screenshot({ path: join(FRAMES, "03-desktop-landed.png") });

    // opt-out link: bar yes, spinner no
    await page.click("text=Home");
    await page.waitForFunction(() => document.querySelector("#title")?.textContent === "Home");
    await sleep(300);
    await page.click("text=Slow, no spinner");
    await sleep(500);
    check("opt-out: bar still shows", (await roleOf(page)) === "progressbar");
    check("opt-out: no spinner on that link", (await page.$$("[data-link-pending]")).length === 0);
    await page.screenshot({ path: join(FRAMES, "04-desktop-optout-pending.png") });
    await page.waitForFunction(() => document.querySelector("#title")?.textContent === "Slow page", null, { timeout: 8000 });
    await ctx.close();
  }

  // ---- Tablet --------------------------------------------------------------------------------
  {
    const desktop = await openAt({ width: 1280, height: 800 });
    const prefetchedOnDesktop = desktop.requests.filter((u) => u.includes("_rsc") && !u.endsWith("/?_rsc")).length;
    await desktop.ctx.close();

    const { ctx, page, requests } = await openAt({ width: 820, height: 1180 }, { tablet: true });
    const before = requests.filter((u) => u.includes("_rsc")).length;
    check("tablet: no RSC/prefetch request before any click", before === 0, `${before} requests (desktop made ${prefetchedOnDesktop})`);
    await page.screenshot({ path: join(FRAMES, "05-tablet-idle.png") });
    const idleRect = await rectOf(page);
    await page.click("text=Slow page (1.5 s)");
    await sleep(500);
    check("tablet: bar is a progressbar while pending", (await roleOf(page)) === "progressbar");
    check("tablet: bar is the larger 4px strip", (await page.$eval(BAR, (e) => getComputedStyle(e).height)) === "4px");
    check("tablet: spinner is the larger 16px ring", (await page.$eval("[data-link-pending] > span", (e) => getComputedStyle(e).width)) === "16px");
    check("tablet: no layout shift while pending", (await rectOf(page)) === idleRect);
    await page.screenshot({ path: join(FRAMES, "06-tablet-pending.png") });
    await page.waitForFunction(() => document.querySelector("#title")?.textContent === "Slow page", null, { timeout: 8000 });
    await sleep(600);
    check("tablet: bar clears after landing", (await roleOf(page)) === null);
    await page.screenshot({ path: join(FRAMES, "07-tablet-landed.png") });
    await ctx.close();
  }

  // ---- Reduced motion ------------------------------------------------------------------------
  {
    const { ctx, page } = await openAt({ width: 1280, height: 800 }, { reducedMotion: "reduce" });
    await page.click("text=Slow page (1.5 s)");
    await sleep(500);
    check("reduced motion: bar is a still full-width line", (await page.$eval(BAR, (e) => {
      const cs = getComputedStyle(e);
      return cs.transform === "none" || cs.transform === "matrix(1, 0, 0, 1, 0, 0)";
    })));
    check("reduced motion: bar has no transition", (await page.$eval(BAR, (e) => getComputedStyle(e).transitionProperty)) === "none");
    check("reduced motion: spinner does not spin", (await page.$eval("[data-link-pending] > span", (e) => getComputedStyle(e).animationName)) === "none");
    await page.screenshot({ path: join(FRAMES, "08-desktop-reduced-motion-pending.png") });
    await page.waitForFunction(() => document.querySelector("#title")?.textContent === "Slow page", null, { timeout: 8000 });
    await ctx.close();
  }

  // ---- Server action with revalidatePath, no loading.tsx -------------------------------------
  {
    const { ctx, page } = await openAt({ width: 1280, height: 800 });
    await page.click("text=Action page");
    await page.waitForSelector("#save");
    let stuck = 0;
    const N = 64;
    for (let i = 1; i <= N; i++) {
      await page.click("#save");
      try {
        await page.waitForFunction((n) => document.querySelector("#saves")?.textContent === `Saved ${n} times` && document.querySelector("#save")?.textContent === "Save", i, { timeout: 5000 });
      } catch {
        stuck++;
      }
    }
    check(`server action: ${N}/${N} submissions return from "Working..."`, stuck === 0, `${stuck} stuck`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
process.exit(failures.length ? 1 : 0);
