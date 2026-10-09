// CR-DESIGN-SYSTEM-015 — guard for the opt-in packhouse theme (packhouse DLC-DEC-054, option B).
// The theme may override the five accent tokens and NOTHING else, and tokens.css must not change
// (a token change needs the full DC + CRM re-check, QG-CEN-003). Files are read from disk, CRLF
// normalised to LF, and comments stripped before parsing (the trap tokens.css documents).
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const read = (rel: string) =>
  readFileSync(resolve(root, rel), "utf8").replace(/\r\n/g, "\n");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// SHA-256 of tokens.css (LF) at main@cde6f4e. Editing tokens.css must update this AND re-run QG-CEN-003.
const TOKENS_SHA256 =
  "e641cb32a15f0e94cd400496a6441568f1289726b7fdd3c48cb133520803ea17";

const FIVE: Record<string, string> = {
  "--color-accent": "#0f766e",
  "--color-accent-hover": "#0b5f58",
  "--color-accent-subtle": "#d5f3ef",
  "--color-fg-on-accent": "#ffffff",
  "--color-ring": "#0f766e",
};

const SELECTORS = [
  ':root[data-theme="packhouse"]',
  '[data-theme="packhouse"]',
  '[data-theme="packhouse"][data-surface]',
  '[data-theme="packhouse"] [data-surface]',
];

const declarations = (body: string) =>
  [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
    (m) => [m[1]!, m[2]!.trim().toLowerCase()] as const,
  );

const theme = stripComments(read("src/lib/themes/packhouse.css"));
const tokens = stripComments(read("src/lib/tokens.css"));
const pkg = JSON.parse(read("package.json"));

describe("packhouse theme file", () => {
  const decls = declarations(theme);

  it("declares exactly the five accent tokens, each once, with the DLC-DEC-054 values", () => {
    expect(decls).toHaveLength(5); // non-vacuity: a parser that finds nothing must fail
    expect(Object.fromEntries(decls)).toEqual(FIVE);
  });

  it("holds no property outside the allow-list (names the offender)", () => {
    const stray = decls.map(([p]) => p).filter((p) => !(p in FIVE));
    expect(stray).toEqual([]);
  });

  it("is one rule with the exact selector list, and no at-rules", () => {
    expect(theme.match(/\{/g)).toHaveLength(1);
    expect(theme).not.toMatch(/@/);
    const selectors = theme
      .slice(0, theme.indexOf("{"))
      .split(",")
      .map((s) => s.trim());
    expect(selectors).toEqual(SELECTORS);
  });

  it("only overrides tokens that already exist in tokens.css :root", () => {
    const rootBlock = tokens.slice(
      tokens.indexOf("{") + 1,
      tokens.indexOf("\n}"),
    );
    const rootProps = declarations(rootBlock).map(([p]) => p);
    expect(rootProps.length).toBeGreaterThanOrEqual(40);
    for (const p of Object.keys(FIVE)) expect(rootProps).toContain(p);
  });
});

describe("tokens.css and the export surface", () => {
  it("tokens.css is unchanged from main@cde6f4e", () => {
    const hash = createHash("sha256")
      .update(read("src/lib/tokens.css"))
      .digest("hex");
    expect(hash).toBe(TOKENS_SHA256);
  });

  it("exports the theme, and the four pre-existing entries are unchanged", () => {
    const target = pkg.exports["./themes/packhouse.css"];
    expect(target).toBe("./src/lib/themes/packhouse.css");
    expect(existsSync(resolve(root, target))).toBe(true);
    expect(pkg.exports["."]).toEqual({
      types: "./src/index.ts",
      default: "./src/index.ts",
    });
    expect(pkg.exports["./pricing"]).toEqual({
      types: "./src/pricing/index.ts",
      default: "./src/pricing/index.ts",
    });
    expect(pkg.exports["./sales-order"]).toEqual({
      types: "./src/sales-order/index.ts",
      default: "./src/sales-order/index.ts",
    });
    expect(pkg.exports["./tokens.css"]).toBe("./src/lib/tokens.css");
  });
});
