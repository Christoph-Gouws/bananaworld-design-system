import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../../src/components/Button";

// CR-DESIGN-SYSTEM-019 — `disabled={disabled ?? inflight}` let a caller's `disabled={false}` (a form that
// is valid) win over `inflight`, so a busy button still took a second tap and the purchase posted twice.

afterEach(cleanup);

describe("Button — an in-flight button is never clickable", () => {
  it("disabled={false} inflight renders a disabled, busy button", () => {
    render(
      <Button disabled={false} inflight>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("data-inflight")).toBe(true);
  });

  it("a click while in flight does not call onClick (user click and raw click)", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled={false} inflight onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.setup().click(button);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("after the answer arrives the button works again, once per press", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled={false} inflight onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    rerender(
      <Button disabled={false} inflight={false} onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a submit button with disabled={false} inflight submits nothing", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled={false} inflight>
          Buy
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    // [disabled, inflight, expected disabled]
    [undefined, undefined, false],
    [undefined, false, false],
    [undefined, true, true],
    [true, undefined, true],
    [true, false, true],
    [true, true, true],
    [false, undefined, false],
    [false, false, false],
    [false, true, true],
  ] as const)("disabled=%s inflight=%s → disabled %s", (disabled, inflight, expected) => {
    render(
      <Button disabled={disabled} inflight={inflight}>
        Go
      </Button>,
    );
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(expected);
  });

  it("an idle enabled button still calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
