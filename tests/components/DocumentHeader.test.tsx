import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DocumentHeader,
  DOCUMENT_HEADER_SLOTS,
  DOCUMENT_NUMBER_WHERE_TO_SET,
  type DocumentOrigin,
} from "../../src/components/DocumentHeader";

// CR-DESIGN-SYSTEM-002 — the four-slot document header, PROMOTED OUT OF Bananaworld-DC.
//
// 🔴 WHAT THIS FILE IS FOR, AND WHAT IT DELIBERATELY CANNOT DO. Thirteen live DC render sites across
//    twelve forms lean on this component, on a flag the owner made permanent on 2026-08-12. The move
//    must be BYTE-IDENTICAL in what a user sees. DC's own suites are the real regression gate and they
//    CANNOT BE RUN FROM HERE — this is a sandboxed design-system worktree with no DC checkout, no DC
//    dependencies and no DC runner. Any claim in this repo that "DC's forms were proved" would be a
//    fabrication. So the specs below MIRROR DC's `tests/unit/components/DocumentHeader.test.tsx`,
//    rewritten to build `origin` as a literal instead of mocking DC's `AuthProvider` /
//    `useDocumentOrigin`, which do not exist here. DC re-runs the real ones when it bumps its pin.
//
// ⚠ THE ORDER IS READ OFF THE DOM, NOT OFF THE PROPS. `querySelectorAll("dt, label")` is document
//   order, which is what a person reading left-to-right actually gets.

/** A document somebody ELSE raised, in its own depot — the case CR-DC-039 existed for. */
const SOMEBODY_ELSES: DocumentOrigin = {
  kind: "existing",
  dcName: "Nelspruit",
  raisedBy: "T. Mahlangu",
};

/**
 * 🔴 THE VIEWER, AND THE REASON THIS CONSTANT EXISTS AT ALL. In DC's suite a signed-in person is
 *    mocked so the specs can prove the session is NOT reached. There is no session to mock here — this
 *    package may not read one — so the name is used the other way round: it is passed NOWHERE, and the
 *    specs assert it appears nowhere. A header that invented it would be reaching for something.
 */
const VIEWER_NAME = "C. Gouws";

afterEach(cleanup);

function slotLabels(): (string | null)[] {
  return [...document.querySelectorAll("dt, label")].map((el) => el.textContent);
}

/** What one slot actually renders, located by its own label rather than by position. */
function slotValue(label: string): string | null {
  const dt = [...document.querySelectorAll("dt")].find((el) => el.textContent === label);
  if (!dt) throw new Error(`no slot labelled "${label}" was rendered`);
  return dt.nextElementSibling?.textContent ?? null;
}

const EDITABLE_NUMBER = {
  kind: "editable",
  value: "SO-01247",
  preview: "SO-01247",
  changed: false,
  hint: "Next number. Taken when you post.",
  documentNoun: "order",
  error: null,
  onChange: () => undefined,
  onUndo: () => undefined,
} as const;

// ---------------------------------------------------------------------------
// The chrome every desk form carries
// ---------------------------------------------------------------------------
describe("<DocumentHeader> — the four slots and their order", () => {
  it("renders the four slots in the standard order: date top left, number top right", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS]);
    // Said twice on purpose: the ORDER is the owner's ruling, and the two halves are separately settled.
    expect(slotLabels()[0]).toBe("Date");
    expect(slotLabels()[3]).toBe("Document no.");
  });

  it("keeps the date FIRST even when the form gives the slot its own name", () => {
    // SalesOrderForm renders "Order date" and the delivery run "Run date". Renaming the slot must not
    // move it — "date top left" is a POSITION, which is the whole point of owner ruling Q12.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateLabel="Order date"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual(["Order date", "DC", "Raised by", "Document no."]);
  });

  // 🔴 THE NON-REGRESSION SEAM. Three forms already own an EDITABLE business date; conforming must
  //    never turn a working input into a label.
  it("renders the form's OWN date control when one is given, in the top-left slot", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateLabel="Order date"
        dateControl={<input type="date" aria-label="Order date" defaultValue="2026-08-06" />}
        documentNumber={{ kind: "absent" }}
      />,
    );
    const input = screen.getByLabelText("Order date");
    expect(input.getAttribute("type")).toBe("date");
    expect(slotLabels()[0]).toBe("Order date");
  });

  it("prefers the form's OWN control over the shared date slot when it is handed both", () => {
    // 🔴 THE PRECEDENCE IS THE NON-REGRESSION RULE EXPRESSED AS CODE: own control > shared slot >
    //    plain value. A form that already had a working box keeps exactly the box it had.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateLabel="Order date"
        dateControl={<input type="date" aria-label="Order date" defaultValue="2026-08-06" />}
        documentDate={{
          kind: "editable",
          value: "2026-08-07",
          today: "2026-08-08",
          error: null,
          onChange: () => undefined,
          onUndo: () => undefined,
        }}
        documentNumber={{ kind: "absent" }}
      />,
    );
    // Exactly ONE date control is rendered, and it is the form's own — a bare <input>, not the
    // package's `Input` (which would carry its `block w-full` styling) wrapped in the shared slot.
    const controls = [...document.querySelectorAll("input")];
    expect(controls.length).toBe(1);
    expect((controls[0] as HTMLInputElement).defaultValue).toBe("2026-08-06");
    expect(controls[0]?.className).toBe("");
    // And the shared slot's day line is absent, because the shared slot did not win.
    expect(screen.queryByText(/1 day back/)).toBeNull();
    expect(screen.queryByText("Friday 7 August")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 🔴 THE MIDDLE TWO SLOTS DESCRIBE THE **DOCUMENT**, NEVER A SESSION (CR-DC-039)
// ---------------------------------------------------------------------------
//
// This is the property that made the component eligible to move at all. A component that read DC's
// session could not be worn by the CRM, and the package's own rule is pure presentation only
// (TECH-CON-004 / TECH-COMP-003) — the same line that keeps `PermissionGate` and the sync indicators
// in each app.
describe("<DocumentHeader> — whose facts the middle two slots show", () => {
  it("an EXISTING document raised by another person names THEM, and never the viewer", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "auto", code: "SO-01192" }}
      />,
    );
    expect(slotValue("Raised by")).toBe("T. Mahlangu");
    expect(slotValue("DC")).toBe("Nelspruit");
    expect(screen.queryByText(VIEWER_NAME)).toBeNull();
  });

  it("a NEW form names the person raising it and their depot — the half that must not change", () => {
    render(
      <DocumentHeader
        origin={{ kind: "new", dcName: "Nelspruit", raisedBy: VIEWER_NAME }}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotValue("Raised by")).toBe(VIEWER_NAME);
    expect(slotValue("DC")).toBe("Nelspruit");
  });

  // LAYOUT A, the owner's pick at CR-DC-039: the dash the strip already uses, and not one extra word.
  it("an EXISTING document with nobody recorded shows the empty state — not a name, not a guess", () => {
    render(
      <DocumentHeader
        origin={{ kind: "existing", dcName: null, raisedBy: null }}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "auto", code: "SO-01192" }}
      />,
    );
    expect(slotValue("Raised by")).toBe("—");
    expect(slotValue("DC")).toBe("—");
    expect(screen.queryByText(VIEWER_NAME)).toBeNull();
    // 🔴 AND NO WORDING WAS ADDED. Option B's "No person recorded" and option C's "someone" were the
    //    two the owner did NOT pick; asserting their absence is what keeps the pick from drifting.
    expect(screen.queryByText("No person recorded")).toBeNull();
    expect(screen.queryByText("someone")).toBeNull();
  });

  it("dashes the empty slot rather than dimming a real value — the two states differ in the DOM", () => {
    render(
      <DocumentHeader
        origin={{ kind: "existing", dcName: "Tzaneen", raisedBy: null }}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    const filled = [...document.querySelectorAll("dt")].find((el) => el.textContent === "DC")
      ?.nextElementSibling;
    const empty = [...document.querySelectorAll("dt")].find((el) => el.textContent === "Raised by")
      ?.nextElementSibling;
    expect(filled?.className).toContain("font-medium");
    expect(filled?.className).not.toContain("border-dashed");
    expect(empty?.className).toContain("border-dashed");
  });
});

// ---------------------------------------------------------------------------
// 🔴 CR-DESIGN-SYSTEM-005 — THE DEPOT SLOT'S LABEL IS THE WEARING APP'S WORD
// ---------------------------------------------------------------------------
//
// `DocumentOrigin` already made the slot's VALUE app-neutral: both arms carry a plain `string | null`
// NAME, no `warehouse_id`, no tenancy identifier — "the component is never told what the depot IS, only
// what it is CALLED". The word PRINTED over it was the one thing still hard-coded to "DC", and that is
// why CR-CRM-015 could not build: the CRM has no depot on a document.
//
// The fix is the `dateLabel` precedent, applied unchanged: one optional prop, defaulted at the point of
// use. 🔴 THE FIRST SPEC BELOW IS THE ADDITIVE CLAIM ITSELF — with the prop absent, every existing
// caller renders the same four words in the same order it renders today.
describe("<DocumentHeader> — the depot slot's label (CR-DESIGN-SYSTEM-005)", () => {
  // T-1
  it("prints 'DC' when no label is given — every existing caller is byte-identical", () => {
    // 🔴 THE ADDITIVE PROOF, AS A SPEC. Bananaworld-DC's thirteen live render sites across twelve forms
    //    pass no `dcLabel`; `props.dcLabel` is `undefined`; `?? "DC"` yields the identical string and
    //    `HeaderSlot` receives the identical props. This is the assertion that would go red the day
    //    somebody changed the default — which the lane rule forbids outright.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS]);
    expect(slotValue("DC")).toBe("Nelspruit");
  });

  // T-2
  it("prints the app's own word when one is given, and leaves the other three alone", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dcLabel="Branch"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual(["Date", "Branch", "Raised by", "Document no."]);
    expect(slotValue("Branch")).toBe("Nelspruit");
    // The word changed; the slot's CONTENT still comes from the document, exactly as before.
    expect(screen.queryByText(VIEWER_NAME)).toBeNull();
  });

  // T-3 — the same property `dateLabel` already has a spec for, at the top of this file.
  it("keeps the slot SECOND even when the app gives it its own name", () => {
    // Naming a slot must not move it. "Date top left" is owner ruling Q12 and "document number top
    // right" is the instruction of 2026-08-08; both are POSITIONS, and a label is not a position.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dcLabel="Branch"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()[0]).toBe("Date");
    expect(slotLabels()[1]).toBe("Branch");
    expect(slotLabels()[3]).toBe("Document no.");
  });

  // T-4
  it("shows the unchanged empty state under the DEFAULT label when the name is null", () => {
    render(
      <DocumentHeader
        origin={{ kind: "existing", dcName: null, raisedBy: "T. Mahlangu" }}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotValue("DC")).toBe("—");
    const empty = [...document.querySelectorAll("dt")].find((el) => el.textContent === "DC")
      ?.nextElementSibling;
    expect(empty?.className).toContain("border-dashed");
  });

  // T-5 — 🔴 THIS IS THE OMISSION ANSWER, ASSERTED.
  it("shows the SAME empty state under an OVERRIDDEN label — the answer for an app with nothing", () => {
    // 🔴 LAYOUT A. An app whose equivalent concept does not exist on a document passes `dcName: null`
    //    and gets the dash the strip already uses for anything not filled in. It does not get a hole,
    //    and it does not get a new wording: option B's dropped slot and option C's explanatory line
    //    were the two the owner did NOT pick, and asserting their absence is what keeps the pick from
    //    drifting into whatever the next app assumes.
    render(
      <DocumentHeader
        origin={{ kind: "existing", dcName: null, raisedBy: "T. Mahlangu" }}
        dcLabel="Branch"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotValue("Branch")).toBe("—");
    const empty = [...document.querySelectorAll("dt")].find((el) => el.textContent === "Branch")
      ?.nextElementSibling;
    expect(empty?.className).toContain("border-dashed");
    expect(empty?.className).toContain("text-fg-subtle");
    expect(screen.queryByText("Not applicable")).toBeNull();
  });

  // T-6 — 🔴 THE OMISSION DECISION, PINNED. It fails the day somebody adds a hole.
  it("renders FOUR slots always — labelled or not, filled or empty", () => {
    // 🔴 OMISSION IS NOT OFFERED, AND THIS IS THE SPEC THAT SAYS SO OUT LOUD. Dropping the slot would
    //    leave three children in a `lg:grid-cols-4` strip, putting Document no. in column 3 on a wide
    //    screen and bottom-LEFT on a narrow one (`sm:grid-cols-2` wraps) — against the owner
    //    instruction of 2026-08-08. Making omission honest would mean restyling the header, which this
    //    change was explicitly forbidden to do. A CRM with nothing for the slot uses T-5's empty state.
    const cases: readonly { readonly dcLabel?: string; readonly dcName: string | null }[] = [
      { dcName: "Nelspruit" },
      { dcName: null },
      { dcLabel: "Branch", dcName: "Nelspruit" },
      { dcLabel: "Branch", dcName: null },
    ];
    for (const c of cases) {
      render(
        <DocumentHeader
          origin={{ kind: "existing", dcName: c.dcName, raisedBy: null }}
          dcLabel={c.dcLabel}
          dateValue="06 Aug 2026"
          documentNumber={{ kind: "absent" }}
        />,
      );
      expect(slotLabels().length).toBe(4);
      expect(document.querySelectorAll("dl > div").length).toBe(4);
      cleanup();
    }
  });

  // T-7
  it("is independent of `dateLabel` — both words land, both slots stay put", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateLabel="Order date"
        dcLabel="Branch"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual(["Order date", "Branch", "Raised by", "Document no."]);
  });

  // T-8
  it("cannot impersonate another slot: `dcLabel=\"Date\"` does not make it the date slot", () => {
    // A label is a word, not an identity. `DOCUMENT_HEADER_SLOTS` decides which slot is which, and the
    // render keys off the ARRAY entry — never off the printed text.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dcLabel="Date"
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    const labels = slotLabels();
    expect(labels).toEqual(["Date", "Date", "Raised by", "Document no."]);
    // The FIRST is the real date slot and the SECOND is the depot slot, by position and by content.
    const dts = [...document.querySelectorAll("dt")];
    expect(dts[0]?.nextElementSibling?.textContent).toBe("06 Aug 2026");
    expect(dts[1]?.nextElementSibling?.textContent).toBe("Nelspruit");
  });

  // T-9 — `??`, not `||`. The two label props must not drift apart.
  it("treats an empty string exactly as `dateLabel` does — `??`, never `||`", () => {
    // 🔴 THE PRECEDENT IS THE POINT. `dateLabel=""` renders an empty label today; if `dcLabel` used
    //    `||` it would silently fall back to "DC" instead, and the two props would behave differently
    //    for the same input. Special-casing one of them would be a divergence from the precedent this
    //    change was told to follow. Neither is a case any caller has; it is pinned so it stays true.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateLabel=""
        dcLabel=""
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotLabels()).toEqual(["", "", "Raised by", "Document no."]);
  });
});

// ---------------------------------------------------------------------------
// The Document no. slot — the five visible states of the approved option-c mockup
// ---------------------------------------------------------------------------
//
// ⚠ FIVE VISIBLE STATES ACROSS THREE ARMS, and both counts are right: `absent` · `auto` ·
//   `editable`-calm · `editable`-warn · `editable`-error. The last three are the `mood` split inside
//   the one arm. Each of the five is asserted below, which is what stops somebody "reconciling" the
//   two numbers by collapsing or splitting the type.
describe("the Document no. slot — five visible states", () => {
  it("1. ABSENT — says 'Not numbered yet' rather than inventing a number, and offers no input", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotValue("Document no.")).toBe("—");
    expect(screen.getByText("Not numbered yet")).toBeTruthy();
    expect(document.querySelector("input")).toBeNull();
  });

  // 🔴 A VALUE, NOT A DISABLED INPUT. They still SEE the number — they need it to find the document
  //    again — but there is nothing to type into and nothing in the tab order.
  it("2. AUTO — shows the number read-only with 'Given automatically', and offers no input", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "auto", code: "SO-01247" }}
      />,
    );
    expect(screen.getByText("SO-01247")).toBeTruthy();
    expect(screen.getByText("Given automatically")).toBeTruthy();
    expect(screen.queryByLabelText("Document no.")).toBeNull();
    expect(document.querySelector("input")).toBeNull();
  });

  it("3. EDITABLE, calm — pre-fills the preview and says when the number will be taken", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={EDITABLE_NUMBER}
      />,
    );
    const input = screen.getByLabelText("Document no.") as HTMLInputElement;
    expect(input.value).toBe("SO-01247");
    expect(screen.getByText("Next number. Taken when you post.")).toBeTruthy();
    expect(screen.queryByText("Changed")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe(null);
  });

  // 🔴 THE WHOLE DIFFERENCE BETWEEN OPTION C AND OPTION A, and the reason C was chosen: the one thing
  //    people get wrong about manual numbering is said in the place it happens.
  it("4. EDITABLE, warn — marks it Changed, states the consequence, and offers Undo", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ ...EDITABLE_NUMBER, value: "SO-00988", changed: true }}
      />,
    );
    expect(screen.getByText("Changed")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(
      screen.getByText(/Automatic numbering will not move\. The next order still takes SO-01247\./),
    ).toBeTruthy();
  });

  it("4b. EDITABLE, warn — Undo calls back, so the offered number goes back in one click", async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ ...EDITABLE_NUMBER, value: "SO-00988", changed: true, onUndo }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("5. EDITABLE, error — shows the server's sentence AND where numbering is set", () => {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{
          ...EDITABLE_NUMBER,
          value: "SO-00988",
          changed: true,
          error: "This number has already been used.",
        }}
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("This number has already been used.");
    // ⚠ The second line is a UI addition BESIDE the server's message, not a change to it.
    expect(alert.textContent).toContain(DOCUMENT_NUMBER_WHERE_TO_SET);
    expect(DOCUMENT_NUMBER_WHERE_TO_SET).toBe("Numbering is set under Masters → Document Numbers.");
    expect(screen.getByLabelText("Document no.").getAttribute("aria-invalid")).toBe("true");
  });

  it("renders the PDF control inside the number slot in ALL THREE of the slot's kinds", () => {
    // 🔴 SAME SLOT, SAME CORNER, whatever the number's state — a document must not move its own button
    //    depending on whether its number happens to be editable.
    for (const state of [
      { kind: "absent" } as const,
      { kind: "auto", code: "SO-01247" } as const,
      EDITABLE_NUMBER,
    ]) {
      render(
        <DocumentHeader
          origin={SOMEBODY_ELSES}
          dateValue="06 Aug 2026"
          documentNumber={state}
          documentPdf={<span>Delivery note</span>}
        />,
      );
      expect(screen.getByText("Delivery note")).toBeTruthy();
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------
// The DATE slot — option C: quiet until it moves, then it says the day out loud
// ---------------------------------------------------------------------------
describe("the shared date slot", () => {
  const TODAY = "2026-08-08"; // a Saturday

  function renderDate(value: string, error: string | null = null) {
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        documentDate={{
          kind: "editable",
          value,
          today: TODAY,
          error,
          onChange: () => undefined,
          onUndo: () => undefined,
        }}
        documentNumber={{ kind: "absent" }}
      />,
    );
  }

  it("renders the shared slot when the form hands one in and owns no control of its own", () => {
    renderDate(TODAY);
    const input = screen.getByLabelText("Date") as HTMLInputElement;
    expect(input.getAttribute("type")).toBe("date");
    expect(input.value).toBe(TODAY);
  });

  it("TODAY — a plain box and the one word, with no colour and no Undo", () => {
    renderDate(TODAY);
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
    expect(screen.getByLabelText("Date").className).not.toContain("border-warning");
  });

  it("INFORMED — names the day and the distance, offers Undo, and stays uncoloured", () => {
    renderDate("2026-08-07");
    // The mockup's own example, character for character.
    expect(screen.getByText("Friday 7 August")).toBeTruthy();
    expect(screen.getByText("· 1 day back")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    // 🔴 ORDINARY BACK-DATING GETS NO COLOUR AT ALL. That is the difference between option C and
    //    option B, and the reason C was chosen.
    expect(screen.getByLabelText("Date").className).not.toContain("border-warning");
  });

  it("QUESTIONED — bolds the day, asks 'Is that right?', and turns the border amber", () => {
    renderDate("2025-08-07");
    // 🔴 THE TYPO OPTION C EXISTS TO CATCH: meaning 2026 and typing 2025. The year is printed only
    //    when it is not the current one, which is what makes one character unmissable.
    expect(screen.getByText(/Thursday 7 August 2025 · 366 days back\./)).toBeTruthy();
    expect(screen.getByText(/Is that right\?/)).toBeTruthy();
    expect(screen.getByLabelText("Date").className).toContain("border-warning");
  });

  it("QUESTIONED — any future day, however near", () => {
    renderDate("2026-08-09");
    expect(screen.getByText(/1 day ahead/)).toBeTruthy();
    expect(screen.getByLabelText("Date").className).toContain("border-warning");
  });

  it("an ERROR outranks the day's mood: the refusal is shown and the day line is not", () => {
    renderDate("2026-08-07", "That date is not allowed.");
    expect(screen.getByRole("alert").textContent).toBe("That date is not allowed.");
    expect(screen.queryByText("Friday 7 August")).toBeNull();
    expect(screen.getByLabelText("Date").className).toContain("border-danger");
    expect(screen.getByLabelText("Date").getAttribute("aria-invalid")).toBe("true");
  });

  it("VALUE — shown, not offered: no input at all, and a null renders as the em dash", () => {
    // 🔴 A VALUE, NOT A DISABLED INPUT. "You could change this, but not now" is the wrong statement,
    //    and a null is never guessed at from a created_at.
    render(
      <DocumentHeader
        origin={SOMEBODY_ELSES}
        documentDate={{ kind: "value", value: null, hint: "No date recorded" }}
        documentNumber={{ kind: "absent" }}
      />,
    );
    expect(slotValue("Date")).toBe("—");
    expect(screen.getByText("No date recorded")).toBeTruthy();
    expect(document.querySelector("input")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 🔴 THE PROMOTION'S OWN GUARDS — the three things the change request asked to be PROVED, not asserted
// ---------------------------------------------------------------------------
// ⚠ Resolved from the vitest root rather than from `import.meta.url`: under the `components` project's
//   happy-dom transform `import.meta.url` is not a `file:` URL, so `fileURLToPath` throws.
const COMPONENT_SOURCE = readFileSync(
  resolve(process.cwd(), "src/components/DocumentHeader.tsx"),
  "utf8",
);

/** Comments are stripped before scanning: a fence that NAMES a banned import must not trip its guard. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("the package builds standalone — no app import is reachable from this component", () => {
  it("contains no `@/…` path and no reference to bananaworld-dc", () => {
    // 🔴 THE FAILURE THIS EXISTS TO MAKE IMPOSSIBLE. Five repos pin this package by git sha; an app
    //    path inside it breaks every one of them at transpile time. `tsc --noEmit` is the first guard
    //    (no `@/` alias is configured here, so such an import cannot resolve); this is the second, and
    //    it is the one that bites the day somebody re-plumbs an app import in "just for now".
    const code = stripComments(COMPONENT_SOURCE);
    expect(code).not.toContain("@/");
    expect(code).not.toContain("bananaworld-dc");
    // Nor may it reach back through its own barrel — that would be a cycle.
    expect(code).not.toContain('from "./index"');
  });

  it("reads NO session — the middle two slots come from the origin prop", () => {
    // Mirrors DC's `transaction-form-standard.test.ts:883`, which asserted exactly this before the
    // move. A component that read a session was never eligible to be here at all.
    //
    // 🔴 CR-DESIGN-SYSTEM-005 — THIS IS THE ONE EXISTING ASSERTION THAT CHANGE EDITED, AND IT WAS
    //    NARROWED, NEVER RELAXED. It used to scan for the concatenated `label="DC"
    //    value={props.origin.dcName}`; the depot slot's label became overridable, so the label half of
    //    that substring moved. The VALUE half is what this spec is actually about — its title is "reads
    //    NO session", and the session guard is the claim that the slot's CONTENT comes from `origin`
    //    and not from a `useAuth()`. That half is kept verbatim. The new default is then pinned
    //    separately, so the property is strictly BETTER covered afterwards: the value still comes from
    //    the document, and the word over it still falls back to "DC".
    //
    // ⚠ BANANAWORLD-DC MAY HOLD THE SAME MIRROR AND IT WAS NOT READ. Consumer repos are not readable
    //   from this worktree and none was opened. If DC's mirror pins the full concatenated string, DC
    //   makes this identical one-line narrowing when it bumps its pin — a line it already has to visit
    //   (`runs/change-02/evidence/developer-handover.md` §3). Nothing here is red today: DC pins an
    //   older sha, so nothing in this file reaches DC until DC chooses to move.
    const code = stripComments(COMPONENT_SOURCE);
    expect(code).not.toContain("useAuth");
    expect(code).toContain("value={props.origin.dcName}");
    expect(code).toContain('label={props.dcLabel ?? "DC"}');
    expect(code).toContain('label="Raised by" value={props.origin.raisedBy}');
  });

  it("declares the canonical order ONCE and RENDERS BY MAPPING IT", () => {
    // Mirrors DC's contract test at lines 690–704. Neither half alone would be enough: the constant
    // could drift from the markup, and the DOM spec at the top of this file could not say what the
    // standard IS. 🔴 The scan is on comment-stripped source, because a claim satisfied by a comment
    // is the recorded trap that let a half-applied migration redden nothing.
    //
    // 🔴 CR-DESIGN-SYSTEM-005 — THIS IS THE CROSS-REPO NEGATIVE, AND HERE IS WHO IT IS FOR BY NAME.
    //    Bananaworld-DC's `tests/contract/transaction-form-standard.test.ts` asserts against THIS
    //    FILE'S OWN SOURCE, not its behaviour: it builds the same `quoted` string and asserts the
    //    declaration below character for character, and it asserts `const slots =
    //    DOCUMENT_HEADER_SLOTS;`. DC pins an older sha, so a change here cannot turn DC red TODAY — it
    //    hands DC a delayed-action failure that fires at DC's next pin bump, weeks later, with nobody
    //    left to connect it back to this lane. That is exactly the shape of defect this spec exists to
    //    make impossible from inside this repo. 🔴 IF YOU NEED THIS ASSERTION TO CHANGE, THAT IS A
    //    CROSS-REPO DECISION FOR THE OWNER AND A LINE IN DC'S LANE — NOT AN EDIT HERE.
    const quoted = ["Date", "DC", "Raised by", "Document no."].map((s) => `"${s}"`).join(", ");
    expect(COMPONENT_SOURCE).toContain(
      `export const DOCUMENT_HEADER_SLOTS = [${quoted}] as const;`,
    );
    const code = stripComments(COMPONENT_SOURCE);
    expect(code).toContain("const slots = DOCUMENT_HEADER_SLOTS;");
    expect(code).toContain("slots.map(");
  });

  // 🔴 CR-DESIGN-SYSTEM-005 — "THE LABEL BECAME OVERRIDABLE" MUST NEVER BECOME "THE ARRAY BECAME
  //    EDITABLE". `dcLabel` is presentation sitting beside the array; the array is identity and order.
  //    A future change that "tidied" the two together — by templating the slot names, or by deriving
  //    them from props — would satisfy every DOM spec in this file and still break DC's source scan.
  it("keeps ORDER in exactly one place — `dcLabel` never becomes a second slot list", () => {
    const code = stripComments(COMPONENT_SOURCE);

    // Exactly ONE array literal of slot names exists in the source, and it is the exported constant.
    const slotArrayLiterals = code.match(/\[\s*"Date"\s*,/g) ?? [];
    expect(slotArrayLiterals.length).toBe(1);

    // Four entries, "DC" second, still literal strings — not interpolated, not prop-derived.
    expect([...DOCUMENT_HEADER_SLOTS].length).toBe(4);
    expect(DOCUMENT_HEADER_SLOTS[1]).toBe("DC");
    expect(code).not.toContain("DOCUMENT_HEADER_SLOTS = [`");
    expect(code).not.toContain("dcLabel]");

    // And the render still walks the constant rather than a locally rebuilt list.
    expect(code).not.toContain("slots = [");
  });
});

describe("the barrel re-export — the line between 'no import changed' and fourteen broken forms", () => {
  it("exports the header from the PACKAGE ROOT, and the root export renders", async () => {
    // 🔴 IMPORTED FROM `../../src`, NOT FROM THE COMPONENT FILE, AND THAT IS THE WHOLE POINT. DC keeps
    //    importing from its own `@/components/ui`, whose barrel re-exports this package — so if the
    //    root barrel does not carry the header, not one of DC's import lines fails loudly; they all
    //    fail at once, at bump time. A spec that imported the file directly would prove nothing here.
    const pkg = await import("../../src");
    expect(typeof pkg.DocumentHeader).toBe("function");
    expect([...pkg.DOCUMENT_HEADER_SLOTS]).toEqual(["Date", "DC", "Raised by", "Document no."]);
    expect(pkg.DOCUMENT_NUMBER_WHERE_TO_SET).toBe(DOCUMENT_NUMBER_WHERE_TO_SET);

    const Root = pkg.DocumentHeader;
    render(
      <Root
        origin={SOMEBODY_ELSES}
        dateValue="06 Aug 2026"
        documentNumber={{ kind: "auto", code: "SO-01247" }}
      />,
    );
    expect(slotLabels()).toEqual([...DOCUMENT_HEADER_SLOTS]);
    expect(screen.getByText("SO-01247")).toBeTruthy();
  });

  // 🔴 CR-DESIGN-SYSTEM-005 — THE EXPORT SURFACE DID NOT MOVE. Four apps pin this package by git sha
  //    and each bumps when IT chooses, so the lane rule is additive-only: a new optional FIELD on an
  //    existing interface is invisible to every caller that does not pass it, but a new, moved or
  //    renamed EXPORT is a coordinated migration. This change added a prop, not a symbol.
  it("re-exports the same eight header symbols, and not one more", () => {
    const barrel = readFileSync(resolve(process.cwd(), "src/components/index.ts"), "utf8");
    const block = /export \{([^}]*)\} from "\.\/DocumentHeader";/.exec(barrel);
    expect(block).not.toBeNull();
    const exported = (block?.[1] ?? "")
      .split(",")
      .map((name) => name.trim().replace(/^type\s+/, ""))
      .filter((name) => name.length > 0);
    expect(exported.sort()).toEqual(
      [
        "DOCUMENT_HEADER_SLOTS",
        "DOCUMENT_NUMBER_WHERE_TO_SET",
        "DocumentDateSlotState",
        "DocumentHeader",
        "DocumentHeaderProps",
        "DocumentHeaderSlot",
        "DocumentNumberSlotState",
        "DocumentOrigin",
      ].sort(),
    );
  });

  it("exports the day-line describer from the package root too", async () => {
    // DC's `use-document-date.ts` and its specs import `describeDocumentDate` and
    // `DOCUMENT_DATE_WARN_DAYS` by deep path into DC's own tree today. After DC adopts, that path is
    // gone and its follow-up needs somewhere to point.
    const pkg = await import("../../src");
    expect(typeof pkg.describeDocumentDate).toBe("function");
    expect(pkg.DOCUMENT_DATE_WARN_DAYS).toBe(60);
  });
});
