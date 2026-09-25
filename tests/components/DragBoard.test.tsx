import { useState, type ReactElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DragBoard,
  DragGrip,
  DragKeyboardHint,
  useDropTarget,
  type DragItem,
} from "../../src";

// ============================================================================
// CR-DESIGN-SYSTEM-011 — the drag control, driven the two ways a person drives it
// ============================================================================
// The board below has THREE places in document order: `first` and `third` take the item, `second`
// refuses it. Every spec asserts what the CONSUMER receives (`onDrop`, `onCancel`, the live region's
// words, the place's own `isOver`/`canDrop`) — never the control's private state.

const ROUTE: DragItem = { id: "r07", kind: "route", label: "R07 · Lydenburg" };

beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Place({ id, accepts }: { id: string; accepts: boolean }): ReactElement {
  const { targetProps, isOver, canDrop } = useDropTarget(id, { accepts: () => accepts });
  return (
    <div
      {...targetProps}
      data-testid={id}
      data-over={isOver ? "yes" : "no"}
      data-can={canDrop ? "yes" : "no"}
    >
      {id}
    </div>
  );
}

function renderBoard(options: { places?: readonly [string, boolean][] } = {}) {
  const onDrop = vi.fn();
  const onCancel = vi.fn();
  const places = options.places ?? [
    ["first", true],
    ["second", false],
    ["third", true],
  ];
  render(
    <DragBoard
      onDrop={onDrop}
      onCancel={onCancel}
      describe={(item, over) => `Holding ${item.label}${over === null ? "" : ` over ${over}`}`}
    >
      <DragGrip item={ROUTE} label="Move R07 · Lydenburg" />
      {places.map(([id, accepts]) => (
        <Place key={id} id={id} accepts={accepts} />
      ))}
      <DragKeyboardHint>{(item, over) => `Moving ${item.label} — now over ${over ?? "nothing"}`}</DragKeyboardHint>
    </DragBoard>,
  );
  const grip = screen.getByRole("button", { name: "Move R07 · Lydenburg" });
  const live = document.querySelector("[data-drag-live-region]") as HTMLElement;
  return { onDrop, onCancel, grip, live };
}

function key(el: HTMLElement, k: string): void {
  fireEvent.keyDown(el, { key: k });
}

describe("the keyboard path — pick up, choose, put down", () => {
  it("🔴 Space picks up, ↓ skips the place that refuses, Space puts it down — ONE drop, on the right place", () => {
    const { grip, onDrop, live } = renderBoard();
    grip.focus();
    key(grip, " ");
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    expect(live.textContent).toBe("Holding R07 · Lydenburg");
    key(grip, "ArrowDown");
    expect(screen.getByTestId("first").dataset.over).toBe("yes");
    expect(live.textContent).toBe("Holding R07 · Lydenburg over first");
    key(grip, "ArrowDown");
    // `second` refuses, so the keyboard never stops there.
    expect(screen.getByTestId("second").dataset.over).toBe("no");
    expect(screen.getByTestId("third").dataset.over).toBe("yes");
    key(grip, " ");
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(ROUTE, "third");
    expect(grip.getAttribute("aria-pressed")).toBe("false");
  });

  it("Enter works as Space, and ↑ from nothing starts at the LAST place that takes it", () => {
    const { grip, onDrop } = renderBoard();
    grip.focus();
    key(grip, "Enter");
    key(grip, "ArrowUp");
    expect(screen.getByTestId("third").dataset.over).toBe("yes");
    key(grip, "ArrowUp");
    expect(screen.getByTestId("first").dataset.over).toBe("yes");
    // At the first place, ↑ stays there rather than wrapping.
    key(grip, "ArrowUp");
    expect(screen.getByTestId("first").dataset.over).toBe("yes");
    key(grip, "Enter");
    expect(onDrop).toHaveBeenCalledWith(ROUTE, "first");
  });

  it("🔴 Esc puts it back: no drop, the cancel is reported, focus stays on the grip", () => {
    const { grip, onDrop, onCancel, live } = renderBoard();
    grip.focus();
    key(grip, " ");
    key(grip, "ArrowDown");
    key(grip, "Escape");
    expect(onDrop).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledWith(ROUTE);
    expect(document.activeElement).toBe(grip);
    expect(grip.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByTestId("first").dataset.over).toBe("no");
    expect(live.textContent).toBe("Put back where it was.");
  });

  it("Tab and a blur put it back too", () => {
    const { grip, onDrop, onCancel } = renderBoard();
    grip.focus();
    key(grip, " ");
    key(grip, "Tab");
    expect(onCancel).toHaveBeenCalledTimes(1);
    key(grip, " ");
    fireEvent.blur(grip);
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("putting it down before choosing a place is a put-back, never a drop", () => {
    const { grip, onDrop, onCancel } = renderBoard();
    grip.focus();
    key(grip, " ");
    key(grip, " ");
    expect(onDrop).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("with no place that takes it, the pick-up says so and nothing is held", () => {
    const { grip, live } = renderBoard({ places: [["second", false]] });
    grip.focus();
    key(grip, " ");
    expect(grip.getAttribute("aria-pressed")).toBe("false");
    expect(live.textContent).toBe("There is nowhere to put it.");
  });

  it("the keyboard line shows only while something is held BY KEYBOARD", () => {
    const { grip } = renderBoard();
    expect(document.querySelector("[data-drag-keyboard-hint]")).toBeNull();
    grip.focus();
    key(grip, " ");
    key(grip, "ArrowDown");
    const hint = document.querySelector("[data-drag-keyboard-hint]");
    expect(hint?.textContent).toContain("Moving R07 · Lydenburg — now over first");
    expect(hint?.textContent).toContain("put it back");
    key(grip, "Escape");
    expect(document.querySelector("[data-drag-keyboard-hint]")).toBeNull();
  });
});

function transfer(): DataTransfer {
  const data = new Map<string, string>();
  return {
    setData: (type: string, value: string) => void data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
    setDragImage: vi.fn(),
    effectAllowed: "none",
    dropEffect: "none",
  } as unknown as DataTransfer;
}

// The pick-up is deferred one tick on purpose (see `DragGrip`); a spec lets that tick pass.
async function tick(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("focus after a keyboard drop", () => {
  // The consumer re-renders a dropped item in its new place, so its old grip unmounts and focus falls to
  // the page. The harness does exactly that: the grip lives in whichever place it was last dropped on.
  function Moving(): ReactElement {
    const [at, setAt] = useState("first");
    return (
      <DragBoard onDrop={(_item, place) => setAt(place)} describe={() => ""}>
        {["first", "third"].map((id) => (
          <div key={id}>
            <Place id={id} accepts />
            {at === id && <DragGrip item={ROUTE} label="Move R07" />}
          </div>
        ))}
        <button type="button">Somewhere else</button>
      </DragBoard>
    );
  }

  async function frame(): Promise<void> {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  }

  it("🔴 focus follows the item to its grip in the new place, when the drop left it nowhere", async () => {
    render(<Moving />);
    const grip = screen.getByRole("button", { name: "Move R07" });
    grip.focus();
    key(grip, " ");
    key(grip, "ArrowDown");
    key(grip, "ArrowDown");
    key(grip, " ");
    await frame();
    const moved = screen.getByRole("button", { name: "Move R07" });
    expect(moved).not.toBe(grip);
    expect(document.activeElement).toBe(moved);
  });

  it("🔴 but focus is NEVER pulled away from wherever the person has already gone", async () => {
    render(<Moving />);
    const grip = screen.getByRole("button", { name: "Move R07" });
    grip.focus();
    key(grip, " ");
    key(grip, "ArrowDown");
    key(grip, "ArrowDown");
    key(grip, " ");
    const elsewhere = screen.getByRole("button", { name: "Somewhere else" });
    elsewhere.focus();
    await frame();
    expect(document.activeElement).toBe(elsewhere);
  });
});

describe("the mouse path — native drag", () => {
  it("🔴 dragstart → a place that takes it accepts the hover → drop: ONE drop, on that place", async () => {
    const { grip, onDrop } = renderBoard();
    const dt = transfer();
    fireEvent.dragStart(grip, { dataTransfer: dt });
    await tick();
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    // The keyboard line is for the keyboard: a mouse user never sees it.
    expect(document.querySelector("[data-drag-keyboard-hint]")).toBeNull();
    const first = screen.getByTestId("first");
    // `fireEvent` answers false when the handler PREVENTED the default — the browser's "you may drop".
    expect(fireEvent.dragOver(first, { dataTransfer: dt })).toBe(false);
    expect(first.dataset.over).toBe("yes");
    expect(first.dataset.can).toBe("yes");
    fireEvent.drop(first, { dataTransfer: dt });
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(ROUTE, "first");
    fireEvent.dragEnd(grip, { dataTransfer: dt });
    expect(grip.getAttribute("aria-pressed")).toBe("false");
  });

  it("🔴 a place that refuses NEVER prevents the default, says it is over, and takes no drop", async () => {
    const { grip, onDrop } = renderBoard();
    const dt = transfer();
    fireEvent.dragStart(grip, { dataTransfer: dt });
    await tick();
    const second = screen.getByTestId("second");
    expect(fireEvent.dragOver(second, { dataTransfer: dt })).toBe(true);
    // The consumer can still say "Cannot take R07" — it knows the mouse is over it.
    expect(second.dataset.over).toBe("yes");
    expect(second.dataset.can).toBe("no");
    fireEvent.drop(second, { dataTransfer: dt });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("a drag released anywhere else is put back, and the board is at rest", async () => {
    const { grip, onDrop, onCancel } = renderBoard();
    const dt = transfer();
    fireEvent.dragStart(grip, { dataTransfer: dt });
    await tick();
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    fireEvent.dragEnd(grip, { dataTransfer: dt });
    expect(onDrop).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledWith(ROUTE);
    expect(grip.getAttribute("aria-pressed")).toBe("false");
  });

  it("🔴 a drag that STARTS from a touch is cancelled — tablets use the dropdowns", async () => {
    const { grip, onDrop } = renderBoard();
    fireEvent.pointerDown(grip, { pointerType: "touch" });
    const dt = transfer();
    expect(fireEvent.dragStart(grip, { dataTransfer: dt })).toBe(false);
    await tick();
    expect(grip.getAttribute("aria-pressed")).toBe("false");
    fireEvent.dragOver(screen.getByTestId("first"), { dataTransfer: dt });
    fireEvent.drop(screen.getByTestId("first"), { dataTransfer: dt });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("a mouse after a touch is a drag again", async () => {
    const { grip } = renderBoard();
    fireEvent.pointerDown(grip, { pointerType: "touch" });
    fireEvent.pointerDown(grip, { pointerType: "mouse" });
    fireEvent.dragStart(grip, { dataTransfer: transfer() });
    await tick();
    expect(grip.getAttribute("aria-pressed")).toBe("true");
  });

  it("🔴 a drop from OUTSIDE the board (a file, another window) is ignored", () => {
    const { onDrop } = renderBoard();
    const first = screen.getByTestId("first");
    const dt = transfer();
    expect(fireEvent.dragOver(first, { dataTransfer: dt })).toBe(true);
    fireEvent.drop(first, { dataTransfer: dt });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("the preview is handed to the browser as the drag image", async () => {
    const onDrop = vi.fn();
    const preview = { current: document.createElement("span") };
    render(
      <DragBoard onDrop={onDrop} describe={() => ""}>
        <DragGrip item={ROUTE} label="Move R07" preview={preview} />
      </DragBoard>,
    );
    const dt = transfer();
    fireEvent.dragStart(screen.getByRole("button", { name: "Move R07" }), { dataTransfer: dt });
    expect(dt.setDragImage).toHaveBeenCalledWith(preview.current, 12, 12);
    await tick();
  });
});

describe("outside a DragBoard, and when disabled", () => {
  it("a grip outside any board is inert", () => {
    render(<DragGrip item={ROUTE} label="Move R07" />);
    const grip = screen.getByRole("button", { name: "Move R07" });
    expect(grip.hasAttribute("disabled")).toBe(true);
    expect(grip.getAttribute("draggable")).toBe("false");
  });

  it("a disabled grip cannot be dragged and does not pick up", () => {
    const onDrop = vi.fn();
    render(
      <DragBoard onDrop={onDrop} describe={() => ""}>
        <DragGrip item={ROUTE} label="Move R07" disabled />
        <Place id="first" accepts />
      </DragBoard>,
    );
    const grip = screen.getByRole("button", { name: "Move R07" });
    expect(grip.getAttribute("draggable")).toBe("false");
    key(grip, " ");
    expect(grip.getAttribute("aria-pressed")).toBe("false");
  });

  it("the grip names its instructions for a screen reader", () => {
    const { grip } = renderBoard();
    const id = grip.getAttribute("aria-describedby");
    expect(id).not.toBeNull();
    expect(document.getElementById(id ?? "")?.textContent).toContain("Escape to put it back");
    expect(grip.getAttribute("aria-roledescription")).toBe("drag handle");
  });
});
