// CR-DESIGN-SYSTEM-022 — browser proof page: the REAL kit Link (inside a NavigationBusyProvider) and
// ActionTile in five link shapes. `next/link` is aliased to the test stand-in (vite.config in proof.mjs)
// because there is no Next router here; everything else is the real component. window.__setPending
// drives a link's waiting state.
import { createRoot } from "react-dom/client";
import { Package } from "lucide-react";

import { ActionTile, Link, NavigationBusyProvider } from "../../../../src";
import { setPending } from "../../../../tests/components/fixtures/next-link-mock";

(window as unknown as { __setPending: typeof setPending }).__setPending = setPending;

const Box = () => <span data-box="" className="inline-block h-4 w-4 rounded-sm bg-fg-subtle" />;

function Shape({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-6 w-[22rem] rounded-md border border-border p-3">
      {children}
      <p data-next className="mt-2 text-sm text-fg-muted">
        next sibling
      </p>
    </section>
  );
}

function App() {
  return (
    <NavigationBusyProvider>
      <main data-surface="tablet" className="bg-bg p-4 text-fg">
        <Shape id="s1">
          <p className="text-sm">
            Open the <Link href="/s1">order sheet</Link> to continue, then come back.
          </p>
        </Shape>
        <Shape id="s2">
          <Link href="/s2" className="flex items-center gap-2 rounded-md border p-2">
            <Box />
            <span>Orders</span>
          </Link>
        </Shape>
        <Shape id="s3">
          <Link href="/s3" className="flex justify-between rounded-md border p-2">
            <span>Orders</span>
            <span className="rounded bg-accent-subtle px-1 text-sm">12</span>
          </Link>
        </Shape>
        <Shape id="s4">
          <Link href="/s4" className="block rounded-md border p-2">
            <div>First line</div>
            <div className="text-sm text-fg-muted">Second line</div>
          </Link>
        </Shape>
        <Shape id="s5">
          <div className="grid w-40 grid-cols-1">
            <ActionTile href="/s5" icon={Package} label="Crates in" count={3} />
          </div>
        </Shape>
      </main>
    </NavigationBusyProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
