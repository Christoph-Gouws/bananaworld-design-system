import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Combobox, type ComboboxOption } from "../../src/components/Combobox";

// CR-DC-008 — the listbox used to be pinned below the field at a flat 288px cap, which put the
// scroll container (and most of its scrollbar) off the bottom edge of the screen whenever the field
// sat low in the window. These pin the two behaviours that fixed it: flip-when-cramped, and a height
// that follows the room actually available.

const OPTIONS: ComboboxOption[] = Array.from({ length: 24 }, (_, i) => ({
  value: String(i + 1),
  label: `Item ${i + 1}`,
}));

// getBoundingClientRect returns all-zeros in a headless DOM, so the field's position is stated
// explicitly per test. Only top/bottom/left/width are read by updateAnchor.
function placeFieldAt(rect: { top: number; bottom: number }): void {
  vi.spyOn(HTMLInputElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 100,
    width: 200,
    top: rect.top,
    bottom: rect.bottom,
    right: 300,
    height: rect.bottom - rect.top,
    x: 100,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

function setViewportHeight(height: number): void {
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true, writable: true });
}

async function openList(): Promise<HTMLElement> {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText("Item"));
  return screen.getByRole("listbox");
}

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("<Combobox> placement + scroll height (CR-DC-008)", () => {
  it("opens BELOW the field when there is room, capped at the historical 288px", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={OPTIONS} />);

    const list = await openList();
    const panel = list.parentElement as HTMLElement;

    // Anchored from the top edge => it opened downwards.
    expect(panel.style.top).toBe("134px");
    expect(panel.style.bottom).toBe("");
    // Room below is ~758px, so the cap wins: nothing gets TALLER than it was before (AC-8).
    expect(list.style.maxHeight).toBe("288px");
  });

  it("flips ABOVE when below cannot seat a usable list and above is roomier (AC-2)", async () => {
    setViewportHeight(800);
    // 70px of room below — the old code rendered a 288px list straight off the bottom of the screen.
    placeFieldAt({ top: 700, bottom: 730 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={OPTIONS} />);

    const list = await openList();
    const panel = list.parentElement as HTMLElement;

    // Anchored from the BOTTOM edge => it opened upwards, with no measure-then-correct flicker.
    expect(panel.style.bottom).toBe("104px");
    expect(panel.style.top).toBe("");
    expect(list.style.maxHeight).toBe("288px");
  });

  it("clamps the height to the room actually available, so the scroll area is on screen (AC-3)", async () => {
    setViewportHeight(600);
    // 158px below: enough to stay put, but far less than the old flat 288px cap.
    placeFieldAt({ top: 400, bottom: 430 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={OPTIONS} />);

    const list = await openList();
    expect((list.parentElement as HTMLElement).style.top).toBe("434px");
    expect(list.style.maxHeight).toBe("158px");
  });

  it("keeps a real scroll container with a visible scrollbar and contained overscroll (AC-3/AC-4)", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={OPTIONS} />);

    const list = await openList();
    expect(list.className).toContain("overflow-y-auto");
    // Scrolling to the end of the list must not chain into whatever is behind it.
    expect(list.className).toContain("overscroll-contain");
    // The flat cap is gone — the height is computed, never a static class.
    expect(list.className).not.toContain("max-h-72");
  });

  it("still portals with pointer events enabled — clickable inside a modal Sheet (AC-7)", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={OPTIONS} />);

    const list = await openList();
    expect((list.parentElement as HTMLElement).classList.contains("pointer-events-auto")).toBe(true);
  });

  it("still selects the option that was clicked (no regression from the reposition guard)", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox aria-label="Item" value={null} onChange={onChange} options={OPTIONS} />);

    await user.click(screen.getByLabelText("Item"));
    await user.click(screen.getByText("Item 19"));
    expect(onChange).toHaveBeenCalledWith("19");
  });
});
