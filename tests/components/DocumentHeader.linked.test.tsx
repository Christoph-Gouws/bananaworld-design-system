import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import type { ReactElement } from "react";

import {
  DocumentHeader,
  DOCUMENT_HEADER_SLOTS,
  type DocumentOrigin,
} from "../../src/components/DocumentHeader";
import { DocumentHeader as FrozenHeader } from "./fixtures/DocumentHeader.frozen-bb6c22e";

// CR-DESIGN-SYSTEM-023 — `linked` is one optional prop. Without it the header renders exactly as it did at
// bb6c22e (frozen copy beside the live one, the CR-018 precedent); with it the line sits beneath the
// list, outside the <dl>.

afterEach(cleanup);

const ORIGIN: DocumentOrigin = { kind: "existing", dcName: "Nelspruit", raisedBy: "T. Mahlangu" };
const NOOP = () => undefined;
const EDITABLE = {
  kind: "editable",
  value: "SO-01247",
  preview: "SO-01247",
  hint: "Next number.",
  documentNoun: "order",
  onChange: NOOP,
  onUndo: NOOP,
} as const;

type Props = Parameters<typeof DocumentHeader>[0];

const NUMBERS: Props["documentNumber"][] = [
  { kind: "absent" },
  { kind: "auto", code: "SO-00001" },
  { kind: "auto", code: null },
  { ...EDITABLE, changed: false, error: null },
  { ...EDITABLE, changed: true, error: null },
  { ...EDITABLE, changed: false, error: "That number is taken." },
];
const DATES: Partial<Props>[] = [
  { dateValue: "06 Aug 2026" },
  { dateValue: null, dateHint: "No date recorded" },
  { dateControl: <input aria-label="own date" /> },
  { documentDate: { kind: "value", value: "06 Aug 2026" } },
  {
    documentDate: {
      kind: "editable",
      value: "2026-08-01",
      today: "2026-08-06",
      onChange: NOOP,
      onUndo: NOOP,
      error: null,
    },
  },
];
const EXTRAS: Partial<Props>[] = [
  {},
  { dcLabel: "Branch", dateLabel: "Run date" },
  { documentPdf: <button type="button">PDF</button> },
];
const LINKED_ABSENT: Partial<Props>[] = [{}, { linked: undefined }, { linked: null }];

/** React 19 `useId` values come from a global counter, so they differ between roots by construction. */
function normalised(html: string): string {
  const seen = new Map<string, string>();
  return html.replace(/\b(id|for|aria-describedby|aria-labelledby)="([^"]*)"/g, (_m, attr, v) => {
    if (!seen.has(v)) seen.set(v, `ID${seen.size}`);
    return `${attr}="${seen.get(v)}"`;
  });
}

function markup(node: ReactElement): string {
  const { container, unmount } = render(node);
  const html = normalised(container.innerHTML);
  unmount();
  return html;
}

describe("without `linked` the header is byte-identical to bb6c22e", () => {
  for (const [ni, documentNumber] of NUMBERS.entries()) {
    for (const [di, date] of DATES.entries()) {
      it(`number #${ni} × date #${di} × extras × linked absent/undefined/null`, () => {
        for (const extra of EXTRAS) {
          for (const linked of LINKED_ABSENT) {
            const props = { origin: ORIGIN, documentNumber, ...date, ...extra } as Props;
            expect(markup(<DocumentHeader {...props} {...linked} />)).toBe(
              markup(<FrozenHeader {...props} />),
            );
          }
        }
      });
    }
  }

  it("the <dl> is the root element and keeps its exact class string", () => {
    const { container } = render(
      <DocumentHeader origin={ORIGIN} documentNumber={{ kind: "absent" }} />,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DL");
    expect(root.className).toBe(
      "grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4",
    );
  });
});

describe("with `linked`", () => {
  function withLinked(node: ReactElement) {
    return render(
      <DocumentHeader origin={ORIGIN} documentNumber={{ kind: "absent" }} linked={node} />,
    );
  }

  it("the node follows the four slots inside the frame, OUTSIDE the <dl>", () => {
    const { container } = withLinked(<p data-testid="line">Linked</p>);
    const frame = container.firstElementChild!;
    expect(frame.tagName).toBe("DIV");
    expect(frame.className).toContain("rounded-lg border border-border p-4");
    const dl = frame.querySelector("dl")!;
    expect(dl.parentElement).toBe(frame);
    expect(dl.querySelector('[data-testid="line"]')).toBeNull();
    expect(dl.nextElementSibling!.contains(container.querySelector('[data-testid="line"]'))).toBe(
      true,
    );
  });

  it("the <dl> still has exactly four <dt>, in slot order, and four <div>s", () => {
    const { container } = withLinked(<p>Linked</p>);
    expect(container.querySelectorAll("dl > div")).toHaveLength(4);
    expect([...container.querySelectorAll("dt")].map((el) => el.textContent)).toEqual([
      ...DOCUMENT_HEADER_SLOTS,
    ]);
  });

  it("a node that renders nothing leaves the strip empty and hideable", () => {
    const { container } = withLinked(<></>);
    const strip = container.querySelector("dl")!.nextElementSibling!;
    expect(strip.childElementCount).toBe(0);
    expect(strip.textContent).toBe("");
    expect(strip.className).toContain("empty:hidden");
  });

  it("axe: 0 violations", async () => {
    const { container } = withLinked(<p>Linked</p>);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((v) => v.id)).toEqual([]);
  });
});
