import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";

import { Keypad } from "../../src";
import {
  pressKeypadKey,
  resolveMaxDigits,
  type KeypadKey,
} from "../../src/components/keypad-entry";

// CR-DESIGN-SYSTEM-021 — the tablet number pad.

afterEach(cleanup);

describe("pressKeypadKey (digit rules)", () => {
  const rows: Array<[string, string, KeypadKey, number, string]> = [
    ["first digit", "", "5", 4, "5"],
    ["append", "12", "3", 4, "123"],
    ["zero on empty", "", "0", 4, "0"],
    ["zero then zero stays zero", "0", "0", 4, "0"],
    ["leading zero dropped", "0", "5", 4, "5"],
    ["max digits reached: unchanged", "9999", "1", 4, "9999"],
    ["max digits 2", "12", "3", 2, "12"],
    ["max digits 2, room left", "1", "2", 2, "12"],
    ["backspace", "123", "backspace", 4, "12"],
    ["backspace to empty", "5", "backspace", 4, ""],
    ["backspace on empty", "", "backspace", 4, ""],
    ["clear", "123", "clear", 4, ""],
    ["clear on empty", "", "clear", 4, ""],
  ];
  it.each(rows)("%s", (_n, value, key, max, expected) => {
    expect(pressKeypadKey(value, key, max)).toBe(expected);
  });

  it.each([
    [undefined, 4],
    [0, 4],
    [-1, 4],
    [2.5, 4],
    [Number.NaN, 4],
    [2, 2],
    [6, 6],
  ])("resolveMaxDigits(%s) = %s", (input, expected) => {
    expect(resolveMaxDigits(input)).toBe(expected);
  });
});

describe("Keypad component", () => {
  it("renders twelve buttons with the right names, all type=button", () => {
    render(<Keypad value="" onChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(12);
    for (const b of buttons) expect(b.getAttribute("type")).toBe("button");
    for (const n of [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "Clear",
      "Delete last digit",
    ]) {
      expect(screen.getByRole("button", { name: n })).toBeTruthy();
    }
  });

  it("calls onChange with the next value on each tap", async () => {
    const onChange = vi.fn();
    render(<Keypad value="12" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenLastCalledWith("123");
    await userEvent.click(screen.getByRole("button", { name: "Delete last digit" }));
    expect(onChange).toHaveBeenLastCalledWith("1");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("makes no call at max, on backspace when empty, or on clear when empty", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Keypad value="9999" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    rerender(<Keypad value="" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete last digit" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("honours maxDigits and drops a leading zero when driven by a parent", async () => {
    function Host() {
      const [v, setV] = useState("");
      return <Keypad value={v} onChange={setV} maxDigits={2} />;
    }
    render(<Host />);
    for (const k of ["0", "5", "7", "9"])
      await userEvent.click(screen.getByRole("button", { name: k }));
    expect(screen.getByRole("group").querySelector("output")?.textContent).toBe("57");
  });

  it("words override the three built-in words", () => {
    render(
      <Keypad
        value=""
        onChange={() => {}}
        words={{ clear: "Limpar", deleteLastDigit: "Apagar", empty: "vazio" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Limpar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apagar" })).toBeTruthy();
    expect(screen.getByRole("group").querySelector("output")?.textContent).toContain("vazio");
  });

  it("names the group from label and describes it with the target", () => {
    render(<Keypad value="35" onChange={() => {}} label="Standard Crate" target={40} />);
    const group = screen.getByRole("group", { name: "Standard Crate" });
    expect(group.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("Expected 40")).toBeTruthy();
    expect(screen.getByText("Expected 40").closest("output")).toBeNull();
  });

  it("targetLabel replaces Expected", () => {
    render(<Keypad value="" onChange={() => {}} target={12} targetLabel="Esperado" />);
    expect(screen.getByText("Esperado 12")).toBeTruthy();
  });

  it("announces the value politely and the empty word when empty", () => {
    const { rerender } = render(<Keypad value="" onChange={() => {}} />);
    const out = () => screen.getByRole("group").querySelector("output")!;
    expect(out().getAttribute("aria-live")).toBe("polite");
    expect(out().textContent).toContain("empty");
    rerender(<Keypad value="42" onChange={() => {}} />);
    expect(out().textContent).toBe("42");
  });

  it("disables all twelve keys", () => {
    render(<Keypad value="5" onChange={() => {}} disabled />);
    for (const b of screen.getAllByRole("button"))
      expect((b as HTMLButtonElement).disabled).toBe(true);
  });

  it("carries the 64px touch and tablet height classes", () => {
    render(<Keypad value="" onChange={() => {}} />);
    const cls = screen.getByRole("button", { name: "5" }).className;
    expect(cls).toContain("[@media(pointer:coarse)]:h-16");
    expect(cls).toContain("[[data-surface=tablet]_&]:h-16");
  });
});

describe("Keypad physical keyboard", () => {
  function setup(value = "12") {
    const onChange = vi.fn();
    render(<Keypad value={value} onChange={onChange} />);
    screen.getByRole("button", { name: "7" }).focus();
    return onChange;
  }

  it("a digit appends", async () => {
    const onChange = setup();
    await userEvent.keyboard("5");
    expect(onChange).toHaveBeenLastCalledWith("125");
  });

  it("a numpad digit appends", async () => {
    const onChange = setup();
    // A numpad press reports key "5" with code "Numpad5" (user-event's own {Numpad5} does not).
    fireEvent.keyDown(screen.getByRole("button", { name: "7" }), { key: "5", code: "Numpad5" });
    expect(onChange).toHaveBeenLastCalledWith("125");
  });

  it("Backspace deletes the last digit", async () => {
    const onChange = setup();
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("Delete clears (pinned: Delete is clear, not a second backspace)", async () => {
    const onChange = setup();
    await userEvent.keyboard("{Delete}");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("Ctrl+digit is left alone", async () => {
    const onChange = setup();
    await userEvent.keyboard("{Control>}5{/Control}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Enter on a focused key presses it natively", async () => {
    const onChange = setup();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("127");
  });

  it("other keys are not handled", async () => {
    const onChange = setup();
    await userEvent.keyboard("{ArrowRight}a");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", async () => {
    const onChange = vi.fn();
    const { container } = render(<Keypad value="12" onChange={onChange} disabled />);
    const group = container.firstElementChild as HTMLElement;
    group.dispatchEvent(new KeyboardEvent("keydown", { key: "5", bubbles: true }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a caller onKeyDown runs first and can veto", async () => {
    const onChange = vi.fn();
    render(<Keypad value="" onChange={onChange} onKeyDown={(e) => e.preventDefault()} />);
    screen.getByRole("button", { name: "7" }).focus();
    await userEvent.keyboard("5");
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Keypad accessibility (axe)", () => {
  const cases: Array<[string, React.ComponentProps<typeof Keypad>]> = [
    ["empty", { value: "", onChange: () => {} }],
    ["typed", { value: "35", onChange: () => {}, label: "Standard Crate" }],
    ["at max", { value: "9999", onChange: () => {} }],
    ["disabled", { value: "5", onChange: () => {}, disabled: true }],
    ["with target", { value: "35", onChange: () => {}, label: "Count", target: 40 }],
  ];
  it.each(cases)("%s: no violations", async (_n, props) => {
    const { container } = render(<Keypad {...props} />);
    const res = await axe.run(container);
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });
});
