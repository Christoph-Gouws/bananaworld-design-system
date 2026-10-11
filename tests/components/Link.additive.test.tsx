import { createRef, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { resetPending, setPending } from "./fixtures/next-link-mock";

import { Link, NavigationBusyProvider, SurfaceProvider } from "../../src";
import { FrozenLink } from "./fixtures/Link.frozen-820c980";

vi.mock("next/link", async () => await import("./fixtures/next-link-mock"));

// ============================================================================
// 🔴 CR-DESIGN-SYSTEM-018 IS ADDITIVE, AND THAT IS AN ACCEPTANCE CRITERION
// ============================================================================
// Four apps pin this package by git sha. An app that bumps its pin and does NOT mount a
// NavigationBusyProvider must see every Link render exactly as before. That is asserted by rendering
// a frozen copy of Link.tsx from 820c980 beside the live one over a matrix of caller shapes and
// comparing the markup. A second pass mounts the provider with nothing pending: still identical.

type Shape = {
  name: string;
  props: Record<string, unknown>;
  children?: ReactElement | string;
};

const SHAPES: Shape[] = [
  { name: "plain href", props: { href: "/a" }, children: "A" },
  {
    name: "className",
    props: { href: "/a", className: "font-bold" },
    children: "A",
  },
  {
    name: "prefetch true",
    props: { href: "/a", prefetch: true },
    children: "A",
  },
  {
    name: "prefetch false",
    props: { href: "/a", prefetch: false },
    children: "A",
  },
  {
    name: "replace + scroll",
    props: { href: "/a", replace: true, scroll: false },
    children: "A",
  },
  {
    name: "target + aria",
    props: { href: "/a", target: "_blank", "aria-label": "Go" },
    children: "A",
  },
  { name: "element child", props: { href: "/a" }, children: <b>bold</b> },
  {
    name: "nested children",
    props: { href: "/a" },
    children: (
      <span>
        <i>x</i> y
      </span>
    ),
  },
  {
    name: "legacyBehavior",
    props: { href: "/a", legacyBehavior: true },
    children: <a>A</a>,
  },
];

function markup(el: ReactElement): string {
  const { container } = render(el);
  const html = container.innerHTML;
  cleanup();
  return html;
}

afterEach(cleanup);

describe.each(["browser", "tablet"] as const)("surface %s", (surface) => {
  for (const shape of SHAPES) {
    const withSurface = (node: ReactElement) => (
      <SurfaceProvider surface={surface}>{node}</SurfaceProvider>
    );
    const frozen = () =>
      withSurface(<FrozenLink {...(shape.props as { href: string })}>{shape.children}</FrozenLink>);
    const live = () =>
      withSurface(<Link {...(shape.props as { href: string })}>{shape.children}</Link>);

    it(`${shape.name}: no provider renders the same markup as 820c980`, () => {
      expect(markup(live())).toBe(markup(frozen()));
    });

    it(`${shape.name}: inside a provider, at rest, renders the same markup`, () => {
      expect(markup(<NavigationBusyProvider>{live()}</NavigationBusyProvider>)).toBe(
        markup(frozen()),
      );
    });
  }
});

describe("the ref and the new prop", () => {
  it("still forwards a ref to the anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link href="/a" ref={ref}>
        A
      </Link>,
    );
    expect(ref.current?.tagName).toBe("A");
  });

  it("a pending navigation without a provider draws no spinner", () => {
    vi.useFakeTimers();
    try {
      render(<Link href="/a">A</Link>);
      act(() => setPending("/a", true));
      act(() => void vi.advanceTimersByTime(1000));
      expect(document.querySelector("[data-link-pending]")).toBeNull();
      expect(document.querySelector("a")?.innerHTML).toBe("A");
    } finally {
      act(() => resetPending());
      vi.useRealTimers();
    }
  });

  it("pendingIndicator never reaches the DOM without a provider", () => {
    const { container } = render(
      <Link href="/a" pendingIndicator={false}>
        A
      </Link>,
    );
    expect(container.innerHTML).toBe(markup(<FrozenLink href="/a">A</FrozenLink>));
  });
});
