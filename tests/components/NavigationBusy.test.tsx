import { StrictMode, type ReactElement } from "react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

import {
  Link,
  NavigationBusyBar,
  NavigationBusyProvider,
  SurfaceProvider,
  useNavigationBusy,
} from "../../src";
import { resetPending, setPending } from "./fixtures/next-link-mock";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// CR-DESIGN-SYSTEM-018 — the navigation busy signal. `next/link` is replaced by a stand-in whose
// per-link pending status is driven by setPending(), so the delay, the count and the bar are all
// exercised without a router.

function BusyProbe() {
  return <output data-testid="busy">{String(useNavigationBusy())}</output>;
}

function shell(links: ReactElement): ReactElement {
  return (
    <NavigationBusyProvider>
      <nav>{links}</nav>
      <NavigationBusyBar />
      <BusyProbe />
    </NavigationBusyProvider>
  );
}

const bar = () => document.querySelector("[data-navigation-busy-bar] > div") as HTMLElement;
const spinner = () => document.querySelector("[data-link-pending]");
const settle = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  resetPending();
  vi.useRealTimers();
});

describe("the busy delay", () => {
  it("shows nothing for a navigation that lands in under 150 ms", () => {
    render(shell(<Link href="/a">A</Link>));
    act(() => setPending("/a", true));
    settle(100);
    expect(bar().getAttribute("role")).toBeNull();
    expect(spinner()).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
    act(() => setPending("/a", false));
    settle(500);
    expect(bar().getAttribute("role")).toBeNull();
    expect(spinner()).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
  });

  it("shows the bar and the spinner once 150 ms have passed, then finishes and goes idle", () => {
    render(shell(<Link href="/a">A</Link>));
    act(() => setPending("/a", true));
    settle(160);
    expect(bar().getAttribute("role")).toBe("progressbar");
    expect(bar().getAttribute("aria-label")).toBe("Loading page");
    expect(bar().getAttribute("aria-busy")).toBe("true");
    expect(bar().getAttribute("aria-valuenow")).toBeNull();
    const mark = spinner() as HTMLElement;
    expect(mark.closest("a")?.getAttribute("href")).toBe("/a");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByTestId("busy").textContent).toBe("true");

    act(() => setPending("/a", false));
    expect(bar().getAttribute("role")).toBeNull();
    expect(bar().className).toContain("scale-x-100");
    expect(spinner()).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
    settle(300);
    expect(bar().className).toContain("scale-x-0");
    expect(bar().getAttribute("aria-hidden")).toBe("true");
  });
});

describe("the link spinner", () => {
  it("pendingIndicator={false} hides the spinner but the bar still shows", () => {
    render(
      shell(
        <Link href="/a" pendingIndicator={false}>
          A
        </Link>,
      ),
    );
    act(() => setPending("/a", true));
    settle(160);
    expect(spinner()).toBeNull();
    expect(bar().getAttribute("role")).toBe("progressbar");
  });

  it("does not leak pendingIndicator onto the anchor", () => {
    render(
      shell(
        <Link href="/a" pendingIndicator={false}>
          A
        </Link>,
      ),
    );
    expect(document.querySelector("a")?.hasAttribute("pendingindicator")).toBe(false);
    expect(document.querySelector("a")?.hasAttribute("pendingIndicator")).toBe(false);
  });
});

describe("the pending count", () => {
  it("stays busy until every pending link settles", () => {
    render(
      shell(
        <>
          <Link href="/a">A</Link>
          <Link href="/b">B</Link>
        </>,
      ),
    );
    act(() => {
      setPending("/a", true);
      setPending("/b", true);
    });
    settle(160);
    act(() => setPending("/a", false));
    expect(bar().getAttribute("role")).toBe("progressbar");
    act(() => setPending("/b", false));
    expect(bar().getAttribute("role")).toBeNull();
  });

  it("a pending link that unmounts (the old page going away) releases the bar", () => {
    function Page({ show }: { show: boolean }) {
      return shell(show ? <Link href="/a">A</Link> : <span />);
    }
    const { rerender } = render(<Page show />);
    act(() => setPending("/a", true));
    settle(160);
    expect(bar().getAttribute("role")).toBe("progressbar");
    rerender(<Page show={false} />);
    expect(bar().getAttribute("role")).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
  });

  it("balances under StrictMode double effects", () => {
    render(<StrictMode>{shell(<Link href="/a">A</Link>)}</StrictMode>);
    act(() => setPending("/a", true));
    settle(160);
    expect(bar().getAttribute("role")).toBe("progressbar");
    act(() => setPending("/a", false));
    expect(bar().getAttribute("role")).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
  });
});

describe("surfaces and motion", () => {
  it("legacyBehavior inside a provider keeps its single child and shows no spinner", () => {
    render(
      shell(
        <Link href="/a" legacyBehavior>
          <a data-legacy="">A</a>
        </Link>,
      ),
    );
    act(() => setPending("/a", true));
    settle(160);
    expect(document.querySelector("[data-legacy]")).not.toBeNull();
    expect(spinner()).toBeNull();
  });

  it("tablet keeps prefetch off and carries the larger sizes", () => {
    render(<SurfaceProvider surface="tablet">{shell(<Link href="/a">A</Link>)}</SurfaceProvider>);
    expect(document.querySelector("a")?.getAttribute("data-prefetch")).toBe("false");
    act(() => setPending("/a", true));
    settle(160);
    expect(bar().className).toContain("[[data-surface=tablet]_&]:h-1");
    expect(spinner()?.firstElementChild?.className).toContain("[[data-surface=tablet]_&]:h-4");
  });

  it("the bar and the spinner both respect reduced motion", () => {
    render(shell(<Link href="/a">A</Link>));
    act(() => setPending("/a", true));
    settle(160);
    expect(bar().className).toContain("motion-reduce:scale-x-100");
    expect(bar().className).toContain("motion-reduce:transition-none");
    expect(spinner()?.firstElementChild?.className).toContain("motion-reduce:animate-none");
  });

  it("the bar's wrapper has zero height, so it never shifts layout", () => {
    render(shell(<Link href="/a">A</Link>));
    expect(document.querySelector("[data-navigation-busy-bar]")?.className).toContain("h-0");
  });
});

describe("outside a provider", () => {
  it("the bar renders idle and the hook reads false, without throwing", () => {
    render(
      <>
        <NavigationBusyBar />
        <BusyProbe />
      </>,
    );
    expect(bar().getAttribute("role")).toBeNull();
    expect(screen.getByTestId("busy").textContent).toBe("false");
  });
});

describe("no useLinkStatus (next older than 15.3)", () => {
  it("never throws and is never busy", async () => {
    vi.resetModules();
    vi.doMock("next/link", async () => {
      const mod = await import("./fixtures/next-link-mock");
      return { default: mod.default };
    });
    const kit = await import("../../src");
    render(
      <kit.NavigationBusyProvider>
        <kit.Link href="/a">A</kit.Link>
        <kit.NavigationBusyBar />
      </kit.NavigationBusyProvider>,
    );
    const mock = await import("./fixtures/next-link-mock");
    act(() => mock.setPending("/a", true));
    settle(500);
    expect(bar().getAttribute("role")).toBeNull();
    expect(spinner()).toBeNull();
    vi.doUnmock("next/link");
  });
});

describe("the fault being removed must not come back", () => {
  it("neither source file uses Suspense or useSearchParams", () => {
    for (const file of ["NavigationBusy.tsx", "Link.tsx"]) {
      const code = readFileSync(`src/components/${file}`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      expect(code).not.toMatch(/Suspense|useSearchParams/);
    }
  });
});
