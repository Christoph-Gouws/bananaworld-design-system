import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChoiceGroup, type ChoiceOption } from "../../src/components/ChoiceGroup";
import { ColourSwatch } from "../../src/components/ColourSwatch";

// CR-DESIGN-SYSTEM-001 — `ChoiceOption` gained two OPTIONAL fields: `swatch` (a colour block) and
// `description` (a fuller name used as tooltip + accessible name). Four apps pin this package by
// git sha and each bumps when it chooses, so the additive claim is not a sentence in a document —
// it is the first four tests below. A chip that passes neither field must render byte-identically
// to what it rendered before, attribute for attribute and child node for child node.
//
// Hexes and stage names here are INVENTED literals. No banana colour stage, code or hex belongs in
// this repo (TECH-COMP-003); the package renders what a caller hands it and owns no colour.

const PLAIN: readonly ChoiceOption[] = [
  { id: "s", name: "Small" },
  { id: "m", name: "Medium" },
  { id: "l", name: "Large" },
  { id: "x", name: "Extra Large", disabled: true },
];

afterEach(cleanup);

function chips(): HTMLElement[] {
  return screen.getAllByRole("radio");
}

// `noUncheckedIndexedAccess` is on, so an index into chips() is `HTMLElement | undefined`. These
// throw rather than being asserted away with `!`, matching the `contentElement()` idiom in
// Select.test.tsx — a missing chip should fail loudly at the point it went missing.
function chip(index: number): HTMLElement {
  const el = chips()[index];
  if (!el) throw new Error(`no chip rendered at index ${index}`);
  return el;
}

/** The `aria-hidden` colour block inside a chip, or null when the chip has none. */
function swatchIn(el: HTMLElement): HTMLElement | null {
  return el.querySelector<HTMLElement>("[aria-hidden]");
}

function requireSwatchIn(el: HTMLElement): HTMLElement {
  const swatch = swatchIn(el);
  if (!swatch) throw new Error("chip rendered no colour block");
  return swatch;
}

describe("<ChoiceGroup> — the baseline that must not move", () => {
  it("renders every option, and only the selected one is checked", () => {
    render(<ChoiceGroup aria-label="Size" options={PLAIN} value="m" onValueChange={() => {}} />);

    expect(chips().map((c) => c.textContent)).toEqual([
      "Small",
      "Medium",
      "Large",
      "Extra Large",
    ]);
    expect(chips().map((c) => c.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
      "false",
    ]);
    expect(chip(3).hasAttribute("disabled")).toBe(true);
  });

  it("shows the empty label, and no chips at all, when there is nothing to choose from", () => {
    render(<ChoiceGroup aria-label="Size" options={[]} />);

    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByText("None configured.")).toBeTruthy();
  });

  it("is announced as ONE radio group with zero buttons — the Radix guarantee a hand-rolled chip row loses", () => {
    render(<ChoiceGroup aria-label="Size" options={PLAIN} value="m" onValueChange={() => {}} />);

    // A row of <button aria-pressed> looks identical and reports four buttons and no group. If this
    // ever flips, keyboard and screen-reader behaviour has silently regressed even though the
    // pixels have not.
    expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("moves AND selects with an arrow key, from a single tab stop", async () => {
    const user = userEvent.setup();
    render(<ChoiceGroup aria-label="Size" options={PLAIN} defaultValue="s" />);

    await user.tab();
    expect(document.activeElement).toBe(chip(0));

    // The held form `{ArrowRight>}` is deliberate, and the reasoning is ported from DC's own suite:
    // Radix clears its "an arrow is down" flag on keyup, which in a headless DOM happens BEFORE the
    // deferred focus macrotask runs — so a normal press-and-release moves focus without changing the
    // value. That is a test-environment artefact, not a component bug.
    await user.keyboard("{ArrowRight>}");
    expect(chip(1).getAttribute("aria-checked")).toBe("true");
    expect(chip(0).getAttribute("aria-checked")).toBe("false");
  });

  it("adds NOTHING to a chip that passes neither new field — no title, no aria-label, text as its only child", () => {
    render(<ChoiceGroup aria-label="Size" options={PLAIN} value="m" onValueChange={() => {}} />);

    for (const el of chips()) {
      // Asserted as absent rather than empty: React omits an `undefined` attribute entirely, and
      // `title=""` would be a real DOM change even though it looks like nothing.
      expect(el.hasAttribute("title")).toBe(false);
      expect(el.hasAttribute("aria-label")).toBe(false);
      // No swatch element, and no wrapper around the text either.
      expect(swatchIn(el)).toBeNull();
      expect(el.childNodes).toHaveLength(1);
      expect(el.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    }
    // Stated as a value, not a snapshot, so a class-list change cannot be waved through by
    // re-recording it. This is the exact chip class list that shipped at sha b1373c78.
    expect(chip(0).getAttribute("class")).toBe(
      "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md border" +
        " font-medium transition-[background-color,border-color,color] duration-fast ease-out" +
        " focus-visible:outline-none focus-visible:shadow-focus h-8 px-3 text-sm" +
        " [[data-surface=tablet]_&]:min-h-12 [[data-surface=tablet]_&]:px-4" +
        " [[data-surface=tablet]_&]:text-base border-border-strong bg-surface text-fg-muted" +
        " hover:bg-surface-muted data-[state=checked]:border-accent" +
        " data-[state=checked]:bg-accent-subtle data-[state=checked]:font-semibold" +
        " data-[state=checked]:text-fg disabled:cursor-not-allowed disabled:opacity-50" +
        " disabled:hover:bg-surface",
    );
  });
});

describe("<ChoiceGroup> — `swatch`", () => {
  it("renders one aria-hidden colour block filled with the hex it was handed", () => {
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={[{ id: "a", name: "A", swatch: { hex: "#1f4d21" } }]}
        value="a"
        onValueChange={() => {}}
      />,
    );

    const swatch = requireSwatchIn(chip(0));
    expect(swatch.getAttribute("aria-hidden")).toBe("true");
    expect(swatch.style.background).toContain("#1f4d21");
    // The swatch is decoration: the chip is still named by its text, never "image".
    expect(screen.getByRole("radio", { name: "A" })).toBe(chip(0));
  });

  it("blends the two colours through ColourSwatch rather than re-implementing the gradient", () => {
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={[{ id: "a", name: "A", swatch: { hex: "#7fae3a", accentHex: "#c9d94a" } }]}
        value="a"
        onValueChange={() => {}}
      />,
    );

    const background = requireSwatchIn(chip(0)).style.background;
    expect(background).toContain("linear-gradient(135deg,");
    expect(background).toContain("#7fae3a");
    expect(background).toContain("#c9d94a");
  });

  it.each([
    ["null", null],
    ["an empty string", ""],
    ["undefined", undefined],
  ])("falls back to the solid fill when accentHex is %s — the shape nullable master data produces", (_label, accentHex) => {
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={[{ id: "a", name: "A", swatch: { hex: "#d7d64a", accentHex } }]}
        value="a"
        onValueChange={() => {}}
      />,
    );

    const background = requireSwatchIn(chip(0)).style.background;
    expect(background).toContain("#d7d64a");
    expect(background).not.toContain("gradient");
  });

  it("sizes the block as a full-height stripe flush to the chip's left edge (owner-approved option B)", () => {
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={[{ id: "a", name: "A", swatch: { hex: "#1f4d21" } }]}
        value="a"
        onValueChange={() => {}}
      />,
    );

    const swatchClass = requireSwatchIn(chip(0)).getAttribute("class") ?? "";
    // Full height comes from `self-stretch` + `h-auto` together: align-self only stretches an item
    // whose height is auto, so ColourSwatch's own `h-7` HAS to be displaced, not just overridden in
    // spirit. twMerge is what does that displacing, so assert `h-7` is gone rather than that
    // `h-auto` was added.
    expect(swatchClass).toContain("self-stretch");
    expect(swatchClass).toContain("h-auto");
    expect(swatchClass).not.toContain("h-7");
    expect(swatchClass).not.toContain("w-7");
    // Flush to the edge: square corners on the stripe, the chip clips them to its own radius.
    expect(swatchClass).toContain("rounded-none");
    expect(swatchClass).toContain("border-0");
    expect(swatchClass).not.toContain("rounded-sm");
    // And the chip drops its left padding so there is no gap before the stripe.
    const chipClass = chip(0).getAttribute("class") ?? "";
    expect(chipClass).toContain("pl-0");
    expect(chipClass).toContain("overflow-hidden");
    // `px-3` MUST survive alongside `pl-0`: twMerge only drops a preceding class when the later one
    // conflicts, and `pl` does not conflict with `px` — Tailwind's own source order (it emits `pl`
    // after `px`) is what makes pl-0 win on the left while px-3 keeps the RIGHT padding. If twMerge
    // ever started collapsing these, the chip would silently lose its right padding too.
    expect(chipClass).toContain("px-3");
    expect(chipClass).toContain("[[data-surface=tablet]_&]:px-4");
  });

  it("leaves ColourSwatch itself untouched — a plain swatch still renders at its own default size", () => {
    // Guards the "sizing lives in ChoiceGroup" decision: if someone later moves the stripe sizing
    // into ColourSwatch, every OTHER caller of ColourSwatch in every consumer silently resizes.
    render(<ColourSwatch hex="#1f4d21" />);
    const plain = document.querySelector<HTMLElement>("[aria-hidden]");
    expect(plain?.getAttribute("class")).toContain("h-7");
    expect(plain?.getAttribute("class")).toContain("w-7");
  });
});

describe("<ChoiceGroup> — `description`", () => {
  const CS3: readonly ChoiceOption[] = [
    {
      id: "cs3",
      name: "CS3",
      description: "CS3 · More green than yellow",
      swatch: { hex: "#7fae3a", accentHex: "#c9d94a" },
    },
  ];

  it("becomes the accessible name while the visible text stays the short code", () => {
    render(<ChoiceGroup aria-label="Stage" options={CS3} value="cs3" onValueChange={() => {}} />);

    // The headline requirement of this change: one element, two names.
    const stageChip = screen.getByRole("radio", { name: "CS3 · More green than yellow" });
    expect(stageChip.textContent).toBe("CS3");
    expect(stageChip.getAttribute("title")).toBe("CS3 · More green than yellow");
    // And the short code is still IN the announced name — the superset rule the doc comment states.
    // A `description` that dropped it would leave a sighted screen-reader user hearing a label that
    // does not match the one they are looking at.
    expect(stageChip.getAttribute("aria-label")).toContain("CS3");
  });

  it("works without a swatch, and a swatch works without a description — the two fields are independent", () => {
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={[
          { id: "a", name: "A", description: "A · the long one" },
          { id: "b", name: "B", swatch: { hex: "#f8d21a" } },
        ]}
        value="a"
        onValueChange={() => {}}
      />,
    );

    const [a, b] = [chip(0), chip(1)];
    expect(swatchIn(a)).toBeNull();
    expect(a.getAttribute("aria-label")).toBe("A · the long one");
    expect(swatchIn(b)).not.toBeNull();
    expect(b.hasAttribute("aria-label")).toBe(false);
    expect(b.hasAttribute("title")).toBe(false);
  });
});

describe("<ChoiceGroup> — the new fields change no behaviour", () => {
  const STAGES: readonly ChoiceOption[] = [
    { id: "cs1", name: "CS1", description: "CS1 · one", swatch: { hex: "#1f4d21" } },
    { id: "cs2", name: "CS2", description: "CS2 · two", swatch: { hex: "#3f7a2e" } },
    { id: "cs3", name: "CS3", description: "CS3 · three", swatch: { hex: "#d7d64a" } },
  ];

  it("keeps one tab stop and arrow-key movement when every chip carries a swatch", async () => {
    const user = userEvent.setup();
    render(<ChoiceGroup aria-label="Stage" options={STAGES} defaultValue="cs1" />);

    await user.tab();
    expect(document.activeElement).toBe(chip(0));
    // The swatch must not become a second tab stop inside the chip.
    await user.tab();
    expect(chips()).not.toContain(document.activeElement);

    await user.tab({ shift: true });
    await user.keyboard("{ArrowRight>}");
    expect(chip(1).getAttribute("aria-checked")).toBe("true");
  });

  it("reports the option id on click, even though the click landed on the swatch", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChoiceGroup
        aria-label="Stage"
        options={STAGES}
        value="cs1"
        onValueChange={onValueChange}
      />,
    );

    await user.click(requireSwatchIn(chip(2)));
    // The swatch is not a click target of its own — the event bubbles to the chip, which reports
    // its own id. A swatch that swallowed the click would make the biggest part of a gloved-hand
    // target dead.
    expect(onValueChange).toHaveBeenCalledWith("cs3");
  });

  it("still accepts a consumer's own richer option type, the way DC passes PickerOption[]", () => {
    // The one real type risk in this change, pinned as a test rather than left as a paragraph.
    // Consumers do not build `ChoiceOption` literals — DC passes its own `PickerOption[]`, which
    // carries a pile of unrelated fields. Adding OPTIONAL properties to the target of a structural
    // assignment cannot break that (a source lacking them is still assignable), and optional props
    // only ever RELAX excess-property checking. The single way it could break is a name COLLISION:
    // a consumer type that already has `swatch` or `description` at an incompatible type. This
    // stands in for that shape so the assignability is compiled, not asserted in prose.
    interface ConsumerOption {
      readonly id: string;
      readonly name: string;
      readonly code: string;
      readonly tare_kg: number;
      readonly closed_reason: string | null;
    }
    const fromConsumer: readonly ConsumerOption[] = [
      { id: "1", name: "Small", code: "S", tare_kg: 1.2, closed_reason: null },
      { id: "2", name: "Large", code: "L", tare_kg: 1.4, closed_reason: null },
    ];

    render(
      <ChoiceGroup
        aria-label="Size"
        options={fromConsumer}
        value="1"
        onValueChange={() => {}}
      />,
    );

    expect(chips()).toHaveLength(2);
    expect(chip(0).hasAttribute("aria-label")).toBe(false);
    expect(swatchIn(chip(0))).toBeNull();
  });

  it("does not widen the public export surface", async () => {
    const mod = await import("../../src/components/ChoiceGroup");
    // `ChoiceOption` and `ChoiceGroupProps` are types and erase at runtime, so the runtime surface
    // is one name — before this change and after it. Consumers inherit the two new fields with zero
    // edits, which only holds if nothing new has to be imported or composed in by hand.
    expect(Object.keys(mod).sort()).toEqual(["ChoiceGroup"]);
  });
});
