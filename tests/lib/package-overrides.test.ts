import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// CR-DESIGN-SYSTEM-022 (review follow-up to CR-015 F2 and CR-021 F1): a `pnpm.overrides` floor raised
// without a note leaves the next reader unable to tell why it is there. Every floor must be written
// up in a `//overrides*` or `//auditConfig*` note, and no note may name a floor the code has moved past.
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../../package.json"), "utf8").replace(/\r\n/g, "\n"),
) as { pnpm: Record<string, unknown> & { overrides: Record<string, string> } };

const notes = Object.entries(pkg.pnpm)
  .filter(([key]) => key.startsWith("//"))
  .map(([, text]) => String(text))
  .join("\n");

describe("pnpm.overrides", () => {
  it("every floor is written up in a note", () => {
    for (const key of Object.keys(pkg.pnpm.overrides)) {
      const floor = key.split("@<")[1]!;
      expect(notes, `${key} has no note naming ${floor}`).toContain(floor);
    }
  });

  it("the audit-config note no longer names the old sharp floor", () => {
    expect(notes).not.toContain("sharp@<0.35.4");
  });
});
