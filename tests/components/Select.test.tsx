import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/Select";

// CR-DC-008 — a long Select was not scrollable AT ALL. Radix's popper publishes the room available
// as a CSS variable and deliberately leaves applying it to the consumer; nothing here read it, so
// the Content rendered at full natural height, nothing ever overflowed, and `overflow-hidden`
// clipped the rest. Radix also hides the viewport scrollbar outright, expecting
// ScrollUp/ScrollDownButton to be the affordance instead — and this wrapper rendered neither.

beforeAll(() => {
  // Radix Select reaches for these; happy-dom does not ship them.
  globalThis.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as never;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(cleanup);

function renderOpenSelect(): void {
  render(
    <Select open value="1" onValueChange={() => {}}>
      <SelectTrigger aria-label="Status">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 30 }, (_, i) => (
          <SelectItem key={i + 1} value={String(i + 1)}>{`Option ${i + 1}`}</SelectItem>
        ))}
      </SelectContent>
    </Select>,
  );
}

function contentElement(): HTMLElement {
  const viewport = document.querySelector("[data-radix-select-viewport]");
  const content = viewport?.parentElement;
  if (!(content instanceof HTMLElement)) throw new Error("Select content did not render");
  return content;
}

describe("<SelectContent> scrollability (CR-DC-008)", () => {
  it("caps its height to the room Radix says is available — the line that creates the overflow (AC-5)", () => {
    renderOpenSelect();
    expect(contentElement().className).toContain(
      "max-h-[var(--radix-select-content-available-height)]",
    );
  });

  it("has that variable actually defined on it, so the cap resolves rather than silently voiding", () => {
    renderOpenSelect();
    // Radix re-namespaces the popper variable onto this same element. If this ever stops being
    // published, the max-height above becomes invalid-at-computed-value-time and the bug returns
    // WITHOUT any class changing — which is precisely how it went unnoticed the first time.
    const declared = contentElement().style.getPropertyValue(
      "--radix-select-content-available-height",
    );
    expect(declared).toBe("var(--radix-popper-available-height)");
  });

  it("keeps the Viewport as the live scroll container Radix intends", () => {
    renderOpenSelect();
    const viewport = document.querySelector("[data-radix-select-viewport]") as HTMLElement;
    // `overflow: hidden auto` + a flex-grow that is honoured (Radix sets display:flex/column on the
    // Content inline itself). These were always correct; they had nothing to scroll against.
    expect(viewport.style.overflow).toBe("hidden auto");
    expect(viewport.style.flexGrow).toBe("1");
    expect(contentElement().style.flexDirection).toBe("column");
  });

  it("does not widen the public export surface — the scroll buttons stay internal to SelectContent", async () => {
    const mod = await import("../../src/components/Select");
    // All 40 DC call sites and the CRM/RMS consumers must inherit the fix with zero edits, which
    // only holds if nothing new has to be composed in by hand.
    expect(Object.keys(mod).sort()).toEqual([
      "Select",
      "SelectContent",
      "SelectGroup",
      "SelectItem",
      "SelectSeparator",
      "SelectTrigger",
      "SelectValue",
    ]);
  });
});

// NOT COVERED HERE, deliberately: that the scroll chevrons actually APPEAR (AC-4). Radix mounts
// ScrollUp/ScrollDownButton only once it measures real overflow, and every measurement in a
// headless DOM is zero — so asserting their presence here would only ever assert their absence.
// AC-4 is proven on the deployed instance instead; see the plan's §11 manual leg.
