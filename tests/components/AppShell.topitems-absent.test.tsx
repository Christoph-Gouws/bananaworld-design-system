import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { FROZEN_F5EC58C } from "./fixtures/app-shell-034-frozen";
import { renderState, type FrozenState } from "./fixtures/app-shell-034-render";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// CR-DESIGN-SYSTEM-034 — the additive proof: a caller that passes no topItems (or none that show)
// renders the HTML captured at f5ec58c, byte for byte (React ids numbered in order of appearance).

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const STATES: FrozenState[] = ["open", "rail", "slideout", "ssr"];
const HIDDEN = { id: "d", label: "Dashboard", href: "/dashboard", icon: null, hidden: true };

describe("topItems absent renders the frozen f5ec58c HTML", () => {
  for (const state of STATES) {
    for (const [name, over] of [
      ["undefined", {}],
      ["[]", { topItems: [] }],
      ["only hidden", { topItems: [HIDDEN] }],
    ] as const) {
      it(`${state}: topItems ${name}`, async () => {
        expect(await renderState(state, over)).toBe(FROZEN_F5EC58C[state]);
      });
    }
  }
});
