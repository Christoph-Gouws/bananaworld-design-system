import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";

import { Link, NavigationBusyProvider } from "../../src";
import { resetPending, setPending } from "./fixtures/next-link-mock";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// CR-DESIGN-SYSTEM-022 (review follow-up to CR-DESIGN-SYSTEM-018 F1): the waiting ring must never
// move anything. In a plain inline link it is today's in-flow zero-width mark, byte for byte; in any
// other layout (flex, grid, block, ...) it leaves the flow. Geometry is proven in a real browser
// (runs/change-20/evidence/frames); happy-dom has no layout, so these pin the markup and the choice.

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  resetPending();
  vi.useRealTimers();
});

const mark = () => document.querySelector("[data-link-pending]") as HTMLElement;

function wait(style?: { display: string }) {
  render(
    <NavigationBusyProvider>
      <Link href="/a" style={style}>
        <span>Orders</span>
        <b>12</b>
      </Link>
    </NavigationBusyProvider>,
  );
  act(() => setPending("/a", true));
  act(() => void vi.advanceTimersByTime(160));
}

describe("the waiting ring's place", () => {
  it("a plain inline link keeps today's in-flow mark, attributes and classes unchanged", () => {
    // happy-dom has no UA stylesheet, so an anchor is not "inline" until told; a browser says so itself.
    wait({ display: "inline" });
    const m = mark();
    expect(m.getAttributeNames().sort()).toEqual(["aria-hidden", "class", "data-link-pending"]);
    expect(m.className).toBe("relative inline-block h-0 w-0 align-middle");
    expect(m.style.transform).toBe("");
    expect(m.firstElementChild?.className).toBe(
      "absolute left-1 top-0 -mt-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-fg-subtle motion-reduce:animate-none [[data-surface=tablet]_&]:-mt-2 [[data-surface=tablet]_&]:h-4 [[data-surface=tablet]_&]:w-4",
    );
  });

  it.each(["flex", "inline-flex", "grid", "block", "inline-block"])(
    "a %s link takes the out-of-flow mark and nothing else in the anchor changes",
    (display) => {
      wait({ display });
      const m = mark();
      expect(m.getAttribute("data-link-pending-placement")).toBe("out-of-flow");
      expect(m.className).toContain("absolute");
      expect(m.className).not.toContain("inline-block");
      const anchor = m.parentElement as HTMLElement;
      expect([...anchor.children].map((c) => c.tagName)).toEqual(["SPAN", "B", "SPAN"]);
      expect(anchor.textContent).toBe("Orders12");
    },
  );

  it("the ring goes when the wait ends", () => {
    wait({ display: "flex" });
    act(() => setPending("/a", false));
    expect(mark()).toBeNull();
  });
});
