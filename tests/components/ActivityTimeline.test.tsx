import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Imported FROM THE PACKAGE ROOT: a primitive a consumer cannot reach from the root has not shipped.
import {
  ActivityTimeline,
  ActivityTimelineItem,
  ChangeTable,
  type ChangeTableRow,
} from "../../src";

// CR-DESIGN-SYSTEM-014 (raised by Bananaworld-DC CR-DC-222) — "who did what, when, and what changed".
// The words below are the consumer's; the spec asserts that the package draws exactly those words, in
// the order handed in, and invents none of its own beyond the default column headings.

afterEach(() => {
  cleanup();
});

const CHANGED: ChangeTableRow[] = [
  { key: "room", label: "Room", before: "Cold room 2", after: "Ripening room 4", changed: true },
];
const UNCHANGED: ChangeTableRow[] = [
  { key: "farm", label: "Farm", before: "Green Hills", after: "Green Hills", changed: false },
  { key: "item", label: "Item", before: "Bananas", after: "Bananas", changed: false },
];

function texts(root: HTMLElement, selector: string): string[] {
  return [...root.querySelectorAll(selector)].map((el) => el.textContent ?? "");
}

describe("ActivityTimeline", () => {
  it("is an ordered list holding the entries in the order handed in", () => {
    const { getByRole } = render(
      <ActivityTimeline aria-label="History">
        <ActivityTimelineItem title="Created" meta="Thandi · office · 09:14" />
        <ActivityTimelineItem title="Posted" meta="Johan · Bay 1 · 06:48" />
        <ActivityTimelineItem title="Printed" tag="Batch label · 4471" tone="part" />
      </ActivityTimeline>,
    );
    const list = getByRole("list", { name: "History" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((li) => li.textContent)).toEqual([
      "CreatedThandi · office · 09:14",
      "PostedJohan · Bay 1 · 06:48",
      "PrintedBatch label · 4471",
    ]);
  });

  it("draws the tag, the badge, the meta and the body only when handed one", () => {
    const { getAllByRole } = render(
      <ActivityTimeline>
        <ActivityTimelineItem
          title="Changed"
          tag="Batch 4471"
          badge={<span data-testid="badge">Refused</span>}
          meta="Chris · office"
        >
          <p>Body</p>
        </ActivityTimelineItem>
        <ActivityTimelineItem title="Bare" />
      </ActivityTimeline>,
    );
    const [full, bare] = getAllByRole("listitem") as [HTMLElement, HTMLElement];
    expect(within(full).getByText("Batch 4471")).toBeTruthy();
    expect(within(full).getByTestId("badge").textContent).toBe("Refused");
    expect(within(full).getByText("Chris · office")).toBeTruthy();
    expect(within(full).getByText("Body")).toBeTruthy();
    // The bare item holds its title and its (hidden) dot — nothing else.
    expect(bare.textContent).toBe("Bare");
    expect(bare.children).toHaveLength(2);
  });

  it("a part's dot is neutral, the record's is the accent; the dot is hidden from readers", () => {
    const { getAllByRole } = render(
      <ActivityTimeline>
        <ActivityTimelineItem title="Posted" />
        <ActivityTimelineItem title="Printed" tone="part" />
      </ActivityTimeline>,
    );
    const [record, part] = getAllByRole("listitem") as [HTMLElement, HTMLElement];
    const recordDot = record.querySelector('[aria-hidden="true"]') as HTMLElement;
    const partDot = part.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(recordDot.className).toContain("border-accent");
    expect(partDot.className).toContain("border-border-strong");
    expect(partDot.className).not.toContain("border-accent");
    expect(record.dataset.tone).toBe("record");
    expect(part.dataset.tone).toBe("part");
  });
});

describe("ChangeTable — changes mode", () => {
  it("Field · Before · After, with the changed values tinted and an unchanged row plain", () => {
    const { container } = render(<ChangeTable rows={[...CHANGED, ...UNCHANGED.slice(0, 1)]} />);
    expect(texts(container, "th")).toEqual(["Field", "Before", "After"]);
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows.map((r) => texts(r as HTMLElement, "td"))).toEqual([
      ["Room", "Cold room 2", "Ripening room 4"],
      ["Farm", "Green Hills", "Green Hills"],
    ]);
    const changedSpans = rows[0]!.querySelectorAll("span");
    expect(changedSpans[0]!.className).toContain("bg-danger-subtle");
    expect(changedSpans[1]!.className).toContain("bg-success-subtle");
    expect(rows[1]!.querySelectorAll("span")).toHaveLength(0);
  });

  it("takes the consumer's headings", () => {
    const { container } = render(
      <ChangeTable rows={CHANGED} headings={{ field: "Veld", before: "Voor", after: "Na" }} />,
    );
    expect(texts(container, "th")).toEqual(["Veld", "Voor", "Na"]);
  });
});

describe("ChangeTable — values mode (only the new values were recorded)", () => {
  it("draws Field · Recorded as and never a before, even when one is handed in", () => {
    const { container } = render(<ChangeTable mode="values" rows={CHANGED} />);
    expect(texts(container, "th")).toEqual(["Field", "Recorded as"]);
    expect(texts(container, "td")).toEqual(["Room", "Ripening room 4"]);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });
});

describe("ChangeTable — the rows kept behind a button", () => {
  it("is reached and pressed from the keyboard, shows the rows, and hides them again", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(
      <ChangeTable
        rows={CHANGED}
        more={{
          rows: UNCHANGED,
          showLabel: "Show the 2 fields that did not change",
          hideLabel: "Hide the fields that did not change",
        }}
      />,
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    const button = getByRole("button", { name: "Show the 2 fields that did not change" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(button.textContent).toBe("Hide the fields that did not change");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard(" ");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it("no rows kept back ⇒ no button; no rows shown ⇒ no empty table", () => {
    const { container, queryByRole, rerender } = render(
      <ChangeTable rows={CHANGED} more={{ rows: [], showLabel: "Show", hideLabel: "Hide" }} />,
    );
    expect(queryByRole("button")).toBeNull();
    rerender(<ChangeTable rows={[]} />);
    expect(container.querySelector("table")).toBeNull();
  });
});
