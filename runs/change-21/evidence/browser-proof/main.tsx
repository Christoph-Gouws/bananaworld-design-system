// CR-DESIGN-SYSTEM-023 — browser proof page: the REAL LinkedRecords and DocumentHeader from src/, nothing stubbed.
// The app's link is a plain function component (no forwardRef, no prop spread), the DC `DrillLink` shape.
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { DocumentHeader, LinkedRecords, TooltipProvider } from "../../../../src";
import type { LinkedRecordsGroup } from "../../../../src";

function AppLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-medium text-info underline-offset-2 hover:underline">
      {children}
    </a>
  );
}

const summary = (type: string, number: string, status: string) => ({
  type,
  number,
  status,
  rows: [
    { label: "Date", value: "7 Oct 2026" },
    { label: "Customer", value: "Acme Fresh Produce" },
    { label: "Total", value: "R 12 480.00" },
  ],
});

const GROUPS: LinkedRecordsGroup[] = [
  {
    key: "dsp",
    label: "Dispatches",
    items: [
      { key: "1", link: <AppLink href="#dsp-131">DSP-00131</AppLink>, text: "DSP-00131", date: "7 Oct", summary: summary("Dispatch", "DSP-00131", "Posted") },
      { key: "2", link: <AppLink href="#dsp-134">DSP-00134</AppLink>, text: "DSP-00134", date: "9 Oct", summary: summary("Dispatch", "DSP-00134", "Draft") },
    ],
  },
  {
    key: "run",
    label: "Delivery run",
    items: [
      { key: "3", link: <AppLink href="#run-14">RUN-2610-014</AppLink>, text: "RUN-2610-014", date: "7 Oct", summary: summary("Delivery run", "RUN-2610-014", "Completed") },
    ],
  },
  {
    key: "cc",
    label: "Corrections",
    items: [{ key: "4", link: null, text: "CC-00007", refusedLabel: "You can't open crate corrections" }],
    more: <span className="text-fg-muted">+3 more</span>,
  },
];

const origin = { kind: "existing", dcName: "Nelspruit", raisedBy: "T. Mahlangu" } as const;

function Line({ id, state, groups }: { id: string; state?: "ready" | "loading" | "error"; groups?: LinkedRecordsGroup[] }) {
  return (
    <div id={id}>
      <LinkedRecords
        label="Linked"
        emptyText="Nothing linked to this document yet"
        groups={groups ?? GROUPS}
        state={state}
        onRetry={() => {}}
      />
    </div>
  );
}

function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <main className="space-y-6 bg-bg p-4 text-fg" style={{ maxWidth: 1000 }}>
        <section id="with-linked">
          <h2 className="mb-2 text-sm font-semibold text-fg-muted">Header with the linked line</h2>
          <DocumentHeader
            origin={origin}
            dateValue="07 Oct 2026"
            documentNumber={{ kind: "auto", code: "SO-01247" }}
            linked={<Line id="line-header" />}
          />
        </section>
        <section id="without-linked">
          <h2 className="mb-2 text-sm font-semibold text-fg-muted">Header without it</h2>
          <DocumentHeader origin={origin} dateValue="07 Oct 2026" documentNumber={{ kind: "auto", code: "SO-01247" }} />
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold text-fg-muted">States</h2>
          <div className="space-y-3">
            <Line id="line-empty" groups={[]} />
            <Line id="line-loading" state="loading" />
            <Line id="line-error" state="error" />
          </div>
        </section>
      </main>
    </TooltipProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
