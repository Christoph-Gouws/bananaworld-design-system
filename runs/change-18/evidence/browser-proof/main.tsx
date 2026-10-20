// CR-DESIGN-SYSTEM-020 — browser proof page: the REAL ExportButton from src/, nothing stubbed.
import { createRoot } from "react-dom/client";

import { ExportButton, ToastProvider } from "../../../../src";

function App() {
  return (
    <ToastProvider>
      <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div id="row-link" style={{ display: "flex", gap: 12 }}>
          <ExportButton format="excel" reportType="r" href="/sample.xlsx" fileName="report.xlsx" />
          <ExportButton format="pdf" reportType="r" href="/sample.xlsx" children="Exportar PDF" />
        </div>
        <div id="row-disabled" style={{ display: "flex", gap: 12 }}>
          <ExportButton format="excel" reportType="r" href="/sample.xlsx" disabled children="Exportar Excel" />
        </div>
        <div id="row-toast" style={{ display: "flex", gap: 12 }}>
          <ExportButton format="csv" reportType="crate-balance" />
        </div>
        <div data-surface="tablet" id="row-tablet" style={{ display: "flex", gap: 12 }}>
          <ExportButton format="excel" reportType="r" href="/sample.xlsx" fileName="tablet.xlsx" />
        </div>
      </main>
    </ToastProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
