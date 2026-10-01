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

// CR-DESIGN-SYSTEM-012 (raised by Bananaworld-DC CR-DC-210) — optional sections. The DC tablet's batch
// picker lists "In this room" and then "Elsewhere in the DC"; a heading is drawn where the group
// changes, and it is never an option.

/**
 * The listbox exactly as the PREVIOUS version drew it, captured by rendering that version (pin
 * 76fec2a0) with the props below. Two things are normalised on both sides so the literal pins this
 * component and not its neighbours: the icon's `<svg>` (lucide's own markup, a dependency) and the
 * `&amp;` escaping of the tablet selector (a DOM serialiser detail).
 */
const PREVIOUS_MARKUP =
  '<ul id="cap-listbox" role="listbox" class="overflow-y-auto overscroll-contain py-1" style="max-height: 288px;">' +
  '<li role="option" aria-selected="false"><button type="button" class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-muted [[data-surface=tablet]_&]:py-3 bg-surface-muted">' +
  '<svg/><span class="flex min-w-0 flex-col gap-0.5"><span class="truncate font-medium text-fg">Alpha</span><span class="truncate text-xs text-fg-muted [[data-surface=tablet]_&]:text-sm">first</span></span></button></li>' +
  '<li role="option" aria-selected="true"><button type="button" class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-muted [[data-surface=tablet]_&]:py-3">' +
  '<svg/><span class="flex min-w-0 flex-col gap-0.5"><span class="truncate font-medium text-fg">Bravo</span></span></button></li>' +
  '<li role="option" aria-selected="false"><button type="button" class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-surface-muted [[data-surface=tablet]_&]:py-3">' +
  '<svg/><span class="flex min-w-0 flex-col gap-0.5"><span class="truncate font-medium text-fg">Charlie</span></span></button></li></ul>';

function normalised(html: string): string {
  return html.replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>").replace(/&amp;/g, "&");
}

const GROUPED: ComboboxOption[] = [
  { value: "r1", label: "A3662 · Rooiport", sublabel: "Cavendish 18 kg · Crate", group: "In this room" },
  { value: "r2", label: "B1190 · Blyde", sublabel: "Cavendish 13 kg · Carton", group: "In this room" },
  { value: "e1", label: "F3305 · Blyde", sublabel: "Cavendish 18 kg · Crate", group: "Elsewhere in the DC" },
  { value: "e2", label: "G1102 · Komati", sublabel: "Cavendish 13 kg · Carton", group: "Elsewhere in the DC" },
];

function headings(list: HTMLElement): string[] {
  return [...list.querySelectorAll('li[role="presentation"]')].map((h) => h.textContent ?? "");
}

describe("<Combobox> optional sections (CR-DESIGN-SYSTEM-012)", () => {
  it("🔴 without `group` the markup is BYTE-IDENTICAL to the previous version", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    render(
      <Combobox
        id="cap"
        aria-label="Item"
        value="b"
        onChange={() => {}}
        options={[
          { value: "a", label: "Alpha", sublabel: "first" },
          { value: "b", label: "Bravo" },
          { value: "c", label: "Charlie", keywords: "x" },
        ]}
      />,
    );
    const list = await openList();
    expect(normalised(list.outerHTML)).toBe(PREVIOUS_MARKUP);
  });

  it("draws one heading where the group changes, and only there", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={GROUPED} />);
    const list = await openList();
    expect(headings(list)).toEqual(["In this room", "Elsewhere in the DC"]);
    // Four options and two headings: a heading is never an option.
    expect(screen.getAllByRole("option").length).toBe(4);
    expect(list.children.length).toBe(6);
    // The heading sits directly above the first option of its section.
    const second = list.children[3] as HTMLElement;
    expect(second.getAttribute("role")).toBe("presentation");
    expect((list.children[4] as HTMLElement).textContent).toContain("F3305");
  });

  it("the arrow keys skip a heading — Enter on the next option crosses the boundary", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox aria-label="Item" value={null} onChange={onChange} options={GROUPED} />);
    await user.click(screen.getByLabelText("Item"));
    // Active starts on r1; two presses land on e1, the first option under the second heading.
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("e1");
  });

  it("a section the query empties loses its heading too", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    const user = userEvent.setup();
    render(<Combobox aria-label="Item" value={null} onChange={() => {}} options={GROUPED} />);
    await user.click(screen.getByLabelText("Item"));
    await user.keyboard("komati");
    const list = screen.getByRole("listbox");
    expect(headings(list)).toEqual(["Elsewhere in the DC"]);
    expect(screen.getAllByRole("option").length).toBe(1);
  });

  it("pressing a heading chooses nothing", async () => {
    setViewportHeight(900);
    placeFieldAt({ top: 100, bottom: 130 });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox aria-label="Item" value={null} onChange={onChange} options={GROUPED} />);
    await user.click(screen.getByLabelText("Item"));
    await user.click(screen.getByText("Elsewhere in the DC"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
